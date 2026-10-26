# 刊行 · 编辑出版工作台

原生 HTML/CSS/JavaScript 前端，Cloudflare Worker API，Cloudflare D1 数据库。管理员可以创建、编辑、删除书刊并分配员工；员工可以查看自己的任务并提交进度。所有书刊和报告数据由 D1 保存。

## 本地运行

需要 Node.js 和 Cloudflare Wrangler。先运行 `npm install`，然后：

```bash
copy .dev.vars.example .dev.vars
npm run db:init:local
npm run dev
```

在 `.dev.vars` 中把 `AUTH_SECRET` 改为至少 32 个随机字符。打开 `http://127.0.0.1:8787`。本地 D1 文件位于 `.wrangler/state`，不会提交到 Git。初始化脚本可重复运行，不会覆盖已有数据。

本地服务运行时，另开终端运行 `npm run test:smoke`，验证登录、权限、书刊增删改、任务分配和员工报告的完整链路。测试会创建一条临时书刊并在结束时删除。

## 部署

1. 运行 `npx wrangler login`。
2. 运行 `npx wrangler d1 create journal_db`，把返回的 `database_id` 填入 `wrangler.toml`，替换全零占位值。
3. 运行 `npm run db:init:remote`，创建表和演示账号。
4. 运行 `npx wrangler secret put AUTH_SECRET`，设置至少 32 个随机字符。生产环境不要与本地使用同一个值。
5. 运行 `npm run deploy`。

演示账号：管理员 `admin / 123456`，员工 `linmo / 123456`、`zhouxiao / 123456`、`chenxu / 123456`、`xuyan / 123456`、`tangtang / 123456`。上线前请更换这些账号的密码散列并移除页面上的演示账号提示。密码在数据库中以 PBKDF2-SHA256 散列保存；登录令牌在 24 小时后过期，页面存在 `sessionStorage` 中。

## API

除健康检查和登录外，接口需要 `Authorization: Bearer <token>`。

| 方法 | 路径 | 用途 | 权限 |
| --- | --- | --- | --- |
| GET | `/api/health` | 检查 D1 连接 | 公开 |
| POST | `/api/auth/login` | 登录 | 公开 |
| GET | `/api/auth/me` | 检查当前登录 | 已登录 |
| GET | `/api/employees` | 员工列表 | 已登录 |
| GET | `/api/publications` | 书刊列表；员工只看到自己的任务 | 已登录 |
| POST | `/api/publications` | 创建书刊 | 管理员 |
| PUT/DELETE | `/api/publications/:id` | 编辑/删除书刊 | 管理员 |
| PUT | `/api/publications/:id/assignments` | 更新员工分配 | 管理员 |
| PUT | `/api/publications/:id/report` | 提交自己的进度 | 被分配的员工 |

`schema.sql` 定义数据库结构和演示账号。`build.js` 把前端文件打包到 Worker，`src/index.js` 实现 API 与静态文件服务，`app.js` 调用 API 并更新页面。
