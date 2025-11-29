// server.js - MedTap V4 backend (Express + SQLite)
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const QRCode = require('qrcode');
const bcrypt = require('bcrypt');

const app = express();
const DB = path.join(__dirname, 'db.sqlite3');
const UPLOADS = path.join(__dirname, 'uploads');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'medtap_secret_dev',
  resave: false,
  saveUninitialized: false
}));


app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use(express.static(path.join(__dirname, 'public')));

if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive: true });

const db = new sqlite3.Database(DB);

// initialize schema
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE,
    name TEXT, dob TEXT, gender TEXT, mobile TEXT, email TEXT,
    address TEXT, city TEXT, state TEXT, pincode TEXT,
    aadhaar TEXT, pan TEXT, insurance_provider TEXT, insurance_number TEXT,
    insurance_validity TEXT, ayushman_number TEXT, blood_group TEXT,
    allergies TEXT, chronic_conditions TEXT, medications TEXT, emergency_contact TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    type TEXT,
    title TEXT,
    content TEXT,
    file TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    token_linked TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// helpers
function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  return res.redirect('/login.html');
}
function requirePatient(req, res, next) {
  if (req.session && req.session.patient) return next();
  return res.redirect('/patient_login.html');
}
function findPatientByToken(token) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM patients WHERE token = ?', [token], (e, row) => e ? reject(e) : resolve(row));
  });
}

// ----- Admin routes (simple username/password -> session)
app.post('/login', (req, res) => {
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'medtap123';
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.admin = { username };
    return res.redirect('/hospital.html');
  }
  return res.redirect('/login.html?error=1');
});
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login.html'));
});

// ----- Patient auth
app.post('/patient/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send('email & password required');
  const hash = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (email,password) VALUES (?,?)', [email.trim(), hash], function (err) {
    if (err) return res.status(500).send('DB error');
    req.session.patient = { id: this.lastID, email };
    return res.redirect('/patient_dashboard.html');
  });
});
app.post('/patient/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT id,email,password,token_linked FROM users WHERE email = ?', [email.trim()], async (err, row) => {
    if (err || !row) return res.redirect('/patient_login.html?error=1');
    const ok = await bcrypt.compare(password, row.password);
    if (!ok) return res.redirect('/patient_login.html?error=1');
    req.session.patient = { id: row.id, email: row.email, token_linked: row.token_linked };
    return res.redirect('/patient_dashboard.html');
  });
});
app.get('/patient/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/patient_login.html'));
});

// ----- Admin APIs
app.post('/api/patient', requireAdmin, (req, res) => {
  const d = req.body;
  if (!d.token || !d.name) return res.status(400).json({ error: 'token and name required' });
  const params = [
    d.token, d.name, d.dob || '', d.gender || '', d.mobile || '', d.email || '', d.address || '', d.city || '', d.state || '', d.pincode || '',
    d.aadhaar || '', d.pan || '', d.insurance_provider || '', d.insurance_number || '', d.insurance_validity || '', d.ayushman_number || '', d.blood_group || '',
    d.allergies || '', d.chronic_conditions || '', d.medications || '', d.emergency_contact || ''
  ];
  db.run(`INSERT INTO patients (token,name,dob,gender,mobile,email,address,city,state,pincode,aadhaar,pan,insurance_provider,insurance_number,insurance_validity,ayushman_number,blood_group,allergies,chronic_conditions,medications,emergency_contact)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, token: d.token });
  });
});

app.get('/api/patients', requireAdmin, (req, res) => {
  db.all('SELECT id,token,name,mobile FROM patients ORDER BY id DESC LIMIT 200', [], (e, rows) => e ? res.status(500).json({ error: e.message }) : res.json(rows));
});

app.get('/api/patient/:token', requireAdmin, async (req, res) => {
  try {
    const token = req.params.token;
    const p = await findPatientByToken(token);
    if (!p) return res.status(404).json({ error: 'Patient not found' });
    db.all('SELECT * FROM records WHERE patient_id = ? ORDER BY created_at DESC', [p.id], (e, rows) => e ? res.status(500).json({ error: e.message }) : res.json({ patient: p, records: rows }));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// add record (admin)
app.post('/api/patient/:token/records', requireAdmin, async (req, res) => {
  const token = req.params.token; const { type, title, content } = req.body;
  if (!type || !title) return res.status(400).json({ error: 'type and title required' });
  try {
    const patient = await findPatientByToken(token);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    db.run('INSERT INTO records (patient_id,type,title,content) VALUES (?,?,?,?)', [patient.id, type, title, content || ''], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// upload by admin (stores file under uploads/patient_<id>/)
app.post('/api/patient/:token/upload', requireAdmin, (req, res) => {
  findPatientByToken(req.params.token).then(patient => {
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    const userDir = path.join(UPLOADS, 'patient_' + patient.id);
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
    const storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, userDir),
      filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
    });
    const upload = multer({ storage }).single('file');
    upload(req, res, function (err) {
      if (err) return res.status(500).json({ error: 'Upload failed' });
      const fname = req.file.filename;
      db.run('INSERT INTO records (patient_id,type,title,file) VALUES (?,?,?,?)', [patient.id, 'Report', req.file.originalname, fname], function (e) {
        if (e) return res.status(500).json({ error: e.message });
        res.json({ success: true, file: fname });
      });
    });
  }).catch(err => res.status(500).json({ error: err.message }));
});

// download file (admin only)
app.get('/download/patient/:id/:filename', requireAdmin, (req, res) => {
  const file = path.join(UPLOADS, 'patient_' + req.params.id, req.params.filename);
  if (!fs.existsSync(file)) return res.status(404).send('Not found');
  res.download(file);
});

// ----- Patient APIs (authenticated patient session)
app.get('/api/patient/me', requirePatient, (req, res) => {
  const uid = req.session.patient.id;
  db.get('SELECT id,email,token_linked FROM users WHERE id = ?', [uid], (err, u) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!u) return res.status(404).json({ error: 'User not found' });
    if (!u.token_linked) return res.json({ user: u, patient: null, records: [] });
    db.get('SELECT * FROM patients WHERE token = ?', [u.token_linked], (e, p) => {
      if (e) return res.status(500).json({ error: 'DB error' });
      if (!p) return res.json({ user: u, patient: null, records: [] });
      db.all('SELECT * FROM records WHERE patient_id = ? ORDER BY created_at DESC', [p.id], (er, rows) => er ? res.status(500).json({ error: 'DB error' }) : res.json({ user: u, patient: p, records: rows }));
    });
  });
});

app.post('/api/patient/link-token', requirePatient, (req, res) => {
  const token = (req.body.token || '').trim();
  if (!token) return res.status(400).json({ error: 'token required' });
  const uid = req.session.patient.id;
  db.get('SELECT id FROM patients WHERE token = ?', [token], (err, p) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!p) return res.status(404).json({ error: 'Token not found' });
    db.run('UPDATE users SET token_linked = ? WHERE id = ?', [token, uid], function (err2) {
      if (err2) return res.status(500).json({ error: 'DB error' });
      res.json({ success: true, token });
    });
  });
});

// patient upload (stores under uploads/user_<uid>/)
app.post('/api/patient/upload', requirePatient, (req, res) => {
  const uid = req.session.patient.id;
  const userDir = path.join(UPLOADS, String(uid));
  if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, userDir),
    filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname)
  });
  const upload = multer({ storage }).single('file');
  upload(req, res, function (err) {
    if (err) return res.status(500).json({ error: 'Upload error' });
    const filename = req.file.filename;
    // If user linked to patient, create record in that patient
    db.get('SELECT token_linked FROM users WHERE id = ?', [uid], (er, u) => {
      if (er) return res.json({ success: true, file: filename });
      if (!u || !u.token_linked) return res.json({ success: true, file: filename });
      db.get('SELECT id FROM patients WHERE token = ?', [u.token_linked], (er2, p) => {
        if (er2 || !p) return res.json({ success: true, file: filename });
        db.run('INSERT INTO records (patient_id,type,title,file) VALUES (?,?,?,?)', [p.id, 'Report', req.file.originalname, filename], function (e) {
          return res.json({ success: true, file: filename });
        });
      });
    });
  });
});

// QR endpoint for token -> dataurl
app.get('/api/qr/:token', (req, res) => {
  QRCode.toDataURL(req.params.token, (err, url) => { if (err) return res.status(500).json({ error: err.message }); res.json({ qr: url }); });
});

// fallback root
app.get('/', (req, res) => {
  if (req.session && req.session.admin) return res.redirect('/hospital.html');
  if (req.session && req.session.patient) return res.redirect('/patient_dashboard.html');
  return res.redirect('/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('MedTap V4 running on port', PORT));
