export interface GitHubUser {
  id: number;
  login: string;
  name?: string;
  email?: string;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  stargazers_count: number;
  forks_count: number;
  language?: string;
  created_at: string;
  updated_at: string;
  private: boolean;
}

export interface GitHubApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface GitHubApiError {
  message: string;
  status: number;
  code?: string;
}

export type SortOrder = "asc" | "desc";
export type RepositorySort = "created" | "updated" | "pushed" | "full_name";
