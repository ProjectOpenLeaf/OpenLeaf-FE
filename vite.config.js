import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

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
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '../OpenLeaf-API-Gateway/certs/frontend.key')),
      cert: fs.readFileSync(path.resolve(__dirname, '../OpenLeaf-API-Gateway/certs/frontend.crt')),
    },
    port: 5173,
    host: 'localhost'
  }
})