import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // Asegura que Vite sepa dónde está public
  build: {
    assetsDir: 'assets',
    copyPublicDir: true, // CRÍTICO: Copia el contenido de /public al build
    outDir: 'dist' // Asegura que el output sea correcto
  }
});