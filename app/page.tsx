'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatsCard from '@/components/StatsCard';
import ContributionCard from '@/components/ContributionCard';
import { useDashboardData } from '@/hooks/useDashboardData';

const numberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function formatNumber(value: number | undefined) {
  if (value === undefined || value === null) return '0';
  return numberFormatter.format(value);
}

export default function DashboardPage() {
  const { data, loading, error } = useDashboardData();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Quick action cards with pastel colors
  const quickActions = [
    {
      title: 'Add Student',
      description: 'Register a new student to track',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" fill="none" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
      href: '/admin/students',
      colorClass: 'pastel-card-lavender'
    },
    {
      title: 'Sync Data',
      description: 'Update contributions from GitHub',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" fill="none" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15" />
        </svg>
      ),
      href: '/admin/students',
      colorClass: 'pastel-card-mint'
    },
    {
      title: 'Manage Orgs',
      description: 'Add or edit organizations',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" fill="none" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
        </svg>
      ),
      href: '/admin/organizations',
      colorClass: 'pastel-card-sky'
    },
    {
      title: 'View Leaderboard',
      description: 'See top contributors',
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" fill="none" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
      href: '/leaderboard',
      colorClass: 'pastel-card-peach'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          {greeting}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here&apos;s your OS Tracker dashboard overview
        </p>
        {error && (
          <div className="mt-4 rounded-lg border border-error/30 bg-error-light/50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Active Students"
          value={formatNumber(data?.totalStudents)}
          caption={data?.activeThisWeek ? `${data.activeThisWeek} synced this week` : 'No syncs this week'}
          loading={loading}
          icon={
            <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" fill="none" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm13 14v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          trend={data?.activeThisWeek && data?.totalStudents ? {
            value: Math.round((data.activeThisWeek / data.totalStudents) * 100),
            label: 'active rate',
            isPositive: true
          } : undefined}
        />
        <StatsCard
          label="Merged PRs"
          value={formatNumber(data?.totalMergedPRs)}
          caption="Across all repositories"
          loading={loading}
          icon={
            <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" fill="none" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10l1 1v8l-1 1H7l-1-1V8l1-1zm3-3h4v3m-2 2v6m-3-3h6" />
            </svg>
          }
        />
        <StatsCard
          label="Organizations"
          value={formatNumber(data?.totalOrganizations)}
          caption={data?.topOrganizations?.[0] ? `${data.topOrganizations[0].name} leading` : 'No orgs yet'}
          loading={loading}
          icon={
            <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" fill="none" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
            </svg>
          }
        />
        <StatsCard
          label="30-Day Activity"
          value={formatNumber(data?.contributionsLast30Days)}
          caption={`${formatNumber(data?.totalTrackedContributions)} total tracked`}
          loading={loading}
          icon={
            <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" fill="none" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className={`group relative overflow-hidden rounded-xl ${action.colorClass} p-4 transition-all hover:shadow-lg glass-card-hover`}
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/50 text-gray-700">
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-800">
                {action.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {action.description}
              </p>
              <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" stroke="currentColor" fill="none" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Recent Activity
              </h2>
              <Link
                href="/organizations"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, idx) => (
                    <div
                      key={idx}
                      className="h-20 rounded-xl border border-gray-200/30 bg-white/40 animate-pulse"
                    />
                  ))}
                </div>
              ) : data && data.recentContributions.length > 0 ? (
                data.recentContributions.slice(0, 5).map((contribution) => (
                  <ContributionCard
                    key={contribution.id}
                    contribution={contribution}
                    compact
                  />
                ))
              ) : (
                <div className="rounded-xl border-2 border-dashed border-pastel-lavender/30 bg-gradient-to-br from-pastel-lavender/10 to-pastel-sky/10 p-8 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    No activity yet
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Add students and sync their repositories to see activity
                  </p>
                  <Link
                    href="/admin/students"
                    className="mt-4 inline-flex items-center rounded-lg btn-pastel-primary px-3 py-1.5 text-xs font-medium"
                  >
                    Add Students
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Contributors */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Top Contributors
              </h2>
              <Link
                href="/leaderboard"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {loading ? (
                [...Array(5)].map((_, idx) => (
                  <div key={idx} className="h-12 rounded-lg bg-gray-100/50 animate-pulse" />
                ))
              ) : data && data.topStudents.length > 0 ? (
                data.topStudents.slice(0, 5).map((student, index) => (
                  <Link
                    key={student.student_id}
                    href={`/students/${student.student_id}`}
                    className="group flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition hover:border-pastel-lavender/30 hover:bg-pastel-lavender/10"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                        index === 0
                          ? 'bg-gradient-to-br from-pastel-peach to-pastel-coral text-gray-700'
                          : index === 1
                          ? 'bg-gradient-to-br from-pastel-sky to-info text-gray-700'
                          : index === 2
                          ? 'bg-gradient-to-br from-pastel-mint to-success text-gray-700'
                          : 'bg-pastel-pearl text-gray-600'
                      }`}
                    >
                      {student.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {student.student_name || student.github_username}
                      </p>
                      <p className="text-xs text-gray-500">
                        @{student.github_username}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-success-dark">
                      {student.merged_prs_count} PRs
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No data yet
                </p>
              )}
            </div>
          </div>

          {/* Organizations */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Organizations
              </h2>
              <Link
                href="/organizations"
                className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {loading ? (
                [...Array(3)].map((_, idx) => (
                  <div key={idx} className="h-12 rounded-lg bg-gray-100/50 animate-pulse" />
                ))
              ) : data && data.topOrganizations.length > 0 ? (
                data.topOrganizations.slice(0, 3).map((org) => (
                  <Link
                    key={org.id}
                    href={`/organizations/${org.id}`}
                    className="group flex items-center justify-between gap-2 rounded-lg border border-transparent px-2 py-2 transition hover:border-pastel-sky/30 hover:bg-pastel-sky/10"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {org.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {org.student_count} members · {org.merged_prs_count} PRs
                      </p>
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 text-gray-400 opacity-0 transition group-hover:opacity-100"
                      stroke="currentColor"
                      fill="none"
                      strokeWidth={1.8}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No organizations yet
                </p>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              System Status
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-success-dark">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">GitHub API</span>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-success-dark">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Sync</span>
                <span className="text-sm font-medium text-gray-800">
                  {data?.activeThisWeek ? 'This week' : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}