import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import ViteYaml from '@modyfi/vite-plugin-yaml';

// https://vitejs.dev/config/
export default defineConfig({
  base: "/", // Set base to the repository name for GitHub Pages
  plugins: [react(), ViteYaml()],
});
