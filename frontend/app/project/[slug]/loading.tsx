export default function ProjectLoading() {
  return (
    <div className="page-shell max-w-3xl py-10 sm:py-12">
      <div className="h-4 w-24 animate-pulse rounded bg-ink-200/60" />
      <div className="mt-6 h-10 w-64 animate-pulse rounded-xl bg-ink-200/50" />
      <div className="mt-3 h-4 w-40 animate-pulse rounded bg-ink-100" />
      <div className="mt-8 h-24 animate-pulse rounded-2xl bg-ink-200/40" />
      <div className="mt-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-ink-200/35" />
        ))}
      </div>
    </div>
  );
}
