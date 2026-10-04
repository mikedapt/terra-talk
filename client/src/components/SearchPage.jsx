import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext';

export default function SearchPage({ onNavigate }) {
  const { user, token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) onNavigate('login');
  }, [user]);

  async function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) {
      setError('Please enter at least 2 characters.');
      setResults(null);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Search failed.'); setResults(null); }
      else setResults(data);
    } catch {
      setError('Network error. Please try again.');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  function snippet(text, max = 120) {
    if (!text) return '';
    return text.length > max ? text.slice(0, max) + '…' : text;
  }

  const hasResults = results && (
    results.topics.length > 0 || results.threads.length > 0 ||
    results.posts.length > 0 || results.members.length > 0
  );

  if (!user) return null;

  return (
    <div className="page-content">
      <div className="breadcrumb">
        <button className="breadcrumb-link" onClick={() => onNavigate('home')}>Home</button>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Search</span>
      </div>

      <div className="forum-section">
        <div className="section-header">
          <span className="section-title">Search</span>
        </div>

        <div style={{ padding: '1rem 1.25rem' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search topics, threads, posts, members…"
              style={{ flex: 1, minWidth: '200px', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', gap: '0.3rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}
            />
            <button type="submit" className="btn-submit-reply" style={{ margin: 0 }}>Search</button>
          </form>
          {error && <p style={{ color: 'var(--badge-admin-bg)', marginTop: '0.5rem', fontSize: '0.9rem' }}>{error}</p>}
        </div>
      </div>

      {loading && <div className="empty-state">Searching…</div>}

      {results && !loading && !hasResults && (
        <div className="empty-state">No results found for "{query}".</div>
      )}

      {results && !loading && hasResults && (
        <>
          {results.topics.length > 0 && (
            <div className="forum-section">
              <div className="section-header"><span className="section-title">Topics</span></div>
              <div className="category-list">
                {results.topics.map(t => (
                  <div key={t.id} className="member-row" style={{ cursor: 'pointer', gap: '1rem', alignItems: 'center' }}
                    onClick={() => onNavigate('topic', { topic: t })}>
                    {t.icon && (
                      <div style={{ fontSize: '1.5rem', width: '2.25rem', textAlign: 'center', flexShrink: 0 }}>{t.icon}</div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1, minWidth: 0 }}>
                      <span className="member-username">{t.name}</span>
                      {t.description && (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{snippet(t.description)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.threads.length > 0 && (
            <div className="forum-section">
              <div className="section-header"><span className="section-title">Threads</span></div>
              <div className="category-list">
                {results.threads.map(t => (
                  <div key={t.id} style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.3rem', backgroundColor: 'var(--bg-input)' }}
                    onClick={() => onNavigate('thread', {
                      thread: t,
                      topic: { id: t.topic_id, name: t.topic_name, icon: t.topic_icon, accentColor: t.topic_accentColor },
                    })}>
                    <span className="member-username" style={{ fontSize: '1rem' }}>{t.title}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      by {t.username} · in {t.topic_name}
                    </span>
                    {t.body && (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.4' }}>{snippet(t.body)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.posts.length > 0 && (
            <div className="forum-section">
              <div className="section-header"><span className="section-title">Posts</span></div>
              <div className="category-list">
                {results.posts.map(p => (
                  <div key={p.id} style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.3rem',backgroundColor: 'var(--bg-input)' }}
                    onClick={() => onNavigate('thread', {
                      thread: { id: p.thread_id, title: p.thread_title, body: p.thread_body, created_at: p.thread_created_at, username: p.thread_username, profile_path: p.thread_profile_path },
                      topic: { id: p.topic_id, name: p.topic_name, icon: p.topic_icon, accentColor: p.topic_accentColor },
                    })}>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: '1.4' }}>{snippet(p.body)}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      by {p.username} · in "{p.thread_title}"
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.members.length > 0 && (
            <div className="forum-section">
              <div className="section-header"><span className="section-title">Members</span></div>
              <div className="category-list">
                {results.members.map(m => (
                  <div key={m.id} className="member-row" style={{ cursor: 'pointer' }}
                    onClick={() => onNavigate('memberprofile', { memberId: m.id })}>
                    <div className="member-avatar-wrap">
                      <div className="thread-avatar">
                        {m.profile_path
                          ? <img src={`/profiles/${m.profile_path}`} alt={`${m.username}'s avatar`} />
                          : m.username.charAt(0).toUpperCase()
                        }
                      </div>
                    </div>
                    <div className="member-info">
                      <span className="member-username">{m.username}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
