import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-xl font-semibold text-ink-900">Project not found</h1>
      <p className="mt-2 text-sm text-ink-500">
        This project doesn&apos;t exist or may have been removed.
      </p>
      <Link href="/" className="btn-primary mt-6 inline-flex">
        Back to projects
      </Link>
    </div>
  );
}
