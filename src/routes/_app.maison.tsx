import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { UtensilsCrossed, ShoppingBasket } from "lucide-react";

export const Route = createFileRoute("/_app/maison")({
  component: MaisonLayout,
  head: () => ({
    meta: [
      { title: "Maison — Repas, courses, anniversaires" },
      { name: "description", content: "Les routines de la maison : planification des repas, liste de courses, studio d'anniversaires." },
    ],
  }),
});

// Anniversaires is not a tab here — it's reachable from the Maison nav in the TopNav.
const tabs = [
  { to: "/maison/repas",   label: "Repas",   icon: UtensilsCrossed },
  { to: "/maison/courses", label: "Courses", icon: ShoppingBasket },
];

function MaisonLayout() {
  const { pathname } = useLocation();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maison"
        subtitle="Les routines qui reviennent chaque semaine et chaque année."
      />

      <nav className="sticky top-24 z-10 -mx-2 flex gap-1.5 overflow-x-auto rounded-full border border-border/60 bg-background/80 p-1 backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className={
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors " +
                (active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground")
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
