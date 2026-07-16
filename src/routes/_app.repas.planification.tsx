import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { WeatherIcon } from "@/components/WeatherIcon";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsDesktop } from "@/lib/use-media";
import { DishFilters, applyFilter, countFilters, EMPTY_FILTER, type DishFilter } from "@/components/DishFilters";
import { DishCard, StatusPill } from "@/components/DishCard";
import { cap } from "@/lib/utils";
import {
  dishById, suggestFor, coherenceSignals, initialPlan, calWeeks, iso,
  isWeekend, frLongDay, addDays, dayWeather, weatherHintFor, TODAY,
  type PlanEntry, type Slot, type Dish, type Base, type Suggestion,
} from "@/lib/maison-data";
import {
  Sparkles, X, RefreshCw, Search, Repeat, Info, AlertTriangle, Package, Move,
  ThermometerSun, ChevronLeft, ChevronRight, ChevronDown, SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eyebrow } from "@/components/Eyebrow";

export const Route = createFileRoute("/_app/repas/planification")({
  component: RepasPage,
  head: () => ({ meta: [{ title: "Repas — Cockpit" }] }),
});

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/** Title content only — the shell supplies DialogTitle or DrawerTitle around it. */
function SlotTitle({ date, slot }: { date: Date; slot: Slot }) {
  const w = dayWeather(date);
  return (
    <>
      {cap(frLongDay(date))} · {slot === "midi" ? "Midi" : "Soir"}
      <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-xs font-normal text-muted-foreground">
        <WeatherIcon cond={w.cond} className="h-3 w-3" animated={false} />
        {w.maxC}°
      </span>
    </>
  );
}

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
  const isDesktop = useIsDesktop();

  const closeSlot = (open: boolean) => { if (!open) setSelected(null); };

  // Built once, mounted in whichever shell the viewport calls for.
  const picker = selected && selectedDate ? (
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
  ) : null;

  return (
    <div className="space-y-6">
      {/* Calendar — 2 weeks shown, scrolled one week at a time */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-lg">{rangeLabel(weeks)}</p>
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
              <Button
        onClick={() => setWeekOffset((o) => o - 1)}
        aria-label="Semaine précédente"
        variant="outline" size="iconRound"
       >
        <ChevronLeft className="h-4 w-4" />
       </Button>
              <Button
        onClick={() => setWeekOffset((o) => o + 1)}
        aria-label="Semaine suivante"
        variant="outline" size="iconRound"
       >
        <ChevronRight className="h-4 w-4" />
       </Button>
            </div>
          </div>
        </div>

        {/* Coherence — it describes the weeks on screen, so it lives under their
            navigation. Each remark is an Alert: warn carries the terracotta tone,
            the rest are neutral notes. */}
        {signals.length > 0 && (
          <div className="mt-3 space-y-2">
            {signals.slice(0, 4).map((s, i) => (
              <Alert key={i} variant={s.tone === "warn" ? "warn" : "default"}>
                {s.tone === "warn" ? <AlertTriangle /> : <Info />}
                <AlertDescription className={s.tone === "warn" ? "text-foreground" : undefined}>
                  {s.text}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Weekday columns only exist once there ARE columns. */}
        {/* Desktop reads as one framed table, not a row of cards: a single 7-col
            grid (weekday head + 14 days) whose 1px gaps show the border colour
            behind, so cells share hairlines. A phone can't hold a 7×2 table, so
            below lg the days stack as full-width cards. */}
        <div className="mt-5 lg:overflow-hidden lg:rounded-xl lg:border lg:border-border/60">
          <div className="space-y-2 lg:grid lg:grid-cols-7 lg:gap-px lg:space-y-0 lg:bg-border/60">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="hidden bg-secondary/60 px-2.5 py-2 text-xs uppercase tracking-eyebrow text-muted-foreground lg:block"
              >
                {d}
              </div>
            ))}
            {weeks.flat().map((d) => (
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
        </div>

        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Move className="h-3 w-3" /> Glissez un plat vers un autre créneau pour le déplacer.
        </p>
      </div>

      {/* Suggestions — a Dialog on desktop, a Drawer on a phone. The mobile
          Dialog was a Drawer in disguise: anchored top-14 to make room for a
          close button hanging at -top-12, capped at 100dvh-4.5rem. vaul does
          that natively, from the bottom, with drag-to-dismiss. */}
      {isDesktop ? (
        <Dialog open={!!selected} onOpenChange={closeSlot}>
          <DialogContent className="flex max-h-[calc(100dvh-7rem)] max-w-2xl flex-col gap-7 bg-background">
            {picker && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 font-serif text-lg">
                    <SlotTitle date={selectedDate!} slot={selected!.slot} />
                  </DialogTitle>
                </DialogHeader>
                {picker}
              </>
            )}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={!!selected} onOpenChange={closeSlot}>
          <DrawerContent className="max-h-[92dvh] bg-background px-4 pb-4">
            {picker && (
              <>
                <DrawerHeader className="px-0 pb-2 text-left">
                  <DrawerTitle className="flex items-center gap-2 font-serif text-lg">
                    <SlotTitle date={selectedDate!} slot={selected!.slot} />
                  </DrawerTitle>
                </DrawerHeader>
                {picker}
              </>
            )}
          </DrawerContent>
        </Drawer>
      )}
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
        // Mobile: an outlined card. Desktop: a plain cell — the hairline comes
        // from the parent grid's 1px gap, so it drops its own border and radius.
        "flex flex-col overflow-hidden rounded-xl border border-border/60 bg-background transition-colors lg:min-h-[12.5rem] lg:rounded-none lg:border-0 " +
        (today ? "ring-2 ring-primary/50 lg:ring-inset" : "")
      }
    >
      {/* Day header — date left, that day's weather right. The weather drives the
          suggestions. Without a weekday column below lg, the header carries the day. */}
      <div className="flex items-baseline justify-between gap-1 px-2.5 pt-2.5">
        <span className={"font-semibold leading-none tabular-nums " + (today ? "text-primary" : "")}>
          <span className="text-xl">{date.getDate()}</span>
          <Eyebrow as="span" className="ml-1.5 lg:hidden">
            {date.toLocaleDateString("fr-BE", { weekday: "long" })}
          </Eyebrow>
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

      {/* Side by side on a phone row, stacked in a calendar column. The wider gap
          at lg is the breathing room above "soir". */}
      <div className="mt-1.5 grid flex-1 grid-cols-2 gap-1.5 p-2 lg:flex lg:flex-col lg:gap-3">
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
      <div className="flex items-center justify-between px-1 pb-1 text-2xs uppercase tracking-eyebrow text-muted-foreground">
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
              : "border-border/60 bg-card hover:border-border hover:shadow-soft")
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
          // min-h-11 = a thumb. In the phone's 2-column row `flex-1` has no height
          // to fill, so the target collapsed to the icon.
          className={
            "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed text-xs text-muted-foreground transition-colors " +
            (dragOver ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary hover:text-primary")
          }
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="lg:hidden">Ajouter</span>
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hint = useMemo(() => weatherHintFor(date), [date]);
  // Focus on open is handled by DialogContent's onOpenAutoFocus — desktop only.

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
  const activeCount = countFilters(filter);

  const w = dayWeather(date);

  // The title lives in the shell, not here: DialogTitle and DrawerTitle come
  // from different contexts (Radix vs vaul), so the body must stay neutral.
  return (
    <>
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Chercher un plat…"
              className="bg-card pl-8"
            />
          </div>
          {/* Collapsed by default. The count is not decoration: the slot opens with
              its density filter already on, and a silent filter is a trap. */}
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            className={
              "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors " +
              (activeCount > 0
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground")
            }
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtres
            {activeCount > 0 && <span className="tabular-nums">· {activeCount}</span>}
            <ChevronDown className={"h-3.5 w-3.5 transition-transform " + (filtersOpen ? "rotate-180" : "")} />
          </button>
        </div>

        {filtersOpen && <DishFilters value={filter} onChange={setFilter} bases={bases} />}
      </div>

      {/* min-h-0 or the flex child refuses to shrink and the scroll never engages. */}
      <div className="min-h-0 flex-1 space-y-7 overflow-y-auto">
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
        <h3 className="text-2xs uppercase tracking-eyebrow text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{hint}</p>
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
              // Shaped like the attribute tags it sits with, but it acts — hence
              // the border and the hover.
              className="ml-auto inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-0.5 text-2xs transition-colors hover:border-foreground hover:bg-foreground hover:text-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Repeat className="h-3 w-3" />×2
            </button>
          ) : undefined
        }
      />
    </div>
  );
}
