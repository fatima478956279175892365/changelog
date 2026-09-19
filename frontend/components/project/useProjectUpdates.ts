"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import type { UpdateType } from "@/types";

export function useProjectUpdates() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [filterType, setFilterType] = useState<UpdateType | "ALL">("ALL");

  const projectQuery = useSWR(
    slug ? `project-${slug}` : null,
    () => api.getProjectBySlug(slug),
  );

  const updatesQuery = useSWR(
    projectQuery.data ? `updates-${projectQuery.data.id}-${filterType}` : null,
    () =>
      api.getUpdates(
        projectQuery.data!.id,
        filterType === "ALL" ? undefined : filterType,
      ),
  );

  return {
    slug,
    project: projectQuery.data,
    projectError: projectQuery.error,
    projectLoading: projectQuery.isLoading,
    updates: updatesQuery.data?.items ?? [],
    updatesTotal: updatesQuery.data?.total ?? 0,
    updatesError: updatesQuery.error,
    updatesLoading: updatesQuery.isLoading,
    refreshUpdates: updatesQuery.mutate,
    filterType,
    setFilterType,
  };
}
