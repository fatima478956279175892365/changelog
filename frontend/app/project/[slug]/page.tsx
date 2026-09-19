import { notFound } from "next/navigation";
import { ProjectDashboard } from "@/components/ProjectDashboard";
import { api } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;

  try {
    const project = await api.getProjectBySlug(slug);
    return <ProjectDashboard initialProject={project} />;
  } catch {
    notFound();
  }
}
