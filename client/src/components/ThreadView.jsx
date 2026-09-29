import { useState, useEffect } from 'react'
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function ThreadView({ thread, topic, onNavigate }) {

  const { user, token } = useAuth();
  const [form, setForm] = useState({ postbody: "", postthread: thread.id});
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [viewCount, setViewCount] = useState(null);
  const [threadLike, setThreadLike] = useState({ count: 0, hasLiked: false });
  const [postLikes, setPostLikes] = useState({});


  const loadPosts = async () => {
    const res = await fetch("http://localhost:3001/api/posts");
    if (!res.ok) throw new Error(`GET /api/posts failed (${res.status})`);
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
  };

  const loadLikes = async () => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const [tl, pl] = await Promise.all([
      fetch(`http://localhost:3001/api/thread-likes?thread_id=${thread.id}`, { headers }).then(r => r.json()),
      fetch(`http://localhost:3001/api/post-likes?thread_id=${thread.id}`, { headers }).then(r => r.json()),
    ]);
    setThreadLike(tl);
    setPostLikes(pl);
  };

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    Promise.all([loadPosts(), loadLikes()])
      .catch(() => setStatus("Could not load posts"))
      .finally(() => setLoading(false));

    if (token) {
      fetch("http://localhost:3001/api/thread-view", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ thread_id: thread.id }),
        signal,
      }).catch(() => {});
    }

    fetch(`http://localhost:3001/api/viewquery?thread_id=${thread.id}`, { signal })
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
      const res = await fetch('http://localhost:3001/api/thread-likes', {
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
      const res = await fetch('http://localhost:3001/api/post-likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ post_id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPostLikes(pl => ({ ...pl, [post_id]: { count: data.count, hasLiked: data.liked } }));
    } catch { setPostLikes(prev); }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/api/newpost", {
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
              <div className="post-avatar"><img src={`http://localhost:3001/profiles/${thread.profile_path}`}></img></div>
              <div className="post-author-name">{thread.username}</div>
              <div className="post-author-role">
                {thread.username === 'admin' ? <span className="role-badge admin">Admin</span>
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
                <button className="post-action">💬 Quote</button>
                <button className="post-action">🚩 Report</button>
              </div>
            </div>
          </div>
      </div>



      <div className="posts-list">
        {threadPosts.map((post, idx) => (
          <div key={post.id} className='post-card'>
            <div className="post-sidebar">
              <div className="post-avatar"><img src={`http://localhost:3001/profiles/${post.profile_path}`}></img></div>
              <div className="post-author-name">{post.username}</div>
              <div className="post-author-role">
                {post.username === 'admin' ? <span className="role-badge admin">Admin</span>
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
                <button className="post-action">💬 Quote</button>
                <button className="post-action">🚩 Report</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      

      <div className="reply-box">
        <form id="thread-form" onSubmit={handleSubmit} noValidate>
          <h3 className="reply-box-title">Post a Reply</h3>
          <textarea className="reply-textarea" placeholder="Write your reply here..." id="postbody" name="postbody" value={form.postbody} onChange={handleChange} rows={5} />
          <div className="reply-box-footer">
            <button type="submit" className="btn-submit-reply">Post Reply</button>
          </div>
        </form>
        {status && <p className="reply-status">{status}</p>}
      </div>
    </div>
  )
}
