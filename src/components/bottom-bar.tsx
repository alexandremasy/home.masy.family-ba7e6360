import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { MoreHorizontal, ChevronsUpDown } from "lucide-react";
import { MobileMenuSheet } from "@/components/mobile-menu-sheet";
import { currentMode } from "@/lib/modes";
import { navForMode, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";

// Sections shown alongside the Gustave button; the rest spill into a "Plus"
// overflow menu.
const CAPACITY = 4;

// A tab sits above the gliding pill (z-10) and is itself rounded so its tap
// target follows the bar's corners.
const tabBase =
  "relative z-10 flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md py-2 text-2xs font-medium transition-colors";

function TabLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link to={item.to} className={cn(tabBase, active ? "text-primary" : "text-muted-foreground")}>
      <Icon className="size-5 shrink-0" />
      <span className="max-w-full truncate px-0.5 leading-none">{item.label}</span>
    </Link>
  );
}

function DropdownTab({
  icon: Icon,
  label,
  active,
  children,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          tabBase,
          "data-[state=open]:text-foreground",
          active ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Icon className="size-5 shrink-0" />
        <span className="max-w-full truncate px-0.5 leading-none">{label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="center" sideOffset={14} className="min-w-48">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The mobile navigation: a floating, glass bar detached from the edge with softly
 * rounded corners, and an active indicator that glides between slots — a native
 * feel rather than a web bar bolted to the bottom. The Gustave button switches
 * modes and reaches tools; the rest are the current mode's sections. Hidden at
 * `md` and up, where the desktop rail takes over.
 */
export function BottomBar() {
  const { pathname } = useLocation();
  const current = currentMode(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  const links = navForMode(current.key);
  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  const fits = links.length <= CAPACITY;
  const visibleLinks = fits ? links : links.slice(0, CAPACITY - 1);
  const overflowLinks = fits ? [] : links.slice(CAPACITY - 1);
  const overflowActive = overflowLinks.some((l) => isActive(l.to));

  // Slots in DOM order — the pill glides to the active one. Gustave never counts
  // as active; the home route ("/") leaves no section active, so the pill hides.
  const activeFlags = [
    false, // Gustave
    ...visibleLinks.map((l) => isActive(l.to)),
    ...(overflowLinks.length ? [overflowActive] : []),
  ];
  const slotCount = activeFlags.length;
  const activeIndex = activeFlags.findIndex(Boolean);

  return (
    <>
      {/* Scrim — fades scrolling content into the background before it reaches the
          bar, so nothing is cut off in a hard line under it. Same hue at 0 alpha
          to avoid a gray dead zone. Sits below the bar (z-30 vs z-40). */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-32 bg-gradient-to-t from-background via-background/60 to-background/0 md:hidden"
      />
      <nav
        className="fixed inset-x-3 bottom-[calc(0.6rem+env(safe-area-inset-bottom))] z-40 md:hidden"
        aria-label="Navigation"
      >
        <div className="relative mx-auto flex max-w-md items-stretch rounded-lg border border-border/60 bg-card/80 shadow-float backdrop-blur-xl">
          {/* Active pill — glides between slots, fades out on the home route. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 transition-[transform,opacity] duration-300 ease-out"
            style={{
              width: `${100 / slotCount}%`,
              transform: `translateX(${Math.max(activeIndex, 0) * 100}%)`,
              opacity: activeIndex < 0 ? 0 : 1,
            }}
          >
            <span className="absolute inset-1.5 rounded-md bg-primary/15" />
          </span>

          {/* Gustave — deploys the full menu as a bottom sheet. */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className={cn(tabBase, "text-muted-foreground")}
          >
            <img
              src={current.gustave}
              alt=""
              className="size-6 shrink-0 rounded-md object-cover object-top ring-1 ring-border"
            />
            <span className="flex max-w-full items-center gap-0.5 truncate px-0.5 leading-none">
              {current.label}
              <ChevronsUpDown className="size-2.5 opacity-60" />
            </span>
          </button>

          {visibleLinks.map((item) => (
            <TabLink key={item.to} item={item} active={isActive(item.to)} />
          ))}

          {overflowLinks.length > 0 && (
            <DropdownTab icon={MoreHorizontal} label="Plus" active={overflowActive}>
              {overflowLinks.map((item) => {
                const I = item.icon;
                return (
                  <DropdownMenuItem key={item.to} asChild className="gap-2">
                    <Link to={item.to}>
                      <I className="size-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownTab>
          )}
        </div>
      </nav>

      <MobileMenuSheet open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
