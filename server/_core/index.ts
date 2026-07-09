import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
registerStorageProxy(app);
registerOAuthRoutes(app);

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

if (process.env.NODE_ENV === "development") {
  const server = createServer(app);
  setupVite(app, server).then(() => {
    server.listen(3000, () => console.log("Dev server running on :3000"));
  });
} else if (!process.env.VERCEL) {
  // Only run standalone server in non-Vercel production environments
  serveStatic(app);
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Production server running on :${port}`));
}

// Export for Vercel serverless function
export default app;
