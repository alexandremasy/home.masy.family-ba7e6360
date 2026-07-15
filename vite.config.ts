// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    // [ensure-proxied] Auto-injected at container boot. Lovable regenerates this
    // file and strips this block; source of truth is scripts/ensure-proxied.mjs.
    // Serves mockup.masy.family behind Traefik: accept the host + route HMR wss:443.
    ...(process.env.VITE_PROXIED
      ? {
          server: {
            allowedHosts: ["mockup.masy.family"],
            hmr: { protocol: "wss", clientPort: 443 },
          },
        }
      : {}),
    plugins: [mcpPlugin()],
  },
});
