import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      external: ['@emotion/react/jsx-runtime'],
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    include: [
      '@emotion/react', 
      '@emotion/styled', 
      '@mui/material', 
      'react-quill',
      '@mui/icons-material'
    ],
    exclude: ['@emotion/react/jsx-runtime']
  }
});
