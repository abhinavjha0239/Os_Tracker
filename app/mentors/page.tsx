'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Mentor {
  id: number;
  name: string;
  email: string;
  github_username: string;
  expertise: string[];
  bio: string;
  max_mentees: number;
  current_mentees: number;
  is_active: boolean;
  created_at: string;
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'mentees' | 'recent'>('name');

  useEffect(() => {
    fetchMentors();
  }, []);

  useEffect(() => {
    filterAndSortMentors();
  }, [mentors, searchTerm, filterActive, sortBy]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mentors');
      if (!response.ok) throw new Error('Failed to fetch mentors');
      const data = await response.json();
      setMentors(data.mentors || data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortMentors = () => {
    let filtered = [...mentors];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(mentor =>
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.github_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.expertise?.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply active status filter
    if (filterActive !== 'all') {
      filtered = filtered.filter(mentor =>
        filterActive === 'active' ? mentor.is_active : !mentor.is_active
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'mentees':
        filtered.sort((a, b) => (b.current_mentees || 0) - (a.current_mentees || 0));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
    }

    setFilteredMentors(filtered);
  };

  const totalMentors = mentors.length;
  const activeMentors = mentors.filter(m => m.is_active).length;
  const totalMentees = mentors.reduce((sum, m) => sum + (m.current_mentees || 0), 0);
  const avgMentees = totalMentors > 0 ? (totalMentees / totalMentors).toFixed(1) : '0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          Mentors Directory
        </h1>
        <p className="mt-2 text-gray-600">
          Connect with experienced mentors to guide your open source journey
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        {/* Total Mentors */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">TOTAL MENTORS</p>
              <p className="text-3xl font-bold text-gray-900">{totalMentors}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pastel-lavender/30 to-pastel-powder/30 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-purple-600" stroke="currentColor" fill="none" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 1 0 0 4m0-4a2 2 0 1 1 0 4m-6 8a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 1 0 0-4m0 4a2 2 0 1 1 0-4m0 4v2m0-6V4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Mentors */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">ACTIVE MENTORS</p>
              <p className="text-3xl font-bold text-gray-900">{activeMentors}</p>
              <p className="text-xs text-gray-500 mt-1">
                {totalMentors > 0 ? `${Math.round((activeMentors / totalMentors) * 100)}% active` : '0% active'}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pastel-mint/30 to-success/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-600" stroke="currentColor" fill="none" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Mentees */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">TOTAL MENTEES</p>
              <p className="text-3xl font-bold text-gray-900">{totalMentees}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pastel-sky/30 to-info/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" stroke="currentColor" fill="none" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Average Mentees */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">AVG MENTEES/MENTOR</p>
              <p className="text-3xl font-bold text-gray-900">{avgMentees}</p>
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
                placeholder="Search mentors by name, email, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:border-pastel-lavender focus:ring-2 focus:ring-pastel-lavender/30 transition-all"
              />
            </div>
          </div>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:border-pastel-lavender focus:ring-2 focus:ring-pastel-lavender/30 transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'mentees' | 'recent')}
            className="px-4 py-3 rounded-xl border border-gray-200 bg-white/70 focus:border-pastel-lavender focus:ring-2 focus:ring-pastel-lavender/30 transition-all"
          >
            <option value="name">Sort by Name</option>
            <option value="mentees">Sort by Mentees</option>
            <option value="recent">Sort by Recent</option>
          </select>
          <Link
            href="/admin/mentors/new"
            className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-pastel-lavender to-pastel-sky text-gray-700 font-medium hover:from-pastel-sky hover:to-pastel-lavender transition-all shadow-md hover:shadow-lg"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" stroke="currentColor" fill="none" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Mentor
          </Link>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="space-y-6">
        {loading ? (
          <div className="glass-card rounded-2xl p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-pastel-lavender border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading mentors...</p>
            </div>
          </div>
        ) : error ? (
          <div className="glass-card rounded-2xl p-8 border-2 border-red-200 bg-red-50/50">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="glass-card rounded-2xl p-12">
            <div className="text-center">
              <svg viewBox="0 0 24 24" className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Mentors Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first mentor'}
              </p>
              {!searchTerm && (
                <Link
                  href="/admin/mentors/new"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-pastel-lavender to-pastel-sky text-gray-700 font-medium hover:from-pastel-sky hover:to-pastel-lavender transition-all"
                >
                  Add First Mentor
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMentors.map((mentor) => (
              <Link
                key={mentor.id}
                href={`/mentors/${mentor.id}`}
                className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pastel-lavender to-pastel-powder text-gray-700 font-semibold text-lg">
                      {mentor.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {mentor.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        @{mentor.github_username || 'no-github'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      mentor.is_active
                        ? 'bg-pastel-mint/20 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {mentor.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {mentor.bio || 'No bio available'}
                </p>

                {mentor.expertise && mentor.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {mentor.expertise.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-md bg-pastel-sky/20 px-2 py-1 text-xs font-medium text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}
                    {mentor.expertise.length > 3 && (
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        +{mentor.expertise.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 mr-1" stroke="currentColor" fill="none" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 1 1 0 5.292M15 21H3v-1a6 6 0 0 1 12 0v1zm0 0h6v-1a6 6 0 0 0-9-5.197M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
                      </svg>
                      {mentor.current_mentees || 0}/{mentor.max_mentees}
                    </div>
                    <div className="text-sm text-gray-600">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 inline mr-1" stroke="currentColor" fill="none" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
                      </svg>
                      {mentor.email.split('@')[0]}
                    </div>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors"
                    stroke="currentColor"
                    fill="none"
                    strokeWidth={1.8}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}