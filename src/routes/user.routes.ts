// src/routes/user.routes.ts

/**
 * =============================================================================
 * User Routes
 * =============================================================================
 * Endpoints for user-related operations
 * =============================================================================
 */

import { Router } from 'express';
import { UserController } from '../controllers/user.controller.ts';
import { requireAuth } from '../middlewares/requireAuth.ts';

const router = Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current authenticated user information
 * @access  Private (requires authentication)
 * @returns Current user data
 */
router.get('/me', requireAuth, UserController.getCurrentUser);

/**
 * @route   PATCH /api/users/me
 * @desc    Update current user profile
 * @access  Private (requires authentication)
 * @body    { firstName?, lastName?, email? }
 * @returns Updated user data
 */
router.patch('/me', requireAuth, UserController.updateCurrentUser);

export default router;
