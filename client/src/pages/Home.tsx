import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Issue } from '../data/issues';
import IssueCard from '../components/IssueCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const features = [
  {
    title: 'Capture',
    description: 'Snap a photo and add a quick description.',
  },
  {
    title: 'Pin it',
    description: 'Note the location so crews know exactly where to go.',
  },
  {
    title: 'Track',
    description: 'Watch the status change from Reported to Resolved.',
  },
];

const Home = () => {
  const [issues, setIssues] = useState<Issue[]>([]);

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
      if (!res.ok) fetchIssues();
    } catch {
      fetchIssues();
    }
  };

  const activeCount = issues.filter((i) => i.status === 'In Progress').length;
  const resolvedCount = issues.filter((i) => i.status === 'Resolved').length;
  const topIssues = [...issues].sort((a, b) => b.votes - a.votes).slice(0, 3);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-badge">
            {activeCount} active issue{activeCount !== 1 ? 's' : ''} in your
            area
          </div>
          <h1 className="hero-heading">
            Fix the block.
            <br />
            One report at a time.
          </h1>
          <p className="hero-sub">
            Spot a pothole, broken streetlight, or overflowing bin? Snap a
            photo, drop a pin, and rally your neighbors to get it fixed.
          </p>
          <div className="hero-actions">
            <Link to="/report" className="btn btn-primary">
              Report an issue
            </Link>
            <Link to="/dashboard" className="btn btn-secondary">
              Browse dashboard
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">{issues.length}</span>
              <span className="stat-label">Reports filed</span>
            </div>
            <div className="stat">
              <span className="stat-value">{activeCount}</span>
              <span className="stat-label">In progress</span>
            </div>
            <div className="stat">
              <span className="stat-value">{resolvedCount}</span>
              <span className="stat-label">Resolved</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Issues */}
      <section className="top-section">
        <div className="container">
          <div className="top-header">
            <div>
              <h2 className="top-title">Top of the list</h2>
              <p className="top-sub">Most upvoted issues right now.</p>
            </div>
            <Link to="/dashboard" className="top-see-all">
              See all &rarr;
            </Link>
          </div>
          <div className="issues-list">
            {topIssues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} onVote={handleVote} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container">
          CivicPulse &middot; Built for stronger neighborhoods
        </div>
      </footer>
    </div>
  );
};

export default Home;
