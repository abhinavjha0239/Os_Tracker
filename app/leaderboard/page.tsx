'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const numberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const formatNumber = (value: number) => numberFormatter.format(value);

interface LeaderboardEntry {
  rank: number;
  student_id: number;
  github_username: string;
  student_name: string | null;
  merged_prs_count: number;
  last_pr_date: string | null;
}

interface Organization {
  id: number;
  name: string;
  github_org_name: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [limit, setLimit] = useState(50);

  const loadOrganizations = useCallback(async () => {
    try {
      const response = await fetch('/api/organizations');
      const data = await response.json();
      setOrganizations(data);
    } catch (error) {
      console.error('Error loading organizations:', error);
    }
  }, []);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/api/leaderboard?limit=${limit}`;
      
      if (selectedPeriod !== 'all') {
        const date = new Date();
        if (selectedPeriod === 'month') {
          url += `&month=${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }
      }

      if (selectedOrg !== 'all') {
        url += `&organization_id=${selectedOrg}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedOrg, limit]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-orange-500';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-600 to-orange-800';
    return 'from-gray-400 to-gray-600';
  };

  const totalPRs = leaderboard.reduce((sum, entry) => sum + (entry.merged_prs_count || 0), 0);
  const averagePRs = leaderboard.length ? totalPRs / leaderboard.length : 0;
  const topStudent = leaderboard[0];
  const selectedOrganization = selectedOrg !== 'all'
    ? organizations.find((org) => String(org.id) === String(selectedOrg))
    : null;

  const summaryCards = [
    {
      label: 'Merged pull requests',
      value: formatNumber(totalPRs),
      caption: 'Across current filters',
    },
    {
      label: 'Average per contributor',
      value: leaderboard.length ? averagePRs.toFixed(1) : '0.0',
      caption: leaderboard.length ? `Based on top ${leaderboard.length}` : 'No contributors yet',
    },
    {
      label: 'Top contributor',
      value: topStudent ? topStudent.student_name || topStudent.github_username : '—',
      caption: topStudent ? `${topStudent.merged_prs_count} merged PRs` : 'Waiting for the first merge',
    },
    {
      label: 'Active organizations',
      value: formatNumber(organizations.length),
      caption: selectedOrganization ? `${selectedOrganization.name} selected` : 'Across all organizations',
    },
  ];

  const highlight = leaderboard.slice(0, Math.min(3, leaderboard.length));

  return (
    <div className="min-h-screen pb-20 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="space-y-8">
          <div className="glass-card rounded-3xl bg-white/95 dark:bg-slate-950/70 p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-4">
                <span className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-300">
                  Campus leaderboard
                </span>
                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                    Recognize the contributors shaping your open-source story
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                    Filter by timeframe or organization to spotlight top students and celebrate momentum each sprint.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/students"
                  className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500"
                >
                  Explore student profiles
                </Link>
                <Link
                  href="/organizations"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200/80 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100/80 dark:border-slate-800/70 dark:text-slate-100 dark:hover:bg-slate-800/70"
                >
                  View organizations
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="glass-card rounded-3xl bg-white/95 dark:bg-slate-950/70 p-6 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
                  {card.label}
                </p>
                <p className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">{card.value}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{card.caption}</p>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-3xl bg-white/95 dark:bg-slate-950/70 p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Time period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-transparent bg-white/80 px-4 py-3 text-sm text-gray-900 shadow-sm shadow-amber-500/5 focus:border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:bg-gray-950/60 dark:text-white"
                >
                  <option value="all">All time</option>
                  <option value="month">This month</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Organization</label>
                <select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-transparent bg-white/80 px-4 py-3 text-sm text-gray-900 shadow-sm shadow-amber-500/5 focus:border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:bg-gray-950/60 dark:text-white"
                >
                  <option value="all">All organizations</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Show top</label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="mt-2 w-full rounded-2xl border border-transparent bg-white/80 px-4 py-3 text-sm text-gray-900 shadow-sm shadow-amber-500/5 focus:border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:bg-gray-950/60 dark:text-white"
                >
                  <option value={10}>Top 10</option>
                  <option value={25}>Top 25</option>
                  <option value={50}>Top 50</option>
                  <option value={100}>Top 100</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span>{leaderboard.length} contributors ranked</span>
              <span>
                {selectedOrganization ? selectedOrganization.name : 'All organizations'} · {selectedPeriod === 'month' ? 'This month' : 'Lifetime'}
              </span>
            </div>
          </div>
        </section>

        <section className="mt-12 space-y-8">
          {loading ? (
            <div className="space-y-8">
              <div className="grid gap-6 md:grid-cols-3">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="glass-card h-48 rounded-3xl bg-white/80 p-6 animate-pulse" />
                ))}
              </div>
              <div className="glass-card h-80 rounded-3xl bg-white/80 p-6 animate-pulse" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="glass-card rounded-3xl bg-white/95 dark:bg-slate-950/70 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                No merged pull requests yet
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Encourage students to open pull requests and run a sync to populate the leaderboard.
              </p>
            </div>
          ) : (
            <>
              {highlight.length > 0 && (
                <div className="grid gap-6 md:grid-cols-3">
                  {highlight.map((entry) => (
                    <div
                      key={entry.student_id}
                      className="relative flex flex-col items-center justify-end rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-8 text-center text-white shadow-lg shadow-amber-500/20"
                      style={{ order: entry.rank === 1 ? 2 : entry.rank === 2 ? 1 : 3 }}
                    >
                      {entry.rank === 1 && (
                        <span className="absolute -top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/30 text-2xl">
                          👑
                        </span>
                      )}
                      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-4xl font-bold">
                        {entry.rank}
                      </div>
                      <h3 className="text-xl font-semibold">
                        {entry.student_name || entry.github_username}
                      </h3>
                      <p className="text-sm text-white/80 mb-4">@{entry.github_username}</p>
                      <div className="text-4xl font-bold">{entry.merged_prs_count}</div>
                      <p className="text-xs tracking-[0.3em] uppercase text-white/70">Merged PRs</p>
                      <Link
                        href={`/students/${entry.student_id}`}
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-amber-600 transition hover:bg-amber-50"
                      >
                        View profile
                        <svg viewBox="0 0 24 24" className="h-4 w-4" stroke="currentColor" fill="none" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              <div className="glass-card overflow-hidden rounded-3xl bg-white/95 dark:bg-slate-950/70">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200/70 dark:divide-gray-800/60">
                    <thead className="bg-white/80 dark:bg-gray-950/60">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
                          Rank
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
                          Student
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
                          Merged PRs
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/60 bg-white/60 dark:divide-gray-800/60 dark:bg-gray-950/50">
                      {leaderboard.map((entry) => (
                        <tr key={entry.student_id} className="transition hover:bg-indigo-50/80 dark:hover:bg-indigo-500/10">
                          <td className="px-6 py-4">
                            <div
                              className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-white font-semibold ${getMedalColor(entry.rank)}`}
                            >
                              {entry.rank}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-sm font-semibold text-white">
                                {(entry.student_name || entry.github_username).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {entry.student_name || entry.github_username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">@{entry.github_username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                              {entry.merged_prs_count}
                              <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400">PRs</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/students/${entry.student_id}`}
                              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100/80 dark:border-slate-800/70 dark:text-slate-100 dark:hover:bg-slate-800/70"
                            >
                              View profile
                              <svg viewBox="0 0 24 24" className="h-4 w-4" stroke="currentColor" fill="none" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
