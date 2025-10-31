# Mobile Device Setup Guide - Camera Barcode Scanning

## Why Camera Scanning Doesn't Work in Browser

**Important:** Camera barcode scanning using `@capacitor-mlkit/barcode-scanning` **ONLY works on physical mobile devices or emulators**. It will NOT work when running `npm start` in a web browser.

When you click "Scan with Camera" in the browser, you'll see:
> "Camera scanning is only available on mobile devices. Please build the app for iOS/Android or enter the barcode manually below."

## Testing Options

### Option 1: Use Manual Barcode Entry (Easiest)
For web browser testing, simply:
1. Enter a barcode number manually in the input field
2. Click "Lookup Barcode"
3. The API will fetch product information

Common test barcodes:
- `012345678905` - Sample UPC
- `3017620422003` - Nutella (French product)
- `5000112576009` - Cadbury Dairy Milk
- `8712100849107` - Heineken Beer

### Option 2: Set Up Native Mobile App (For Full Camera Functionality)

To use the camera scanning feature, you need to build the app for mobile:

## Step-by-Step Setup for Mobile Testing

### Prerequisites
- Node.js and npm installed
- For iOS: Mac with Xcode installed
- For Android: Android Studio installed

### 1. Build the Web Assets

```bash
# Build the Angular app
npm run build
```

This creates the `www` directory with your compiled app.

### 2. Add Native Platforms

**For Android:**
```bash
npx cap add android
```

**For iOS (Mac only):**
```bash
npx cap add ios
```

### 3. Sync Capacitor Plugins

```bash
npx cap sync
```

This will:
- Copy web assets to native projects
- Install all Capacitor plugins (including the barcode scanner)
- Configure native permissions

### 4. Configure Permissions

#### Android Permissions
The plugin automatically adds camera permission to `AndroidManifest.xml`. If needed, verify it exists:

File: `android/app/src/main/AndroidManifest.xml`
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" />
```

#### iOS Permissions
The plugin adds camera usage description. If needed, verify in:

File: `ios/App/App/Info.plist`
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to scan product barcodes</string>
```

### 5. Open Native IDE

**For Android:**
```bash
npx cap open android
```

**For iOS:**
```bash
npx cap open ios
```

### 6. Build and Run

#### Android (Android Studio)
1. Connect an Android device via USB (enable USB debugging) OR start an Android emulator
2. Click the green "Run" button
3. Select your device/emulator
4. Wait for the app to build and install

#### iOS (Xcode)
1. Connect an iPhone/iPad via USB OR use iOS Simulator
2. Select your device from the device menu
3. Click the "Play" button to build and run
4. For physical devices: You may need to trust the developer certificate in Settings > General > Device Management

### 7. Test Camera Scanning

Once the app is running on your device:
1. Navigate to "Products" tab → "New Product"
2. Click **"Scan with Camera"**
3. Grant camera permission when prompted
4. Point camera at a barcode
5. The barcode will be automatically detected
6. Product information will be fetched and the form prefilled

## Development Workflow

### Making Changes

When you make code changes:

1. **Update the code** in `src/app/`
2. **Rebuild the web assets:**
   ```bash
   npm run build
   ```
3. **Sync to native platforms:**
   ```bash
   npx cap sync
   ```
4. **Re-run from the native IDE** (Android Studio or Xcode)

### Live Reload (Optional)

For faster development, use Capacitor Live Reload:

```bash
# Find your computer's local IP address
ipconfig getifaddr en0  # Mac
ifconfig | grep "inet "  # Linux

# Start with live reload (replace with your IP)
ionic cap run android --livereload --external --address=192.168.1.100
ionic cap run ios --livereload --external --address=192.168.1.100
```

## Troubleshooting

### "Camera scanning is only available on mobile devices"
- ✅ This is expected in the browser
- ✅ Use manual barcode entry for browser testing
- ✅ Build for mobile to use camera scanning

### Camera Permission Denied
- Go to device Settings → Apps → Your App → Permissions
- Enable Camera permission
- Restart the app

### "Barcode scanner plugin not available"
- Run `npx cap sync` to ensure the plugin is installed
- Rebuild the app in Android Studio or Xcode
- Check that `@capacitor-mlkit/barcode-scanning` is in `package.json`

### Build Errors

**Android:**
- Ensure Android Studio is up to date
- Check that ANDROID_HOME environment variable is set
- Sync Gradle files in Android Studio

**iOS:**
- Ensure Xcode is up to date
- Run `pod install` in the `ios/App` directory
- Clean build folder: Product → Clean Build Folder

### Plugin Not Found After `cap sync`
```bash
# Remove and re-add platforms
npx cap rm android
npx cap rm ios

# Rebuild
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

## Backend Server Requirement

**Important:** The barcode lookup requires the backend server to be running!

Before testing on mobile:
1. Start the backend server on your development machine:
   ```bash
   npm run server:dev
   ```

2. Update the API URL in the app to point to your computer:

   File: `src/environments/environment.ts`
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://YOUR_COMPUTER_IP:3000/',  // Replace with your IP
   };
   ```

3. Rebuild and sync:
   ```bash
   npm run build
   npx cap sync
   ```

Find your IP address:
- **Mac:** `ipconfig getifaddr en0`
- **Linux:** `hostname -I`
- **Windows:** `ipconfig` (look for IPv4 Address)

## Alternative Testing Methods

### 1. Use Browser Developer Tools
Chrome DevTools can simulate mobile devices:
- Open DevTools (F12)
- Toggle device toolbar (Ctrl+Shift+M)
- Select a mobile device

**Note:** Camera still won't work, but you can test the UI/UX.

### 2. Use Ionic DevApp (Deprecated)
Ionic DevApp is no longer maintained. Use native builds instead.

### 3. Test Without Camera
For testing the barcode lookup API without camera:
- Use manual barcode entry
- Test API directly with curl:
  ```bash
  curl http://localhost:3000/api/barcode/012345678905
  ```

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Ionic Framework Docs](https://ionicframework.com/docs)
- [Android Studio Download](https://developer.android.com/studio)
- [Xcode Download](https://developer.apple.com/xcode/)
- [ML Kit Barcode Scanning](https://developers.google.com/ml-kit/vision/barcode-scanning)

## Quick Reference

| Task | Command |
|------|---------|
| Build web assets | `npm run build` |
| Add Android platform | `npx cap add android` |
| Add iOS platform | `npx cap add ios` |
| Sync plugins | `npx cap sync` |
| Open Android Studio | `npx cap open android` |
| Open Xcode | `npx cap open ios` |
| Start backend server | `npm run server:dev` |
| Start frontend | `npm start` |
| Start both | `npm run start:all` |
