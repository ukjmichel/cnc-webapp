# Capacitor Setup Guide - Local API Configuration

This guide explains how to configure your CNC WebApp to work with Capacitor (mobile emulation) and connect to your Node.js API running on your local PC.

## 📁 Project Structure

The project has been reorganized with all backend code now located in `src/app/api/`:

```
src/
├── app/
│   ├── api/                    # Backend API code
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # Route definitions
│   │   ├── services/           # External API integrations
│   │   ├── middlewares/        # Authentication/Authorization
│   │   ├── validators/         # Request validation
│   │   └── errors/             # Custom error classes
│   ├── pages/                  # Angular pages
│   ├── services/               # Frontend Angular services
│   ├── models/                 # Data models
│   └── store/                  # NgRx state management
├── environments/               # Environment configurations
└── ...
```

## 🚀 Quick Start

### 1. Find Your Local PC IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**macOS/Linux:**
```bash
ifconfig
# or
ip addr
```
Look for "inet" address (e.g., 192.168.1.100)

### 2. Update Environment Configuration

Edit `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://YOUR_LOCAL_IP:3000/api',  // Replace YOUR_LOCAL_IP with your actual IP
};
```

**Example:**
```typescript
export const environment = {
  production: true,
  apiUrl: 'http://192.168.1.100:3000/api',
};
```

### 3. Start the Backend Server

The backend server is configured to listen on all network interfaces (0.0.0.0):

```bash
# Start server only
npm run server

# Or start server in development mode with auto-reload
npm run server:dev

# Or start both frontend and backend
npm run start:all
```

The server will display:
```
==============================================
  CNC WebApp Backend API
==============================================
  Environment: development
  Host:        0.0.0.0
  Port:        3000
  Server:      http://localhost:3000
  Network:     http://<YOUR_LOCAL_IP>:3000
  Health:      http://localhost:3000/health
  Barcode API: http://localhost:3000/api/barcode
==============================================
  For Capacitor: Replace YOUR_LOCAL_IP in environment.prod.ts
  Find IP: Windows: ipconfig | macOS/Linux: ifconfig
==============================================
```

### 4. Configure Your Firewall

Ensure your firewall allows incoming connections on port 3000:

**Windows:**
```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Node.js Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

**macOS:**
- Go to System Preferences → Security & Privacy → Firewall → Firewall Options
- Add your Node.js application to the allowed list

**Linux (Ubuntu/Debian):**
```bash
sudo ufw allow 3000/tcp
```

## 📱 Capacitor Configuration

### Android

The `capacitor.config.ts` is already configured to allow local network access:

```typescript
const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'cnc-webapp',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    cleartext: true,  // Allows HTTP traffic for local development
  }
};
```

**Additional Android Configuration:**

For Android 9+ (API level 28+), you may need to add a network security configuration.

Create `android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">192.168.0.0/16</domain>
        <domain includeSubdomains="true">10.0.0.0/8</domain>
        <domain includeSubdomains="true">localhost</domain>
    </domain-config>
</network-security-config>
```

Then update `android/app/src/main/AndroidManifest.xml`:

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
```

### iOS

The `capacitor.config.ts` is configured for iOS:

```typescript
server: {
  iosScheme: 'http'
}
```

**Additional iOS Configuration:**

For iOS, you need to allow arbitrary loads for local development.

Update `ios/App/App/Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
    <key>NSAllowsLocalNetworking</key>
    <true/>
</dict>
```

## 🔧 Development Workflow

### Web Browser Development

```bash
# Start both frontend and backend
npm run start:all

# Or separately:
# Terminal 1 - Backend
npm run server:dev

# Terminal 2 - Frontend
npm start
```

Access at: `http://localhost:8100`

The Angular dev server is configured with a proxy (`proxy.conf.json`) that automatically forwards `/api` requests to `http://localhost:3000`.

### Capacitor Development

#### Build and Sync

```bash
# Build the Angular app
npm run build

# Sync with Capacitor
npx cap sync
```

#### Run on Android

```bash
# Open in Android Studio
npx cap open android

# Or run directly
npx cap run android
```

#### Run on iOS

```bash
# Open in Xcode
npx cap open ios

# Or run directly
npx cap run ios
```

## 🌐 CORS Configuration

The backend server (`server/app.ts`) is configured to accept requests from:

- `http://localhost:8100` (Ionic dev server)
- `http://localhost:4200` (Angular dev server)
- `capacitor://localhost` (Capacitor Android)
- `ionic://localhost` (Capacitor iOS)
- Any local network IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
- Requests with no origin (mobile apps)

## 🐛 Troubleshooting

### Issue: Cannot connect to API from emulator

**Solution:**
1. Verify your local IP is correct in `environment.prod.ts`
2. Ensure the backend server is running
3. Check firewall settings
4. Try pinging your PC from your mobile device: `ping YOUR_LOCAL_IP`

### Issue: CORS errors

**Solution:**
- The CORS configuration should handle this automatically
- Verify the origin in browser dev tools matches an allowed pattern
- Check server logs for CORS-related messages

### Issue: Network request failed on Android

**Solution:**
1. Verify `network_security_config.xml` is correctly configured
2. Ensure `AndroidManifest.xml` references the network security config
3. Check that `cleartext: true` is set in `capacitor.config.ts`
4. Rebuild the Android app: `npx cap sync android`

### Issue: iOS cannot connect to local server

**Solution:**
1. Verify `Info.plist` allows arbitrary loads
2. Ensure you're using HTTP (not HTTPS) for local development
3. Check that both devices are on the same network
4. Rebuild the iOS app: `npx cap sync ios`

### Issue: ERR_CLEARTEXT_NOT_PERMITTED

**Solution:**
- This is an Android 9+ security feature
- Ensure you've added the `network_security_config.xml` file
- Verify it's referenced in `AndroidManifest.xml`

## 📝 Environment Variables

Create a `.env` file in the project root for environment-specific configuration:

```env
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
UPCITEMDB_API_KEY=your_api_key_here
```

## 🔒 Security Notes

⚠️ **Important:** The current configuration allows cleartext (HTTP) traffic and permissive CORS settings for development purposes only.

**For Production:**
1. Use HTTPS with proper SSL certificates
2. Restrict CORS to specific production origins
3. Remove `cleartextTrafficPermitted="true"` from Android config
4. Remove `NSAllowsArbitraryLoads` from iOS config
5. Use environment-specific API URLs
6. Implement proper authentication and authorization

## 📚 Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Ionic Framework Documentation](https://ionicframework.com/docs)
- [Angular Documentation](https://angular.io/docs)
- [Network Security Configuration (Android)](https://developer.android.com/training/articles/security-config)
- [App Transport Security (iOS)](https://developer.apple.com/documentation/security/preventing_insecure_network_connections)

## 🆘 Getting Help

If you encounter issues:
1. Check the server logs for errors
2. Check browser/device console for client-side errors
3. Verify network connectivity between devices
4. Ensure all configuration files are properly updated
5. Try rebuilding: `npm run build && npx cap sync`

---

**Last Updated:** 2025-10-31
