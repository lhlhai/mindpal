import { parse } from 'cookie';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { registerOAuthRoutes } from '../server/_core/oauth.js';
import { registerStorageProxy } from '../server/_core/storageProxy.js';
import { appRouter } from '../server/routers.js';
import { createContext } from '../server/_core/context.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static files are served from dist/public in production
const staticPath = path.resolve(__dirname, '..', 'public');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Create Express app for each request (serverless pattern)
  const app = express();

  // Parse cookies manually since Vercel doesn't have cookie-parser middleware by default
  app.use((req, res, next) => {
    if (req.headers.cookie) {
      req.cookies = parse(req.headers.cookie);
    } else {
      req.cookies = {};
    }
    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Register storage proxy and OAuth routes
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // tRPC router
  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Serve static files from Vite build
  if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath));
  }

  // SPA fallback - serve index.html for all other routes
  const indexPath = path.join(staticPath, 'index.html');
  app.use('*', (_req, res) => {
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  // Convert incoming Vercel request to Express-compatible format
  // Vercel already provides req/res that are Express-compatible
  return new Promise<void>((resolve) => {
    // Handle the request through Express
    app(req as any, res as any, () => {
      resolve();
    });
  });
}
