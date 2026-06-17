import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// SPA with client-side routing (react-router). appType 'spa' (default) gives
// history fallback so /admin works on refresh in dev & preview.
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
})
