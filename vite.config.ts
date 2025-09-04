import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_SEMANTIC_SCHOLAR_API': JSON.stringify(process.env.SEMANTIC_SCHOLAR_API)
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
