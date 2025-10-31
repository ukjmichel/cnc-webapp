// src/app/api/routes/auth.routes.ts

/**
 * =============================================================================
 * Auth Routes
 * =============================================================================
 * Endpoints for user authentication
 * Mount at /api/auth
 * =============================================================================
 */

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.ts';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { identifier: string, password: string }
 * @returns { message: string, data: { user: User } }
 */
router.post('/login', AuthController.login);

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 * @body    { email, username, password, firstName, lastName }
 * @returns { message: string, data: User }
 */
router.post('/register', AuthController.register);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private (TODO: Add requireAuth middleware)
 * @returns { message: string, data: { success: boolean } }
 */
router.post('/logout', AuthController.logout);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh authentication token
 * @access  Public (uses refresh token)
 * @returns { message: string, data: { success: boolean } }
 */
router.post('/refresh', AuthController.refresh);

export default router;
