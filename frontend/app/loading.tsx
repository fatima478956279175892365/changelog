export default function HomeLoading() {
  return (
    <div>
      <div className="page-shell py-16 sm:py-20">
        <div className="h-4 w-40 animate-pulse rounded bg-ink-200/60" />
        <div className="mt-5 h-14 w-full max-w-2xl animate-pulse rounded-xl bg-ink-200/50" />
        <div className="mt-4 h-5 w-96 max-w-full animate-pulse rounded bg-ink-100" />
        <div className="mt-10 h-14 max-w-2xl animate-pulse rounded-xl bg-ink-200/40" />
      </div>
      <div className="page-shell py-12">
        <div className="grid gap-5 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-ink-200/40" />
          ))}
        </div>
      </div>
    </div>
  );
}
