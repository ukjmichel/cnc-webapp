// server/app.ts

/**
 * =============================================================================
 * Express Application Setup
 * =============================================================================
 * Main Express application for CNC WebApp backend API
 * =============================================================================
 */

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from '../src/app/api/routes/auth.routes.ts';
import userRoutes from '../src/app/api/routes/user.routes.ts';
import barcodeRoutes from '../src/app/api/routes/barcode.routes.ts';
import { CustomError } from '../src/app/api/errors/index.ts';

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allow localhost and local network requests
    const allowedOrigins = [
      'http://localhost:8100',
      'http://localhost:4200',
      'capacitor://localhost',
      'ionic://localhost',
    ];

    // Allow any local network IP (192.168.x.x, 10.x.x.x, etc.)
    const localNetworkPattern = /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/;

    if (allowedOrigins.indexOf(origin) !== -1 || localNetworkPattern.test(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for development
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/barcode', barcodeRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
});

export default app;
