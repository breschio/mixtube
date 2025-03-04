import { defineConfig } from "drizzle-kit";

// Check for DATABASE_URL and provide a meaningful error message
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is missing for Drizzle configuration.");
  console.error("Please add a DATABASE_URL secret in your deployment settings.");
  process.exit(1);
}

export default defineConfig({
  out: "./migrations",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
