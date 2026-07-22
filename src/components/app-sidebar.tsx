import { Link, useLocation } from "@tanstack/react-router";
import { ExternalLink, Palette, LayoutGrid } from "lucide-react";
import { RoomIcon } from "@/components/room-icon";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Room } from "@/lib/mock-data";
import { modes, currentMode } from "@/lib/modes";
import { rooms, upcoming, externals, navForMode } from "@/lib/nav";
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
} from "@/components/sidebar";

// Desktop rail. Mirrors the mobile menu sheet: every destination is directly
// visible — no dropdowns, no tooltip submenus. Sections follow the current mode.
export function AppSidebar() {
  const { pathname } = useLocation();
  const current = currentMode(pathname);
  const isMaison = current.key === "maison";
  const activeRoom = rooms.find((r) => pathname.startsWith("/room/" + r.key));
  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  return (
    <Sidebar collapsible="icon">
      {/* Header — identity card (Gustave in the current mode's outfit). */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none">
              <img
                src={current.gustave}
                alt={`Gustave — ${current.label}`}
                className="size-8 shrink-0 rounded-lg object-cover object-top ring-1 ring-sidebar-border"
              />
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-base font-medium">{current.label}</span>
                <span className="truncate text-xs text-muted-foreground">Assistant maison</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Accueil — back to the bento dashboard. */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/"} tooltip="Accueil">
                <Link to="/">
                  <LayoutGrid />
                  <span>Accueil</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Current mode's own sections. */}
        <SidebarGroup>
          <SidebarGroupLabel>{current.label}</SidebarGroupLabel>
          <SidebarMenu>
            {navForMode(current.key).map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={isActive(item.to)} tooltip={item.label}>
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

        {/* Pièces — rooms, directly visible (Maison only). */}
        {isMaison && (
          <SidebarGroup>
            <SidebarGroupLabel>Pièces</SidebarGroupLabel>
            <SidebarMenu>
              {rooms.map((r) => (
                <SidebarMenuItem key={r.key}>
                  <SidebarMenuButton asChild isActive={activeRoom?.key === r.key} tooltip={r.label}>
                    <Link to="/room/$roomKey" params={{ roomKey: r.key }}>
                      <RoomIcon icon={r.icon as Room["icon"]} />
                      <span>{r.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Outils — external tools only. The design system used to be a route here;
            Storybook replaced it, and each repo names its own host in `nav`. */}
        <SidebarGroup>
          <SidebarGroupLabel>Outils</SidebarGroupLabel>
          <SidebarMenu>
            {externals.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      <Icon />
                      <span className="flex-1">{item.label}</span>
                      <ExternalLink className="size-3.5 opacity-50" />
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Modes — the full mode switcher, directly visible. */}
        <SidebarGroup>
          <SidebarGroupLabel>Modes</SidebarGroupLabel>
          <SidebarMenu>
            {modes.map((m) => (
              <SidebarMenuItem key={m.key}>
                <SidebarMenuButton asChild isActive={m.key === current.key} tooltip={m.label}>
                  <Link to={m.to}>
                    <img
                      src={m.gustave}
                      alt=""
                      className="size-5 shrink-0 rounded-md object-cover object-top ring-1 ring-border/60"
                    />
                    <span className="flex-1">{m.label}</span>
                    {m.key === current.key && <span className="size-1.5 rounded-full bg-primary" />}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Bientôt — upcoming modes, disabled. */}
        <SidebarGroup>
          <SidebarGroupLabel>Bientôt</SidebarGroupLabel>
          <SidebarMenu>
            {upcoming.map((m) => {
              const Icon = m.icon;
              return (
                <SidebarMenuItem key={m.key}>
                  <SidebarMenuButton
                    aria-disabled
                    tooltip={m.label}
                    className="cursor-not-allowed text-muted-foreground/60 hover:bg-transparent hover:text-muted-foreground/60"
                  >
                    <Icon />
                    <span className="flex-1">{m.label}</span>
                    <span className="rounded-full bg-secondary px-1.5 py-0.5 text-2xs uppercase tracking-wider">
                      Bientôt
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — theme. */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ThemeToggle asSidebarItem />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
