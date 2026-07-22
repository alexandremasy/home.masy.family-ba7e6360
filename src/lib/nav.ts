import type { LucideIcon } from "lucide-react";
import {
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
  Palette,
  Settings,
  Wrench,
  Newspaper,
  Radar,
} from "lucide-react";

/**
 * The navigation model, shared by the desktop sidebar rail (AppSidebar) and the
 * mobile bottom bar (BottomBar) so the two never drift. Each mode owns a list of
 * sections; Maison additionally leads with the Pièces (rooms) dropdown, which the
 * consumers render themselves.
 */
export type NavItem = { to: string; label: string; icon: LucideIcon };

export const maisonNav: NavItem[] = [
  { to: "/repas", label: "Repas", icon: UtensilsCrossed },
  { to: "/anniversaires", label: "Anniversaires", icon: Cake },
  { to: "/tesla", label: "Bernard", icon: Car },
  { to: "/energie", label: "Énergie", icon: Zap },
];

export const budgetNav: NavItem[] = [
  { to: "/budget/vue", label: "Vue d'ensemble", icon: LayoutDashboard },
  { to: "/budget/transactions", label: "Transactions", icon: Table2 },
  { to: "/budget/planification", label: "Planification", icon: CalendarRange },
  { to: "/budget/import", label: "Import", icon: FileUp },
];

export const securiteNav: NavItem[] = [
  { to: "/securite/etat", label: "État", icon: ShieldCheck },
  { to: "/securite/perimetre", label: "Périmètre", icon: DoorClosed },
  { to: "/securite/activite", label: "Activité", icon: Activity },
  { to: "/securite/reseau", label: "Réseau", icon: Wifi },
];

export const rooms = [
  { key: "salon", label: "Salon", icon: "sofa" },
  { key: "bureau", label: "Bureau", icon: "briefcase" },
  { key: "cuisine", label: "Cuisine", icon: "utensils" },
  { key: "chambre", label: "Chambre", icon: "bed" },
  { key: "buanderie", label: "Buanderie", icon: "washing-machine" },
  { key: "escalier", label: "Escalier", icon: "footprints" },
] as const;

export const upcoming: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "medias", label: "Médias", icon: Newspaper },
  { key: "veille", label: "Veille", icon: Radar },
];

export const externals: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "https://design.masy.family", label: "Design system", icon: Palette },
  { href: "https://example.com/settings", label: "Settings", icon: Settings },
  { href: "https://example.com/dev-tools", label: "Dev tools", icon: Wrench },
];

export function navForMode(key: string): NavItem[] {
  if (key === "budget") return budgetNav;
  if (key === "securite") return securiteNav;
  return maisonNav;
}
