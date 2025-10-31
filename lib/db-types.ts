export interface Student {
  id: number;
  github_username: string;
  student_name: string | null;
  email: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Organization {
  id: number;
  name: string;
  github_org_name: string;
  created_at: Date;
}

export interface Repository {
  id: number;
  owner: string;
  name: string;
  full_name: string;
  organization_id: number | null;
  is_organization_repo: boolean;
  student_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Contribution {
  id: number;
  repository_id: number;
  student_id: number;
  type: 'commit' | 'pull_request' | 'issue';
  external_id: string;
  title: string | null;
  url: string;
  state: string | null;
  created_at: Date;
  updated_at: Date;
  metadata: any;
  synced_at: Date;
}

export interface SyncLog {
  id: number;
  student_id: number | null;
  repository_id: number | null;
  status: 'success' | 'error' | 'partial';
  contributions_count: number;
  error_message: string | null;
  started_at: Date;
  completed_at: Date | null;
}

export interface StudentStats {
  student_id: number;
  github_username: string;
  student_name: string | null;
  total_repos: number;
  total_commits: number;
  total_prs: number;
  total_issues: number;
  total_contributions: number;
  last_sync: Date | null;
  repos?: Array<{
    id: number;
    owner: string;
    name: string;
    full_name: string;
    commits: number;
    prs: number;
    issues: number;
    last_sync: Date | null;
  }>;
}
