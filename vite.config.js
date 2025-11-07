import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/_services': path.resolve(__dirname, './src/_services'),
      '@/_helpers': path.resolve(__dirname, './src/_helpers'),
      '@/_assets': path.resolve(__dirname, './src/_assets'),
      // Add this line:
      '@/Redux': path.resolve(__dirname, './src/Redux'),
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