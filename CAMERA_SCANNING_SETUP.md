# Camera Barcode Scanning Setup Guide

## Overview
Camera-based barcode scanning has been added to the new-product page using ML Kit's barcode scanning library.

## Installation Complete
The following changes have been made:
- ✅ Installed `@capacitor-mlkit/barcode-scanning@7.3.0`
- ✅ Added "Scan with Camera" button to new-product page
- ✅ Implemented camera scanning with permission handling
- ✅ Automatic API lookup after successful scan
- ✅ Updated documentation

## Setup Instructions

### 1. Build the Web Assets
Before testing on a device, build the Angular project:

```bash
npm run build
```

### 2. Sync Capacitor Native Projects
After building, sync the native projects to install the barcode scanner plugin:

```bash
npx cap sync
```

This will:
- Copy web assets to native projects
- Install the barcode scanning plugin for iOS and Android
- Configure necessary permissions

### 3. Test on Device or Emulator

#### For iOS:
```bash
npx cap open ios
```
Then build and run from Xcode.

#### For Android:
```bash
npx cap open android
```
Then build and run from Android Studio.

## Permissions

The plugin automatically handles camera permissions:
- **Android**: `CAMERA` permission is requested at runtime
- **iOS**: `NSCameraUsageDescription` is included in Info.plist

The app will request camera permission when the user clicks "Scan with Camera" for the first time.

## How to Use

1. Navigate to the New Product page (`/tabs/products/new`)
2. In the "Barcode Lookup" section, click **"Scan with Camera"**
3. Grant camera permission if prompted
4. Point the camera at a barcode (UPC, EAN, GTIN, QR code, etc.)
5. The barcode will be automatically detected
6. Product information will be fetched from the API
7. The form will be prefilled with available data

## Supported Barcode Formats

The ML Kit barcode scanner supports:
- UPC-A, UPC-E
- EAN-8, EAN-13
- Code 39, Code 93, Code 128
- ITF (Interleaved 2 of 5)
- Codabar
- QR Code
- Data Matrix
- PDF417
- Aztec

## Testing in Browser

**Note**: Camera scanning only works on physical devices or emulators. In the browser (during `npm start`), you can still test the barcode lookup feature by manually entering a barcode.

## Troubleshooting

### Camera Permission Denied
If users deny camera permission:
- They'll see an error message
- They can enable permissions in device settings
- They can still enter barcodes manually

### No Barcode Detected
If scanning fails:
- Ensure good lighting conditions
- Hold the device steady
- Make sure the barcode is clearly visible
- Try the manual entry option

### Build Errors
If you encounter build errors:
```bash
# Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
npx cap sync
```

## Integration with Existing Features

The camera scanning integrates seamlessly with:
- ✅ Manual barcode entry
- ✅ Barcode API lookup (OpenFoodFacts + UPCItemDB)
- ✅ Automatic form prefilling
- ✅ Product creation workflow

## Next Steps

After setup, the feature is ready to use. Consider:
- Testing with various barcode formats
- Testing in different lighting conditions
- Gathering user feedback for improvements
- Monitoring API usage for barcode lookups

## Additional Resources

- [ML Kit Barcode Scanning Documentation](https://developers.google.com/ml-kit/vision/barcode-scanning)
- [Capacitor ML Kit Plugin](https://github.com/capawesome-team/capacitor-mlkit)
- [Capacitor Workflow Documentation](https://capacitorjs.com/docs/basics/workflow)
