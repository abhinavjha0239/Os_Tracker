'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Student {
  id: number;
  github_username: string;
  student_name: string | null;
  email: string | null;
}

export default function ManageStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    github_username: '',
    student_name: '',
    email: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
      alert('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.github_username.trim()) {
      alert('GitHub username is required');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingId ? `/api/students/${editingId}` : '/api/students';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github_username: formData.github_username.trim(),
          student_name: formData.student_name.trim() || null,
          email: formData.email.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save student');
      }

      alert(editingId ? 'Student updated successfully!' : 'Student added successfully!');
      setFormData({ github_username: '', student_name: '', email: '' });
      setEditingId(null);
      setShowForm(false);
      loadStudents();
    } catch (error: any) {
      console.error('Error saving student:', error);
      alert(error.message || 'Failed to save student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (student: Student) => {
    setFormData({
      github_username: student.github_username,
      student_name: student.student_name || '',
      email: student.email || '',
    });
    setEditingId(student.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Are you sure you want to delete ${username}? This will also delete all their repositories and contributions.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete student');
      }

      alert('Student deleted successfully!');
      loadStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student');
    }
  };

  const handleCancel = () => {
    setFormData({ github_username: '', student_name: '', email: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2">
                Manage Students
              </h1>
              <p className="text-lg text-gray-600">
                Add, edit, or remove students from the system
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-gradient-to-r from-pastel-lavender to-pastel-sky text-gray-700 rounded-xl hover:from-pastel-sky hover:to-pastel-lavender transition-all shadow-md font-medium"
            >
              {showForm ? 'Cancel' : '+ Add Student'}
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit Student' : 'Add New Student'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="github_username" className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Username *
                </label>
                <input
                  type="text"
                  id="github_username"
                  value={formData.github_username}
                  onChange={(e) => setFormData({ ...formData, github_username: e.target.value })}
                  placeholder="e.g., shubhamkumar9199"
                  required
                  className="w-full px-4 py-2 input-pastel rounded-xl"
                />
                <p className="text-sm text-gray-500 mt-1">
                  GitHub username without the @ symbol
                </p>
              </div>

              <div>
                <label htmlFor="student_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  id="student_name"
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  placeholder="e.g., Shubham Kumar"
                  className="w-full px-4 py-2 input-pastel rounded-xl"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g., student@college.edu"
                  className="w-full px-4 py-2 input-pastel rounded-xl"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 btn-pastel-primary rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Student' : 'Add Student'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-white/70 text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Students List */}
        {loading ? (
          <div className="glass-card rounded-2xl p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200/50 rounded-xl"></div>
              ))}
            </div>
          </div>
        ) : students.length === 0 ? (
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
            <p className="text-gray-600 mb-6">
              Get started by adding your first student
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 btn-pastel-primary rounded-xl font-medium shadow-md"
            >
              + Add First Student
            </button>
          </div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-pastel-lavender/20 to-pastel-sky/20 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-pastel-pearl/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-pastel-lavender to-pastel-sky rounded-xl flex items-center justify-center text-white font-semibold text-sm mr-3">
                            {(student.student_name || student.github_username)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.student_name || student.github_username}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{student.github_username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {student.email || (
                            <span className="text-gray-400">
                              Not provided
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/students/${student.id}/repositories`}
                            className="px-3 py-1 text-sm bg-pastel-powder/30 text-purple-700 rounded-lg hover:bg-pastel-powder/50 transition-colors"
                          >
                            Manage Repos
                          </Link>
                          <button
                            onClick={() => handleEdit(student)}
                            className="px-3 py-1 text-sm bg-pastel-sky/30 text-blue-700 rounded-lg hover:bg-pastel-sky/50 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(student.id, student.github_username)}
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
