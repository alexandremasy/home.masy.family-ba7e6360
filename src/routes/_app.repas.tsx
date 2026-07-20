import { createFileRoute, Outlet, useLocation, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/tabs";
import { Button } from "@/components/button";
import { DishesProvider } from "@/lib/dishes-store";

export const Route = createFileRoute("/_app/repas")({
  component: RepasLayout,
  head: () => ({
    meta: [
      { title: "Repas — Cockpit" },
      {
        name: "description",
        content:
          "Planifier les repas, gérer le catalogue de plats et la liste de courses qui en découle.",
      },
    ],
  }),
});

// Same segmented control as Énergie's "Vue d'ensemble / Relevés", but each tab is
// its own route (deep-linkable) rather than in-page state — hence Tabs driven by
// the pathname instead of TabsContent.
// Courses lives here, not in the TopNav: it is derived from the plan.
const tabs = [
  { to: "/repas/planification", label: "Planification" },
  { to: "/repas/plats", label: "Plats" },
  { to: "/repas/courses", label: "Courses" },
];

function RepasLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const current = tabs.find((t) => pathname.startsWith(t.to))?.to ?? tabs[0].to;

  return (
    <DishesProvider>
      {/* Full-bleed stage, aligned with Anniversaires: cancel the shell's px so the
          teal wash reaches edge to edge, the inner wrapper re-adds content padding. */}
      <div className="relative -mx-4 pt-16 sm:-mx-6">
        {/* The muted-grey page surface is painted viewport-wide in _app.tsx (scoped
            to repas), so it aligns top-to-bottom. This glow just sits over it. */}
        {/* A single teal blob emanating from the very top, drifting and morphing
            across the top band while shifting hue, then fading down into the muted
            grey (see .repas-glow in styles.css). absolute, not fixed — the
            .mode-enter ancestor keeps a transform, which would trap a fixed layer. */}
        <div
          aria-hidden
          className="repas-glow pointer-events-none absolute inset-x-0 -top-6 -z-10 h-96 sm:-top-10"
        />

        <div className="space-y-6 px-6 sm:px-12">
          {/* Page header — a back affordance to the dashboard, then the serif title. */}
          <div className="space-y-3">
            <Button asChild variant="outline" size="iconRound" className="text-muted-foreground">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Retour au cockpit</span>
              </Link>
            </Button>
            <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">Repas</h1>
          </div>

          {/* Page navigation — each tab is its own route (deep-linkable). */}
          <Tabs value={current} onValueChange={(to) => navigate({ to })}>
            <TabsList className="h-10 bg-secondary/70 p-1">
              {tabs.map((t) => (
                <TabsTrigger key={t.to} value={t.to} className="px-4">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Outlet />
        </div>
      </div>
    </DishesProvider>
  );
}
