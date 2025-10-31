'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const numberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const formatNumber = (value: number) => numberFormatter.format(value);

interface StudentStat {
  student_id: number;
  github_username: string;
  student_name: string | null;
  email: string | null;
  merged_prs_count: number;
  last_sync: string | null;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'prs'>('prs');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'stale'>('all');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students/stats');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const now = Date.now();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const staleMs = 30 * 24 * 60 * 60 * 1000;

  const totalMerged = students.reduce((sum, student) => sum + (student.merged_prs_count || 0), 0);
  const activeThisWeek = students.filter((student) => {
    if (!student.last_sync) return false;
    const timestamp = new Date(student.last_sync).getTime();
    return !Number.isNaN(timestamp) && now - timestamp <= weekMs;
  }).length;
  const neverSynced = students.filter((student) => !student.last_sync).length;
  const averageMerged = students.length ? totalMerged / students.length : 0;
  const activePercentage = students.length ? Math.round((activeThisWeek / students.length) * 100) : 0;

  const summaryCards = [
    {
      label: 'Students tracked',
      value: formatNumber(students.length),
      caption:
        students.length > 0
          ? `${activeThisWeek} active this week`
          : 'Import your first student roster to begin',
    },
    {
      label: 'Merged pull requests',
      value: formatNumber(totalMerged),
      caption:
        students.length > 0
          ? `Avg ${averageMerged.toFixed(1)} per student`
          : 'No merged pull requests yet',
    },
    {
      label: 'Active contributors',
      value: formatNumber(activeThisWeek),
      caption:
        students.length > 0
          ? `${activePercentage}% of the roster engaged`
          : 'Sync to measure velocity',
    },
    {
      label: 'Needs sync',
      value: formatNumber(neverSynced),
      caption: neverSynced > 0 ? 'Invite them to connect GitHub' : 'All students synced recently',
    },
  ];

  const statusOptions = [
    { value: 'all' as const, label: 'All statuses' },
    { value: 'active' as const, label: 'Synced 7d' },
    { value: 'stale' as const, label: 'Needs sync' },
  ];

  const isActive = (student: StudentStat) => {
    if (!student.last_sync) return false;
    const timestamp = new Date(student.last_sync).getTime();
    return !Number.isNaN(timestamp) && now - timestamp <= weekMs;
  };

  const isStale = (student: StudentStat) => {
    if (!student.last_sync) return true;
    const timestamp = new Date(student.last_sync).getTime();
    if (Number.isNaN(timestamp)) return true;
    return now - timestamp > staleMs;
  };

  const syncToneStyles = {
    fresh: 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    warm: 'bg-amber-100/80 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    stale: 'bg-rose-100/80 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  } as const;

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'never';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'unknown';

    const diff = now - date.getTime();
    const absolute = Math.abs(diff);
    const units: Array<[number, string]> = [
      [60, 's'],
      [60, 'm'],
      [24, 'h'],
      [7, 'd'],
      [4.34524, 'w'],
      [12, 'mo'],
      [Number.POSITIVE_INFINITY, 'y'],
    ];

    let duration = absolute / 1000;
    let unit = 's';

    for (const [threshold, nextUnit] of units) {
      if (duration < threshold) {
        unit = nextUnit;
        break;
      }
      duration /= threshold;
    }

    const value = Math.max(1, Math.floor(duration));
    return diff >= 0 ? `${value}${unit} ago` : `in ${value}${unit}`;
  };

  const getSyncTone = (dateString: string | null) => {
    if (!dateString) return { label: 'Never synced', tone: 'stale' as const };
    const timestamp = new Date(dateString).getTime();
    if (Number.isNaN(timestamp)) return { label: 'Unknown', tone: 'stale' as const };
    const diff = now - timestamp;
    if (diff <= weekMs) {
      return { label: formatRelativeTime(dateString), tone: 'fresh' as const };
    }
    if (diff <= staleMs) {
      return { label: formatRelativeTime(dateString), tone: 'warm' as const };
    }
    return { label: formatRelativeTime(dateString), tone: 'stale' as const };
  };

  const filteredStudents = students
    .filter((student) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        student.github_username.toLowerCase().includes(searchLower) ||
        student.student_name?.toLowerCase().includes(searchLower) ||
        student.email?.toLowerCase().includes(searchLower)
      );
    })
    .filter((student) => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'active') return isActive(student);
      if (statusFilter === 'stale') return isStale(student);
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = a.student_name || a.github_username;
        const nameB = b.student_name || b.github_username;
        return nameA.localeCompare(nameB);
      } else {
        return b.merged_prs_count - a.merged_prs_count;
      }
    });

  return (
    <div className="min-h-screen pb-20 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="space-y-8">
          <div className="glass-card rounded-3xl p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-4">
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  Student directory
                </span>
                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                    Student contributions hub
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                    Discover campus builders, track their open-source momentum, and keep everyone shipping together.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/admin/students"
                  className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-500"
                >
                  Add students
                </Link>
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center justify-center rounded-full border border-gray-200/70 px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100/80 dark:border-gray-800/70 dark:text-gray-100 dark:hover:bg-gray-800/70"
                >
                  View leaderboard
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="glass-card rounded-3xl p-6 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-blue-500/10"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">
                  {card.label}
                </p>
                <p className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">{card.value}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{card.caption}</p>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-3xl p-6 space-y-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="w-full lg:max-w-xl">
                <label htmlFor="search" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Search students
                </label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-5.2-5.2m1.7-4.3a7 7 0 1 0-7 7 7 7 0 0 0 7-7Z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full rounded-2xl border border-transparent bg-white/80 py-3 pl-10 pr-4 text-sm text-gray-900 shadow-sm shadow-blue-500/5 placeholder:text-gray-500 focus:border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:bg-gray-950/60 dark:text-white dark:placeholder:text-gray-500"
                    placeholder="Search by name, username, or email"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="inline-flex rounded-full bg-slate-100/80 p-1 dark:bg-slate-900/70">
                  <button
                    onClick={() => setSortBy('prs')}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                      sortBy === 'prs'
                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 dark:bg-white dark:text-slate-900'
                        : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    PRs
                  </button>
                  <button
                    onClick={() => setSortBy('name')}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                      sortBy === 'name'
                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 dark:bg-white dark:text-slate-900'
                        : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    Name
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value)}
                      className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                        statusFilter === option.value
                          ? 'bg-indigo-600 text-white shadow shadow-indigo-500/20'
                          : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-400">
              <span>
                Showing {filteredStudents.length} of {students.length} students
              </span>
              <span>
                Sorted by {sortBy === 'prs' ? 'merged pull requests' : 'name'}
                {statusFilter !== 'all' && ` · ${statusFilter === 'active' ? 'Synced last 7 days' : 'Needs sync'}`}
              </span>
            </div>
          </div>
        </section>

        <section className="mt-10">
          {loading ? (
            <div className="glass-card rounded-3xl p-8">
              <div className="space-y-4 animate-pulse">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200/70 dark:bg-gray-800/60" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/4 rounded bg-gray-200/70 dark:bg-gray-800/60" />
                      <div className="h-3 w-1/5 rounded bg-gray-200/70 dark:bg-gray-800/60" />
                    </div>
                    <div className="h-8 w-20 rounded-full bg-gray-200/70 dark:bg-gray-800/60" />
                  </div>
                ))}
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                No students match your filters
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {searchQuery
                  ? 'Try a different search or clear your filters to see the full roster.'
                  : 'Once students are synced, their profiles and contribution stats will appear here.'}
              </p>
            </div>
          ) : (
            <div className="glass-card overflow-hidden rounded-3xl">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200/70 dark:divide-gray-800/60">
                  <thead className="bg-white/80 dark:bg-gray-950/60">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
                        Student
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
                        Email
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
                        Merged PRs
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
                        Last sync
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/60 bg-white/60 dark:divide-gray-800/60 dark:bg-gray-950/50">
                    {filteredStudents.map((student) => {
                      const syncMeta = getSyncTone(student.last_sync);
                      return (
                        <tr
                          key={student.student_id}
                          className="transition hover:bg-blue-50/80 dark:hover:bg-blue-500/10"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-sm font-semibold text-white shadow shadow-blue-500/20">
                                {(student.student_name || student.github_username).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {student.student_name || student.github_username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">@{student.github_username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {student.email ? (
                              <p className="text-sm text-gray-700 dark:text-gray-200">{student.email}</p>
                            ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-100/80 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                                Not provided
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                              {student.merged_prs_count}
                              <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-emerald-400">
                                PRs
                              </span>
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${syncToneStyles[syncMeta.tone]}`}>
                              {syncMeta.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/students/${student.student_id}`}
                              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100/80 dark:border-slate-800/70 dark:text-slate-100 dark:hover:bg-slate-800/70"
                            >
                              View profile
                              <svg
                                viewBox="0 0 24 24"
                                className="h-4 w-4"
                                stroke="currentColor"
                                fill="none"
                                strokeWidth={1.8}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
