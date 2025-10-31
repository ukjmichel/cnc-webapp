# Quick Start - Testing Barcode Functionality

## For Quick Testing (No Mobile Device Needed)

### 1. Start the Backend Server
```bash
# Terminal 1
npm run server:dev
```

Server will start at `http://localhost:3000`

### 2. Start the Frontend
```bash
# Terminal 2
npm start
```

App will open at `http://localhost:8100`

### 3. Test Barcode Lookup

1. Navigate to: **Products Tab → New Product**
2. In the "Barcode Lookup" section:
   - **Enter a barcode manually** (e.g., `012345678905`)
   - Click **"Lookup Barcode"**
   - Product information will be fetched (if available in databases)

### Test Barcodes

Try these barcodes for testing:
- `012345678905` - Sample UPC
- `3017620422003` - Nutella
- `5000112576009` - Cadbury Dairy Milk
- `7613036301169` - Nescafé
- `8712100849107` - Heineken

### What Happens

1. **Backend API** calls OpenFoodFacts and UPCItemDB
2. **Combined data** is returned to frontend
3. **Form is prefilled** with product name, brand, quantity, etc.
4. You can **edit** any fields before creating the product

## Camera Scanning (Mobile Only)

**Camera scanning does NOT work in web browsers.**

To use camera scanning, you need to:

1. Build the app for iOS or Android
2. Run on a physical device or emulator

**See full instructions:** [MOBILE_SETUP_GUIDE.md](./MOBILE_SETUP_GUIDE.md)

### Quick Mobile Build

```bash
# 1. Build web assets
npm run build

# 2. Add platform (first time only)
npx cap add android  # or ios

# 3. Sync plugins
npx cap sync

# 4. Open in IDE
npx cap open android  # or ios

# 5. Run from Android Studio or Xcode
```

## Current Behavior in Browser

When you click **"Scan with Camera"** in the browser, you'll see:

> "Camera scanning is only available on mobile devices. Please build the app for iOS/Android or enter the barcode manually below."

This is expected! Use manual entry for browser testing.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (Angular/Ionic)                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  New Product Page                                         │  │
│  │  ┌──────────────┐  ┌─────────────────────────────────┐  │  │
│  │  │ Camera Scan  │  │  Manual Barcode Entry           │  │  │
│  │  │ (Mobile Only)│  │  (Works in Browser)             │  │  │
│  │  └──────┬───────┘  └──────┬──────────────────────────┘  │  │
│  │         │                  │                              │  │
│  │         └──────────────────┼──────────────────────────────┤  │
│  │                            ↓                              │  │
│  │                    BarcodeService.getItemByCode()         │  │
│  └────────────────────────────┼───────────────────────────────┘  │
└────────────────────────────────┼──────────────────────────────────┘
                                 ↓ HTTP GET
┌─────────────────────────────────────────────────────────────────┐
│  Backend API (Express/TypeScript)                                │
│  http://localhost:3000/api/barcode/:code                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  BarcodeController                                        │  │
│  │  ├─→ OpenFoodFactsService (food products)                │  │
│  │  └─→ UPCItemDBService (retail products)                  │  │
│  └────────────────────────────┬─────────────────────────────────┘  │
└────────────────────────────────┼──────────────────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────────┐
│  External APIs                                                   │
│  ├─→ OpenFoodFacts API (https://world.openfoodfacts.org)       │
│  └─→ UPCItemDB API (https://api.upcitemdb.com)                 │
└─────────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### "Failed to lookup barcode"
- Backend server might not be running → Start with `npm run server:dev`
- Barcode not in databases → Try a different barcode or enter product manually
- Check browser console for detailed error messages

### Camera button doesn't work
- **Expected in browser!** → Use manual entry or build for mobile
- See [MOBILE_SETUP_GUIDE.md](./MOBILE_SETUP_GUIDE.md) for mobile setup

### Backend connection error
- Ensure backend is running on port 3000
- Check `src/environments/environment.ts` has correct API URL
- For mobile testing, update API URL to your computer's IP address

## Documentation

- **[MOBILE_SETUP_GUIDE.md](./MOBILE_SETUP_GUIDE.md)** - Complete guide for mobile device setup
- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Backend API server documentation
- **[CAMERA_SCANNING_SETUP.md](./CAMERA_SCANNING_SETUP.md)** - Technical camera implementation details
- **[BARCODE_IMPLEMENTATION.md](./BARCODE_IMPLEMENTATION.md)** - Feature overview and architecture

## Next Steps

1. ✅ Test manual barcode lookup in browser
2. ✅ Verify backend API is working
3. ✅ Build for mobile when ready to test camera scanning
4. 🎯 Deploy backend to production server
5. 🎯 Configure production environment variables
