import path from 'node:path';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve public/ relative to this file, so the server works from any folder.
const PUBLIC_DIR = path.join(import.meta.dirname, 'public');

// ---- Hard-coded data (no database) ----
const COURSES = [
  { id: 1, title: 'Introduction to Web Development', credits: 5 },
  { id: 2, title: 'Databases and Data Modelling', credits: 6 },
  { id: 3, title: 'Algorithms and Data Structures', credits: 6 },
  { id: 4, title: 'Computer Networks', credits: 4 },
];

const ROBOTS_TXT = ['User-agent: *', 'Disallow: /api/admin', 'Allow: /', ''].join('\n');

// ---- Middleware (registered BEFORE the routes) ----
let requestsServed = 0;

// 1) Request logger: one line per request, then pass control on.
function requestLogger(req, res, next) {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
}

// 2) Request counter: increments for every request that reaches the server.
function requestCounter(req, res, next) {
  requestsServed += 1;
  next();
}

app.use(requestLogger);
app.use(requestCounter);

// ---- Static files ----
// GET / serves public/index.html automatically; styles.css and app.js too.
app.use(express.static(PUBLIC_DIR));

// ---- Routes ----
app.get('/hello', (req, res) => {
  res.type('text/plain').send("Hello from Nazlı's server");
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(ROBOTS_TXT);
});

app.get('/old-page', (req, res) => {
  res.redirect('/hello');
});

app.get('/api/courses', (req, res) => {
  res.json(COURSES);
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    nodeVersion: process.version,
    uptimeSeconds: Math.round(process.uptime()),
  });
});

app.get('/api/headers', (req, res) => {
  res.json({
    'user-agent': req.get('User-Agent') ?? null,
    accept: req.get('Accept') ?? null,
  });
});

app.post('/api/subscribe', (req, res) => {
  res.status(201).json({ subscribed: true });
});

app.get('/api/admin', (req, res) => {
  res.status(403).json({ error: 'Forbidden' });
});

app.get('/api/stats', (req, res) => {
  res.json({ requestsServed });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
