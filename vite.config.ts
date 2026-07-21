import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command }) => ({
  plugins: [
    // Per-route code-splitting ONLY in the production build; off in dev so navigating
    // never lazy-loads a chunk (mirrors the cockpit).
    TanStackRouterVite({ autoCodeSplitting: command === "build" }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  build: { outDir: "dist" },
  server: {
    host: true,
    // When served behind Traefik (dev container sets VITE_PROXIED), accept the public
    // host and route HMR over wss:443. Baked into source now that Lovable no longer
    // regenerates this file (retires scripts/ensure-proxied.mjs).
    allowedHosts: process.env.VITE_PROXIED ? ["mockup.dev.masy.family"] : undefined,
    hmr: process.env.VITE_PROXIED ? { protocol: "wss", clientPort: 443 } : undefined,
    warmup: { clientFiles: ["./src/routes/**/*.tsx"] },
  },
}));
