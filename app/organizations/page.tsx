'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const numberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const formatNumber = (value: number) => numberFormatter.format(value);

interface OrganizationStat {
  id: number;
  name: string;
  github_org_name: string;
  student_count: number;
  repo_count: number;
  merged_prs_count: number;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<OrganizationStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'prs' | 'students'>('prs');
  const [sizeFilter, setSizeFilter] = useState<'all' | 'emerging' | 'established'>('all');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/organizations/stats');
      const data = await response.json();
      setOrganizations(data);
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalMergedPRs = organizations.reduce((sum, org) => sum + (org.merged_prs_count || 0), 0);
  const totalStudents = organizations.reduce((sum, org) => sum + (org.student_count || 0), 0);
  const averageMembers = organizations.length ? totalStudents / organizations.length : 0;
  const topOrganization = organizations[0];

  const summaryCards = [
    {
      label: 'Organizations tracked',
      value: formatNumber(organizations.length),
      caption:
        organizations.length > 0
          ? `${formatNumber(totalStudents)} students across all clubs`
          : 'Connect your first organization to begin',
    },
    {
      label: 'Merged pull requests',
      value: formatNumber(totalMergedPRs),
      caption: 'Total contributions from organization repos',
    },
    {
      label: 'Average members',
      value: organizations.length ? averageMembers.toFixed(1) : '0.0',
      caption: 'Active student contributors per organization',
    },
    {
      label: 'Top organization',
      value: topOrganization ? topOrganization.name : '—',
      caption: topOrganization
        ? `${formatNumber(topOrganization.merged_prs_count)} merged PRs`
        : 'No standout teams yet',
    },
  ];

  const sizeOptions = [
    { value: 'all' as const, label: 'All sizes' },
    { value: 'emerging' as const, label: 'Emerging (<6 members)' },
    { value: 'established' as const, label: 'Established (6+)' },
  ];

  const sortOptions = [
    { value: 'prs' as const, label: 'PRs' },
    { value: 'students' as const, label: 'Members' },
    { value: 'name' as const, label: 'Name' },
  ];

  const filteredOrganizations = organizations
    .filter((org) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        org.name.toLowerCase().includes(searchLower) ||
        org.github_org_name.toLowerCase().includes(searchLower)
      );
    })
    .filter((org) => {
      if (sizeFilter === 'all') return true;
      if (sizeFilter === 'emerging') return org.student_count <= 5;
      if (sizeFilter === 'established') return org.student_count > 5;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'students') {
        return b.student_count - a.student_count;
      } else {
        return b.merged_prs_count - a.merged_prs_count;
      }
    });

  return (
    <div className="min-h-screen pb-20 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="space-y-8">
          <div className="glass-card rounded-3xl bg-white/95 dark:bg-slate-950/70 p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-4">
                <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                  Club ecosystem
                </span>
                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                    Organizations powering your campus projects
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                    See which teams are shipping, how many students they mentor, and where to focus your enablement efforts next.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/admin/organizations"
                  className="inline-flex items-center justify-center rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:bg-purple-500"
                >
                  Add organization
                </Link>
                <Link
                  href="/students"
                  className="inline-flex items-center justify-center rounded-full border border-gray-200/70 px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100/80 dark:border-gray-800/70 dark:text-gray-100 dark:hover:bg-gray-800/70"
                >
                  View roster
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="glass-card rounded-3xl bg-white/95 dark:bg-slate-950/70 p-6 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-violet-500/10"
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
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="w-full lg:max-w-xl">
                <label htmlFor="search" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Search organizations
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
                    className="block w-full rounded-2xl border border-transparent bg-white/80 py-3 pl-10 pr-4 text-sm text-gray-900 shadow-sm shadow-purple-500/5 placeholder:text-gray-500 focus:border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30 dark:bg-gray-950/60 dark:text-white dark:placeholder:text-gray-500"
                    placeholder="Search by organization or GitHub handle"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="inline-flex rounded-full bg-slate-100/80 p-1 dark:bg-slate-900/70">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                        sortBy === option.value
                          ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 dark:bg-white dark:text-slate-900'
                          : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSizeFilter(option.value)}
                      className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                        sizeFilter === option.value
                          ? 'bg-violet-600 text-white shadow shadow-violet-500/20'
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
                Showing {filteredOrganizations.length} of {organizations.length} organizations
              </span>
              <span>
                Sorted by {sortBy === 'prs' ? 'merged PRs' : sortBy === 'students' ? 'members' : 'name'}
                {sizeFilter !== 'all' && ` · ${sizeFilter === 'emerging' ? 'Emerging teams' : 'Established teams'}`}
              </span>
            </div>
          </div>
        </section>

        <section className="mt-10">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card h-full rounded-3xl bg-white/80 p-6 animate-pulse">
                  <div className="h-5 w-3/4 rounded bg-gray-200/70 dark:bg-gray-800/60" />
                  <div className="mt-4 h-4 w-1/2 rounded bg-gray-200/70 dark:bg-gray-800/60" />
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    {[...Array(3)].map((__, idx) => (
                      <div key={idx} className="h-12 rounded-lg bg-gray-200/70 dark:bg-gray-800/60" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : filteredOrganizations.length === 0 ? (
            <div className="glass-card rounded-3xl bg-white/95 dark:bg-slate-950/70 p-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17l-5-5 5-5M15 7l5 5-5 5" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                No organizations match your filters
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {searchQuery
                  ? 'Try a different search or clear filters to view all campus organizations.'
                  : 'Connect organizations via the admin console to populate this view.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredOrganizations.map((org) => (
                <div
                  key={org.id}
                  className="glass-card flex h-full flex-col justify-between rounded-3xl bg-white/95 dark:bg-slate-950/70 p-6 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/10"
                >
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-500">
                        @{org.github_org_name}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                        {org.name}
                      </h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-2xl bg-purple-500/10 p-4 text-center">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                          {org.merged_prs_count}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.25em] text-purple-400">PRs</p>
                      </div>
                      <div className="rounded-2xl bg-blue-500/10 p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                          {org.student_count}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.25em] text-blue-400">Members</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-500/10 p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">
                          {org.repo_count}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-400">Repos</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/organizations/${org.id}`}
                    className="mt-6 inline-flex items-center justify-center rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
                  >
                    View organization
                    <svg
                      viewBox="0 0 24 24"
                      className="ml-2 h-4 w-4"
                      stroke="currentColor"
                      fill="none"
                      strokeWidth={1.8}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
