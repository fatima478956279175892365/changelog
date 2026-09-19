export type UpdateType = "FEATURE" | "BUGFIX" | "IMPROVEMENT";

export interface Project {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export interface UpdateBrief {
  id: number;
  title: string;
  type: UpdateType;
  created_at: string;
  release_tag?: string | null;
}

export interface ProjectDetail extends Project {
  updates: Update[];
}

export interface Update {
  id: number;
  project_id: number;
  title: string;
  description: string;
  type: UpdateType;
  created_at: string;
  release_tag?: string | null;
  developer_view: string;
  customer_view: string;
  internal_view: string;
  commit_source?: string | null;
}

export interface PaginatedUpdates {
  items: Update[];
  total: number;
  page: number;
  page_size: number;
}

export interface PublicUpdate {
  id: number;
  title: string;
  type: UpdateType;
  created_at: string;
  release_tag?: string | null;
  customer_view: string;
}

export interface PublicChangelog {
  project_id: number;
  project_name: string;
  project_slug: string;
  items: PublicUpdate[];
  total: number;
  page: number;
  page_size: number;
}

export interface Subscriber {
  id: number;
  project_id: number;
  email: string;
  created_at: string;
}

export type ViewMode = "developer" | "customer" | "internal";
