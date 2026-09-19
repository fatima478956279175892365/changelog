"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";

export function ProjectPicker() {
  const { data: projects, error, isLoading } = useSWR("projects", api.listProjects);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!projects) return [];
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
    );
  }, [projects, query]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="text-center animate-fade-up">
        <p className="text-sm font-medium tracking-wide text-accent">Stay in the loop</p>
        <h1 className="display mt-2 text-3xl">Choose a changelog</h1>
        <p className="mt-2 text-sm text-ink-500">
          Pick a product to subscribe to its email updates.
        </p>
      </div>

      <div className="mt-8">
        <input
          className="input"
          type="search"
          placeholder="Search by product name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="mt-4 space-y-2">
        {isLoading && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-ink-200/40" />
            ))}
          </>
        )}

        {error && (
          <div className="surface border-rose-200/80 bg-rose-50/80 p-4 text-sm text-rose-800">
            Could not load projects. Make sure the API is running.
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="surface p-6 text-center text-sm text-ink-500">
            {query ? "No products match your search." : "No changelogs published yet."}
          </div>
        )}

        {filtered.map((project) => (
          <Link
            key={project.id}
            href={`/c/${project.slug}/subscribe`}
            className="card flex items-center gap-4 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-lift"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink-900 font-display text-base text-sand-100">
              {project.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink-900">{project.name}</p>
              <p className="truncate text-xs text-ink-400">View changelog &amp; subscribe →</p>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-ink-400">
        <Link href="/" className="transition hover:text-ink-700">
          ← Back to dashboard
        </Link>
      </p>
    </div>
  );
}
