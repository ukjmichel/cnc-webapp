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
  description: string | null;
  quantity: number | null;
  quantityUnit: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Input for creating a new product
 */
export interface CreateProductInput {
  productId: string;
  productCode?: string | null;
  productName: string;
  brands?: string | null;
  quantity?: number | null;
  quantityUnit?: string | null;
  description?: string | null;
}

/**
 * Input for updating an existing product
 */
export interface UpdateProductInput {
  productCode?: string | null;
  productName?: string;
  brands?: string | null;
  quantity?: number | null;
  quantityUnit?: string | null;
  description?: string | null;
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
