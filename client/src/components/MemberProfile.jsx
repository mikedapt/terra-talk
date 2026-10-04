import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext';

export default function MemberProfile({ memberId, onNavigate }) {
  const { user } = useAuth();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    fetch(`/api/members/${memberId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      signal: controller.signal,
    })
      .then(res => {
        if (!res.ok) throw new Error('Member not found.');
        return res.json();
      })
      .then(data => { setMember(data); setLoading(false); })
      .catch(err => {
        if (err.name !== 'AbortError') { setError(err.message || 'Failed to load member.'); setLoading(false); }
      });
    return () => controller.abort();
  }, [memberId, user]);

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
        <button className="breadcrumb-link" onClick={() => onNavigate('memberpage')}>Members</button>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{member?.username ?? '…'}</span>
      </div>

      <div className="forum-section">
        <div className="section-header">
          <span className="section-title">Member Profile</span>
        </div>
        <div className="category-list">
          {loading && <div className="empty-state">Loading…</div>}
          {error && <div className="empty-state" style={{ color: 'var(--badge-admin-bg)' }}>{error}</div>}
          {!loading && !error && member && (
            <div className="member-profile-card">
              {member.is_admin === 1
                ? <span className="role-badge admin">Admin</span>
                : member.username.startsWith('moderator')
                  ? <span className="role-badge mod">Mod</span>
                  : <span className="role-badge member">Member</span>}
              <span className="member-username member-profile-name">{member.username}</span>
              <div className="member-avatar-wrap" style={{ width: '80px', height: '80px' }}>
                <div className="thread-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  {member.profile_path
                    ? <img src={`/profiles/${member.profile_path}`} alt={`${member.username}'s avatar`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : member.username.charAt(0).toUpperCase()
                  }
                </div>
              </div>
              <div className="member-profile-stats">
                <div className="member-joined">
                  <span className="member-joined-label">Registered</span>
                  <span className="member-joined-date">{formatDate(member.created_at)}</span>
                </div>
                <div className="member-joined">
                  <span className="member-joined-label">Threads</span>
                  <span className="member-joined-date">{member.thread_count ?? 0}</span>
                </div>
                <div className="member-joined">
                  <span className="member-joined-label">Replies</span>
                  <span className="member-joined-date">{member.reply_count ?? 0}</span>
                </div>
                <div className="member-joined">
                  <span className="member-joined-label">Likes Received</span>
                  <span className="member-joined-date">{member.total_likes ?? 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
