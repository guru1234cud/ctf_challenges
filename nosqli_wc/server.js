// server.js - NoSQLi role escalation lab (local only)
const express = require('express');
const path = require('path');
const session = require('express-session');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'lab-secret-please-change',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 }
}));

const mongoUrl = 'mongodb://127.0.0.1:27017';
const dbName = 'nosqli_role_lab';
let db, usersCollection;

MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    usersCollection = db.collection('users');
    console.log('Connected to MongoDB');

    // seed users if empty
    usersCollection.countDocuments().then(count => {
      if (count === 0) {
        usersCollection.insertMany([
          // normal user (known credentials)
          { username: 'student1', password: 'studpass', role: 'user', profile: { name: 'Student One' } },
          // admin account exists but with unknown password (so players must use NoSQLi to reach it)
          { username: 'siteadmin', password: 'verysecret_admin_pass', role: 'admin', profile: { name: 'Site Administrator' } }
        ]).then(() => console.log('Seeded users.'));
      }
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

/*
  VULNERABLE LOGIN
  - This intentionally uses the raw request body as the MongoDB query object.
  - If the client sends JSON objects with operators (e.g. {$ne: null}) this will be interpreted by MongoDB.
  - This is the NoSQLi vulnerability for the lab.
*/
app.post('/login', async (req, res) => {
  // IMPORTANT: req.body is used directly as query
  const query = req.body;

  // basic check: require username and password keys to exist (they can be objects/operators)
  if (query.username === undefined || query.password === undefined) {
    return res.status(400).json({ success: false, message: 'username and password required' });
  }

  try {
    // !!! VULNERABLE LINE !!!
    const user = await usersCollection.findOne(query);

    if (!user) {
      return res.json({ success: false, message: 'Invalid credentials' });
    }

    // login success: create session and redirect based on role
    req.session.userId = String(user._id);
    req.session.role = user.role || 'user';

    // If admin, console.log the flag encoded in base64 (single flag)
    if (req.session.role === 'admin') {
      const flag = 'flag{admin_access_granted}';
      const b64 = Buffer.from(flag, 'utf8').toString('base64');
      // log the base64-encoded flag to the server console (intentional for the lab)
      console.log('[ADMIN FLAG - base64] ' + b64);
    }

    return res.json({ success: true, redirect: '/dashboard' });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ success: false, message: 'server error' });
  }
});

// dashboard route (serves static page)
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// profile API
app.get('/api/profile', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'unauthorized' });
  try {
    const user = await usersCollection.findOne({ _id: new ObjectId(req.session.userId) }, { projection: { profile: 1, role: 1 } });
    if (!user) return res.status(404).json({ error: 'not found' });
    res.json({ profile: user.profile, role: user.role });
  } catch (e) {
    res.status(500).json({ error: 'server error' });
  }
});

// logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// convenience end to show session info (only local debugging; remove in public deployment)
app.get('/_whoami', (req, res) => {
  res.json({ session: req.session });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`App running at http://localhost:${PORT}`));
