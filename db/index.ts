import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@db/schema";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is missing.");
  console.error("Please add a DATABASE_URL secret in your deployment configuration.");
  process.exit(1);
}

export const db = drizzle({
  connection: process.env.DATABASE_URL,
  schema,
  ws: ws,
});
