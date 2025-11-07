import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'cnc-webapp',
  webDir: 'www',
  server: {
    // Enable HTTPS for camera access in development
    // Note: When using ng serve, you'll need to use --ssl flag
    cleartext: true,
    // Allow camera access from localhost
    hostname: 'localhost',
  },
  plugins: {
    // Enable barcode scanning for web development
    BarcodeScanner: {
      // The web implementation will use the browser's camera API
      // Requires HTTPS or localhost
    }
  }
};

export default config;
