import type { Preview } from "@storybook/react-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
import { DocsContainer, type DocsContainerProps } from "@storybook/addon-docs/blocks";
import { useEffect, useState, type ReactNode } from "react";
// The living design system renders the real tokens: import the app's Tailwind v4 stylesheet
// into the preview iframe so every story shows correct colors/type/radius/motion.
import "../src/styles.css";

/**
 * A decorator only wraps STORIES, so a standalone MDX page (every Foundations page)
 * never saw the theme class and the toolbar toggle did nothing on it. The docs
 * container is the one wrapper those pages do go through, so the class goes here.
 *
 * It reads the global off the docs context and follows it through the channel —
 * Storybook's own `useGlobals` is a preview hook, legal only inside decorators and
 * story functions, and throws here.
 */
function ThemedDocsContainer({
  children,
  context,
  ...rest
}: DocsContainerProps & { children: ReactNode }) {
  const read = () => {
    const globals = (
      context as unknown as { store?: { userGlobals?: { globals?: Record<string, string> } } }
    ).store?.userGlobals?.globals;
    return globals?.theme === "dark";
  };
  const [dark, setDark] = useState(read);

  useEffect(() => {
    type Channel = {
      on: (event: string, cb: () => void) => void;
      off: (event: string, cb: () => void) => void;
    };
    const channel = (context as unknown as { channel?: Channel }).channel;
    if (!channel) return;
    const update = () => setDark(read());
    channel.on("globalsUpdated", update);
    return () => channel.off("globalsUpdated", update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  // The class goes on the document, not on a wrapper: wrapping DocsContainer in a
  // div cuts it off from its emotion ThemeProvider and every doc block throws.
  // It also means the tokens resolve for the whole page, which is what the live
  // specimens read.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <DocsContainer context={context} {...rest}>
      {children}
    </DocsContainer>
  );
}

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
      container: ThemedDocsContainer,
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
  // Toggle the `.dark` class on the story wrapper — the mockup's dark mode is
  // @custom-variant dark. Docs pages get it from ThemedDocsContainer above.
  decorators: [
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
  ],
};

export default preview;
