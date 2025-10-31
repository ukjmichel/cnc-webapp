// src/controllers/shopping-list.controller.ts

/**
 * =============================================================================
 * ShoppingListController — HTTP layer for shopping lists
 * =============================================================================
 * Response shape (normalized)
 *  - Single entity:        { data: { list } }
 *  - Collections:          { data: { lists }, meta: { total, page, pageSize, pages } }
 *  - Utility/success-only: { data: { success: true } }
 *
 * Endpoints
 *  - POST   /api/shopping-lists              → create
 *  - GET    /api/shopping-lists              → list (with filters, search, pagination)
 *  - GET    /api/shopping-lists/:id          → getById
 *  - GET    /api/shopping-lists/user/:userId → getByUserId
 *  - PATCH  /api/shopping-lists/:id          → update
 *  - DELETE /api/shopping-lists/:id          → delete
 *
 *  Item Management:
 *  - POST   /api/shopping-lists/:id/items                      → addItem
 *  - DELETE /api/shopping-lists/:listId/items/:itemId          → removeItem
 *  - PATCH  /api/shopping-lists/:listId/items/:itemId          → updateItem
 *  - PATCH  /api/shopping-lists/:listId/items/:itemId/status   → updateItemStatus
 *
 *  Status Management:
 *  - PATCH  /api/shopping-lists/:id/complete  → markAsCompleted
 *  - PATCH  /api/shopping-lists/:id/archive   → markAsArchived
 *  - PATCH  /api/shopping-lists/:id/activate  → markAsActive
 *
 *  Utilities:
 *  - GET    /api/shopping-lists/user/:userId/stats  → getStats
 *  - POST   /api/shopping-lists/:id/duplicate       → duplicate
 *
 * Notes
 *  - Business logic lives in ShoppingListService; this controller only wraps/normalizes responses.
 *  - Query builders are centralized in src/queries/shopping-list.queries.ts
 *  - Uses MongoDB ObjectId for list and item IDs
 * =============================================================================
 */

import type { Request, Response, NextFunction } from 'express';
import { ShoppingListService } from '../services/shopping-list.service.js';
import { buildShoppingListQuery } from '../queries/shopping-list.queries.js';
import type {
  CreateShoppingListDTO,
  UpdateShoppingListDTO,
  AddItemDTO,
  UpdateItemDTO,
} from '../types/shopping-list.js';

export class ShoppingListController {
  // ========= CREATE =========

  /**
   * Create a shopping list.
   *
   * @route POST /api/shopping-lists
   * @param {Request} req - Express request with body {@link CreateShoppingListDTO}.
   * @param {Response} res - Express response.
   * @param {NextFunction} next - Error handler.
   * @returns {Promise<void>} 201 Created with `{ data: { list } }`.
   *
   * @example
   * // Body
   * {
   *   "userId": "123e4567-e89b-12d3-a456-426614174000",
   *   "title": "Weekly Groceries",
   *   "comment": "For dinner party",
   *   "items": [
   *     {
   *       "productId": "PROD001",
   *       "productName": "Milk",
   *       "quantity": 2,
   *       "quantityUnit": "l",
   *       "status": "pending"
   *     }
   *   ]
   * }
   *
   * @errors
   * - 400 Validation error
   * - 500 Internal error
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body as CreateShoppingListDTO;
      const list = await ShoppingListService.create(payload);
      return res.status(201).json({ data: { list } });
    } catch (err) {
      return next(err);
    }
  }

  // ========= READS =========

  /**
   * Fetch a single shopping list by ID.
   *
   * @route GET /api/shopping-lists/:id
   * @param {Request} req - Express request (path param: `id`).
   * @param {Response} res - Express response.
   * @param {NextFunction} next - Error handler.
   * @returns {Promise<void>} 200 OK with `{ data: { list } }`.
   *
   * @errors
   * - 400 Invalid ID format
   * - 404 Not Found
   * - 500 Internal error
   */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await ShoppingListService.getById(req.params.id);
      return res.json({ data: { list } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Fetch all shopping lists for a specific user.
   *
   * @route GET /api/shopping-lists/user/:userId
   * @param {Request} req - Express request (path param: `userId`, query: `status`).
   * @param {Response} res - Express response.
   * @param {NextFunction} next - Error handler.
   * @returns {Promise<void>} 200 OK with `{ data: { lists } }`.
   *
   * @example
   * GET /api/shopping-lists/user/123e4567-e89b-12d3-a456-426614174000?status=active
   *
   * @errors
   * - 400 Invalid user ID
   * - 500 Internal error
   */
  static async getByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const status =
        typeof req.query.status === 'string' ? req.query.status : undefined;

      const lists = await ShoppingListService.getByUserId(userId, status);
      return res.json({ data: { lists } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Fetch active shopping lists for a specific user.
   *
   * @route GET /api/shopping-lists/user/:userId/active
   * @param {Request} req - Express request (path param: `userId`).
   * @param {Response} res - Express response.
   * @param {NextFunction} next - Error handler.
   * @returns {Promise<void>} 200 OK with `{ data: { lists } }`.
   *
   * @errors
   * - 400 Invalid user ID
   * - 500 Internal error
   */
  static async getActiveByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const lists = await ShoppingListService.getActiveByUserId(
        req.params.userId
      );
      return res.json({ data: { lists } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Paginated list with optional filtering and search.
   *
   * @route GET /api/shopping-lists
   * @param {Request} req - Express request (query: `userId`, `status`, `q`, `page`, `pageSize`, `orderBy`, `orderDir`).
   * @param {Response} res - Express response.
   * @param {NextFunction} next - Error handler.
   * @returns {Promise<void>} 200 OK with
   * `{ data: { lists }, meta: { total, page, pageSize, pages } }`.
   *
   * @example
   * GET /api/shopping-lists?userId=123&status=active&q=groceries&page=1&pageSize=20&orderBy=createdAt&orderDir=DESC
   *
   * @errors
   * - 400 Invalid query
   * - 500 Internal error
   */
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const query = buildShoppingListQuery(
        req.query as Record<string, unknown>
      );
      const result = await ShoppingListService.list(query);

      return res.json({
        data: { lists: result.lists },
        meta: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          pages: result.pages,
        },
      });
    } catch (err) {
      return next(err);
    }
  }

  // ========= MUTATIONS =========

  /**
   * Update shopping list metadata (title, comment, status).
   *
   * @route PATCH /api/shopping-lists/:id
   * @param {Request} req - Express request (path: `id`, body: {@link UpdateShoppingListDTO}).
   * @param {Response} res - Express response.
   * @param {NextFunction} next - Error handler.
   * @returns {Promise<void>} 200 OK with `{ data: { list } }`.
   *
   * @errors
   * - 400 Validation error
   * - 404 Not Found
   * - 500 Internal error
   */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await ShoppingListService.update(
        req.params.id,
        req.body as UpdateShoppingListDTO
      );
      return res.json({ data: { list } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Delete a shopping list.
   *
   * @route DELETE /api/shopping-lists/:id
   * @param {Request} req - Express request (path: `id`).
   * @param {Response} res - Express response.
   * @param {NextFunction} next - Error handler.
   * @returns {Promise<void>} 200 OK with `{ data: { success: true } }`.
   *
   * @errors
   * - 400 Invalid ID format
   * - 404 Not Found
   * - 500 Internal error
   */
  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ShoppingListService.delete(req.params.id);
      return res.json({ data: result });
    } catch (err) {
      return next(err);
    }
  }

  // ========= ITEM MANAGEMENT =========

  /**
   * Add an item to a shopping list.
   *
   * @route POST /api/shopping-lists/:id/items
   * @param {Request} req - Express request (path: `id`, body: {@link AddItemDTO}).
   * @param {Response} res - Express response.
   * @param {NextFunction} next - Error handler.
   * @returns {Promise<void>} 200 OK with `{ data: { list } }`.
   *
   * @example
   * // Body
   * {
   *   "productId": "PROD003",
   *   "productName": "Fresh Tomatoes",
   *   "quantity": 0.5,
   *   "quantityUnit": "kg",
   *   "comment": "Ripe ones",
   *   "status": "pending"
   * }
   *
   * @errors
   * - 400 Validation error
   * - 404 Not Found
   * - 500 Internal error
   */
  static async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await ShoppingListService.addItem(
        req.params.id,
        req.body as AddItemDTO
      );
      return res.json({ data: { list } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Remove an item from a shopping list.
   *
   * @route DELETE /api/shopping-lists/:listId/items/:itemId
   * @param {Request} req - Express request (path params: `listId`, `itemId`).
   * @param {Response} res - Express response.
   * @param {NextFunction} next - Error handler.
   * @returns {Promise<void>} 200 OK with `{ data: { list } }`.
   *
   * @errors
   * - 400 Invalid ID format
   * - 404 Not Found
   * - 500 Internal error
   */
  static async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await ShoppingListService.removeItem(
        req.params.listId,
        req.params.itemId
      );
      return res.json({ data: { list } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Update an item in a shopping list.
   *
   * @route PATCH /api/shopping-lists/:listId/items/:itemId
   * @param {Request} req - Express request (path params: `listId`, `itemId`, body: {@link UpdateItemDTO}).
   * @param {Response} res - Express response.
   * @param {NextFunction} next - Error handler.
   * @returns {Promise<void>} 200 OK with `{ data: { list } }`.
   *
   * @example
   * // Body
   * {
   *   "quantity": 1.5,
   *   "comment": "Make sure they're organic",
   *   "status": "in_cart"
   * }
   *
   * @errors
   * - 400 Validation error
   * - 404 Not Found
   * - 500 Internal error
   */
  static async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await ShoppingListService.updateItem(
        req.params.listId,
        req.params.itemId,
        req.body as UpdateItemDTO
      );
      return res.json({ data: { list } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Update the status of an item in a shopping list.
   *
   * @route PATCH /api/shopping-lists/:listId/items/:itemId/status
   * @param {Request} req - Express request (path params: `listId`, `itemId`, body: { status: 'pending' | 'in_cart' }).
   * @param {Response} res - Express response.
   * @param {NextFunction} next - Error handler.
   * @returns {Promise<void>} 200 OK with `{ data: { list } }`.
   *
   * @example
   * // Body
   * {
   *   "status": "in_cart"
   * }
   *
   * @errors
   * - 400 Validation error
   * - 404 Not Found
   * - 500 Internal error
   */
  static async updateItemStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { status } = req.body;

      if (!status || !['pending', 'in_cart'].includes(status)) {
        return res.status(400).json({
          message: 'Valid status is required (pending or in_cart)',
        });
      }

      const list = await ShoppingListService.updateItemStatus(
        req.params.listId,
        req.params.itemId,
        status
      );
      return res.json({ data: { list } });
    } catch (err) {
      return next(err);
    }
  }

  // ========= STATUS MANAGEMENT =========

  /**
   * Mark a shopping list as completed.
   *
   * @route PATCH /api/shopping-lists/:id/complete
   * @param {Request} req - Express request (path: `id`).
   * @param {Response} res - Express response.
   * @param {NextFunction} next - Error handler.
   * @returns {Promise<void>} 200 OK with `{ data: { list } }`.
   *
   * @errors
   * - 400 Invalid ID format
   * - 404 Not Found
   * - 500 Internal error
   */
  static async markAsCompleted(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const list = await ShoppingListService.markAsCompleted(req.params.id);
      return res.json({ data: { list } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Mark a shopping list as archived.
   *
   * @route PATCH /api/shopping-lists/:id/archive
   * @param {Request} req - Express request (path: `id`).
   * @param {Response} res - Express response.
   * @param {NextFunction} next - Error handler.
   * @returns {Promise<void>} 200 OK with `{ data: { list } }`.
   *
   * @errors
   * - 400 Invalid ID format
   * - 404 Not Found
   * - 500 Internal error
   */
  static async markAsArchived(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await ShoppingListService.markAsArchived(req.params.id);
      return res.json({ data: { list } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Mark a shopping list as active.
   *
   * @route PATCH /api/shopping-lists/:id/activate
   * @param {Request} req - Express request (path: `id`).
   * @param {Response} res - Express response.
   * @param {NextFunction} next - Error handler.
   * @returns {Promise<void>} 200 OK with `{ data: { list } }`.
   *
   * @errors
   * - 400 Invalid ID format
   * - 404 Not Found
   * - 500 Internal error
   */
  static async markAsActive(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await ShoppingListService.markAsActive(req.params.id);
      return res.json({ data: { list } });
    } catch (err) {
      return next(err);
    }
  }

  // ========= UTILITIES =========

  /**
   * Get statistics for a user's shopping lists.
   *
   * @route GET /api/shopping-lists/user/:userId/stats
   * @param {Request} req - Express request (path param: `userId`).
   * @param {Response} res - Express response.
   * @param {NextFunction} next - Error handler.
   * @returns {Promise<void>} 200 OK with `{ data: { stats } }`.
   *
   * @example
   * // Response
   * {
   *   "data": {
   *     "stats": {
   *       "total": 25,
   *       "active": 5,
   *       "completed": 18,
   *       "archived": 2
   *     }
   *   }
   * }
   *
   * @errors
   * - 400 Invalid user ID
   * - 500 Internal error
   */
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await ShoppingListService.getStats(req.params.userId);
      return res.json({ data: { stats } });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * Duplicate an existing shopping list.
   *
   * @route POST /api/shopping-lists/:id/duplicate
   * @param {Request} req - Express request (path: `id`, body: { userId: string, title?: string }).
   * @param {Response} res - Express response.
   * @param {NextFunction} next - Error handler.
   * @returns {Promise<void>} 201 Created with `{ data: { list } }`.
   *
   * @example
   * // Body
   * {
   *   "userId": "123e4567-e89b-12d3-a456-426614174000",
   *   "title": "Monthly Groceries Copy"
   * }
   *
   * @errors
   * - 400 Validation error
   * - 404 Not Found (original list)
   * - 500 Internal error
   */
  static async duplicate(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, title } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'userId is required in body' });
      }

      const list = await ShoppingListService.duplicate(
        req.params.id,
        userId,
        title
      );
      return res.status(201).json({ data: { list } });
    } catch (err) {
      return next(err);
    }
  }
}
