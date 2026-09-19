import type { Metadata } from "next";
import Link from "next/link";
import { SubscribeSection } from "@/components/SubscribeSection";
import { TypeBadge } from "@/components/TypeBadge";
import { api } from "@/lib/api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const data = await api.getPublicChangelog(slug);
    return {
      title: `${data.project_name} Changelog`,
      description: `Latest product updates for ${data.project_name}`,
      openGraph: {
        title: `${data.project_name} Changelog`,
        description: `Latest product updates for ${data.project_name}`,
        type: "website",
      },
      alternates: {
        types: {
          "application/rss+xml": api.feedUrl(slug),
        },
      },
    };
  } catch {
    return { title: "Changelog" };
  }
}

export default async function PublicChangelogPage({ params }: Props) {
  const { slug } = await params;

  let data;
  try {
    data = await api.getPublicChangelog(slug);
  } catch {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="display text-2xl">Changelog not found</h1>
        <p className="mt-2 text-ink-500">This project doesn&apos;t exist or has no public page.</p>
      </div>
    );
  }

  const feedPageUrl = `/c/${slug}/feed`;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="relative overflow-hidden border-b border-ink-200/60">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-sand-200/40" />
        <div className="relative mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-sm font-medium tracking-wide text-accent">Changelog</p>
          <h1 className="display mt-3 text-4xl leading-tight sm:text-5xl">
            {data.project_name}
          </h1>
          <p className="mt-4 max-w-md text-ink-600">
            Stay up to date with the latest improvements, fixes, and features.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#subscribe" className="btn-primary text-sm">
              Subscribe via email
            </a>
            <Link href={feedPageUrl} className="btn-secondary text-sm">
              RSS feed
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-14">
        {data.items.length === 0 ? (
          <p className="text-center text-ink-400">No updates published yet.</p>
        ) : (
          <div className="relative">
            <div className="absolute left-[7px] top-3 bottom-3 w-px bg-gradient-to-b from-accent/40 via-ink-200 to-transparent" />
            <div className="space-y-12">
              {data.items.map((item) => (
                <article key={item.id} className="relative pl-8">
                  <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full bg-accent ring-4 ring-accent/15" />
                  <div className="flex flex-wrap items-center gap-2">
                    <time className="text-sm font-medium text-ink-800">
                      {formatDate(item.created_at)}
                    </time>
                    <TypeBadge type={item.type} />
                    {item.release_tag && (
                      <span className="rounded-lg bg-ink-100 px-2 py-0.5 font-mono text-[11px] text-ink-500">
                        {item.release_tag}
                      </span>
                    )}
                  </div>
                  <h2 className="display mt-3 text-2xl leading-snug">{item.title}</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-600">{item.customer_view}</p>
                </article>
              ))}
            </div>
          </div>
        )}

        <SubscribeSection slug={data.project_slug} projectName={data.project_name} />

        <footer className="mt-16 border-t border-ink-200/60 pt-8 text-center text-xs text-ink-400">
          Powered by{" "}
          <Link href="/" className="text-accent hover:underline">
            Changelog OS Pro
          </Link>
        </footer>
      </div>
    </div>
  );
}
