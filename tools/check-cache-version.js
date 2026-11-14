'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const meta = html.match(/<meta\s+name=["']app-version["']\s+content=["']([^"']+)["']/i);
if (!meta) throw new Error('В index.html отсутствует meta app-version');
const version = meta[1];
const refs = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)].map(m => m[1]);
const local = refs.filter(ref => !/^(?:[a-z]+:)?\/\//i.test(ref) && !ref.startsWith('data:'));
const mismatches = local.filter(ref => {
  const u = new URL(ref, 'https://example.invalid/');
  return u.pathname !== '/' && u.searchParams.get('v') !== version;
});
if (mismatches.length) throw new Error('Не совпадает версия ресурсов: ' + mismatches.join(', '));
if (!fs.existsSync(path.join(root, 'sw.js'))) throw new Error('Нет sw.js');
if (!fs.existsSync(path.join(root, 'js', 'update.js'))) throw new Error('Нет js/update.js');
if (!html.includes('js/update.js?v=' + version)) throw new Error('update.js не подключён с номером версии');
console.log('OK: версия приложения ' + version + ' совпадает у всех локальных CSS/JS; Service Worker и автообновление на месте.');
