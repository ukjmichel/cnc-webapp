/**
 * Shopping List Models
 * --------------------------------------------------------------------------
 * Type definitions for shopping lists and related entities.
 * These models match the backend API schema and provide strong typing
 * for use throughout the Angular application.
 * --------------------------------------------------------------------------
 */

/**
 * Status values for a shopping list
 */
export type ShoppingListStatus = 'active' | 'completed' | 'archived';

/**
 * Status values for a shopping list item
 */
export type ShoppingListItemStatus = 'pending' | 'in_cart';

/**
 * Represents an item within a shopping list
 */
export interface ShoppingListItem {
  /** Unique identifier for the item (MongoDB ObjectId) */
  _id: string;

  /** Product identifier from the product catalog */
  productId: string;

  /** Human-readable product name */
  productName: string;

  /** Quantity of the product needed */
  quantity: number;

  /** Unit of measurement for the quantity (e.g., 'l', 'kg', 'units') */
  quantityUnit?: string;

  /** Optional notes or preferences for this item */
  comment?: string;

  /** Current status of the item */
  status: ShoppingListItemStatus;

  /** Timestamp when the item was added to the list */
  addedAt: Date | string;
}

/**
 * Represents a complete shopping list
 */
export interface ShoppingList {
  /** Unique identifier for the shopping list (MongoDB ObjectId) */
  _id: string;

  /** User ID who owns this shopping list */
  userId: string;

  /** Title/name of the shopping list */
  title: string;

  /** Optional general comment or notes about the entire list */
  comment?: string;

  /** Current status of the shopping list */
  status: ShoppingListStatus;

  /** Array of items in the shopping list */
  items: ShoppingListItem[];

  /** Timestamp when the list was created */
  createdAt: Date | string;

  /** Timestamp when the list was last modified */
  updatedAt: Date | string;
}

/**
 * Metadata returned with paginated list responses
 */
export interface PaginationMeta {
  /** Total number of items across all pages */
  total: number;

  /** Current page number (1-indexed) */
  page: number;

  /** Number of items per page */
  pageSize: number;

  /** Total number of pages */
  pages: number;
}

/**
 * Response structure for paginated shopping list queries
 */
export interface ShoppingListPagedResponse {
  /** Array of shopping lists for the current page */
  lists: ShoppingList[];

  /** Pagination metadata */
  meta: PaginationMeta;
}

/**
 * Response structure for paginated list endpoints
 */
export interface PaginatedResponse<T> {
  data: {
    lists: T[];
  };
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pages: number;
  };
}

/**
 * Statistics about a user's shopping lists
 */
export interface ShoppingListStats {
  /** Total number of shopping lists */
  total: number;

  /** Number of active shopping lists */
  active: number;

  /** Number of completed shopping lists */
  completed: number;

  /** Number of archived shopping lists */
  archived: number;
}

/**
 * Filter options for listing shopping lists
 */
export interface ShoppingListFilters {
  userId?: string;
  status?: 'active' | 'completed' | 'archived';
  q?: string;
  page?: number;
  pageSize?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'title';
  orderDir?: 'ASC' | 'DESC';
}

/**
 * Input for creating a new shopping list
 */
export interface CreateShoppingListInput {
  userId: string;
  title: string;
  comment?: string;
  items?: {
    productId: string;
    productName?: string;
    quantity: number;
    quantityUnit?: string;
    comment?: string;
  }[];
}

/**
 * Input for updating a shopping list
 */
export interface UpdateShoppingListInput {
  title?: string;
  comment?: string;
  status?: 'active' | 'completed' | 'archived';
}

/**
 * Input for adding an item to a shopping list
 */
export interface AddItemInput {
  productId: string;
  productName?: string;
  quantity: number;
  quantityUnit?: string;
  comment?: string;
}

/**
 * Input for updating an item in a shopping list
 */
export interface UpdateItemInput {
  productName?: string;
  quantity?: number;
  quantityUnit?: string;
  comment?: string;
  status?: ShoppingListItemStatus;
}

/**
 * Input for duplicating a shopping list
 */
export interface DuplicateShoppingListInput {
  userId: string;
  title?: string;
}
