import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Certificate paths
const certKeyPath = path.resolve(__dirname, '../OpenLeaf-API-Gateway/certs/frontend.key');
const certPath = path.resolve(__dirname, '../OpenLeaf-API-Gateway/certs/frontend.crt');

// Determine if we should use HTTPS
// Option 1: Check if certs exist
const certsExist = fs.existsSync(certKeyPath) && fs.existsSync(certPath);

// Option 2: Use environment variable (more explicit control)
const useHttps = process.env.VITE_USE_HTTPS === 'true' && certsExist;

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
    server: {
      // Only use HTTPS in development mode when certificates exist
      ...(mode === 'development' && useHttps && {
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
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
  };
})