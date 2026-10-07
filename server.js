/* Rectilinear Redundancies — optional sync server (no dependencies, Node 16+)
   Run:  SITE_KEY=yourkey ADMIN_TOKEN=yoursecret node server.js
   Then set in config.js: window.SYNC_CONFIG = { endpoint: "https://your-host:8787", siteKey: "yourkey" };
   Stores only simplified study stats (no passwords) in data.json next to this file. */
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 8787, SITE_KEY = process.env.SITE_KEY || '', ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const FILE = path.join(__dirname, 'data.json');
if (!ADMIN_TOKEN) { console.error('Set ADMIN_TOKEN (and SITE_KEY) env vars first.'); process.exit(1); }
let db = {}; try { db = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch (e) {}
let t; const save = () => { clearTimeout(t); t = setTimeout(() => fs.writeFile(FILE, JSON.stringify(db), () => {}), 500); };
const num = (v, max = 1e7) => Math.max(0, Math.min(max, +v || 0));
const str = (v, n = 60) => String(v == null ? '' : v).slice(0, n);
const clean = b => {
  const o = { uid: str(b.uid, 40).replace(/[^\w-]/g, ''), user: str(b.user), device: str(b.device, 80), lastSeen: Date.now(),
    todayMin: num(b.todayMin, 1440), totalMin: num(b.totalMin), sessions: num(b.sessions), streak: num(b.streak, 5000), best: num(b.best, 5000),
    subjects: {}, daily: {}, syl: {}, lecWatched: num(b.lecWatched), filesOpened: num(b.filesOpened) };
  Object.entries(b.subjects || {}).slice(0, 10).forEach(([k, v]) => o.subjects[str(k, 20)] = num(v));
  Object.entries(b.daily || {}).slice(0, 60).forEach(([k, v]) => /^\d{4}-\d\d-\d\d$/.test(k) && (o.daily[k] = num(v, 1440)));
  Object.entries(b.syl || {}).slice(0, 5).forEach(([k, v]) => o.syl[str(k, 20)] = num(v, 100));
  return o;
};
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-site-key,x-admin-token');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  const send = (c, o) => { res.writeHead(c, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method === 'GET' && req.url === '/api/ping') return send(200, { ok: true });
  const admin = req.headers['x-admin-token'] === ADMIN_TOKEN;
  if (req.method === 'POST' && req.url === '/api/sync') {
    if (SITE_KEY && req.headers['x-site-key'] !== SITE_KEY) return send(401, { error: 'bad key' });
    let body = ''; req.on('data', d => { body += d; if (body.length > 50000) req.destroy(); });
    return req.on('end', () => { try { const o = clean(JSON.parse(body)); if (!o.uid) return send(400, { error: 'uid' }); db[o.uid] = o; save(); send(200, { ok: true }); } catch (e) { send(400, { error: 'bad json' }); } });
  }
  if (req.method === 'GET' && req.url === '/api/users') return admin ? send(200, Object.values(db)) : send(401, { error: 'unauthorized' });
  if (req.method === 'DELETE' && req.url.startsWith('/api/users/')) {
    if (!admin) return send(401, { error: 'unauthorized' });
    delete db[decodeURIComponent(req.url.slice(11))]; save(); return send(200, { ok: true });
  }
  send(404, { error: 'not found' });
}).listen(PORT, () => console.log('RR sync server on :' + PORT));
