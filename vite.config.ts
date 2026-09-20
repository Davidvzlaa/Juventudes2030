import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from "vite"
import { nodePolyfills } from "vite-plugin-node-polyfills" // <-- 1. Importación agregada

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    // <-- 2. Plugin configurado para inyectar Buffer globalmente
    nodePolyfills({
      globals: {
        Buffer: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})