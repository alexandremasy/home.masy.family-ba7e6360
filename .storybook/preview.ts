import type { Preview } from "@storybook/react-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
// The living design system renders the real tokens: import the app's Tailwind v4 stylesheet
// into the preview iframe so every story shows correct colors/type/radius/motion.
import "../src/styles.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
    // Read top-down: what the system is, then what it is made of, then what it
    // assembles into, and the module specs last.
    options: {
      storySort: {
        order: [
          "Overview",
          "Foundations",
          "Iconography",
          "Layout",
          "Forms",
          "Overlays",
          "Navigation",
          "Information",
          "Specs",
          "*",
        ],
      },
    },
    // The first story of every Docs page renders in an interactive canvas with its
    // controls right under it, so the page opens on something you can drive rather
    // than a static screenshot.
    docs: {
      canvas: { sourceState: "shown" },
      controls: { sort: "requiredFirst" },
    },
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: "todo" },
    backgrounds: { disable: true },
    viewport: {
      options: {
        phone: { name: "Phone", styles: { width: "390px", height: "844px" } },
        tablet: { name: "Tablet", styles: { width: "834px", height: "1112px" } },
        desktop: { name: "Desktop", styles: { width: "1280px", height: "900px" } },
      },
    },
  },
  // Toggle the `.dark` class on <html> — the mockup's dark mode is @custom-variant dark.
  decorators: [
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
