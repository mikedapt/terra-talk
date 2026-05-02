import { forumSections, forumStats } from '../data/mockData'
import CategoryRow from './CategoryRow'

export default function ForumHome({ onNavigate }) {
  return (
    <div className="page-content">
      <div className="forum-layout">
        <div className="forum-main">
          {forumSections.map((section) => (
            <div key={section.id} className="forum-section">
              <div className="section-header">
                <h2 className="section-title">{section.name}</h2>
              </div>
              <div className="category-list">
                {section.categories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    onClick={() => onNavigate('category', { category })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <aside className="forum-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Forum Statistics</h3>
            <ul className="stats-list">
              <li><span className="stat-label">Threads</span><span className="stat-value">{forumStats.totalThreads.toLocaleString()}</span></li>
              <li><span className="stat-label">Posts</span><span className="stat-value">{forumStats.totalPosts.toLocaleString()}</span></li>
              <li><span className="stat-label">Members</span><span className="stat-value">{forumStats.totalMembers.toLocaleString()}</span></li>
              <li><span className="stat-label">Online Now</span><span className="stat-value online">{forumStats.onlineNow}</span></li>
            </ul>
            <div className="newest-member">
              Newest: <span className="member-link">{forumStats.newestMember}</span>
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
  )
}
