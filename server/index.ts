import express, { type Request, Response, NextFunction } from "express";
import session from 'express-session';
import cors from 'cors';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { authRoutes } from "./auth";

const app = express();

// Basic health check endpoint
app.get('/ping', (_req, res) => {
  res.status(200).send('OK');
});

// Configure middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  }
};

app.use(session(sessionConfig));

// Auth routes
app.get('/auth/login', authRoutes.login);
app.get('/auth/callback', authRoutes.callback);
app.get('/auth/logout', authRoutes.logout);

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api") || path === '/ping') {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    log('Starting server initialization...');
    const server = registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    // Setup Vite or serve static files based on environment
    if (app.get("env") === "development") {
      log('Setting up Vite middleware for development...');
      await setupVite(app, server);
      log('Vite middleware setup complete');
    } else {
      log('Setting up static file serving for production...');
      serveStatic(app);
    }

    // Start server
    const PORT = parseInt(process.env.PORT || '5000');
    const MAX_RETRIES = 3;
    let currentPort = PORT;
    let retries = 0;

    const startServer = () => {
      server.listen(currentPort, "0.0.0.0", () => {
        log(`Server is running on http://0.0.0.0:${currentPort}`);
        log('Server initialization complete');
      });
    };

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          console.error(`Port ${currentPort} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          if (retries < MAX_RETRIES) {
            retries++;
            currentPort++;
            console.log(`Port ${currentPort - 1} is in use, trying port ${currentPort}`);
            startServer();
          } else {
            console.error(`Could not find an available port after ${MAX_RETRIES} attempts`);
            process.exit(1);
          }
          break;
        default:
          throw error;
      }
    });

    startServer();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();