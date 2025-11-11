'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Organization {
  id: number;
  name: string;
  github_org_name: string;
  student_count?: number;
  repo_count?: number;
  merged_prs_count?: number;
  created_at?: string;
  updated_at?: string;
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'prs' | 'members' | 'recent'>('prs');
  const [sizeFilter, setSizeFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    filterAndSortOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizations, searchTerm, sortBy, sizeFilter]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/organizations');
      if (!response.ok) throw new Error('Failed to fetch organizations');
      const data = await response.json();

      // Fetch additional stats if needed
      const orgsWithStats = await Promise.all(
        (data.organizations || data || []).map(async (org: Organization) => {
          try {
            const statsResponse = await fetch(`/api/organizations/${org.id}/stats`);
            if (statsResponse.ok) {
              const statsData = await statsResponse.json();
              return { ...org, ...statsData };
            }
          } catch {
            // Ignore individual stats fetch errors
          }
          return org;
        })
      );

      setOrganizations(orgsWithStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOrganizations = () => {
    let filtered = [...organizations];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.github_org_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply size filter
    if (sizeFilter !== 'all') {
      filtered = filtered.filter(org => {
        const members = org.student_count || 0;
        if (sizeFilter === 'small') return members <= 10;
        if (sizeFilter === 'medium') return members > 10 && members <= 50;
        if (sizeFilter === 'large') return members > 50;
        return true;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'prs':
        filtered.sort((a, b) => (b.merged_prs_count || 0) - (a.merged_prs_count || 0));
        break;
      case 'members':
        filtered.sort((a, b) => (b.student_count || 0) - (a.student_count || 0));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());
        break;
    }

    setFilteredOrgs(filtered);
  };

  const totalPRs = organizations.reduce((sum, org) => sum + (org.merged_prs_count || 0), 0);
  const totalMembers = organizations.reduce((sum, org) => sum + (org.student_count || 0), 0);
  const avgMembers = organizations.length > 0 ? Math.round(totalMembers / organizations.length) : 0;
  const activeOrgs = organizations.filter(org => (org.merged_prs_count || 0) > 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          Organizations Directory
        </h1>
        <p className="mt-2 text-gray-600">
          Manage and track all participating organizations and their activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        {/* Total Organizations */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">TOTAL ORGANIZATIONS</p>
              <p className="text-3xl font-bold text-gray-900">{organizations.length}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pastel-sky/30 to-info/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" stroke="currentColor" fill="none" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Organizations */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">ACTIVE ORGANIZATIONS</p>
              <p className="text-3xl font-bold text-gray-900">{activeOrgs}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pastel-mint/30 to-success/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-600" stroke="currentColor" fill="none" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Members */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">TOTAL MEMBERS</p>
              <p className="text-3xl font-bold text-gray-900">{totalMembers}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pastel-lavender/30 to-primary/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-purple-600" stroke="currentColor" fill="none" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total PRs */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">TOTAL PRS MERGED</p>
              <p className="text-3xl font-bold text-gray-900">{totalPRs}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pastel-peach/30 to-warning/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-orange-600" stroke="currentColor" fill="none" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10l1 1v8l-1 1H7l-1-1V8l1-1zm3-3h4v3m-2 2v6m-3-3h6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" stroke="currentColor" fill="none" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:border-pastel-lavender focus:ring-2 focus:ring-pastel-lavender/30 transition-all"
              />
            </div>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'prs' | 'members' | 'recent')}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:border-pastel-lavender focus:ring-2 focus:ring-pastel-lavender/30 transition-all"
          >
            <option value="prs">Sort by PRs</option>
            <option value="members">Sort by Members</option>
            <option value="name">Sort by Name</option>
            <option value="recent">Sort by Recent</option>
          </select>
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value as 'all' | 'small' | 'medium' | 'large')}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:border-pastel-lavender focus:ring-2 focus:ring-pastel-lavender/30 transition-all"
          >
            <option value="all">All Sizes</option>
            <option value="small">Small (≤10)</option>
            <option value="medium">Medium (11-50)</option>
            <option value="large">Large (&gt;50)</option>
          </select>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="space-y-6">
        {loading ? (
          <div className="glass-card rounded-2xl p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-pastel-sky border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading organizations...</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass-card rounded-2xl p-8 border-2 border-red-200 bg-red-50/50">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        ) : filteredOrgs.length === 0 ? (
          <div className="glass-card rounded-2xl p-12">
            <div className="text-center">
              <svg viewBox="0 0 24 24" className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Organizations Found</h3>
              <p className="text-gray-600">
                {searchTerm || sizeFilter !== 'all'
                  ? 'Try adjusting your filters or search term'
                  : 'No organizations have been added yet'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrgs.map((org) => (
              <div key={org.id} className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{org.name}</h3>
                    <p className="text-sm text-gray-600">@{org.github_org_name}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-pastel-sky/20">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-blue-600" stroke="currentColor" fill="none" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-600">{org.student_count || 0}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{org.merged_prs_count || 0}</p>
                    <p className="text-xs text-gray-600">PRs Merged</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{org.repo_count || 0}</p>
                    <p className="text-xs text-gray-600">Repositories</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{org.student_count || 0}</p>
                    <p className="text-xs text-gray-600">Members</p>
                  </div>
                </div>

                {/* Activity Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Activity Level</span>
                    <span className="text-xs font-medium text-gray-700">
                      {((org.merged_prs_count || 0) / Math.max(1, org.student_count || 1)).toFixed(1)} PRs/member
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pastel-mint to-success transition-all"
                      style={{
                        width: `${Math.min(100, ((org.merged_prs_count || 0) / Math.max(1, (org.student_count || 1) * 10)) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/organizations/${org.id}`}
                    className="flex-1 text-center px-3 py-2 rounded-lg bg-gradient-to-r from-pastel-lavender/20 to-pastel-sky/20 text-primary-600 text-sm font-medium hover:from-pastel-lavender/30 hover:to-pastel-sky/30 transition-all"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`https://github.com/${org.github_org_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.419 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}