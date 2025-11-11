'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  student_id: number;
  github_username: string;
  student_name: string | null;
  merged_prs_count: number;
  last_pr_date: string | null;
  organization_name?: string;
}

interface Organization {
  id: number;
  name: string;
  github_org_name: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [limit, setLimit] = useState(25);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaderboard, selectedPeriod, selectedOrg, limit]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch leaderboard data
      const leaderboardResponse = await fetch('/api/leaderboard');
      if (!leaderboardResponse.ok) throw new Error('Failed to fetch leaderboard');
      const leaderboardData = await leaderboardResponse.json();
      setLeaderboard(leaderboardData.leaderboard || leaderboardData || []);

      // Fetch organizations
      const orgResponse = await fetch('/api/organizations');
      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        setOrganizations(orgData.organizations || orgData || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterLeaderboard = () => {
    let filtered = [...leaderboard];

    // Apply organization filter
    if (selectedOrg !== 'all') {
      filtered = filtered.filter(entry => entry.organization_name === selectedOrg);
    }

    // Apply period filter (would need backend support for accurate filtering)
    // For now, just limit the results
    filtered = filtered.slice(0, limit);

    setFilteredLeaderboard(filtered);
  };

  const totalPRs = leaderboard.reduce((sum, entry) => sum + entry.merged_prs_count, 0);
  const avgPRs = leaderboard.length > 0 ? (totalPRs / leaderboard.length).toFixed(1) : '0';
  const activeContributors = leaderboard.filter(entry => entry.merged_prs_count > 0).length;
  const topContributor = leaderboard[0]?.student_name || leaderboard[0]?.github_username || 'None';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <p className="mt-2 text-gray-600">
          Top contributors ranked by their open source contributions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        {/* Total PRs */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">TOTAL PRS</p>
              <p className="text-3xl font-bold text-gray-900">{totalPRs}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pastel-lavender/30 to-pastel-powder/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-purple-600" stroke="currentColor" fill="none" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10l1 1v8l-1 1H7l-1-1V8l1-1zm3-3h4v3m-2 2v6m-3-3h6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Average PRs */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">AVERAGE PRS</p>
              <p className="text-3xl font-bold text-gray-900">{avgPRs}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pastel-sky/30 to-info/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" stroke="currentColor" fill="none" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Top Contributor */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">TOP CONTRIBUTOR</p>
              <p className="text-lg font-bold text-gray-900 truncate">{topContributor}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pastel-peach/30 to-pastel-coral/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-orange-600" stroke="currentColor" fill="none" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Contributors */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">ACTIVE</p>
              <p className="text-3xl font-bold text-gray-900">{activeContributors}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pastel-mint/30 to-success/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-600" stroke="currentColor" fill="none" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'all' | 'week' | 'month' | 'year')}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:border-pastel-lavender focus:ring-2 focus:ring-pastel-lavender/30 transition-all"
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:border-pastel-lavender focus:ring-2 focus:ring-pastel-lavender/30 transition-all"
          >
            <option value="all">All Organizations</option>
            {organizations.map(org => (
              <option key={org.id} value={org.name}>{org.name}</option>
            ))}
          </select>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:border-pastel-lavender focus:ring-2 focus:ring-pastel-lavender/30 transition-all"
          >
            <option value={10}>Top 10</option>
            <option value={25}>Top 25</option>
            <option value={50}>Top 50</option>
            <option value={100}>Top 100</option>
          </select>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="space-y-6">
        {loading ? (
          <div className="glass-card rounded-2xl p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-pastel-peach border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading leaderboard...</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass-card rounded-2xl p-8 border-2 border-red-200 bg-red-50/50">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <div className="glass-card rounded-2xl p-12">
            <div className="text-center">
              <svg viewBox="0 0 24 24" className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600">No contributors found for the selected filters</p>
            </div>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {filteredLeaderboard.length >= 3 && (
              <div className="glass-card rounded-2xl p-8 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Top Contributors</h2>
                <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {/* 2nd Place */}
                  <div className="flex flex-col items-center mt-8">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center mb-3 shadow-lg">
                      <span className="text-3xl">🥈</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-center">
                      {filteredLeaderboard[1]?.student_name || filteredLeaderboard[1]?.github_username}
                    </h3>
                    <p className="text-sm text-gray-600">@{filteredLeaderboard[1]?.github_username}</p>
                    <p className="text-2xl font-bold text-gray-700 mt-2">{filteredLeaderboard[1]?.merged_prs_count}</p>
                    <p className="text-xs text-gray-500">PRs Merged</p>
                  </div>

                  {/* 1st Place */}
                  <div className="flex flex-col items-center">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center mb-3 shadow-xl">
                      <span className="text-4xl">🥇</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 text-center">
                      {filteredLeaderboard[0]?.student_name || filteredLeaderboard[0]?.github_username}
                    </h3>
                    <p className="text-sm text-gray-600">@{filteredLeaderboard[0]?.github_username}</p>
                    <p className="text-3xl font-bold text-gray-700 mt-2">{filteredLeaderboard[0]?.merged_prs_count}</p>
                    <p className="text-xs text-gray-500">PRs Merged</p>
                  </div>

                  {/* 3rd Place */}
                  <div className="flex flex-col items-center mt-8">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center mb-3 shadow-lg">
                      <span className="text-3xl">🥉</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-center">
                      {filteredLeaderboard[2]?.student_name || filteredLeaderboard[2]?.github_username}
                    </h3>
                    <p className="text-sm text-gray-600">@{filteredLeaderboard[2]?.github_username}</p>
                    <p className="text-2xl font-bold text-gray-700 mt-2">{filteredLeaderboard[2]?.merged_prs_count}</p>
                    <p className="text-xs text-gray-500">PRs Merged</p>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Table */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gradient-to-r from-pastel-lavender/10 to-pastel-sky/10">
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Organization</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">PRs Merged</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Last Activity</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLeaderboard.map((entry) => (
                      <tr key={entry.student_id} className="hover:bg-pastel-lavender/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                            entry.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' :
                            entry.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white' :
                            entry.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {entry.rank}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {entry.student_name || entry.github_username}
                            </div>
                            <div className="text-sm text-gray-500">@{entry.github_username}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {entry.organization_name && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pastel-sky/20 text-blue-700">
                              {entry.organization_name}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg font-bold text-primary-600">{entry.merged_prs_count}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm text-gray-600">
                            {entry.last_pr_date ? new Date(entry.last_pr_date).toLocaleDateString() : 'Never'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`https://github.com/${entry.github_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors"
                          >
                            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.419 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                            GitHub
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}