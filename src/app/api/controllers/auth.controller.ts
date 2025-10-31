// src/app/api/controllers/auth.controller.ts

/**
 * =============================================================================
 * AuthController – Authentication Controller
 * =============================================================================
 * Responsibilities
 *  - Handle user login, registration, logout
 *  - Manage authentication sessions/tokens
 *  - Return user data on successful authentication
 *
 * NOTE: This is a MOCK implementation for development
 * TODO: Integrate with actual database and implement proper authentication
 * TODO: Implement JWT token generation and validation
 * TODO: Implement password hashing with bcrypt
 * TODO: Add email verification
 * =============================================================================
 */

import type { Request, Response, NextFunction } from 'express';
import { BadRequestError, UnauthorizedError } from '../errors/index.ts';

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

// MOCK: In-memory user storage (replace with database)
const mockUsers: Map<string, User & { password: string }> = new Map();

// MOCK: Create a default admin user
mockUsers.set('admin@example.com', {
  userId: '1',
  username: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@example.com',
  password: 'admin123', // TODO: Hash passwords!
  verified: true,
  role: 'administrateur',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// MOCK: Create a default employee user
mockUsers.set('employee@example.com', {
  userId: '2',
  username: 'employee',
  firstName: 'Employee',
  lastName: 'User',
  email: 'employee@example.com',
  password: 'employee123', // TODO: Hash passwords!
  verified: true,
  role: 'employé',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export class AuthController {
  /**
   * Login user
   * POST /api/auth/login
   * Body: { identifier: string (email or username), password: string }
   */
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        return next(new BadRequestError('Email/username and password are required'));
      }

      // MOCK: Find user by email or username
      let foundUser: (User & { password: string }) | undefined;
      for (const user of mockUsers.values()) {
        if (user.email === identifier || user.username === identifier) {
          foundUser = user;
          break;
        }
      }

      if (!foundUser) {
        return next(new UnauthorizedError('Invalid credentials'));
      }

      // MOCK: Check password (TODO: use bcrypt.compare)
      if (foundUser.password !== password) {
        return next(new UnauthorizedError('Invalid credentials'));
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = foundUser;

      // TODO: Generate JWT token and set as httpOnly cookie
      // For now, just return the user data

      res.status(200).json({
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register new user
   * POST /api/auth/register
   * Body: { email, username, password, firstName, lastName }
   */
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, username, password, firstName, lastName } = req.body;

      if (!email || !username || !password || !firstName || !lastName) {
        return next(
          new BadRequestError('All fields are required: email, username, password, firstName, lastName')
        );
      }

      // MOCK: Check if user already exists
      if (mockUsers.has(email)) {
        return next(new BadRequestError('User with this email already exists'));
      }

      // Check if username is taken
      for (const user of mockUsers.values()) {
        if (user.username === username) {
          return next(new BadRequestError('Username already taken'));
        }
      }

      // MOCK: Create new user (TODO: hash password, save to database)
      const newUser: User & { password: string } = {
        userId: String(mockUsers.size + 1),
        email,
        username,
        password, // TODO: Hash with bcrypt!
        firstName,
        lastName,
        verified: false, // TODO: Implement email verification
        role: 'utilisateur',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUsers.set(email, newUser);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        message: 'Registration successful',
        data: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: Clear JWT token cookie
      // res.clearCookie('token');

      res.status(200).json({
        message: 'Logout successful',
        data: { success: true },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh authentication token
   * POST /api/auth/refresh
   */
  static async refresh(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // TODO: Verify refresh token and generate new access token
      // For now, just return success

      res.status(200).json({
        message: 'Token refreshed',
        data: { success: true },
      });
    } catch (error) {
      next(error);
    }
  }
}
