import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { WeatherIcon } from "@/components/WeatherIcon";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DishFilters, applyFilter, EMPTY_FILTER, type DishFilter } from "@/components/DishFilters";
import { DishCard, StatusPill } from "@/components/DishCard";
import { cap } from "@/lib/utils";
import {
  dishById, suggestFor, coherenceSignals, initialPlan, calWeeks, iso,
  isWeekend, frLongDay, addDays, dayWeather, weatherHintFor, TODAY,
  type PlanEntry, type Slot, type Dish, type Base, type Suggestion,
} from "@/lib/maison-data";
import {
  Sparkles, X, RefreshCw, Search, Repeat, Info, AlertTriangle, Package, Move,
  ThermometerSun, ChevronLeft, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/_app/repas/planification")({
  component: RepasPage,
  head: () => ({ meta: [{ title: "Repas — Cockpit" }] }),
});

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/** "13 → 26 juillet", collapsing the month when both ends share it. */
function rangeLabel(weeks: Date[][]): string {
  const first = weeks[0][0];
  const last = weeks[1][6];
  const sameMonth = first.getMonth() === last.getMonth();
  const fmt = (d: Date, withMonth: boolean) =>
    d.toLocaleDateString("fr-BE", withMonth ? { day: "numeric", month: "long" } : { day: "numeric" });
  return `${fmt(first, !sameMonth)} → ${fmt(last, true)}`;
}

function RepasPage() {
  const [plan, setPlan] = useState<PlanEntry[]>(initialPlan);
  const [selected, setSelected] = useState<{ date: string; slot: Slot } | null>(null);
  // Scrolls by one week — consecutive views share a week, like the sliding plan window.
  const [weekOffset, setWeekOffset] = useState(0);
  const weeks = useMemo(() => calWeeks(weekOffset), [weekOffset]);

  const remove = (date: string, slot: Slot) => setPlan((p) => p.filter((e) => !(e.date === date && e.slot === slot)));
  const upsert = (entry: PlanEntry) => setPlan((p) => [...p.filter((e) => !(e.date === entry.date && e.slot === entry.slot)), entry]);
  const move = (from: { date: string; slot: Slot }, to: { date: string; slot: Slot }) => {
    setPlan((p) => {
      const src = p.find((e) => e.date === from.date && e.slot === from.slot);
      if (!src) return p;
      const withoutBoth = p.filter((e) =>
        !(e.date === from.date && e.slot === from.slot) &&
        !(e.date === to.date && e.slot === to.slot)
      );
      return [...withoutBoth, { ...src, date: to.date, slot: to.slot }];
    });
  };

  const signals = useMemo(() => coherenceSignals(plan), [plan]);
  const selectedDate = selected ? new Date(selected.date) : null;

  return (
    <div className="space-y-6">
      {/* Coherence — one compact strip, not a column */}
      <div className="flex flex-wrap items-center gap-1.5">
        {signals.slice(0, 4).map((s, i) => (
          <span
            key={i}
            className={
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs " +
              (s.tone === "warn" ? "border-warm/40 bg-warm/10 text-warm" : "border-border/60 text-muted-foreground")
            }
          >
            {s.tone === "warn" ? <AlertTriangle className="h-3 w-3 shrink-0" /> : <Info className="h-3 w-3 shrink-0" />}
            {s.text}
          </span>
        ))}
      </div>

      {/* Calendar — 2 weeks shown, scrolled one week at a time */}
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-serif text-lg">{rangeLabel(weeks)}</p>
          <div className="flex items-center gap-2">
            {/* Only worth offering once you've drifted off the current week. */}
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Aujourd'hui
              </button>
            )}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setWeekOffset((o) => o - 1)}
                aria-label="Semaine précédente"
                className="grid h-8 w-8 place-items-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setWeekOffset((o) => o + 1)}
                aria-label="Semaine suivante"
                className="grid h-8 w-8 place-items-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-2 px-1">
          {WEEKDAYS.map((d) => (
            <p key={d} className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{d}</p>
          ))}
        </div>

        <div className="space-y-2">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-2">
              {week.map((d) => (
                <DayCell
                  key={iso(d)}
                  date={d}
                  plan={plan}
                  onSelect={setSelected}
                  onRemove={remove}
                  onMove={move}
                />
              ))}
            </div>
          ))}
        </div>

        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Move className="h-3 w-3" /> Glissez un plat vers un autre créneau pour le déplacer.
        </p>
      </div>

      {/* Suggestions — modal, opened from a slot */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        {/* The app's own background, so the white cards read as objects on it. */}
        <DialogContent className="max-w-2xl gap-7 bg-background">
          {selected && selectedDate && (
            <SlotPicker
              date={selectedDate}
              slot={selected.slot}
              plan={plan}
              onPick={(dish, batch) => {
                upsert({ date: selected.date, slot: selected.slot, dishId: dish.id });
                if (batch) {
                  upsert({
                    date: iso(addDays(selectedDate, 1)),
                    slot: selected.slot,
                    dishId: dish.id,
                    batchOfDate: selected.date,
                  });
                }
                setSelected(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ------------------------------------------------------------
function DayCell({
  date, plan, onSelect, onRemove, onMove,
}: {
  date: Date;
  plan: PlanEntry[];
  onSelect: (s: { date: string; slot: Slot }) => void;
  onRemove: (date: string, slot: Slot) => void;
  onMove: (from: { date: string; slot: Slot }, to: { date: string; slot: Slot }) => void;
}) {
  const key = iso(date);
  const weekend = isWeekend(date);
  const today = key === iso(TODAY);
  const w = dayWeather(date);

  return (
    <div
      className={
        "flex min-h-[12.5rem] flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-colors " +
        (today ? "ring-2 ring-primary/50" : "")
      }
    >
      {/* Day header — date left, that day's weather right. The weather drives the suggestions. */}
      <div className="flex items-start justify-between gap-1 px-2.5 pt-2.5">
        <span className={"font-serif text-2xl leading-none tabular-nums " + (today ? "text-primary" : "")}>
          {date.getDate()}
        </span>
        <span
          className="flex items-center gap-1 text-muted-foreground"
          title={`${w.minC}° / ${w.maxC}°${w.heatwave ? " · forte chaleur" : ""}`}
        >
          {w.heatwave
            ? <ThermometerSun className="h-4 w-4 text-warm" />
            : <WeatherIcon cond={w.cond} className="h-4 w-4" />}
          <span className={"text-xs tabular-nums " + (w.heatwave ? "text-warm" : "")}>{w.maxC}°</span>
        </span>
      </div>

      <div className="mt-1.5 flex flex-1 flex-col gap-1.5 p-2">
        {(["midi", "soir"] as Slot[]).map((slot) => (
          <SlotCell
            key={slot}
            date={key}
            slot={slot}
            entry={plan.find((e) => e.date === key && e.slot === slot)}
            weekend={weekend}
            onOpen={() => onSelect({ date: key, slot })}
            onRemove={() => onRemove(key, slot)}
            onDropFrom={(from) => onMove(from, { date: key, slot })}
          />
        ))}
      </div>
    </div>
  );
}

function SlotCell({
  date, slot, entry, weekend, onOpen, onRemove, onDropFrom,
}: {
  date: string; slot: Slot; entry?: PlanEntry; weekend: boolean;
  onOpen: () => void; onRemove: () => void;
  onDropFrom: (from: { date: string; slot: Slot }) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const dish = entry ? dishById(entry.dishId) : undefined;
  const isBatch = !!entry?.batchOfDate;

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        setDragOver(false);
        const raw = e.dataTransfer.getData("application/json");
        if (!raw) return;
        const from = JSON.parse(raw) as { date: string; slot: Slot };
        if (from.date === date && from.slot === slot) return;
        onDropFrom(from);
      }}
      className="group relative flex flex-1 flex-col"
    >
      {/* The label belongs to the slot, not to the dish — so it stays outside the box. */}
      <div className="flex items-center justify-between px-1 pb-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>{slot === "midi" ? "Midi" : "Soir"}</span>
        {!weekend && slot === "midi" && !entry && <Package className="h-3 w-3" aria-label="Emportable" />}
      </div>

      {entry && dish ? (
        <div
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("application/json", JSON.stringify({ date, slot }));
            e.dataTransfer.effectAllowed = "move";
          }}
          className={
            "flex-1 cursor-grab rounded-lg border p-2 transition-all active:cursor-grabbing " +
            (dragOver
              ? "border-primary bg-primary/5"
              : "border-transparent bg-secondary/50 hover:border-border hover:bg-secondary hover:shadow-soft")
          }
        >
          {/* Same card, stripped to what a calendar cell can hold. */}
          <DishCard
            dish={dish}
            variant="compact"
            status={
              isBatch
                ? <StatusPill icon={<Repeat className="h-3 w-3" />} title="Batch — cuisson d'un autre jour" />
                : undefined
            }
          />
          <div className="absolute right-1 top-4 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button onClick={onOpen} aria-label="Changer" className="grid h-6 w-6 place-items-center rounded-md bg-card text-muted-foreground shadow-soft hover:text-foreground">
              <RefreshCw className="h-3 w-3" />
            </button>
            <button onClick={onRemove} aria-label="Retirer" className="grid h-6 w-6 place-items-center rounded-md bg-card text-muted-foreground shadow-soft hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onOpen}
          aria-label={`Suggérer un plat — ${slot}`}
          className={
            "flex flex-1 items-center justify-center rounded-lg border border-dashed text-muted-foreground transition-colors " +
            (dragOver ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary hover:text-primary")
          }
        >
          <Sparkles className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ------------------------------------------------------------
function SlotPicker({
  date, slot, plan, onPick,
}: {
  date: Date; slot: Slot; plan: PlanEntry[];
  onPick: (dish: Dish, batch: boolean) => void;
}) {
  // The slot's density default (MAISON-BRIEF: complet → midi, léger → soir) opens
  // as an active, removable filter — a default, not a law.
  const baseline = useMemo<DishFilter>(
    () => ({ ...EMPTY_FILTER, densite: slot === "midi" ? "complet" : "léger" }),
    [slot],
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<DishFilter>(baseline);
  const hint = useMemo(() => weatherHintFor(date), [date]);

  // One ranked pool for the whole modal: the engine orders it, filters narrow it.
  // Browsing never resurrects a dish the slot's hard rules rejected.
  const ranked = useMemo(() => suggestFor(date, slot, plan, hint, 200), [date, slot, plan, hint]);

  const shown = useMemo(() => {
    const keep = new Set(applyFilter(ranked.map((s) => s.dish), filter, query).map((d) => d.id));
    return ranked.filter((s) => keep.has(s.dish.id));
  }, [ranked, filter, query]);

  // The engine's shortlist, then everything else it would still accept.
  const suggestions = shown.slice(0, 6);
  const others = shown.slice(6);

  const bases = useMemo(
    () => [...new Set(ranked.map((s) => s.dish.base))].sort() as Base[],
    [ranked],
  );

  const w = dayWeather(date);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-serif text-xl">
          {cap(frLongDay(date))} · {slot === "midi" ? "Midi" : "Soir"}
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[11px] font-normal text-muted-foreground">
            <WeatherIcon cond={w.cond} className="h-3 w-3" animated={false} />
            {w.maxC}°
          </span>
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un plat, ou un reste à écouler…"
            className="bg-card pl-8"
          />
        </div>
        <DishFilters value={filter} onChange={setFilter} bases={bases} />
      </div>

      <div className="max-h-[55vh] space-y-7 overflow-y-auto">
        {shown.length === 0 && (
          <p className="px-1 py-6 text-sm text-muted-foreground">
            Aucun plat ne correspond — élargissez les critères.
          </p>
        )}

        {suggestions.length > 0 && (
          <DishSection
            title="Suggestions"
            hint={`Les mieux placées pour ce créneau${slot === "midi" ? " · complet" : " · léger"}`}
            items={suggestions}
            onPick={onPick}
          />
        )}

        {others.length > 0 && (
          <DishSection
            title="Autres plats"
            hint={`${others.length} plat${others.length > 1 ? "s" : ""} compatible${others.length > 1 ? "s" : ""} avec ce créneau`}
            items={others}
            onPick={onPick}
          />
        )}
      </div>
    </>
  );
}

function DishSection({
  title, hint, items, onPick,
}: {
  title: string; hint: string;
  items: Suggestion[];
  onPick: (dish: Dish, batch: boolean) => void;
}) {
  return (
    <section>
      <div className="mb-2 flex items-baseline gap-2">
        <h3 className="text-[10px] uppercase tracking-[0.18em] text-foreground">{title}</h3>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(({ dish, reason, leftover, exhausted }) => (
          <SuggestionCard
            key={dish.id} dish={dish} reason={reason}
            leftover={leftover} exhausted={exhausted} onPick={onPick}
          />
        ))}
      </div>
    </section>
  );
}

function SuggestionCard({
  dish, reason, leftover, exhausted, onPick,
}: {
  dish: Dish; reason: string; leftover?: boolean; exhausted?: boolean;
  onPick: (dish: Dish, batch: boolean) => void;
}) {
  // The card is the pick target — no "Choisir" button, no score badge.
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPick(dish, false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(dish, false); }
      }}
      className={
        "group relative flex cursor-pointer flex-col rounded-xl border bg-card p-3 text-left transition-all hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
        // A leftover keeps the white card and earns a primary border instead.
        (leftover ? "border-primary" : "border-border/60 hover:border-primary")
      }
    >
      <DishCard
        dish={dish}
        status={
          leftover ? <StatusPill tone="primary" icon={<Repeat className="h-3 w-3" />}>{reason}</StatusPill>
          // Already covered — say so, but discreetly: it stays a valid pick.
          : exhausted ? <StatusPill tone="muted">{reason}</StatusPill>
          : undefined
        }
        actions={
          dish.rendement > 1 && !leftover ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onPick(dish, true); }}
              title="Batch : une cuisson, deux créneaux"
              className="ml-auto inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] transition-colors hover:border-foreground hover:bg-foreground hover:text-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Repeat className="h-3 w-3" />×2
            </button>
          ) : undefined
        }
      />
    </div>
  );
}
