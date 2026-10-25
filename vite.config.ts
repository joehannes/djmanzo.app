import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 900,
    // One site since 25 October: the island, the Signal Path and the record shop are gone, their
    // addresses sent here by the Worker (`worker/index.ts`).
    rollupOptions: { input: { site: "index.html" } },
  },
  server: {
    proxy: Object.fromEntries(["/api", "/auth", "/login", "/callback", "/licence", "/renew", "/signout"].map((p) => [p, "http://127.0.0.1:8787"])),
  },
});
