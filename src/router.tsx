import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Prefetch a route on intent (hover/touch-start) so it's warm on navigate.
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
  });

  return router;
};
