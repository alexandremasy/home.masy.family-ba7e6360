import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  PlanificationTemplate,
  type PlanDayView,
  type PlanSuggestionView,
  type SlotRef,
} from "@/templates/repas-planification";
import {
  dishById,
  suggestFor,
  coherenceSignals,
  initialPlan,
  calWeeks,
  iso,
  addDays,
  dayWeather,
  weatherHintFor,
  TODAY,
  type PlanEntry,
  type Slot,
} from "@/lib/maison-data";

export const Route = createFileRoute("/_app/repas/planification")({
  component: RepasPage,
  head: () => ({ meta: [{ title: "Repas — Cockpit" }] }),
});

/**
 * The page is the template; this file only pretends to be a backend.
 *
 * It keeps the plan in memory and recomputes the suggestions, the weather and the
 * coherence remarks on the spot — enough to make the page *feel* right. The cockpit
 * hands the same template a plan the api persisted, a forecast from Home Assistant,
 * and an engine that ranks server-side.
 */
function RepasPage() {
  const [plan, setPlan] = useState<PlanEntry[]>(initialPlan);
  const [selected, setSelected] = useState<SlotRef | null>(null);
  // Scrolls by one week — consecutive views share a week, like the sliding plan window.
  const [weekOffset, setWeekOffset] = useState(0);
  const weeks = useMemo(() => calWeeks(weekOffset), [weekOffset]);

  const remove = (date: string, slot: Slot) =>
    setPlan((p) => p.filter((e) => !(e.date === date && e.slot === slot)));
  const upsert = (entry: PlanEntry) =>
    setPlan((p) => [...p.filter((e) => !(e.date === entry.date && e.slot === entry.slot)), entry]);

  // Every day of the visible fortnight, both slots, with the day's weather.
  const days = useMemo<PlanDayView[]>(
    () =>
      weeks.flat().map((d) => {
        const date = iso(d);
        const mealOn = (slot: Slot) => {
          const entry = plan.find((e) => e.date === date && e.slot === slot);
          const dish = entry ? dishById(entry.dishId) : undefined;
          return dish ? { dishId: dish.id, dish } : null;
        };
        return { date, weather: dayWeather(d), midi: mealOn("midi"), soir: mealOn("soir") };
      }),
    [weeks, plan],
  );

  const signals = useMemo(() => coherenceSignals(plan), [plan]);

  // The ranked pool for the open slot. A wide limit hands the template the whole
  // compatible pool: it splits it into the shortlist + "others" and its filters
  // narrow it. The dish already on the slot is excluded — it is shown in its own
  // block above the list, so offering it again is noise until it's been removed.
  const suggestions = useMemo<PlanSuggestionView[]>(() => {
    if (!selected) return [];
    const date = new Date(selected.date);
    const placed = plan.find((e) => e.date === selected.date && e.slot === selected.slot)?.dishId;
    return suggestFor(date, selected.slot, plan, weatherHintFor(date), 200)
      .filter((s) => s.dish.id !== placed)
      .map((s) => ({
        dishId: s.dish.id,
        dish: s.dish,
        reason: s.reason,
        leftover: s.leftover,
        exhausted: s.exhausted,
      }));
  }, [selected, plan]);

  return (
    <PlanificationTemplate
      days={days}
      today={iso(TODAY)}
      signals={signals}
      onPrevWeek={() => setWeekOffset((o) => o - 1)}
      onNextWeek={() => setWeekOffset((o) => o + 1)}
      onResetWeek={weekOffset !== 0 ? () => setWeekOffset(0) : undefined}
      selected={selected}
      onSelect={setSelected}
      suggestions={suggestions}
      onPick={(dishId, batch) => {
        if (!selected) return;
        upsert({ date: selected.date, slot: selected.slot, dishId });
        if (batch) {
          upsert({
            date: iso(addDays(new Date(selected.date), 1)),
            slot: selected.slot,
            dishId,
            batchOfDate: selected.date,
          });
        }
        setSelected(null);
      }}
      onRemove={({ date, slot }) => {
        remove(date, slot);
        setSelected(null);
      }}
      onMove={(from, to) =>
        setPlan((p) => {
          const src = p.find((e) => e.date === from.date && e.slot === from.slot);
          if (!src) return p;
          const withoutBoth = p.filter(
            (e) =>
              !(e.date === from.date && e.slot === from.slot) &&
              !(e.date === to.date && e.slot === to.slot),
          );
          return [...withoutBoth, { ...src, date: to.date, slot: to.slot }];
        })
      }
    />
  );
}
