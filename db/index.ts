import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@db/schema";

// Check for DATABASE_URL based on environment
const isDev = process.env.NODE_ENV !== 'production';

if (!process.env.DATABASE_URL) {
  console.error("⚠️ DATABASE_URL environment variable is missing.");
  console.error("📋 Instructions to fix:");
  
  if (isDev) {
    console.error("   - For local development: Add DATABASE_URL in client/.env file");
    console.error("   - Example format: postgresql://username:password@hostname:port/database");
  } else {
    console.error("   - For deployment: Add DATABASE_URL secret in deployment configuration");
    console.error("   - Go to the Deployments tab → Secrets → Add DATABASE_URL");
  }
  
  // In development, we can provide a fake DB for testing UI
  if (isDev) {
    console.warn("🧪 Running in development mode with mock database");
    // Export a dummy DB object that won't crash but will log operations
    const mockDb = new Proxy({}, {
      get: function(target, prop) {
        return (...args: any[]) => {
          console.log(`[MOCK DB] Called ${String(prop)} with args:`, args);
          return Promise.resolve([]);
        };
      }
    });
    module.exports = { db: mockDb };
    // Don't exit in development, allowing UI testing without DB
  } else {
    // Exit in production since we need a real DB
    process.exit(1);
  }
} else {
  try {
    console.log("🔌 Connecting to database...");
    const db = drizzle({
      connection: process.env.DATABASE_URL,
      schema,
      ws: ws,
    });
    console.log("✅ Database connection established");
    module.exports = { db };
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
}
