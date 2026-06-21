import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, Home, Wallet, Newspaper, Radar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const modes = [
  { key: "maison", label: "Maison", icon: Home, to: "/" as const },
  { key: "budget", label: "Budget", icon: Wallet, to: "/budget" as const },
];

const upcoming = [
  { key: "medias", label: "Médias", icon: Newspaper },
  { key: "veille", label: "Veille", icon: Radar },
];

export function ModeSwitcher() {
  const { pathname } = useLocation();
  const current = pathname.startsWith("/budget") ? modes[1] : modes[0];
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-2 rounded-full pl-1 pr-3 py-1 text-foreground outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="font-serif text-lg tracking-tight">{current.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Modes
        </DropdownMenuLabel>
        {modes.map((m) => {
          const I = m.icon;
          const active = m.key === current.key;
          return (
            <DropdownMenuItem key={m.key} asChild>
              <Link
                to={m.to}
                className={
                  "flex items-center gap-2.5 " +
                  (active ? "bg-secondary/80 font-medium" : "")
                }
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary">
                  <I className="h-3 w-3" />
                </span>
                <span className="flex-1">{m.label}</span>
                {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Bientôt
        </DropdownMenuLabel>
        {upcoming.map((m) => {
          const I = m.icon;
          return (
            <div
              key={m.key}
              aria-disabled
              className="flex cursor-not-allowed items-center gap-2.5 px-2 py-1.5 text-sm text-muted-foreground/60"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-muted-foreground/60">
                <I className="h-3 w-3" />
              </span>
              <span className="flex-1">{m.label}</span>
              <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[9px] uppercase tracking-wider">Bientôt</span>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
