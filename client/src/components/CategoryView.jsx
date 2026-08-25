import { useState, useEffect } from 'react'
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function CategoryView({ category, onNavigate }) {
  const pinnedThreads = category.threads.filter((t) => t.pinned)
  const normalThreads = category.threads.filter((t) => !t.pinned)

  const { user } = useAuth();

  //const [topics, setTopics] = useState([]);
  //const [loading, setLoading] = useState(true);
  //const [error, setError] = useState(null);

  //useEffect(() => {
    //api('/topics')
      //.then(setTopics)
      //.catch(err => setError(err.message))
      //.finally(() => setLoading(false));
  //}, []);  // empty array = run once when component mounts

  //if (loading) return <p>Loading topics...</p>;
  //if (error) return <p>Error: {error}</p>;

  return (
    <div className="page-content">
      <div className="breadcrumb">
        <button className="breadcrumb-link" onClick={() => onNavigate('home')}>Home</button>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{category.name}</span>
      </div>

      <div className="category-page-header" style={{ borderLeft: `4px solid ${category.accentColor}` }}>
        <span className="category-page-icon">{category.icon}</span>
        <div>
          <h1 className="category-page-title">{category.name}</h1>
          <p className="category-page-desc">{category.description}</p>
        </div>
      </div>

      <div className="thread-list-header">
        <button className="btn-new-thread">+ New Thread</button>
      </div>

      <div className="thread-table">
        <div className="thread-table-head">
          <div className="thread-col-main">Thread</div>
          <div className="thread-col-stats">Replies</div>
          <div className="thread-col-stats">Views</div>
          <div className="thread-col-last">Last Post</div>
        </div>

        {pinnedThreads.map((thread) => (
          <ThreadRow
            key={thread.id}
            thread={thread}
            pinned
            onClick={() => onNavigate('thread', { thread, category })}
          />
        ))}
        {normalThreads.map((thread) => (
          <ThreadRow
            key={thread.id}
            thread={thread}
            onClick={() => onNavigate('thread', { thread, category })}
          />
        ))}

        {category.threads.length === 0 && (
          <div className="empty-state">No threads yet. Be the first to post!</div>
        )}
      </div>
    </div>
  )
}

function ThreadRow({ thread, pinned, onClick }) {
  return (
    <div className={`thread-row ${pinned ? 'thread-pinned' : ''}`} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      <div className="thread-col-main">
        <div className="thread-avatar">{thread.avatar}</div>
        <div className="thread-info">
          <div className="thread-title-row">
            {pinned && <span className="pin-badge">📌 Pinned</span>}
            <span className="thread-title">{thread.title}</span>
          </div>
          <div className="thread-meta">
            by <span className="thread-author">{thread.author}</span>
            <span className="thread-time"> · {thread.time}</span>
          </div>
        </div>
      </div>
      <div className="thread-col-stats">
        <span className="thread-stat-num">{thread.replies}</span>
      </div>
      <div className="thread-col-stats">
        <span className="thread-stat-num">{thread.views.toLocaleString()}</span>
      </div>
      <div className="thread-col-last">
        <div className="last-post-author">{thread.author}</div>
        <div className="last-post-time">{thread.time}</div>
      </div>
    </div>
  )
}
