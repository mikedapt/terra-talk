import { useState, useEffect } from 'react'
import { api } from '../api';
import { useAuth } from '../AuthContext';



export default function CategoryView({ topic, onNavigate }) {

  const currcategory = topic.name

  const { user } = useAuth();

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("http://localhost:3001/api/threads");
        const data = await res.json();
        if (!cancelled) setThreads(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setStatus("Could not load threads");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const topicThreads = threads.filter((t) => t.topic_id === topic.id);

  const pinnedThreads = topicThreads.filter((t) => t.is_pinned)
  const normalThreads = topicThreads.filter((t) => !t.is_pinned)

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
        <span className="breadcrumb-current">{topic.name}</span>
      </div>

      <div className="category-page-header" style={{ borderLeft: `4px solid ${topic.accentColor}` }}>
        <span className="category-page-icon">{topic.icon}</span>
        <div>
          <h1 className="category-page-title">{topic.name}</h1>
          <p className="category-page-desc">{topic.description}</p>
        </div>
      </div>

      <div className="thread-list-header">
        <button className="btn-new-thread" onClick={() => onNavigate('newthread', { topic })}>+ New Thread</button>
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
            onClick={() => onNavigate('thread', { thread, topic })}
          />
        ))}
        {normalThreads.map((thread) => (
          <ThreadRow
            key={thread.id}
            thread={thread}
            onClick={() => onNavigate('thread', { thread, topic })}
          />
        ))}

        {normalThreads.length === 0 && pinnedThreads.length === 0 && (
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
        <div className="thread-avatar"><img src={`http://localhost:3001/profiles/${thread.profile_path}`}></img></div>
        <div className="thread-info">
          <div className="thread-title-row">
            {pinned && <span className="pin-badge">📌 Pinned</span>}
            <span className="thread-title">{thread.title}</span>
          </div>
          <div className="thread-meta">
            by <span className="thread-author">{thread.username}</span>
            <span className="thread-time"> · {thread.created_at}</span>
          </div>
        </div>
      </div>
      <div className="thread-col-stats">
        <span className="thread-stat-num">{thread.replies}</span>
      </div>
      <div className="thread-col-stats">
        <span className="thread-stat-num">[insert thread views here]</span>
      </div>
      <div className="thread-col-last">
        <div className="last-post-author">{thread.username}</div>
        <div className="last-post-time">{thread.created_at}</div>
      </div>
    </div>
  )
}
