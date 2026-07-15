import { useState, useMemo, useEffect, useCallback } from 'react';
import { categories } from '../data/issues';
import type { Issue } from '../data/issues';
import IssueCard from '../components/IssueCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type SortOption = 'votes' | 'newest';
type StatusFilter = 'all' | 'Reported' | 'In Progress' | 'Resolved';
type TypeFilter = 'all' | (typeof categories)[number];

const statusOptions: StatusFilter[] = ['all', 'Reported', 'In Progress', 'Resolved'];
const typeOptions: TypeFilter[] = ['all', ...categories];

const Dashboard = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('votes');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const fetchIssues = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/issues`);
      const data = await res.json();
      setIssues(data);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const handleVote = async (id: string) => {
    setIssues((prev) =>
      prev.map((i) => (i._id === id ? { ...i, votes: i.votes + 1 } : i)),
    );
    try {
      const res = await fetch(`${API_URL}/issues/${id}/vote`, {
        method: 'PATCH',
      });
      if (!res.ok) {
        fetchIssues();
      }
    } catch {
      fetchIssues();
    }
  };

  const filtered = useMemo(() => {
    let result = [...issues];

    if (statusFilter !== 'all') {
      result = result.filter((i) => i.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      result = result.filter((i) => i.category === typeFilter);
    }

    if (sortBy === 'votes') {
      result.sort((a, b) => b.votes - a.votes);
    } else {
      result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    return result;
  }, [issues, sortBy, statusFilter, typeFilter]);

  return (
    <div className="dashboard-page">
      <div className="container">
        <h1 className="dashboard-heading">Community Dashboard</h1>
        <p className="dashboard-count">
          {filtered.length} issue{filtered.length !== 1 ? 's' : ''} shown
        </p>

        {/* Sort tabs */}
        <div className="sort-tabs">
          <button
            className={`sort-tab ${sortBy === 'votes' ? 'active' : ''}`}
            onClick={() => setSortBy('votes')}
          >
            Top voted
          </button>
          <button
            className={`sort-tab ${sortBy === 'newest' ? 'active' : ''}`}
            onClick={() => setSortBy('newest')}
          >
            Newest
          </button>
        </div>

        {/* Filters */}
        <div className="filter-section">
          <div className="filter-row">
            <span className="filter-label">Status</span>
            <div className="filter-pills">
              {statusOptions.map((opt) => (
                <button
                  key={opt}
                  className={`filter-pill ${statusFilter === opt ? 'active' : ''}`}
                  onClick={() => setStatusFilter(opt)}
                >
                  {opt === 'all' ? 'All' : opt}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-row">
            <span className="filter-label">Issue type</span>
            <div className="filter-pills">
              {typeOptions.map((opt) => (
                <button
                  key={opt}
                  className={`filter-pill ${typeFilter === opt ? 'active' : ''}`}
                  onClick={() => setTypeFilter(opt)}
                >
                  {opt === 'all' ? 'All' : opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Issue list */}
        <div className="issues-list">
          {filtered.length > 0 ? (
            filtered.map((issue) => (
              <IssueCard key={issue._id} issue={issue} onVote={handleVote} />
            ))
          ) : (
            <div className="empty-state">
              No issues match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
