"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

type User = {
  email: string;
  name?: string;
  role?: string;
  branches?: any[];
};

export default function AdminBranchesPanel() {
  const [branches, setBranches] = useState<{ id: string; filename: string; status?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ filename: "" });
  const [deleteMode, setDeleteMode] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/uploads');
      if (res.ok) {
        const data = await res.json();
        // ensure status is present
        setBranches((data || []).map((d: any) => ({ id: d.id, filename: d.filename, status: d.status })));
        setError(null);
      } else {
        setError('Failed to fetch branches');
      }
    } catch (e) {
      setError('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const createBranch = async () => {
    if (!createForm.filename) {
      setError("Branch name (CSV filename) is required");
      return;
    }
    // This would trigger a CSV upload flow in a real app
    setError("Upload a CSV file to create a branch.");
  };

  const toggleSelect = (id: string) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const deleteSelectedBranches = async () => {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} selected branch(es)? This will remove the CSV and analytics.`)) return;
    try {
      await Promise.all(ids.map(async (id) => {
        const res = await fetch(`/api/uploads/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete branch');
      }));
      setSelected({});
      setDeleteMode(false);
      fetchBranches();
    } catch (e) {
      alert('Error deleting branch(es)');
    }
  };
  const deleteSelected = async () => {
    const emails = Object.keys(selected).filter((k) => selected[k]);
    if (!emails.length) return;
    if (!confirm(`Delete ${emails.length} selected user(s)? This cannot be undone.`)) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
      const res = await fetch('/api/auth/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ emails }),
      });
      if (res.ok) {
        // refresh
        setSelected({});
        fetchBranches();
      } else {
        alert('Failed to delete users: ' + (await res.text()));
      }
    } catch (e) {
      alert('Error deleting users');
    }
  };

  const router = useRouter();

  const tryDemoAdmin = async () => {
    try {
      // Attempt a convenience demo-admin login (only works if that account/password exists in data/users.json)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test-admin@example.com', password: 'TestAdmin123!' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('jwt', data.token);
          setError(null);
            fetchBranches();
          return;
        }
      }
      alert('Demo admin login failed — please log in manually.');
    } catch (e) {
      console.error('demo login failed', e);
      alert('Demo admin login failed — please log in manually.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#0047ab]">Branches</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowCreateForm(true)} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create New Branch</button>
          <button
            onClick={() => setDeleteMode((m) => !m)}
            className={`px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 ${deleteMode ? 'opacity-80' : ''}`}
          >
            {deleteMode ? 'Cancel Delete' : 'Delete Branch'}
          </button>
          {deleteMode && (
            <button
              onClick={deleteSelectedBranches}
              className="px-3 py-2 bg-red-700 text-white rounded hover:bg-red-800"
              disabled={Object.keys(selected).filter((k) => selected[k]).length === 0}
            >
              Confirm Delete
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <div className="text-sm text-yellow-800">{error}</div>
        </div>
      ) : loading ? (
        <p>Loading branches...</p>
      ) : (
        <div className="space-y-2">
          {branches.length === 0 ? (
            <p className="text-sm text-gray-500">No branches found.</p>
          ) : (
            <>
              {deleteMode && (
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={branches.every((b) => selected[b.id]) && branches.length > 0}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelected(
                        checked
                          ? Object.fromEntries(branches.map((b) => [b.id, true]))
                          : {}
                      );
                    }}
                    className="mr-2"
                  />
                  <span className="font-medium">Select All</span>
                </div>
              )}
              {branches.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-2">
                    {deleteMode && (
                      <input
                        type="checkbox"
                        checked={!!selected[b.id]}
                        onChange={() => toggleSelect(b.id)}
                        className="mr-2"
                      />
                    )}
                    <div className="font-medium">{b.filename.replace(/\.csv$/i, '')} Branch</div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Centered sliding toggle (phone-like) */}
                    <label className="flex items-center gap-3">
                      <span className="sr-only">Toggle branch active</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          role="switch"
                          aria-checked={b.status === 'ACTIVE'}
                          checked={b.status === 'ACTIVE'}
                          onChange={async () => {
                            try {
                              const prevStatus = b.status;
                              const newStatus = prevStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                              // optimistic
                              setBranches((prev) => prev.map((p) => (p.id === b.id ? { ...p, status: newStatus } : p)));
                              const res = await fetch(`/api/uploads/${b.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'toggle' }),
                              });
                              if (!res.ok) {
                                // revert
                                setBranches((prev) => prev.map((p) => (p.id === b.id ? { ...p, status: prevStatus } : p)));
                                alert('Failed to update branch status');
                              }
                            } catch (err) {
                              setBranches((prev) => prev.map((p) => (p.id === b.id ? { ...p, status: b.status } : p)));
                              alert('Failed to update branch status');
                            }
                          }}
                          className="sr-only peer"
                        />

                        <div className="w-14 h-8 bg-gray-200 rounded-full peer-checked:bg-green-600 peer-focus:ring-2 peer-focus:ring-green-300 transition-colors"></div>
                        <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow transition-transform peer-checked:translate-x-6`}></div>
                      </div>
                      <span className={`text-xs font-medium ${b.status === 'ACTIVE' ? 'text-green-700' : 'text-red-600'}`}>{b.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
                    </label>

                    <a href={`/dashboard/analytics/csv/${b.id}`} className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">View Analysis</a>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Create Branch Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-[#0047ab] mb-4">Create New Branch</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name (CSV filename)</label>
                <input
                  type="text"
                  value={createForm.filename}
                  onChange={(e) => setCreateForm({ filename: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter branch name (upload CSV to create)"
                  required
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={createBranch}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Branch
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateForm({ filename: "" });
                    setError(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
