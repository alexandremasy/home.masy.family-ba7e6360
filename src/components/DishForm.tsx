import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { EFFORT_LEVELS, fmtMinutes, type Dish, type Base, type Role, type Unit, type Composant } from "@/lib/maison-data";
import { cap } from "@/lib/utils";
import { Eyebrow } from "@/components/Eyebrow";

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

/** A label wrapping its own input — the nesting is what associates them. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <Eyebrow size="xs" as="span">{label}</Eyebrow>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

/** Same shape, but for a group of choices: a <label> around buttons associates nothing. */
function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="block">
      <Eyebrow size="xs" as="span">{label}</Eyebrow>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/**
 * The project's segmented control, on ToggleGroup.
 *
 * It used to be a row of plain <button>s: no role, no keyboard nav, and wrapped
 * in a <label> that associated nothing. Radix brings the arrow keys and the
 * roving tabindex; the look stays the app's (bg-background + shadow on the
 * active segment), because toggleVariants' data-[state=on]:bg-accent is now the
 * neutral hover surface, not a selected state.
 */
function Segmented<T extends string | number | boolean>({
  value, options, onChange, label,
}: {
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <ToggleGroup
      type="single"
      value={String(value)}
      // type="single" lets you deselect; a dish axis always has a value.
      onValueChange={(v) => {
        const hit = options.find((o) => String(o.value) === v);
        if (hit) onChange(hit.value);
      }}
      aria-label={label}
      className="inline-flex justify-start gap-0 rounded-lg bg-secondary/70 p-1"
    >
      {options.map((o) => (
        <ToggleGroupItem
          key={String(o.value)}
          value={String(o.value)}
          className="h-auto rounded-md px-3 py-1 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow"
        >
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
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
      <Field label="Nom du plat">
        <Input
          value={d.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="ex. Curry de poulet"
          aria-invalid={touched && nameError}
          className="sm:max-w-sm"
        />
        {touched && nameError && <p className="mt-1 text-xs text-destructive">Le nom est requis.</p>}
      </Field>

      {/* Every axis of the dish reads the same way: a segmented choice. */}
      <div className="flex flex-wrap gap-x-8 gap-y-5">
        <FieldGroup label="Densité">
          <Segmented
            label="Densité"
            value={d.densite}
            options={[{ value: "complet", label: "Complet" }, { value: "léger", label: "Léger" }]}
            onChange={(v) => set("densite", v)}
          />
        </FieldGroup>
        <FieldGroup label="Température">
          <Segmented
            label="Température"
            value={d.temperature}
            options={[{ value: "chaud", label: "Chaud" }, { value: "froid", label: "Froid" }]}
            onChange={(v) => set("temperature", v)}
          />
        </FieldGroup>
        <FieldGroup label="Emportable">
          <Segmented label="Emportable" value={d.emportable} options={YES_NO} onChange={(v) => set("emportable", v)} />
        </FieldGroup>
        <FieldGroup label="Réchauffable">
          <Segmented label="Réchauffable" value={d.rechauffable} options={YES_NO} onChange={(v) => set("rechauffable", v)} />
        </FieldGroup>
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-5">
        <FieldGroup label="Effort">
          <Segmented label="Effort" value={d.effort} options={EFFORT_OPTIONS} onChange={(v) => set("effort", v)} />
        </FieldGroup>
        <FieldGroup label="Une cuisson couvre">
          <Segmented
            label="Une cuisson couvre"
            value={d.rendement}
            options={[
              { value: 1, label: "1 repas" },
              { value: 2, label: "2 repas" },
              { value: 3, label: "3 repas" },
            ] as Array<{ value: Dish["rendement"]; label: string }>}
            onChange={(v) => set("rendement", v)}
          />
        </FieldGroup>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Eyebrow size="xs" as="span">Composants</Eyebrow>
          <Button type="button" size="sm" variant="outline" onClick={addMod} className="h-7 gap-1 text-xs">
            <Plus className="h-3 w-3" />Ajouter
          </Button>
        </div>

        <div className="mt-2 space-y-1.5">
          {/* The base is the dish's skeleton — it heads the components, not a field
              of its own. Fixed row: every dish has exactly one, never removable. */}
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/40 p-1.5">
            <span className="w-20 shrink-0 pl-1 text-xs text-muted-foreground">Base</span>
            <select
              value={d.base}
              onChange={(e) => set("base", e.target.value as Base)}
              aria-label="Base du plat"
              className="h-8 flex-1 rounded-md border border-border bg-background px-2 text-sm capitalize outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {BASES.map((b) => <option key={b} value={b} className="capitalize">{cap(b)}</option>)}
            </select>
          </div>

          {d.modifiers.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/60 px-3 py-4 text-center text-xs text-muted-foreground">
              Aucun composant. Ils alimentent les suggestions, la variété et la liste de courses.
            </p>
          ) : (
            d.modifiers.map((m, i) => (
              <div key={i} className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/60 p-1.5">
                <select value={m.role} onChange={(e) => setMod(i, { role: e.target.value as Role })} className="h-8 w-24 shrink-0 rounded-md border border-border bg-background px-2 text-xs capitalize outline-none">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <Input
                  // cap() on both sides: ::first-letter does nothing to an input's
                  // value, so the capital has to be in the string itself.
                  value={cap(m.name)}
                  onChange={(e) => setMod(i, { name: cap(e.target.value) })}
                  placeholder="Composant"
                  className="h-8 min-w-32 flex-1 text-sm"
                />
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
            ))
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border/60 pt-4">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Annuler</Button>
      </div>
    </form>
  );
}
