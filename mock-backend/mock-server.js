const http = require('http');
const url = require('url');
const port = 8080;

const activePlan = {
  id: 1,
  planName: 'Demo Plan',
  price: 0,
  durationDays: 30,
  maxProducts: -1,
  maxUsers: 5,
  status: 'ACTIVE',
  description: 'Local mock active plan'
};

const adminUser = {
  id: 1,
  name: 'Super Admin',
  email: 'admin@supermart.com',
  role: 'SUPER_ADMIN'
};

function sendJSON(res, status, data) {
  const payload = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(payload);
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const method = req.method;

  if (method === 'OPTIONS') {
    const origin = req.headers.origin || 'http://localhost:3000';
    res.writeHead(204, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  if (method === 'GET' && parsed.pathname === '/api/subscription-plans/active') {
    return sendJSON(res, 200, activePlan);
  }

  if (method === 'GET' && parsed.pathname === '/api/subscription-plans') {
    return sendJSON(res, 200, [activePlan]);
  }

  if (method === 'POST' && parsed.pathname === '/api/admin/login') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        // simple acceptance for known test admin email
        if (data.email === 'admin@supermart.com') {
          return sendJSON(res, 200, { user: adminUser, token: 'mock-token-123' });
        }
        return sendJSON(res, 401, { error: 'Invalid credentials - mock' });
      } catch (e) {
        return sendJSON(res, 400, { error: 'Bad request' });
      }
    });
    return;
  }

  // fallback for other API routes
  if (parsed.pathname.startsWith('/api/')) {
    return sendJSON(res, 200, { message: 'Mock backend - route not implemented', route: parsed.pathname });
  }

  // non-api fallback
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(port, '0.0.0.0', () => console.log(`Mock backend listening on http://0.0.0.0:${port}`));
module.exports = server;