/**
 * Product Model Interfaces
 * --------------------------------------------------------------------------
 * TypeScript interfaces matching the Node.js API product schema
 * --------------------------------------------------------------------------
 */

/**
 * Core Product interface
 */
export interface Product {
  productId: string;
  productCode: string | null;
  productName: string;
  brands: string | null;
  description?: string;
  quantity: number | null;
  quantityUnit: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Input for creating a new product
 * Optional fields should be omitted if not provided, not sent as null
 */
export interface CreateProductInput {
  productId: string;
  productName: string;
  productCode?: string;
  brands?: string;
  quantity?: number;
  quantityUnit?: string;
  description?: string;
}

/**
 * Input for updating an existing product
 * Optional fields should be omitted if not provided, not sent as null
 */
export interface UpdateProductInput {
  productName?: string;
  productCode?: string;
  brands?: string;
  quantity?: number;
  quantityUnit?: string;
  description?: string;
}

/**
 * Query parameters for listing products
 */
export interface ProductListParams {
  q?: string; // Free-text search
  page?: number;
  pageSize?: number;
  orderBy?:
    | 'createdAt'
    | 'updatedAt'
    | 'productName'
    | 'productCode'
    | 'brands';
  orderDir?: 'ASC' | 'DESC';
}

/**
 * Advanced filter structure
 */
export interface ProductFilters {
  productId?: string;
  productCode?: string;
  productName?: string;
  brands?: string;
  quantityMin?: number;
  quantityMax?: number;
  quantityUnit?: string;
  // Add more filters as needed
}

/**
 * Query parameters for filtering products
 */
export interface ProductFilterParams extends ProductListParams {
  filters?: ProductFilters;
}

/**
 * Paginated response metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

/**
 * Paginated product response
 */
export interface PaginatedProductResponse {
  data: {
    products: Product[];
  };
  meta: PaginationMeta;
}

/**
 * Single product response
 */
export interface ProductResponse {
  data: {
    product: Product;
  };
}

/**
 * Success response
 */
export interface SuccessResponse {
  data: {
    success: boolean;
  };
}
