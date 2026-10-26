/**
 * 构建脚本：将静态文件打包到 Worker
 */
const fs = require('fs');
const path = require('path');

// 读取静态文件
const indexHTML = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const appJS = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf-8');
const stylesCSS = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf-8');

// 生成包含静态文件的 Worker 代码
const workerTemplate = fs.readFileSync(path.join(__dirname, 'src/index.js'), 'utf-8');

// 替换 getStaticFile 函数
const staticFilesMap = `
const STATIC_FILE_CONTENT = {
  'index.html': ${JSON.stringify(indexHTML)},
  'app.js': ${JSON.stringify(appJS)},
  'styles.css': ${JSON.stringify(stylesCSS)}
};

async function getStaticFile(filename) {
  return STATIC_FILE_CONTENT[filename] || null;
}
`;

const staticFilePlaceholder = /async function getStaticFile\(filename\)[\s\S]*?return null;\s*}/;
if (!staticFilePlaceholder.test(workerTemplate)) {
  throw new Error('找不到静态资源注入位置，构建已停止');
}
// 使用函数作为 replacement，避免 String.replace 把前端代码中的 `$$` 等字符当作替换标记。
const finalWorkerCode = workerTemplate.replace(staticFilePlaceholder, () => staticFilesMap.trim());

// 将构建产物与源文件分开，避免重复构建时修改或污染入口模板。
const outputDirectory = path.join(__dirname, 'dist');
fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, 'worker.js'), finalWorkerCode, 'utf-8');

console.log('✅ 构建完成！静态文件已打包到 Worker');
console.log('📦 文件大小:');
console.log(`   - index.html: ${(indexHTML.length / 1024).toFixed(2)} KB`);
console.log(`   - app.js: ${(appJS.length / 1024).toFixed(2)} KB`);
console.log(`   - styles.css: ${(stylesCSS.length / 1024).toFixed(2)} KB`);
console.log(`   - 总计: ${((indexHTML.length + appJS.length + stylesCSS.length) / 1024).toFixed(2)} KB`);
