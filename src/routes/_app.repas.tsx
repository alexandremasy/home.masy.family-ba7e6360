import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <div className="space-y-6">
      <PageHeader
        title="Repas"
        subtitle="Fenêtre glissante de ~10 jours, cohérence évaluée sur 2 semaines."
        variant="page"
      />

      <Tabs value={current} onValueChange={(to) => navigate({ to })}>
        <TabsList className="h-10 bg-secondary/70 p-1">
          {tabs.map((t) => (
            <TabsTrigger key={t.to} value={t.to} className="px-4">{t.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Outlet />
    </div>
  );
}
