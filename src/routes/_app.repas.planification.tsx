import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { WeatherIcon } from "@/components/weather-icon";
import { Input } from "@/components/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/drawer";
import { useIsDesktop } from "@/lib/use-media";
import {
  DishFilters,
  applyFilter,
  countFilters,
  EMPTY_FILTER,
  type DishFilter,
} from "@/components/dish-filters";
import { DishCard, StatusPill } from "@/components/dish-card";
import { cap } from "@/lib/utils";
import {
  dishById,
  suggestFor,
  coherenceSignals,
  initialPlan,
  calWeeks,
  iso,
  isWeekend,
  frLongDay,
  addDays,
  dayWeather,
  weatherHintFor,
  TODAY,
  type PlanEntry,
  type Slot,
  type Dish,
  type Base,
  type Suggestion,
} from "@/lib/maison-data";
import {
  Sparkles,
  Search,
  AlertTriangle,
  X,
  Sun,
  Moon,
  ThermometerSun,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { Eyebrow } from "@/components/eyebrow";

export const Route = createFileRoute("/_app/repas/planification")({
  component: RepasPage,
  head: () => ({ meta: [{ title: "Repas — Cockpit" }] }),
});

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// One style per batch (a dish spread over several days), from the Figma palette.
// `shade` is the meal's background (teinte 10 light / 80 dark); `badge` is the
// iteration number's colour (teinte 70 light / 40 dark) — a quiet coloured digit
// on a pale disc rather than a filled chip.
const BATCH_STYLES = [
  { shade: "bg-[#e7f8f9] dark:bg-[#116069]/50", badge: "text-[#157a84] dark:text-[#56cad4]" }, // Teal
  { shade: "bg-[#e7f4fa] dark:bg-[#0e506e]/50", badge: "text-[#11658c] dark:text-[#52b2de]" }, // Blue
  { shade: "bg-[#e6f4ef] dark:bg-[#10503e]/50", badge: "text-[#14664f] dark:text-[#56b598]" }, // Green
  { shade: "bg-[#e2dcee] dark:bg-[#44316e]/50", badge: "text-[#5f479e] dark:text-[#c4bade]" }, // Purple
  { shade: "bg-[#f9eaf5] dark:bg-[#732254]/50", badge: "text-[#8e2c6b] dark:text-[#d76bb9]" }, // Pink
  { shade: "bg-[#fcf8e7] dark:bg-[#815f18]/50", badge: "text-[#a07b1f] dark:text-[#ebce5e]" }, // Yellow
];

type BatchInfo = Map<string, { shade: string; badge: string; iteration: number }>;
const batchKey = (date: string, slot: Slot) => `${date}|${slot}`;

/** For every dish that appears on more than one slot in the visible window: one
    shade for the dish, and an iteration number per occurrence in date order — the
    first is 1, the second 2… Single-day dishes get nothing. */
function computeBatches(plan: PlanEntry[], windowDates: string[]): BatchInfo {
  const inWindow = new Set(windowDates);
  const byDish = new Map<string, PlanEntry[]>();
  for (const e of plan) {
    if (!inWindow.has(e.date)) continue;
    (byDish.get(e.dishId) ?? byDish.set(e.dishId, []).get(e.dishId)!).push(e);
  }
  const map: BatchInfo = new Map();
  let dishN = 0;
  for (const entries of byDish.values()) {
    if (entries.length < 2) continue; // single-day dish → no shade, no number
    dishN += 1;
    const style = BATCH_STYLES[(dishN - 1) % BATCH_STYLES.length];
    const ordered = [...entries].sort((a, b) =>
      a.date === b.date ? (a.slot === "midi" ? -1 : 1) : a.date < b.date ? -1 : 1,
    );
    ordered.forEach((e, i) =>
      map.set(batchKey(e.date, e.slot), {
        shade: style.shade,
        badge: style.badge,
        iteration: i + 1,
      }),
    );
  }
  return map;
}

/** The slot's time-of-day marker: sun for midi, moon for soir. Replaces the
    "Midi"/"Soir" text label, sitting before the dish name instead. */
function SlotIcon({ slot, className = "" }: { slot: Slot; className?: string }) {
  const Icon = slot === "midi" ? Sun : Moon;
  return (
    <Icon
      className={"h-3.5 w-3.5 shrink-0 " + className}
      aria-label={slot === "midi" ? "Midi" : "Soir"}
    />
  );
}

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
    d.toLocaleDateString(
      "fr-BE",
      withMonth ? { day: "numeric", month: "long" } : { day: "numeric" },
    );
  return `${fmt(first, !sameMonth)} → ${fmt(last, true)}`;
}

function RepasPage() {
  const [plan, setPlan] = useState<PlanEntry[]>(initialPlan);
  const [selected, setSelected] = useState<{ date: string; slot: Slot } | null>(null);
  // Hovering a meal spotlights that dish: its other days stay lit, the rest dims.
  const [hoveredDish, setHoveredDish] = useState<string | null>(null);
  // Scrolls by one week — consecutive views share a week, like the sliding plan window.
  const [weekOffset, setWeekOffset] = useState(0);
  const weeks = useMemo(() => calWeeks(weekOffset), [weekOffset]);
  const batches = useMemo(() => computeBatches(plan, weeks.flat().map(iso)), [plan, weeks]);

  const remove = (date: string, slot: Slot) =>
    setPlan((p) => p.filter((e) => !(e.date === date && e.slot === slot)));
  const upsert = (entry: PlanEntry) =>
    setPlan((p) => [...p.filter((e) => !(e.date === entry.date && e.slot === entry.slot)), entry]);
  const move = (from: { date: string; slot: Slot }, to: { date: string; slot: Slot }) => {
    setPlan((p) => {
      const src = p.find((e) => e.date === from.date && e.slot === from.slot);
      if (!src) return p;
      const withoutBoth = p.filter(
        (e) =>
          !(e.date === from.date && e.slot === from.slot) &&
          !(e.date === to.date && e.slot === to.slot),
      );
      return [...withoutBoth, { ...src, date: to.date, slot: to.slot }];
    });
  };

  const signals = useMemo(() => coherenceSignals(plan), [plan]);
  const selectedDate = selected ? new Date(selected.date) : null;
  const isDesktop = useIsDesktop();

  const closeSlot = (open: boolean) => {
    if (!open) setSelected(null);
  };

  // Built once, mounted in whichever shell the viewport calls for.
  const picker =
    selected && selectedDate ? (
      <SlotPicker
        date={selectedDate}
        slot={selected.slot}
        plan={plan}
        onRemove={
          plan.some((e) => e.date === selected.date && e.slot === selected.slot)
            ? () => {
                remove(selected.date, selected.slot);
                setSelected(null);
              }
            : undefined
        }
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
          <div className="flex items-center gap-2">
            <p className="font-semibold text-lg">{rangeLabel(weeks)}</p>
            {/* Coherence remarks are a warm alert icon by the period; the messages
                are the tooltip, so they don't take a full-width block on screen. */}
            {signals.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={`${signals.length} remarque${signals.length > 1 ? "s" : ""} sur la période`}
                    className="inline-flex items-center gap-1 rounded-full bg-warm/15 px-2 py-0.5 text-warm transition-colors hover:bg-warm/25"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold tabular-nums">{signals.length}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  align="start"
                  className="max-w-xs border border-border bg-popover p-3 text-popover-foreground shadow-lift"
                >
                  <div className="space-y-2.5">
                    {signals.map((s, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-xs font-semibold text-foreground">{s.text}</p>
                        {s.items && (
                          <ul className="list-disc space-y-0.5 pl-3.5 text-xs text-muted-foreground">
                            {s.items.map((it) => (
                              <li key={it}>{it}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Only worth offering once you've drifted off the current week.
                Same height (h-9) as the chevrons it sits with. */}
            {weekOffset !== 0 && (
              <Button
                variant="outline"
                onClick={() => setWeekOffset(0)}
                className="h-9 rounded-full text-muted-foreground"
              >
                Aujourd'hui
              </Button>
            )}
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setWeekOffset((o) => o - 1)}
                aria-label="Semaine précédente"
                variant="outline"
                size="iconRound"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setWeekOffset((o) => o + 1)}
                aria-label="Semaine suivante"
                variant="outline"
                size="iconRound"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* One framed table in both layouts. Weekday labels sit above it as column
            headers (desktop only). The 1px grid gaps show the border colour behind,
            so every cell shares hairlines with its neighbours: 7 columns on desktop,
            a single column of stacked cells on a phone — same table, same 1px gaps. */}
        <div className="mt-5">
          <div className="hidden lg:grid lg:grid-cols-7 lg:gap-px">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="px-2.5 pb-2 text-xs uppercase tracking-eyebrow text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="overflow-hidden rounded-xl lg:border lg:border-border/60">
            <div className="grid gap-0.5 lg:grid-cols-7 lg:gap-px lg:bg-border/60">
              {weeks.flat().map((d) => (
                <DayCell
                  key={iso(d)}
                  date={d}
                  plan={plan}
                  batches={batches}
                  hoveredDish={hoveredDish}
                  onHover={setHoveredDish}
                  onSelect={setSelected}
                  onMove={move}
                />
              ))}
            </div>
          </div>
        </div>
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
                  <DialogTitle className="flex items-center gap-2 text-lg">
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
          <DrawerContent className="flex max-h-[92dvh] flex-col gap-4 bg-background px-4 pb-4">
            {picker && (
              <>
                <DrawerHeader className="p-0 text-left">
                  <DrawerTitle className="flex items-center gap-2 text-lg">
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
  date,
  plan,
  batches,
  hoveredDish,
  onHover,
  onSelect,
  onMove,
}: {
  date: Date;
  plan: PlanEntry[];
  batches: BatchInfo;
  hoveredDish: string | null;
  onHover: (dishId: string | null) => void;
  onSelect: (s: { date: string; slot: Slot }) => void;
  onMove: (from: { date: string; slot: Slot }, to: { date: string; slot: Slot }) => void;
}) {
  const key = iso(date);
  const today = key === iso(TODAY);
  // Today and everything ahead is the live planning surface — white. Past days
  // are done, so they sit back on the page colour.
  const past = date.getTime() < TODAY.getTime();
  const w = dayWeather(date);

  return (
    <div
      className={
        // A plain table cell in both layouts — the hairline between cells comes
        // from the parent grid's 1px gap, so the cell carries no border of its own.
        "flex flex-col overflow-hidden transition-colors lg:min-h-[12.5rem] lg:hover:ring-1 lg:hover:ring-inset lg:hover:ring-foreground/25 " +
        // Today and ahead are white; past days just take the page colour — no
        // added fill. bg-background (not transparent) so it still masks the
        // table hairline, but it reads as the page, not a tinted block.
        (past ? "bg-background" : "bg-card")
      }
    >
      {/* Day header — date left, that day's weather right. The weather drives the
          suggestions. Without a weekday column below lg, the header carries the day. */}
      <div className="flex items-baseline justify-between gap-1 px-2.5 pt-2 lg:pt-2.5">
        <span
          className={"font-semibold leading-none tabular-nums " + (today ? "text-primary" : "")}
        >
          <span className="text-lg lg:text-xl">{date.getDate()}</span>
          <Eyebrow as="span" className="ml-1.5 lg:hidden">
            {date.toLocaleDateString("fr-BE", { weekday: "long" })}
          </Eyebrow>
        </span>
        <span
          className="flex items-center gap-1 text-muted-foreground"
          title={`${w.minC}° / ${w.maxC}°${w.heatwave ? " · forte chaleur" : ""}`}
        >
          {w.heatwave ? (
            <ThermometerSun className="h-4 w-4 text-warm" />
          ) : (
            <WeatherIcon cond={w.cond} className="h-4 w-4" />
          )}
          <span className={"text-xs tabular-nums " + (w.heatwave ? "text-warm" : "")}>
            {w.maxC}°
          </span>
        </span>
      </div>

      {/* Side by side on a phone row, stacked in a calendar column. The wider gap
          at lg is the breathing room above "soir". */}
      <div className="mt-1 grid flex-1 grid-cols-2 gap-1 p-1.5 lg:mt-1.5 lg:flex lg:flex-col lg:gap-3 lg:p-2">
        {(["midi", "soir"] as Slot[]).map((slot) => {
          const entry = plan.find((e) => e.date === key && e.slot === slot);
          const batch = entry ? batches.get(batchKey(key, slot)) : undefined;
          // Dimmed when another dish is being hovered elsewhere in the grid.
          const dimmed = hoveredDish != null && entry?.dishId !== hoveredDish;
          return (
            <SlotCell
              key={slot}
              date={key}
              slot={slot}
              entry={entry}
              batch={batch}
              dimmed={dimmed}
              onHover={onHover}
              onOpen={() => onSelect({ date: key, slot })}
              onDropFrom={(from) => onMove(from, { date: key, slot })}
            />
          );
        })}
      </div>
    </div>
  );
}

function SlotCell({
  date,
  slot,
  entry,
  batch,
  dimmed = false,
  onHover,
  onOpen,
  onDropFrom,
}: {
  date: string;
  slot: Slot;
  entry?: PlanEntry;
  batch?: { shade: string; badge: string; iteration: number };
  dimmed?: boolean;
  onHover?: (dishId: string | null) => void;
  onOpen: () => void;
  onDropFrom: (from: { date: string; slot: Slot }) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const dish = entry ? dishById(entry.dishId) : undefined;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
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
        "group relative flex flex-1 flex-col transition-opacity duration-200 " +
        (dimmed ? "opacity-35" : "opacity-100")
      }
    >
      {entry && dish ? (
        // Tap/click opens the picker — that's where you change or remove it, so it
        // works the same on a phone as with a mouse. Drag is a desktop bonus.
        <button
          type="button"
          onClick={onOpen}
          onMouseEnter={() => onHover?.(entry.dishId)}
          onMouseLeave={() => onHover?.(null)}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("application/json", JSON.stringify({ date, slot }));
            e.dataTransfer.effectAllowed = "move";
          }}
          className={
            // A dish spread over several days wears its batch shade; a single-day
            // dish gets a faint primary wash (≈ Teal/00–10). The midi/soir marker
            // leads the name.
            "flex-1 cursor-grab rounded-lg p-2 text-left transition-colors active:cursor-grabbing " +
            (dragOver
              ? "ring-1 ring-inset ring-primary " + (batch ? batch.shade : "bg-primary/10")
              : batch
                ? batch.shade + " hover:brightness-[0.97]"
                : "bg-primary/[0.06] hover:bg-primary/10")
          }
        >
          <DishCard
            dish={dish}
            variant="compact"
            leading={
              <span className="inline-flex items-center gap-1">
                <SlotIcon slot={slot} className="text-muted-foreground" />
                {batch && (
                  <span
                    title={`${batch.iteration}ᵉ fois cette fenêtre`}
                    className={
                      "inline-grid h-4 w-4 shrink-0 place-items-center rounded-full bg-background/70 text-2xs font-semibold tabular-nums " +
                      batch.badge
                    }
                  >
                    {batch.iteration}
                  </span>
                )}
              </span>
            }
          />
        </button>
      ) : (
        <button
          onClick={onOpen}
          aria-label={`Suggérer un plat — ${slot}`}
          // min-h-11 = a thumb. In the phone's 2-column row `flex-1` has no height
          // to fill, so the target collapsed to the icon.
          className={
            "flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-dashed text-xs text-muted-foreground transition-colors " +
            (dragOver
              ? "border-primary bg-primary/5 text-primary"
              : "border-border hover:border-primary hover:text-primary")
          }
        >
          <SlotIcon slot={slot} className="opacity-60" />
          <Sparkles className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ------------------------------------------------------------
function SlotPicker({
  date,
  slot,
  plan,
  onPick,
  onRemove,
}: {
  date: Date;
  slot: Slot;
  plan: PlanEntry[];
  onPick: (dish: Dish, batch: boolean) => void;
  onRemove?: () => void; // present only when the slot already holds a meal
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
  // Browsing never resurrects a dish the slot's hard rules rejected. In the edit
  // modal the planned dish is excluded — it's shown in its own block above, so
  // offering it again in the list is noise until it's been removed.
  const ranked = useMemo(() => {
    const placed = plan.find((e) => e.date === iso(date) && e.slot === slot)?.dishId;
    const all = suggestFor(date, slot, plan, hint, 200);
    return placed ? all.filter((s) => s.dish.id !== placed) : all;
  }, [date, slot, plan, hint]);

  const shown = useMemo(() => {
    const keep = new Set(
      applyFilter(
        ranked.map((s) => s.dish),
        filter,
        query,
      ).map((d) => d.id),
    );
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
  // The meal already on this slot, if any — its presence is what makes this the
  // "edit" modal rather than the "add" one.
  const current = plan.find((e) => e.date === iso(date) && e.slot === slot);
  const currentDish = current ? dishById(current.dishId) : undefined;

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
          {/* Stays a quiet outline whether or not filters are on; a small teal
              count is the only tell, instead of the whole button going solid. */}
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtres
            {activeCount > 0 && (
              <span className="rounded-full bg-primary/15 px-1.5 text-xs font-medium tabular-nums text-primary">
                {activeCount}
              </span>
            )}
            <ChevronDown
              className={"h-3.5 w-3.5 transition-transform " + (filtersOpen ? "rotate-180" : "")}
            />
          </button>
        </div>

        {filtersOpen && <DishFilters value={filter} onChange={setFilter} bases={bases} />}
      </div>

      {/* Edit modal only: the meal already planned sits under the filters, above
          the list you'd pick a replacement from. The action clears the slot — it
          doesn't delete the dish — so it's a small "unschedule" affordance on the
          card (an ✕, not a bin). */}
      {currentDish && onRemove && (
        <div className="space-y-2">
          <Eyebrow size="xs">Repas planifié</Eyebrow>
          <div className="flex items-start justify-between gap-2 rounded-xl border border-border/60 bg-card p-3">
            <div className="min-w-0 flex-1">
              <DishCard dish={currentDish} />
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" /> Retirer du plan
            </button>
          </div>
        </div>
      )}

      {/* min-h-0 or the flex child refuses to shrink and the scroll never engages. */}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto sm:space-y-7">
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
  title,
  hint,
  items,
  onPick,
}: {
  title: string;
  hint: string;
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
            key={dish.id}
            dish={dish}
            reason={reason}
            leftover={leftover}
            exhausted={exhausted}
            onPick={onPick}
          />
        ))}
      </div>
    </section>
  );
}

function SuggestionCard({
  dish,
  reason,
  leftover,
  exhausted,
  onPick,
}: {
  dish: Dish;
  reason: string;
  leftover?: boolean;
  exhausted?: boolean;
  onPick: (dish: Dish, batch: boolean) => void;
}) {
  // The card is the pick target — no "Choisir" button, no score badge.
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPick(dish, false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPick(dish, false);
        }
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
          leftover ? (
            <StatusPill tone="primary">{reason}</StatusPill>
          ) : // Already covered — say so, but discreetly: it stays a valid pick.
          exhausted ? (
            <StatusPill tone="muted">{reason}</StatusPill>
          ) : undefined
        }
        actions={
          dish.rendement > 1 && !leftover ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPick(dish, true);
              }}
              title="Batch : une cuisson, deux créneaux"
              // Shaped like the attribute tags it sits with, but it acts — hence
              // the border and the hover.
              className="ml-auto inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-0.5 text-2xs transition-colors hover:border-foreground hover:bg-foreground hover:text-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Batch ×2
            </button>
          ) : undefined
        }
      />
    </div>
  );
}
