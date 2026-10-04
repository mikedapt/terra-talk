import { useState, useEffect } from 'react'
import { api } from '../api';
import { useAuth } from '../AuthContext';



export default function CategoryView({ topic, onNavigate }) {

  const currcategory = topic.name

  const { user, token } = useAuth();

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/threads");
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

  const handleTogglePin = async (threadId, currentIsPinned) => {
    setThreads(prev =>
      prev.map(t => t.id === threadId ? { ...t, is_pinned: currentIsPinned ? 0 : 1 } : t)
    );
    try {
      const res = await fetch(`/api/threads/${threadId}/pin`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setThreads(prev =>
          prev.map(t => t.id === threadId ? { ...t, is_pinned: currentIsPinned } : t)
        );
      } else {
        const data = await res.json();
        setThreads(prev =>
          prev.map(t => t.id === threadId ? { ...t, is_pinned: data.is_pinned } : t)
        );
      }
    } catch {
      setThreads(prev =>
        prev.map(t => t.id === threadId ? { ...t, is_pinned: currentIsPinned } : t)
      );
    }
  };

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
            user={user}
            onTogglePin={handleTogglePin}
            onClick={() => onNavigate('thread', { thread, topic })}
          />
        ))}
        {normalThreads.map((thread) => (
          <ThreadRow
            key={thread.id}
            thread={thread}
            user={user}
            onTogglePin={handleTogglePin}
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

function ThreadRow({ thread, pinned, user, onTogglePin, onClick }) {

  const [counts, setPostCounts] = useState({ postcount: 0 });
  const [viewCount, setViewCount] = useState(null);
  const [recentpost, setRecentPost] = useState({ author: '', time: '' });

  useEffect(() => {
    fetch(`/api/postquery?thread_id=${thread.id}`)
      .then(r => r.json())
      .then(data => setPostCounts(data));

    fetch(`/api/viewquery?thread_id=${thread.id}`)
      .then(r => r.json())
      .then(data => setViewCount(data.viewcount))
      .catch(() => {});
  }, [thread.id]);

  useEffect(() => {
    fetch(`/api/recentpostquery?thread_id=${thread.id}`)
      .then(r => r.json())
      .then(data => setRecentPost(data));
  }, [thread.id]);

  return (
    <div className={`thread-row ${pinned ? 'thread-pinned' : ''}`} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      <div className="thread-col-main">
        <div className="thread-avatar"><img src={`/profiles/${thread.profile_path}`}></img></div>
        <div className="thread-info">
          <div className="thread-title-row">
            {pinned && <span className="pin-badge">📌 Pinned</span>}
            <span className="thread-title">{thread.title}</span>
            {!!user?.is_admin && (
              <button
                className="btn-pin-toggle"
                onClick={(e) => { e.stopPropagation(); onTogglePin(thread.id, thread.is_pinned); }}
                title={thread.is_pinned ? 'Unpin thread' : 'Pin thread'}
              >
                {thread.is_pinned ? '📌 Unpin' : '📌 Pin'}
              </button>
            )}
          </div>
          <div className="thread-meta">
            by <span className="thread-author">{thread.username}</span>
            <span className="thread-time"> · {thread.created_at}</span>
          </div>
        </div>
      </div>
      <div className="thread-col-stats">
        <span className="thread-stat-num">{counts.postcount}</span>
      </div>
      <div className="thread-col-stats">
        <span className="thread-stat-num">{viewCount !== null ? viewCount : '–'}</span>
      </div>
      <div className="thread-col-last">
        <div className="last-post-author">{recentpost.author}</div>
        <div className="last-post-time">{recentpost.time}</div>
      </div>
    </div>
  )
}
