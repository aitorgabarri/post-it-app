import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tuapp.posit',
  appName: 'Post-it',
  webDir: 'out',
  server: {
    url: 'https://post-it-app-topaz.vercel.app',
    cleartext: true,
    androidScheme: 'https'
  },
  // ✅ AÑADIMOS ESTO: Sin este bloque, las notificaciones locales no despiertan a la APK
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#00d1ff",
      sound: "beep.wav",
    },
    // También configuramos la cámara para que sea más agresiva
    Camera: {
      permissions: ["camera", "photos"]
    }
  }
};

export default config;