// server/index.ts

/**
 * =============================================================================
 * Server Entry Point
 * =============================================================================
 * Starts the Express server
 * =============================================================================
 */

import dotenv from 'dotenv';
import app from './app.ts';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('==============================================');
  console.log(`  CNC WebApp Backend API`);
  console.log('==============================================');
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Server:      http://localhost:${PORT}`);
  console.log(`  Health:      http://localhost:${PORT}/health`);
  console.log(`  Barcode API: http://localhost:${PORT}/api/barcode`);
  console.log('==============================================');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
