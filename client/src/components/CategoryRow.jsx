export default function CategoryRow({ category, onClick }) {
  return (
    <div className="category-row" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      <div className="category-icon-wrap" style={{ background: category.accentColor + '22', borderLeft: `4px solid ${category.accentColor}` }}>
        <span className="category-icon">{category.icon}</span>
      </div>
      <div className="category-info">
        <div className="category-name">{category.name}</div>
        <div className="category-desc">{category.description}</div>
      </div>
      <div className="category-stats">
        <div className="stat-item">
          <span className="stat-num">{category.threadCount.toLocaleString()}</span>
          <span className="stat-lbl">Threads</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">{category.postCount.toLocaleString()}</span>
          <span className="stat-lbl">Posts</span>
        </div>
      </div>
      <div className="category-last-post">
        {category.lastPost ? (
          <>
            <div className="last-post-title" title={category.lastPost.title}>
              {category.lastPost.title}
            </div>
            <div className="last-post-meta">
              by <span className="last-post-author">{category.lastPost.author}</span>
              <span className="last-post-time"> · {category.lastPost.time}</span>
            </div>
          </>
        ) : (
          <span className="no-posts">No posts yet</span>
        )}
      </div>
    </div>
  )
}
