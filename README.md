# 刊行 · 编辑出版工作台

一个书刊协作管理应用，现已适配 Cloudflare Workers，支持一键部署到全球 CDN。

## ✨ 功能特性

- 📚 书刊创建、编辑和管理
- 👥 员工任务分配和进度跟踪
- 📊 工作台统计和最近动态
- 🔐 用户认证和角色管理（管理员/员工）
- 💾 数据持久化（KV Store）
- 📱 响应式设计（桌面端和移动端）
- 🌍 全球 CDN 加速（Cloudflare）
- 🚀 零服务器维护

## 🎯 快速开始

### 方案一：一键部署（推荐）

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd journal-assistant

# 2. 登录 Cloudflare
npx wrangler login

# 3. 创建 KV 存储
npm run kv:create
npm run kv:preview

# 4. 更新 wrangler.toml 中的 KV ID（复制上一步输出的 ID）

# 5. 一键部署
npm run deploy:full
```

### 方案二：手动部署

```bash
# 1. 安装依赖
npm install

# 2. 构建项目
npm run build

# 3. 本地测试
npm run dev

# 4. 部署到生产环境
npm run deploy
```

## 📋 部署前准备

### 1. Cloudflare 账户
- 注册 [Cloudflare](https://dash.cloudflare.com/sign-up) 账户（免费）
- 获取你的 Account ID（Dashboard 右侧栏）

### 2. 创建 KV 命名空间

```bash
# 创建生产环境 KV
npm run kv:create
# 输出示例：
# ✅ Created namespace with id "abcdef1234567890"

# 创建预览环境 KV
npm run kv:preview
# 输出示例：
# ✅ Created namespace with id "preview_abcdef1234567890"
```

### 3. 更新配置文件

编辑 `wrangler.toml`：

```toml
# 替换为你的账户 ID
account_id = "your_account_id_here"

# 替换为上面创建的 KV ID
[[kv_namespaces]]
binding = "KV_STORE"
id = "abcdef1234567890"  # 生产环境 ID
preview_id = "preview_abcdef1234567890"  # 预览环境 ID
```

## 🖥️ 本地开发

```bash
# 启动开发服务器（带热重载）
npm run dev

# 访问 http://localhost:8787
# 修改代码会自动重新构建
```

## 🚀 部署

### 部署到 Cloudflare Workers

```bash
# 完整部署流程（推荐）
npm run deploy:full

# 或者分步执行
npm run build
npm run deploy
```

部署成功后，你会看到：

```
✨ Deployed to:
   https://journal-assistant.your-username.workers.dev
```

### GitHub Actions 自动部署

1. 在 GitHub 仓库设置中添加 Secrets：
   - `CLOUDFLARE_API_TOKEN`：在 Cloudflare Dashboard 创建 API Token
   - `CLOUDFLARE_ACCOUNT_ID`：你的账户 ID

2. 推送到 main 分支时自动部署：

```bash
git add .
git commit -m "Deploy to Cloudflare"
git push origin main
```

## 🔧 配置自定义域名

### 方法一：Cloudflare Dashboard

1. 进入 Workers & Pages
2. 选择你的 Worker
3. 点击 "Settings" > "Triggers" > "Add Custom Domain"
4. 输入域名（如 `journal.yourdomain.com`）

### 方法二：wrangler.toml

```toml
[env.production]
name = "journal-assistant-prod"
routes = [
  { pattern = "journal.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

然后重新部署：`npm run deploy`

## 📊 监控和日志

### 实时日志

```bash
# 查看实时日志
npm run tail

# 查看特定方法的日志
npx wrangler tail --format=pretty
```

### Cloudflare Dashboard

访问 [Cloudflare Dashboard](https://dash.cloudflare.com) 查看：
- 请求数和流量统计
- 错误率和响应时间
- 地理分布

## 💾 数据管理

### KV 数据操作

```bash
# 查看所有键
npm run kv:list

# 获取特定键的值
npm run kv:get publications

# 手动设置数据（通过 Cloudflare Dashboard）
```

### 数据备份

建议定期备份 KV 数据：

```bash
# 导出数据（需要自定义脚本）
npx wrangler kv:key list --namespace-id=YOUR_KV_ID > backup.json
```

## 🔐 账户信息

### 默认账户

**管理员：**
- 账号：`admin`
- 密码：`123456`

**员工账户：**
- `linmo` / `123456` （林默 - 责任编辑）
- `zhouxiao` / `123456` （周晓 - 文字编辑）
- `chenxu` / `123456` （陈叙 - 设计编辑）
- `xuyan` / `123456` （许言 - 审校编辑）
- `tangtang` / `123456` （唐棠 - 文字编辑）

⚠️ **生产环境请务必修改密码！**

## 📁 项目结构

```
journal-assistant/
├── src/
│   └── index.js              # Cloudflare Worker 主文件
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions 配置
├── backend/                  # Go 后端骨架（暂未使用）
├── index.html                # 前端页面
├── app.js                    # 前端逻辑
├── styles.css                # 样式文件
├── storage-adapter.js        # API 适配层（可选）
├── wrangler.toml             # Cloudflare 配置
├── package.json              # 项目配置
├── build.js                  # 构建脚本
├── deploy.js                 # 部署脚本
├── schema.sql                # 数据库结构（D1 可选）
├── .gitignore                # Git 忽略配置
├── README.md                 # 本文档
└── README_CLOUDFLARE.md      # 详细部署指南
```

## 🎨 技术栈

- **前端：** 原生 HTML/CSS/JavaScript
- **后端：** Cloudflare Workers（JavaScript）
- **存储：** Cloudflare KV（键值存储）
- **部署：** Wrangler CLI / GitHub Actions
- **CDN：** Cloudflare 全球网络

## 📈 性能指标

- ⚡ 全球平均响应时间 < 50ms
- 🌍 200+ 个数据中心
- 📊 99.99% 可用性
- 💰 免费套餐支持 100,000 请求/天

## 💰 成本估算

### 免费计划（推荐起步）
- ✅ 每天 100,000 次请求
- ✅ KV: 100,000 次读取/天，1,000 次写入/天
- ✅ 无需信用卡

### 付费计划（$5/月）
- 🚀 10,000,000 次请求/月
- 🚀 无限 KV 操作
- 🚀 更长 CPU 时间

对于中小型团队，免费计划已经足够。

## 🔄 升级路径

### 阶段一：当前（已完成）
- ✅ 静态文件服务
- ✅ API 路由
- ✅ KV 数据存储
- ✅ 用户认证

### 阶段二：增强功能
- [ ] JWT 认证
- [ ] 数据导出/导入
- [ ] 邮件通知
- [ ] 文件上传（R2）

### 阶段三：高级功能
- [ ] D1 关系型数据库
- [ ] 实时协作（Durable Objects）
- [ ] WebSocket 支持
- [ ] 全文搜索

## 🐛 故障排查

### 部署失败

```bash
# 检查登录状态
npm run whoami

# 本地测试
npm run dev

# 查看详细错误
npx wrangler deploy --verbose
```

### KV 无法读取

1. 检查 `wrangler.toml` 中的 KV ID 是否正确
2. 确保 binding 名称为 `KV_STORE`
3. 检查 KV 命名空间是否存在

### 静态文件 404

```bash
# 重新构建
npm run build

# 检查 src/index.js 文件
```

## 📚 相关资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 文档](https://developers.cloudflare.com/workers/wrangler/)
- [KV 存储文档](https://developers.cloudflare.com/kv/)
- [D1 数据库文档](https://developers.cloudflare.com/d1/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🆘 获取帮助

- 查看 [README_CLOUDFLARE.md](./README_CLOUDFLARE.md) 详细部署指南
- 访问 [Cloudflare Community](https://community.cloudflare.com/)
- 提交 GitHub Issue

---

**准备好了吗？运行 `npm run deploy:full` 开始部署！** 🚀
