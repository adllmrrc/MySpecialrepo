const assert = require('node:assert/strict');
const { createServer } = require('../backend/server.js');

(async () => {
  const server = createServer();
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;

  const unauth = await fetch(`${base}/api/watch/live`);
  assert.equal(unauth.status, 401);

  const reg = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'a@b.com', password: '1234' }),
  });
  assert.equal(reg.status, 200);
  const { token } = await reg.json();
  assert.ok(token);

  const badJson = await fetch(`${base}/api/watch/live`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: '{bad',
  });
  assert.equal(badJson.status, 400);

  const okPost = await fetch(`${base}/api/watch/live`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ heartRate: 140, calories: 222, vo2: 43, zone: 'peak' }),
  });
  assert.equal(okPost.status, 204);

  const okGet = await fetch(`${base}/api/watch/live`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(okGet.status, 200);
  const payload = await okGet.json();
  assert.equal(payload.heartRate, 140);

  const health = await fetch(`${base}/health`);
  assert.equal(health.status, 200);

  const mkJwt = (payload) => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${header}.${body}.sig`;
  };

  const appleFail = await fetch(`${base}/api/auth/apple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identityToken: 'bad-token' }),
  });
  assert.equal(appleFail.status, 401);

  const appleToken = mkJwt({ sub: 'apple-user-123', email: 'apple-user@privaterelay.appleid.com' });
  const appleOk = await fetch(`${base}/api/auth/apple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identityToken: appleToken }),
  });
  assert.equal(appleOk.status, 200);
  const appleBody = await appleOk.json();
  assert.equal(appleBody.provider, 'apple');
  assert.ok(appleBody.token);

  server.close();
  console.log('backend contract tests: OK');
})();
