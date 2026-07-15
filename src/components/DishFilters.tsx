import type { Dish, Base, Densite, Temperature } from "@/lib/maison-data";
import { Package, Repeat, Zap, X } from "lucide-react";

/**
 * Filters over the dish model's own axes (see MAISON-BRIEF, Module 1).
 * Shared by the catalogue and the slot picker so both read the same vocabulary.
 */
export interface DishFilter {
  base: Base | null;
  densite: Densite | null;
  temperature: Temperature | null;
  emportable: boolean;
  rapide: boolean;
  batch: boolean;
}

export const EMPTY_FILTER: DishFilter = {
  base: null, densite: null, temperature: null,
  emportable: false, rapide: false, batch: false,
};

export function isFilterActive(f: DishFilter): boolean {
  return countFilters(f) > 0;
}

/** How many axes are narrowed — so a collapsed filter bar can still say so. */
export function countFilters(f: DishFilter): number {
  return [f.base, f.densite, f.temperature, f.emportable || null, f.rapide || null, f.batch || null]
    .filter(Boolean).length;
}

export function applyFilter(list: Dish[], f: DishFilter, query = ""): Dish[] {
  const q = query.trim().toLowerCase();
  return list.filter((d) => {
    if (f.base && d.base !== f.base) return false;
    if (f.densite && d.densite !== f.densite) return false;
    if (f.temperature && d.temperature !== f.temperature) return false;
    if (f.emportable && !d.emportable) return false;
    if (f.rapide && d.effort > 1) return false;
    if (f.batch && d.rendement < 2) return false;
    if (q && !d.name.toLowerCase().includes(q) && !d.modifiers.some((m) => m.name.toLowerCase().includes(q))) return false;
    return true;
  });
}

function Chip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors " +
        (active
          ? "border-foreground bg-foreground text-background"
          : "border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}

export function DishFilters({
  value, onChange, bases,
}: {
  value: DishFilter;
  onChange: (f: DishFilter) => void;
  /** Bases actually present in the list being filtered — no dead options. */
  bases: Base[];
}) {
  const set = <K extends keyof DishFilter>(k: K, v: DishFilter[K]) => onChange({ ...value, [k]: v });
  const toggle = <K extends keyof DishFilter>(k: K, v: DishFilter[K]) =>
    set(k, (value[k] === v ? null : v) as DishFilter[K]);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Chip active={value.densite === "complet"} onClick={() => toggle("densite", "complet")}>Complet</Chip>
      <Chip active={value.densite === "léger"} onClick={() => toggle("densite", "léger")}>Léger</Chip>

      <span className="mx-0.5 h-4 w-px bg-border" />

      <Chip active={value.temperature === "chaud"} onClick={() => toggle("temperature", "chaud")}>Chaud</Chip>
      <Chip active={value.temperature === "froid"} onClick={() => toggle("temperature", "froid")}>Froid</Chip>

      <span className="mx-0.5 h-4 w-px bg-border" />

      <Chip active={value.emportable} onClick={() => set("emportable", !value.emportable)}>
        <Package className="h-3 w-3" />Emportable
      </Chip>
      <Chip active={value.rapide} onClick={() => set("rapide", !value.rapide)}>
        <Zap className="h-3 w-3" />Rapide
      </Chip>
      {/* Same wording as the card's "Couvre N repas" tag — it filters on the very
          same property (rendement ≥ 2). "Batch" said nothing and collided with
          two other meanings of the word. */}
      <Chip active={value.batch} onClick={() => set("batch", !value.batch)}>
        <Repeat className="h-3 w-3" />Couvre 2+ repas
      </Chip>

      <span className="mx-0.5 h-4 w-px bg-border" />

      <select
        value={value.base ?? ""}
        onChange={(e) => set("base", (e.target.value || null) as Base | null)}
        aria-label="Filtrer par base"
        className={
          "h-[26px] shrink-0 rounded-full border px-2.5 text-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring " +
          (value.base ? "border-foreground bg-foreground text-background" : "border-border/60 bg-transparent text-muted-foreground")
        }
      >
        <option value="">Toutes les bases</option>
        {bases.map((b) => <option key={b} value={b}>{b}</option>)}
      </select>

      {isFilterActive(value) && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTER)}
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-3 w-3" />Effacer
        </button>
      )}
    </div>
  );
}
