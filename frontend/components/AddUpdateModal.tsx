"use client";

import { useState } from "react";
import { api } from "@/lib/api";

type Tab = "manual" | "commit";

export function AddUpdateModal({
  projectId,
  onClose,
  onCreated,
}: {
  projectId: number;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [tab, setTab] = useState<Tab>("manual");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseTag, setReleaseTag] = useState("");
  const [commitMessage, setCommitMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (tab === "manual") {
        await api.createUpdate({
          project_id: projectId,
          title,
          description: description || title,
          release_tag: releaseTag || undefined,
        });
      } else {
        await api.createUpdateFromCommit(projectId, commitMessage);
      }
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create update");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg animate-scale-in rounded-2xl border border-ink-200/80 bg-sand-100 p-6 shadow-lift">
        <h2 className="display text-2xl text-ink-900">Add update</h2>
        <p className="mt-1 text-sm text-ink-500">
          We&apos;ll auto-generate developer, customer, and internal views.
        </p>

        <div className="mt-5 inline-flex rounded-xl border border-ink-200/80 bg-white/70 p-1">
          {(["manual", "commit"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${
                tab === t
                  ? "bg-ink-900 text-sand-100"
                  : "text-ink-500 hover:text-ink-800"
              }`}
            >
              {t === "commit" ? "From commit" : t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {tab === "manual" ? (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-600">Title</label>
                <input
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Fixed login JWT issue"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-600">Description</label>
                <textarea
                  className="input min-h-[88px] resize-y"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional details..."
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink-600">Release tag</label>
                <input
                  className="input"
                  value={releaseTag}
                  onChange={(e) => setReleaseTag(e.target.value)}
                  placeholder="v1.2.0"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Commit message</label>
              <textarea
                className="input min-h-[120px] resize-y font-mono text-xs"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder={"feat(auth): add magic link login\n\nUsers can sign in via email link."}
                required
              />
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating…" : "Create update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
