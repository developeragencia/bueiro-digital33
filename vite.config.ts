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
  optimizeDeps: {
    include: [
      '@supabase/supabase-js',
      '@tanstack/react-query',
      '@tanstack/react-table',
      'react-router-dom',
      'recharts',
    ],
  },
  server: {
    port: 3101,
    host: true
  },
  preview: {
    port: 4173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-label', '@radix-ui/react-slot', '@radix-ui/react-switch']
        }
      }
    }
  },
});