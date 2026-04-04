import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — carga primero, es pequeño (~40KB gzip)
          'react-core': ['react', 'react-dom', 'react-router-dom'],
          // Firebase Auth — solo lo necesario para login
          'firebase-auth': ['firebase/app', 'firebase/auth'],
          // Firebase Firestore — carga después
          'firebase-db': ['firebase/firestore'],
          // Recharts — solo lo usa el Dashboard, carga lazy
          'recharts': ['recharts'],
        }
      }
    }
  }
})
