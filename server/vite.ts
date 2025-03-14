import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`)
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  try {
    // In production, the client files are in a different location
    const clientDistPath = process.env.NODE_ENV === 'production' 
      ? path.resolve(__dirname, "../client/dist") 
      : path.resolve(__dirname, "../client/dist");
    
    log(`Serving static files from: ${clientDistPath}`);
    
    // Check if directory exists
    if (!fs.existsSync(clientDistPath)) {
      log(`WARNING: Client dist directory not found at ${clientDistPath}`);
      // Create the directory if it doesn't exist
      fs.mkdirSync(clientDistPath, { recursive: true });
    }
    
    app.use(express.static(clientDistPath));
    
    app.get("*", (req, res) => {
      try {
        const htmlPath = path.resolve(clientDistPath, "index.html");
        log(`Trying to serve HTML from: ${htmlPath}`);
        
        if (!fs.existsSync(htmlPath)) {
          log(`WARNING: index.html not found at ${htmlPath}`);
          return res.status(404).send(`
            <!DOCTYPE html>
            <html>
              <head><title>App Error</title></head>
              <body>
                <h1>Application Error</h1>
                <p>Client files not found. The build process may have failed.</p>
              </body>
            </html>
          `);
        }
        
        let html = fs.readFileSync(htmlPath, 'utf-8');

        // Inject environment variables for client in production
        const clientEnv = {
          SUPABASE_URL: process.env.SUPABASE_URL,
          SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
          YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY
        };

        // Insert env variables before closing head tag
        html = html.replace('</head>', `<script>window.ENV = ${JSON.stringify(clientEnv)};</script></head>`);

        res.send(html);
      } catch (error) {
        console.error('Error serving static file:', error);
        res.status(500).send('Error loading application');
      }
    });
  } catch (error) {
    console.error('Error setting up static file serving:', error);
  }
}