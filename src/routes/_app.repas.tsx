import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DishesProvider } from "@/lib/dishes-store";

export const Route = createFileRoute("/_app/repas")({
  component: RepasLayout,
  head: () => ({
    meta: [
      { title: "Repas — Cockpit" },
      { name: "description", content: "Planifier les repas, gérer le catalogue de plats et la liste de courses qui en découle." },
    ],
  }),
});

// Same segmented control as Énergie's "Vue d'ensemble / Relevés", but each tab is
// its own route (deep-linkable) rather than in-page state — hence Tabs driven by
// the pathname instead of TabsContent.
// Courses lives here, not in the TopNav: it is derived from the plan.
const tabs = [
  { to: "/repas/planification", label: "Planification" },
  { to: "/repas/plats",         label: "Plats" },
  { to: "/repas/courses",       label: "Courses" },
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
        {/* A soft teal glow anchored top-left, reaching a touch toward the top-right
            corner, breathing slowly. Fades out by the end of the tabs (h-60 ≈ title +
            nav). absolute, not fixed — the .mode-enter ancestor keeps a transform,
            which would trap a fixed layer. See .repas-glow in styles.css. */}
        <div
          aria-hidden
          className="repas-glow pointer-events-none absolute inset-x-0 -top-6 -z-10 h-72 sm:-top-10"
        />

        <div className="space-y-6 px-6 sm:px-12">
          {/* Page header — serif title over the wash, no sticky glass bar. */}
          <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">Repas</h1>

          {/* Page navigation — each tab is its own route (deep-linkable). */}
          <Tabs value={current} onValueChange={(to) => navigate({ to })}>
            <TabsList className="h-10 bg-secondary/70 p-1">
              {tabs.map((t) => (
                <TabsTrigger key={t.to} value={t.to} className="px-4">{t.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Outlet />
        </div>
      </div>
    </DishesProvider>
  );
}
