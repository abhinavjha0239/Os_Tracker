'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Student {
  student_id: string;
  github_username: string;
  student_name?: string;
  email?: string;
  merged_prs_count?: number;
  profile_pic?: string;
  organization_name?: string;
  created_at?: string;
  updated_at?: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'prs' | 'recent'>('prs');
  const [filterOrg, setFilterOrg] = useState<string>('all');
  const [organizations, setOrganizations] = useState<string[]>([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchTerm, sortBy, filterOrg]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error('Failed to fetch students');
      const data = await response.json();
      setStudents(data.students || data || []);

      // Extract unique organizations
      const studentsData = data.students || data || [];
      const orgs = [...new Set(studentsData.map((s: Student) => s.organization_name).filter(Boolean))];
      setOrganizations(orgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStudents = () => {
    let filtered = [...students];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.github_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply organization filter
    if (filterOrg !== 'all') {
      filtered = filtered.filter(student => student.organization_name === filterOrg);
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => (a.student_name || a.github_username).localeCompare(b.student_name || b.github_username));
        break;
      case 'prs':
        filtered.sort((a, b) => (b.merged_prs_count || 0) - (a.merged_prs_count || 0));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());
        break;
    }

    setFilteredStudents(filtered);
  };

  const totalPRs = students.reduce((sum, s) => sum + (s.merged_prs_count || 0), 0);
  const activeContributors = students.filter(s => (s.merged_prs_count || 0) > 0).length;
  const avgPRs = students.length > 0 ? (totalPRs / students.length).toFixed(1) : '0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          Students Directory
        </h1>
        <p className="mt-2 text-gray-600">
          Track and manage all participating students and their open source contributions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        {/* Total Students */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">TOTAL STUDENTS</p>
              <p className="text-3xl font-bold text-gray-900">{students.length}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pastel-lavender/30 to-pastel-sky/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-primary-600" stroke="currentColor" fill="none" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Contributors */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">ACTIVE CONTRIBUTORS</p>
              <p className="text-3xl font-bold text-gray-900">{activeContributors}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pastel-mint/30 to-pastel-sage/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-600" stroke="currentColor" fill="none" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total PRs Merged */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">TOTAL PRS MERGED</p>
              <p className="text-3xl font-bold text-gray-900">{totalPRs}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pastel-powder/30 to-pastel-lavender/30 flex items-center justify-center">
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
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pastel-peach/30 to-pastel-coral/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-orange-600" stroke="currentColor" fill="none" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
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
                placeholder="Search by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:border-pastel-lavender focus:ring-2 focus:ring-pastel-lavender/30 transition-all"
              />
            </div>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'prs' | 'recent')}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:border-pastel-lavender focus:ring-2 focus:ring-pastel-lavender/30 transition-all"
          >
            <option value="prs">Sort by PRs</option>
            <option value="name">Sort by Name</option>
            <option value="recent">Sort by Recent</option>
          </select>
          <select
            value={filterOrg}
            onChange={(e) => setFilterOrg(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:border-pastel-lavender focus:ring-2 focus:ring-pastel-lavender/30 transition-all"
          >
            <option value="all">All Students</option>
            {organizations.map(org => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Grid */}
      <div className="space-y-6">
        {loading ? (
          <div className="glass-card rounded-2xl p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-pastel-lavender border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading students...</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass-card rounded-2xl p-8 border-2 border-red-200 bg-red-50/50">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="glass-card rounded-2xl p-12">
            <div className="text-center">
              <svg viewBox="0 0 24 24" className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-600">
                {searchTerm || filterOrg !== 'all'
                  ? 'Try adjusting your filters or search term'
                  : 'No students have been added yet'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <div key={student.student_id} className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {student.profile_pic ? (
                      <img
                        src={student.profile_pic}
                        alt={student.student_name || student.github_username}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pastel-lavender to-pastel-sky flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-700">
                          {(student.student_name || student.github_username).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {student.student_name || student.github_username}
                    </h3>
                    <p className="text-sm text-gray-600">@{student.github_username}</p>
                    {student.organization_name && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pastel-sky/20 text-blue-700 mt-1">
                        {student.organization_name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Merged PRs</p>
                      <p className="text-2xl font-bold text-gray-900">{student.merged_prs_count || 0}</p>
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
        )}
      </div>
    </div>
  );
}