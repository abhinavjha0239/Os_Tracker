'use client';

import { useEffect, useState } from 'react';

interface StudentSummary {
  student_id: number;
  github_username: string;
  student_name: string | null;
  email: string | null;
  merged_prs_count: number;
  last_sync: string | null;
}

interface OrganizationSummary {
  id: number;
  name: string;
  github_org_name: string;
  student_count: number;
  repo_count: number;
  merged_prs_count: number;
}

interface LeaderboardEntry {
  rank: number;
  student_id: number;
  github_username: string;
  student_name: string | null;
  merged_prs_count: number;
  last_pr_date: string | null;
}

interface ContributionEntry {
  id: number;
  student_id: number;
  type: 'commit' | 'pull_request' | 'issue';
  title: string | null;
  url: string;
  state: string | null;
  created_at: string;
  owner: string;
  repo_name: string;
  full_name: string;
}

export interface DashboardData {
  totalStudents: number;
  totalOrganizations: number;
  totalMergedPRs: number;
  activeThisWeek: number;
  contributionsLast30Days: number;
  totalTrackedContributions: number;
  topStudents: LeaderboardEntry[];
  topOrganizations: OrganizationSummary[];
  recentContributions: Array<ContributionEntry & {
    student_display_name: string;
    github_username: string;
  }>;
}

interface UseDashboardDataResult {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

export function useDashboardData(): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [studentsRes, organizationsRes, leaderboardRes, contributionsRes] = await Promise.all([
          fetch('/api/students/stats', { signal: controller.signal }),
          fetch('/api/organizations/stats', { signal: controller.signal }),
          fetch('/api/leaderboard?limit=8', { signal: controller.signal }),
          fetch('/api/contributions', { signal: controller.signal }),
        ]);

        if (!studentsRes.ok || !organizationsRes.ok || !leaderboardRes.ok || !contributionsRes.ok) {
          throw new Error('Unable to load dashboard data.');
        }

        const [students, organizations, leaderboard, contributions] = await Promise.all([
          studentsRes.json() as Promise<StudentSummary[]>,
          organizationsRes.json() as Promise<OrganizationSummary[]>,
          leaderboardRes.json() as Promise<LeaderboardEntry[]>,
          contributionsRes.json() as Promise<{
            commits: ContributionEntry[];
            pullRequests: ContributionEntry[];
            issues: ContributionEntry[];
          }>,
        ]);

        const totalStudents = students.length;
        const totalOrganizations = organizations.length;
        const totalMergedPRs = students.reduce((sum, student) => sum + (student.merged_prs_count ?? 0), 0);

        const now = Date.now();
        const activeThisWeek = students.filter((student) => {
          if (!student.last_sync) return false;
          const lastSync = new Date(student.last_sync).getTime();
          return !Number.isNaN(lastSync) && now - lastSync <= sevenDaysInMs;
        }).length;

        const topOrganizations = [...organizations]
          .sort((a, b) => b.merged_prs_count - a.merged_prs_count)
          .slice(0, 4);

        const { combinedContributions, contributionsList, contributionsLast30Days } = (() => {
          const combined = [
            ...(contributions.commits ?? []),
            ...(contributions.pullRequests ?? []),
            ...(contributions.issues ?? []),
          ];

          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          const recentCount = combined.filter((item) => {
            if (!item.created_at) return false;
            const time = new Date(item.created_at).getTime();
            return !Number.isNaN(time) && time >= thirtyDaysAgo;
          }).length;

          const list = combined
            .filter((item) => item.created_at)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10);

          return {
            combinedContributions: combined,
            contributionsList: list,
            contributionsLast30Days: recentCount,
          };
        })();

        const hydrationMap = new Map<number, { name: string; username: string }>();
        students.forEach((student) => {
          hydrationMap.set(student.student_id, {
            name: student.student_name ?? '',
            username: student.github_username,
          });
        });

        const recentContributions = contributionsList.map((entry) => {
          const meta = hydrationMap.get(entry.student_id);
          return {
            ...entry,
            student_display_name: meta?.name || meta?.username || 'Unknown contributor',
            github_username: meta?.username || 'unknown',
          };
        });

        setData({
          totalStudents,
          totalOrganizations,
          totalMergedPRs,
          activeThisWeek,
          contributionsLast30Days,
          totalTrackedContributions: combinedContributions.length,
          topStudents: leaderboard.slice(0, 5),
          topOrganizations,
          recentContributions,
        });
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error('Failed to load dashboard data', err);
        setError(err.message || 'Something went wrong while loading data.');
      } finally {
        setLoading(false);
      }
    }

    load();

    return () => {
      controller.abort();
    };
  }, []);

  return { data, loading, error };
}

