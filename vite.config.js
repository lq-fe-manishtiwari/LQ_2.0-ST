import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['@apollo/client', '@apollo/client/react', '@apollo/client/core'],
  },
  server: {
    port: 9097,
    host: true,
  },
})