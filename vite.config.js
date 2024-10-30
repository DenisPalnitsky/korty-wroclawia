import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "", // Set base to an empty string for root deployment
  plugins: [react()],
});
