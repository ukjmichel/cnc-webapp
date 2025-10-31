// src/middlewares/requireRole.ts

/**
 * =============================================================================
 * requireRole Middleware
 * =============================================================================
 * Middleware to check if user has required role
 * =============================================================================
 */

import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/index.ts';

/**
 * Middleware to require employee or admin role
 * For now, this is a pass-through for development
 * TODO: Implement proper role checking
 */
export const requireEmployeeOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // TODO: Implement actual role checking
  // For now, allow all requests to pass through for testing

  // Example implementation (commented out):
  // const user = (req as any).user;
  // if (!user || !['employee', 'admin'].includes(user.role)) {
  //   return next(new ForbiddenError('Employee or admin access required'));
  // }

  next();
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // TODO: Implement actual admin role checking
  next();
};
