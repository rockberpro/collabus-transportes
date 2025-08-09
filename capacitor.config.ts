import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.collabus',
  appName: 'Collabus',
  webDir: 'dist',
  server: {
    url: 'http://10.0.2.2:3000',
    cleartext: true
  }
};

export default config;
