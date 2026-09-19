import { redirect } from "next/navigation";
import { ProjectPicker } from "@/components/ProjectPicker";

type Props = {
  searchParams: Promise<{ project?: string }>;
};

export default async function SubscribePage({ searchParams }: Props) {
  const params = await searchParams;

  if (params.project) {
    redirect(`/c/${params.project}/subscribe`);
  }

  return <ProjectPicker />;
}
