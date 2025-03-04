
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@db/schema";

// Check for DATABASE_URL based on environment
const isDev = process.env.NODE_ENV !== 'production';

let db: any;

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
  
  // Provide a fake DB for testing UI in both dev and prod if DATABASE_URL is missing
  console.warn("🧪 Running with mock database - limited functionality");
  // Export a dummy DB object that won't crash but will log operations
  const mockDb = new Proxy({}, {
    get: function(target, prop) {
      return (...args: any[]) => {
        console.log(`[MOCK DB] Called ${String(prop)} with args:`, args);
        return Promise.resolve([]);
      }
    }
  });
  db = mockDb;
} else {
  try {
    console.log("🔌 Connecting to database...");
    db = drizzle({
      connection: process.env.DATABASE_URL,
      schema,
      ws: ws,
    });
    console.log("✅ Database connection established");
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
}

export { db };
