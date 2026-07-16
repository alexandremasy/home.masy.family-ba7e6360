import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Section } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  deriveCourses, initialPlan, staples as initialStaples,
  type CourseItem, type StapleItem, type Unit,
} from "@/lib/maison-data";
import { Check, Plus, Minus, X, ShoppingBasket, Sparkles, PenLine, Undo2 } from "lucide-react";
import { Eyebrow } from "@/components/Eyebrow";

export const Route = createFileRoute("/_app/repas/courses")({
  component: CoursesPage,
  head: () => ({ meta: [{ title: "Courses — Repas" }] }),
});

function CoursesPage() {
  const [stapleState, setStapleState] = useState<StapleItem[]>(initialStaples);
  const [manual, setManual] = useState<CourseItem[]>([]);
  const [overrides, setOverrides] = useState<Record<string, { qty?: number; checked?: boolean; removed?: boolean }>>({});
  const [newName, setNewName] = useState("");

  const rawItems = useMemo(
    () => deriveCourses(initialPlan, stapleState, manual),
    [stapleState, manual],
  );

  const items = rawItems
    .map((it) => {
      const o = overrides[it.key];
      return {
        ...it,
        qty: o?.qty ?? it.qty,
        checked: o?.checked ?? it.checked,
        removed: o?.removed ?? false,
      };
    })
    .filter((it) => !it.removed);

  const grouped = useMemo(() => {
    const g = new Map<string, typeof items>();
    for (const it of items) {
      if (!g.has(it.category)) g.set(it.category, []);
      g.get(it.category)!.push(it);
    }
    return Array.from(g.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  const setQty = (key: string, delta: number) => setOverrides((o) => {
    const cur = o[key]?.qty;
    const base = items.find((i) => i.key === key)?.qty ?? cur ?? 1;
    const next = Math.max(0, (cur ?? base) + delta);
    return { ...o, [key]: { ...o[key], qty: next } };
  });
  const toggleCheck = (key: string) => setOverrides((o) => {
    const cur = o[key]?.checked;
    const base = items.find((i) => i.key === key)?.checked ?? true;
    return { ...o, [key]: { ...o[key], checked: !(cur ?? base) } };
  });
  const remove = (key: string) => {
    if (key.startsWith("m:")) {
      setManual((m) => m.filter((x) => x.key !== key));
    } else {
      setOverrides((o) => ({ ...o, [key]: { ...o[key], removed: true } }));
    }
  };
  const undoAll = () => { setOverrides({}); setStapleState(initialStaples); setManual([]); };

  const addManual = () => {
    const name = newName.trim();
    if (!name) return;
    const key = `m:${name}:${Date.now()}`;
    setManual((m) => [...m, { key, name, qty: 1, unit: "pièce" as Unit, category: "Manuel", source: "manual", checked: true }]);
    setNewName("");
  };

  const counts = {
    derived: items.filter((i) => i.source === "derived").length,
    staple:  items.filter((i) => i.source === "staple").length,
    manual:  items.filter((i) => i.source === "manual").length,
  };
  const checkedCount = items.filter((i) => i.checked).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="À prendre" value={checkedCount} icon={<ShoppingBasket className="h-4 w-4" />} />
        <StatCard label="Dérivés des repas" value={counts.derived} icon={<Sparkles className="h-4 w-4 text-primary" />} sub="calculés" />
        <StatCard label="Staples" value={counts.staple} icon={<Check className="h-4 w-4 text-success" />} sub="reviennent" />
        <StatCard label="Manuel" value={counts.manual} icon={<PenLine className="h-4 w-4" />} sub="ajouts" />
      </div>

      <Section
        title="Liste vivante"
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Input
                placeholder="Ajouter un article…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addManual(); }}
                className="h-8 w-56"
              />
              <Button size="sm" onClick={addManual} className="h-8 gap-1"><Plus className="h-3.5 w-3.5" />Ajouter</Button>
            </div>
            <Button size="sm" variant="ghost" onClick={undoAll} className="h-8 gap-1"><Undo2 className="h-3.5 w-3.5" />Réinitialiser</Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          {grouped.map(([cat, list]) => (
            <div key={cat} className="rounded-xl border border-border/60 bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-serif text-lg">{cat}</h3>
                <Eyebrow size="xs" as="span">{list.length}</Eyebrow>
              </div>
              <ul className="divide-y divide-border/50">
                {list.map((it) => (
                  <li key={it.key} className="group flex items-center gap-2 py-1.5">
                    {/* Was a <button> drawing its own tick: no role, no checked
                        state, invisible to assistive tech. */}
                    <Checkbox
                      checked={it.checked}
                      onCheckedChange={() => toggleCheck(it.key)}
                      aria-label={`${it.name} — ${it.checked ? "acheté" : "à acheter"}`}
                      className="h-5 w-5 shrink-0 rounded-md data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={"text-sm " + (it.checked ? "" : "text-muted-foreground line-through decoration-muted-foreground/40")}>
                        {it.name}
                      </p>
                      {it.fromDishes && (
                        <p className="truncate text-3xs text-muted-foreground">
                          <Sparkles className="mr-0.5 inline h-2.5 w-2.5 text-primary" />
                          {it.fromDishes.join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5 rounded-md border border-border/60 bg-background">
                      <button onClick={() => setQty(it.key, -1)} className="grid h-6 w-6 place-items-center text-muted-foreground hover:text-foreground"><Minus className="h-3 w-3" /></button>
                      <span className="min-w-[3rem] text-center text-xs tabular-nums">{it.qty} {it.unit}</span>
                      <button onClick={() => setQty(it.key, +1)} className="grid h-6 w-6 place-items-center text-muted-foreground hover:text-foreground"><Plus className="h-3 w-3" /></button>
                    </div>
                    <button
                      onClick={() => remove(it.key)}
                      aria-label="Retirer"
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Quantités <b>cumulées</b> depuis les repas planifiés — un batch ne compte qu'une fois.
        </p>
      </Section>
    </div>
  );
}

function StatCard({ label, value, icon, sub }: { label: string; value: number; icon: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <Eyebrow size="xs">{label}</Eyebrow>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary">{icon}</span>
      </div>
      <p className="mt-2 font-serif text-3xl tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
