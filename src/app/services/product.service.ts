/**
 * ProductService
 * --------------------------------------------------------------------------
 * Service responsible for communicating with the backend API for product
 * operations such as creating, retrieving, updating, filtering, and deleting
 * products.
 *
 * This service uses Angular Signals to store global product state for
 * easy reactive consumption in components.
 * --------------------------------------------------------------------------
 */

import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductListParams,
  ProductFilterParams,
  PaginatedProductResponse,
  ProductResponse,
  SuccessResponse,
} from '../models/product.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  /** Base URL for product endpoints */
  private baseUrl = `${environment.apiUrl}api/products/`;

  /** Signal holding all products from the most recent fetch */
  public allProducts = signal<Product[]>([]);

  /** Signal holding the currently selected/viewed product */
  public currentProduct = signal<Product | null>(null);

  /** Signal holding the total count of products */
  public totalProducts = signal<number>(0);

  constructor(private http: HttpClient) {}

  /**
   * Creates a new product.
   * @param input Product creation data
   * @returns Observable emitting the created product
   */
  createProduct(input: CreateProductInput): Observable<Product> {
    return this.http
      .post<ProductResponse>(this.baseUrl, input, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data.product));
  }

  /**
   * Retrieves a paginated list of products with optional search and sorting.
   * Also updates the `allProducts` signal.
   * @param params Optional query parameters
   * @returns Observable emitting paginated product results
   */
  listProducts(
    params?: ProductListParams
  ): Observable<PaginatedProductResponse> {
    let httpParams = new HttpParams();

    if (params?.q) {
      httpParams = httpParams.set('q', params.q);
    }
    if (params?.page) {
      httpParams = httpParams.set('page', String(params.page));
    }
    if (params?.pageSize) {
      httpParams = httpParams.set('pageSize', String(params.pageSize));
    }
    if (params?.orderBy) {
      httpParams = httpParams.set('orderBy', params.orderBy);
    }
    if (params?.orderDir) {
      httpParams = httpParams.set('orderDir', params.orderDir);
    }

    return this.http
      .get<PaginatedProductResponse>(this.baseUrl, {
        params: httpParams,
        withCredentials: true,
      })
      .pipe(
        map((res) => {
          // Update signals with the products
          this.allProducts.set(res.data.products);
          this.totalProducts.set(res.meta.total);
          return res;
        })
      );
  }

  /**
   * Filters products with advanced criteria.
   * Also updates the `allProducts` signal.
   * @param params Filter parameters including optional filters object
   * @returns Observable emitting paginated product results
   */
  filterProducts(
    params?: ProductFilterParams
  ): Observable<PaginatedProductResponse> {
    let httpParams = new HttpParams();

    if (params?.q) {
      httpParams = httpParams.set('q', params.q);
    }
    if (params?.filters) {
      // Stringify the filters object for the API
      httpParams = httpParams.set('filters', JSON.stringify(params.filters));
    }
    if (params?.page) {
      httpParams = httpParams.set('page', String(params.page));
    }
    if (params?.pageSize) {
      httpParams = httpParams.set('pageSize', String(params.pageSize));
    }
    if (params?.orderBy) {
      httpParams = httpParams.set('orderBy', params.orderBy);
    }
    if (params?.orderDir) {
      httpParams = httpParams.set('orderDir', params.orderDir);
    }

    return this.http
      .get<PaginatedProductResponse>(`${this.baseUrl}filter`, {
        params: httpParams,
        withCredentials: true,
      })
      .pipe(
        map((res) => {
          // Update signals with the products
          this.allProducts.set(res.data.products);
          this.totalProducts.set(res.meta.total);
          return res;
        })
      );
  }

  /**
   * Retrieves a product by its product code.
   * Also updates the `currentProduct` signal.
   * @param productCode Product code to search for
   * @returns Observable emitting the product
   */
  getByCode(productCode: string): Observable<Product> {
    const params = new HttpParams().set('productCode', productCode);

    const obs = this.http
      .get<ProductResponse>(`${this.baseUrl}by-code`, {
        params,
        withCredentials: true,
      })
      .pipe(map((res) => res.data.product));

    obs.subscribe((product) => this.currentProduct.set(product));
    return obs;
  }

  /**
   * Retrieves a single product by its ID.
   * Also updates the `currentProduct` signal.
   * @param id Product ID
   * @returns Observable emitting the product
   */
  getById(id: string): Observable<Product> {
    const obs = this.http
      .get<ProductResponse>(`${this.baseUrl}${id}`, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data.product));

    obs.subscribe((product) => this.currentProduct.set(product));
    return obs;
  }

  /**
   * Updates a product.
   * @param id Product ID
   * @param input Update data
   * @returns Observable emitting the updated product
   */
  updateProduct(id: string, input: UpdateProductInput): Observable<Product> {
    return this.http
      .patch<ProductResponse>(`${this.baseUrl}${id}`, input, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data.product));
  }

  /**
   * Deletes a product.
   * @param id Product ID
   * @returns Observable emitting success status
   */
  deleteProduct(id: string): Observable<boolean> {
    return this.http
      .delete<SuccessResponse>(`${this.baseUrl}${id}`, {
        withCredentials: true,
      })
      .pipe(map((res) => res.data.success));
  }

  /**
   * Searches products by free-text query.
   * Convenience method that uses listProducts.
   * @param query Search query string
   * @param page Optional page number
   * @param pageSize Optional page size
   * @returns Observable emitting paginated product results
   */
  searchProducts(
    query: string,
    page: number = 1,
    pageSize: number = 20
  ): Observable<PaginatedProductResponse> {
    return this.listProducts({ q: query, page, pageSize });
  }

  /**
   * Clears all product signals (useful for logout/cleanup).
   */
  clearProductState(): void {
    this.allProducts.set([]);
    this.currentProduct.set(null);
    this.totalProducts.set(0);
  }
}
