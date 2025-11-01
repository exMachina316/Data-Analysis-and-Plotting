const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB Connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// User Schema
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, default: null },
  passwordHash: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String }
});

const User = mongoose.model('User', userSchema);

// In-memory session store for tokens -> userId (for demo). In production use DB or proper token signing.
const sessions = {}; // { token: { userId, expiresAt } }

function sanitizeUserForOutput(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function getRequestBody(req) {
  // Manual body parsing — we don't use express.json() or any middleware
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      // simple protection
      if (body.length > 1e6) {
        req.connection.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', err => reject(err));
  });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the frontend directory
app.use(express.static(PUBLIC_DIR));

// Serve index.html at the root
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'html', 'index.html'));
});

// ---------- Routes (no middleware) ----------

// Health
app.get('/api', (req, res) => {
  res.json({ ok: true, message: 'User CRUD auth app (no middleware)' });
});

// Create user (register)
app.post('/users', async (req, res) => {
  try {
    const body = await getRequestBody(req);
    const { username, password, email } = body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const id = crypto.randomUUID();

    const user = new User({ 
      id, 
      username, 
      email: email || null, 
      passwordHash, 
      createdAt: new Date().toISOString() 
    });
    
    await user.save();

    res.status(201).json({ user: sanitizeUserForOutput(user.toObject()) });
  } catch (err) {
    if (err.message === 'Invalid JSON') return res.status(400).json({ error: 'Invalid JSON body' });
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const body = await getRequestBody(req);
    const { username, password } = body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    // Generate token and store session
    const token = generateToken();
    // set expiry 24 hours from now
    sessions[token] = { userId: user.id, expiresAt: Date.now() + 24 * 3600 * 1000 };

    res.json({ token, user: sanitizeUserForOutput(user.toObject()) });
  } catch (err) {
    if (err.message === 'Invalid JSON') return res.status(400).json({ error: 'Invalid JSON body' });
    res.status(500).json({ error: err.message });
  }
});

// Helper to authenticate inside handlers (no middleware)
function authenticateFromHeader(req) {
  const auth = req.headers['authorization'];
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length !== 2) return null;
  const token = parts[1];
  const sess = sessions[token];
  if (!sess) return null;
  if (sess.expiresAt < Date.now()) {
    delete sessions[token];
    return null;
  }
  return { token, userId: sess.userId };
}

// Get user by id (protected — only owner can access)
app.get('/users/:id', async (req, res) => {
  const auth = authenticateFromHeader(req);
  if (!auth) return res.status(401).json({ error: 'unauthenticated' });

  const { id } = req.params;
  if (auth.userId !== id) return res.status(403).json({ error: 'forbidden — can only fetch your own user' });

  const user = await User.findOne({ id });
  if (!user) return res.status(404).json({ error: 'user not found' });

  res.json({ user: sanitizeUserForOutput(user.toObject()) });
});

// Update user (change password or email) — protected (owner only)
app.put('/users/:id', async (req, res) => {
  try {
    const auth = authenticateFromHeader(req);
    if (!auth) return res.status(401).json({ error: 'unauthenticated' });

    const { id } = req.params;
    if (auth.userId !== id) return res.status(403).json({ error: 'forbidden — can only update your own user' });

    const body = await getRequestBody(req);
    const { password, email } = body;

    const user = await User.findOne({ id });
    if (!user) return res.status(404).json({ error: 'user not found' });

    if (password) {
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      user.passwordHash = passwordHash;
    }
    if (typeof email !== 'undefined') user.email = email;
    user.updatedAt = new Date().toISOString();

    await user.save();
    res.json({ user: sanitizeUserForOutput(user.toObject()) });
  } catch (err) {
    if (err.message === 'Invalid JSON') return res.status(400).json({ error: 'Invalid JSON body' });
    res.status(500).json({ error: err.message });
  }
});

// Delete user (owner only)
app.delete('/users/:id', async (req, res) => {
  const auth = authenticateFromHeader(req);
  if (!auth) return res.status(401).json({ error: 'unauthenticated' });

  const { id } = req.params;
  if (auth.userId !== id) return res.status(403).json({ error: 'forbidden — can only delete your own user' });

  const user = await User.findOne({ id });
  if (!user) return res.status(404).json({ error: 'user not found' });

  const deleted = user.toObject();
  await User.deleteOne({ id });

  // invalidate any sessions for this user
  for (const [t, s] of Object.entries(sessions)) {
    if (s.userId === id) delete sessions[t];
  }

  res.json({ deleted: sanitizeUserForOutput(deleted) });
});

// List users (returns basic profile without passwordHash)
app.get('/users', async (req, res) => {
  const users = await User.find({}, { _id: 0, passwordHash: 0, __v: 0 });
  const out = users.map(u => ({ id: u.id, username: u.username, email: u.email, createdAt: u.createdAt }));
  res.json({ users: out });
});

// Logout (invalidate token)
app.post('/logout', async (req, res) => {
  try {
    const auth = authenticateFromHeader(req);
    if (!auth) return res.status(401).json({ error: 'unauthenticated' });
    delete sessions[auth.token];
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});