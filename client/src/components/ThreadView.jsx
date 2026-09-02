export default function ThreadView({ thread, topic, onNavigate }) {
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

      <div className="reply-box">
        <h3 className="reply-box-title">Post a Reply</h3>
        <textarea className="reply-textarea" placeholder="Write your reply here..." rows={5} />
        <div className="reply-box-footer">
          <button className="btn-submit-reply">Post Reply</button>
        </div>
      </div>
    </div>
  )
}
