'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface PR {
  id: number;
  title: string;
  url: string;
  pr_number: number;
  created_at: string;
  updated_at: string;
}

interface Repository {
  id: number;
  owner: string;
  name: string;
  full_name: string;
  prs: PR[];
}

interface Organization {
  id: number;
  name: string;
  github_org_name: string;
  repositories: Repository[];
}

interface StudentDetails {
  student: {
    id: number;
    github_username: string;
    student_name: string | null;
    email: string | null;
  };
  summary: {
    total_merged_prs: number;
    total_organizations: number;
    total_repositories: number;
  };
  organizations: Organization[];
}

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [details, setDetails] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadStudentDetails();
    }
  }, [params.id]);

  const loadStudentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/students/${params.id}/prs`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Student not found');
        } else {
          setError('Failed to load student details');
        }
        return;
      }

      const data = await response.json();
      setDetails(data);
    } catch (err) {
      console.error('Error loading student details:', err);
      setError('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!details) return;

    try {
      setSyncing(true);
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: details.student.id }),
      });

      if (response.ok) {
        // Reload data after sync
        await loadStudentDetails();
      } else {
        alert('Sync failed. Please try again.');
      }
    } catch (err) {
      console.error('Error syncing:', err);
      alert('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-8"></div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <div className="text-red-500 dark:text-red-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {error || 'Student not found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The student you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/students"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Students
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <li>
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
                Home
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link href="/students" className="hover:text-blue-600 dark:hover:text-blue-400">
                Students
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900 dark:text-white font-medium">
              {details.student.student_name || details.student.github_username}
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl mr-4">
                {(details.student.student_name || details.student.github_username)
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {details.student.student_name || details.student.github_username}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  @{details.student.github_username}
                </p>
                {details.student.email && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    {details.student.email}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/students"
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                ← Back
              </Link>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {details.summary.total_merged_prs}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Total PRs Merged</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {details.summary.total_organizations}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Organizations</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {details.summary.total_repositories}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Repositories</div>
          </div>
        </div>

        {/* PRs Organized by Organization and Repository */}
        {details.summary.total_merged_prs === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No merged pull requests yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This student hasn't merged any PRs yet. Click "Sync Now" to refresh data from GitHub.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Merged Pull Requests
            </h2>

            {details.organizations.map((org) => (
              <div
                key={org.id || org.name}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
              >
                {/* Organization Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                    {org.name}
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">
                    {org.repositories.length} {org.repositories.length === 1 ? 'repository' : 'repositories'}
                  </p>
                </div>

                {/* Repositories */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {org.repositories.map((repo) => (
                    <div key={repo.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <svg
                              className="w-5 h-5 mr-2 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            {repo.name}
                          </h4>
                          <a
                            href={`https://github.com/${repo.full_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {repo.full_name} →
                          </a>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                          {repo.prs.length} {repo.prs.length === 1 ? 'PR' : 'PRs'}
                        </span>
                      </div>

                      {/* Pull Requests List */}
                      <div className="space-y-3">
                        {repo.prs.map((pr) => (
                          <div
                            key={pr.id}
                            className="flex items-start bg-gray-50 dark:bg-gray-900 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex-shrink-0 mt-1">
                              <svg
                                className="w-5 h-5 text-purple-600 dark:text-purple-400"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M13 3a3 3 0 00-3 3v1H7a3 3 0 00-3 3v10a2 2 0 002 2h12a2 2 0 002-2V10a3 3 0 00-3-3h-3V6a3 3 0 00-3-3zm-1 4V6a1 1 0 112 0v1h-2zm-2 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" />
                              </svg>
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <a
                                href={pr.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                {pr.title}
                              </a>
                              <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <span className="font-mono">#{pr.pr_number}</span>
                                <span className="mx-2">•</span>
                                <span>Merged on {formatDate(pr.updated_at)}</span>
                              </div>
                            </div>
                            <a
                              href={pr.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-4 flex-shrink-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
