import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const config = {
    plugins: [react()],
    // server: {
    //   proxy: {
    //     '/avalon/game': {
    //       target: 'ws://localhost:8080', // Back-end server
    //       changeOrigin: true,           // Modify the origin header to match the target
    //       ws: true,                     // Enable WebSocket proxying
    //     },
    //   },
    // },
    server: { //all networks for nginx, curl
      host: '0.0.0.0',
      port: 5173,
    },
  };

  if (mode === "development") {
    config.define = {
      global: {}, // Fixes the "global is not defined" error in development
    };
  }

  return config;
});