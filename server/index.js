import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';



// Create a path for uploaded content to the server
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
//app.use(cors({ origin: 'http://localhost:5173'}));
app.use(express.json());



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
              res.json({ token, user: { id: info.lastInsertRowid, username } });
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

app.post('/api/forgotpwd', async (req, res) => {
  const { username } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  const email = db.prepare('SELECT * FROM users WHERE email = ?').get(username);

  if (!user) {
     if (!email) {
        return res.status(401).json({ error: 'Invalid credentials' });
     } else {
       console.log("login success!"); 
     }
  } else {
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username } });
    console.log("login success!");
  }
  
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

app.listen(3001, () => console.log('API on http://localhost:3001'));