import { useState, useEffect, useRef } from 'react'
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function ThreadView({ thread, topic, onNavigate }) {

  const { user, token } = useAuth();
  const [form, setForm] = useState({ postbody: "", postthread: thread.id});
  const textareaRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [viewCount, setViewCount] = useState(null);
  const [threadLike, setThreadLike] = useState({ count: 0, hasLiked: false });
  const [postLikes, setPostLikes] = useState({});
  const [threadReport, setThreadReport] = useState({ count: 0, hasReported: false });
  const [postReports, setPostReports] = useState({});


  const loadPosts = async () => {
    const res = await fetch("/api/posts");
    if (!res.ok) throw new Error(`GET /api/posts failed (${res.status})`);
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
  };

  const loadLikes = async () => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const [tl, pl] = await Promise.all([
      fetch(`/api/thread-likes?thread_id=${thread.id}`, { headers }).then(r => r.json()),
      fetch(`/api/post-likes?thread_id=${thread.id}`, { headers }).then(r => r.json()),
    ]);
    setThreadLike(tl);
    setPostLikes(pl);
  };

  const loadReports = async () => {
    if (!token) return;
    const data = await fetch(`/api/reports?thread_id=${thread.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json());
    setThreadReport(data.thread);
    setPostReports(data.posts);
  };

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    Promise.all([loadPosts(), loadLikes(), loadReports()])
      .catch(() => setStatus("Could not load posts"))
      .finally(() => setLoading(false));

    if (token) {
      fetch("/api/thread-view", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ thread_id: thread.id }),
        signal,
      }).catch(() => {});
    }

    fetch(`/api/viewquery?thread_id=${thread.id}`, { signal })
      .then(r => r.json())
      .then(data => setViewCount(data.viewcount))
      .catch(() => {});

    return () => controller.abort();
  }, [thread.id]);


  const threadPosts = posts.filter((p) => p.thread_id === thread.id);


  const handleThreadLike = async () => {
    if (!user) return;
    const prev = threadLike;
    setThreadLike(tl => ({ count: tl.hasLiked ? tl.count - 1 : tl.count + 1, hasLiked: !tl.hasLiked }));
    try {
      const res = await fetch('/api/thread-likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ thread_id: thread.id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setThreadLike({ count: data.count, hasLiked: data.liked });
    } catch { setThreadLike(prev); }
  };

  const handlePostLike = async (post_id) => {
    if (!user) return;
    const prev = postLikes;
    const current = postLikes[post_id] || { count: 0, hasLiked: false };
    setPostLikes(pl => ({ ...pl, [post_id]: { count: current.hasLiked ? current.count - 1 : current.count + 1, hasLiked: !current.hasLiked } }));
    try {
      const res = await fetch('/api/post-likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ post_id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPostLikes(pl => ({ ...pl, [post_id]: { count: data.count, hasLiked: data.liked } }));
    } catch { setPostLikes(prev); }
  };

  const handleThreadReport = async () => {
    if (!user) return;
    const prev = threadReport;
    setThreadReport(r => ({ count: r.hasReported ? r.count - 1 : r.count + 1, hasReported: !r.hasReported }));
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ target_type: 'thread', target_id: thread.id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setThreadReport({ count: data.count, hasReported: data.reported });
    } catch { setThreadReport(prev); }
  };

  const handlePostReport = async (post_id) => {
    if (!user) return;
    const prev = postReports;
    const current = postReports[post_id] || { count: 0, hasReported: false };
    setPostReports(pr => ({ ...pr, [post_id]: { count: current.hasReported ? current.count - 1 : current.count + 1, hasReported: !current.hasReported } }));
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ target_type: 'post', target_id: post_id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPostReports(pr => ({ ...pr, [post_id]: { count: data.count, hasReported: data.reported } }));
    } catch { setPostReports(prev); }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQuote = (text) => {
    const quoted = `"${text}"\n\n`;
    setForm(f => ({ ...f, postbody: quoted + f.postbody }));
    textareaRef.current?.scrollIntoView({ behavior: 'smooth' });
    textareaRef.current?.focus();
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/newpost", {
        method: "POST",
        headers: { "Content-Type": "application/json",
                   Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify({ postbody: form.postbody, postthread: thread.id }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        setStatus(data.error || `Request failed (${res.status})`);
        return;
      }

      setStatus("New Post Created");
      setForm((f) => ({ ...f, postbody: "" }));
    } catch (err) {
      console.error("submit failed:", err);
      setStatus("Network error");
      return;
    }

    try {
      await loadPosts();
    } catch (err) {
      console.error("reload failed:", err);
      setStatus("Posted, but couldn't refresh the list");
    }
  };

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="page-content">
      <div className="breadcrumb">
        <button className="breadcrumb-link" onClick={() => onNavigate('home')}>Home</button>
        <span className="breadcrumb-sep">›</span>
        <button className="breadcrumb-link" onClick={() => onNavigate('topic', { topic })}>{topic.name}</button>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{thread.title}</span>
      </div>

      <div className="thread-page-header">
        <h1 className="thread-page-title">{thread.title}</h1>
        <div className="thread-page-meta">
          {thread.pinned && <span className="pin-badge">📌 Pinned</span>}
          <span>{thread.replies} replies</span>
          <span>·</span>
          <span>{viewCount !== null ? viewCount.toLocaleString() : '–'} views</span>
        </div>
      </div>

      <div className="posts-list">
          <div key={thread.id} className='post-card post-op'>
            <div className="post-sidebar">
              <div className="post-avatar"><img src={`/profiles/${thread.profile_path}`}></img></div>
              <div className="post-author-name">{thread.username}</div>
              <div className="post-author-role">
                {thread.is_admin === 1 ? <span className="role-badge admin">Admin</span>
                  : thread.username.startsWith('moderator') ? <span className="role-badge mod">Mod</span>
                  : <span className="role-badge member">Member</span>}
              </div>
            </div>
            <div className="post-content">
              <div className="post-header">
                <span className="post-time">{thread.created_at}</span>
                <span className="post-num">#1</span>
              </div>
              <div className="post-body">
                {thread.body.split('\n').map((line, i) => (
                  <p key={i}>{line || <br />}</p>
                ))}
              </div>
              <div className="post-footer">
                <button
                  className={`post-action${threadLike.hasLiked ? ' liked' : ''}`}
                  onClick={handleThreadLike}
                  disabled={!user}
                >
                  {threadLike.count > 0 ? `👍 ${threadLike.count}` : '👍 Like'}
                </button>
                <button className="post-action" onClick={() => handleQuote(thread.body)} disabled={!user}>💬 Quote</button>
                <button
                  className={`post-action${threadReport.hasReported ? ' reported' : ''}`}
                  onClick={handleThreadReport}
                  disabled={!user}
                >
                  {threadReport.count > 0 ? `🚩 ${threadReport.count}` : '🚩 Report'}
                </button>
              </div>
            </div>
          </div>
      </div>



      <div className="posts-list">
        {threadPosts.map((post, idx) => (
          <div key={post.id} className='post-card'>
            <div className="post-sidebar">
              <div className="post-avatar"><img src={`/profiles/${post.profile_path}`}></img></div>
              <div className="post-author-name">{post.username}</div>
              <div className="post-author-role">
                {post.is_admin === 1 ? <span className="role-badge admin">Admin</span>
                  : post.username.startsWith('moderator') ? <span className="role-badge mod">Mod</span>
                  : <span className="role-badge member">Member</span>}
              </div>
            </div>
            <div className="post-content">
              <div className="post-header">
                <span className="post-time">{post.created_at}</span>
                <span className="post-num">#{idx + 2}</span>
              </div>
              <div className="post-body">
                {post.body.split('\n').map((line, i) => (
                  <p key={i}>{line || <br />}</p>
                ))}
              </div>
              <div className="post-footer">
                <button
                  className={`post-action${postLikes[post.id]?.hasLiked ? ' liked' : ''}`}
                  onClick={() => handlePostLike(post.id)}
                  disabled={!user}
                >
                  {postLikes[post.id]?.count > 0 ? `👍 ${postLikes[post.id].count}` : '👍 Like'}
                </button>
                <button className="post-action" onClick={() => handleQuote(post.body)} disabled={!user}>💬 Quote</button>
                <button
                  className={`post-action${postReports[post.id]?.hasReported ? ' reported' : ''}`}
                  onClick={() => handlePostReport(post.id)}
                  disabled={!user}
                >
                  {postReports[post.id]?.count > 0 ? `🚩 ${postReports[post.id].count}` : '🚩 Report'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      

      <div className="reply-box">
        <form id="thread-form" onSubmit={handleSubmit} noValidate>
          <h3 className="reply-box-title">Post a Reply</h3>
          <textarea className="reply-textarea" placeholder="Write your reply here..." id="postbody" name="postbody" value={form.postbody} onChange={handleChange} rows={5} ref={textareaRef} />
          <div className="reply-box-footer">
            <button type="submit" className="btn-submit-reply">Post Reply</button>
          </div>
        </form>
        {status && <p className="reply-status">{status}</p>}
      </div>
    </div>
  )
}
