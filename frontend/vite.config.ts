import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173, // Changed to port 5173 to avoid conflict
    strictPort: true,
    host: true, // Allow access from all network interfaces
    open: true, // Automatically open browser
    cors: true, // Enable CORS
    hmr: {
      overlay: true, // Show error overlay in the browser
    },
  },
  preview: {
    port: 5173, // Changed to port 5173 to avoid conflict
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
});
