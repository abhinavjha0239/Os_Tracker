'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Student {
  id: number;
  github_username: string;
  student_name: string | null;
  email: string | null;
}

interface Repository {
  id: number;
  owner: string;
  name: string;
  full_name: string;
  organization_id: number | null;
  organization_name?: string;
}

interface Organization {
  id: number;
  name: string;
  github_org_name: string;
}

export default function ManageRepositoriesPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    repository_url: '',
    organization_id: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentRes, reposRes, orgsRes] = await Promise.all([
        fetch(`/api/students/${params.id}`),
        fetch(`/api/repositories?studentId=${params.id}`),
        fetch(`/api/organizations`),
      ]);

      if (!studentRes.ok) {
        throw new Error('Student not found');
      }

      const studentData = await studentRes.json();
      const reposData = await reposRes.json();
      const orgsData = await orgsRes.json();

      setStudent(studentData);
      setRepositories(reposData);
      setOrganizations(orgsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      loadData();
    }
  }, [params.id, loadData]);

  const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
    // Support formats: owner/repo, https://github.com/owner/repo, https://github.com/owner/repo.git
    const patterns = [
      /^([^\/]+)\/([^\/]+)$/,  // owner/repo
      /github\.com\/([^\/]+)\/([^\/\.]+)/,  // Full URL
    ];

    for (const pattern of patterns) {
      const match = url.trim().match(pattern);
      if (match) {
        return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.repository_url.trim()) {
      alert('Repository URL is required');
      return;
    }

    const parsed = parseRepoUrl(formData.repository_url);
    if (!parsed) {
      alert('Invalid repository format. Use "owner/repo" or full GitHub URL');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: params.id,
          owner: parsed.owner,
          repo_name: parsed.repo,
          organization_id: formData.organization_id ? parseInt(formData.organization_id) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add repository');
      }

      alert('Repository added successfully!');
      setFormData({ repository_url: '', organization_id: '' });
      setShowForm(false);
      loadData();
    } catch (error: any) {
      console.error('Error adding repository:', error);
      alert(error.message || 'Failed to add repository');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSync = async (repoId: number) => {
    try {
      setSyncing(repoId);
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repository_id: repoId }),
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      alert('Repository synced successfully!');
      loadData();
    } catch (error) {
      console.error('Error syncing repository:', error);
      alert('Failed to sync repository');
    } finally {
      setSyncing(null);
    }
  };

  const handleDelete = async (repoId: number, fullName: string) => {
    if (!confirm(`Are you sure you want to remove ${fullName}? This will also delete all contributions from this repository.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/repositories/${repoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete repository');
      }

      alert('Repository removed successfully!');
      loadData();
    } catch (error) {
      console.error('Error deleting repository:', error);
      alert('Failed to delete repository');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-2xl p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200/50 rounded-xl w-1/4"></div>
              <div className="h-4 bg-gray-200/50 rounded-xl w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-2xl p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Student not found
            </h3>
            <Link
              href="/admin/students"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              ← Back to Students
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
              <Link href="/admin/students" className="hover:text-primary-600">
                Manage Students
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900 font-medium">
              {student.student_name || student.github_username}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pastel-lavender to-pastel-sky rounded-2xl flex items-center justify-center text-gray-700 font-bold text-2xl mr-4">
                {(student.student_name || student.github_username).charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                  Manage Repositories
                </h1>
                <p className="text-lg text-gray-600">
                  {student.student_name || student.github_username} (@{student.github_username})
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-gradient-to-r from-pastel-lavender to-pastel-sky text-gray-700 rounded-xl hover:from-pastel-sky hover:to-pastel-lavender transition-all shadow-md font-medium"
            >
              {showForm ? 'Cancel' : '+ Add Repository'}
            </button>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Add New Repository
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="repository_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Repository URL or Path *
                </label>
                <input
                  type="text"
                  id="repository_url"
                  value={formData.repository_url}
                  onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
                  placeholder="e.g., openMF/web-app or https://github.com/openMF/web-app"
                  required
                  className="w-full px-4 py-2 input-pastel rounded-xl"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: owner/repo, https://github.com/owner/repo, or https://github.com/owner/repo.git
                </p>
              </div>

              <div>
                <label htmlFor="organization_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization (Optional)
                </label>
                <select
                  id="organization_id"
                  value={formData.organization_id}
                  onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                  className="w-full px-4 py-2 input-pastel rounded-xl"
                >
                  <option value="">None</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} (@{org.github_org_name})
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Associate this repository with an organization
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 btn-pastel-primary rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {submitting ? 'Adding...' : 'Add Repository'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ repository_url: '', organization_id: '' });
                    setShowForm(false);
                  }}
                  className="px-6 py-2 bg-white/70 text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Repositories List */}
        {repositories.length === 0 ? (
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
            <p className="text-gray-600 mb-6">
              Add repositories to track this student&apos;s contributions
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 btn-pastel-primary rounded-xl font-medium shadow-md"
            >
              + Add First Repository
            </button>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-pastel-lavender/20 to-pastel-sky/20 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Repository
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {repositories.map((repo) => (
                    <tr key={repo.id} className="hover:bg-pastel-pearl/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {repo.name}
                          </div>
                          <a
                            href={`https://github.com/${repo.full_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                          >
                            {repo.full_name} →
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {repo.organization_name ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-pastel-powder/30 text-purple-700">
                            {repo.organization_name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">
                            None
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSync(repo.id)}
                            disabled={syncing === repo.id}
                            className="px-3 py-1 text-sm bg-pastel-mint/30 text-green-700 rounded-lg hover:bg-pastel-mint/50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                          >
                            {syncing === repo.id ? 'Syncing...' : 'Sync'}
                          </button>
                          <button
                            onClick={() => handleDelete(repo.id, repo.full_name)}
                            className="px-3 py-1 text-sm bg-pastel-rose/30 text-red-700 rounded-lg hover:bg-pastel-rose/50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
