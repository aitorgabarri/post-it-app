import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tuapp.posit',
  appName: 'posit-app',
  webDir: 'out',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false, // Evita que se quite antes de tiempo
      backgroundColor: "#ffffffff"
    }
  }
};

export default config;