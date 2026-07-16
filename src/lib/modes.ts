/**
 * The app's top-level modes. Gustave, the household assistant, wears the outfit
 * of each mode — his portraits live in /public/gustave. Single source of truth
 * for the header ModeSwitcher.
 */
export type Mode = {
  key: string;
  label: string;
  to: string;
  gustave: string;
};

export const modes: Mode[] = [
  { key: "maison", label: "Maison", to: "/", gustave: "/gustave/maison.png" },
  { key: "securite", label: "Sécurité", to: "/securite", gustave: "/gustave/securite.png" },
  { key: "budget", label: "Budget", to: "/budget", gustave: "/gustave/budget.png" },
];

/** The mode owning the current path (Maison is the default / home). */
export function currentMode(pathname: string): Mode {
  return modes.find((m) => m.to !== "/" && pathname.startsWith(m.to)) ?? modes[0];
}
