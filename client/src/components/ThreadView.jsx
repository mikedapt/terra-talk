import { useState, useEffect } from 'react'
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function ThreadView({ thread, topic, onNavigate }) {

  const { user } = useAuth();
  const [form, setForm] = useState({ postbody: "", postauthor: user.id, postthread: thread.id});
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("http://localhost:3001/api/posts");
        const data = await res.json();
        if (!cancelled) setPosts(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setStatus("Could not load posts");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const threadPosts = posts.filter((p) => p.thread_id === thread.id);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/api/newpost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
         setStatus(data.error || "Something went wrong");
         return;
      }
      setStatus("New Post Created");
      window.location.reload()

    } catch {
      setStatus("Network error");
    }
  };

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
          <span>[thread views here]</span>
        </div>
      </div>

      <div className="posts-list">
          <div key={thread.id} className={`post-card ${thread.id === 0 ? 'post-op' : ''}`}>
            <div className="post-sidebar">
              <div className="post-avatar">A</div>
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
                <button className="post-action">👍 Like</button>
                <button className="post-action">💬 Quote</button>
                <button className="post-action">🚩 Report</button>
              </div>
            </div>
          </div>
      </div>



      <div className="posts-list">
        {threadPosts.map((post, idx) => (
          <div key={post.id} className={`post-card ${idx === 0 ? 'post-op' : ''}`}>
            <div className="post-sidebar">
              <div className="post-avatar">[Profle]</div>
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
                <button className="post-action">👍 Like</button>
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
      </div>
    </div>
  )
}
