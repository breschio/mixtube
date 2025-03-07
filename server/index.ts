import express, { type Request, Response, NextFunction } from "express";
import session from 'express-session';
import cors from 'cors';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { authRoutes } from "./auth";

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

// Configure CORS for both API and YouTube iframe communication
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://www.youtube.com',
      'https://youtube.com',
      process.env.VITE_APP_URL || 'http://localhost:5000'
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(null, true); // Just allow all origins in development
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' as const : 'lax' as const
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

    // Start server with fallback port handling
    const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
    const FALLBACK_PORT = 3333;

    // Try the primary port first
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server is running on http://0.0.0.0:${PORT}`);
      log('Server initialization complete');
    }).on('error', (e: any) => {
      if (e.code === 'EADDRINUSE') {
        // If primary port is in use, try the fallback port
        log(`Port ${PORT} is in use, trying alternative port ${FALLBACK_PORT}`);
        server.listen(FALLBACK_PORT, "0.0.0.0", () => {
          log(`Server is running on http://0.0.0.0:${FALLBACK_PORT}`);
          log('Server initialization complete with fallback port');
        });
      } else {
        throw e;
      }
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          console.error(`Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();