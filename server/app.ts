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
import userRoutes from '../src/routes/user.routes.ts';
import { CustomError } from '../src/errors/index.ts';

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8100',
    'https://localhost:8100',  // For SSL camera development
    'http://127.0.0.1:8100',
    'https://127.0.0.1:8100',  // For SSL camera development
    'http://localhost:4200',
    'https://localhost:4200',  // For SSL camera development
    'http://127.0.0.1:4200',
    'https://127.0.0.1:4200',  // For SSL camera development
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`\n${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`  Origin: ${req.headers.origin || 'none'}`);
  console.log(`  Credentials: ${req.headers.cookie ? 'present' : 'none'}`);
  console.log(`  Authorization: ${req.headers.authorization ? 'present' : 'none'}`);
  console.log(`  User-Agent: ${req.headers['user-agent']?.substring(0, 50) || 'none'}`);

  // Log response status after it's sent
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`  --> Response Status: ${res.statusCode}`);
    if (res.statusCode >= 400) {
      console.log(`  --> Response Body: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
    }
    return originalSend.call(this, data);
  };

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
app.use('/api/users', userRoutes);

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
