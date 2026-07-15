import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'Reported' | 'In Progress' | 'Resolved';
  location: string;
  votes: number;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const statuses = ['Reported', 'In Progress', 'Resolved'] as const;

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  Reported: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-400' },
  'In Progress': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
  Resolved: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-400' },
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1d ago';
  return `${days}d ago`;
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchIssues = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/issues`);
      const data = await res.json();
      setIssues(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const updateStatus = async (id: string, status: Issue['status']) => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken || storedToken.startsWith('demo-token')) {
      logout();
      navigate('/login');
      return;
    }

    setUpdatingId(id);
    setIssues((prev) =>
      prev.map((i) => (i._id === id ? { ...i, status } : i)),
    );
    try {
      const res = await fetch(`${API_URL}/issues/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          logout();
          navigate('/login');
          return;
        }
        fetchIssues();
      }
    } catch {
      fetchIssues();
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteIssue = async (id: string) => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken || storedToken.startsWith('demo-token')) {
      logout();
      navigate('/login');
      return;
    }

    setIssues((prev) => prev.filter((i) => i._id !== id));
    try {
      const res = await fetch(`${API_URL}/issues/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          logout();
          navigate('/login');
          return;
        }
        fetchIssues();
      }
    } catch {
      fetchIssues();
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-400 text-[15px]">Admin access required.</p>
      </div>
    );
  }

  const counts = {
    Reported: issues.filter((i) => i.status === 'Reported').length,
    'In Progress': issues.filter((i) => i.status === 'In Progress').length,
    Resolved: issues.filter((i) => i.status === 'Resolved').length,
  };

  return (
    <div className="max-w-[960px] mx-auto px-6 py-10">
      {/* Header */}
      <span className="inline-block text-[11px] font-semibold text-gray-400 uppercase tracking-widest px-3.5 py-1 rounded-full border border-gray-200 bg-white mb-4">
        Admin Panel
      </span>
      <h1 className="text-[28px] font-semibold text-[#1c1917] mb-1.5">
        Manage issues
      </h1>
      <p className="text-gray-400 text-[15px] mb-8">
        Update the status of every reported issue.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {statuses.map((s) => (
          <div
            key={s}
            className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.03)] p-5 text-center"
          >
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest block mb-1">
              {s}
            </span>
            <span className="text-[32px] font-bold text-[#1c1917]">
              {counts[s]}
            </span>
          </div>
        ))}
      </div>

      {/* Issue list */}
      {loading ? (
        <p className="text-gray-400 text-[14px] py-8 text-center">Loading issues...</p>
      ) : issues.length === 0 ? (
        <p className="text-gray-400 text-[14px] py-8 text-center">No issues yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {issues.map((issue) => {
            const colors = statusColors[issue.status];
            return (
              <div
                key={issue._id}
                className="bg-white rounded-xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.03)] p-5 flex gap-5 items-start"
              >
                {/* Center: issue details */}
                <div className="flex-1 min-w-0">
                  {/* Top row: category + status badge */}
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                      {issue.category}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      {issue.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[17px] font-semibold text-[#1c1917] mb-1">
                    {issue.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-[14px] leading-relaxed mb-2">
                    {issue.description}
                  </p>

                  {/* Location + time */}
                  <p className="text-gray-300 text-[12px]">
                    {issue.location}{issue.createdAt ? `\u00A0\u00B7\u00A0${timeAgo(issue.createdAt)}` : ''}
                  </p>
                </div>

                {/* Right: status toggle + delete */}
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div className="flex flex-col rounded-lg border border-gray-200 overflow-hidden">
                    {statuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(issue._id, s)}
                        disabled={updatingId === issue._id || issue.status === s}
                        className={`text-[11px] font-medium px-3 py-1.5 transition-all cursor-pointer border-b border-gray-100 last:border-b-0 disabled:cursor-default ${
                          issue.status === s
                            ? 'bg-[#0f172a] text-white'
                            : 'bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => deleteIssue(issue._id)}
                    className="text-[11px] font-medium text-red-400 hover:text-red-600 transition-colors cursor-pointer px-2 py-0.5"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
