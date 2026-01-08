import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/NAMA_REPOSITORY/", // <-- Tambahkan ini (sesuai nama repo, pakai tanda slash)
})