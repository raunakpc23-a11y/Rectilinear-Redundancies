/**
 * @file server.js
 * @description Production-ready lightweight synchronization server for Rectilinear Redundancies.
 * Zero external runtime dependencies (pure Node.js standard library).
 *
 * Usage:
 *   node server.js
 *   ADMIN_TOKEN="secret" SITE_KEY="optional" PORT=8787 node server.js
 *
 * @version 5.3.0
 * @license MIT
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// -----------------------------------------------------------------------------
// 1. ENVIRONMENT CONFIGURATION & .ENV LOADER (ZERO DEPENDENCIES)
// -----------------------------------------------------------------------------
function loadEnvFile(envPath) {
  try {
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx <= 0) return;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    });
  } catch (err) {
    console.warn(`[WARN] Could not parse .env file: ${err.message}`);
  }
}

loadEnvFile(path.join(__dirname, '.env'));

const PORT = parseInt(process.env.PORT || '8787', 10);
const HOST = process.env.HOST || '0.0.0.0';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const SITE_KEY = process.env.SITE_KEY || '';
const ORIGIN = process.env.ALLOW_ORIGIN || '*';
const DATA_FILE = path.resolve(__dirname, process.env.DATA_FILE || 'data.json');
const MAX_PAYLOAD_BYTES = 100 * 1024; // 100 KB limit
const MAX_USERS = 5000;

if (!ADMIN_TOKEN) {
  console.error('\x1b[31m[ERROR] ADMIN_TOKEN environment variable is required.\x1b[0m');
  console.error('Please configure ADMIN_TOKEN in your environment or in a .env file.');
  process.exit(1);
}

// -----------------------------------------------------------------------------
// 2. DATA PERSISTENCE LAYER
// -----------------------------------------------------------------------------
let usersStore = Object.create(null);

try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    usersStore = Object.assign(Object.create(null), JSON.parse(raw));
    console.log(`[INFO] Loaded ${Object.keys(usersStore).length} user records from ${path.basename(DATA_FILE)}`);
  }
} catch (err) {
  console.warn(`[WARN] Could not load ${DATA_FILE}. Initializing empty store. (${err.message})`);
  usersStore = Object.create(null);
}

let writeDebounceTimer = null;
function schedulePersist() {
  clearTimeout(writeDebounceTimer);
  writeDebounceTimer = setTimeout(() => {
    fs.writeFile(DATA_FILE, JSON.stringify(usersStore, null, 2), 'utf8', err => {
      if (err) console.error(`[ERROR] Failed to persist data: ${err.message}`);
    });
  }, 400);
}

// -----------------------------------------------------------------------------
// 3. SECURITY & VALIDATION UTILITIES
// -----------------------------------------------------------------------------
function timingSafeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function clampNumber(value, min = 0, max = 1e7) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, num));
}

function sanitizeString(value, maxLength = 80) {
  if (value == null) return '';
  return String(value).trim().slice(0, maxLength);
}

function validateAndSanitizePayload(body) {
  if (!body || typeof body !== 'object') return null;

  const uid = sanitizeString(body.uid, 64).replace(/[^\w-]/g, '');
  if (!uid) return null;

  const subjects = {};
  if (body.subjects && typeof body.subjects === 'object') {
    Object.keys(body.subjects).slice(0, 12).forEach(key => {
      subjects[sanitizeString(key, 30)] = clampNumber(body.subjects[key], 0, 1e5);
    });
  }

  const daily = {};
  if (body.daily && typeof body.daily === 'object') {
    Object.keys(body.daily).slice(-60).forEach(key => {
      daily[sanitizeString(key, 12)] = clampNumber(body.daily[key], 0, 1440);
    });
  }

  const syl = {};
  if (body.syl && typeof body.syl === 'object') {
    Object.keys(body.syl).slice(0, 10).forEach(key => {
      syl[sanitizeString(key, 30)] = clampNumber(body.syl[key], 0, 100);
    });
  }

  return {
    v: 1,
    uid,
    user: sanitizeString(body.user, 40) || 'anonymous',
    device: sanitizeString(body.device, 80),
    todayMin: clampNumber(body.todayMin, 0, 1440),
    totalMin: clampNumber(body.totalMin, 0, 1e7),
    streak: clampNumber(body.streak, 0, 10000),
    best: clampNumber(body.best, 0, 10000),
    sessions: clampNumber(body.sessions, 0, 1e6),
    lecWatched: clampNumber(body.lecWatched, 0, 1e6),
    filesOpened: clampNumber(body.filesOpened, 0, 1e6),
    subjects,
    daily,
    syl,
    lastSeen: Date.now()
  };
}

// -----------------------------------------------------------------------------
// 4. HTTP RESPONSE HELPERS
// -----------------------------------------------------------------------------
function sendResponse(res, statusCode, data, headers = {}) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Access-Control-Allow-Origin': ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, X-Site-Key, X-Admin-Token',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  res.end(payload);
}

function verifyAdminToken(req) {
  const incoming = req.headers['x-admin-token'] || '';
  return timingSafeCompare(incoming, ADMIN_TOKEN);
}

// -----------------------------------------------------------------------------
// 5. REQUEST ROUTER & HTTP SERVER
// -----------------------------------------------------------------------------
const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  // Handle CORS Pre-flight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': ORIGIN,
      'Access-Control-Allow-Headers': 'Content-Type, X-Site-Key, X-Admin-Token',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }

  const [pathname] = (req.url || '').split('?');

  // GET / or /api/health -> Health Check
  if (req.method === 'GET' && (pathname === '/' || pathname === '/api/health')) {
    return sendResponse(res, 200, {
      status: 'healthy',
      app: 'Rectilinear Redundancies Sync Server',
      version: '5.3.0',
      uptime: Math.floor(process.uptime()),
      users: Object.keys(usersStore).length,
      timestamp
    });
  }

  // POST /api/sync -> User Sync Endpoint
  if (req.method === 'POST' && pathname === '/api/sync') {
    if (SITE_KEY) {
      const incomingKey = req.headers['x-site-key'] || '';
      if (!timingSafeCompare(incomingKey, SITE_KEY)) {
        return sendResponse(res, 401, { error: 'Invalid or missing site authorization key' });
      }
    }

    let receivedBytes = 0;
    const chunks = [];

    req.on('data', chunk => {
      receivedBytes += chunk.length;
      if (receivedBytes > MAX_PAYLOAD_BYTES) {
        sendResponse(res, 413, { error: 'Payload exceeds maximum limit (100 KB)' });
        req.destroy();
      } else {
        chunks.push(chunk);
      }
    });

    req.on('end', () => {
      if (res.writableEnded) return;

      let parsedBody;
      try {
        parsedBody = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      } catch (err) {
        return sendResponse(res, 400, { error: 'Malformed JSON payload' });
      }

      const sanitized = validateAndSanitizePayload(parsedBody);
      if (!sanitized) {
        return sendResponse(res, 400, { error: 'Invalid payload structure or missing UID' });
      }

      if (Object.keys(usersStore).length >= MAX_USERS && !usersStore[sanitized.uid]) {
        return sendResponse(res, 507, { error: 'Storage capacity reached for new accounts' });
      }

      usersStore[sanitized.uid] = sanitized;
      schedulePersist();

      console.log(`[${timestamp}] [SYNC] User "${sanitized.user}" (${sanitized.uid}) synced from ${clientIp}`);
      return sendResponse(res, 200, { ok: true, syncedAt: sanitized.lastSeen });
    });
    return;
  }

  // GET /api/users -> Admin User List
  if (req.method === 'GET' && pathname === '/api/users') {
    if (!verifyAdminToken(req)) {
      return sendResponse(res, 401, { error: 'Unauthorized: Invalid admin credentials' });
    }
    const userList = Object.values(usersStore).sort((a, b) => b.lastSeen - a.lastSeen);
    return sendResponse(res, 200, userList);
  }

  // DELETE /api/users/:uid -> Admin Delete User
  const userDeleteMatch = pathname.match(/^\/api\/users\/([\w-]+)$/);
  if (req.method === 'DELETE' && userDeleteMatch) {
    if (!verifyAdminToken(req)) {
      return sendResponse(res, 401, { error: 'Unauthorized: Invalid admin credentials' });
    }
    const targetUid = userDeleteMatch[1];
    if (usersStore[targetUid]) {
      delete usersStore[targetUid];
      schedulePersist();
      console.log(`[${timestamp}] [ADMIN] User "${targetUid}" removed by admin`);
      return sendResponse(res, 200, { ok: true, message: `User ${targetUid} removed` });
    }
    return sendResponse(res, 404, { error: 'User record not found' });
  }

  // 404 Fallback
  return sendResponse(res, 404, { error: 'Endpoint not found' });
});

// -----------------------------------------------------------------------------
// 6. PROCESS LIFECYCLE & STARTUP
// -----------------------------------------------------------------------------
server.listen(PORT, HOST, () => {
  console.log(`
\x1b[36m╔════════════════════════════════════════════════════════════════════╗
║         Rectilinear Redundancies Sync Server v5.3.0                ║
╚════════════════════════════════════════════════════════════════════╝\x1b[0m
  ➜ Local:    http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}
  ➜ Health:   http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api/health
  ➜ Mode:     ${SITE_KEY ? 'Authenticated (Site Key Active)' : 'Open Ingestion'}
  ➜ Origin:   ${ORIGIN}
  ➜ Storage:  ${DATA_FILE}
`);
});

function handleShutdown(signal) {
  console.log(`\n[INFO] Received ${signal}. Flushing database and terminating gracefully...`);
  clearTimeout(writeDebounceTimer);
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(usersStore, null, 2), 'utf8');
    console.log('[INFO] Database state flushed successfully.');
  } catch (err) {
    console.error(`[ERROR] Error saving state during shutdown: ${err.message}`);
  }
  server.close(() => {
    console.log('[INFO] Server stopped.');
    process.exit(0);
  });
}

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
