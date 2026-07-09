#!/usr/bin/env node
import { writeFileSync, mkdirSync, cpSync } from 'fs';

// 1. Tạo function directory
const funcDir = '.vercel/output/functions/index.func';
mkdirSync(funcDir, { recursive: true });

// 2. Copy server bundle vào function
cpSync('dist/index.mjs', `${funcDir}/index.mjs`);

// 3. Config cho function (bắt buộc)
writeFileSync(`${funcDir}/.vc-config.json`, JSON.stringify({
  runtime: 'nodejs20.x',
  handler: 'index.mjs',
  launcherType: 'Nodejs',
  shouldAddHelpers: true
}, null, 2));

// 4. Copy static assets (frontend) vào output/static
mkdirSync('.vercel/output/static', { recursive: true });
cpSync('dist/public', '.vercel/output/static', { recursive: true });

// 5. Config tổng: route tất cả request không match static -> function
writeFileSync('.vercel/output/config.json', JSON.stringify({
  version: 3,
  routes: [
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/index' }
  ]
}, null, 2));

console.log('✓ Build Output API structure created');
