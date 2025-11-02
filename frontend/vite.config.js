import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // optional: set dev server port
    open: true, // optional: auto-open browser
    // this makes refresh on routes like /work work correctly
    historyApiFallback: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
