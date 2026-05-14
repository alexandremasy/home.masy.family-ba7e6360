import { Link, useLocation } from "@tanstack/react-router";
import { ThemeToggle } from "./ThemeToggle";

const rooms = [
  { to: "/room/buanderie", label: "Buanderie" },
  { to: "/room/cuisine", label: "Cuisine" },
  { to: "/room/salon", label: "Salon" },
  { to: "/room/escalier", label: "Escalier" },
  { to: "/room/bureau", label: "Bureau" },
  { to: "/room/chambre", label: "Chambre" },
] as const;

const domains = [
  { to: "/tesla", label: "Tesla" },
  { to: "/reseau", label: "Réseau" },
  { to: "/energie", label: "Énergie" },
] as const;

export function TopNav() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary">
            <span className="font-serif text-lg leading-none">m</span>
          </span>
          <span className="font-serif text-lg tracking-tight">Maison</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {[...rooms, ...domains].map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  "rounded-full px-3 py-1.5 text-sm transition-colors " +
                  (active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <ThemeToggle />
      </div>

      {/* Mobile horizontal scroller */}
      <div className="md:hidden">
        <nav className="flex gap-1 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[...rooms, ...domains].map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  "shrink-0 rounded-full px-3 py-1.5 text-xs transition-colors " +
                  (active ? "bg-foreground text-background" : "bg-secondary text-muted-foreground")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
