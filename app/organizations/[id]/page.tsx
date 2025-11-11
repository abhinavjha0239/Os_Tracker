'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface PR {
  id: number;
  title: string;
  url: string;
  pr_number: number;
  created_at: string;
  updated_at: string;
  student: {
    id: number;
    github_username: string;
    student_name: string | null;
  };
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  prs: PR[];
}

interface Student {
  id: number;
  github_username: string;
  student_name: string | null;
  merged_prs_count: number;
}

interface OrganizationDetails {
  organization: {
    id: number;
    name: string;
    github_org_name: string;
  };
  summary: {
    total_repositories: number;
    total_students: number;
    total_merged_prs: number;
  };
  repositories: Repository[];
  students: Student[];
}

export default function OrganizationDetailsPage() {
  const params = useParams();
  const [details, setDetails] = useState<OrganizationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'repos' | 'students'>('repos');

  const loadOrganizationDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/organizations/${params.id}/details`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Organization not found');
        } else {
          setError('Failed to load organization details');
        }
        return;
      }

      const data = await response.json();
      setDetails(data);
    } catch (err) {
      console.error('Error loading organization details:', err);
      setError('Failed to load organization details');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      loadOrganizationDetails();
    }
  }, [params.id, loadOrganizationDetails]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="glass-card rounded-2xl p-8">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
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
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="text-red-500 mb-4">
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Organization not found'}
            </h3>
            <p className="text-gray-600 mb-6">
              The organization you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/organizations"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pastel-lavender to-pastel-sky text-white rounded-lg hover:from-pastel-lavender/90 hover:to-pastel-sky/90 transition-all"
            >
              ← Back to Organizations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li>
              <Link href="/" className="hover:text-primary-600 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link href="/organizations" className="hover:text-primary-600 transition-colors">
                Organizations
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900 font-medium">
              {details.organization.name}
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="glass-card rounded-2xl p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-20 h-20 bg-gradient-to-br from-pastel-sky to-pastel-lavender rounded-2xl flex items-center justify-center text-white font-bold text-3xl mr-4 shadow-lg">
                {details.organization.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  {details.organization.name}
                </h1>
                <p className="text-lg text-gray-600">
                  @{details.organization.github_org_name}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/organizations"
                className="px-4 py-2 bg-white/70 text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
              >
                ← Back
              </Link>
              <Link
                href={`https://github.com/${details.organization.github_org_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-md"
              >
                View on GitHub →
              </Link>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {details.summary.total_repositories}
            </div>
            <div className="text-gray-600">Total Repositories</div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {details.summary.total_students}
            </div>
            <div className="text-gray-600">Total Students</div>
          </div>
          <div className="glass-card rounded-2xl p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {details.summary.total_merged_prs}
            </div>
            <div className="text-gray-600">PRs Merged</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => setActiveTab('repos')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'repos'
                  ? 'bg-white text-primary-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Repositories ({details.repositories.length})
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'students'
                  ? 'bg-white text-primary-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Students ({details.students.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'repos' ? (
          details.repositories.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="text-gray-400 mb-4">
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
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No repositories yet
              </h3>
              <p className="text-gray-600">
                No repositories have been added to this organization.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {details.repositories.map((repo) => (
                <div key={repo.id} className="glass-card rounded-2xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          {repo.name}
                        </h3>
                        <a
                          href={`https://github.com/${repo.full_name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:underline"
                        >
                          {repo.full_name} →
                        </a>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pastel-mint/20 text-green-700">
                        {repo.prs.length} {repo.prs.length === 1 ? 'PR' : 'PRs'}
                      </span>
                    </div>

                    {/* Pull Requests */}
                    {repo.prs.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">Recent Pull Requests:</h4>
                        {repo.prs.map((pr) => (
                          <div
                            key={pr.id}
                            className="flex items-start bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-shrink-0 mt-1">
                              <svg
                                className="w-5 h-5 text-purple-600"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M13 3a3 3 0 00-3 3v1H7a3 3 0 00-3 3v10a2 2 0 002 2h12a2 2 0 002-2V10a3 3 0 00-3-3h-3V6a3 3 0 00-3-3zm-1 4V6a1 1 0 112 0v1h-2zm-2 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" />
                              </svg>
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <a
                                    href={pr.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-gray-900 hover:text-primary-600"
                                  >
                                    {pr.title}
                                  </a>
                                  <div className="mt-1 flex items-center text-xs text-gray-500">
                                    <span className="font-mono">#{pr.pr_number}</span>
                                    <span className="mx-2">•</span>
                                    <span>by @{pr.student.github_username}</span>
                                    <span className="mx-2">•</span>
                                    <span>{formatDate(pr.updated_at)}</span>
                                  </div>
                                </div>
                                <a
                                  href={pr.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-4 flex-shrink-0 text-primary-600 hover:text-primary-700"
                                >
                                  <svg
                                    className="w-4 h-4"
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
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          details.students.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <div className="text-gray-400 mb-4">
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No students yet
              </h3>
              <p className="text-gray-600">
                No students have contributed to this organization yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {details.students.map((student) => (
                <div key={student.id} className="glass-card rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pastel-lavender to-pastel-sky rounded-xl flex items-center justify-center text-white font-bold">
                      {(student.student_name || student.github_username).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {student.student_name || student.github_username}
                      </h3>
                      <p className="text-sm text-gray-600">@{student.github_username}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Merged PRs</p>
                        <p className="text-2xl font-bold text-gray-900">{student.merged_prs_count}</p>
                      </div>
                      <Link
                        href={`https://github.com/${student.github_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                          <path d="M12 2C6.477 2 2 6.477 2 12c0 4.419 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                        GitHub
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}