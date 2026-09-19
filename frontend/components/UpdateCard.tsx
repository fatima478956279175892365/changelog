import { TypeBadge } from "@/components/TypeBadge";
import type { Update, ViewMode } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function viewContent(update: Update, mode: ViewMode) {
  if (mode === "developer") return update.developer_view;
  if (mode === "internal") return update.internal_view;
  return update.customer_view;
}

export function UpdateCard({
  update,
  viewMode,
}: {
  update: Update;
  viewMode: ViewMode;
}) {
  return (
    <article className="rounded-2xl border border-ink-200/70 bg-white/85 p-5 shadow-soft transition duration-200 hover:border-ink-300/80 hover:shadow-lift">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={update.type} />
            {update.release_tag && (
              <span className="rounded-lg bg-ink-100 px-2 py-0.5 font-mono text-[11px] text-ink-600">
                {update.release_tag}
              </span>
            )}
          </div>
          <h3 className="display text-lg leading-snug text-ink-900">{update.title}</h3>
        </div>
        <time className="text-xs tabular-nums text-ink-400">{formatDate(update.created_at)}</time>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink-600">
        {viewContent(update, viewMode)}
      </p>
      {update.commit_source && (
        <p className="mt-4 truncate rounded-xl bg-ink-50 px-3 py-2 font-mono text-[11px] text-ink-500">
          {update.commit_source}
        </p>
      )}
    </article>
  );
}
