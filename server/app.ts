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
import barcodeRoutes from '../src/routes/barcode.routes.ts';
import { CustomError } from '../src/errors/index.ts';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:8100', 'http://localhost:4200'],
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
