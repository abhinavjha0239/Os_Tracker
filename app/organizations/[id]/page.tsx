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
              {error || 'Organization not found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The organization you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/organizations"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Organizations
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
              <Link href="/organizations" className="hover:text-blue-600 dark:hover:text-blue-400">
                Organizations
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900 dark:text-white font-medium">
              {details.organization.name}
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-sm p-8 mb-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {details.organization.name}
              </h1>
              <a
                href={`https://github.com/${details.organization.github_org_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg text-blue-100 hover:text-white inline-flex items-center"
              >
                @{details.organization.github_org_name}
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <Link
              href="/organizations"
              className="mt-4 md:mt-0 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              ← Back
            </Link>
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
              {details.summary.total_students}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Contributing Students</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {details.summary.total_repositories}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Repositories</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('repos')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'repos'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Repositories ({details.repositories.length})
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'students'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Students ({details.students.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'repos' ? (
          <div className="space-y-6">
            {details.repositories.length === 0 ? (
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
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No repositories yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This organization doesn&apos;t have any tracked repositories yet.
                </p>
              </div>
            ) : (
              details.repositories.map((repo) => (
                <div
                  key={repo.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
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
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {repo.full_name} →
                        </a>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                        {repo.prs.length} {repo.prs.length === 1 ? 'PR' : 'PRs'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
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
                            <div className="mt-1 flex items-center flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-mono">#{pr.pr_number}</span>
                              <span>•</span>
                              <Link
                                href={`/students/${pr.student.id}`}
                                className="hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                {pr.student.student_name || pr.student.github_username}
                              </Link>
                              <span>•</span>
                              <span>{formatDate(pr.updated_at)}</span>
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
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {details.students.length === 0 ? (
              <div className="p-12 text-center">
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  No students yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No students have contributed to this organization yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        PRs Merged
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {details.students.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                              {(student.student_name || student.github_username)
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {student.student_name || student.github_username}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                @{student.github_username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                            {student.merged_prs_count}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/students/${student.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                          >
                            View Details →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
