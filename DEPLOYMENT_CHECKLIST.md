# Cloudflare Workers 部署清单

按照此清单逐步完成部署，确保不遗漏任何步骤。

## ☑️ 准备阶段

- [ ] 注册 Cloudflare 账户（https://dash.cloudflare.com/sign-up）
- [ ] 安装 Node.js（版本 >= 18）
- [ ] 克隆或下载项目代码
- [ ] 进入项目目录：`cd journal-assistant`

## ☑️ 配置阶段

### 1. 安装依赖
```bash
npm install
```
- [ ] 确认安装成功，无错误提示

### 2. 登录 Cloudflare
```bash
npm run login
```
或
```bash
npx wrangler login
```
- [ ] 浏览器打开授权页面
- [ ] 点击"允许"授权 Wrangler
- [ ] 看到"Successfully logged in"消息

### 3. 获取 Account ID
- [ ] 访问 https://dash.cloudflare.com
- [ ] 在右侧边栏找到"Account ID"
- [ ] 复制 Account ID

### 4. 创建 KV 命名空间

**生产环境：**
```bash
npm run kv:create
```
- [ ] 记录输出的 `id`（例如：abcdef1234567890）

**预览环境：**
```bash
npm run kv:preview
```
- [ ] 记录输出的 `id`（例如：preview_abcdef1234567890）

### 5. 更新配置文件

编辑 `wrangler.toml`：

```toml
# 第 1 处修改：替换账户 ID
account_id = "your_account_id_here"  # 改为你的 Account ID

# 第 2 处修改：替换 KV ID
[[kv_namespaces]]
binding = "KV_STORE"
id = "abcdef1234567890"              # 改为生产环境 KV ID
preview_id = "preview_abcdef1234567890"  # 改为预览环境 KV ID
```

- [ ] 替换 `account_id`
- [ ] 替换 KV `id`
- [ ] 替换 KV `preview_id`
- [ ] 保存文件

## ☑️ 构建阶段

### 6. 构建项目
```bash
npm run build
```
- [ ] 看到"✅ 构建完成！静态文件已打包到 Worker"
- [ ] 看到文件大小统计

## ☑️ 测试阶段

### 7. 本地测试
```bash
npm run dev
```
- [ ] 看到"⎔ Starting local server..."
- [ ] 看到本地 URL（例如：http://localhost:8787）
- [ ] 在浏览器打开该 URL
- [ ] 测试登录功能（admin/123456）
- [ ] 测试书刊管理功能
- [ ] 按 Ctrl+C 停止本地服务器

## ☑️ 部署阶段

### 8. 部署到 Cloudflare
```bash
npm run deploy
```
或使用完整部署脚本：
```bash
npm run deploy:full
```

- [ ] 看到"Published journal-assistant"
- [ ] 记录 Worker URL（例如：https://journal-assistant.your-username.workers.dev）

### 9. 验证部署
- [ ] 在浏览器打开 Worker URL
- [ ] 测试登录功能
- [ ] 测试创建书刊
- [ ] 测试员工端功能

## ☑️ 域名配置（可选）

### 10. 绑定自定义域名

**方法 A：通过 Dashboard**
- [ ] 访问 https://dash.cloudflare.com
- [ ] 进入 Workers & Pages
- [ ] 选择 `journal-assistant`
- [ ] 点击 Settings > Triggers
- [ ] 点击 Add Custom Domain
- [ ] 输入域名（如：journal.yourdomain.com）
- [ ] 等待 DNS 生效

**方法 B：通过配置文件**

编辑 `wrangler.toml`，添加：
```toml
[env.production]
routes = [
  { pattern = "journal.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```
- [ ] 更新配置
- [ ] 重新部署：`npm run deploy`

## ☑️ GitHub Actions（可选）

### 11. 配置自动部署

- [ ] 在 GitHub 创建仓库
- [ ] 推送代码到仓库
- [ ] 进入仓库 Settings > Secrets and variables > Actions
- [ ] 添加 Secret：`CLOUDFLARE_API_TOKEN`
  - 在 Cloudflare Dashboard 创建：Profile > API Tokens > Create Token
  - 使用模板："Edit Cloudflare Workers"
- [ ] 添加 Secret：`CLOUDFLARE_ACCOUNT_ID`（你的 Account ID）
- [ ] 推送代码触发部署：
  ```bash
  git add .
  git commit -m "Setup auto-deploy"
  git push origin main
  ```
- [ ] 在 GitHub 查看 Actions 标签，确认部署成功

## ☑️ 安全加固

### 12. 修改默认密码

⚠️ **重要：生产环境必须修改密码！**

编辑 `src/index.js`，找到 `handleAPI` 函数中的用户数据：

```javascript
const users = {
  admin: { password: '123456', ... },  // 改为强密码
  // ...
};
```

- [ ] 修改 admin 密码
- [ ] 修改员工密码
- [ ] 重新构建：`npm run build`
- [ ] 重新部署：`npm run deploy`

### 13. 启用 HTTPS（自动）
- [ ] 确认 Worker URL 使用 HTTPS
- [ ] 自定义域名自动获得 SSL 证书

## ☑️ 监控和维护

### 14. 设置监控
- [ ] 在 Cloudflare Dashboard 查看 Analytics
- [ ] 设置告警（可选）
- [ ] 定期查看日志：`npm run tail`

### 15. 数据备份
- [ ] 定期备份 KV 数据
- [ ] 导出书刊数据（通过界面）

## ☑️ 完成

### 16. 最终检查
- [ ] 所有功能正常工作
- [ ] 密码已修改
- [ ] 域名已配置（如需要）
- [ ] GitHub Actions 已设置（如需要）
- [ ] 已记录 Worker URL
- [ ] 已通知团队成员

## 📞 遇到问题？

### 常见问题

**问题：wrangler: command not found**
```bash
npm install -g wrangler
```

**问题：登录失败**
```bash
npx wrangler logout
npx wrangler login
```

**问题：KV 读写失败**
- 检查 `wrangler.toml` 中的 KV ID
- 确认 binding 名称为 `KV_STORE`

**问题：部署成功但访问 404**
- 运行 `npm run build` 重新构建
- 检查 `src/index.js` 文件

### 获取帮助
- 查看 [README_CLOUDFLARE.md](./README_CLOUDFLARE.md)
- 访问 [Cloudflare Community](https://community.cloudflare.com/)
- 提交 GitHub Issue

---

**完成清单后，你的应用就成功部署到 Cloudflare 了！** 🎉

记录你的部署信息：
- Worker URL: ________________________________
- 自定义域名: ________________________________
- 部署日期: ________________________________
