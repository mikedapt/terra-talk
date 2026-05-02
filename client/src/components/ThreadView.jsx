export default function ThreadView({ thread, category, onNavigate }) {
  return (
    <div className="page-content">
      <div className="breadcrumb">
        <button className="breadcrumb-link" onClick={() => onNavigate('home')}>Home</button>
        <span className="breadcrumb-sep">›</span>
        <button className="breadcrumb-link" onClick={() => onNavigate('category', { category })}>{category.name}</button>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{thread.title}</span>
      </div>

      <div className="thread-page-header">
        <h1 className="thread-page-title">{thread.title}</h1>
        <div className="thread-page-meta">
          {thread.pinned && <span className="pin-badge">📌 Pinned</span>}
          <span>{thread.replies} replies</span>
          <span>·</span>
          <span>{thread.views.toLocaleString()} views</span>
        </div>
      </div>

      <div className="posts-list">
        {thread.posts.map((post, idx) => (
          <div key={post.id} className={`post-card ${idx === 0 ? 'post-op' : ''}`}>
            <div className="post-sidebar">
              <div className="post-avatar">{post.avatar}</div>
              <div className="post-author-name">{post.author}</div>
              <div className="post-author-role">
                {post.author === 'Admin' ? <span className="role-badge admin">Admin</span>
                  : post.author.startsWith('Moderator') ? <span className="role-badge mod">Mod</span>
                  : <span className="role-badge member">Member</span>}
              </div>
            </div>
            <div className="post-content">
              <div className="post-header">
                <span className="post-time">{post.time}</span>
                <span className="post-num">#{idx + 1}</span>
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
        <h3 className="reply-box-title">Post a Reply</h3>
        <textarea className="reply-textarea" placeholder="Write your reply here..." rows={5} />
        <div className="reply-box-footer">
          <button className="btn-submit-reply">Post Reply</button>
        </div>
      </div>
    </div>
  )
}
