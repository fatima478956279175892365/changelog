import type { UpdateType } from "@/types";

const styles: Record<UpdateType, string> = {
  FEATURE: "bg-teal-50 text-teal-800 ring-teal-700/15",
  BUGFIX: "bg-rose-50 text-rose-800 ring-rose-700/15",
  IMPROVEMENT: "bg-amber-50 text-amber-900 ring-amber-700/15",
};

export function TypeBadge({ type }: { type: UpdateType }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${styles[type]}`}
    >
      {type.toLowerCase()}
    </span>
  );
}
