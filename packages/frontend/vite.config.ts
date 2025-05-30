import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import checker from "vite-plugin-checker";

// https://vite.dev/config/
export default {
    plugins: [react()],
    server: {
      proxy: {
        "/api": "http://localhost:3000",
      },
    },
  };
  
