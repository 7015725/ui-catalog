#!/usr/bin/env node
// 零依赖开发服务器：静态文件 + 实时刷新（Live Reload）
//   - 改 .css  → 不刷新页面，直接热替换样式
//   - 改其它文件（.js / .html …）→ 自动刷新页面，并保留滚动位置
// 用法：node dev-server.mjs [--port 5173] [--open]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const argPort = args.includes('--port') ? Number(args[args.indexOf('--port') + 1]) : 0;
let port = argPort || Number(process.env.PORT) || 5173;
const shouldOpen = args.includes('--open');
const IGNORE = /(^|[\\/])(node_modules|\.git|dist|build)([\\/]|$)|\.(swp|tmp|temp)$|~$/;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};

// 注入到每个 HTML 页面的客户端脚本
const CLIENT = `<script>(() => {
  const KEY = '__lr_scroll:' + location.pathname;
  try { const y = sessionStorage.getItem(KEY); if (y !== null) { sessionStorage.removeItem(KEY);
    const restore = () => scrollTo(0, +y); addEventListener('load', () => setTimeout(restore, 50)); } } catch {}
  const reload = () => { try { sessionStorage.setItem(KEY, String(scrollY)); } catch {} location.reload(); };
  let wasDown = false;
  const es = new EventSource('/__livereload');
  es.addEventListener('open', () => { if (wasDown) reload(); });
  es.addEventListener('error', () => { wasDown = true; });
  es.addEventListener('reload', reload);
  es.addEventListener('css', () => {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(l => {
      const u = new URL(l.href); u.searchParams.set('_lr', Date.now()); l.href = u.href;
    });
    console.log('%c[live] 样式已热更新', 'color:#16a34a');
  });
})();</script>`;

const clients = new Set();
function broadcast(event, data = '') {
  for (const res of clients) res.write(`event: ${event}\ndata: ${data}\n\n`);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/__livereload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('retry: 500\n\n');
    clients.add(res);
    const ping = setInterval(() => res.write(': ping\n\n'), 20000);
    req.on('close', () => { clearInterval(ping); clients.delete(res); });
    return;
  }

  let rel = decodeURIComponent(url.pathname);
  let file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return; }
  try { if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html'); } catch {}

  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 Not Found: ' + rel); return; }
    const ext = path.extname(file).toLowerCase();
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' };
    if (ext === '.html') {
      let html = buf.toString('utf8');
      html = html.includes('</body>') ? html.replace(/<\/body>(?![\s\S]*<\/body>)/, CLIENT + '</body>') : html + CLIENT;
      res.writeHead(200, headers).end(html);
    } else {
      res.writeHead(200, headers).end(buf);
    }
  });
});

// 监听文件变化（防抖 80ms）
let timer = null; const changed = new Set();
function onChange(name) {
  if (!name || IGNORE.test(name)) return;
  changed.add(name);
  clearTimeout(timer);
  timer = setTimeout(() => {
    const list = [...changed]; changed.clear();
    const cssOnly = list.every(f => f.toLowerCase().endsWith('.css'));
    const t = new Date().toLocaleTimeString();
    console.log(`[${t}] 变更: ${list.join(', ')} → ${cssOnly ? '热更新样式' : '刷新页面'}`);
    broadcast(cssOnly ? 'css' : 'reload');
  }, 80);
}
try {
  fs.watch(ROOT, { recursive: true }, (_e, name) => onChange(name && String(name)));
} catch {
  // 老版本 Node 在 Linux 上不支持 recursive：逐个目录监听
  const walk = dir => {
    fs.watch(dir, (_e, name) => onChange(name && path.relative(ROOT, path.join(dir, String(name)))));
    for (const d of fs.readdirSync(dir, { withFileTypes: true }))
      if (d.isDirectory() && !IGNORE.test(d.name)) walk(path.join(dir, d.name));
  };
  walk(ROOT);
}

server.on('error', e => {
  if (e.code === 'EADDRINUSE' && !argPort) { console.log(`端口 ${port} 被占用，改用 ${port + 1}`); server.listen(++port, '127.0.0.1'); }
  else { console.error(e.message); process.exit(1); }
});
server.listen(port, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${port}`;
  console.log(`\n  UI 组件库开发服务器已启动（实时刷新已开启）\n  ➜ 画廊:   ${url}/\n  ➜ 测试页: ${url}/test.html\n  按 Ctrl+C 停止\n`);
  if (shouldOpen) {
    const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
    exec(cmd);
  }
});
