import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'BagelsOnly',
  webDir: 'www',
  // --- CONFIGURACIÓN DE PLUGINS PARA LA PANTALLA DE CARGA ---
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,         // Se muestra por 2 segundos
      launchAutoHide: true,             // Se oculta automáticamente al terminar el tiempo
      launchFadeOutDuration: 500,       // Efecto de desvanecimiento suave al entrar al Login
      backgroundColor: "#368dc7",       // TU AZUL CLARO (neon-green)
      androidSplashResourceName: "splash",
      showSpinner: false,               // Desactivamos el círculo de carga nativo para un look más limpio
      androidScaleType: "CENTER_CROP",  // Asegura que el logo no se estire
      splashFullScreen: true,           // Fuerza el modo pantalla completa
      splashImmersive: true             // Oculta barras de estado durante la carga
    },
  },
};

export default config;