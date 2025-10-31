/**
 * Barcode Model Interfaces
 * --------------------------------------------------------------------------
 * TypeScript interfaces for barcode lookup responses
 * --------------------------------------------------------------------------
 */

/**
 * Food data from OpenFoodFacts
 */
export interface BarcodeFoodData {
  keywords?: string;
  product_name?: string;
  product_quantity?: string;
  product_quantity_unit?: string;
  quantity?: string;
  serving_quantity?: string;
  serving_quantity_unit?: string;
}

/**
 * Retail data from UPCItemDB
 */
export interface BarcodeRetailData {
  description?: string;
  brand?: string;
  images?: string[];
}

/**
 * Source indicators
 */
export interface BarcodeSources {
  openFoodFacts: boolean;
  upcItemDB: boolean;
}

/**
 * Combined barcode lookup response
 */
export interface CombinedBarcodeResponse {
  barcode: string;
  foodData?: BarcodeFoodData;
  retailData?: BarcodeRetailData;
  sources: BarcodeSources;
}

/**
 * Batch lookup response
 */
export interface BatchBarcodeResponse {
  items: CombinedBarcodeResponse[];
  total: number;
  requested: number;
}
