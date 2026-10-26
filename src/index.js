const STATIC_FILES = {
  '/': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/index.html': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/app.js': { file: 'app.js', type: 'application/javascript; charset=utf-8' },
  '/styles.css': { file: 'styles.css', type: 'text/css; charset=utf-8' }
};

const json = (value, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
});
const error = (message, status) => json({ error: message }, status);
const encoder = new TextEncoder();
const bytes = hex => new Uint8Array(hex.match(/.{2}/g).map(part => parseInt(part, 16)));
const base64url = value => btoa(String.fromCharCode(...value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function passwordMatches(password, stored) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const actual = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256));
  const expected = bytes(hash);
  return actual.length === expected.length && actual.every((byte, i) => byte === expected[i]);
}

async function signingKey(secret) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function issueToken(user, secret) {
  const payload = base64url(encoder.encode(JSON.stringify({ username: user.username, exp: Date.now() + 86400000 })));
  const signature = await crypto.subtle.sign('HMAC', await signingKey(secret), encoder.encode(payload));
  return `${payload}.${base64url(new Uint8Array(signature))}`;
}

async function authenticate(request, env) {
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer /, '');
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  try {
    const encoded = signature.replace(/-/g, '+').replace(/_/g, '/');
    const sig = Uint8Array.from(atob(encoded), char => char.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', await signingKey(env.AUTH_SECRET), sig, encoder.encode(payload));
    if (!valid) return null;
    const data = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload.replace(/-/g, '+').replace(/_/g, '/')), char => char.charCodeAt(0))));
    if (data.exp < Date.now()) return null;
    return await env.DB.prepare('SELECT username, role, employee_id AS employeeId FROM users WHERE username = ?').bind(data.username).first();
  } catch { return null; }
}

async function publications(db, user) {
  const rows = await db.prepare(user.role === 'admin'
    ? 'SELECT * FROM publications ORDER BY id DESC'
    : 'SELECT DISTINCT p.* FROM publications p JOIN assignments a ON a.publication_id = p.id WHERE a.employee_id = ? ORDER BY p.id DESC')
    .bind(...(user.role === 'admin' ? [] : [user.employeeId])).all();
  const ids = rows.results.map(row => row.id);
  if (!ids.length) return [];
  const assignments = await db.prepare(`SELECT publication_id, employee_id AS employeeId, topic, note, updated_at AS updatedAt FROM assignments WHERE publication_id IN (${ids.map(() => '?').join(',')})`).bind(...ids).all();
  return rows.results.map(row => ({ id: row.id, title: row.title, code: row.code, type: row.type, deadline: row.deadline, note: row.note, cover: row.cover,
    assignments: assignments.results.filter(a => a.publication_id === row.id && (user.role === 'admin' || a.employeeId === user.employeeId)).map(({ publication_id, ...a }) => a) }));
}

function validatePublication(body) {
  if (!body || typeof body !== 'object' || !String(body.title || '').trim() || !String(body.code || '').trim() || !['图书', '期刊'].includes(body.type) || !/^\d{4}-\d{2}-\d{2}$/.test(body.deadline || '')) return false;
  return String(body.title).length <= 120 && String(body.code).length <= 60 && String(body.note || '').length <= 2000;
}

async function handleAPI(request, env, path) {
  if (!env.DB) return error('D1 数据库未配置', 503);
  if (!env.AUTH_SECRET || env.AUTH_SECRET.length < 32) return error('AUTH_SECRET 未配置或长度不足', 503);
  const method = request.method;
  if (path === '/api/health' && method === 'GET') {
    await env.DB.prepare('SELECT 1').first();
    return json({ ok: true });
  }
  if (path === '/api/auth/login' && method === 'POST') {
    const body = await request.json();
    const user = await env.DB.prepare('SELECT username, password_hash, role, employee_id AS employeeId FROM users WHERE username = ?').bind(String(body.username || '').trim().toLowerCase()).first();
    if (!user || !await passwordMatches(String(body.password || ''), user.password_hash)) return error('用户名或密码错误', 401);
    return json({ token: await issueToken(user, env.AUTH_SECRET), user: { username: user.username, role: user.role, employeeId: user.employeeId } });
  }
  const user = await authenticate(request, env);
  if (!user) return error('请重新登录', 401);
  if (path === '/api/auth/me' && method === 'GET') return json({ user });
  if (path === '/api/employees' && method === 'GET') {
    const result = await env.DB.prepare('SELECT id, username, name, role, avatar, color FROM employees ORDER BY id').all();
    return json(result.results);
  }
  if (path === '/api/publications' && method === 'GET') return json(await publications(env.DB, user));
  if (path === '/api/publications' && method === 'POST') {
    if (user.role !== 'admin') return error('无权限', 403);
    const body = await request.json();
    if (!validatePublication(body)) return error('书刊数据无效', 400);
    try {
      const result = await env.DB.prepare('INSERT INTO publications (title, code, type, deadline, note, cover) VALUES (?, ?, ?, ?, ?, ?)').bind(body.title.trim(), body.code.trim(), body.type, body.deadline, body.note || '', Number(body.cover) || 0).run();
      return json({ id: result.meta.last_row_id }, 201);
    } catch (e) { if (String(e).includes('UNIQUE')) return error('书刊编号已存在', 409); throw e; }
  }
  const match = path.match(/^\/api\/publications\/(\d+)$/);
  if (match && method === 'PUT') {
    if (user.role !== 'admin') return error('无权限', 403);
    const body = await request.json();
    if (!validatePublication(body)) return error('书刊数据无效', 400);
    try {
      const result = await env.DB.prepare('UPDATE publications SET title = ?, code = ?, type = ?, deadline = ?, note = ? WHERE id = ?').bind(body.title.trim(), body.code.trim(), body.type, body.deadline, body.note || '', Number(match[1])).run();
      return result.meta.changes ? json({ success: true }) : error('书刊不存在', 404);
    } catch (e) { if (String(e).includes('UNIQUE')) return error('书刊编号已存在', 409); throw e; }
  }
  if (match && method === 'DELETE') {
    if (user.role !== 'admin') return error('无权限', 403);
    const result = await env.DB.prepare('DELETE FROM publications WHERE id = ?').bind(Number(match[1])).run();
    return result.meta.changes ? json({ success: true }) : error('书刊不存在', 404);
  }
  const assignmentMatch = path.match(/^\/api\/publications\/(\d+)\/assignments$/);
  if (assignmentMatch && method === 'PUT') {
    if (user.role !== 'admin') return error('无权限', 403);
    const id = Number(assignmentMatch[1]);
    const body = await request.json();
    if (!Array.isArray(body.employeeIds) || body.employeeIds.some(value => !Number.isInteger(value)) || new Set(body.employeeIds).size !== body.employeeIds.length) return error('员工列表无效', 400);
    const pub = await env.DB.prepare('SELECT id FROM publications WHERE id = ?').bind(id).first();
    if (!pub) return error('书刊不存在', 404);
    const existing = await env.DB.prepare('SELECT employee_id FROM assignments WHERE publication_id = ?').bind(id).all();
    const oldIds = new Set(existing.results.map(row => row.employee_id));
    const wanted = new Set(body.employeeIds);
    const known = await env.DB.prepare('SELECT id FROM employees').all();
    if (body.employeeIds.some(value => !known.results.some(row => row.id === value))) return error('员工不存在', 400);
    const statements = [
      ...[...oldIds].filter(value => !wanted.has(value)).map(value => env.DB.prepare('DELETE FROM assignments WHERE publication_id = ? AND employee_id = ?').bind(id, value)),
      ...body.employeeIds.filter(value => !oldIds.has(value)).map(value => env.DB.prepare('INSERT INTO assignments (publication_id, employee_id) VALUES (?, ?)').bind(id, value))
    ];
    if (statements.length) await env.DB.batch(statements);
    return json({ success: true });
  }
  const reportMatch = path.match(/^\/api\/publications\/(\d+)\/report$/);
  if (reportMatch && method === 'PUT') {
    if (user.role !== 'employee') return error('仅员工可提交进度', 403);
    const body = await request.json();
    const topic = String(body.topic || '').trim();
    const note = String(body.note || '').trim();
    if (!topic || topic.length > 60 || note.length > 300) return error('进度内容无效', 400);
    const result = await env.DB.prepare("UPDATE assignments SET topic = ?, note = ?, updated_at = datetime('now', '+8 hours') WHERE publication_id = ? AND employee_id = ?").bind(topic, note, Number(reportMatch[1]), user.employeeId).run();
    return result.meta.changes ? json({ success: true }) : error('未分配该书刊', 404);
  }
  return error('接口不存在', 404);
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    try {
      if (path.startsWith('/api/')) return await handleAPI(request, env, path);
      const config = STATIC_FILES[path];
      if (!config) return new Response('Not Found', { status: 404 });
      const content = await getStaticFile(config.file);
      return content == null ? new Response('Not Found', { status: 404 }) : new Response(content, { headers: { 'Content-Type': config.type, 'Cache-Control': config.file === 'index.html' ? 'no-store' : 'public, max-age=3600' } });
    } catch (e) {
      console.error('Worker error:', e);
      if (e instanceof SyntaxError) return error('JSON 格式无效', 400);
      return error('服务器处理请求失败', 500);
    }
  }
};

async function getStaticFile(filename) {
  return null;
}
