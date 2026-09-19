"use client";

import Link from "next/link";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";

export function SubscribeForm({
  slug,
  projectName,
  compact = false,
}: {
  slug: string;
  projectName: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.subscribe(slug, email.trim());
      setSuccess(true);
      setEmail("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("This email is already subscribed to " + projectName + ".");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={compact ? "surface border-teal-200/70 bg-teal-50/80 p-5" : "card p-6"}>
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-sm font-semibold text-teal-800">
            ✓
          </span>
          <div>
            <p className="font-medium text-teal-950">You&apos;re subscribed!</p>
            <p className="mt-1 text-sm text-teal-800/90">
              We&apos;ll email you when <strong>{projectName}</strong> ships something new.
            </p>
            <Link
              href={`/c/${slug}`}
              className="mt-3 inline-block text-sm font-medium text-teal-900 hover:underline"
            >
              View changelog →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "rounded-2xl border border-ink-200/70 bg-white/80 p-5 shadow-soft" : "card p-6"}>
      {!compact && (
        <div className="mb-5 flex items-center gap-3 border-b border-ink-100 pb-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-900 font-display text-lg text-sand-100">
            {projectName.charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-semibold text-ink-900">{projectName}</p>
            <p className="text-xs text-ink-400">Product changelog</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor={`email-${slug}`} className="mb-1.5 block text-sm font-medium text-ink-700">
            Email address
          </label>
          <input
            id={`email-${slug}`}
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            required
          />
        </div>

        <p className="text-xs leading-relaxed text-ink-400">
          Get notified when {projectName} publishes new features, fixes, and improvements.
          No spam — just product updates.
        </p>

        {error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Subscribing…" : `Subscribe to ${projectName}`}
        </button>
      </form>
    </div>
  );
}
