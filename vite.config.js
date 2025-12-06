import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Certificate paths
const certKeyPath = path.resolve(__dirname, '../OpenLeaf-API-Gateway/certs/frontend.key');
const certPath = path.resolve(__dirname, '../OpenLeaf-API-Gateway/certs/frontend.crt');

// Check if certificates exist (only for local development)
const certsExist = fs.existsSync(certKeyPath) && fs.existsSync(certPath);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    // Only use HTTPS if certificates exist (local development)
    ...(certsExist && {
      https: {
        key: fs.readFileSync(certKeyPath),
        cert: fs.readFileSync(certPath),
      },
    }),
    port: 5173,
    host: 'localhost'
  },
  // Production build configuration
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
})