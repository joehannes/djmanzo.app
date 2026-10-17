import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 900,
    // The island (live) and the Signal Path (the second iteration, at /signal/).
    rollupOptions: { input: { island: "index.html", signal: "signal/index.html" } },
  },
  server: { proxy: { "/api": "http://127.0.0.1:8787", "/auth": "http://127.0.0.1:8787" } },
});
