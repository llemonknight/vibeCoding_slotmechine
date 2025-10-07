import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ❗️ 請確保這裡的名稱與你的 GitHub 儲存庫名稱完全相同
  base: '/vibeCoding_slotmechine/',
})
