import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // ✅ CORREGIDO: Ahora coincide con el "package_name" de tu google-services.json
  appId: 'com.mycompany.posit', 
  appName: 'Post-it',
  webDir: 'out',
  server: {
    url: 'https://post-it-app-topaz.vercel.app',
    cleartext: true,
    androidScheme: 'https'
  },
  // 🔔 CONFIGURACIÓN DE PLUGINS
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#00d1ff",
      sound: "beep.wav",
    },
    // Configuración de permisos para que la cámara no dé guerra
    Camera: {
      permissions: ["camera", "photos"]
    }
  }
};

export default config;