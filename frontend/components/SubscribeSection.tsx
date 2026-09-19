"use client";

import { SubscribeForm } from "@/components/SubscribeForm";

export function SubscribeSection({
  slug,
  projectName,
}: {
  slug: string;
  projectName: string;
}) {
  return (
    <section id="subscribe" className="mt-16 scroll-mt-8">
      <div className="overflow-hidden rounded-2xl border border-ink-200/70 bg-gradient-to-br from-white/90 via-white/70 to-accent/5 p-6 shadow-soft sm:p-8">
        <div className="mb-6 max-w-sm">
          <h2 className="display text-2xl">Get updates by email</h2>
          <p className="mt-2 text-sm text-ink-500">
            Never miss a release from {projectName}.
          </p>
        </div>
        <SubscribeForm slug={slug} projectName={projectName} compact />
      </div>
    </section>
  );
}
