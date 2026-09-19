"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { ProjectCard } from "@/components/ProjectCard";
import { api } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const { data: projects, error, isLoading, mutate } = useSWR("projects", api.listProjects);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const project = await api.createProject(name.trim());
      await mutate();
      router.push(`/project/${project.slug}`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create project");
      setCreating(false);
    }
  }

  return (
    <div>
      <section className="relative overflow-hidden border-b border-ink-200/50">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(23,26,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(23,26,22,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "linear-gradient(to bottom, black 40%, transparent)",
          }}
        />
        <div className="page-shell relative py-16 sm:py-20">
          <div className="animate-fade-up max-w-3xl">
            <p className="text-sm font-medium tracking-wide text-accent">Changelog OS Pro</p>
            <h1 className="display mt-4 text-4xl leading-[1.1] sm:text-5xl md:text-6xl">
              Ship changelogs your team and customers love
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-600 sm:text-lg">
              One update. Three audiences. Publish a public page, RSS, and embed —
              without rewriting release notes.
            </p>
          </div>

          <form
            onSubmit={handleCreate}
            className="animate-fade-up mt-10 flex max-w-2xl flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "80ms" }}
          >
            <input
              className="input flex-1 bg-white/90 py-3.5 text-base"
              placeholder="Name your product…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary shrink-0 px-6 py-3.5" disabled={creating}>
              {creating ? "Creating…" : "Create project"}
            </button>
          </form>
          {createError && (
            <p className="mt-3 text-sm text-rose-700">{createError}</p>
          )}
        </div>
      </section>

      <section className="page-shell py-12 sm:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="display text-2xl">Your projects</h2>
            <p className="mt-1 text-sm text-ink-500">Manage updates, views, and public pages.</p>
          </div>
          {projects && projects.length > 0 && (
            <p className="text-sm tabular-nums text-ink-400">{projects.length} active</p>
          )}
        </div>

        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-ink-200/40" />
            ))}
          </div>
        )}

        {error && (
          <div className="surface border-rose-200/80 bg-rose-50/80 p-5 text-sm text-rose-800">
            Could not load projects. Make sure the API is running at{" "}
            <code className="font-mono text-xs">
              {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}
            </code>
            .
          </div>
        )}

        {!isLoading && !error && projects?.length === 0 && (
          <div className="surface px-8 py-14 text-center">
            <p className="display text-xl text-ink-800">No projects yet</p>
            <p className="mt-2 text-sm text-ink-500">Create your first product above to get started.</p>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2">
            {projects.map((p, i) => (
              <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
