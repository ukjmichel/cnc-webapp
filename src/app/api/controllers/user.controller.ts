// src/app/api/controllers/user.controller.ts

/**
 * =============================================================================
 * UserController – User Management Controller
 * =============================================================================
 * Responsibilities
 *  - Get current user information
 *  - Update user profile
 *  - Manage user account
 *
 * NOTE: This is a MOCK implementation for development
 * TODO: Implement proper JWT authentication
 * TODO: Get user from JWT token
 * TODO: Integrate with database
 * =============================================================================
 */

import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/index.ts';

interface User {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  verified: boolean;
  role: 'administrateur' | 'employé' | 'utilisateur';
  createdAt: string;
  updatedAt: string;
}

export class UserController {
  /**
   * Get current user (from JWT token)
   * GET /api/users/me
   */
  static async getCurrentUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: Extract user from JWT token in cookie/header
      // For now, return a mock admin user

      // MOCK: Return default admin user
      const mockUser: User = {
        userId: '1',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        verified: true,
        role: 'administrateur',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      res.status(200).json({
        message: 'User retrieved successfully',
        data: {
          user: mockUser,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
