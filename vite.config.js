import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/korty-wroclawia/", // Set base to the repository name for GitHub Pages
  plugins: [react()],
});
