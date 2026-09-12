import { forumSections, forumStats } from '../data/mockData'
import CategoryRow from './CategoryRow'
import { useState, useEffect } from 'react'
import { api } from '../api';

const API = 'http://localhost:3001/api';

export default function ForumHome({ onNavigate }) {

  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [quicklinks, setQuicklinks] = useState([]);
  const [stats, setStats] = useState({ threads: 0, posts: 0, members: 0, online: 0, newest: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadServerInfo = () => ({
    address: localStorage.getItem('serverAddress') || 'play.yourserver.net',
    versions: (() => { try { return JSON.parse(localStorage.getItem('serverVersions')) || ['Java 1.21.4', 'Bedrock 1.21.x']; } catch { return ['Java 1.21.4', 'Bedrock 1.21.x']; } })(),
    online: localStorage.getItem('serverOnline') !== 'false',
  });
  const [serverInfo, setServerInfo] = useState(loadServerInfo);

 // useEffect(() => {
    //api('/categories')
      //.then(setCategories)
      //.catch(err => setError(err.message))
      //.finally(() => setLoading(false));
  //}, []);  // empty array = run once when component mounts


   useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('token'); // adjust to wherever you store the JWT
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    (async () => {
      try {
        const [cats, tops, st, qls] = await Promise.all([
          fetch(`${API}/categories`).then(r => r.json()),
          fetch(`${API}/topics`).then(r => r.json()),
          fetch(`${API}/stats`, { headers }).then(r => r.json()),
          fetch(`${API}/quicklinks`).then(r => r.json()),
        ]);
        if (cancelled) return;
        setCategories(Array.isArray(cats) ? cats : []);
        setTopics(Array.isArray(tops) ? tops : []);
        setStats(st);
        setQuicklinks(Array.isArray(qls) ? qls : []);
      } catch {
        if (!cancelled) setError('Could not load the forum');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handler = () => setServerInfo(loadServerInfo());
    window.addEventListener('siteSettingsChanged', handler);
    return () => window.removeEventListener('siteSettingsChanged', handler);
  }, []);


  if (loading) return <p>Loading categories...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="page-content">
      <div className="forum-layout">
        <div className="forum-main">
          {categories.map((section) => {
            const sectionTopics = topics.filter(
              (topic) => topic.category_id === section.id
            );

            return (
              <div key={section.id} className="forum-section">
                <div className="section-header">
                  <h2 className="section-title">{section.name}</h2>
                </div>
                <div className="category-list">
                  {sectionTopics.map((topic) => (
                    <CategoryRow
                      key={topic.id}
                      topic={topic}
                      onClick={() => onNavigate('topic', { topic })}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <aside className="forum-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Forum Statistics</h3>
            <ul className="stats-list">
              <li><span className="stat-label">Threads</span><span className="stat-value">{stats.threads.toLocaleString()}</span></li>
              <li><span className="stat-label">Posts</span><span className="stat-value">{stats.posts.toLocaleString()}</span></li>
              <li><span className="stat-label">Members</span><span className="stat-value">{stats.members.toLocaleString()}</span></li>
              <li><span className="stat-label">Online Now</span><span className="stat-value online">{stats.online}</span></li>
            </ul>
            <div className="newest-member">
              Newest: <span className="member-link">{stats.newest ?? '—'}</span>
            </div>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Quick Links</h3>
            <ul className="quick-links">
              {quicklinks.map(ql => (
                <li key={ql.id}>
                  <button
                    className="quick-link-btn"
                    onClick={() => ql.link && ql.link !== '#' && window.open(ql.link, '_blank', 'noopener,noreferrer')}
                  >
                    {ql.icon} {ql.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="sidebar-card server-info-card">
            <h3 className="sidebar-card-title">Server Info</h3>
            <div className="server-address">
              <span className="server-label">IP Address</span>
              <code className="server-ip">{serverInfo.address}</code>
            </div>
            <div className="server-version">
              {serverInfo.versions.map(v => (
                <span key={v} className="version-badge">{v}</span>
              ))}
            </div>
            <div className="server-status">
              <span className={`status-dot ${serverInfo.online ? 'online' : 'offline'}`}></span>
              <span className="status-text">{serverInfo.online ? 'Server Online' : 'Server Offline'}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );


}
