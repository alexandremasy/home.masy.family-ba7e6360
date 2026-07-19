import type { Preview } from "@storybook/react-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
// The living design system renders the real tokens: import the app's Tailwind v4 stylesheet
// into the preview iframe so every story shows correct colors/type/radius/motion.
import "../src/styles.css";

const preview: Preview = {
  parameters: {
    layout: "centered",
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
