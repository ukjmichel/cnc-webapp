# Camera Development Guide

## Quick Start

To use the camera in development mode on your web browser:

```bash
# Start frontend with camera support (using Ionic serve with SSL)
npm run start:camera

# Or start both backend and frontend together
npm run start:all:camera

# Alternative: Use Ionic CLI directly
ionic serve --ssl
```

Ionic will automatically open your browser to **https://localhost:8100** (note: HTTPS, not HTTP)

## Why HTTPS?

Browsers require a secure context (HTTPS or localhost) to access the camera for security reasons. Without HTTPS:
- Camera API will not be available
- You'll see: "Camera access requires HTTPS or localhost"

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Excellent | Recommended for development |
| Edge | ✅ Excellent | Based on Chromium |
| Firefox | ⚠️ Limited | May have issues with barcode scanning |
| Safari | ❌ Poor | Limited WebRTC support |

## Security Warnings

When using `npm run start:camera`, you'll see a security warning because Angular CLI generates self-signed certificates:

1. Click **"Advanced"** or **"Show Details"**
2. Click **"Proceed to localhost (unsafe)"** or **"Accept the Risk and Continue"**
3. This is safe for development on localhost

## Configuration Changes

The following changes enable camera in development:

### 1. Web Scanner Library (`html5-qrcode`)
- Installed `html5-qrcode` for browser-based camera scanning
- Works with any modern browser that supports WebRTC
- Provides a fallback when ML Kit (mobile-only) isn't available

### 2. Capacitor Configuration (`capacitor.config.ts`)
- Added server configuration for localhost
- Enabled BarcodeScanner plugin configuration

### 3. Application Code (`src/app/pages/new-product/new-product.page.ts`)
- Detects web vs mobile environment
- Uses `html5-qrcode` for web browsers
- Uses ML Kit BarcodeScanner for native mobile apps
- Added modal UI for web camera scanner
- Enhanced error handling for both platforms

### 4. NPM Scripts (`package.json`)
- Updated to use `ionic serve` instead of `ng serve`
- `start` - Standard Ionic serve
- `start:camera` - Ionic serve with SSL for camera support
- `start:all:camera` - Start backend + frontend with camera support
- Installed `@ionic/cli` as dev dependency

## Development Workflow

### For Camera Testing:
```bash
# Option 1: Start both backend and frontend with camera support
npm run start:all:camera

# Option 2: Start services separately
# Terminal 1: Start backend
npm run server:dev

# Terminal 2: Start frontend with camera support
npm run start:camera
```

### For Regular Development (no camera):
```bash
# Start without SSL (camera won't work)
npm start

# Or start both backend and frontend
npm run start:all
```

## Testing Camera Features

1. Navigate to **https://localhost:8100** in Chrome/Edge
2. Accept the self-signed certificate warning
3. Go to **Products > New Product**
4. Click **"Scan with Camera"**
5. Allow camera permissions when prompted
6. Point camera at a barcode

## Troubleshooting

### "Camera access requires HTTPS or localhost"
**Solution**: Use `npm run start:camera` instead of `npm start`

### "Camera permission denied"
**Solutions**:
- Click "Allow" when browser prompts for camera permission
- Check browser site settings (chrome://settings/content/camera)
- Make sure no other app is using the camera
- Try refreshing the page

### "Camera scanning is not supported in your browser"
**Solutions**:
- Use Chrome or Edge browser (recommended)
- Update your browser to the latest version
- Try on a mobile device instead

### Certificate Error Won't Go Away
**Solution**: Generate trusted certificates with mkcert:
```bash
# Install mkcert (macOS)
brew install mkcert
mkcert -install

# Generate certificates
mkcert localhost 127.0.0.1 ::1

# Use with Angular (create custom script)
ng serve --ssl --ssl-cert localhost+2.pem --ssl-key localhost+2-key.pem
```

## Mobile Device Testing

If you prefer testing on actual mobile devices:

```bash
# 1. Build the web assets
npm run build

# 2. Sync to native projects
npx cap sync

# 3. Open in native IDE
npx cap open ios      # for iOS
npx cap open android  # for Android
```

## Environment URLs

| Environment | URL | Camera Support |
|-------------|-----|----------------|
| Development (HTTP) | http://localhost:8100 | ❌ No |
| Development (HTTPS) | https://localhost:8100 | ✅ Yes |
| Mobile (iOS/Android) | Native app | ✅ Yes |
| Production | Your domain with HTTPS | ✅ Yes |

## Important Notes

1. **Always use HTTPS** for camera features in web browsers
2. **localhost is special** - browsers allow camera on localhost even without valid SSL
3. **Self-signed certificates** are fine for development
4. **Production** should use proper SSL certificates (Let's Encrypt, etc.)
5. **Camera permissions** persist per browser/site - you only need to grant once

## Next Steps

- ✅ Start development server with: `npm run start:camera`
- ✅ Test camera scanning on the new-product page
- ✅ Verify barcode lookup integration
- ✅ Test on different browsers
- ✅ Deploy to mobile for final testing

## Additional Resources

- [CAMERA_SCANNING_SETUP.md](./CAMERA_SCANNING_SETUP.md) - Complete setup guide
- [Capacitor ML Kit Plugin](https://github.com/capawesome-team/capacitor-mlkit)
- [Angular CLI SSL Options](https://angular.io/cli/serve)
