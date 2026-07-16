import { Link, useLocation } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  Home,
  UtensilsCrossed,
  Cake,
  Car,
  Wifi,
  Zap,
  LayoutDashboard,
  Table2,
  CalendarRange,
  FileUp,
  ShieldCheck,
  DoorClosed,
  Activity,
  ChevronsUpDown,
  ChevronRight,
  MoreHorizontal,
  Settings,
  Wrench,
  ExternalLink,
  Palette,
  Newspaper,
  Radar,
} from "lucide-react";
import { RoomIcon } from "@/components/RoomIcon";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Room } from "@/lib/mock-data";
import { modes, currentMode } from "@/lib/modes";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavItem = { to: string; label: string; icon: LucideIcon };

// Each mode's sections — the per-mode navigation, unchanged from the old TopNav,
// just moved into the rail. Rooms hang off Pièces as a dropdown.
const maisonNav: NavItem[] = [
  { to: "/repas", label: "Repas", icon: UtensilsCrossed },
  { to: "/anniversaires", label: "Anniversaires", icon: Cake },
  { to: "/tesla", label: "Bernard", icon: Car },
  { to: "/reseau", label: "Réseau", icon: Wifi },
  { to: "/energie", label: "Énergie", icon: Zap },
];

const budgetNav: NavItem[] = [
  { to: "/budget/vue", label: "Vue d'ensemble", icon: LayoutDashboard },
  { to: "/budget/transactions", label: "Transactions", icon: Table2 },
  { to: "/budget/planification", label: "Planification", icon: CalendarRange },
  { to: "/budget/import", label: "Import", icon: FileUp },
];

const securiteNav: NavItem[] = [
  { to: "/securite/etat", label: "État", icon: ShieldCheck },
  { to: "/securite/perimetre", label: "Périmètre", icon: DoorClosed },
  { to: "/securite/activite", label: "Activité", icon: Activity },
];

const rooms = [
  { key: "salon", label: "Salon", icon: "sofa" },
  { key: "bureau", label: "Bureau", icon: "briefcase" },
  { key: "cuisine", label: "Cuisine", icon: "utensils" },
  { key: "chambre", label: "Chambre", icon: "bed" },
  { key: "buanderie", label: "Buanderie", icon: "washing-machine" },
  { key: "escalier", label: "Escalier", icon: "footprints" },
] as const;

const upcoming = [
  { key: "medias", label: "Médias", icon: Newspaper },
  { key: "veille", label: "Veille", icon: Radar },
];

const externals = [
  { href: "https://example.com/settings", label: "Settings", icon: Settings },
  { href: "https://example.com/dev-tools", label: "Dev tools", icon: Wrench },
];

function navForMode(key: string): NavItem[] {
  if (key === "budget") return budgetNav;
  if (key === "securite") return securiteNav;
  return maisonNav;
}

export function AppSidebar() {
  const { pathname } = useLocation();
  const current = currentMode(pathname);
  const items = navForMode(current.key);
  const activeRoom = rooms.find((r) => pathname.startsWith("/room/" + r.key));
  const { isMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      {/* Header — the mode switcher (Gustave in his outfit). */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <img
                    src={current.gustave}
                    alt={`Gustave — ${current.label}`}
                    className="size-8 shrink-0 rounded-lg object-cover object-top ring-1 ring-sidebar-border"
                  />
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate font-serif text-base font-medium">
                      {current.label}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">Assistant maison</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
                align="start"
                side={isMobile ? "bottom" : "right"}
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-2xs uppercase tracking-eyebrow text-muted-foreground">
                  Modes
                </DropdownMenuLabel>
                {modes.map((m) => (
                  <DropdownMenuItem key={m.key} asChild className="gap-2.5">
                    <Link to={m.to}>
                      <img
                        src={m.gustave}
                        alt=""
                        className="size-7 rounded-md object-cover object-top ring-1 ring-border/60"
                      />
                      <span className="flex-1">{m.label}</span>
                      {m.key === current.key && (
                        <span className="size-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-2xs uppercase tracking-eyebrow text-muted-foreground">
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
                      <span className="grid size-6 place-items-center rounded-md bg-secondary">
                        <I className="size-3" />
                      </span>
                      <span className="flex-1">{m.label}</span>
                      <span className="rounded-full bg-secondary px-1.5 py-0.5 text-2xs uppercase tracking-wider">
                        Bientôt
                      </span>
                    </div>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content — the current mode's sections. */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{current.label}</SidebarGroupLabel>
          <SidebarMenu>
            {/* Maison leads with Pièces (rooms dropdown). */}
            {current.key === "maison" && (
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Pièces"
                      isActive={!!activeRoom}
                      className="data-[state=open]:bg-sidebar-accent"
                    >
                      <Home />
                      <span>{activeRoom ? activeRoom.label : "Pièces"}</span>
                      <ChevronRight className="ml-auto size-4 text-muted-foreground" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    side={isMobile ? "bottom" : "right"}
                    sideOffset={4}
                  >
                    <DropdownMenuLabel>Pièces</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {rooms.map((r) => (
                      <DropdownMenuItem key={r.key} asChild className="gap-2">
                        <Link to="/room/$roomKey" params={{ roomKey: r.key }}>
                          <RoomIcon icon={r.icon as Room["icon"]} className="size-4" />
                          {r.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            )}

            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to || pathname.startsWith(item.to + "/");
              return (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                    <Link to={item.to}>
                      <Icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — reference + tools + theme. */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/design-system")}
              tooltip="Design system"
            >
              <Link to="/design-system">
                <Palette />
                <span>Design system</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip="Outils">
                  <MoreHorizontal />
                  <span>Outils</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side={isMobile ? "bottom" : "right"}
                sideOffset={4}
                className="min-w-48"
              >
                {externals.map((item) => {
                  const I = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild className="gap-2">
                      <a href={item.href} target="_blank" rel="noopener noreferrer">
                        <I className="size-4" />
                        <span className="flex-1">{item.label}</span>
                        <ExternalLink className="size-3.5 opacity-50" />
                      </a>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <ThemeToggle asSidebarItem />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
