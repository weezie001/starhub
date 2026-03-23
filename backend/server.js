const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || 'starbook-luxury-secret-key-2025';
const FRONTEND_URLS = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:5174').split(',').map(s => s.trim());

app.use(cors({ origin: FRONTEND_URLS, credentials: true }));
app.use(express.json());
app.use(require('morgan')('dev'));

// ─────────────────────────────────────────────
// DATABASE — PostgreSQL
// ─────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Query helpers — use $1 $2 ... placeholders
const q    = (sql, p = []) => pool.query(sql, p).then(r => r);
const qOne = (sql, p = []) => pool.query(sql, p).then(r => r.rows[0] || null);
const qAll = (sql, p = []) => pool.query(sql, p).then(r => r.rows);

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      joined TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "celebData" TEXT NOT NULL,
      "bookingType" TEXT NOT NULL,
      "formData" TEXT NOT NULL,
      "paymentMethod" TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      date TIMESTAMP DEFAULT NOW(),
      amount REAL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS celebrities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      price REAL,
      verified INTEGER DEFAULT 1,
      photo TEXT,
      data TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      "customerName" TEXT NOT NULL,
      "customerEmail" TEXT,
      "userId" TEXT,
      topic TEXT,
      status TEXT DEFAULT 'waiting',
      "agentId" TEXT,
      "agentName" TEXT,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      "sessionId" TEXT NOT NULL,
      "senderRole" TEXT NOT NULL,
      "senderName" TEXT NOT NULL,
      content TEXT NOT NULL,
      ts TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS waitlist (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      "eventType" TEXT,
      "preferredDate" TEXT,
      budget TEXT,
      notes TEXT,
      status TEXT DEFAULT 'waiting',
      position INTEGER,
      "createdAt" TIMESTAMP DEFAULT NOW()
    )
  `);

  // Seed celebrities (only if empty)
  const { rows } = await pool.query('SELECT COUNT(*) as c FROM celebrities');
  if (parseInt(rows[0].c) === 0) {
    const seed = [
      { id:'1', name:'Christopher Larosa', category:'actors', price:5000, photo:'https://stratifymanagementteam.com/admin/storage/app/public/uploads/69bad611a58b9.jpg', data:{ country:'Canada', flag:'🇨🇦', bio:'Award-winning Canadian actor celebrated for his intense dramatic roles in both film and television.', feat:true, avail:true, rating:4.9, reviews:128, tags:['Corporate Events','Charity Galas','Film Premieres','Speaking'] } },
      { id:'2', name:'Hamdan Al Maktoum', category:'royalty', price:18500, photo:'https://stratifymanagementteam.com/admin/storage/app/public/uploads/691303dc8c54e.jpg', data:{ country:'UAE', flag:'🇦🇪', bio:'Crown Prince of Dubai, accomplished equestrian champion, beloved poet, and global philanthropist.', feat:true, avail:true, rating:4.9, reviews:89, tags:['State Events','Equestrian Shows','Charity','Exclusive'] } },
      { id:'3', name:'Anthony Dalton', category:'actors', price:7000, photo:'https://stratifymanagementteam.com/admin/storage/app/public/uploads/69bae06bb2105.jpg', data:{ country:'USA', flag:'🇺🇸', bio:'Hollywood producer and actor with decades of experience spanning blockbuster films and award-winning television.', feat:true, avail:false, rating:4.9, reviews:203, tags:['Screenings','Q&A Sessions','Award Shows','Private Functions'] } },
      { id:'4', name:'Noah Fearnley', category:'musicians', price:4500, photo:'https://stratifymanagementteam.com/admin/storage/app/public/uploads/69bcefbce7072.jpeg', data:{ country:'Australia', flag:'🇦🇺', bio:'Chart-topping Australian musician whose soulful compositions have earned him international acclaim.', feat:true, avail:true, rating:4.9, reviews:156, tags:['Live Concerts','Private Performances','Meet & Greet','Radio'] } },
      { id:'5', name:'Espen Hatleskog', category:'sports', price:6000, photo:'https://stratifymanagementteam.com/admin/storage/app/public/uploads/69bcf0390bb6d.jpeg', data:{ country:'Australia', flag:'🇦🇺', bio:'Professional athlete and motivational speaker who has inspired millions through his extraordinary sporting achievements.', feat:true, avail:true, rating:4.9, reviews:97, tags:['Motivational Talks','Sports Events','Brand Appearances','Coaching'] } },
      { id:'6',  name:'Aria Chen',     category:'musicians',  price:8500,  photo:null, data:{ country:'Singapore', flag:'🇸🇬', bio:'Grammy-nominated pop artist from Singapore.', feat:false, avail:true,  rating:4.8, reviews:174, tags:['Concert Tours','TV Appearances','Fan Experiences','Brand Deals'] } },
      { id:'7',  name:'Marcus Webb',   category:'actors',     price:12000, photo:null, data:{ country:'UK',        flag:'🇬🇧', bio:'BAFTA award-winning British actor renowned for transformative roles.', feat:false, avail:true,  rating:4.7, reviews:211, tags:['Theatre Events','Film Festivals','Private Functions','Keynotes'] } },
      { id:'8',  name:'Layla Hassan',  category:'influencers',price:6500,  photo:null, data:{ country:'Egypt',    flag:'🇪🇬', bio:'Digital creator with 50M+ followers.', feat:false, avail:false, rating:4.8, reviews:342, tags:['Brand Campaigns','Product Launches','Social Media','Endorsements'] } },
      { id:'9',  name:'Diego Santos',  category:'sports',     price:9000,  photo:null, data:{ country:'Brazil',   flag:'🇧🇷', bio:'Olympic gold medalist and fitness icon.', feat:false, avail:true,  rating:4.9, reviews:189, tags:['Sports Clinics','Fitness Events','School Visits','Keynotes'] } },
      { id:'10', name:'Yuki Tanaka',   category:'influencers',price:7500,  photo:null, data:{ country:'Japan',    flag:'🇯🇵', bio:'Fashion influencer and brand ambassador.', feat:false, avail:true,  rating:4.8, reviews:267, tags:['Fashion Shows','Brand Deals','Cultural Events','Exhibitions'] } },
      { id:'11', name:'Sofia Reyes',   category:'musicians',  price:5500,  photo:null, data:{ country:'Mexico',   flag:'🇲🇽', bio:'Latin pop sensation with vibrant personality.', feat:false, avail:true,  rating:4.7, reviews:145, tags:['Concerts','Festivals','Fan Meetups','Brand Events'] } },
      { id:'12', name:'James Okafor',  category:'actors',     price:4000,  photo:null, data:{ country:'Nigeria',  flag:'🇳🇬', bio:'Nollywood icon and international star.', feat:false, avail:true,  rating:4.8, reviews:312, tags:['Film Events','Cultural Shows','Speaking','Charity'] } },
    ];
    for (const c of seed) {
      await pool.query(
        'INSERT INTO celebrities (id,name,category,price,verified,photo,data) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING',
        [c.id, c.name, c.category, c.price, 1, c.photo, JSON.stringify(c.data)]
      );
    }
  }

  console.log('PostgreSQL ready.');
}

initDB().catch(err => { console.error('DB init failed:', err); process.exit(1); });

// ─────────────────────────────────────────────
// WEBSOCKET — in-memory state
// ─────────────────────────────────────────────
const activeSessions  = new Map(); // sessionId → { customerWs, agentWs, agentName }
const agentSockets    = new Set(); // all connected agent websockets
const waitingQueue    = [];        // ordered sessionIds without an agent
const waitlistWatchers = new Map(); // waitlistId → ws

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

async function persistMessage(sessionId, senderRole, senderName, content) {
  const id = uid();
  const ts = new Date().toISOString();
  await q(
    'INSERT INTO chat_messages (id,"sessionId","senderRole","senderName",content,ts) VALUES ($1,$2,$3,$4,$5,$6)',
    [id, sessionId, senderRole, senderName, content, ts]
  );
  await q('UPDATE chat_sessions SET "updatedAt"=$1 WHERE id=$2', [ts, sessionId]);
  return { id, sessionId, senderRole, senderName, content, ts };
}

// ─────────────────────────────────────────────
// WEBSOCKET HANDLER
// ─────────────────────────────────────────────
wss.on('connection', ws => {
  let sessionId  = null;
  let role       = null;
  let clientName = 'Unknown';

  ws.on('message', async rawData => {
    let msg;
    try { msg = JSON.parse(rawData); } catch { return; }

    // ── CUSTOMER JOIN ──────────────────────────────────────────
    if (msg.type === 'customer_join') {
      const { name, email, topic, existingSessionId } = msg;
      clientName = name || 'Guest';
      role = 'customer';

      if (existingSessionId) {
        sessionId = existingSessionId;
        const existing = activeSessions.get(sessionId) || {};
        activeSessions.set(sessionId, { ...existing, customerWs: ws });
        const history = await qAll('SELECT * FROM chat_messages WHERE "sessionId"=$1 ORDER BY ts ASC', [sessionId]);
        const session = await qOne('SELECT * FROM chat_sessions WHERE id=$1', [sessionId]);
        send(ws, { type: 'session_rejoined', sessionId, session, history });
        const s = activeSessions.get(sessionId);
        if (s?.agentWs) send(s.agentWs, { type: 'customer_reconnected', sessionId });
      } else {
        sessionId = uid();
        await q(
          'INSERT INTO chat_sessions (id,"customerName","customerEmail",topic,status) VALUES ($1,$2,$3,$4,$5)',
          [sessionId, clientName, email || '', topic || 'General Inquiry', 'waiting']
        );
        activeSessions.set(sessionId, { customerWs: ws, agentWs: null, agentName: null });
        waitingQueue.push(sessionId);
        const position = waitingQueue.indexOf(sessionId) + 1;
        send(ws, { type: 'session_created', sessionId, position, total: waitingQueue.length });
        broadcastToAgents({ type: 'new_session', sessionId, customerName: clientName, topic: topic || 'General Inquiry', position });
        broadcastQueuePositions();
        const sysMsg = await persistMessage(sessionId, 'system', 'StarBook', `Welcome ${clientName}! You are #${position} in queue. A concierge agent will be with you shortly.`);
        send(ws, { type: 'message', message: sysMsg });
      }
    }

    // ── AGENT JOIN ────────────────────────────────────────────
    else if (msg.type === 'agent_join') {
      try {
        const decoded = jwt.verify(msg.token, SECRET);
        if (decoded.role !== 'admin') { ws.close(); return; }
        role = 'agent';
        clientName = decoded.name;
        agentSockets.add(ws);
        const sessions = await qAll(
          `SELECT cs.*,
            (SELECT content FROM chat_messages WHERE "sessionId"=cs.id ORDER BY ts DESC LIMIT 1) as "lastMessage",
            (SELECT COUNT(*) FROM chat_messages WHERE "sessionId"=cs.id) as "messageCount"
           FROM chat_sessions cs ORDER BY cs."updatedAt" DESC`
        );
        send(ws, { type: 'agent_init', sessions, queueLength: waitingQueue.length });
      } catch { ws.close(); }
    }

    // ── CLAIM SESSION ─────────────────────────────────────────
    else if (msg.type === 'claim_session' && role === 'agent') {
      const sid = msg.sessionId;
      const s = activeSessions.get(sid) || {};
      await q('UPDATE chat_sessions SET status=$1,"agentName"=$2 WHERE id=$3', ['active', clientName, sid]);
      activeSessions.set(sid, { ...s, agentWs: ws, agentName: clientName });
      const qi = waitingQueue.indexOf(sid);
      if (qi !== -1) waitingQueue.splice(qi, 1);
      const history = await qAll('SELECT * FROM chat_messages WHERE "sessionId"=$1 ORDER BY ts ASC', [sid]);
      const session = await qOne('SELECT * FROM chat_sessions WHERE id=$1', [sid]);
      send(ws, { type: 'session_claimed', sessionId: sid, history, session });
      const agentMsg = await persistMessage(sid, 'system', 'StarBook', `${clientName} (Senior Agent) has joined the conversation.`);
      if (s.customerWs) {
        send(s.customerWs, { type: 'agent_joined', agentName: clientName });
        send(s.customerWs, { type: 'message', message: agentMsg });
      }
      send(ws, { type: 'message', message: agentMsg });
      broadcastQueuePositions();
      broadcastToAgents({ type: 'session_claimed_by_other', sessionId: sid, agentName: clientName });
    }

    // ── SEND MESSAGE ──────────────────────────────────────────
    else if (msg.type === 'message') {
      const sid = msg.sessionId || sessionId;
      if (!sid) return;
      const content = (msg.content || '').trim();
      if (!content) return;
      const s = activeSessions.get(sid);
      const saved = await persistMessage(sid, role, clientName, content);
      const envelope = { type: 'message', message: saved };
      if (role === 'customer' && s?.agentWs) send(s.agentWs, envelope);
      if (role === 'agent'    && s?.customerWs) send(s.customerWs, envelope);
      send(ws, { type: 'message_sent', message: saved });
    }

    // ── TYPING ────────────────────────────────────────────────
    else if (msg.type === 'typing') {
      const sid = msg.sessionId || sessionId;
      if (!sid) return;
      const s = activeSessions.get(sid);
      const target = role === 'customer' ? s?.agentWs : s?.customerWs;
      send(target, { type: 'typing', from: role, sessionId: sid, name: clientName });
    }

    // ── CLOSE SESSION ─────────────────────────────────────────
    else if (msg.type === 'close_session') {
      const sid = msg.sessionId || sessionId;
      if (!sid) return;
      await q('UPDATE chat_sessions SET status=$1 WHERE id=$2', ['closed', sid]);
      const s = activeSessions.get(sid);
      if (s?.customerWs) send(s.customerWs, { type: 'session_closed' });
      if (s?.agentWs)    send(s.agentWs,    { type: 'session_closed', sessionId: sid });
      activeSessions.delete(sid);
      broadcastToAgents({ type: 'session_updated', sessionId: sid, status: 'closed' });
    }

    // ── GET SESSIONS (agent refresh) ──────────────────────────
    else if (msg.type === 'get_sessions' && role === 'agent') {
      const sessions = await qAll(
        `SELECT cs.*,
          (SELECT content FROM chat_messages WHERE "sessionId"=cs.id ORDER BY ts DESC LIMIT 1) as "lastMessage",
          (SELECT COUNT(*) FROM chat_messages WHERE "sessionId"=cs.id) as "messageCount"
         FROM chat_sessions cs ORDER BY cs."updatedAt" DESC LIMIT 50`
      );
      send(ws, { type: 'sessions_list', sessions });
    }

    // ── WAITLIST WATCH ────────────────────────────────────────
    else if (msg.type === 'waitlist_watch' && msg.id) {
      waitlistWatchers.set(msg.id, ws);
      const entry = await qOne('SELECT status FROM waitlist WHERE id=$1', [msg.id]);
      if (entry) send(ws, { type: 'waitlist_updated', id: msg.id, status: entry.status });
    }
  });

  ws.on('close', async () => {
    if (role === 'agent') {
      agentSockets.delete(ws);
      for (const [sid, s] of activeSessions) {
        if (s.agentWs === ws) {
          activeSessions.set(sid, { ...s, agentWs: null, agentName: null });
          await q('UPDATE chat_sessions SET status=$1,"agentName"=NULL WHERE id=$2', ['waiting', sid]);
          if (!waitingQueue.includes(sid)) waitingQueue.push(sid);
          if (s.customerWs) {
            send(s.customerWs, { type: 'agent_left' });
            const sysMsg = await persistMessage(sid, 'system', 'StarBook', 'Agent disconnected. You will be reconnected shortly.');
            send(s.customerWs, { type: 'message', message: sysMsg });
            send(s.customerWs, { type: 'queue_update', position: waitingQueue.indexOf(sid) + 1, total: waitingQueue.length });
          }
          broadcastToAgents({ type: 'new_session', sessionId: sid, customerName: s.customerName || 'Customer', topic: 'Reconnect needed' });
        }
      }
      broadcastQueuePositions();
    }
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
  try {
    const hash = await bcrypt.hash(password, 10);
    const id   = Date.now().toString();
    const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';
    await q('INSERT INTO users (id,name,email,password,role) VALUES ($1,$2,$3,$4,$5)', [id, name, email, hash, role]);
    const token = jwt.sign({ id, email, name, role }, SECRET, { expiresIn: '7d' });
    res.json({ user: { id, name, email, role, token } });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await qOne('SELECT * FROM users WHERE email=$1', [email]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, token } });
  } catch { res.status(500).json({ error: 'Server error' }); }
});

// ─────────────────────────────────────────────
// CELEBRITY ROUTES
// ─────────────────────────────────────────────
app.get('/api/celebrities', async (req, res) => {
  try {
    const rows = await qAll('SELECT * FROM celebrities');
    res.json(rows.map(r => {
      const d = JSON.parse(r.data || '{}');
      return { id: parseInt(r.id), name: r.name, cat: r.category, price: r.price, img: r.photo, avail: d.avail !== false, feat: !!d.feat, rating: d.rating || 4.8, reviews: d.reviews || 0, country: d.country || '', flag: d.flag || '', bio: d.bio || '', tags: d.tags || [] };
    }));
  } catch { res.status(500).json({ error: 'Database error' }); }
});

app.patch('/api/celebrities/:id/availability', authenticate, adminOnly, async (req, res) => {
  try {
    const row = await qOne('SELECT data FROM celebrities WHERE id=$1', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    const d = JSON.parse(row.data || '{}');
    d.avail = req.body.avail;
    await q('UPDATE celebrities SET data=$1 WHERE id=$2', [JSON.stringify(d), req.params.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Update failed' }); }
});

// ─────────────────────────────────────────────
// BOOKING ROUTES
// ─────────────────────────────────────────────
app.post('/api/bookings', authenticate, async (req, res) => {
  const { celeb, type, form, payment, donateAmt } = req.body;
  if (!celeb || !type || !form || !payment) return res.status(400).json({ error: 'Missing fields' });
  try {
    const amount = type === 'donate' ? (donateAmt || 0) : (type === 'fan_card' ? 299 : celeb.price);
    await q(
      'INSERT INTO bookings (id,"userId","celebData","bookingType","formData","paymentMethod",amount) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [Date.now().toString(), req.user.id, JSON.stringify(celeb), type, JSON.stringify(form), payment, amount]
    );
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to save booking' }); }
});

app.get('/api/user/bookings', authenticate, async (req, res) => {
  try {
    const rows = await qAll('SELECT * FROM bookings WHERE "userId"=$1 ORDER BY date DESC', [req.user.id]);
    res.json(rows.map(r => ({ ...r, celebData: JSON.parse(r.celebData), formData: JSON.parse(r.formData) })));
  } catch { res.status(500).json({ error: 'Database error' }); }
});

// ─────────────────────────────────────────────
// CHAT REST ROUTES
// ─────────────────────────────────────────────
app.get('/api/chat/:sessionId/history', async (req, res) => {
  try {
    const session  = await qOne('SELECT * FROM chat_sessions WHERE id=$1', [req.params.sessionId]);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const messages = await qAll('SELECT * FROM chat_messages WHERE "sessionId"=$1 ORDER BY ts ASC', [req.params.sessionId]);
    res.json({ session, messages });
  } catch { res.status(500).json({ error: 'DB error' }); }
});

// ─────────────────────────────────────────────
// WAITLIST ROUTES
// ─────────────────────────────────────────────
app.post('/api/waitlist', async (req, res) => {
  const { name, email, eventType, preferredDate, budget, notes } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
  try {
    const id = uid();
    const countRow = await qOne("SELECT COUNT(*) as c FROM waitlist WHERE status='waiting'");
    const position = parseInt(countRow?.c || 0) + 1;
    await q(
      'INSERT INTO waitlist (id,name,email,"eventType","preferredDate",budget,notes,position) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [id, name, email, eventType || '', preferredDate || '', budget || '', notes || '', position]
    );
    broadcastToAgents({ type: 'waitlist_new', entry: { id, name, email, eventType, position, status: 'waiting', createdAt: new Date().toISOString() } });
    res.json({ success: true, id, position });
  } catch { res.status(500).json({ error: 'Failed to join waitlist' }); }
});

app.get('/api/waitlist/:id/position', async (req, res) => {
  try {
    const entry = await qOne('SELECT * FROM waitlist WHERE id=$1', [req.params.id]);
    if (!entry) return res.status(404).json({ error: 'Not found' });
    const ahead = await qOne("SELECT COUNT(*) as c FROM waitlist WHERE status='waiting' AND \"createdAt\" < $1", [entry.createdAt]);
    res.json({ ...entry, position: parseInt(ahead?.c || 0) + 1 });
  } catch { res.status(500).json({ error: 'DB error' }); }
});

// ─────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────
app.get('/api/admin/bookings', authenticate, adminOnly, async (req, res) => {
  try {
    const rows = await qAll('SELECT b.*, u.name as "userName" FROM bookings b JOIN users u ON b."userId"=u.id ORDER BY b.date DESC');
    res.json(rows.map(r => ({ ...r, celebData: JSON.parse(r.celebData), formData: JSON.parse(r.formData) })));
  } catch { res.status(500).json({ error: 'Database error' }); }
});

app.patch('/api/admin/bookings/:id', authenticate, adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'declined'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    await q('UPDATE bookings SET status=$1 WHERE id=$2', [status, req.params.id]);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Database error' }); }
});

app.get('/api/admin/users', authenticate, adminOnly, async (req, res) => {
  try {
    const rows = await qAll('SELECT id,name,email,role,joined FROM users ORDER BY joined DESC');
    res.json(rows);
  } catch { res.status(500).json({ error: 'Database error' }); }
});

app.get('/api/admin/chat/sessions', authenticate, adminOnly, async (req, res) => {
  try {
    const sessions = await qAll(
      `SELECT cs.*,
        (SELECT content FROM chat_messages WHERE "sessionId"=cs.id ORDER BY ts DESC LIMIT 1) as "lastMessage",
        (SELECT COUNT(*) FROM chat_messages WHERE "sessionId"=cs.id AND "senderRole"='customer') as unread
       FROM chat_sessions cs ORDER BY cs."updatedAt" DESC LIMIT 100`
    );
    res.json(sessions);
  } catch { res.status(500).json({ error: 'DB error' }); }
});

app.patch('/api/admin/waitlist/:id', authenticate, adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!['waiting', 'attending', 'done', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    await q('UPDATE waitlist SET status=$1 WHERE id=$2', [status, req.params.id]);
    const update = { type: 'waitlist_updated', id: req.params.id, status };
    broadcastToAgents(update);
    const watcherWs = waitlistWatchers.get(req.params.id);
    if (watcherWs) send(watcherWs, update);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'DB error' }); }
});

app.get('/api/admin/waitlist', authenticate, adminOnly, async (req, res) => {
  try {
    const entries = await qAll('SELECT * FROM waitlist ORDER BY "createdAt" DESC');
    res.json(entries);
  } catch { res.status(500).json({ error: 'DB error' }); }
});

app.post('/api/payments/crypto', authenticate, (req, res) => {
  res.json({ address: 'bc1q...', network: 'Bitcoin', memo: 'Use BTC mainnet only' });
});

server.listen(PORT, () => {
  console.log(`StarBook server running on port ${PORT}`);
  console.log(`WebSocket ready`);
});
