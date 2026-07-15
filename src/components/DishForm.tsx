import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { Dish, Base, Role, Unit, Composant, Effort } from "@/lib/maison-data";

const BASES: Base[] = [
  "assiette", "pâtes", "bowl", "salade", "quiche", "pizza", "gratin",
  "soupe", "wrap", "tarte", "chili", "curry", "raclette", "potée", "risotto", "lasagne",
];
const ROLES: Role[] = ["protéine", "légume", "féculent", "sauce", "garniture"];
const UNITS: Unit[] = ["pièce", "g", "gousse", "botte"];

export type DishDraft = Omit<Dish, "id">;

export const EMPTY_DRAFT: DishDraft = {
  name: "",
  base: "assiette",
  modifiers: [],
  densite: "complet",
  temperature: "chaud",
  emportable: true,
  rechauffable: true,
  effort: 2,
  rendement: 1,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const selectCls =
  "h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** The project's segmented control (same shape as Énergie's tabs). */
function Segmented<T extends string | number | boolean>({
  value, options, onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg bg-secondary/70 p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={
            "rounded-md px-3 py-1 text-sm transition-all " +
            (value === o.value ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground")
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const EFFORT_OPTIONS = EFFORT_LEVELS.map((l) => ({
  value: l.value,
  label: `${l.label} · ${fmtMinutes(l.minutes)}`,
}));

const YES_NO = [{ value: true, label: "Oui" }, { value: false, label: "Non" }];

export function DishForm({
  initial, submitLabel, onSubmit, onCancel,
}: {
  initial: DishDraft;
  submitLabel: string;
  onSubmit: (d: DishDraft) => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState<DishDraft>(initial);
  const [touched, setTouched] = useState(false);
  const set = <K extends keyof DishDraft>(k: K, v: DishDraft[K]) => setD((p) => ({ ...p, [k]: v }));

  const nameError = d.name.trim().length === 0;

  const setMod = (i: number, patch: Partial<Composant>) =>
    setD((p) => ({ ...p, modifiers: p.modifiers.map((m, j) => (j === i ? { ...m, ...patch } : m)) }));
  const addMod = () =>
    setD((p) => ({ ...p, modifiers: [...p.modifiers, { name: "", role: "protéine", qty: 1, unit: "pièce" }] }));
  const removeMod = (i: number) =>
    setD((p) => ({ ...p, modifiers: p.modifiers.filter((_, j) => j !== i) }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (nameError) return;
    // Drop half-typed components rather than persisting empty ones.
    onSubmit({ ...d, name: d.name.trim(), modifiers: d.modifiers.filter((m) => m.name.trim()) });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom du plat">
          <Input
            value={d.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="ex. Curry de poulet"
            aria-invalid={touched && nameError}
          />
          {touched && nameError && <p className="mt-1 text-xs text-destructive">Le nom est requis.</p>}
        </Field>

        <Field label="Base">
          <select value={d.base} onChange={(e) => set("base", e.target.value as Base)} className={selectCls}>
            {BASES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
      </div>

      {/* Every axis of the dish reads the same way: a segmented choice. */}
      <div className="flex flex-wrap gap-x-8 gap-y-5">
        <Field label="Densité">
          <Segmented
            value={d.densite}
            options={[{ value: "complet", label: "Complet" }, { value: "léger", label: "Léger" }]}
            onChange={(v) => set("densite", v)}
          />
        </Field>
        <Field label="Température">
          <Segmented
            value={d.temperature}
            options={[{ value: "chaud", label: "Chaud" }, { value: "froid", label: "Froid" }]}
            onChange={(v) => set("temperature", v)}
          />
        </Field>
        <Field label="Emportable">
          <Segmented value={d.emportable} options={YES_NO} onChange={(v) => set("emportable", v)} />
        </Field>
        <Field label="Réchauffable">
          <Segmented value={d.rechauffable} options={YES_NO} onChange={(v) => set("rechauffable", v)} />
        </Field>
      </div>
      {/* The engine hard-filters weekday lunches on these two — worth saying out loud. */}
      <p className="-mt-3 text-xs text-muted-foreground">
        Un midi de semaine n'accepte que les plats emportables et réchauffables.
      </p>

      <div className="flex flex-wrap gap-x-8 gap-y-5">
        <Field label="Effort">
          <Segmented value={d.effort} options={EFFORT_OPTIONS} onChange={(v) => set("effort", v)} />
        </Field>
        <Field label="Une cuisson couvre">
          <Segmented
            value={d.rendement}
            options={[
              { value: 1, label: "1 repas" },
              { value: 2, label: "2 repas" },
              { value: 3, label: "3 repas" },
            ] as Array<{ value: Dish["rendement"]; label: string }>}
            onChange={(v) => set("rendement", v)}
          />
        </Field>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Composants</span>
          <Button type="button" size="sm" variant="outline" onClick={addMod} className="h-7 gap-1 text-xs">
            <Plus className="h-3 w-3" />Ajouter
          </Button>
        </div>

        {d.modifiers.length === 0 ? (
          <p className="mt-2 rounded-lg border border-dashed border-border/60 px-3 py-4 text-center text-xs text-muted-foreground">
            Aucun composant. Ils alimentent les suggestions, la variété et la liste de courses.
          </p>
        ) : (
          <div className="mt-2 space-y-1.5">
            {d.modifiers.map((m, i) => (
              <div key={i} className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/60 p-1.5">
                <Input
                  value={m.name}
                  onChange={(e) => setMod(i, { name: e.target.value })}
                  placeholder="composant"
                  className="h-8 min-w-32 flex-1 text-sm"
                />
                <select value={m.role} onChange={(e) => setMod(i, { role: e.target.value as Role })} className="h-8 rounded-md border border-border bg-background px-2 text-xs outline-none">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <Input
                  type="number" min={0} step="any"
                  value={m.qty}
                  onChange={(e) => setMod(i, { qty: Number(e.target.value) })}
                  className="h-8 w-20 text-sm"
                />
                <select value={m.unit} onChange={(e) => setMod(i, { unit: e.target.value as Unit })} className="h-8 rounded-md border border-border bg-background px-2 text-xs outline-none">
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <button
                  type="button" onClick={() => removeMod(i)} aria-label={`Retirer ${m.name || "le composant"}`}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-border/60 pt-4">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Annuler</Button>
      </div>
    </form>
  );
}
