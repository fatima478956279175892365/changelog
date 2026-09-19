import type { Metadata } from "next";
import Link from "next/link";
import { RssSubscribePage } from "@/components/RssSubscribePage";
import { api } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const data = await api.getPublicChangelog(slug);
    return {
      title: `RSS — ${data.project_name}`,
      description: `Subscribe to ${data.project_name} changelog updates via RSS.`,
      alternates: {
        types: {
          "application/rss+xml": api.feedUrl(slug),
        },
      },
    };
  } catch {
    return { title: "RSS Feed" };
  }
}

export default async function FeedPage({ params }: Props) {
  const { slug } = await params;

  try {
    const data = await api.getPublicChangelog(slug);
    return <RssSubscribePage data={data} />;
  } catch {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-semibold text-ink-900">Feed not found</h1>
        <p className="mt-2 text-sm text-ink-500">This changelog doesn&apos;t exist.</p>
        <Link href="/subscribe" className="mt-6 inline-block text-sm text-accent hover:underline">
          Browse changelogs →
        </Link>
      </div>
    );
  }
}
