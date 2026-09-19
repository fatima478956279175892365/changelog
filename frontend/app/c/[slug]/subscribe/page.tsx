import type { Metadata } from "next";
import Link from "next/link";
import { SubscribeForm } from "@/components/SubscribeForm";
import { api } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const data = await api.getPublicChangelog(slug);
    return {
      title: `Subscribe to ${data.project_name}`,
      description: `Get email updates when ${data.project_name} ships new features and fixes.`,
    };
  } catch {
    return { title: "Subscribe" };
  }
}

export default async function ProjectSubscribePage({ params }: Props) {
  const { slug } = await params;

  let data;
  try {
    data = await api.getPublicChangelog(slug);
  } catch {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="display text-2xl">Project not found</h1>
        <p className="mt-2 text-sm text-ink-500">
          This changelog doesn&apos;t exist or has been removed.
        </p>
        <Link href="/subscribe" className="mt-6 inline-block text-sm text-accent hover:underline">
          Browse all changelogs →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href={`/c/${slug}`}
        className="text-sm text-ink-500 transition hover:text-ink-800"
      >
        ← Back to {data.project_name} changelog
      </Link>

      <div className="mt-8 text-center animate-fade-up">
        <p className="text-sm font-medium tracking-wide text-accent">Stay in the loop</p>
        <h1 className="display mt-2 text-3xl">
          Subscribe to {data.project_name}
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          {data.total > 0
            ? `${data.total} update${data.total === 1 ? "" : "s"} published so far`
            : "Be the first to know when updates go live"}
        </p>
      </div>

      <div className="mt-8 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <SubscribeForm slug={slug} projectName={data.project_name} />
      </div>

      <p className="mt-8 text-center text-xs text-ink-400">
        Powered by{" "}
        <Link href="/" className="text-accent hover:underline">
          Changelog OS Pro
        </Link>
      </p>
    </div>
  );
}
