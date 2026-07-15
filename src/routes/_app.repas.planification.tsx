import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { WeatherIcon } from "@/components/WeatherIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DishFilters, applyFilter, isFilterActive, EMPTY_FILTER, type DishFilter } from "@/components/DishFilters";
import {
  dishById, suggestFor, coherenceSignals, initialPlan, calWeeks, iso,
  isWeekend, frLongDay, addDays, dayWeather, weatherHintFor, TODAY,
  type PlanEntry, type Slot, type Dish, type Base,
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
        <DialogContent className="max-w-2xl">
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
      className={
        "group relative flex flex-1 flex-col rounded-lg border p-2 text-left transition-all " +
        (dragOver ? "border-primary bg-primary/5 " : "border-transparent ") +
        (entry ? "bg-secondary/50 hover:border-border hover:bg-secondary hover:shadow-soft" : "")
      }
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
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
          className="mt-1 flex-1 cursor-grab active:cursor-grabbing"
        >
          <p className="line-clamp-2 text-sm font-medium leading-snug">{dish.name}</p>
          {isBatch && (
            <span className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-warm/15 px-1.5 py-0.5 text-[10px] text-warm">
              <Repeat className="h-3 w-3" />batch
            </span>
          )}
          <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button onClick={onOpen} aria-label="Changer" className="grid h-6 w-6 place-items-center rounded-md bg-card text-muted-foreground hover:text-foreground">
              <RefreshCw className="h-3 w-3" />
            </button>
            <button onClick={onRemove} aria-label="Retirer" className="grid h-6 w-6 place-items-center rounded-md bg-card text-muted-foreground hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={onOpen}
          aria-label={`Suggérer un plat — ${slot}`}
          className="mt-1 flex flex-1 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
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
  // Only count as "browsing" once the user moves off the slot's own default, so
  // an untouched modal still opens on the curated shortlist rather than a full list.
  const browsing =
    query.trim().length > 0 ||
    JSON.stringify(filter) !== JSON.stringify(baseline);

  const shown = useMemo(() => {
    const keep = new Set(applyFilter(ranked.map((s) => s.dish), filter, query).map((d) => d.id));
    const matching = ranked.filter((s) => keep.has(s.dish.id));
    return browsing ? matching : matching.slice(0, 6);
  }, [ranked, filter, query, browsing]);

  const bases = useMemo(
    () => [...new Set(ranked.map((s) => s.dish.base))].sort() as Base[],
    [ranked],
  );

  const w = dayWeather(date);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-serif text-xl">
          {frLongDay(date)} · {slot === "midi" ? "Midi" : "Soir"}
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[11px] font-normal text-muted-foreground">
            <WeatherIcon cond={w.cond} className="h-3 w-3" animated={false} />
            {w.maxC}°
          </span>
        </DialogTitle>
        <DialogDescription>
          {isWeekend(date)
            ? "Weekend, souple — c'est aussi le jour de production."
            : slot === "midi" ? "Midi semaine → emportable + réchauffable." : "Soir semaine → plutôt léger."}
          {w.heatwave && " Forte chaleur : les suggestions basculent vers froid/léger."}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un plat, ou un reste à écouler…"
            className="pl-8"
          />
        </div>
        <DishFilters value={filter} onChange={setFilter} bases={bases} />
      </div>

      <div className="max-h-[55vh] overflow-y-auto">
        {shown.length === 0 ? (
          <p className="px-1 py-6 text-sm text-muted-foreground">
            Aucun plat ne correspond — élargissez les critères.
          </p>
        ) : (
          <>
            <p className="mb-2 text-[11px] text-muted-foreground">
              {browsing
                ? `${shown.length} plat${shown.length > 1 ? "s" : ""} · classés par pertinence pour ce créneau`
                : `Suggestions ${slot === "midi" ? "complètes" : "légères"} pour ce créneau`}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {shown.map(({ dish, reason, score }) => (
                <SuggestionCard key={dish.id} dish={dish} reason={reason} score={score} onPick={onPick} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function SuggestionCard({
  dish, reason, score, onPick,
}: {
  dish: Dish; reason: string; score: number;
  onPick: (dish: Dish, batch: boolean) => void;
}) {
  // The card itself is the pick target — no "Choisir" button. The ×2 button
  // overlays it and stops propagation, so batch stays reachable in one gesture.
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPick(dish, false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(dish, false); }
      }}
      className="group relative flex cursor-pointer flex-col rounded-xl border border-border/60 p-3 text-left transition-all hover:border-primary hover:bg-secondary/40 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-serif text-base leading-tight">{dish.name}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {dish.base} · {dish.densite} · {dish.temperature}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{score}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {dish.modifiers.slice(0, 4).map((m) => (
          <Badge key={m.name} variant="secondary" className="text-[10px] font-normal">{m.name}</Badge>
        ))}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="inline-flex items-start gap-1 text-[11px] text-muted-foreground">
          <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-primary" />{reason}
        </p>
        {dish.rendement > 1 && (
          <Button
            size="sm" variant="outline"
            onClick={(e) => { e.stopPropagation(); onPick(dish, true); }}
            className="h-7 shrink-0 gap-1 text-xs"
            title="Batch : couvre aussi le créneau suivant"
          >
            <Repeat className="h-3 w-3" />×2
          </Button>
        )}
      </div>
    </div>
  );
}
