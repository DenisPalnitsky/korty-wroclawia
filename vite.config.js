import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import ViteYaml from '@modyfi/vite-plugin-yaml';
import process from 'process';

// https://vitejs.dev/config/
export default defineConfig(({ mode })=>{  
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: "/", // Set base to the repository name for GitHub Pages
    plugins: [react(), ViteYaml()],  
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),    
      GOOGLE_MAPS_API_KEY: JSON.stringify(env.GOOGLE_MAPS_API_KEY),
      GA_TRACKING_ID: JSON.stringify(env.GA_TRACKING_ID),  
    },
  }
});
