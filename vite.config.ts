import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'ui-vendor': ['framer-motion', 'lucide-react'],
              'ai-services': [
                './services/multiProviderAiService.ts',
                './services/geminiService.ts',
                './services/aiOrchestrator.ts'
              ],
              'utils': [
                './utils/followUpEngine.ts',
                './utils/guidanceUtils.ts',
                './utils/criticalFindingsDetector.ts'
              ]
            }
          }
        },
        chunkSizeWarningLimit: 600
      }
    };
});
