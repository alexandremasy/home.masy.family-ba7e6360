import { Link, useLocation } from "@tanstack/react-router";
import { ThemeToggle } from "./ThemeToggle";
import { RoomIcon } from "./RoomIcon";
import { ModeSwitcher } from "./ModeSwitcher";
import { Car, Wifi, Zap, ChevronDown, MoreHorizontal, Settings, Wrench, ExternalLink, Home, LayoutDashboard, CalendarRange, Table2, FileUp, ShieldCheck, UtensilsCrossed, Cake, DoorClosed, Activity } from "lucide-react";
import type { ReactNode } from "react";
import type { Room } from "@/lib/mock-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = { to: string; label: string; icon: ReactNode };

const rooms: NavItem[] = [
  { to: "/room/salon", label: "Salon", icon: <RoomIcon icon={"sofa" as Room["icon"]} className="h-3.5 w-3.5" /> },
  { to: "/room/bureau", label: "Bureau", icon: <RoomIcon icon={"briefcase" as Room["icon"]} className="h-3.5 w-3.5" /> },
  { to: "/room/cuisine", label: "Cuisine", icon: <RoomIcon icon={"utensils" as Room["icon"]} className="h-3.5 w-3.5" /> },
  { to: "/room/chambre", label: "Chambre", icon: <RoomIcon icon={"bed" as Room["icon"]} className="h-3.5 w-3.5" /> },
  { to: "/room/buanderie", label: "Buanderie", icon: <RoomIcon icon={"washing-machine" as Room["icon"]} className="h-3.5 w-3.5" /> },
  { to: "/room/escalier", label: "Escalier", icon: <RoomIcon icon={"footprints" as Room["icon"]} className="h-3.5 w-3.5" /> },
];

// The Maison mode's own domains. Sécurité is NOT here — it's a mode of its own.
const domains: NavItem[] = [
  { to: "/maison/repas", label: "Repas", icon: <UtensilsCrossed className="h-3.5 w-3.5" /> },
  { to: "/maison/anniversaires", label: "Anniversaires", icon: <Cake className="h-3.5 w-3.5" /> },
  { to: "/tesla", label: "Bernard", icon: <Car className="h-3.5 w-3.5" /> },
  { to: "/reseau", label: "Réseau", icon: <Wifi className="h-3.5 w-3.5" /> },
  { to: "/energie", label: "Énergie", icon: <Zap className="h-3.5 w-3.5" /> },
];

const budgetTabs: NavItem[] = [
  { to: "/budget/vue",          label: "Vue d'ensemble", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
  { to: "/budget/transactions", label: "Transactions",   icon: <Table2 className="h-3.5 w-3.5" /> },
  { to: "/budget/planification",label: "Planification",  icon: <CalendarRange className="h-3.5 w-3.5" /> },
  { to: "/budget/import",       label: "Import",         icon: <FileUp className="h-3.5 w-3.5" /> },
];

const securiteTabs: NavItem[] = [
  { to: "/securite/etat",      label: "État",      icon: <ShieldCheck className="h-3.5 w-3.5" /> },
  { to: "/securite/perimetre", label: "Périmètre", icon: <DoorClosed className="h-3.5 w-3.5" /> },
  { to: "/securite/activite",  label: "Activité",  icon: <Activity className="h-3.5 w-3.5" /> },
];

type ExternalItem = { href: string; label: string; icon: ReactNode };

const externals: ExternalItem[] = [
  { href: "https://example.com/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  { href: "https://example.com/dev-tools", label: "Dev tools", icon: <Wrench className="h-4 w-4" /> },
];

export function TopNav() {
  const { pathname } = useLocation();
  const isBudget = pathname.startsWith("/budget");
  const isSecurite = pathname.startsWith("/securite");
  const activeRoom = rooms.find((r) => pathname.startsWith(r.to));
  // A module with its own world shows its tabs instead of the domain list.
  const items = isBudget ? budgetTabs : isSecurite ? securiteTabs : null;

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <ModeSwitcher />

        {items ? (
          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => {
              const active = pathname === item.to || pathname.startsWith(item.to + "/");
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
        ) : (
          <nav className="hidden items-center gap-1 md:flex">
            <DropdownMenu>
              <DropdownMenuTrigger
                className={
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                  (activeRoom
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground")
                }
              >
                <Home className="h-3.5 w-3.5" />
                {activeRoom ? activeRoom.label : "Pièces"}
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-44">
                <DropdownMenuLabel>Pièces</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {rooms.map((item) => (
                  <DropdownMenuItem key={item.to} asChild>
                    <Link to={item.to} className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {domains.map((item) => {
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
        )}

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Plus d'outils"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuLabel>Outils externes</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {externals.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden">
        <nav className="flex gap-1 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items ? (
            items.map((item) => {
              const active = pathname === item.to || pathname.startsWith(item.to + "/");
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
            })
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors " +
                    (activeRoom ? "bg-foreground text-background" : "bg-secondary text-muted-foreground")
                  }
                >
                  <Home className="h-3 w-3" />
                  {activeRoom ? activeRoom.label : "Pièces"}
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {rooms.map((item) => (
                    <DropdownMenuItem key={item.to} asChild>
                      <Link to={item.to} className="flex items-center gap-2">
                        {item.icon}
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {domains.map((item) => {
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
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
