// src/app/api/routes/shopping-list.routes.ts

import { Router } from 'express';

import { requireAuth } from '../middlewares/requireAuth.ts';
import { requireEmployeeOrAdmin } from '../middlewares/requireRole.ts';

import { ShoppingListController } from '../controllers/shopping-list.controller.ts';
import {
  vAddItem,
  vCreateShoppingList,
  vDuplicate,
  vListShoppingLists,
  vParamId,
  vParamItemId,
  vParamListId,
  vParamUserId,
  vUpdateItem,
  vUpdateShoppingList,
} from '../validators/shopping-list.validator.ts';

const shoppingListRouter = Router();

/**
 * =============================================================================
 * Shopping List Routes — Express Router
 * =============================================================================
 * Mount point
 *  - Mount at `/api/shopping-lists` in your app, e.g.:
 *      import shoppingListRoutes from './routes/shopping-list.routes.js';
 *      app.use('/api/shopping-lists', shoppingListRoutes);
 *
 * Endpoints (relative to /api/shopping-lists)
 *  - POST   /                                  → ShoppingListController.create
 *  - GET    /                                  → ShoppingListController.list
 *  - GET    /user/:userId                      → ShoppingListController.getByUserId
 *  - GET    /user/:userId/active               → ShoppingListController.getActiveByUserId
 *  - GET    /user/:userId/stats                → ShoppingListController.getStats
 *  - GET    /:id                               → ShoppingListController.getById
 *  - PATCH  /:id                               → ShoppingListController.update
 *  - DELETE /:id                               → ShoppingListController.remove
 *  - POST   /:id/items                         → ShoppingListController.addItem
 *  - DELETE /:listId/items/:itemId             → ShoppingListController.removeItem
 *  - PATCH  /:listId/items/:itemId             → ShoppingListController.updateItem
 *  - PATCH  /:listId/items/:itemId/status      → ShoppingListController.updateItemStatus
 *  - PATCH  /:id/complete                      → ShoppingListController.markAsCompleted
 *  - PATCH  /:id/archive                       → ShoppingListController.markAsArchived
 *  - PATCH  /:id/activate                      → ShoppingListController.markAsActive
 *  - POST   /:id/duplicate                     → ShoppingListController.duplicate
 *
 * Auth model
 *  - All endpoints require authentication (requireAuth middleware)
 *  - Shopping lists are personal data, so users can only access their own lists
 *  - Authorization checks should be implemented in the service layer
 * =============================================================================
 */

/**
 * @swagger
 * tags:
 *   - name: Shopping Lists
 *     description: Shopping list management and item operations
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     ShoppingListItem:
 *       type: object
 *       properties:
 *         _id:          { type: string, example: "507f1f77bcf86cd799439012" }
 *         productId:    { type: string, example: "PROD001" }
 *         productName:  { type: string, example: "Organic Milk" }
 *         quantity:     { type: number, example: 2 }
 *         quantityUnit: { type: string, example: "l" }
 *         comment:      { type: string, nullable: true, example: "Low fat preferred" }
 *         status:       { type: string, enum: [pending, in_cart], example: "pending" }
 *         addedAt:      { type: string, format: date-time }
 *     ShoppingList:
 *       type: object
 *       properties:
 *         _id:       { type: string, example: "507f1f77bcf86cd799439011" }
 *         userId:    { type: string, example: "123e4567-e89b-12d3-a456-426614174000" }
 *         title:     { type: string, example: "Weekly Groceries" }
 *         comment:   { type: string, nullable: true, example: "Don't forget organic items" }
 *         status:    { type: string, enum: [active, completed, archived], example: "active" }
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ShoppingListItem'
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     ShoppingListCreateInput:
 *       type: object
 *       required: [userId, title]
 *       properties:
 *         userId:  { type: string }
 *         title:   { type: string }
 *         comment: { type: string, nullable: true }
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:    { type: string }
 *               productName:  { type: string, nullable: true }
 *               quantity:     { type: number }
 *               quantityUnit: { type: string, nullable: true }
 *               comment:      { type: string, nullable: true }
 *               status:       { type: string, enum: [pending, in_cart], nullable: true }
 *     ShoppingListUpdateInput:
 *       type: object
 *       properties:
 *         title:   { type: string }
 *         comment: { type: string, nullable: true }
 *         status:  { type: string, enum: [active, completed, archived] }
 *     AddItemInput:
 *       type: object
 *       required: [productId, quantity]
 *       properties:
 *         productId:    { type: string }
 *         productName:  { type: string, nullable: true }
 *         quantity:     { type: number }
 *         quantityUnit: { type: string, nullable: true }
 *         comment:      { type: string, nullable: true }
 *         status:       { type: string, enum: [pending, in_cart], nullable: true }
 *     UpdateItemInput:
 *       type: object
 *       properties:
 *         productName:  { type: string, nullable: true }
 *         quantity:     { type: number }
 *         quantityUnit: { type: string, nullable: true }
 *         comment:      { type: string, nullable: true }
 *         status:       { type: string, enum: [pending, in_cart], nullable: true }
 *     UpdateItemStatusInput:
 *       type: object
 *       required: [status]
 *       properties:
 *         status: { type: string, enum: [pending, in_cart] }
 *     DataShoppingList:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             list:
 *               $ref: '#/components/schemas/ShoppingList'
 *     DataShoppingLists:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             lists:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShoppingList'
 *     DataShoppingListsWithMeta:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             lists:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ShoppingList'
 *         meta:
 *           type: object
 *           properties:
 *             total:    { type: integer, example: 25 }
 *             page:     { type: integer, example: 1 }
 *             pageSize: { type: integer, example: 20 }
 *             pages:    { type: integer, example: 2 }
 *     DataStats:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             stats:
 *               type: object
 *               properties:
 *                 total:     { type: integer, example: 25 }
 *                 active:    { type: integer, example: 5 }
 *                 completed: { type: integer, example: 18 }
 *                 archived:  { type: integer, example: 2 }
 *     DataSuccess:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: true
 */

/**
 * @swagger
 * /api/shopping-lists:
 *   post:
 *     summary: Create a shopping list
 *     description: Creates a new shopping list and returns the created list.
 *     tags: [Shopping Lists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShoppingListCreateInput'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataShoppingList'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal error
 */
shoppingListRouter.post(
  '/',
  requireAuth,
  vCreateShoppingList,
  ShoppingListController.create
);

/**
 * @swagger
 * /api/shopping-lists:
 *   get:
 *     summary: List shopping lists
 *     description: Paginated list with optional filtering by user, status, and text search.
 *     tags: [Shopping Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         description: Filter by user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, archived]
 *         description: Filter by status
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Free-text search in title and comment
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, default: 20 }
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title]
 *           default: createdAt
 *       - in: query
 *         name: orderDir
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataShoppingListsWithMeta'
 *       400:
 *         description: Invalid query
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal error
 */
shoppingListRouter.get(
  '/',
  requireAuth,
  vListShoppingLists,
  ShoppingListController.list
);

/**
 * @swagger
 * /api/shopping-lists/user/{userId}:
 *   get:
 *     summary: Get all shopping lists for a specific user
 *     tags: [Shopping Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, archived]
 *         description: Optional status filter
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataShoppingLists'
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal error
 */
shoppingListRouter.get(
  '/user/:userId',
  requireAuth,
  requireEmployeeOrAdmin,
  vParamUserId,
  ShoppingListController.getByUserId
);

/**
 * @swagger
 * /api/shopping-lists/user/{userId}/active:
 *   get:
 *     summary: Get active shopping lists for a specific user
 *     tags: [Shopping Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataShoppingLists'
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal error
 */
shoppingListRouter.get(
  '/user/:userId/active',
  requireAuth,
  requireEmployeeOrAdmin,
  vParamUserId,
  ShoppingListController.getActiveByUserId
);

/**
 * @swagger
 * /api/shopping-lists/user/{userId}/stats:
 *   get:
 *     summary: Get statistics for a user's shopping lists
 *     tags: [Shopping Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataStats'
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal error
 */
shoppingListRouter.get(
  '/user/:userId/stats',
  requireAuth,
  requireEmployeeOrAdmin,
  vParamUserId,
  ShoppingListController.getStats
);

/**
 * @swagger
 * /api/shopping-lists/{id}:
 *   get:
 *     summary: Get a single shopping list by ID
 *     tags: [Shopping Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataShoppingList'
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal error
 */
shoppingListRouter.get(
  '/:id',
  requireAuth,
  requireEmployeeOrAdmin,
  vParamId,
  ShoppingListController.getById
);

/**
 * @swagger
 * /api/shopping-lists/{id}:
 *   patch:
 *     summary: Update shopping list metadata
 *     tags: [Shopping Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShoppingListUpdateInput'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataShoppingList'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal error
 */
shoppingListRouter.patch(
  '/:id',
  requireAuth,
  requireEmployeeOrAdmin,
  vParamId,
  vUpdateShoppingList,
  ShoppingListController.update
);

/**
 * @swagger
 * /api/shopping-lists/{id}:
 *   delete:
 *     summary: Delete a shopping list
 *     tags: [Shopping Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataSuccess'
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal error
 */
shoppingListRouter.delete(
  '/:id',
  requireAuth,
  requireEmployeeOrAdmin,
  vParamId,
  ShoppingListController.remove
);

/**
 * @swagger
 * /api/shopping-lists/{id}/items:
 *   post:
 *     summary: Add an item to a shopping list
 *     tags: [Shopping Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddItemInput'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataShoppingList'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal error
 */
shoppingListRouter.post(
  '/:id/items',
  requireAuth,
  requireEmployeeOrAdmin,
  vParamId,
  vAddItem,
  ShoppingListController.addItem
);

/**
 * @swagger
 * /api/shopping-lists/{listId}/items/{itemId}:
 *   delete:
 *     summary: Remove an item from a shopping list
 *     tags: [Shopping Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataShoppingList'
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal error
 */
shoppingListRouter.delete(
  '/:listId/items/:itemId',
  requireAuth,
  requireEmployeeOrAdmin,
  vParamListId,
  vParamItemId,
  ShoppingListController.removeItem
);

/**
 * @swagger
 * /api/shopping-lists/{listId}/items/{itemId}:
 *   patch:
 *     summary: Update an item in a shopping list
 *     tags: [Shopping Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateItemInput'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataShoppingList'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal error
 */
shoppingListRouter.patch(
  '/:listId/items/:itemId',
  requireAuth,
  requireEmployeeOrAdmin,
  vParamListId,
  vParamItemId,
  vUpdateItem,
  ShoppingListController.updateItem
);

/**
 * @swagger
 * /api/shopping-lists/{listId}/items/{itemId}/status:
 *   patch:
 *     summary: Update the status of an item in a shopping list
 *     description: Quick endpoint to toggle item status between 'pending' and 'in_cart'
 *     tags: [Shopping Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateItemStatusInput'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataShoppingList'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal error
 */
shoppingListRouter.patch(
  '/:listId/items/:itemId/status',
  requireAuth,
  requireEmployeeOrAdmin,
  vParamListId,
  vParamItemId,
  ShoppingListController.updateItemStatus
);

/**
 * @swagger
 * /api/shopping-lists/{id}/complete:
 *   patch:
 *     summary: Mark a shopping list as completed
 *     tags: [Shopping Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataShoppingList'
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal error
 */
shoppingListRouter.patch(
  '/:id/complete',
  requireAuth,
  requireEmployeeOrAdmin,
  vParamId,
  ShoppingListController.markAsCompleted
);

/**
 * @swagger
 * /api/shopping-lists/{id}/archive:
 *   patch:
 *     summary: Mark a shopping list as archived
 *     tags: [Shopping Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataShoppingList'
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal error
 */
shoppingListRouter.patch(
  '/:id/archive',
  requireAuth,
  requireEmployeeOrAdmin,
  vParamId,
  ShoppingListController.markAsArchived
);

/**
 * @swagger
 * /api/shopping-lists/{id}/activate:
 *   patch:
 *     summary: Mark a shopping list as active
 *     tags: [Shopping Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataShoppingList'
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal error
 */
shoppingListRouter.patch(
  '/:id/activate',
  requireAuth,
  requireEmployeeOrAdmin,
  vParamId,
  ShoppingListController.markAsActive
);

/**
 * @swagger
 * /api/shopping-lists/{id}/duplicate:
 *   post:
 *     summary: Duplicate an existing shopping list
 *     tags: [Shopping Lists]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string }
 *               title:  { type: string, nullable: true }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataShoppingList'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found (original list)
 *       500:
 *         description: Internal error
 */
shoppingListRouter.post(
  '/:id/duplicate',
  requireAuth,
  requireEmployeeOrAdmin,
  vParamId,
  vDuplicate,
  ShoppingListController.duplicate
);

export default shoppingListRouter;
