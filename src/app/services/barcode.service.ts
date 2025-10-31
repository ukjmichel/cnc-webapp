/**
 * BarcodeService
 * --------------------------------------------------------------------------
 * Service responsible for communicating with the backend barcode API
 * to retrieve product information from OpenFoodFacts and UPCItemDB
 * --------------------------------------------------------------------------
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import {
  CombinedBarcodeResponse,
  BatchBarcodeResponse,
} from '../models/barcode.model';

@Injectable({ providedIn: 'root' })
export class BarcodeService {
  /** Base URL for barcode endpoints */
  private baseUrl = `${environment.apiUrl}api/barcode/`;

  constructor(private http: HttpClient) {}

  /**
   * Get combined product information by barcode from both OpenFoodFacts and UPCItemDB
   * @param code Barcode (UPC/EAN/GTIN)
   * @returns Observable emitting combined product data
   */
  getItemByCode(code: string): Observable<CombinedBarcodeResponse> {
    return this.http.get<CombinedBarcodeResponse>(`${this.baseUrl}${code}`, {
      withCredentials: true,
    });
  }

  /**
   * Get multiple products by barcodes
   * @param codes Array of barcodes
   * @returns Observable emitting batch lookup results
   */
  getBatchItems(codes: string[]): Observable<BatchBarcodeResponse> {
    return this.http.post<BatchBarcodeResponse>(
      `${this.baseUrl}batch`,
      { codes },
      {
        withCredentials: true,
      }
    );
  }

  /**
   * Get product information from OpenFoodFacts only
   * @param code Barcode
   * @param fields Optional comma-separated list of fields
   * @returns Observable emitting food-specific data
   */
  getFoodData(code: string, fields?: string): Observable<any> {
    let params = new HttpParams();
    if (fields) {
      params = params.set('fields', fields);
    }

    return this.http.get<any>(`${this.baseUrl}${code}/food`, {
      params,
      withCredentials: true,
    });
  }

  /**
   * Get product information from UPCItemDB only
   * @param code Barcode
   * @param fields Optional comma-separated list of fields
   * @returns Observable emitting retail-specific data
   */
  getRetailData(code: string, fields?: string): Observable<any> {
    let params = new HttpParams();
    if (fields) {
      params = params.set('fields', fields);
    }

    return this.http.get<any>(`${this.baseUrl}${code}/retail`, {
      params,
      withCredentials: true,
    });
  }
}
