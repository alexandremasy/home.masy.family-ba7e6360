import { Link, useLocation } from "@tanstack/react-router";
import { ThemeToggle } from "./ThemeToggle";
import { RoomIcon } from "./RoomIcon";
import { Car, Wifi, Zap, ChevronDown, MoreHorizontal, Settings, Wrench, ExternalLink, Home } from "lucide-react";
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
  { to: "/room/escalier", label: "Escalier", icon: <RoomIcon icon={"footprints" as Room["icon"]} className="h-3.5 w-3.5" /> },
];

const domains: NavItem[] = [
  { to: "/tesla", label: "Bernard", icon: <Car className="h-3.5 w-3.5" /> },
  { to: "/reseau", label: "Réseau", icon: <Wifi className="h-3.5 w-3.5" /> },
  { to: "/energie", label: "Énergie", icon: <Zap className="h-3.5 w-3.5" /> },
];

type ExternalItem = { href: string; label: string; icon: ReactNode };

const externals: ExternalItem[] = [
  { href: "https://example.com/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  { href: "https://example.com/dev-tools", label: "Dev tools", icon: <Wrench className="h-4 w-4" /> },
];

export function TopNav() {
  const { pathname } = useLocation();
  const activeRoom = rooms.find((r) => pathname.startsWith(r.to));

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
          {/* Pièces — grouped in a dropdown to declutter */}
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

          {/* Domaines — always visible pills */}
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

        <div className="flex items-center gap-2">
          {/* "Plus" — outils externes */}
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

      {/* Mobile : pièces dans un select-like, domaines en pills */}
      <div className="md:hidden">
        <nav className="flex gap-1 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
        </nav>
      </div>
    </header>
  );
}
