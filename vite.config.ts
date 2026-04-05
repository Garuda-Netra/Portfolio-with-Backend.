import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        adminLogin: resolve(__dirname, 'admin/index.html'),
        adminDashboard: resolve(__dirname, 'admin/dashboard.html')
      }
    },
    minify: 'terser',
    sourcemap: false
  },
  server: { port: 3000 }
});