import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:8787';
async function call(path, method = 'GET', body, token) {
  const response = await fetch(`${base}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return { status: response.status, data: await response.json() };
}

assert.equal((await call('/health')).status, 200);
assert.equal((await call('/publications')).status, 401);
assert.equal((await call('/auth/login', 'POST', { username: 'admin', password: 'bad' })).status, 401);
const admin = await call('/auth/login', 'POST', { username: 'admin', password: '123456' });
assert.equal(admin.status, 200);
assert.equal(admin.data.user.password_hash, undefined);
const employee = await call('/auth/login', 'POST', { username: 'linmo', password: '123456' });
assert.equal(employee.status, 200);
const adminToken = admin.data.token;
const employeeToken = employee.data.token;
assert.equal((await call('/employees', 'GET', undefined, adminToken)).data.length, 5);
assert.equal((await call('/publications', 'POST', { title: '禁止创建', code: 'NO', type: '图书', deadline: '2026-12-01' }, employeeToken)).status, 403);

const code = `TEST-${Date.now()}`;
const body = { title: '连接测试', code, type: '图书', deadline: '2026-12-01', note: '测试数据' };
const created = await call('/publications', 'POST', body, adminToken);
assert.equal(created.status, 201);
const id = created.data.id;
try {
  assert.equal((await call('/publications', 'POST', body, adminToken)).status, 409);
  assert.equal((await call(`/publications/${id}/assignments`, 'PUT', { employeeIds: [1] }, adminToken)).status, 200);
  const assigned = await call('/publications', 'GET', undefined, employeeToken);
  assert(assigned.data.some(pub => pub.id === id));
  assert.equal((await call(`/publications/${id}/report`, 'PUT', { topic: '测试已完成', note: '连接正常' }, adminToken)).status, 403);
  assert.equal((await call(`/publications/${id}/report`, 'PUT', { topic: '测试已完成', note: '连接正常' }, employeeToken)).status, 200);
  const updated = await call('/publications', 'GET', undefined, adminToken);
  assert.equal(updated.data.find(pub => pub.id === id).assignments[0].topic, '测试已完成');
  assert.equal((await call(`/publications/${id}`, 'PUT', { ...body, title: '更新成功' }, adminToken)).status, 200);
  assert.equal((await call(`/publications/${id}/assignments`, 'PUT', { employeeIds: [] }, adminToken)).status, 200);
  assert(!(await call('/publications', 'GET', undefined, employeeToken)).data.some(pub => pub.id === id));
} finally {
  assert.equal((await call(`/publications/${id}`, 'DELETE', undefined, adminToken)).status, 200);
}
console.log('D1/API smoke test passed');
