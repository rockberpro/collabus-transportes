import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.collabus',
  appName: 'Collabus',
  webDir: '.output/public',
  server: {
    url: 'http://<ip-address>:3000',
    cleartext: true
  }
};

export default config;
