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
  // Storybook overrides Vite's `server`. Served at the root of design.masy.family behind
  // Traefik (no base-path).
  viteFinal: async (cfg) => {
    if (process.env.VITE_PROXIED) {
      cfg.server = {
        ...cfg.server,
        allowedHosts: ["design.masy.family"],
        hmr: { protocol: "wss", clientPort: 443 },
      };
    }
    return cfg;
  },
};

export default config;
