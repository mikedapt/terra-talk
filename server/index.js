import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db.js';

import path from 'path';
import { fileURLToPath } from 'url';

import multer from 'multer';
import fs from 'fs';



//password reset 

import crypto from 'crypto';
import { sendResetEmail } from './mailer.js';

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

//password reset limits

import rateLimit from 'express-rate-limit';
import { ipKeyGenerator } from 'express-rate-limit';

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,        // 1 hour
  limit: 5,                         // 5 requests per IP per window
  standardHeaders: 'draft-7',       // RateLimit-* response headers
  legacyHeaders: false,             // drop the old X-RateLimit-* headers
  keyGenerator: (req, res) =>
    `${ipKeyGenerator(req.ip)}:${(req.body?.username || '').toLowerCase()}`,
  message: { error: 'Too many reset requests. Try again in an hour.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,        // 15 minutes
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again shortly.' },
});



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';



// Create a path for uploaded content to the server
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
//app.use(cors({ origin: 'http://localhost:5173'}));
app.use(express.json());



// --- Online tracking (in-memory) ---
const ONLINE_WINDOW_MS = 5 * 60 * 1000; // "online" = active in the last 5 minutes
const lastSeen = new Map(); // userId -> timestamp

app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const { id } = jwt.verify(token, JWT_SECRET);
      lastSeen.set(id, Date.now());
    } catch { /* bad tokens are rejected by authRequired where it matters */ }
  }
  next();
});

function countOnline() {
  const cutoff = Date.now() - ONLINE_WINDOW_MS;
  for (const [id, ts] of lastSeen) {
    if (ts < cutoff) lastSeen.delete(id); // prune stale entries as we go
  }
  return lastSeen.size;
}

// --- Stats ---
const statsQuery = db.prepare(`
  SELECT
    (SELECT COUNT(*) FROM threads) AS threads,
    (SELECT COUNT(*) FROM posts)   AS posts,
    (SELECT COUNT(*) FROM users)   AS members,
    (SELECT username FROM users ORDER BY id DESC LIMIT 1) AS newest
`);

app.get('/api/stats', (req, res) => {
  res.json({ ...statsQuery.get(), online: countOnline() });
});

// --- Thread / Post Count ---
const ThreadPostQuery = db.prepare(`
  SELECT
    COUNT(DISTINCT t.id) AS threadcount,
    COUNT(p.id) AS postcount
    FROM threads t
    LEFT JOIN posts p ON p.thread_id = t.id
    WHERE t.topic_id = ?
`);

app.get('/api/threadpostquery', (req, res) => {

  res.json({ ...ThreadPostQuery.get(req.query.topic_id) });
});

// --- Thread / Post Count ---
const PostQuery = db.prepare(`
  SELECT
    COUNT(p.id) AS postcount
    FROM threads t
    LEFT JOIN posts p ON p.thread_id = t.id
    WHERE t.id = ?
`);

app.get('/api/postquery', (req, res) => {

  res.json({ ...PostQuery.get(req.query.thread_id) });
});


// --- Latest Post ---
const LatestPostQuery = db.prepare(`
  SELECT
     t.title AS threadtitle,
     u.username AS author,
     t.created_at AS time
     FROM threads t
     INNER JOIN users u ON t.user_id = u.id
     WHERE t.topic_id = ? 
     ORDER BY t.created_at LIMIT 1 `);

app.get('/api/latestpostquery', (req, res) => {

  res.json({ ...LatestPostQuery.get(req.query.topic_id) });
});

const LastPostQuery = db.prepare(`
  SELECT
     u.username AS author,
     p.created_at AS time
     FROM posts p
     INNER JOIN users u ON p.user_id = u.id
     WHERE p.thread_id = ? 
     ORDER BY p.created_at LIMIT 1 `);

app.get('/api/recentpostquery', (req, res) => {

  res.json({ ...LastPostQuery.get(req.query.thread_id) });
});



// Uploader Variables

const PROFILE_DIR = path.join(__dirname, 'public', 'profiles');
fs.mkdirSync(PROFILE_DIR, { recursive: true });

const LOGO_DIR = path.join(__dirname, 'public', 'logos');
fs.mkdirSync(LOGO_DIR, { recursive: true });

const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, PROFILE_DIR),
    filename: (req, file, cb) => {
      // req.user exists here because authRequired runs before multer on the route below.
      // Timestamp in the name means the browser never serves a stale cached avatar.
      const ext = ALLOWED_TYPES[file.mimetype] || '.png';
      cb(null, `user_${req.user.id}_${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES[file.mimetype]) {
      return cb(new Error('Choose a JPEG, PNG, WebP, or GIF image.'));
    }
    cb(null, true);
  },
});




const logoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, LOGO_DIR),
    filename: (req, file, cb) => {
      const ext = ALLOWED_TYPES[file.mimetype] || '.png';
      cb(null, `logo_${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES[file.mimetype]) return cb(new Error('Choose a JPEG, PNG, WebP, or GIF image.'));
    cb(null, true);
  },
});

// auth middleware
function authRequired(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function adminRequired(req, res, next) {
  if (req.user?.username !== 'admin') {
    return res.status(403).json({ error: 'Admins only' });
  }
  next();
}

// --- Auth ---


app.get('/api/me', authRequired, (req, res) => {
  const user = db.prepare('SELECT id, username, profile_path FROM users WHERE id = ?').get(req.user.id);
  res.json({ user });
});



app.patch('/api/me/username', authRequired, (req, res) => {
  const username = req.body.username?.trim();
  if (!username) return res.status(400).json({ error: 'Username is required.' });
  const taken = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, req.user.id);
  if (taken) return res.status(400).json({ error: 'Username is already taken.' });
  db.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, req.user.id);
  const token = jwt.sign({ id: req.user.id, username }, JWT_SECRET);
  res.json({ token, username });
});

app.patch('/api/me/email', authRequired, (req, res) => {
  const email = req.body.email?.trim();
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  const taken = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.user.id);
  if (taken) return res.status(400).json({ error: 'Email is already in use.' });
  db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email, req.user.id);
  res.json({ email });
});

app.post('/api/me/avatar', authRequired, avatarUpload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image was uploaded.' });
 
  const current = db
    .prepare('SELECT profile_path FROM users WHERE id = ?')
    .get(req.user.id);
 
  db.prepare('UPDATE users SET profile_path = ? WHERE id = ?')
    .run(req.file.filename, req.user.id);
 
  // Clean up the previous upload, but never the shared default icon
  if (current?.profile_path && current.profile_path !== 'default_profile_icon.png' && current.profile_path !== 'default_admin_profile_icon.png') {
    fs.unlink(path.join(PROFILE_DIR, current.profile_path), () => {});
  }
 
  res.json({ profile_path: req.file.filename });
});




app.post('/api/admin/logo', authRequired, adminRequired, logoUpload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image was uploaded.' });
  res.json({ logo_path: req.file.filename });
});

app.post('/api/register', async (req, res) => {
  const { username, email, password, confirm, agree } = req.body;
  if (password == confirm) {
     if (agree == true) {
         try {
              const proicon = "default_profile_icon.png";
              const hash = await bcrypt.hash(password, 10);
              const info = db.prepare(
              'INSERT INTO users (username, email, profile_path, password_hash) VALUES (?, ?, ?, ?)'
              ).run(username, email, proicon, hash);
              const token = jwt.sign({ id: info.lastInsertRowid, username }, JWT_SECRET);
              res.json({ token, user: { id: info.lastInsertRowid, username, profile_path: proicon } });
              //res.status(400).json({ error: agree });
              console.log("register success!");
        } catch (e) {
          //res.status(400).json({ error: 'Username or email already taken' });
          res.status(400).json({ error: e });
          console.log(e);
        }
     } else {
       res.status(400).json({ error: 'acknowledgement checkbox unchecked' });
       //console.log("failure"); 
     }
  } else {
    res.status(400).json({ error: 'passwords do not match' });
    //console.log("failure");
  }
  
});


app.post('/api/forgotpwd', resetLimiter, async (req, res) => {
  const { username } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username);

  const generic = { message: 'If that account exists, a reset link has been sent.' };

  if (!user) {
        return res.json(generic);
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // invalidate any outstanding tokens for this user
  db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(user.id);
  db.prepare(
    'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)'
  ).run(user.id, tokenHash, Date.now() + RESET_TTL_MS);

  const link = `http://localhost:5173/reset?token=${token}`;

  try {
    await sendResetEmail(user.email, link);
    console.log('reset link for', user.email, '->', link);
  } catch (e) {
    console.error('mail send failed:', e.message);
  }

  res.json(generic);
  
});

app.post('/api/resetpwd', resetLimiter, async (req, res) => {
  const { token, password, confirm } = req.body;

  if (!token || !password) return res.status(400).json({ error: 'Missing fields' });
  if (password !== confirm) return res.status(400).json({ error: 'Passwords do not match' });

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const row = db.prepare(
    'SELECT * FROM password_resets WHERE token_hash = ?'
  ).get(tokenHash);

  if (!row || row.used_at || row.expires_at < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired reset link' });
  }

  const hash = await bcrypt.hash(password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, row.user_id);
  db.prepare('UPDATE password_resets SET used_at = ? WHERE id = ?').run(Date.now(), row.id);

  res.json({ message: 'Password updated. You can now log in.' });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT id, username, password_hash, profile_path FROM users WHERE username = ?').get(username);

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
     return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
  res.json({ token, user: { id: user.id, username: user.username, profile_path: user.profile_path } });
  console.log("login success!");
});

// --- Servers ---
/**app.get("/api/categories", (req, res) => {
  db.all("SELECT id, name, description FROM categories ORDER BY name", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});**/

app.get('/api/categories', (req, res) => {
  const rows = db.prepare(`SELECT id, name, description FROM categories ORDER BY id`).all();
  res.json(rows);
});

/**app.get('/api/categories', (req, res) => {
  const rows = db.prepare(`
    SELECT s.*, u.username AS creator
    FROM categories s JOIN users u ON u.id = s.created_by
    ORDER BY s.created_at DESC
  `).all();
  res.json(rows);
});**/

app.post('/api/categories', authRequired, adminRequired, (req, res) => {
  const { catname, catdesc } = req.body;
  if (db.prepare('SELECT 1 FROM categories WHERE name = ?').get(catname)) {
    return res.status(409).json({ error: 'Category already exists' });
  }
  const info = db
    .prepare('INSERT INTO categories (name, description, created_by) VALUES (?, ?, ?)')
    .run(catname, catdesc, req.user.id);
  res.status(201).json({ id: info.lastInsertRowid });
});

//app.post('/api/categories', authRequired, (req, res) => {
//  const { name, description} = req.body;
//  const info = db.prepare(
//    'INSERT INTO categories (name, description, created_by) VALUES (?, ?, ?)'
//  ).run(name, address, description, section, req.user.id);
//  res.json({ id: info.lastInsertRowid });
//});

app.delete('/api/categories/:id', authRequired, adminRequired, (req, res) => {
  const result = db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Category not found' });
  res.json({ ok: true });
});

// --- Topics ---
//app.get('/api/categories/:id/topics', (req, res) => {
//  const rows = db.prepare(`
//    SELECT s.*, u.username AS creator
//    FROM topics s JOIN users u ON u.id = s.created_by
//    ORDER BY s.created_at DESC
//  `).all();
//  res.json(rows);
//});


app.get('/api/topics', (req, res) => {
  const rows = db.prepare(`SELECT id, category_id, name, icon, title, description, accentColor FROM topics ORDER BY name`).all();
  res.json(rows);
});

app.post('/api/topics', authRequired, adminRequired, (req, res) => {
  const { topname, topdesc, topcat, topicon, topcolor } = req.body;
  if (db.prepare('SELECT 1 FROM topics WHERE name = ?').get(topname)) {
    return res.status(409).json({ error: 'Topic already exists' });
  }
  const info = db
    .prepare('INSERT INTO topics (category_id, name, icon, title, description, accentColor, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(topcat, topname, topicon, topname, topdesc, topcolor, req.user.id);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.delete('/api/topics/:id', authRequired, adminRequired, (req, res) => {
  const result = db.prepare('DELETE FROM topics WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Topic not found' });
  res.json({ ok: true });
});

//app.post('/api/categories/:id/topics', authRequired, (req, res) => {
//  const { name, title, description} = req.body;
//  const info = db.prepare(
//    'INSERT INTO topics (name, category_id, title, description, created_by) VALUES (?, ?, ?, ?, ?)'
//  ).run(name, address, description, section, req.user.id);
//  res.json({ id: info.lastInsertRowid });
//});

// --- Threads ---
//app.get('/api/topics/:id/threads', (req, res) => {
//  const rows = db.prepare(`
//    SELECT t.*, u.username,
//           (SELECT COUNT(*) FROM posts p WHERE p.thread_id = t.id) AS reply_count
//    FROM threads t JOIN users u ON u.id = t.user_id
//    WHERE t.topic_id = ?
//    ORDER BY t.created_at DESC
//  `).all(req.params.id);
//  res.json(rows);
//});

//app.post('/api/topics/:id/threads', authRequired, (req, res) => {
//  const { title, body } = req.body;
//  const info = db.prepare(
//    'INSERT INTO threads (topic_id, user_id, title, body) VALUES (?, ?, ?, ?)'
//  ).run(req.params.id, req.user.id, title, body);
//  res.json({ id: info.lastInsertRowid });
//});

app.get('/api/threads', (req, res) => {
  //const rows = db.prepare(`SELECT id, topic_id, user_id, title, body, created_at, is_pinned FROM threads ORDER BY title`).all();
  const rows = db.prepare(`
    SELECT t.id, t.topic_id, t.title, t.body, t.created_at, t.is_pinned,
           u.id AS user_id, u.username, u.profile_path
    FROM threads t
    JOIN users u ON u.id = t.user_id
    ORDER BY t.title
  `).all();
  res.json(rows);
});

app.post('/api/newthread', authRequired, async (req, res) => {

  const { threadtitle, threadbody, threadtopic } = req.body;
 
  const getthreadid = db.prepare('SELECT id, topic_id, user_id, title, body FROM threads WHERE title = ? AND topic_id = ?').get(threadtitle,threadtopic);

  if( !getthreadid ) {
      const rows = db.prepare('INSERT INTO threads (topic_id, user_id, title, body) VALUES (?, ?, ?, ?)').run(threadtopic, req.user.id, threadtitle, threadbody);
      res.status(201).json(rows);
  } else {
      return res.status(401).json({ error: 'ERROR: Thread Already Exists' });
  }

});

// --- Posts (replies) ---


app.get('/api/posts',  (req, res) => {
   
  const rows = db.prepare(`
    SELECT p.id, p.thread_id, p.body, p.created_at,
           u.id AS user_id, u.username, u.profile_path
    FROM posts p
    JOIN users u ON u.id = p.user_id
    ORDER BY p.created_at
  `).all();
  res.json(rows);
});

app.post('/api/newpost', authRequired, async (req, res) => {

  const { postbody, postthread } = req.body;
  const getthreadid = db.prepare('SELECT id FROM threads WHERE id = ?').get(postthread);

  //console.log(threadtitle, threadbody, threadauthor, threadtopic);

  if ( !getthreadid ) {
     return res.status(401).json({ error: 'ERROR: Invalid Post' });
  } else {
     // console.log(gettopicid.id);
     const rows = db.prepare('INSERT INTO posts (thread_id, user_id, body) VALUES (?, ?, ?)').run(getthreadid.id, req.user.id, postbody);
     res.status(201).json(rows);

  }

});

//app.get('/api/threads/:id/posts', (req, res) => {
//  const rows = db.prepare(`
//    SELECT p.*, u.username
//    FROM posts p JOIN users u ON u.id = p.user_id
//    WHERE p.thread_id = ?
//    ORDER BY p.created_at ASC
//  `).all(req.params.id);
//  res.json(rows);
//});

//app.post('/api/threads/:id/posts', authRequired, (req, res) => {
//  const { body } = req.body;
//  const info = db.prepare(
//    'INSERT INTO posts (thread_id, user_id, body) VALUES (?, ?, ?)'
//  ).run(req.params.id, req.user.id, body);
//  res.json({ id: info.lastInsertRowid });
//});

// --- Thread Views ---
const upsertView = db.prepare(`
  INSERT INTO thread_views (thread_id, user_id, view_count, last_viewed_at)
  VALUES (?, ?, 1, CURRENT_TIMESTAMP)
  ON CONFLICT(thread_id, user_id) DO UPDATE SET
    view_count = view_count + 1,
    last_viewed_at = CURRENT_TIMESTAMP
`);

const viewCountQuery = db.prepare(`
  SELECT COALESCE(SUM(view_count), 0) AS viewcount
  FROM thread_views
  WHERE thread_id = ?
`);

app.post('/api/thread-view', authRequired, (req, res) => {
  const thread_id = parseInt(req.body.thread_id, 10);
  if (!thread_id) return res.status(400).json({ error: 'thread_id required' });
  upsertView.run(thread_id, req.user.id);
  res.json({ ok: true });
});

app.get('/api/viewquery', (req, res) => {
  res.json(viewCountQuery.get(req.query.thread_id));
});

// --- Quicklinks ---
app.get('/api/quicklinks', (req, res) => {
  const rows = db.prepare('SELECT id, title, icon, link FROM quicklinks ORDER BY id').all();
  res.json(rows);
});

app.post('/api/quicklinks', authRequired, adminRequired, (req, res) => {
  const { title, icon, link } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const info = db.prepare('INSERT INTO quicklinks (title, icon, link, created_by) VALUES (?, ?, ?, ?)')
    .run(title, icon || '', link || '', req.user.id);
  res.status(201).json({ id: info.lastInsertRowid });
});

app.delete('/api/quicklinks/:id', authRequired, adminRequired, (req, res) => {
  const result = db.prepare('DELETE FROM quicklinks WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Quicklink not found' });
  res.json({ success: true });
});

app.post('/api/quicklinks/reset', authRequired, adminRequired, (req, res) => {
  const defaults = [
    { title: 'Server Rules', icon: '📋', link: '#' },
    { title: 'Server Map',   icon: '🗺️', link: '#' },
    { title: 'Server Shop',  icon: '🛍️', link: '#' },
    { title: 'Leaderboards', icon: '📊', link: '#' },
    { title: 'Ban Appeals',  icon: '🎫', link: '#' },
    { title: 'Discord',      icon: '💬', link: '#' },
  ];
  const insert = db.prepare('INSERT INTO quicklinks (title, icon, link, created_by) VALUES (?, ?, ?, ?)');
  const resetTx = db.transaction(() => {
    db.prepare('DELETE FROM quicklinks').run();
    for (const { title, icon, link } of defaults) {
      insert.run(title, icon, link, req.user.id);
    }
  });
  resetTx();
  const rows = db.prepare('SELECT id, title, icon, link FROM quicklinks ORDER BY id').all();
  res.json(rows);
});

// --- Members ---
app.get('/api/members', authRequired, (req, res) => {
  const rows = db.prepare('SELECT id, username, profile_path, created_at FROM users ORDER BY created_at ASC').all();
  res.json(rows);
});

app.get('/api/members/:id', authRequired, (req, res) => {
  const member = db.prepare('SELECT id, username, profile_path, created_at FROM users WHERE id = ?').get(req.params.id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  res.json(member);
});

// --- Search ---
app.get('/api/search', authRequired, (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.status(400).json({ error: 'Query must be at least 2 characters.' });
  const like = `%${q}%`;

  const topics = db.prepare(`
    SELECT id, name, icon, title, description, accentColor
    FROM topics WHERE name LIKE ? OR description LIKE ?
  `).all(like, like);

  const threads = db.prepare(`
    SELECT t.id, t.title, t.body, t.topic_id, t.created_at,
           tp.name AS topic_name, tp.icon AS topic_icon, tp.accentColor AS topic_accentColor,
           u.username, u.profile_path
    FROM threads t
    JOIN users u ON t.user_id = u.id
    JOIN topics tp ON t.topic_id = tp.id
    WHERE t.title LIKE ? OR t.body LIKE ?
  `).all(like, like);

  const posts = db.prepare(`
    SELECT p.id, p.body, p.thread_id,
           t.title AS thread_title, t.body AS thread_body, t.created_at AS thread_created_at,
           t.topic_id, tp.name AS topic_name, tp.icon AS topic_icon, tp.accentColor AS topic_accentColor,
           p_author.username AS username,
           t_author.username AS thread_username, t_author.profile_path AS thread_profile_path
    FROM posts p
    JOIN users p_author ON p.user_id = p_author.id
    JOIN threads t ON p.thread_id = t.id
    JOIN users t_author ON t.user_id = t_author.id
    JOIN topics tp ON t.topic_id = tp.id
    WHERE p.body LIKE ?
  `).all(like);

  const members = db.prepare(`
    SELECT id, username, profile_path FROM users WHERE username LIKE ?
  `).all(like);

  res.json({ topics, threads, posts, members });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: err.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be under 2 MB.'
        : err.message,
    });
  }
  if (err) return res.status(400).json({ error: err.message });
  next();
});


app.listen(3001, () => console.log('API on http://localhost:3001'));