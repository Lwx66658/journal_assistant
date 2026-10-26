#!/usr/bin/env node

/**
 * 快速部署脚本
 * 自动执行构建和部署流程
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始部署刊行应用到 Cloudflare Workers...\n');

// 1. 检查必要文件
console.log('📋 检查项目文件...');
const requiredFiles = ['index.html', 'app.js', 'styles.css', 'wrangler.toml'];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(__dirname, file))) {
    console.error(`❌ 缺少必要文件: ${file}`);
    process.exit(1);
  }
}
console.log('✅ 文件检查完成\n');

// 2. 安装依赖
console.log('📦 安装依赖...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ 依赖安装完成\n');
} catch (error) {
  console.error('❌ 依赖安装失败');
  process.exit(1);
}

// 3. 构建项目
console.log('🔨 构建项目...');
try {
  execSync('node build.js', { stdio: 'inherit' });
  console.log('✅ 项目构建完成\n');
} catch (error) {
  console.error('❌ 构建失败');
  process.exit(1);
}

// 4. 检查 wrangler.toml 配置
console.log('⚙️  检查配置...');
const wranglerConfig = fs.readFileSync(path.join(__dirname, 'wrangler.toml'), 'utf-8');
if (wranglerConfig.includes('your_account_id_here')) {
  console.warn('⚠️  警告: 请在 wrangler.toml 中配置你的 account_id');
}
if (wranglerConfig.includes('your_kv_namespace_id_here')) {
  console.warn('⚠️  警告: 请先创建 KV namespace 并更新 wrangler.toml');
  console.log('\n运行以下命令创建 KV:');
  console.log('  npm run kv:create');
  console.log('  npm run kv:preview\n');
}

// 5. 部署
console.log('🌐 部署到 Cloudflare...');
try {
  execSync('npx wrangler deploy', { stdio: 'inherit' });
  console.log('\n✅ 部署成功！');
  console.log('\n📝 下一步:');
  console.log('  1. 访问你的 Worker URL');
  console.log('  2. 在 Cloudflare Dashboard 绑定自定义域名');
  console.log('  3. 查看日志: npm run tail\n');
} catch (error) {
  console.error('❌ 部署失败');
  console.log('\n💡 排查建议:');
  console.log('  1. 检查是否已登录: npx wrangler whoami');
  console.log('  2. 本地测试: npm run dev');
  console.log('  3. 查看完整文档: README_CLOUDFLARE.md\n');
  process.exit(1);
}
