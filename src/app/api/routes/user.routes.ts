// src/app/api/routes/user.routes.ts

/**
 * =============================================================================
 * User Routes
 * =============================================================================
 * Endpoints for user management
 * Mount at /api/users
 * =============================================================================
 */

import { Router } from 'express';
import { UserController } from '../controllers/user.controller.ts';

const router = Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current authenticated user
 * @access  Private (TODO: Add requireAuth middleware)
 * @returns { message: string, data: { user: User } }
 */
router.get('/me', UserController.getCurrentUser);

export default router;
