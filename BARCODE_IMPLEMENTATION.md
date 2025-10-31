# Barcode Scanning Implementation

## Overview
This implementation adds barcode scanning functionality to the new-product page, allowing users to scan or enter a barcode to automatically prefill product information from external APIs (OpenFoodFacts and UPCItemDB).

## Features Implemented

### Frontend (Angular/Ionic)
✅ **Barcode Model** (`src/app/models/barcode.model.ts`)
- TypeScript interfaces for barcode API responses
- Supports both OpenFoodFacts and UPCItemDB data structures

✅ **Barcode Service** (`src/app/services/barcode.service.ts`)
- Angular service for barcode API calls
- Methods for single and batch barcode lookups
- Separate methods for food and retail data

✅ **New Product Page Updates**
- **TypeScript** (`src/app/pages/new-product/new-product.page.ts`):
  - Barcode input state management
  - `onBarcodeLookup()` method to fetch product data
  - `prefillFormFromBarcodeData()` method to populate form fields
  - Smart parsing of quantity and unit fields
  - Error handling for API failures

- **HTML Template** (`src/app/pages/new-product/new-product.page.html`):
  - Barcode input card with lookup button
  - Success/error message display
  - Clear button for barcode input
  - Informative helper text

- **Styles** (`src/app/pages/new-product/new-product.page.scss`):
  - Professional barcode card styling
  - Message animations
  - Dark mode support
  - Responsive design

### Backend (Node.js/Express)
✅ **Barcode Routes** (`src/routes/barcode.routes.ts`)
- `GET /api/barcode/:code` - Combined lookup from both sources
- `POST /api/barcode/batch` - Batch barcode lookup
- `GET /api/barcode/:code/food` - OpenFoodFacts only
- `GET /api/barcode/:code/retail` - UPCItemDB only
- All routes protected with authentication and role-based access

✅ **Barcode Controller** (`src/controllers/barcode.controller.ts`)
- Handles barcode lookup requests
- Aggregates data from multiple sources
- Graceful error handling when services fail
- Returns unified response structure

✅ **Barcode Validator** (`src/validators/barcode.validator.ts`)
- Validates barcode format (8-14 digits)
- Validates batch request structure
- Input sanitization

## Data Mapping

The form is prefilled as follows:

| Form Field | Data Source | Priority |
|------------|-------------|----------|
| Product ID | Barcode itself | - |
| Product Code | Barcode itself | - |
| Product Name | OpenFoodFacts `product_name` or UPCItemDB `description` | Food first |
| Brand | UPCItemDB `brand` | - |
| Quantity | Parsed from OpenFoodFacts `product_quantity` or `quantity` | - |
| Quantity Unit | Parsed from OpenFoodFacts quantity fields | - |
| Description | OpenFoodFacts `keywords` | - |

## Still Needed (Backend)

⚠️ The following backend components need to be created or verified:

1. **Services Directory** (`src/services/`)
   - `openfoodfacts.service.ts` - Integration with OpenFoodFacts API
   - `upcitemdb.service.ts` - Integration with UPCItemDB API

2. **Middlewares Directory** (`src/middlewares/`)
   - `requireAuth.js` - Authentication middleware
   - `requireRole.js` - Role-based access control middleware
   - `validate.js` - Validation middleware (if using a validation library)

3. **Errors Directory** (`src/errors/`)
   - `index.js` - Custom error classes (BadRequestError, NotFoundError, etc.)

4. **App Configuration**
   - Register barcode routes in main app file
   - Example: `app.use('/api/barcode', barcodeRoutes);`

## Testing

### Frontend Testing
1. Navigate to `/tabs/products/new`
2. Enter a valid barcode (e.g., `3017620422003` for a French product)
3. Click "Lookup Barcode"
4. Verify form fields are prefilled with product data
5. Test error cases:
   - Invalid barcode format
   - Non-existent barcode
   - Network errors

### Backend Testing
```bash
# Test combined lookup
curl -X GET http://localhost:3000/api/barcode/3017620422003 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test batch lookup
curl -X POST http://localhost:3000/api/barcode/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"codes": ["3017620422003", "012345678905"]}'

# Test food-only data
curl -X GET "http://localhost:3000/api/barcode/3017620422003/food?fields=product_name,quantity" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## API Response Structure

### Combined Lookup Response
```json
{
  "barcode": "3017620422003",
  "foodData": {
    "product_name": "Nutella",
    "product_quantity": "750",
    "product_quantity_unit": "g",
    "quantity": "750 g",
    "keywords": "chocolate, hazelnut, spread"
  },
  "retailData": {
    "description": "Nutella Hazelnut Spread",
    "brand": "Ferrero",
    "images": ["https://..."]
  },
  "sources": {
    "openFoodFacts": true,
    "upcItemDB": true
  }
}
```

## Future Enhancements

- [ ] Add camera-based barcode scanning using `@capacitor-community/barcode-scanner`
- [ ] Cache barcode lookup results to reduce API calls
- [ ] Add barcode scanner button with native camera integration
- [ ] Support QR codes in addition to standard barcodes
- [ ] Add product image preview from barcode lookup
- [ ] Implement offline barcode lookup with local database

## Notes

- The implementation handles partial failures gracefully (e.g., if OpenFoodFacts fails but UPCItemDB succeeds)
- Barcode validation accepts 8-14 digit numeric barcodes (UPC, EAN, GTIN formats)
- The form can still be manually edited after prefilling
- Authentication is required for all barcode endpoints (Employee/Admin roles)
