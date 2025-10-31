import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'cnc-webapp',
  webDir: 'www',
  server: {
    // Allow clear text traffic for local development
    // Replace YOUR_LOCAL_IP with your PC's local IP (e.g., 192.168.1.100)
    androidScheme: 'http',
    cleartext: true,
    // Enable for iOS to allow local network access
    iosScheme: 'http'
  },
  plugins: {
    // Capacitor plugins configuration
  }
};

export default config;
