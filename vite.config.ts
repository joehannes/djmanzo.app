import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 900,
    // The Signal Path is the site; the first iteration, the island, stays at /island/.
    rollupOptions: { input: { signal: "index.html", island: "island/index.html" } },
  },
  server: {
    proxy: Object.fromEntries(["/api", "/auth", "/login", "/callback", "/licence", "/renew", "/signout"].map((p) => [p, "http://127.0.0.1:8787"])),
  },
});
