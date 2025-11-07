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

## Testing in Browser (Development Mode)

### Web Browser Camera Support

Camera scanning now works in web browsers during development! This allows you to test the camera functionality without deploying to a mobile device.

#### Quick Start for Camera Development:

```bash
# Option 1: Start with HTTPS (recommended for camera testing)
npm run start:camera

# Option 2: Start both backend and frontend with camera support
npm run start:all:camera

# Option 3: Manual HTTPS start
npm start -- --ssl
```

#### Requirements for Web Browser Camera:

1. **HTTPS or localhost**: Browsers require secure context for camera access
   - The `start:camera` script automatically enables SSL
   - Angular CLI generates self-signed certificates automatically
   - You may see a security warning - click "Advanced" and proceed

2. **Supported Browsers**:
   - ✅ Chrome/Chromium (recommended)
   - ✅ Microsoft Edge
   - ✅ Firefox (may have limited support)
   - ❌ Safari (limited WebRTC support)

3. **Camera Permissions**:
   - Your browser will prompt for camera permission
   - Click "Allow" when prompted
   - If denied, you can reset permissions in browser settings

#### Troubleshooting Web Camera:

**"Camera access requires HTTPS or localhost"**
- Use `npm run start:camera` instead of `npm start`
- Or manually add `--ssl` flag: `npm start -- --ssl`

**"Camera permission denied"**
- Check your browser's site settings
- Reset camera permissions for `https://localhost:8100`
- Make sure no other app is using the camera

**"Camera scanning is not supported in your browser"**
- Try Chrome or Edge browser
- Update your browser to the latest version
- Check if your browser supports WebRTC

**Certificate/Security Warnings**
- This is normal with self-signed certificates in development
- Click "Advanced" → "Proceed to localhost (unsafe)"
- Or generate trusted certificates (see below)

### Alternative: Using Physical Devices

If you prefer testing on actual devices, or if web camera doesn't work:

```bash
# Build and sync to mobile platforms
npm run build
npx cap sync

# Open in IDE
npx cap open ios    # for iOS
npx cap open android # for Android
```

### Generating Trusted SSL Certificates (Optional)

For a better development experience without security warnings:

```bash
# Install mkcert (one-time setup)
# macOS
brew install mkcert
brew install nss # for Firefox

# Install local CA
mkcert -install

# Generate certificates for localhost
mkcert localhost 127.0.0.1 ::1

# Use certificates with Angular
ng serve --ssl --ssl-cert localhost+2.pem --ssl-key localhost+2-key.pem
```

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
