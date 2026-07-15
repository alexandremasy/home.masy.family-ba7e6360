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

// Courses lives here, not in the TopNav — it is derived from the plan, so it
// belongs to the Repas module rather than being a domain of its own.
const tabs = [
  { to: "/repas/planification", label: "Planification", icon: CalendarRange },
  { to: "/repas/plats",         label: "Plats",         icon: UtensilsCrossed },
  { to: "/repas/courses",       label: "Courses",       icon: ShoppingBasket },
];

function RepasLayout() {
  const { pathname } = useLocation();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repas"
        subtitle="Fenêtre glissante de ~10 jours, cohérence évaluée sur 2 semaines."
        variant="page"
      />

      <nav className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className={
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors " +
                (active
                  ? "bg-foreground text-background"
                  : "border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground")
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
