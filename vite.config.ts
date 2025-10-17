import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    assetsDir: 'assets', // Esto asegura que los activos estén bien organizados
  },
  plugins: [react()],
});
