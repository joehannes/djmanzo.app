import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 900,
    // The professional site (version 4) is the site at /; the earlier ones stay: the Signal Path at
    // /signal/, the record shop at /shop/, the island at /island/.
    rollupOptions: { input: { site: "index.html", signal: "signal/index.html", island: "island/index.html", shop: "shop/index.html" } },
  },
  server: {
    proxy: Object.fromEntries(["/api", "/auth", "/login", "/callback", "/licence", "/renew", "/signout"].map((p) => [p, "http://127.0.0.1:8787"])),
  },
});
