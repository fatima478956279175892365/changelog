from datetime import UTC, datetime
from html import escape
from xml.etree.ElementTree import Element, SubElement, tostring

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import func, select

from app.core.config import get_settings
from app.db.session import get_session
from app.models.project import Project
from app.models.update import Update
from app.schemas.update import PublicChangelog, PublicUpdateRead

router = APIRouter(tags=["public"])
settings = get_settings()


async def _get_project_by_slug(session: AsyncSession, slug: str) -> Project:
    result = await session.execute(select(Project).where(Project.slug == slug))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("/public/{slug}", response_model=PublicChangelog)
async def get_public_changelog(
    slug: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    session: AsyncSession = Depends(get_session),
) -> PublicChangelog:
    project = await _get_project_by_slug(session, slug)

    count_result = await session.execute(
        select(func.count()).select_from(Update).where(Update.project_id == project.id)
    )
    total = count_result.scalar_one()
    offset = (page - 1) * page_size

    result = await session.execute(
        select(Update)
        .where(Update.project_id == project.id)
        .order_by(Update.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    updates = list(result.scalars().all())

    return PublicChangelog(
        project_id=project.id,
        project_name=project.name,
        project_slug=project.slug,
        items=[
            PublicUpdateRead(
                id=u.id,
                title=u.title,
                type=u.type,
                created_at=u.created_at,
                release_tag=u.release_tag,
                customer_view=u.customer_view,
            )
            for u in updates
        ],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/feed/{slug}.xml")
async def rss_feed(
    slug: str,
    session: AsyncSession = Depends(get_session),
) -> Response:
    project = await _get_project_by_slug(session, slug)

    result = await session.execute(
        select(Update)
        .where(Update.project_id == project.id)
        .order_by(Update.created_at.desc())
        .limit(50)
    )
    updates = list(result.scalars().all())

    channel_title = f"{project.name} Changelog"
    feed_url = f"{settings.frontend_url}/c/{project.slug}"
    rss = Element("rss", version="2.0")
    channel = SubElement(rss, "channel")
    SubElement(channel, "title").text = channel_title
    SubElement(channel, "link").text = feed_url
    SubElement(channel, "description").text = f"Product updates for {project.name}"
    SubElement(channel, "lastBuildDate").text = datetime.now(UTC).strftime(
        "%a, %d %b %Y %H:%M:%S +0000"
    )

    for update in updates:
        item = SubElement(channel, "item")
        SubElement(item, "title").text = update.title
        SubElement(item, "description").text = update.customer_view
        SubElement(item, "pubDate").text = update.created_at.strftime(
            "%a, %d %b %Y %H:%M:%S +0000"
        )
        SubElement(item, "guid").text = f"{feed_url}#update-{update.id}"
        SubElement(item, "category").text = update.type.value

    xml_bytes = tostring(rss, encoding="utf-8", xml_declaration=True)
    return Response(content=xml_bytes, media_type="application/rss+xml")


@router.get("/widget/{slug}.js", response_class=PlainTextResponse)
async def embed_widget(
    slug: str,
    session: AsyncSession = Depends(get_session),
) -> str:
    project = await _get_project_by_slug(session, slug)

    result = await session.execute(
        select(Update)
        .where(Update.project_id == project.id)
        .order_by(Update.created_at.desc())
        .limit(5)
    )
    updates = list(result.scalars().all())

    items_html = "".join(
        f'<li class="cos-item"><span class="cos-type">{escape(u.type.value)}</span>'
        f'<strong>{escape(u.title)}</strong>'
        f'<p>{escape(u.customer_view)}</p></li>'
        for u in updates
    )

    changelog_url = f"{settings.frontend_url}/c/{project.slug}"
    return f"""(function() {{
  var root = document.currentScript.parentElement;
  var box = document.createElement('div');
  box.className = 'changelog-os-widget';
  box.innerHTML = `
    <style>
      .changelog-os-widget {{ font-family: system-ui, sans-serif; max-width: 480px; }}
      .changelog-os-widget h3 {{ margin: 0 0 12px; font-size: 16px; }}
      .changelog-os-widget ul {{ list-style: none; padding: 0; margin: 0; }}
      .changelog-os-widget .cos-item {{ padding: 12px 0; border-bottom: 1px solid #eee; }}
      .changelog-os-widget .cos-type {{ font-size: 11px; text-transform: uppercase; color: #666; margin-right: 8px; }}
      .changelog-os-widget a {{ display: inline-block; margin-top: 12px; color: #0066ff; text-decoration: none; }}
    </style>
    <h3>{escape(project.name)} Updates</h3>
    <ul>{items_html or '<li>No updates yet</li>'}</ul>
    <a href="{changelog_url}" target="_blank" rel="noopener">View full changelog →</a>
  `;
  root.appendChild(box);
}})();"""
