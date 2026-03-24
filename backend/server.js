const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { sendWelcome, sendBookingConfirmation, sendBookingStatusUpdate, sendAdminBookingAlert } = require('./email');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'starbook-luxury-secret-key-2025';
const FRONTEND_URLS = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:5174').split(',').map(s => s.trim());

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return cb(null, true);
    // Allow any localhost or LAN IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    if (/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(origin)) return cb(null, true);
    if (FRONTEND_URLS.includes(origin)) return cb(null, true);
    cb(new Error('CORS: origin not allowed'));
  },
  credentials: true,
}));
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

  await pool.query(`ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS "chatSessionId" TEXT`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS blogs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT,
      author TEXT,
      "authorRole" TEXT,
      date TEXT,
      "readTime" TEXT,
      feat INTEGER DEFAULT 0,
      img TEXT,
      excerpt TEXT,
      content TEXT,
      "createdAt" TIMESTAMP DEFAULT NOW()
    )
  `);

  // Seed blogs (only if empty)
  const { rows: blogRows } = await pool.query('SELECT COUNT(*) as c FROM blogs');
  if (parseInt(blogRows[0].c) === 0) {
    const blogs = [
      { id:'b1', title:'How to Plan the Perfect Celebrity Appearance at Your Corporate Event', slug:'plan-celebrity-corporate-event', category:'Event Planning', author:'James Whitfield', authorRole:'Senior Booking Concierge', date:'2026-03-10', readTime:'7 min read', feat:1, img:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80', excerpt:'A celebrity appearance can elevate a corporate event from routine to legendary — but only when the logistics are right. Here\'s how the pros do it.', content: JSON.stringify([{type:'p',text:'Booking a celebrity for your corporate event is one of the most powerful moves an event organizer can make. The right star turns a standard gala into a headline moment — one that employees talk about for years. But pulling it off flawlessly requires careful planning, realistic timelines, and a partner who knows the industry inside out.'},{type:'h2',text:'Start 3–6 Months in Advance'},{type:'p',text:'Top-tier celebrities are booked months ahead of schedule. The moment you know your event date, start your search. Waiting until six weeks out severely limits your options and often inflates cost. Our concierge team recommends locking in talent at least 90 days before your event.'},{type:'h2',text:'Define Your Objective First'},{type:'p',text:'Are you trying to boost morale, attract press, launch a product, or reward clients? The answer shapes everything — which celebrity, what format (keynote, performance, Q&A), and how much stage time is needed. A misaligned booking wastes budget and underwhelms your audience.'},{type:'h2',text:'Respect the Rider'},{type:'p',text:'Every professional celebrity has a rider — a document listing technical, logistical, and personal requirements. Your venue needs to accommodate these requests to ensure the talent can deliver their best. StraBook\'s team reviews riders and negotiates on your behalf to keep requirements practical.'},{type:'h2',text:'Brief the Celebrity Thoroughly'},{type:'p',text:'The best appearances feel personal. Share your company story, key messages, and audience demographics with the talent well ahead of the event. Great celebrities use this to tailor their appearance — mentioning your brand milestones, acknowledging your team, making the moment feel genuine rather than transactional.'},{type:'h2',text:'Prepare for Day-Of Logistics'},{type:'p',text:'Assign a dedicated point-of-contact for the talent on the day. Ensure transport, green room access, and timing are locked down. Buffer 30 minutes before the celebrity\'s slot for any last-minute needs. When you work with StraBook, our concierge handles all of this coordination from contract to curtain call.'}]) },
      { id:'b2', title:'The Rise of the Video Message: Why Personalized Celebrity Shoutouts Are the New Luxury Gift', slug:'celebrity-video-messages-luxury-gift', category:'Trends', author:'Priya Mehta', authorRole:'Head of Client Experience', date:'2026-02-28', readTime:'5 min read', feat:1, img:'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&q=80', excerpt:'In a world of same-day delivery and digital gifting, nothing cuts through like a personal video from an icon. We explore why celebrity messages have become the most-requested service on the platform.', content: JSON.stringify([{type:'p',text:'Imagine receiving a birthday greeting not from a friend, but from your all-time favourite athlete. Or your company\'s top performer getting a personalised congratulations from a celebrity they admire. That is the power of the celebrity video message — and it has quietly become our fastest-growing service.'},{type:'h2',text:'Why It Works'},{type:'p',text:'Scarcity creates value. When someone receives a personalised video from a celebrity, the implicit message is: someone cared enough to make this happen. It\'s not something you can buy off a shelf. It requires effort, access, and intention — three things that signal deep appreciation.'},{type:'h2',text:'The Corporate Angle'},{type:'p',text:'Forward-thinking HR and leadership teams have discovered that celebrity messages are extraordinary motivational tools. A video shoutout celebrating a promotion, a work anniversary, or a sales target hit creates a memory the recipient never forgets. It\'s far more impactful than a gift card — and often less expensive.'},{type:'h2',text:'What Makes a Great Video Message'},{type:'p',text:'The best celebrity messages are specific. Vague generic shoutouts land flat. When briefing the talent, include the recipient\'s name, why they\'re being celebrated, a personal detail or two, and the tone you want. The celebrity will craft something that feels made-for-them — because it is.'},{type:'h2',text:'Turnaround and Quality'},{type:'p',text:'StraBook\'s video message service delivers in HD within 7 business days. For premium requests, express 48-hour delivery is available. Every video is reviewed for quality before delivery.'}]) },
      { id:'b3', title:'5 Celebrity Keynote Speakers Who Are Redefining the Conference Stage', slug:'celebrity-keynote-speakers-2026', category:'Insights', author:'Marcus Cole', authorRole:'Talent Relations Director', date:'2026-02-14', readTime:'6 min read', feat:0, img:'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80', excerpt:'The era of the dull conference keynote is over. These names are turning corporate stages into must-see moments — and the attendee satisfaction scores prove it.', content: JSON.stringify([{type:'p',text:'Conference keynotes have a reputation problem. Attendees dread the post-lunch slot. Engagement drops. Phones come out. But something has shifted — event organizers who book celebrities with genuine expertise in leadership, resilience, or innovation are seeing attendance and satisfaction metrics hit record highs.'},{type:'h2',text:'What Separates a Speaker from a Star Speaker'},{type:'p',text:'The difference isn\'t fame — it\'s story. Celebrities who have navigated extreme pressure, built empires from scratch, or overcome public adversity carry lessons that resonate with business audiences in a way that career speakers simply cannot replicate.'},{type:'h2',text:'Matching the Speaker to the Room'},{type:'p',text:'A motivational athlete works brilliantly for a sales conference. A philanthropist-entrepreneur resonates with CSR-focused leadership teams. A creative icon fits a brand or marketing summit. The match between speaker ethos and audience identity is the single biggest determinant of keynote success.'},{type:'h2',text:'Format Matters'},{type:'p',text:'The traditional 45-minute talk is no longer the gold standard. Fireside chats, moderated Q&As, and workshop-style sessions with celebrity co-facilitators are outperforming solo presentations on almost every engagement metric.'}]) },
      { id:'b4', title:'Behind the Scenes: What Actually Happens When You Make a Booking', slug:'behind-the-scenes-booking-process', category:'How It Works', author:'James Whitfield', authorRole:'Senior Booking Concierge', date:'2026-01-30', readTime:'4 min read', feat:0, img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80', excerpt:'Most clients see a confirmation email. We show you everything that happens in between — the calls, the negotiations, the logistics, and the moments when it all comes together.', content: JSON.stringify([{type:'p',text:'When you submit a booking request on StraBook, you see a clean interface and a confirmation notification. What you don\'t see is the flurry of activity that begins the moment your request lands in our system.'},{type:'h2',text:'Step 1: Talent Assessment (0–4 hours)'},{type:'p',text:'A dedicated concierge reviews your event brief and cross-references it against the talent\'s current schedule, contractual restrictions, and known preferences. If there\'s a flag — a conflicting brand endorsement, a blackout date, or a geographic restriction — we identify it immediately and surface alternatives.'},{type:'h2',text:'Step 2: Initial Inquiry to Management (4–24 hours)'},{type:'p',text:'We contact the celebrity\'s management team with a formal inquiry. Our standing relationships with over 500 talent agencies means we get responses in hours, not weeks.'},{type:'h2',text:'Step 3: Negotiation and Contracting (1–5 days)'},{type:'p',text:'Once the talent expresses interest, our legal and contracts team works with management to finalise terms — fee, format, rider requirements, usage rights, and cancellation clauses.'},{type:'h2',text:'Step 4: Day-Of Coordination'},{type:'p',text:'On the event day, a StraBook coordinator is on call to manage any last-minute changes. Travel delays, equipment issues, timing adjustments — we handle them so you don\'t have to.'}]) },
      { id:'b5', title:'From Dubai to Hollywood: Why Global Brands Are Turning to Regional Stars', slug:'global-brands-regional-celebrity-strategy', category:'Strategy', author:'Priya Mehta', authorRole:'Head of Client Experience', date:'2026-01-15', readTime:'8 min read', feat:0, img:'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80', excerpt:'Hollywood mega-stars are no longer the default choice for international brands. Regional celebrity strategy is delivering better ROI — and the numbers are hard to argue with.', content: JSON.stringify([{type:'p',text:'For decades, the prestige of a global campaign was measured by the fame of its ambassador. Hollywood. Premier League. Grand Slam. The bigger the name, the better the brief. But marketing data from the last three years tells a different story — and the most sophisticated brand teams are listening.'},{type:'h2',text:'The Trust Premium of Regional Stars'},{type:'p',text:'Audiences in the Gulf, Southeast Asia, and Sub-Saharan Africa consistently report higher trust in locally-recognised celebrities than in international imports. A familiar face from their culture, speaking their language, reflecting their values, carries authenticity that no media budget can manufacture.'},{type:'h2',text:'The Cost-Efficiency Argument'},{type:'p',text:'A tier-1 Hollywood star might command fees that consume the entirety of a mid-sized brand\'s annual marketing budget — for a single campaign. A regional star with equivalent cultural influence in the target market can deliver comparable impact at a fraction of the cost.'},{type:'h2',text:'Building a Balanced Roster Strategy'},{type:'p',text:'The most effective global brands are building layered celebrity strategies: one globally-recognised anchor ambassador for brand prestige, supported by a roster of regional talent for market-specific activation.'}]) },
      { id:'b6', title:'Meet & Greet Masterclass: How to Create a VIP Fan Experience That People Actually Remember', slug:'meet-greet-vip-fan-experience', category:'Event Planning', author:'Marcus Cole', authorRole:'Talent Relations Director', date:'2025-12-20', readTime:'5 min read', feat:0, img:'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1200&q=80', excerpt:'A meet & greet is only as good as its execution. These are the details that transform a quick photo opportunity into a moment fans carry with them for a lifetime.', content: JSON.stringify([{type:'p',text:'Meet & greets have a variable reputation. At their worst, they\'re rushed, impersonal, and leave fans feeling like items on a conveyor belt. At their best, they\'re transformative — a moment of genuine human connection with someone whose work has meant something to you.'},{type:'h2',text:'Flow Architecture'},{type:'p',text:'The physical flow of the meet & greet space determines the experience quality more than almost any other factor. Queuing areas should be comfortable, branded, and entertaining. The actual meeting space should feel intimate even when it isn\'t.'},{type:'h2',text:'Brief the Celebrity on the Audience'},{type:'p',text:'Celebrities who know their audience give better meet & greets. Share demographic data, the context of the event, and any particularly notable attendees. A celebrity who can say "I heard you\'ve been a fan since the beginning" creates a moment of astonishing personal impact.'},{type:'h2',text:'Photography Protocol'},{type:'p',text:'Professional lighting, a consistent background, and a designated photographer produces images that fans will actually want to share. Poor photo quality is one of the most common post-event complaints.'},{type:'h2',text:'Post-Event Follow-Through'},{type:'p',text:'The experience doesn\'t end when the fan leaves the room. Sending professional photos within 48 hours, along with a personalised thank-you message, extends the emotional resonance of the event and drives organic social sharing that money cannot buy.'}]) },
    ];
    for (const b of blogs) {
      await pool.query(
        'INSERT INTO blogs (id,title,slug,category,author,"authorRole",date,"readTime",feat,img,excerpt,content) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (id) DO NOTHING',
        [b.id, b.title, b.slug, b.category, b.author, b.authorRole, b.date, b.readTime, b.feat, b.img, b.excerpt, b.content]
      );
    }
  }

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

initDB().catch(err => { console.error('DB init failed:', err.message); });

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
        const sysMsg = await persistMessage(sessionId, 'system', 'StraBook', `Welcome ${clientName}! You are #${position} in queue. A concierge agent will be with you shortly.`);
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
      const agentMsg = await persistMessage(sid, 'system', 'StraBook', `${clientName} (Senior Agent) has joined the conversation.`);
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
            const sysMsg = await persistMessage(sid, 'system', 'StraBook', 'Agent disconnected. You will be reconnected shortly.');
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
    sendWelcome({ name, email });
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
// BLOG ROUTES
// ─────────────────────────────────────────────
function mapBlog(r) {
  return {
    id: r.id, title: r.title, slug: r.slug, category: r.category,
    author: r.author, authorRole: r.authorRole, date: r.date,
    readTime: r.readTime, feat: !!r.feat, img: r.img,
    excerpt: r.excerpt, content: JSON.parse(r.content || '[]'),
  };
}

app.get('/api/blogs', async (req, res) => {
  try {
    const rows = await qAll('SELECT * FROM blogs ORDER BY date DESC');
    res.json(rows.map(mapBlog));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/blogs/:id', async (req, res) => {
  try {
    const row = await qOne('SELECT * FROM blogs WHERE id=$1 OR slug=$1', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Blog not found' });
    res.json(mapBlog(row));
  } catch (e) { res.status(500).json({ error: e.message }); }
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
    sendBookingConfirmation({ name: form.name || req.user.name, email: form.email || req.user.email, celeb: celeb.name, type, amount, paymentMethod: payment });
    sendAdminBookingAlert({ customerName: form.name || req.user.name, customerEmail: form.email || req.user.email, celeb: celeb.name, type, amount, paymentMethod: payment });
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
    const booking = await qOne('SELECT b.*,u.name as "userName",u.email as "userEmail" FROM bookings b JOIN users u ON b."userId"=u.id WHERE b.id=$1', [req.params.id]);
    if (booking && (status === 'approved' || status === 'declined')) {
      const celeb = JSON.parse(booking.celebData || '{}');
      sendBookingStatusUpdate({ name: booking.userName, email: booking.userEmail, celeb: celeb.name, type: booking.bookingType, status });
    }
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
    let chatSessionId = null;
    if (status === 'attending') {
      const entry = await qOne('SELECT * FROM waitlist WHERE id=$1', [req.params.id]);
      if (entry && !entry.chatSessionId) {
        chatSessionId = uid();
        await q(
          'INSERT INTO chat_sessions (id,"customerName","customerEmail",topic,status) VALUES ($1,$2,$3,$4,$5)',
          [chatSessionId, entry.name, entry.email, 'Concierge Waitlist', 'waiting']
        );
        await q('UPDATE waitlist SET "chatSessionId"=$1 WHERE id=$2', [chatSessionId, req.params.id]);
        const sysMsg = await persistMessage(chatSessionId, 'system', 'StraBook', `Welcome ${entry.name}! Your concierge is ready. This session was opened from your waitlist request.`);
        // put this session in the waiting queue so agent can claim it
        activeSessions.set(chatSessionId, { customerWs: null, agentWs: null, agentName: null });
        waitingQueue.push(chatSessionId);
        broadcastToAgents({ type: 'new_session', sessionId: chatSessionId, customerName: entry.name, topic: 'Concierge Waitlist', position: waitingQueue.length });
      } else if (entry?.chatSessionId) {
        chatSessionId = entry.chatSessionId;
      }
    }
    await q('UPDATE waitlist SET status=$1 WHERE id=$2', [status, req.params.id]);
    const update = { type: 'waitlist_updated', id: req.params.id, status };
    broadcastToAgents(update);
    const watcherWs = waitlistWatchers.get(req.params.id);
    if (watcherWs) {
      send(watcherWs, update);
      if (status === 'attending' && chatSessionId) {
        send(watcherWs, { type: 'waitlist_attended', sessionId: chatSessionId });
      }
    }
    res.json({ success: true, chatSessionId });
  } catch (e) { res.status(500).json({ error: 'DB error' }); }
});

app.get('/api/admin/waitlist', authenticate, adminOnly, async (req, res) => {
  try {
    const entries = await qAll('SELECT * FROM waitlist ORDER BY "createdAt" DESC');
    res.json(entries);
  } catch { res.status(500).json({ error: 'DB error' }); }
});

// Admin: delete chat session
app.delete('/api/admin/chat/sessions/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const sid = req.params.id;
    await q('DELETE FROM chat_messages WHERE "sessionId"=$1', [sid]);
    await q('DELETE FROM chat_sessions WHERE id=$1', [sid]);
    activeSessions.delete(sid);
    const qi = waitingQueue.indexOf(sid);
    if (qi !== -1) waitingQueue.splice(qi, 1);
    broadcastToAgents({ type: 'session_deleted', sessionId: sid });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/payments/crypto', authenticate, (req, res) => {
  res.json({ address: 'bc1q...', network: 'Bitcoin', memo: 'Use BTC mainnet only' });
});

// Admin: add celebrity
app.post('/api/admin/celebrities', authenticate, adminOnly, async (req, res) => {
  try {
    const { name, category, price, photo, bio, country, flag, avail, feat, rating, tags } = req.body;
    if (!name || !category || !price) return res.status(400).json({ error: 'name, category, price required' });
    const id = uid();
    const data = { bio: bio||'', country: country||'', flag: flag||'', feat: !!feat, avail: avail !== false, rating: rating||4.8, reviews: 0, tags: tags||[] };
    await q('INSERT INTO celebrities (id,name,category,price,verified,photo,data) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [id, name, category, parseFloat(price), 1, photo||null, JSON.stringify(data)]);
    res.json({ id, name, category, price: parseFloat(price), img: photo||null, ...data });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Admin: delete celebrity
app.delete('/api/admin/celebrities/:id', authenticate, adminOnly, async (req, res) => {
  try {
    await q('DELETE FROM celebrities WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Admin: create user
app.post('/api/admin/users', authenticate, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });
    const exists = await qOne('SELECT id FROM users WHERE email=$1', [email]);
    if (exists) return res.status(400).json({ error: 'Email already in use' });
    const hash = await bcrypt.hash(password, 10);
    const id = Date.now().toString();
    await q('INSERT INTO users (id,name,email,password,role) VALUES ($1,$2,$3,$4,$5)',
      [id, name, email, hash, role === 'admin' ? 'admin' : 'user']);
    res.json({ id, name, email, role: role === 'admin' ? 'admin' : 'user' });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Admin: delete user
app.delete('/api/admin/users/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account.' });
    await q('DELETE FROM bookings WHERE "userId"=$1', [id]);
    const result = await q('DELETE FROM users WHERE id=$1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

server.listen(PORT, () => {
  console.log(`StraBook server running on port ${PORT}`);
  console.log(`WebSocket ready`);
});
