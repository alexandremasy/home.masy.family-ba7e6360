import { Link, useLocation } from "@tanstack/react-router";
import { ThemeToggle } from "./ThemeToggle";
import { RoomIcon } from "./RoomIcon";
import { Car, Wifi, Zap } from "lucide-react";
import type { ReactNode } from "react";
import type { Room } from "@/lib/mock-data";

type NavItem = { to: string; label: string; icon: ReactNode };

const rooms: NavItem[] = [
  { to: "/room/salon", label: "Salon", icon: <RoomIcon icon={"sofa" as Room["icon"]} className="h-3.5 w-3.5" /> },
  { to: "/room/bureau", label: "Bureau", icon: <RoomIcon icon={"briefcase" as Room["icon"]} className="h-3.5 w-3.5" /> },
  { to: "/room/cuisine", label: "Cuisine", icon: <RoomIcon icon={"utensils" as Room["icon"]} className="h-3.5 w-3.5" /> },
  { to: "/room/chambre", label: "Chambre", icon: <RoomIcon icon={"bed" as Room["icon"]} className="h-3.5 w-3.5" /> },
  { to: "/room/escalier", label: "Escalier", icon: <RoomIcon icon={"footprints" as Room["icon"]} className="h-3.5 w-3.5" /> },
];

const domains: NavItem[] = [
  { to: "/tesla", label: "Tesla", icon: <Car className="h-3.5 w-3.5" /> },
  { to: "/reseau", label: "Réseau", icon: <Wifi className="h-3.5 w-3.5" /> },
  { to: "/energie", label: "Énergie", icon: <Zap className="h-3.5 w-3.5" /> },
];

const all = [...rooms, ...domains];

export function TopNav() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2 text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
            <span className="font-serif text-lg leading-none">m</span>
          </span>
          <span className="font-serif text-lg tracking-tight">Maison</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {all.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors " +
                  (active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground")
                }
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <ThemeToggle />
      </div>

      <div className="md:hidden">
        <nav className="flex gap-1 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {all.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors " +
                  (active ? "bg-foreground text-background" : "bg-secondary text-muted-foreground")
                }
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
