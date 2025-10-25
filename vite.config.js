import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5175,
    strictPort: true, // 🔒 Prevents auto-switching to another port
  },
  plugins: [react()],
})
