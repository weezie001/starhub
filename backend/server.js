const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'starbook-luxury-secret-key-2025';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5174'], credentials: true }));
app.use(express.json());
app.use(require('morgan')('dev'));

// ─────────────────────────────────────────────
// DATABASE
// ─────────────────────────────────────────────
const db = new sqlite3.Database(process.env.DB_PATH || './starbook.sqlite', err => {
  if (err) console.error('DB error:', err);
  else console.log('Connected to SQLite.');
});

const dbRun = (sql, params = []) => new Promise((res, rej) =>
  db.run(sql, params, function (err) { err ? rej(err) : res(this); }));
const dbGet = (sql, params = []) => new Promise((res, rej) =>
  db.get(sql, params, (err, row) => err ? rej(err) : res(row)));
const dbAll = (sql, params = []) => new Promise((res, rej) =>
  db.all(sql, params, (err, rows) => err ? rej(err) : res(rows)));

db.serialize(() => {
  // Existing tables
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, role TEXT DEFAULT 'user', joined DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY, userId TEXT NOT NULL, celebData TEXT NOT NULL,
    bookingType TEXT NOT NULL, formData TEXT NOT NULL, paymentMethod TEXT NOT NULL,
    status TEXT DEFAULT 'pending', date DATETIME DEFAULT CURRENT_TIMESTAMP, amount REAL,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS celebrities (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT,
    price REAL, verified INTEGER DEFAULT 1, photo TEXT, data TEXT
  )`);

  // Chat tables
  db.run(`CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    customerName TEXT NOT NULL,
    customerEmail TEXT,
    userId TEXT,
    topic TEXT,
    status TEXT DEFAULT 'waiting',
    agentId TEXT,
    agentName TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    sessionId TEXT NOT NULL,
    senderRole TEXT NOT NULL,
    senderName TEXT NOT NULL,
    content TEXT NOT NULL,
    ts DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sessionId) REFERENCES chat_sessions(id)
  )`);

  // Waitlist
  db.run(`CREATE TABLE IF NOT EXISTS waitlist (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    eventType TEXT,
    preferredDate TEXT,
    budget TEXT,
    notes TEXT,
    status TEXT DEFAULT 'waiting',
    position INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Seed celebrities
  db.get('SELECT COUNT(*) as count FROM celebrities', [], (err, row) => {
    if (!err && row.count === 0) {
      const seed = [
        { id:'1', name:'Christopher Larosa', category:'actors', price:5000, photo:'https://stratifymanagementteam.com/admin/storage/app/public/uploads/69bad611a58b9.jpg', data:{ country:'Canada', flag:'🇨🇦', bio:'Award-winning Canadian actor celebrated for his intense dramatic roles in both film and television.', feat:true, avail:true, rating:4.9, reviews:128, tags:['Corporate Events','Charity Galas','Film Premieres','Speaking'] } },
        { id:'2', name:'Hamdan Al Maktoum', category:'royalty', price:18500, photo:'https://stratifymanagementteam.com/admin/storage/app/public/uploads/691303dc8c54e.jpg', data:{ country:'UAE', flag:'🇦🇪', bio:'Crown Prince of Dubai, accomplished equestrian champion, beloved poet, and global philanthropist.', feat:true, avail:true, rating:4.9, reviews:89, tags:['State Events','Equestrian Shows','Charity','Exclusive'] } },
        { id:'3', name:'Anthony Dalton', category:'actors', price:7000, photo:'https://stratifymanagementteam.com/admin/storage/app/public/uploads/69bae06bb2105.jpg', data:{ country:'USA', flag:'🇺🇸', bio:'Hollywood producer and actor with decades of experience spanning blockbuster films and award-winning television.', feat:true, avail:false, rating:4.9, reviews:203, tags:['Screenings','Q&A Sessions','Award Shows','Private Functions'] } },
        { id:'4', name:'Noah Fearnley', category:'musicians', price:4500, photo:'https://stratifymanagementteam.com/admin/storage/app/public/uploads/69bcefbce7072.jpeg', data:{ country:'Australia', flag:'🇦🇺', bio:'Chart-topping Australian musician whose soulful compositions have earned him international acclaim.', feat:true, avail:true, rating:4.9, reviews:156, tags:['Live Concerts','Private Performances','Meet & Greet','Radio'] } },
        { id:'5', name:'Espen Hatleskog', category:'sports', price:6000, photo:'https://stratifymanagementteam.com/admin/storage/app/public/uploads/69bcf0390bb6d.jpeg', data:{ country:'Australia', flag:'🇦🇺', bio:'Professional athlete and motivational speaker who has inspired millions through his extraordinary sporting achievements.', feat:true, avail:true, rating:4.9, reviews:97, tags:['Motivational Talks','Sports Events','Brand Appearances','Coaching'] } },
        { id:'6', name:'Aria Chen', category:'musicians', price:8500, photo:null, data:{ country:'Singapore', flag:'🇸🇬', bio:'Grammy-nominated pop artist from Singapore.', feat:false, avail:true, rating:4.8, reviews:174, tags:['Concert Tours','TV Appearances','Fan Experiences','Brand Deals'] } },
        { id:'7', name:'Marcus Webb', category:'actors', price:12000, photo:null, data:{ country:'UK', flag:'🇬🇧', bio:'BAFTA award-winning British actor renowned for transformative roles.', feat:false, avail:true, rating:4.7, reviews:211, tags:['Theatre Events','Film Festivals','Private Functions','Keynotes'] } },
        { id:'8', name:'Layla Hassan', category:'influencers', price:6500, photo:null, data:{ country:'Egypt', flag:'🇪🇬', bio:'Digital creator with 50M+ followers.', feat:false, avail:false, rating:4.8, reviews:342, tags:['Brand Campaigns','Product Launches','Social Media','Endorsements'] } },
        { id:'9', name:'Diego Santos', category:'sports', price:9000, photo:null, data:{ country:'Brazil', flag:'🇧🇷', bio:'Olympic gold medalist and fitness icon.', feat:false, avail:true, rating:4.9, reviews:189, tags:['Sports Clinics','Fitness Events','School Visits','Keynotes'] } },
        { id:'10', name:'Yuki Tanaka', category:'influencers', price:7500, photo:null, data:{ country:'Japan', flag:'🇯🇵', bio:'Fashion influencer and brand ambassador.', feat:false, avail:true, rating:4.8, reviews:267, tags:['Fashion Shows','Brand Deals','Cultural Events','Exhibitions'] } },
        { id:'11', name:'Sofia Reyes', category:'musicians', price:5500, photo:null, data:{ country:'Mexico', flag:'🇲🇽', bio:'Latin pop sensation with vibrant personality.', feat:false, avail:true, rating:4.7, reviews:145, tags:['Concerts','Festivals','Fan Meetups','Brand Events'] } },
        { id:'12', name:'James Okafor', category:'actors', price:4000, photo:null, data:{ country:'Nigeria', flag:'🇳🇬', bio:'Nollywood icon and international star.', feat:false, avail:true, rating:4.8, reviews:312, tags:['Film Events','Cultural Shows','Speaking','Charity'] } },
      ];
      const stmt = db.prepare('INSERT OR IGNORE INTO celebrities (id,name,category,price,verified,photo,data) VALUES (?,?,?,?,?,?,?)');
      seed.forEach(c => stmt.run(c.id, c.name, c.category, c.price, 1, c.photo, JSON.stringify(c.data)));
      stmt.finalize();
    }
  });
});

// ─────────────────────────────────────────────
// WEBSOCKET — in-memory state
// ─────────────────────────────────────────────
// sessions: Map<sessionId, { customerWs, agentWs, agentName }>
const activeSessions = new Map();
// agents: Set<ws> — all connected agent sockets
const agentSockets = new Set();
// waitingQueue: ordered list of sessionIds without an agent yet
const waitingQueue = [];
// waitlistWatchers: Map<waitlistId, ws> — customers watching their waitlist entry
const waitlistWatchers = new Map();

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function send(ws, obj) {
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
}

function broadcastToAgents(obj) {
  agentSockets.forEach(ws => send(ws, obj));
}

function broadcastQueuePositions() {
  waitingQueue.forEach((sid, idx) => {
    const s = activeSessions.get(sid);
    if (s?.customerWs) send(s.customerWs, { type: 'queue_update', position: idx + 1, total: waitingQueue.length });
  });
}

async function getQueuePosition(sessionId) {
  const idx = waitingQueue.indexOf(sessionId);
  return idx === -1 ? null : idx + 1;
}

async function persistMessage(sessionId, senderRole, senderName, content) {
  const id = uid();
  const ts = new Date().toISOString();
  await dbRun(
    'INSERT INTO chat_messages (id,sessionId,senderRole,senderName,content,ts) VALUES (?,?,?,?,?,?)',
    [id, sessionId, senderRole, senderName, content, ts]
  );
  await dbRun('UPDATE chat_sessions SET updatedAt=? WHERE id=?', [ts, sessionId]);
  return { id, sessionId, senderRole, senderName, content, ts };
}

wss.on('connection', ws => {
  let sessionId = null;
  let role = null; // 'customer' | 'agent'
  let clientName = 'Unknown';
  let typingTimer = null;

  ws.on('message', async rawData => {
    let msg;
    try { msg = JSON.parse(rawData); } catch { return; }

    // ── CUSTOMER JOIN ──────────────────────────────────────────
    if (msg.type === 'customer_join') {
      const { name, email, topic, existingSessionId } = msg;
      clientName = name || 'Guest';
      role = 'customer';

      if (existingSessionId) {
        // Rejoin existing session
        sessionId = existingSessionId;
        const existing = activeSessions.get(sessionId) || {};
        activeSessions.set(sessionId, { ...existing, customerWs: ws });
        const history = await dbAll('SELECT * FROM chat_messages WHERE sessionId=? ORDER BY ts ASC', [sessionId]);
        const session = await dbGet('SELECT * FROM chat_sessions WHERE id=?', [sessionId]);
        send(ws, { type: 'session_rejoined', sessionId, session, history });
        // Notify agent if present
        const s = activeSessions.get(sessionId);
        if (s?.agentWs) send(s.agentWs, { type: 'customer_reconnected', sessionId });
      } else {
        // New session
        sessionId = uid();
        await dbRun(
          'INSERT INTO chat_sessions (id,customerName,customerEmail,topic,status) VALUES (?,?,?,?,?)',
          [sessionId, clientName, email || '', topic || 'General Inquiry', 'waiting']
        );
        activeSessions.set(sessionId, { customerWs: ws, agentWs: null, agentName: null });
        waitingQueue.push(sessionId);
        const position = waitingQueue.indexOf(sessionId) + 1;
        send(ws, { type: 'session_created', sessionId, position, total: waitingQueue.length });
        broadcastToAgents({ type: 'new_session', sessionId, customerName: clientName, topic: topic || 'General Inquiry', position });
        broadcastQueuePositions();

        // Auto system message
        const sysMsg = await persistMessage(sessionId, 'system', 'StarBook', `Welcome ${clientName}! You are #${position} in queue. A concierge agent will be with you shortly.`);
        send(ws, { type: 'message', message: sysMsg });
      }
    }

    // ── AGENT JOIN (authenticates via JWT) ────────────────────
    else if (msg.type === 'agent_join') {
      try {
        const decoded = jwt.verify(msg.token, SECRET);
        if (decoded.role !== 'admin') { ws.close(); return; }
        role = 'agent';
        clientName = decoded.name;
        agentSockets.add(ws);

        // Send all active sessions list
        const sessions = await dbAll(
          `SELECT cs.*, (SELECT content FROM chat_messages WHERE sessionId=cs.id ORDER BY ts DESC LIMIT 1) as lastMessage,
           (SELECT COUNT(*) FROM chat_messages WHERE sessionId=cs.id) as messageCount
           FROM chat_sessions cs ORDER BY cs.updatedAt DESC`
        );
        send(ws, { type: 'agent_init', sessions, queueLength: waitingQueue.length });
      } catch {
        ws.close();
      }
    }

    // ── AGENT CLAIMS SESSION ──────────────────────────────────
    else if (msg.type === 'claim_session' && role === 'agent') {
      const sid = msg.sessionId;
      const s = activeSessions.get(sid) || {};

      // Update DB
      await dbRun('UPDATE chat_sessions SET status=?,agentName=? WHERE id=?', ['active', clientName, sid]);
      activeSessions.set(sid, { ...s, agentWs: ws, agentName: clientName });

      // Remove from waiting queue
      const qi = waitingQueue.indexOf(sid);
      if (qi !== -1) waitingQueue.splice(qi, 1);

      // Load history
      const history = await dbAll('SELECT * FROM chat_messages WHERE sessionId=? ORDER BY ts ASC', [sid]);
      const session = await dbGet('SELECT * FROM chat_sessions WHERE id=?', [sid]);
      send(ws, { type: 'session_claimed', sessionId: sid, history, session });

      // Notify customer
      const agentMsg = await persistMessage(sid, 'system', 'StarBook', `${clientName} (Senior Agent) has joined the conversation.`);
      if (s.customerWs) {
        send(s.customerWs, { type: 'agent_joined', agentName: clientName });
        send(s.customerWs, { type: 'message', message: agentMsg });
      }
      send(ws, { type: 'message', message: agentMsg });

      // Broadcast updated queue positions and session list update to other agents
      broadcastQueuePositions();
      broadcastToAgents({ type: 'session_claimed_by_other', sessionId: sid, agentName: clientName });
    }

    // ── SEND MESSAGE ──────────────────────────────────────────
    else if (msg.type === 'message') {
      const sid = msg.sessionId || sessionId;
      if (!sid) return;
      const s = activeSessions.get(sid);
      const senderRole = role;
      const content = (msg.content || '').trim();
      if (!content) return;

      const saved = await persistMessage(sid, senderRole, clientName, content);
      const envelope = { type: 'message', message: saved };

      if (senderRole === 'customer' && s?.agentWs) send(s.agentWs, envelope);
      if (senderRole === 'agent' && s?.customerWs) send(s.customerWs, envelope);
      // Echo back to sender
      send(ws, { type: 'message_sent', message: saved });
    }

    // ── TYPING INDICATOR ──────────────────────────────────────
    else if (msg.type === 'typing') {
      const sid = msg.sessionId || sessionId;
      if (!sid) return;
      const s = activeSessions.get(sid);
      const target = role === 'customer' ? s?.agentWs : s?.customerWs;
      send(target, { type: 'typing', from: role, name: clientName });
    }

    // ── CLOSE SESSION ─────────────────────────────────────────
    else if (msg.type === 'close_session') {
      const sid = msg.sessionId || sessionId;
      if (!sid) return;
      await dbRun('UPDATE chat_sessions SET status=? WHERE id=?', ['closed', sid]);
      const s = activeSessions.get(sid);
      if (s?.customerWs) send(s.customerWs, { type: 'session_closed' });
      if (s?.agentWs) send(s.agentWs, { type: 'session_closed', sessionId: sid });
      activeSessions.delete(sid);
      broadcastToAgents({ type: 'session_updated', sessionId: sid, status: 'closed' });
    }

    // ── REQUEST SESSION LIST (agent refresh) ──────────────────
    else if (msg.type === 'get_sessions' && role === 'agent') {
      const sessions = await dbAll(
        `SELECT cs.*, (SELECT content FROM chat_messages WHERE sessionId=cs.id ORDER BY ts DESC LIMIT 1) as lastMessage,
         (SELECT COUNT(*) FROM chat_messages WHERE sessionId=cs.id) as messageCount
         FROM chat_sessions cs ORDER BY cs.updatedAt DESC LIMIT 50`
      );
      send(ws, { type: 'sessions_list', sessions });
    }

    // ── WAITLIST WATCH (customer registers to receive live status updates) ──
    else if (msg.type === 'waitlist_watch' && msg.id) {
      waitlistWatchers.set(msg.id, ws);
      // Send current status immediately
      const entry = await dbGet('SELECT status FROM waitlist WHERE id=?', [msg.id]);
      if (entry) send(ws, { type: 'waitlist_updated', id: msg.id, status: entry.status });
    }
  });

  ws.on('close', async () => {
    if (role === 'agent') {
      agentSockets.delete(ws);
      // Unassign sessions this agent had open (mark them back to waiting)
      for (const [sid, s] of activeSessions) {
        if (s.agentWs === ws) {
          activeSessions.set(sid, { ...s, agentWs: null, agentName: null });
          await dbRun('UPDATE chat_sessions SET status=?,agentName=NULL WHERE id=?', ['waiting', sid]);
          if (!waitingQueue.includes(sid)) waitingQueue.push(sid);
          if (s.customerWs) {
            send(s.customerWs, { type: 'agent_left' });
            const sysMsg = await persistMessage(sid, 'system', 'StarBook', 'Agent disconnected. You will be reconnected to a new agent shortly.');
            send(s.customerWs, { type: 'message', message: sysMsg });
            send(s.customerWs, { type: 'queue_update', position: waitingQueue.indexOf(sid) + 1, total: waitingQueue.length });
          }
          broadcastToAgents({ type: 'new_session', sessionId: sid, customerName: s.customerName || 'Customer', topic: 'Reconnect needed' });
        }
      }
      broadcastQueuePositions();
    }
    // Clean up waitlist watcher
    for (const [wid, wws] of waitlistWatchers) {
      if (wws === ws) { waitlistWatchers.delete(wid); break; }
    }
    if (role === 'customer' && sessionId) {
      const s = activeSessions.get(sessionId);
      if (s) {
        activeSessions.set(sessionId, { ...s, customerWs: null });
        if (s.agentWs) send(s.agentWs, { type: 'customer_disconnected', sessionId });
      }
    }
  });
});

// ─────────────────────────────────────────────
// AUTH MIDDLEWARE
// ─────────────────────────────────────────────
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Invalid session' });
    req.user = user;
    next();
  });
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
};

// ─────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const hash = await bcrypt.hash(password, 10);
  const id = Date.now().toString();
  const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';
  db.run('INSERT INTO users (id,name,email,password,role) VALUES (?,?,?,?,?)',
    [id, name, email, hash, role], err => {
      if (err) return res.status(400).json({ error: 'Email already exists' });
      const token = jwt.sign({ id, email, name, role }, SECRET, { expiresIn: '7d' });
      res.json({ user: { id, name, email, role, token } });
    });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, token } });
  });
});

// ─────────────────────────────────────────────
// CELEBRITY ROUTES
// ─────────────────────────────────────────────
app.get('/api/celebrities', (req, res) => {
  db.all('SELECT * FROM celebrities', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows.map(r => {
      const d = JSON.parse(r.data || '{}');
      return { id: parseInt(r.id), name: r.name, cat: r.category, price: r.price, img: r.photo, avail: d.avail !== false, feat: !!d.feat, rating: d.rating || 4.8, reviews: d.reviews || 0, country: d.country || '', flag: d.flag || '', bio: d.bio || '', tags: d.tags || [] };
    }));
  });
});

app.patch('/api/celebrities/:id/availability', authenticate, adminOnly, (req, res) => {
  const { avail } = req.body;
  db.get('SELECT data FROM celebrities WHERE id=?', [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Not found' });
    const d = JSON.parse(row.data || '{}');
    d.avail = avail;
    db.run('UPDATE celebrities SET data=? WHERE id=?', [JSON.stringify(d), req.params.id], err2 => {
      if (err2) return res.status(500).json({ error: 'Update failed' });
      res.json({ success: true });
    });
  });
});

// ─────────────────────────────────────────────
// BOOKING ROUTES
// ─────────────────────────────────────────────
app.post('/api/bookings', authenticate, (req, res) => {
  const { celeb, type, form, payment, donateAmt } = req.body;
  if (!celeb || !type || !form || !payment) return res.status(400).json({ error: 'Missing fields' });
  const amount = type === 'donate' ? (donateAmt || 0) : (type === 'fan_card' ? 299 : celeb.price);
  db.run(
    'INSERT INTO bookings (id,userId,celebData,bookingType,formData,paymentMethod,amount) VALUES (?,?,?,?,?,?,?)',
    [Date.now().toString(), req.user.id, JSON.stringify(celeb), type, JSON.stringify(form), payment, amount],
    err => {
      if (err) return res.status(500).json({ error: 'Failed to save booking' });
      res.json({ success: true });
    }
  );
});

app.get('/api/user/bookings', authenticate, (req, res) => {
  db.all('SELECT * FROM bookings WHERE userId=? ORDER BY date DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows.map(r => ({ ...r, celebData: JSON.parse(r.celebData), formData: JSON.parse(r.formData) })));
  });
});

// ─────────────────────────────────────────────
// CHAT REST ROUTES
// ─────────────────────────────────────────────
app.get('/api/chat/:sessionId/history', async (req, res) => {
  try {
    const session = await dbGet('SELECT * FROM chat_sessions WHERE id=?', [req.params.sessionId]);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const messages = await dbAll('SELECT * FROM chat_messages WHERE sessionId=? ORDER BY ts ASC', [req.params.sessionId]);
    res.json({ session, messages });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

// ─────────────────────────────────────────────
// WAITLIST ROUTES
// ─────────────────────────────────────────────
app.post('/api/waitlist', async (req, res) => {
  const { name, email, eventType, preferredDate, budget, notes } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
  try {
    const id = uid();
    const countRow = await dbGet("SELECT COUNT(*) as c FROM waitlist WHERE status='waiting'");
    const position = (countRow?.c || 0) + 1;
    await dbRun(
      'INSERT INTO waitlist (id,name,email,eventType,preferredDate,budget,notes,position) VALUES (?,?,?,?,?,?,?,?)',
      [id, name, email, eventType || '', preferredDate || '', budget || '', notes || '', position]
    );
    // Notify all agents
    broadcastToAgents({ type: 'waitlist_new', entry: { id, name, email, eventType, position, status: 'waiting', createdAt: new Date().toISOString() } });
    res.json({ success: true, id, position });
  } catch (e) { res.status(500).json({ error: 'Failed to join waitlist' }); }
});

app.get('/api/waitlist/:id/position', async (req, res) => {
  try {
    const entry = await dbGet('SELECT * FROM waitlist WHERE id=?', [req.params.id]);
    if (!entry) return res.status(404).json({ error: 'Not found' });
    const ahead = await dbGet(
      "SELECT COUNT(*) as c FROM waitlist WHERE status='waiting' AND createdAt < ?",
      [entry.createdAt]
    );
    res.json({ ...entry, position: (ahead?.c || 0) + 1 });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

// ─────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────
app.get('/api/admin/bookings', authenticate, adminOnly, (req, res) => {
  db.all(
    'SELECT b.*, u.name as userName FROM bookings b JOIN users u ON b.userId=u.id ORDER BY b.date DESC',
    [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows.map(r => ({ ...r, celebData: JSON.parse(r.celebData), formData: JSON.parse(r.formData) })));
    }
  );
});

app.patch('/api/admin/bookings/:id', authenticate, adminOnly, (req, res) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'declined'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.run('UPDATE bookings SET status=? WHERE id=?', [status, req.params.id], err => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ success: true });
  });
});

app.get('/api/admin/users', authenticate, adminOnly, (req, res) => {
  db.all('SELECT id,name,email,role,joined FROM users ORDER BY joined DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.get('/api/admin/chat/sessions', authenticate, adminOnly, async (req, res) => {
  try {
    const sessions = await dbAll(
      `SELECT cs.*,
        (SELECT content FROM chat_messages WHERE sessionId=cs.id ORDER BY ts DESC LIMIT 1) as lastMessage,
        (SELECT COUNT(*) FROM chat_messages WHERE sessionId=cs.id AND senderRole='customer') as unread
       FROM chat_sessions cs ORDER BY cs.updatedAt DESC LIMIT 100`
    );
    res.json(sessions);
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

app.patch('/api/admin/waitlist/:id', authenticate, adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!['waiting', 'attending', 'done', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    await dbRun('UPDATE waitlist SET status=? WHERE id=?', [status, req.params.id]);
    const update = { type: 'waitlist_updated', id: req.params.id, status };
    broadcastToAgents(update);
    // Also notify the customer watching this entry
    const watcherWs = waitlistWatchers.get(req.params.id);
    if (watcherWs) send(watcherWs, update);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

app.get('/api/admin/waitlist', authenticate, adminOnly, async (req, res) => {
  try {
    const entries = await dbAll('SELECT * FROM waitlist ORDER BY createdAt DESC');
    res.json(entries);
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

app.post('/api/payments/crypto', authenticate, (req, res) => {
  res.json({ address: 'bc1q...', network: 'Bitcoin', memo: 'Use BTC mainnet only' });
});

server.listen(PORT, () => {
  console.log(`StarBook server running on port ${PORT}`);
  console.log(`WebSocket ready`);
});
