// src/app/api/services/openfoodfacts.service.ts

/**
 * =============================================================================
 * OpenFoodFacts Service
 * =============================================================================
 * Service for fetching product data from OpenFoodFacts API
 * API Documentation: https://wiki.openfoodfacts.org/API
 * =============================================================================
 */

import axios from 'axios';

interface OpenFoodFactsOptions {
  fields?: string[];
}

interface OpenFoodFactsProduct {
  barcode?: string;
  product_name?: string;
  _keywords?: string;
  product_quantity?: string;
  product_quantity_unit?: string;
  quantity?: string;
  serving_quantity?: string;
  serving_quantity_unit?: string;
  brands?: string;
  categories?: string;
  labels?: string;
  [key: string]: any;
}

interface OpenFoodFactsResponse {
  code: string;
  product?: OpenFoodFactsProduct;
  status: number;
  status_verbose: string;
}

export class OpenFoodFactsService {
  private static readonly BASE_URL = 'https://world.openfoodfacts.org/api/v2';

  /**
   * Get product information by barcode from OpenFoodFacts
   * @param barcode Product barcode (EAN/UPC/GTIN)
   * @param options Options including fields to return
   * @returns Product data
   */
  static async getProductByBarcode(
    barcode: string,
    options?: OpenFoodFactsOptions
  ): Promise<OpenFoodFactsProduct> {
    try {
      const url = `${this.BASE_URL}/product/${barcode}`;

      const params: any = {};

      // Add fields parameter if specified
      if (options?.fields && options.fields.length > 0) {
        params.fields = options.fields.join(',');
      }

      const response = await axios.get<OpenFoodFactsResponse>(url, {
        params,
        headers: {
          'User-Agent': 'CNC-WebApp/1.0 (Product Management System)',
        },
        timeout: 10000, // 10 second timeout
      });

      // Check if product was found
      if (response.data.status === 0 || !response.data.product) {
        throw new Error(`Product not found in OpenFoodFacts: ${barcode}`);
      }

      return {
        barcode,
        ...response.data.product,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`Product not found in OpenFoodFacts: ${barcode}`);
        }
        throw new Error(
          `OpenFoodFacts API error: ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Search for products by name or brand
   * @param query Search query
   * @param page Page number (default 1)
   * @param pageSize Results per page (default 20)
   * @returns Search results
   */
  static async searchProducts(
    query: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<any> {
    try {
      const url = `${this.BASE_URL}/search`;

      const response = await axios.get(url, {
        params: {
          search_terms: query,
          page,
          page_size: pageSize,
        },
        headers: {
          'User-Agent': 'CNC-WebApp/1.0 (Product Management System)',
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`OpenFoodFacts search error: ${error.message}`);
      }
      throw error;
    }
  }
}
