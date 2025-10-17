import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    assetsDir: 'assets',
    outDir: 'dist',
    emptyOutDir: true
  }
});