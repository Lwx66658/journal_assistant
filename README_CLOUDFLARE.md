# 刊行 · Cloudflare Workers 部署指南

## 项目结构

```
journal-assistant/
├── src/
│   └── index.js          # Cloudflare Worker 主文件
├── index.html            # 前端 HTML
├── app.js                # 前端 JavaScript
├── styles.css            # 前端样式
├── wrangler.toml         # Cloudflare 配置
├── package.json          # 项目配置
├── build.js              # 构建脚本
└── README_CLOUDFLARE.md  # 本文档
```

## 部署步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 登录 Cloudflare

```bash
npx wrangler login
```

这会打开浏览器，让你授权 Wrangler 访问你的 Cloudflare 账户。

### 3. 创建 KV 命名空间

KV 用于存储书刊数据（替代前端的 localStorage）：

```bash
# 创建生产环境 KV
npm run kv:create

# 创建预览环境 KV
npm run kv:preview
```

记录返回的 `id` 和 `preview_id`，并更新到 `wrangler.toml` 文件中：

```toml
[[kv_namespaces]]
binding = "KV_STORE"
id = "你的_kv_namespace_id"
preview_id = "你的_preview_kv_namespace_id"
```

### 4. 构建项目

```bash
node build.js
```

这会将静态文件（HTML/CSS/JS）打包到 Worker 代码中。

### 5. 本地测试

```bash
npm run dev
```

访问 `http://localhost:8787` 测试应用。

### 6. 部署到 Cloudflare

```bash
npm run deploy
```

部署成功后，会显示你的 Worker URL，例如：
```
https://journal-assistant.your-username.workers.dev
```

### 7. 绑定自定义域名（可选）

在 Cloudflare Dashboard 中：
1. 进入 Workers & Pages
2. 选择你的 Worker
3. 点击 "Settings" > "Triggers"
4. 添加自定义域名

或在 `wrangler.toml` 中配置：

```toml
[env.production]
routes = [
  { pattern = "journal.your-domain.com/*", zone_name = "your-domain.com" }
]
```

## API 端点

### 认证
- `POST /api/auth/login` - 用户登录

### 书刊管理
- `GET /api/publications` - 获取所有书刊
- `POST /api/publications` - 创建/批量更新书刊
- `GET /api/publications/:id` - 获取单个书刊
- `PUT /api/publications/:id` - 更新书刊
- `DELETE /api/publications/:id` - 删除书刊

### 员工管理
- `GET /api/employees` - 获取所有员工

## 数据存储

### 当前方案：KV Store
- 使用 Cloudflare KV 存储书刊数据
- 优点：简单、快速、免费额度充足
- 限制：最终一致性，不适合高频写入

### 未来升级：D1 数据库（可选）

如果需要关系型数据库，可以启用 D1：

```bash
# 创建 D1 数据库
npx wrangler d1 create journal_db

# 更新 wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "journal_db"
database_id = "你的_database_id"

# 创建表结构
npx wrangler d1 execute journal_db --file=./schema.sql
```

## 环境变量

在 `wrangler.toml` 中配置：

```toml
[vars]
ENVIRONMENT = "production"
JWT_SECRET = "your-secret-key"
```

敏感信息使用 Secrets：

```bash
npx wrangler secret put JWT_SECRET
```

## 监控和日志

查看实时日志：

```bash
npm run tail
```

在 Cloudflare Dashboard 中查看：
- Workers & Pages > 你的 Worker > Logs
- Analytics 可以看到请求数、错误率等

## 成本估算

Cloudflare Workers 免费额度：
- ✅ 每天 100,000 次请求（免费计划）
- ✅ KV: 100,000 次读取/天，1,000 次写入/天
- ✅ 无需信用卡即可开始

付费计划（$5/月）：
- 🚀 1000万次请求/月
- 🚀 无限 KV 读写

## 性能优化建议

1. **静态资源缓存**：已配置 1 小时缓存
2. **KV 缓存策略**：书刊数据适合缓存
3. **CDN 加速**：Cloudflare 全球 CDN 自动加速
4. **代码压缩**：生产环境自动压缩

## 故障排查

### 1. 部署失败
```bash
# 检查配置
npx wrangler whoami
npx wrangler dev  # 本地测试
```

### 2. KV 数据无法读取
- 检查 `wrangler.toml` 中的 KV namespace ID
- 确保 binding 名称为 `KV_STORE`

### 3. 静态文件 404
- 运行 `node build.js` 重新构建
- 检查 `src/index.js` 是否包含静态文件内容

## 下一步开发

### 短期
- [ ] 实现 JWT 认证
- [ ] 添加数据备份功能
- [ ] 优化移动端体验

### 长期
- [ ] 迁移到 D1 数据库
- [ ] 添加图片上传（R2）
- [ ] 实现实时协作（Durable Objects）

## 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [KV 存储文档](https://developers.cloudflare.com/kv/)
- [D1 数据库文档](https://developers.cloudflare.com/d1/)

## 支持

遇到问题？
1. 查看 [Cloudflare Community](https://community.cloudflare.com/)
2. 查看项目 Issues
3. 阅读官方文档

---

🚀 **准备好了？运行 `npm run deploy` 开始部署！**
