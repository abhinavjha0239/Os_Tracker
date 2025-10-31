'use client';

import { type JSX } from 'react';
import Link from 'next/link';
import { useDashboardData } from '@/hooks/useDashboardData';

const contributionTypeMeta: Record<
  'pull_request' | 'commit' | 'issue',
  {
    label: string;
    chipClass: string;
    iconWrapper: string;
    icon: JSX.Element;
  }
> = {
  pull_request: {
    label: 'Pull Request',
    chipClass:
      'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    iconWrapper: 'bg-emerald-500/15 text-emerald-500',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" fill="none" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 6a3 3 0 1 1-2.193-2.89c.203-.056.416.094.416.304v9.031A4 4 0 0 0 9 16h4.586l-1.293-1.293a1 1 0 0 1 1.414-1.414l3.004 3.004a1 1 0 0 1 0 1.414l-3.004 3.004a1 1 0 0 1-1.414-1.414L13.586 18H9a6 6 0 0 1-4-10.659Z"
        />
      </svg>
    ),
  },
  commit: {
    label: 'Commit',
    chipClass: 'bg-blue-100/80 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    iconWrapper: 'bg-blue-500/15 text-blue-500',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" fill="none" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="3.5" />
        <path strokeLinecap="round" d="M3 12h5m8 0h5" />
      </svg>
    ),
  },
  issue: {
    label: 'Issue',
    chipClass: 'bg-amber-100/80 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    iconWrapper: 'bg-amber-500/15 text-amber-500',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" fill="none" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
};

const featureHighlights = [
  {
    title: 'Live Contribution Radar',
    description:
      'Monitor new commits, pull requests, and issues in real time so mentors can jump in with feedback while momentum is hot.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" fill="none" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5V3m0 18v-2m7-7h2M3 12h2m13.07-6.07l1.42-1.42M4.51 19.49l1.42-1.42m0-10.56L4.51 6.07m14.98 13.42-1.42-1.42M12 7a5 5 0 1 0 5 5" />
      </svg>
    ),
  },
  {
    title: 'Organization Health Cards',
    description:
      'Spot clubs that need help with onboarding, keep track of repository growth, and celebrate the teams who are shipping the most.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" fill="none" strokeWidth={1.6}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4h16a1 1 0 0 1 1 1v4H3V5a1 1 0 0 1 1-1Zm-1 7h18v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8Zm5 3v5m5-5v5m5-5v5"
        />
      </svg>
    ),
  },
  {
    title: 'Student Spotlight Engine',
    description:
      'Automatically surface rising stars based on consistent impact, so you never miss a great story for newsletters or showcases.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" fill="none" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 9.5 9l-5.5.5 4.2 3.5-1.3 5.5L12 16l5.1 2.5-1.3-5.5 4.2-3.5L14.5 9z" />
      </svg>
    ),
  },
];

const numberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function formatNumber(value: number | undefined) {
  if (value === undefined || value === null) return '—';
  return numberFormatter.format(value);
}

function formatRelativeTime(value: string | null) {
  if (!value) return 'moments ago';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'moments ago';

  const diff = Date.now() - date.getTime();
  const absolute = Math.abs(diff);
  const units: Array<[number, string]> = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.34524, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ];

  let duration = absolute / 1000;
  let unit = 'second';

  for (const [threshold, nextUnit] of units) {
    if (duration < threshold) {
      unit = nextUnit;
      break;
    }
    duration /= threshold;
  }

  const rounded = Math.max(1, Math.floor(duration));
  const suffix = diff >= 0 ? 'ago' : 'from now';
  const shortUnit = unit[0];
  return `${rounded}${shortUnit} ${suffix}`;
}

export default function HomePage() {
  const { data, loading, error } = useDashboardData();

  const statCards = data
    ? [
        {
          label: 'Active contributors',
          value: formatNumber(data.totalStudents),
          caption:
            data.activeThisWeek > 0
              ? `${data.activeThisWeek} synced in the last 7 days`
              : 'Waiting for the first sync this week',
        },
        {
          label: 'Merged pull requests',
          value: formatNumber(data.totalMergedPRs),
          caption: 'Across tracked student repositories',
        },
        {
          label: 'Organizations onboarded',
          value: formatNumber(data.totalOrganizations),
          caption:
            data.topOrganizations?.[0]
              ? `${data.topOrganizations[0].name} is leading this week`
              : 'Clubs, chapters, and project teams',
        },
        {
          label: 'Activity (last 30 days)',
          value: formatNumber(data.contributionsLast30Days),
          caption: `${formatNumber(data.totalTrackedContributions)} recent contributions logged`,
        },
      ]
    : new Array(4).fill(null);

  return (
    <div className="pb-24">
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/85 dark:bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-lg shadow-indigo-500/10 ring-1 ring-slate-200/70 dark:ring-slate-800/70">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live across campus · {data ? `${data.totalStudents} students` : 'loading'}
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
                Celebrate every pull request shipped by your developer community.
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl">
                OS Tracker brings together your students, clubs, and projects into one beautiful dashboard.
                Track momentum, unblock contributors faster, and showcase impact with confidence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Link
                href="/leaderboard"
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
              >
                View live leaderboard
              </Link>
              <Link
                href="/students"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-base font-semibold text-slate-700 dark:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition"
              >
                Explore student profiles
              </Link>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200/70 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
            )}
          </div>

          <div className="glass-card relative overflow-hidden rounded-3xl bg-white/95 dark:bg-slate-950/70 p-8">
            <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-indigo-300/20 blur-3xl" />
            <div className="absolute bottom-[-50px] left-[-40px] h-48 w-48 rounded-full bg-rose-200/15 blur-3xl" />
            <div className="relative space-y-6">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
                  Community pulse
                </h2>
                <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">
                  {data ? `${formatNumber(data.totalMergedPRs)} merged PRs` : 'Loading insights...'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Keep an eye on velocity, highlight wins, and make retrospectives effortless.
                </p>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center justify-between rounded-2xl bg-white/95 dark:bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-200">
                  <span>Clubs synced this week</span>
                  <span className="text-base font-semibold text-blue-600 dark:text-blue-400">
                    {data ? formatNumber(data.activeThisWeek) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/95 dark:bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-200">
                  <span>Top organization</span>
                  <span className="text-base font-semibold text-purple-600 dark:text-purple-300">
                    {data?.topOrganizations?.[0]?.name ?? 'Loading...'}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/95 dark:bg-slate-900/60 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-200">
                  <span>Activity (30 days)</span>
                  <span className="text-base font-semibold text-emerald-600 dark:text-emerald-300">
                    {data ? formatNumber(data.contributionsLast30Days) : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className="glass-card rounded-3xl bg-white/95 dark:bg-slate-950/70 p-6 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-indigo-500/10"
            >
              {card ? (
                <>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                    {card.label}
                  </p>
                  <p className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">{card.value}</p>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{card.caption}</p>
                </>
              ) : (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 w-24 rounded bg-gray-200/70 dark:bg-gray-800/70" />
                  <div className="h-8 w-32 rounded bg-gray-200/70 dark:bg-gray-800/70" />
                  <div className="h-4 w-40 rounded bg-gray-200/70 dark:bg-gray-800/70" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          <div className="glass-card rounded-3xl p-6 lg:col-span-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="section-heading flex items-center gap-2">
                  <span className="text-2xl">🔥</span> Recent Activity
                </h2>
                <p className="muted-copy">
                  The freshest contributions flowing through your campus repos.
                </p>
              </div>
              <Link
                href="/organizations"
                className="inline-flex items-center justify-center rounded-full border border-transparent bg-gray-900/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900"
              >
                View organizations
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, idx) => (
                    <div
                      key={idx}
                      className="h-20 rounded-2xl border border-gray-200/60 bg-white/60 dark:border-gray-800/60 dark:bg-gray-950/60 animate-pulse"
                    />
                  ))}
                </div>
              ) : data && data.recentContributions.length > 0 ? (
                data.recentContributions.map((entry) => {
                  const meta = contributionTypeMeta[entry.type] ?? contributionTypeMeta.pull_request;
                  const repoLabel = `${entry.owner}/${entry.repo_name}`;
                  return (
                    <a
                      key={entry.id}
                      href={entry.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group block rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-4 transition hover:border-indigo-200 hover:bg-indigo-50/80 dark:border-slate-800/60 dark:bg-slate-950/70 dark:hover:border-indigo-900/40 dark:hover:bg-indigo-500/10"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-xl ${meta.iconWrapper}`}>
                          {meta.icon}
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                            <p className="flex-1 text-base font-semibold text-gray-900 dark:text-white">
                              {entry.title || `${meta.label} on ${repoLabel}`}
                            </p>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {formatRelativeTime(entry.created_at)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                            <Link
                              href={`/students/${entry.student_id}`}
                              className="inline-flex items-center gap-1 rounded-full bg-slate-100/80 px-3 py-1 font-medium text-slate-700 transition group-hover:bg-white dark:bg-slate-800/70 dark:text-slate-200"
                            >
                              <span className="h-2 w-2 rounded-full bg-blue-500" />
                              {entry.student_display_name}
                              <span className="text-gray-400">@{entry.github_username}</span>
                            </Link>
                            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100/80 px-3 py-1 font-medium text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
                              <svg viewBox="0 0 24 24" className="h-4 w-4" stroke="currentColor" fill="none" strokeWidth={1.8}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16M4 12h16M4 19h16" />
                              </svg>
                              {repoLabel}
                            </span>
                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${meta.chipClass}`}>
                              {meta.icon}
                              {meta.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300/70 bg-white/70 p-10 text-center dark:border-gray-700/80 dark:bg-gray-950/60">
                  <p className="text-base font-medium text-gray-700 dark:text-gray-200">
                    No activity just yet. Trigger a sync to populate the feed.
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Use the admin console to connect student repositories and start tracking contributions.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-3xl bg-white/95 dark:bg-slate-950/70 p-6">
              <h2 className="section-heading text-2xl">Top Students</h2>
              <p className="muted-copy">Celebrating the builders shipping the most impact this cycle.</p>
              <div className="mt-6 space-y-4">
                {loading ? (
                  [...Array(5)].map((_, idx) => (
                    <div key={idx} className="h-16 rounded-2xl bg-gray-100/70 dark:bg-gray-900/60 animate-pulse" />
                  ))
                ) : data && data.topStudents.length > 0 ? (
                  data.topStudents.map((entry) => (
                    <Link
                      key={entry.student_id}
                      href={`/students/${entry.student_id}`}
                      className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/80 dark:border-slate-800/60 dark:bg-slate-950/60 dark:hover:border-indigo-900/40 dark:hover:bg-indigo-500/10"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold">
                        {entry.rank}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {entry.student_name || entry.github_username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{entry.github_username}</p>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        {entry.merged_prs_count} PRs
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 text-gray-400 transition group-hover:text-blue-500"
                        stroke="currentColor"
                        fill="none"
                        strokeWidth={1.8}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No leaderboard data yet.</p>
                )}
              </div>
            </div>

            <div className="glass-card rounded-3xl bg-white/95 dark:bg-slate-950/70 p-6">
              <h2 className="section-heading text-2xl">Trending Organizations</h2>
              <p className="muted-copy">Clubs and chapters driving campus-wide impact.</p>
              <div className="mt-6 space-y-4">
                {loading ? (
                  [...Array(4)].map((_, idx) => (
                    <div key={idx} className="h-14 rounded-2xl bg-gray-100/70 dark:bg-gray-900/60 animate-pulse" />
                  ))
                ) : data && data.topOrganizations.length > 0 ? (
                  data.topOrganizations.map((org) => (
                    <Link
                      key={org.id}
                      href={`/organizations/${org.id}`}
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white/95 px-4 py-3 transition hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/80 dark:border-slate-800/60 dark:bg-slate-950/60 dark:hover:border-violet-900/40 dark:hover:bg-violet-500/10"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{org.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">@{org.github_org_name}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100/80 px-3 py-1 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300">
                          {org.merged_prs_count} PRs
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100/80 px-3 py-1 dark:bg-gray-800/70">
                          {org.student_count} members
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No organizations synced yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="grid gap-6 md:grid-cols-3">
          {featureHighlights.map((feature) => (
            <div
              key={feature.title}
              className="glass-card flex h-full flex-col justify-between rounded-3xl bg-white/95 dark:bg-slate-950/70 p-6 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10"
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                {feature.icon}
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="glass-card flex flex-col gap-6 rounded-3xl bg-white/95 dark:bg-slate-950/70 p-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">
              Ready to grow your open-source guild?
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400">
              Sync your student roster, invite maintainers, and keep the shipping energy high.
              OS Tracker is the operating system for your campus developer community.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/students"
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
            >
              Go to admin console
            </Link>
            <Link
              href="/admin/organizations"
              className="inline-flex items-center justify-center rounded-full border border-slate-200/80 px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-100/80 dark:border-slate-800/70 dark:text-slate-100 dark:hover:bg-slate-800/60"
            >
              Configure organizations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}