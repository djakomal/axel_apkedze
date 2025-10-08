import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tagger from "@dhiwise/component-tagger";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: "build",
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      external: ['@rollup/rollup-linux-x64-gnu'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  plugins: [tsconfigPaths(), react(), tagger()],
  server: {
    port: 4028,
    host: "0.0.0.0",
    // Allow Vite to fallback to a free port if 4028 is busy
    strictPort: false,
    allowedHosts: ['localhost', '127.0.0.1', '.local', '.amazonaws.com', '.builtwithrocket.new']
  },
  resolve: {
    alias: {
      'components': resolve(__dirname, './src/components'),
      'pages': resolve(__dirname, './src/pages'),
    }
  }
});