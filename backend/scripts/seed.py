"""Clear database and insert showcase seed data.

Usage (from backend/):
    .venv\\Scripts\\python.exe -m scripts.seed
"""

import asyncio
from datetime import UTC, datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import delete, select

from app.core.config import get_settings
from app.db.session import init_db
from app.models.project import Project
from app.models.subscriber import Subscriber
from app.models.update import Update
from app.services.git_parser import parse_commit_message
from app.services.transform import transform_update

# Ensure models are registered
import app.models.project  # noqa: F401
import app.models.subscriber  # noqa: F401
import app.models.update  # noqa: F401


def _days_ago(days: int) -> datetime:
    return datetime.now(UTC) - timedelta(days=days)


async def seed() -> None:
    settings = get_settings()
    engine = create_async_engine(
        settings.database_url,
        connect_args={"check_same_thread": False},
    )
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    await init_db()

    async with session_factory() as session:
        await session.execute(delete(Subscriber))
        await session.execute(delete(Update))
        await session.execute(delete(Project))
        await session.commit()

        project = Project(
            name="NovaPay",
            slug="novapay",
            created_at=_days_ago(30),
        )
        session.add(project)
        await session.commit()
        await session.refresh(project)

        seed_updates = [
            {
                "source": "commit",
                "commit_message": (
                    "feat(webhooks): add payment event notifications\n\n"
                    "Teams can subscribe to charge.succeeded and payout.failed events."
                ),
                "release_tag": "v1.3.0",
                "created_at": _days_ago(2),
            },
            {
                "source": "manual",
                "title": "Fixed login JWT issue",
                "description": "Fixed token validation mismatch after auth refactor",
                "release_tag": "v1.2.1",
                "created_at": _days_ago(8),
            },
            {
                "source": "manual",
                "title": "Faster invoice export",
                "description": "Optimized CSV export path for large accounts",
                "release_tag": "v1.2.0",
                "created_at": _days_ago(14),
            },
            {
                "source": "commit",
                "commit_message": (
                    "feat(auth): add magic link login\n\n"
                    "Users can sign in via email link without a password."
                ),
                "release_tag": "v1.1.0",
                "created_at": _days_ago(21),
            },
            {
                "source": "manual",
                "title": "Team billing dashboard",
                "description": "Added usage overview, seat management, and invoice history",
                "release_tag": "v1.0.0",
                "created_at": _days_ago(28),
            },
        ]

        for entry in seed_updates:
            if entry["source"] == "commit":
                parsed = parse_commit_message(entry["commit_message"])
                title = parsed["title"]
                description = parsed["description"]
                commit_source = parsed["commit_source"]
                update_type = parsed["type"]
            else:
                title = entry["title"]
                description = entry["description"]
                commit_source = None
                update_type = None

            transformed = transform_update(title, description, update_type)
            session.add(
                Update(
                    project_id=project.id,
                    title=title,
                    description=description,
                    type=transformed["type"],
                    release_tag=entry["release_tag"],
                    developer_view=transformed["developer_view"],
                    customer_view=transformed["customer_view"],
                    internal_view=transformed["internal_view"],
                    commit_source=commit_source,
                    created_at=entry["created_at"],
                )
            )

        for email in ("demo@company.com", "product@startup.io"):
            session.add(
                Subscriber(
                    project_id=project.id,
                    email=email,
                    created_at=_days_ago(10),
                )
            )

        await session.commit()

        count = await session.execute(select(Update).where(Update.project_id == project.id))
        update_count = len(list(count.scalars().all()))

    await engine.dispose()

    print("Seed complete!")
    print(f"  Project: NovaPay (slug: novapay)")
    print(f"  Updates: {update_count}")
    print(f"  Subscribers: 2")
    print()
    print("Try these URLs:")
    print("  Dashboard:  http://localhost:3000/project/novapay")
    print("  Public page: http://localhost:3000/c/novapay")
    print("  Subscribe:   http://localhost:3000/c/novapay/subscribe")
    print("  RSS page:    http://localhost:3000/c/novapay/feed")


if __name__ == "__main__":
    asyncio.run(seed())
