"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ProjectDetail } from "@/types";

type Tab = { href: string; label: string; description: string };

function tabs(slug: string): Tab[] {
  const base = `/project/${slug}`;
  return [
    { href: base, label: "Overview", description: "Project home" },
    { href: `${base}/developer`, label: "Developer log", description: "Technical release notes" },
    { href: `${base}/customer`, label: "Customer changelog", description: "Public-facing copy" },
    { href: `${base}/internal`, label: "Internal brief", description: "Team & leadership notes" },
  ];
}

export function ProjectShell({
  project,
  children,
  actions,
}: {
  project: ProjectDetail;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();
  const nav = tabs(project.slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/" className="text-sm text-ink-400 hover:text-ink-700 transition">
        ← All projects
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">{project.name}</h1>
          <p className="mt-1 font-mono text-sm text-ink-400">/{project.slug}</p>
        </div>
        {actions}
      </div>

      <nav className="mt-8 flex gap-1 overflow-x-auto border-b border-ink-200 pb-px">
        {nav.map((tab) => {
          const active =
            tab.href === `/project/${project.slug}`
              ? pathname === tab.href
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                active
                  ? "border-accent text-accent"
                  : "border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-800"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  );
}

export function ProjectLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="h-4 w-24 animate-pulse rounded bg-ink-200" />
      <div className="mt-6 h-8 w-64 animate-pulse rounded bg-ink-200" />
      <div className="mt-8 h-10 w-full animate-pulse rounded-lg bg-ink-100" />
      <div className="mt-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card h-28 animate-pulse bg-ink-100" />
        ))}
      </div>
    </div>
  );
}

export function ProjectError() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="card border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Project not found or API unavailable.
      </div>
      <Link href="/" className="mt-4 inline-block text-sm text-accent hover:underline">
        ← Back to projects
      </Link>
    </div>
  );
}
