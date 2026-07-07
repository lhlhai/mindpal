#!/usr/bin/env node

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

// Ensure dist directory exists
mkdirSync('dist', { recursive: true });

// Create index.js wrapper for Vercel
const indexJs = `#!/usr/bin/env node
import('./index.mjs').catch(err => {
  console.error('Failed to load server:', err);
  process.exit(1);
});
`;

writeFileSync('dist/index.js', indexJs);
console.log('✓ Created dist/index.js');
