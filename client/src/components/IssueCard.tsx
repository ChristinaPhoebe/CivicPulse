import { useState } from 'react';
import type { Issue } from '../data/issues';

const VOTED_KEY = 'civicpulse_voted';

const getVotedIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(VOTED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const markVoted = (id: string) => {
  const ids = getVotedIds();
  ids.add(id);
  localStorage.setItem(VOTED_KEY, JSON.stringify([...ids]));
};

const statusClass = (status: string) => {
  if (status === 'Reported') return 'badge-reported';
  if (status === 'In Progress') return 'badge-progress';
  return 'badge-resolved';
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1d ago';
  return `${days}d ago`;
};

interface IssueCardProps {
  issue: Issue;
  onVote?: (id: string) => void;
}

const IssueCard = ({ issue, onVote }: IssueCardProps) => {
  const [hasVoted, setHasVoted] = useState(() => getVotedIds().has(issue._id));

  const handleVote = () => {
    if (hasVoted) return;
    markVoted(issue._id);
    setHasVoted(true);
    onVote?.(issue._id);
  };

  return (
    <div className="issue-card">
      <div className="issue-votes">
        <button
          className={`issue-vote-btn ${hasVoted ? 'voted' : ''}`}
          onClick={handleVote}
          disabled={hasVoted}
          title={hasVoted ? 'Already voted' : 'Vote up'}
        >
          {issue.votes}
        </button>
      </div>
      <div className="issue-body">
        <div className="issue-meta">
          <span className="issue-category">
            {issue.category}
          </span>
          <span className={`issue-badge ${statusClass(issue.status)}`}>
            {issue.status}
          </span>
        </div>
        <h3 className="issue-title">{issue.title}</h3>
        <p className="issue-desc">{issue.description}</p>
        <p className="issue-location">
          {issue.location}&middot;{timeAgo(issue.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default IssueCard;
