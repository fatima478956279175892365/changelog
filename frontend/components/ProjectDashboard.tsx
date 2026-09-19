"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { AddUpdateModal } from "@/components/AddUpdateModal";
import { UpdateCard } from "@/components/UpdateCard";
import { ViewToggle } from "@/components/ViewToggle";
import { api } from "@/lib/api";
import type { ProjectDetail, UpdateType, ViewMode } from "@/types";

const viewDescriptions: Record<ViewMode, string> = {
  customer: "User-friendly copy — this is what appears on your public changelog.",
  developer: "Technical details for your engineering team.",
  internal: "Business impact notes for PMs and leadership.",
};

export function ProjectDashboard({ initialProject }: { initialProject: ProjectDetail }) {
  const [viewMode, setViewMode] = useState<ViewMode>("customer");
  const [filterType, setFilterType] = useState<UpdateType | "ALL">("ALL");
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const { data: project, mutate } = useSWR(
    `project-${initialProject.slug}`,
    () => api.getProjectBySlug(initialProject.slug),
    {
      fallbackData: initialProject,
      revalidateOnFocus: false,
      dedupingInterval: 10_000,
    },
  );

  const filteredUpdates = useMemo(() => {
    const updates = project?.updates ?? [];
    if (filterType === "ALL") return updates;
    return updates.filter((u) => u.type === filterType);
  }, [project?.updates, filterType]);

  function copyText(label: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!project) return null;

  const publicUrl = `${window.location.origin}/c/${project.slug}`;
  const feedUrl = api.feedUrl(project.slug);
  const widgetSnippet = `<script src="${api.widgetUrl(project.slug)}" async></script>`;
  const isEmpty = project.updates.length === 0;

  return (
    <div className="page-shell max-w-3xl py-10 sm:py-12">
      <Link
        href="/"
        className="inline-flex text-sm text-ink-500 transition hover:text-ink-800"
      >
        ← All projects
      </Link>

      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="animate-fade-up">
          <p className="font-mono text-xs text-ink-400">/{project.slug}</p>
          <h1 className="display mt-1 text-3xl sm:text-4xl">{project.name}</h1>
          <p className="mt-2 text-sm text-ink-500">
            {project.updates.length} update{project.updates.length === 1 ? "" : "s"} ·{" "}
            <Link href={`/c/${project.slug}`} target="_blank" className="text-accent hover:underline">
              View public page
            </Link>
          </p>
        </div>
        <button className="btn-primary shrink-0" onClick={() => setShowModal(true)}>
          Add update
        </button>
      </div>

      <div className="surface mt-8 p-5 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
          Share &amp; embed
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-secondary text-xs" onClick={() => copyText("public", publicUrl)}>
            {copied === "public" ? "Copied!" : "Copy public URL"}
          </button>
          <button className="btn-secondary text-xs" onClick={() => copyText("rss", feedUrl)}>
            {copied === "rss" ? "Copied!" : "Copy RSS feed"}
          </button>
          <button className="btn-secondary text-xs" onClick={() => copyText("widget", widgetSnippet)}>
            {copied === "widget" ? "Copied!" : "Copy widget embed"}
          </button>
          <Link href={`/c/${project.slug}/feed`} target="_blank" className="btn-secondary text-xs">
            RSS page
          </Link>
          <Link href={`/c/${project.slug}/subscribe`} target="_blank" className="btn-secondary text-xs">
            Subscribe page
          </Link>
        </div>
      </div>

      {isEmpty ? (
        <div className="surface mt-10 px-8 py-14 text-center animate-scale-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 font-display text-2xl text-accent">
            +
          </div>
          <h2 className="display mt-5 text-2xl">No updates yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
            Add your first release note — we&apos;ll generate developer, customer, and internal views automatically.
          </p>
          <button className="btn-primary mt-7" onClick={() => setShowModal(true)}>
            Add your first update
          </button>
        </div>
      ) : (
        <>
          <div className="mt-10 space-y-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <ViewToggle value={viewMode} onChange={setViewMode} />
              <div className="inline-flex rounded-xl border border-ink-200/80 bg-white/70 p-1">
                {(["ALL", "FEATURE", "BUGFIX", "IMPROVEMENT"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilterType(t)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      filterType === t
                        ? "bg-ink-900 text-sand-100"
                        : "text-ink-500 hover:text-ink-800"
                    }`}
                  >
                    {t === "ALL" ? "All" : t.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-ink-400">{viewDescriptions[viewMode]}</p>
          </div>

          <div className="relative mt-8">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-accent/50 via-ink-200 to-transparent" />
            <div className="space-y-5">
              {filteredUpdates.length === 0 ? (
                <div className="surface ml-8 p-6 text-center text-sm text-ink-500">
                  No {filterType.toLowerCase()} updates yet.
                </div>
              ) : (
                filteredUpdates.map((update, i) => (
                  <div
                    key={update.id}
                    className="relative animate-fade-up pl-8"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <span className="absolute left-0 top-5 h-[22px] w-[22px] rounded-full border-2 border-sand-100 bg-accent shadow-sm ring-4 ring-accent/10" />
                    <UpdateCard update={update} viewMode={viewMode} />
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {showModal && (
        <AddUpdateModal
          projectId={project.id}
          onClose={() => setShowModal(false)}
          onCreated={() => mutate()}
        />
      )}
    </div>
  );
}
