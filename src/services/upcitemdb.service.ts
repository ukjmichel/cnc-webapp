// src/services/upcitemdb.service.ts

/**
 * =============================================================================
 * UPCItemDB Service
 * =============================================================================
 * Service for fetching product data from UPCItemDB API
 * API Documentation: https://www.upcitemdb.com/api/explorer
 * Note: Requires API key for production use
 * =============================================================================
 */

import axios from 'axios';

interface UPCItemDBOptions {
  fields?: string[];
}

interface UPCItemDBProduct {
  barcode?: string;
  ean?: string;
  title?: string;
  description?: string;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  dimension?: string;
  weight?: string;
  category?: string;
  currency?: string;
  lowest_recorded_price?: number;
  highest_recorded_price?: number;
  images?: string[];
  offers?: any[];
  [key: string]: any;
}

interface UPCItemDBResponse {
  code: string;
  total: number;
  offset: number;
  items: UPCItemDBProduct[];
}

export class UPCItemDBService {
  private static readonly BASE_URL = 'https://api.upcitemdb.com';
  private static readonly API_KEY = process.env.UPCITEMDB_API_KEY || '';

  /**
   * Lookup product by barcode from UPCItemDB
   * @param barcode Product barcode (UPC/EAN/GTIN)
   * @param options Options including fields to return
   * @returns Product data
   */
  static async lookup(
    barcode: string,
    options?: UPCItemDBOptions
  ): Promise<UPCItemDBProduct> {
    try {
      const url = `${this.BASE_URL}/prod/trial/lookup`;

      const params: any = {
        upc: barcode,
      };

      const headers: any = {
        'Content-Type': 'application/json',
        'User-Agent': 'CNC-WebApp/1.0',
      };

      // Add API key if available (for production)
      if (this.API_KEY) {
        headers['Authorization'] = `Bearer ${this.API_KEY}`;
      }

      const response = await axios.get<UPCItemDBResponse>(url, {
        params,
        headers,
        timeout: 10000, // 10 second timeout
      });

      // Check if product was found
      if (!response.data.items || response.data.items.length === 0) {
        throw new Error(`Product not found in UPCItemDB: ${barcode}`);
      }

      const product = response.data.items[0];

      // Filter fields if specified
      if (options?.fields && options.fields.length > 0) {
        const filteredProduct: any = { barcode };
        options.fields.forEach((field) => {
          if (product[field] !== undefined) {
            filteredProduct[field] = product[field];
          }
        });
        return filteredProduct;
      }

      return {
        barcode,
        ...product,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Handle rate limiting
        if (error.response?.status === 429) {
          throw new Error(
            'UPCItemDB API rate limit exceeded. Please try again later.'
          );
        }

        // Handle not found
        if (error.response?.status === 404) {
          throw new Error(`Product not found in UPCItemDB: ${barcode}`);
        }

        // Handle API errors
        if (error.response?.data?.message) {
          throw new Error(`UPCItemDB API error: ${error.response.data.message}`);
        }

        throw new Error(`UPCItemDB API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Search for products by keyword
   * @param query Search query
   * @param page Page number (default 1)
   * @param pageSize Results per page (default 10)
   * @returns Search results
   */
  static async search(
    query: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<UPCItemDBResponse> {
    try {
      const url = `${this.BASE_URL}/prod/trial/search`;

      const headers: any = {
        'Content-Type': 'application/json',
        'User-Agent': 'CNC-WebApp/1.0',
      };

      if (this.API_KEY) {
        headers['Authorization'] = `Bearer ${this.API_KEY}`;
      }

      const response = await axios.get<UPCItemDBResponse>(url, {
        params: {
          s: query,
          match_mode: 0,
          type: 'product',
          page,
          page_size: pageSize,
        },
        headers,
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error(
            'UPCItemDB API rate limit exceeded. Please try again later.'
          );
        }
        throw new Error(`UPCItemDB search error: ${error.message}`);
      }
      throw error;
    }
  }
}
