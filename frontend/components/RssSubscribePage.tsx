"use client";

import Link from "next/link";
import { useState } from "react";
import { TypeBadge } from "@/components/TypeBadge";
import { api } from "@/lib/api";
import type { PublicChangelog } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RssSubscribePage({ data }: { data: PublicChangelog }) {
  const [copied, setCopied] = useState(false);
  const feedUrl = api.feedUrl(data.project_slug);

  function copyFeedUrl() {
    navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const feedlyUrl = `https://feedly.com/i/subscription/feed/${encodeURIComponent(feedUrl)}`;

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href={`/c/${data.project_slug}`}
        className="text-sm text-ink-500 transition hover:text-ink-800"
      >
        ← Back to {data.project_name} changelog
      </Link>

      <div className="mt-8 text-center animate-fade-up">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 font-display text-lg text-sand-100">
          RSS
        </span>
        <h1 className="display mt-5 text-3xl">Subscribe via RSS</h1>
        <p className="mt-2 text-sm text-ink-500">
          Get {data.project_name} updates in Feedly, Slack, or any RSS reader —
          no account needed here.
        </p>
      </div>

      <div className="card mt-8 space-y-4 p-6 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
            Feed URL
          </p>
          <p className="mt-2 break-all rounded-xl bg-ink-50 px-3 py-2.5 font-mono text-xs text-ink-700">
            {feedUrl}
          </p>
        </div>

        <button type="button" className="btn-primary w-full" onClick={copyFeedUrl}>
          {copied ? "Copied!" : "Copy feed URL"}
        </button>

        <a
          href={feedlyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary w-full text-center"
        >
          Open in Feedly
        </a>

        <a
          href={feedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs text-ink-400 hover:text-ink-600"
        >
          View raw XML feed →
        </a>
      </div>

      <div className="mt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
          How to use
        </p>
        <ol className="mt-3 space-y-2 text-sm text-ink-600">
          <li>1. Copy the feed URL above</li>
          <li>2. Paste it into your RSS reader (Feedly, Inoreader, Slack RSS app…)</li>
          <li>3. New changelog entries appear automatically</li>
        </ol>
      </div>

      {data.items.length > 0 && (
        <div className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
            Recent entries in this feed
          </p>
          <ul className="mt-3 space-y-3">
            {data.items.slice(0, 5).map((item) => (
              <li key={item.id} className="card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <TypeBadge type={item.type} />
                  <time className="text-xs text-ink-400">{formatDate(item.created_at)}</time>
                </div>
                <p className="mt-2 font-medium text-ink-900">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-ink-500">{item.customer_view}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-10 text-center text-sm text-ink-400">
        Prefer email?{" "}
        <Link href={`/c/${data.project_slug}/subscribe`} className="text-accent hover:underline">
          Subscribe by email instead
        </Link>
      </p>
    </div>
  );
}
