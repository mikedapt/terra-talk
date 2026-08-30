import { forumSections, forumStats } from '../data/mockData'
import CategoryRow from './CategoryRow'
import { useState, useEffect } from 'react'
import { api } from '../api';

export default function ForumHome({ onNavigate }) {

  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 // useEffect(() => {
    //api('/categories')
      //.then(setCategories)
      //.catch(err => setError(err.message))
      //.finally(() => setLoading(false));
  //}, []);  // empty array = run once when component mounts


  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("http://localhost:3001/api/categories");
        const data = await res.json();
        if (!cancelled) setCategories(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setError("Could not load categories");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);


  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("http://localhost:3001/api/topics");
        const data = await res.json();
        if (!cancelled) setTopics(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setStatus("Could not load topics");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
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
              <li><span className="stat-label">Threads</span><span className="stat-value">0</span></li>
              <li><span className="stat-label">Posts</span><span className="stat-value">0</span></li>
              <li><span className="stat-label">Members</span><span className="stat-value">0</span></li>
              <li><span className="stat-label">Online Now</span><span className="stat-value online">0</span></li>
            </ul>
            <div className="newest-member">
              Newest: <span className="member-link">ReginaldTheBrawn</span>
            </div>
          </div>

          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Quick Links</h3>
            <ul className="quick-links">
              <li><button className="quick-link-btn">📋 Server Rules</button></li>
              <li><button className="quick-link-btn">🗺️ Server Map</button></li>
              <li><button className="quick-link-btn">🛍️ Server Shop</button></li>
              <li><button className="quick-link-btn">📊 Leaderboards</button></li>
              <li><button className="quick-link-btn">🎫 Ban Appeals</button></li>
              <li><button className="quick-link-btn">💬 Discord</button></li>
            </ul>
          </div>

          <div className="sidebar-card server-info-card">
            <h3 className="sidebar-card-title">Server Info</h3>
            <div className="server-address">
              <span className="server-label">IP Address</span>
              <code className="server-ip">play.yourserver.net</code>
            </div>
            <div className="server-version">
              <span className="version-badge">Java 1.21.4</span>
              <span className="version-badge">Bedrock 1.21.x</span>
            </div>
            <div className="server-status">
              <span className="status-dot online"></span>
              <span className="status-text">Server Online</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );


}
