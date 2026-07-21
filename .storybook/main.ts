import type { StorybookConfig } from "@storybook/react-vite";
import remarkGfm from "remark-gfm";

const config: StorybookConfig = {
  framework: { name: "@storybook/react-vite", options: {} },
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: [
    {
      // MDX ships without GFM, so a markdown table renders as a row of raw pipes.
      // Every Foundations page uses one. The option belongs to addon-docs — setting
      // it under a top-level `docs` key is silently ignored.
      name: "@storybook/addon-docs",
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: { remarkPlugins: [remarkGfm] },
        },
      },
    },
    "@storybook/addon-links",
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
    "@storybook/addon-mcp",
  ],
  // @storybook/react-vite already merges the project vite.config.ts (Tailwind v4, @/ alias,
  // tsconfigPaths come for free). We only re-assert the proxied handling here, because
  // Storybook overrides Vite's `server`. Served at the root of design.dev.masy.family
  // behind Traefik (no base-path).
  //
  // HMR needs an explicit path. Storybook runs Vite in MIDDLEWARE MODE, so Vite cannot
  // attach its HMR websocket to Storybook's HTTP server — it opens a SEPARATE ws server
  // on its own port (24678). Without `path`, the client dials wss://host:443/ where only
  // Storybook answers, the handshake never completes, and the UI shows "connection lost"
  // with no hot reload. Pinning host/port/path lets the reverse proxy route /vite-hmr to
  // that separate server. Keep in sync with `static/dev-proxy.mirrored.conf` on forge.
  viteFinal: async (cfg) => {
    if (process.env.VITE_PROXIED) {
      cfg.server = {
        ...cfg.server,
        allowedHosts: ["design.dev.masy.family"],
        hmr: {
          protocol: "wss",
          clientPort: 443,
          path: "/vite-hmr",
          port: 24678,
        },
      };
    }
    return cfg;
  },
};

export default config;
