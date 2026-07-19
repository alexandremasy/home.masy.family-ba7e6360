// The document title = active view, prefixed with 🎨 to mark this as the mockup
// app (the cockpit uses 🛠️ on its dev server, nothing in prod). Set from _app.
import { useEffect } from "react";

const ROOMS: Record<string, string> = {
  salon: "Salon",
  bureau: "Bureau",
  cuisine: "Cuisine",
  chambre: "Chambre",
  escalier: "Escalier",
  buanderie: "Buanderie",
};

const TOP: Record<string, string> = {
  repas: "Repas",
  anniversaires: "Anniversaires",
  tesla: "Bernard",
  reseau: "Réseau",
  energie: "Énergie",
  budget: "Budget",
  securite: "Sécurité",
  "design-system": "Design system",
};

const SUB: Record<string, string> = {
  "repas/courses": "Courses",
  "repas/plats": "Plats",
  "repas/planification": "Planification",
  "budget/vue": "Vue d'ensemble",
  "budget/annuel": "Annuel",
  "budget/transactions": "Transactions",
  "budget/planification": "Planification",
  "budget/import": "Import",
  "budget/mensuel": "Mensuel",
  "energie/saisie": "Saisie",
  "securite/etat": "État",
  "securite/activite": "Activité",
  "securite/perimetre": "Périmètre",
  "securite/reseau": "Réseau",
};

/** A human label for the active route. */
export function viewLabel(pathname: string): string {
  if (pathname === "/") return "Accueil";
  const room = pathname.match(/^\/room\/([^/]+)/);
  if (room) return ROOMS[room[1]] ?? "Pièce";
  const seg = pathname.split("/").filter(Boolean);
  const top = TOP[seg[0]] ?? (seg[0] ? seg[0][0].toUpperCase() + seg[0].slice(1) : "Maison");
  const sub = SUB[seg.slice(0, 2).join("/")];
  return sub ? `${top} · ${sub}` : top;
}

/** Keep `document.title` in sync with the active view, prefixed 🎨 (mockup). */
export function useDocumentTitle(pathname: string): void {
  useEffect(() => {
    document.title = `🎨 ${viewLabel(pathname)} · Maison`;
  }, [pathname]);
}
