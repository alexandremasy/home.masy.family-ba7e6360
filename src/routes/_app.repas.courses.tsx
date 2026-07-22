import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CoursesTemplate, type CourseLineView } from "@/templates/repas-courses";
import { upcomingMeals, initialPlan, addDays, iso, TODAY, type Slot } from "@/lib/maison-data";

export const Route = createFileRoute("/_app/repas/courses")({
  component: CoursesPage,
  head: () => ({ meta: [{ title: "Courses — Repas" }] }),
});

// A component is on the list when `${mealKey}::${name}` is selected.
const compKey = (mealKey: string, name: string) => `${mealKey}::${name}`;
// Manual input follows the data convention (capitalised) so it merges with the
// meal-derived ingredient of the same name instead of forming a second entry.
const norm = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const WINDOW_DAYS = 10;

/**
 * The page is the template; this file only pretends to be a backend.
 *
 * It keeps the list in memory — a set of ticked components plus a manual delta per
 * ingredient — which is enough to make the page *feel* right. The cockpit hands the
 * same template a list the api derived and persisted for real.
 */
function CoursesPage() {
  const meals = useMemo(() => upcomingMeals(initialPlan), []);

  // Every component of every upcoming meal starts ticked — the list is pre-filled
  // and you prune it, rather than building it from nothing.
  const [selected, setSelected] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (const m of meals) for (const c of m.components) s.add(compKey(m.key, c.name));
    return s;
  });
  // Manual adjustment per ingredient (can be negative). Quantity = meal total +
  // adjustment, so a hand-added item and a cooked one of the same name are ONE line.
  const [adjust, setAdjust] = useState<Record<string, number>>({});

  // What the meals put on the list, summed per ingredient — grams add up, countables
  // are counted, which is exactly what the unit says.
  const fromMeals = useMemo(() => {
    const acc = new Map<string, { qty: number; unit: string }>();
    for (const m of meals) {
      for (const c of m.components) {
        if (!selected.has(compKey(m.key, c.name))) continue;
        const prev = acc.get(c.name);
        acc.set(c.name, { qty: (prev?.qty ?? 0) + c.qty, unit: c.unit });
      }
    }
    return acc;
  }, [meals, selected]);

  // The unit of a hand-added item, if any meal knows it — otherwise it is counted.
  const unitOf = useMemo(() => {
    const u = new Map<string, string>();
    for (const m of meals) for (const c of m.components) u.set(c.name, c.unit);
    return u;
  }, [meals]);

  const lines: CourseLineView[] = useMemo(() => {
    const names = new Set<string>([...fromMeals.keys()]);
    for (const [n, d] of Object.entries(adjust)) if (d > 0) names.add(n);

    const out: CourseLineView[] = [];
    for (const name of names) {
      const base = fromMeals.get(name);
      const unit = base?.unit ?? unitOf.get(name) ?? "pièce";
      // A manual step is one more of whatever the unit is — a piece, or 100 g.
      const step = unit === "pièce" ? 1 : 100;
      const qty = (base?.qty ?? 0) + (adjust[name] ?? 0) * step;
      if (qty > 0) out.push({ key: name, name, qty, unit });
    }
    return out.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }, [fromMeals, adjust, unitOf]);

  // Every day of the window, both slots: a meal, or nothing planned.
  const days = useMemo(() => {
    const byKey = new Map(meals.map((m) => [m.key, m]));
    return Array.from({ length: WINDOW_DAYS }, (_, i) => {
      const date = iso(addDays(TODAY, i));
      const cells = (["midi", "soir"] as Slot[]).map((slot) => {
        const meal = byKey.get(`${date}|${slot}`);
        return {
          slot: slot as "midi" | "soir",
          meal: meal ? { key: meal.key, dish: meal.dish, components: meal.components } : null,
        };
      });
      return { date, cells };
    });
  }, [meals]);

  const toggleComponent = (mealKey: string, name: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      const k = compKey(mealKey, name);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const setQty = (name: string, next: number) => {
    const base = fromMeals.get(name);
    if (next <= 0) {
      // Zero means off the list entirely: untick every meal carrying it, drop the delta.
      if (base)
        setSelected((prev) => {
          const s = new Set(prev);
          for (const m of meals) s.delete(compKey(m.key, name));
          return s;
        });
      setAdjust((a) => {
        const c = { ...a };
        delete c[name];
        return c;
      });
      return;
    }
    const unit = base?.unit ?? unitOf.get(name) ?? "pièce";
    const step = unit === "pièce" ? 1 : 100;
    setAdjust((a) => ({ ...a, [name]: Math.round((next - (base?.qty ?? 0)) / step) }));
  };

  return (
    <CoursesTemplate
      days={days}
      lines={lines}
      isIncluded={(mealKey, name) => selected.has(compKey(mealKey, name))}
      onToggleComponent={toggleComponent}
      onSetQty={setQty}
      onAddManual={(raw) => {
        const name = norm(raw);
        setAdjust((a) => ({ ...a, [name]: (a[name] ?? 0) + 1 }));
      }}
    />
  );
}
