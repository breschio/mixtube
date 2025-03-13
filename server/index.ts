import './config';  // Import this first to load environment variables
import express, { type Request, Response, NextFunction } from "express";
import session from 'express-session';
import cors from 'cors';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { authRoutes } from "./auth";
import { config } from './config';

const app = express();

// Basic health check endpoints
app.get('/ping', (_req, res) => {
  res.status(200).send('OK');
});

// Root health check for Autoscale deployments
app.get('/', (req, res, next) => {
  if (req.headers['accept']?.includes('text/html')) {
    // For browser requests, let the static file handler take over
    next();
  } else {
    // For health checks and other non-browser requests
    res.status(200).send('OK');
  }
});

// Configure CORS for development
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true, // Changed to true for development
  cookie: { 
    secure: false, // Set to false for development
    sameSite: 'lax' as const,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

app.use(session(sessionConfig));

// Service Worker headers
app.use((req, res, next) => {
  // Add Service-Worker-Navigation-Preload header
  res.setHeader('Service-Worker-Navigation-Preload', 'true');
  // Add Service-Worker-Allowed header
  res.setHeader('Service-Worker-Allowed', '/');
  next();
});

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

    const startServer = (port: number) => {
      return new Promise((resolve, reject) => {
        server.listen(port, "0.0.0.0")
          .once('listening', () => {
            log(`Server is running on http://localhost:${port}`);
            resolve(true);
          })
          .once('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
              log(`Port ${port} is in use`);
              resolve(false);
            } else {
              reject(err);
            }
          });
      });
    };

    // Try ports in sequence
    const ports = [5000, 3333, 3000, 8080];
    
    for (const port of ports) {
      const success = await startServer(port);
      if (success) {
        log('Server initialization complete');
        break;
      }
      if (port === ports[ports.length - 1]) {
        throw new Error('No available ports found');
      }
    }

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();