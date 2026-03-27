// Minimal secure bridge backend (Node.js built-in http)
const http = require('http');

const PORT = process.env.PORT || 8787;
const TOKEN = process.env.FITOPRO_TOKEN || 'changeme-token';

let lastPayload = {
  heartRate: 96,
  calories: 122,
  vo2: 41.2,
  zone: 'cardio',
};

function auth(req) {
  const h = req.headers.authorization || '';
  return h === `Bearer ${TOKEN}`;
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/api/watch/live' && req.method === 'GET') {
    if (!auth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'unauthorized' }));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(lastPayload));
    return;
  }

  if (req.url === '/api/watch/live' && req.method === 'POST') {
    if (!auth(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'unauthorized' }));
      return;
    }
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        lastPayload = {
          heartRate: Number(parsed.heartRate ?? parsed.bpm ?? 0),
          calories: Number(parsed.calories ?? 0),
          vo2: Number(parsed.vo2 ?? 0),
          zone: String(parsed.zone ?? 'unknown'),
        };
        res.writeHead(204);
        res.end();
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'invalid_json' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not_found' }));
});

server.listen(PORT, () => {
  console.log(`FitoPro watch bridge listening on http://localhost:${PORT}`);
});
