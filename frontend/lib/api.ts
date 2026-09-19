import type {
  PaginatedUpdates,
  Project,
  ProjectDetail,
  PublicChangelog,
  Subscriber,
  Update,
  UpdateType,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number | false } },
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: init?.next?.revalidate === undefined ? "no-store" : undefined,
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(String(detail), res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  listProjects: () => request<Project[]>("/projects"),

  createProject: (name: string) =>
    request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  getProjectBySlug: (slug: string) =>
    request<ProjectDetail>(`/projects/slug/${slug}`),

  getUpdates: (projectId: number, type?: UpdateType) => {
    const params = new URLSearchParams({ project_id: String(projectId) });
    if (type) params.set("type", type);
    return request<PaginatedUpdates>(`/updates?${params}`);
  },

  createUpdate: (data: {
    project_id: number;
    title: string;
    description: string;
    type?: UpdateType;
    release_tag?: string;
  }) =>
    request<Update>("/updates", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  createUpdateFromCommit: (projectId: number, commitMessage: string) =>
    request<Update>("/updates/from-commit", {
      method: "POST",
      body: JSON.stringify({
        project_id: projectId,
        commit_message: commitMessage,
      }),
    }),

  getPublicChangelog: (slug: string) =>
    request<PublicChangelog>(`/public/${slug}`),

  subscribe: (projectSlug: string, email: string) =>
    request<Subscriber>("/subscribe", {
      method: "POST",
      body: JSON.stringify({ project_slug: projectSlug, email }),
    }),

  feedUrl: (slug: string) => `${API_URL}/feed/${slug}.xml`,
  widgetUrl: (slug: string) => `${API_URL}/widget/${slug}.js`,
};

export { ApiError };
