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



// Uploader Variables

const PROFILE_DIR = path.join(__dirname, 'public', 'profiles');
fs.mkdirSync(PROFILE_DIR, { recursive: true });
 
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

// --- Auth ---


app.get('/api/me', authRequired, (req, res) => {
  const user = db.prepare('SELECT id, username, profile_path FROM users WHERE id = ?').get(req.user.id);
  res.json({ user });
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
app.get('/api/categories', (req, res) => {
  const rows = db.prepare(`
    SELECT s.*, u.username AS creator
    FROM categories s JOIN users u ON u.id = s.created_by
    ORDER BY s.created_at DESC
  `).all();
  res.json(rows);
});

app.post('/api/categories', async (req, res) => {
  const { catname, catdesc, catauthor } = req.body;
  const catcheck = db.prepare('SELECT id, name, description FROM categories WHERE name = ?').get(catname);

  if ( !catcheck ) {
     db.prepare('INSERT INTO categories (name, description, created_by) VALUES (?, ?, ?)').run(catname, catdesc, catauthor);
  } else {
     return res.status(401).json({ error: 'ERROR: Category Already Exist' });
  }

});

//app.post('/api/categories', authRequired, (req, res) => {
//  const { name, description} = req.body;
//  const info = db.prepare(
//    'INSERT INTO categories (name, description, created_by) VALUES (?, ?, ?)'
//  ).run(name, address, description, section, req.user.id);
//  res.json({ id: info.lastInsertRowid });
//});

// --- Topics ---
//app.get('/api/categories/:id/topics', (req, res) => {
//  const rows = db.prepare(`
//    SELECT s.*, u.username AS creator
//    FROM topics s JOIN users u ON u.id = s.created_by
//    ORDER BY s.created_at DESC
//  `).all();
//  res.json(rows);
//});

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

// --- Posts (replies) ---
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