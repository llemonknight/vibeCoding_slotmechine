// vite.config.ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // 加載 .env 文件中的環境變數
    // '.' 表示在當前目錄查找 .env 文件
    // '' 表示加載所有前綴的變數
    const env = loadEnv(mode, '.', '');

    return {
      // *** 重要：為 GitHub Pages 設定基礎路徑 ***
      // 你的 repository 名稱是 vibeCoding_slotmechine，
      // 所以 GitHub Pages 會將你的網站部署在 https://<username>.github.io/vibeCoding_slotmechine/
      // 因此，你需要告訴 Vite 所有資源的路徑都應該基於這個子目錄。
      base: '/vibeCoding_slotmechine/',

      // 開發伺服器設定
      server: {
        port: 3000, // 開發伺服器使用的端口
        host: '0.0.0.0', // 允許從外部訪問開發伺服器
      },

      // Vite 外掛
      plugins: [react()], // 使用 React 外掛

      // 全域變數定義
      // 允許在代碼中使用 process.env.GEMINI_API_KEY
      define: {
        // 'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY), // 如果你實際上用到了 API_KEY 這個名字
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY) // 確保這裡的變數名稱與 .env 文件中的一致
      },

      // 路徑解析設定
      resolve: {
        alias: {
          // 設定別名，方便在代碼中引入模塊
          // 例如：import MyComponent from '@/components/MyComponent'
          '@': path.resolve(__dirname, '.'), // 將 '@' 指向專案根目錄
        }
      }
    };
});
