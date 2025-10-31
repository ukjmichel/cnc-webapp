// src/middlewares/requireAuth.ts

/**
 * =============================================================================
 * requireAuth Middleware
 * =============================================================================
 * Middleware to check if user is authenticated
 * =============================================================================
 */

import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/index.ts';

/**
 * Middleware to require authentication
 * For now, this is a pass-through for development
 * TODO: Implement proper JWT token validation
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // TODO: Implement actual authentication check
  // For now, allow all requests to pass through for testing

  // Example implementation (commented out):
  // const token = req.headers.authorization?.split(' ')[1];
  // if (!token) {
  //   return next(new UnauthorizedError('Authentication required'));
  // }
  // Verify token and attach user to request

  next();
};
