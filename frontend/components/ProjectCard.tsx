import Link from "next/link";
import type { Project } from "@/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProjectCard({ project }: { project: Project }) {
  const initial = project.name.charAt(0).toUpperCase();

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-ink-200/70 bg-white/80 p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-lift">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-accent/40 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink-900 font-display text-lg text-sand-100 transition group-hover:bg-accent">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="display text-xl leading-tight">{project.name}</h3>
          <p className="mt-1 font-mono text-xs text-ink-400">/{project.slug}</p>
          <p className="mt-3 text-xs text-ink-500">Created {formatDate(project.created_at)}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-ink-100 pt-5">
        <Link href={`/project/${project.slug}`} className="btn-primary text-xs px-3.5 py-2">
          Open workspace
        </Link>
        <Link
          href={`/c/${project.slug}`}
          className="btn-secondary text-xs px-3.5 py-2"
          target="_blank"
        >
          Public page
        </Link>
        <Link href={`/c/${project.slug}/subscribe`} className="btn-secondary text-xs px-3.5 py-2">
          Subscribe
        </Link>
      </div>
    </article>
  );
}
