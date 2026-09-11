import { useState, useEffect } from 'react'

export default function CategoryRow({ topic, onClick }) {

  //lastPost
  const [counts, setCounts] = useState({ threadcount: 0, postcount: 0 });
  const [latestpost, setLastPost] = useState({ threadtitle: "", author: "", time: ""});

  useEffect(() => {
    fetch(`http://localhost:3001/api/threadpostquery?topic_id=${topic.id}`)
      .then(r => r.json())
      .then(data => setCounts(data));
  }, [topic.id]);



  useEffect(() => {
    fetch(`http://localhost:3001/api/latestpostquery?topic_id=${topic.id}`)
      .then(r => r.json())
      .then(data => setLastPost(data));
  }, [topic.id]);

  return (
    <div className="category-row" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      <div className="category-icon-wrap" style={{ background: topic.accentColor + '22', borderLeft: `4px solid ${topic.accentColor}` }}>
        <span className="category-icon">{topic.icon}</span>
      </div>
      <div className="category-info">
        <div className="category-name">{topic.name}</div>
        <div className="category-desc">{topic.description}</div>
      </div>
      <div className="category-stats">
        <div className="stat-item">
          <span className="stat-num">{counts.threadcount}</span>
          <span className="stat-lbl">Threads</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">{counts.postcount}</span>
          <span className="stat-lbl">Posts</span>
        </div>
      </div>
      <div className="category-last-post">
        {topic ? (
          <>
            <div className="last-post-title" title="lastPost">
              {latestpost.threadtitle}
            </div>
            <div className="last-post-meta">
              by <span className="last-post-author">{latestpost.author}</span>
              <span className="last-post-time"> · {latestpost.time}</span>
            </div>
          </>
        ) : (
          <span className="no-posts">No posts yet</span>
        )}
      </div>
    </div>
  )
}
