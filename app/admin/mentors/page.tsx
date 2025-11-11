'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Mentor {
  id: number;
  name: string;
  email: string;
  github_username: string;
  expertise: string[];
  max_mentees: number;
  current_mentees: number;
  is_active: boolean;
}

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    github_username: '',
    expertise: '',
    bio: '',
    max_mentees: 10,
    is_active: true
  });

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await fetch('/api/mentors');
      if (response.ok) {
        const data = await response.json();
        setMentors(data);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expertise: formData.expertise ? formData.expertise.split(',').map(s => s.trim()) : []
        })
      });

      if (response.ok) {
        await fetchMentors();
        setShowAddForm(false);
        setFormData({
          name: '',
          email: '',
          github_username: '',
          expertise: '',
          bio: '',
          max_mentees: 10,
          is_active: true
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add mentor');
      }
    } catch (error) {
      console.error('Error adding mentor:', error);
      alert('Failed to add mentor');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete mentor "${name}"?`)) {
      try {
        const response = await fetch(`/api/mentors/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await fetchMentors();
        } else {
          alert('Failed to delete mentor');
        }
      } catch (error) {
        console.error('Error deleting mentor:', error);
        alert('Failed to delete mentor');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">Manage Mentors</h1>
        <p className="mt-2 text-gray-600">
          Add, edit, and manage mentors in the system
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center rounded-xl bg-gradient-to-r from-pastel-lavender to-pastel-sky px-4 py-2 text-sm font-semibold text-gray-700 shadow-md hover:from-pastel-sky hover:to-pastel-lavender transition-all"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" stroke="currentColor" fill="none" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add New Mentor
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8 glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Mentor</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl input-pastel px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl input-pastel px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub Username
                </label>
                <input
                  type="text"
                  value={formData.github_username}
                  onChange={(e) => setFormData({ ...formData, github_username: e.target.value })}
                  className="w-full rounded-xl input-pastel px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Mentees
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_mentees}
                  onChange={(e) => setFormData({ ...formData, max_mentees: parseInt(e.target.value) })}
                  className="w-full rounded-xl input-pastel px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expertise (comma-separated)
              </label>
              <input
                type="text"
                placeholder="React, Node.js, Python, etc."
                value={formData.expertise}
                onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                className="w-full rounded-xl input-pastel px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full rounded-xl input-pastel px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Active mentor
              </label>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-xl btn-pastel-primary px-4 py-2 text-sm font-semibold"
              >
                Add Mentor
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-xl border border-gray-200 bg-white/70 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="h-24 glass-card rounded-2xl animate-pulse bg-gray-200/50" />
          ))}
        </div>
      ) : mentors.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <svg
            viewBox="0 0 24 24"
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            strokeWidth={1.8}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No mentors yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by adding your first mentor
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-pastel-lavender/20 to-pastel-sky/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Email / GitHub
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Mentees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {mentors.map((mentor) => (
                <tr key={mentor.id} className="hover:bg-pastel-pearl/50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {mentor.name}
                    </div>
                    {mentor.expertise && mentor.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {mentor.expertise.slice(0, 2).map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-md bg-pastel-sky/20 px-2 py-0.5 text-xs font-medium text-blue-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-900">{mentor.email}</div>
                    {mentor.github_username && (
                      <div className="text-sm text-gray-500">
                        @{mentor.github_username}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {mentor.current_mentees || 0} / {mentor.max_mentees}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        mentor.is_active
                          ? 'bg-pastel-mint/20 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {mentor.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/mentors/${mentor.id}`}
                      className="text-primary-600 hover:text-primary-700 mr-3"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(mentor.id, mentor.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}