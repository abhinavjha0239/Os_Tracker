'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalOrganizations: 0,
    totalRepositories: 0,
    totalMentors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [studentsRes, orgsRes, mentorsRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/organizations'),
        fetch('/api/mentors'),
      ]);

      const students = await studentsRes.json();
      const orgs = await orgsRes.json();
      const mentors = await mentorsRes.json();

      // Count total repositories across all students
      let totalRepos = 0;
      for (const student of students) {
        const reposRes = await fetch(`/api/repositories?studentId=${student.id}`);
        const repos = await reposRes.json();
        totalRepos += repos.length;
      }

      setStats({
        totalStudents: students.length,
        totalOrganizations: orgs.length,
        totalRepositories: totalRepos,
        totalMentors: mentors.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage students, repositories, and organizations
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pastel-sky/30 to-pastel-lavender/30 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalStudents}
                </div>
                <div className="text-gray-600">Students</div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pastel-lavender/30 to-pastel-powder/30 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalOrganizations}
                </div>
                <div className="text-gray-600">Organizations</div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pastel-mint/30 to-pastel-sage/30 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalRepositories}
                </div>
                <div className="text-gray-600">Repositories</div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pastel-peach/30 to-pastel-coral/30 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats.totalMentors}
                </div>
                <div className="text-gray-600">Mentors</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Manage Students */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-pastel-sky to-pastel-lavender px-6 py-4">
              <h2 className="text-2xl font-bold text-white">Manage Students</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Add, edit, or remove students. Manage their repositories and sync their contributions from GitHub.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Add/Edit/Delete students</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Manage repositories per student</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Sync contributions from GitHub</span>
                </li>
              </ul>
              <Link
                href="/admin/students"
                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-pastel-sky to-pastel-lavender text-white rounded-xl hover:from-pastel-sky/90 hover:to-pastel-lavender/90 transition-all font-medium shadow-md"
              >
                Manage Students →
              </Link>
            </div>
          </div>

          {/* Manage Organizations */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-pastel-lavender to-pastel-powder px-6 py-4">
              <h2 className="text-2xl font-bold text-white">Manage Organizations</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Add or view open-source organizations. Organizations help group repositories and track contributions.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Add new organizations</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Link GitHub organizations</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Track org-wise contributions</span>
                </li>
              </ul>
              <Link
                href="/admin/organizations"
                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-pastel-lavender to-pastel-powder text-white rounded-xl hover:from-pastel-lavender/90 hover:to-pastel-powder/90 transition-all font-medium shadow-md"
              >
                Manage Organizations →
              </Link>
            </div>
          </div>

          {/* Manage Mentors */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-pastel-mint to-pastel-sage px-6 py-4">
              <h2 className="text-2xl font-bold text-white">Manage Mentors</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Add, edit, or remove mentors. Assign students to mentors and track mentorship progress.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Add/Edit/Delete mentors</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Assign students to mentors</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Track mentorship progress</span>
                </li>
              </ul>
              <Link
                href="/admin/mentors"
                className="block w-full text-center px-6 py-3 bg-gradient-to-r from-pastel-mint to-pastel-sage text-white rounded-xl hover:from-pastel-mint/90 hover:to-pastel-sage/90 transition-all font-medium shadow-md"
              >
                Manage Mentors →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-gradient-to-r from-pastel-sky/10 to-pastel-lavender/10 border border-pastel-sky/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            💡 Quick Tips
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Add organizations first, then you can associate repositories with them</li>
            <li>• After adding a student, click &quot;Manage Repos&quot; to add their repositories</li>
            <li>• Use the &quot;Sync&quot; button to fetch the latest contributions from GitHub</li>
            <li>• Assign students to mentors to track their progress and provide guidance</li>
            <li>• Repository format: owner/repo or full GitHub URL (e.g., openMF/web-app)</li>
            <li>• Only merged pull requests are counted in the leaderboard and statistics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}