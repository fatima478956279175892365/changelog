"use client";

import type { ViewMode } from "@/types";

const modes: { id: ViewMode; label: string }[] = [
  { id: "customer", label: "Customer" },
  { id: "developer", label: "Developer" },
  { id: "internal", label: "Internal" },
];

export function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="inline-flex rounded-xl border border-ink-200/80 bg-white/70 p-1 backdrop-blur-sm">
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
            value === m.id
              ? "bg-ink-900 text-sand-100 shadow-sm"
              : "text-ink-500 hover:text-ink-800"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
