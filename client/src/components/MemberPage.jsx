import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext';

export default function MemberPage({ onNavigate }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    fetch('http://localhost:3001/api/members', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(data => { setMembers(data); setLoading(false); })
      .catch(err => {
        if (err.name !== 'AbortError') setError('Failed to load members.');
        setLoading(false);
      });
    return () => controller.abort();
  }, [user]);

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  if (!user) {
    return (
      <div className="page-content">
        <div className="auth-container">
          <div className="policy-card">
            <h1 className="general-heading">Unauthorized User - Page Not Permitted</h1>
            <hr />
            <br />
            <button className="btn-submit-reply" onClick={() => onNavigate('home')}>Return to Homepage</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="breadcrumb">
        <button className="breadcrumb-link" onClick={() => onNavigate('home')}>Home</button>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">Members</span>
      </div>

      <div className="forum-section">
        <div className="section-header">
          <span className="section-title">Members</span>
        </div>
        <div className="category-list">
          {loading && <div className="empty-state">Loading members…</div>}
          {error && <div className="empty-state" style={{ color: 'var(--badge-admin-bg)' }}>{error}</div>}
          {!loading && !error && members.length === 0 && (
            <div className="empty-state">No members found.</div>
          )}
          {!loading && !error && members.map(member => (
            <div key={member.id} className="member-row" onClick={() => onNavigate('memberprofile', { memberId: member.id })} style={{ cursor: 'pointer' }}>
              <div className="member-avatar-wrap">
                <div className="thread-avatar">
                  {member.profile_path
                    ? <img src={`http://localhost:3001/profiles/${member.profile_path}`} alt={`${member.username}'s avatar`} />
                    : member.username.charAt(0).toUpperCase()
                  }
                </div>
              </div>
              <div className="member-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="member-username">{member.username}</span>
                  {member.is_admin === 1
                    ? <span className="role-badge admin">Admin</span>
                    : member.username.startsWith('moderator')
                      ? <span className="role-badge mod">Mod</span>
                      : <span className="role-badge member">Member</span>}
                </div>
                <div className="member-stats">
                  <span className="member-stat">📝 {member.thread_count ?? 0} threads</span>
                  <span className="member-stat">💬 {member.reply_count ?? 0} replies</span>
                  <span className="member-stat">👍 {member.total_likes ?? 0} likes</span>
                </div>
              </div>
              <div className="member-joined">
                <span className="member-joined-label">Joined</span>
                <span className="member-joined-date">{formatDate(member.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
