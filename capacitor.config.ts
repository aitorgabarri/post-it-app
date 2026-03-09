import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tuapp.posit',
  appName: 'Post-it',
  webDir: 'out',
  server: {
    // ✅ Quitamos la barra '/' del final para evitar errores de ruta
    url: 'https://post-it-app-topaz.vercel.app', 
    cleartext: true,
    // 💡 Añadimos esto para que no intente cargar archivos locales si falla la red
    androidScheme: 'https'
  }
};

export default config;