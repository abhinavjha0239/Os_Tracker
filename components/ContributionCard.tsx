import React from 'react';
import Link from 'next/link';

export interface ContributionMeta {
  label: string;
  chipClass: string;
  iconWrapper: string;
  icon: React.ReactElement;
}

export const contributionTypeMeta: Record<
  'pull_request' | 'commit' | 'issue',
  ContributionMeta
> = {
  pull_request: {
    label: 'Pull Request',
    chipClass: 'badge-pastel-mint',
    iconWrapper: 'bg-pastel-mint/30 text-success-dark',
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
    chipClass: 'badge-pastel-sky',
    iconWrapper: 'bg-pastel-sky/30 text-info-dark',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" fill="none" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="3.5" />
        <path strokeLinecap="round" d="M3 12h5m8 0h5" />
      </svg>
    ),
  },
  issue: {
    label: 'Issue',
    chipClass: 'badge-pastel-peach',
    iconWrapper: 'bg-pastel-peach/30 text-warning-dark',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" fill="none" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
};

interface ContributionCardProps {
  contribution: {
    id: string | number;
    type: 'pull_request' | 'commit' | 'issue';
    title: string | null;
    url: string;
    created_at: string;
    student_id: number;
    student_display_name: string;
    github_username: string;
    owner: string;
    repo_name: string;
  };
  formatRelativeTime?: (date: string) => string;
  compact?: boolean;
}

export default function ContributionCard({
  contribution,
  formatRelativeTime,
  compact = false
}: ContributionCardProps) {
  const meta = contributionTypeMeta[contribution.type] ?? contributionTypeMeta.pull_request;
  const repoLabel = `${contribution.owner}/${contribution.repo_name}`;

  const defaultFormatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const timeFormatter = formatRelativeTime || defaultFormatTime;

  if (compact) {
    return (
      <a
        href={contribution.url}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-3 rounded-xl glass-card glass-card-hover px-3 py-2"
      >
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.iconWrapper}`}>
          {React.cloneElement(meta.icon, { className: 'h-4 w-4' })}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">
            {contribution.title || `${meta.label} on ${repoLabel}`}
          </p>
          <p className="text-xs text-gray-500">
            by @{contribution.github_username} · {timeFormatter(contribution.created_at)}
          </p>
        </div>
      </a>
    );
  }

  return (
    <a
      href={contribution.url}
      target="_blank"
      rel="noreferrer"
      className="group block rounded-2xl glass-card glass-card-hover px-4 py-4"
    >
      <div className="flex items-start gap-4">
        <div className={`mt-1 flex h-10 w-10 items-center justify-center rounded-xl ${meta.iconWrapper}`}>
          {meta.icon}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="flex-1 text-base font-semibold text-gray-800">
              {contribution.title || `${meta.label} on ${repoLabel}`}
            </p>
            <span className="text-xs font-medium text-gray-500">
              {timeFormatter(contribution.created_at)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <Link
              href={`/students/${contribution.student_id}`}
              className="inline-flex items-center gap-1 rounded-full bg-pastel-lavender/20 px-3 py-1 font-medium text-gray-700 transition hover:bg-pastel-lavender/30"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="h-2 w-2 rounded-full bg-primary-500" />
              {contribution.student_display_name}
              <span className="text-gray-500">@{contribution.github_username}</span>
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full bg-pastel-pearl/50 px-3 py-1 font-medium text-gray-700">
              <svg viewBox="0 0 24 24" className="h-4 w-4" stroke="currentColor" fill="none" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16M4 12h16M4 19h16" />
              </svg>
              {repoLabel}
            </span>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${meta.chipClass}`}>
              {React.cloneElement(meta.icon, { className: 'h-4 w-4' })}
              {meta.label}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}