import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This section forces Vite to pre-bundle the 'konva' package,
  // which correctly resolves the module format issues that were causing the build errors.
  optimizeDeps: {
    include: ['konva'],
  },
  server: {
    port: 5173
  }
})

