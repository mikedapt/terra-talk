import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'forum.db'));

db.pragma('journal_mode = WAL');         // better concurrency
db.pragma('foreign_keys = ON');          // off by default in SQLite

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    username     TEXT UNIQUE NOT NULL,
    email        TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS topics (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    title       TEXT NOT NULL,
    description TEXT,
    created_by  INTEGER NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS threads (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id  INTEGER NOT NULL,
    user_id    INTEGER NOT NULL,
    title      TEXT NOT NULL,
    body       TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)   REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS posts (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id  INTEGER NOT NULL,
    user_id    INTEGER NOT NULL,
    body       TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)   REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_threads_topic ON threads(topic_id);
  CREATE INDEX IF NOT EXISTS idx_posts_thread   ON posts(thread_id);
`);

export default db;