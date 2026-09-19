export function UpdateTimeline({
  loading,
  error,
  emptyMessage,
  children,
}: {
  loading?: boolean;
  error?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="card ml-8 h-28 animate-pulse bg-ink-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card ml-8 border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Failed to load updates.
      </div>
    );
  }

  if (emptyMessage) {
    return (
      <div className="card ml-8 p-8 text-center text-sm text-ink-500">{emptyMessage}</div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-ink-200" />
      <div className="space-y-6">{children}</div>
    </div>
  );
}

export function TimelineItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative pl-8">
      <span className="absolute left-0 top-5 h-[22px] w-[22px] rounded-full border-2 border-white bg-accent shadow-sm ring-2 ring-accent/20" />
      {children}
    </div>
  );
}
