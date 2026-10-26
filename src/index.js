/**
 * 刊行 · 编辑出版工作台
 * Cloudflare Workers 入口文件
 */

// 静态资源映射
const STATIC_FILES = {
  '/': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/index.html': { file: 'index.html', type: 'text/html; charset=utf-8' },
  '/app.js': { file: 'app.js', type: 'application/javascript; charset=utf-8' },
  '/styles.css': { file: 'styles.css', type: 'text/css; charset=utf-8' }
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 头设置
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // API 路由处理
      if (path.startsWith('/api/')) {
        return await handleAPI(request, env, path, corsHeaders);
      }

      // 静态文件服务
      return await serveStatic(path, corsHeaders);
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};

/**
 * 处理 API 请求
 */
async function handleAPI(request, env, path, corsHeaders) {
  const headers = { 'Content-Type': 'application/json', ...corsHeaders };

  // 用户认证 API
  if (path === '/api/auth/login' && request.method === 'POST') {
    const { username, password } = await request.json();

    // 简单的用户验证（实际应用中应该使用加密密码）
    const users = {
      admin: { password: '123456', role: 'admin', email: 'admin@kanxing.cn' },
      linmo: { password: '123456', role: 'employee', name: '林默', employeeId: 1 },
      zhouxiao: { password: '123456', role: 'employee', name: '周晓', employeeId: 2 },
      chenxu: { password: '123456', role: 'employee', name: '陈叙', employeeId: 3 },
      xuyan: { password: '123456', role: 'employee', name: '许言', employeeId: 4 },
      tangtang: { password: '123456', role: 'employee', name: '唐棠', employeeId: 5 }
    };

    const user = users[username];
    if (user && user.password === password) {
      return new Response(JSON.stringify({
        success: true,
        user: { username, role: user.role, ...user }
      }), { headers });
    }

    return new Response(JSON.stringify({
      success: false,
      message: '用户名或密码错误'
    }), { status: 401, headers });
  }

  // 书刊数据 API - 获取列表
  if (path === '/api/publications' && request.method === 'GET') {
    const data = await env.KV_STORE.get('publications', { type: 'json' });
    return new Response(JSON.stringify(data || []), { headers });
  }

  // 书刊数据 API - 保存/更新
  if (path === '/api/publications' && request.method === 'POST') {
    const publications = await request.json();
    await env.KV_STORE.put('publications', JSON.stringify(publications));
    return new Response(JSON.stringify({ success: true }), { headers });
  }

  // 获取单个书刊
  if (path.match(/^\/api\/publications\/\d+$/) && request.method === 'GET') {
    const id = parseInt(path.split('/').pop());
    const data = await env.KV_STORE.get('publications', { type: 'json' }) || [];
    const publication = data.find(p => p.id === id);

    if (publication) {
      return new Response(JSON.stringify(publication), { headers });
    }
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers
    });
  }

  // 更新单个书刊
  if (path.match(/^\/api\/publications\/\d+$/) && request.method === 'PUT') {
    const id = parseInt(path.split('/').pop());
    const updates = await request.json();
    const data = await env.KV_STORE.get('publications', { type: 'json' }) || [];
    const index = data.findIndex(p => p.id === id);

    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
      await env.KV_STORE.put('publications', JSON.stringify(data));
      return new Response(JSON.stringify({ success: true, data: data[index] }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers
    });
  }

  // 删除书刊
  if (path.match(/^\/api\/publications\/\d+$/) && request.method === 'DELETE') {
    const id = parseInt(path.split('/').pop());
    const data = await env.KV_STORE.get('publications', { type: 'json' }) || [];
    const filtered = data.filter(p => p.id !== id);

    if (filtered.length < data.length) {
      await env.KV_STORE.put('publications', JSON.stringify(filtered));
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers
    });
  }

  // 员工数据 API
  if (path === '/api/employees' && request.method === 'GET') {
    const employees = [
      { id: 1, username: 'linmo', name: '林默', role: '责任编辑', avatar: '林', color: 'purple' },
      { id: 2, username: 'zhouxiao', name: '周晓', role: '文字编辑', avatar: '周', color: 'blue' },
      { id: 3, username: 'chenxu', name: '陈叙', role: '设计编辑', avatar: '陈', color: 'green' },
      { id: 4, username: 'xuyan', name: '许言', role: '审校编辑', avatar: '许', color: 'rose' },
      { id: 5, username: 'tangtang', name: '唐棠', role: '文字编辑', avatar: '唐', color: 'orange' }
    ];
    return new Response(JSON.stringify(employees), { headers });
  }

  // 404
  return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
    status: 404,
    headers
  });
}

/**
 * 提供静态文件服务
 */
async function serveStatic(path, corsHeaders) {
  // 移除查询参数（如 ?v=2）
  const cleanPath = path.split('?')[0];
  const fileConfig = STATIC_FILES[cleanPath];

  if (!fileConfig) {
    return new Response('Not Found', {
      status: 404,
      headers: corsHeaders
    });
  }

  // 获取文件内容
  const fileContent = await getStaticFile(fileConfig.file);

  if (!fileContent) {
    return new Response('File not found', {
      status: 404,
      headers: corsHeaders
    });
  }

  return new Response(fileContent, {
    headers: {
      'Content-Type': fileConfig.type,
      'Cache-Control': 'public, max-age=3600',
      ...corsHeaders
    }
  });
}

/**
 * 获取静态文件内容（需要在构建时注入）
 */
async function getStaticFile(filename) {
  // 这里的文件内容会在部署时通过构建脚本注入
  // 或者使用 Workers Sites / R2 存储
  // 目前返回 null，需要配合构建脚本使用
  return null;
}
