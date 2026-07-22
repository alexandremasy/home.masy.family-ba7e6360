import { useMemo, useState } from "react";
import { WeatherIcon } from "@/components/weather-icon";
import { Input } from "@/components/input";
import { Card } from "@/components/card";
import { DataState } from "@/components/data-state";
import { Dialog, DialogContent } from "@/components/dialog";
import { Drawer, DrawerContent } from "@/components/drawer";
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
import { frLongDay, fromIso, type Dish, type Base, type Slot } from "@/lib/maison-data";
import type { WeatherCond } from "@/lib/mock-data";
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

/* ─────────────────────────────────────────────────────────────────────────────
   The meal plan, as a page.

   Its props are its OWN shapes, deliberately minimal — not the mock's types and
   not the api's. The mockup fills them from an in-memory plan, the cockpit from
   the persisted one, and neither model leaks into this file.

   A dish is an opaque `dishId` string: it is what the spotlight groups on, what
   the batch shading keys on, and what a pick hands back. The mockup's ids are
   already strings, the cockpit's are numbers it stringifies — this page never
   looks inside one.

   The window and the selection are the caller's state, not this page's: the
   caller is what fetches a fortnight of plan and the suggestions for one slot,
   so it has to own what those queries key on. What stays here is everything the
   data does not decide — hover spotlight, drag, the picker's search and filters.
   ──────────────────────────────────────────────────────────────────────────── */

/** A day's forecast, as the calendar shows it. Absent when nothing is known. */
export interface PlanWeatherView {
  cond: WeatherCond;
  minC: number;
  maxC: number;
  /** Drives the warm thermometer instead of the condition icon. */
  heatwave: boolean;
}

/** What sits on one slot. */
export interface PlanMealView {
  /** Opaque dish identity — spotlight, batch shading, and the pick handler use it. */
  dishId: string;
  dish: Dish;
}

/** One day of the visible window, both slots. */
export interface PlanDayView {
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  weather?: PlanWeatherView | null;
  midi: PlanMealView | null;
  soir: PlanMealView | null;
}

/** A coherence remark over the window, already worded. */
export interface PlanSignalView {
  text: string;
  /** Rendered as a bulleted list under the text. */
  items?: string[];
}

/** One ranked candidate for the selected slot. */
export interface PlanSuggestionView {
  /** Opaque dish identity, handed back on pick. */
  dishId: string;
  dish: Dish;
  /** Why the engine ranked it here, already worded. Shown only on leftover/exhausted. */
  reason: string;
  /** An existing cook still covers slots — finishing it beats cooking something new. */
  leftover?: boolean;
  /** Its cook is fully placed. Demoted, never removed. */
  exhausted?: boolean;
}

/** Which slot of which day. Both sides key their own plan rows off it. */
export interface SlotRef {
  date: string;
  slot: Slot;
}

export interface PlanificationTemplateProps {
  /** The visible window in order, 7 per calendar row. Two weeks from a Monday. */
  days: PlanDayView[];
  /** ISO today — today and everything after is the live surface, before it sits back. */
  today: string;
  /** Coherence remarks over the window; the count becomes the alert chip. */
  signals: PlanSignalView[];
  /** Scroll the window one week back. */
  onPrevWeek: () => void;
  /** Scroll the window one week forward. */
  onNextWeek: () => void;
  /** Back to the current week. Pass it only when the window has drifted — it is what renders the button. */
  onResetWeek?: () => void;
  /** The slot whose picker is open, or nothing. The caller owns it: the suggestions key on it. */
  selected: SlotRef | null;
  /** A slot was opened, or the picker was dismissed (`null`). */
  onSelect: (slot: SlotRef | null) => void;
  /** The ranked pool for `selected`, best first, already excluding what sits on the slot. */
  suggestions: PlanSuggestionView[];
  /** The pool is still on its way. */
  suggestionsLoading?: boolean;
  /** Put this dish on the selected slot. `batch` also books the next day's same slot. */
  onPick: (dishId: string, batch: boolean) => void;
  /** Clear the slot. Removes the meal from the plan, never the dish from the catalogue. */
  onRemove: (slot: SlotRef) => void;
  /** A meal was dragged onto another slot. Whatever sat there is replaced. */
  onMove: (from: SlotRef, to: SlotRef) => void;
  /** The plan is still on its way. */
  loading?: boolean;
  /** The plan could not be loaded. */
  error?: boolean;
  /** Retry handler for the failed state. */
  onRetry?: () => void;
}

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

type BatchStyle = { shade: string; badge: string; iteration: number };
type BatchInfo = Map<string, BatchStyle>;
const batchKey = (date: string, slot: Slot) => `${date}|${slot}`;

/** For every dish that appears on more than one slot in the visible window: one
    shade for the dish, and an iteration number per occurrence in date order — the
    first is 1, the second 2… Single-day dishes get nothing. */
function computeBatches(days: PlanDayView[]): BatchInfo {
  const byDish = new Map<string, { date: string; slot: Slot }[]>();
  for (const day of days) {
    for (const slot of ["midi", "soir"] as Slot[]) {
      const meal = day[slot];
      if (!meal) continue;
      const list = byDish.get(meal.dishId) ?? [];
      list.push({ date: day.date, slot });
      byDish.set(meal.dishId, list);
    }
  }
  const map: BatchInfo = new Map();
  let dishN = 0;
  for (const entries of byDish.values()) {
    if (entries.length < 2) continue; // single-day dish → no shade, no number
    dishN += 1;
    const style = BATCH_STYLES[(dishN - 1) % BATCH_STYLES.length];
    // `days` is already in order, and midi is pushed before soir, so occurrences
    // come out in the order they are lived.
    entries.forEach((e, i) =>
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

/** Title content only — the shell (Dialog or Drawer) takes it as its `title` slot. */
function SlotTitle({
  date,
  slot,
  weather,
}: {
  date: string;
  slot: Slot;
  weather?: PlanWeatherView | null;
}) {
  return (
    <>
      {cap(frLongDay(fromIso(date)))} · {slot === "midi" ? "Midi" : "Soir"}
      {weather && (
        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-xs font-normal text-muted-foreground">
          <WeatherIcon cond={weather.cond} className="h-3 w-3" animated={false} />
          {weather.maxC}°
        </span>
      )}
    </>
  );
}

/** "13 → 26 juillet", collapsing the month when both ends share it. */
function rangeLabel(days: PlanDayView[]): string {
  if (days.length === 0) return "";
  const first = fromIso(days[0].date);
  const last = fromIso(days[days.length - 1].date);
  const sameMonth = first.getMonth() === last.getMonth();
  const fmt = (d: Date, withMonth: boolean) =>
    d.toLocaleDateString(
      "fr-BE",
      withMonth ? { day: "numeric", month: "long" } : { day: "numeric" },
    );
  return `${fmt(first, !sameMonth)} → ${fmt(last, true)}`;
}

export function PlanificationTemplate({
  days,
  today,
  signals,
  onPrevWeek,
  onNextWeek,
  onResetWeek,
  selected,
  onSelect,
  suggestions,
  suggestionsLoading = false,
  onPick,
  onRemove,
  onMove,
  loading = false,
  error = false,
  onRetry,
}: PlanificationTemplateProps) {
  // Hovering a meal spotlights that dish: its other days stay lit, the rest dims.
  const [hoveredDish, setHoveredDish] = useState<string | null>(null);
  const batches = useMemo(() => computeBatches(days), [days]);
  const isDesktop = useIsDesktop();

  const selectedDay = selected ? days.find((d) => d.date === selected.date) : undefined;
  const currentMeal = selected && selectedDay ? selectedDay[selected.slot] : null;

  const closeSlot = (open: boolean) => {
    if (!open) onSelect(null);
  };

  // Built once, mounted in whichever shell the viewport calls for.
  const picker = selected ? (
    <SlotPicker
      slot={selected.slot}
      suggestions={suggestions}
      loading={suggestionsLoading}
      currentMeal={currentMeal}
      onRemove={currentMeal ? () => onRemove(selected) : undefined}
      onPick={onPick}
    />
  ) : null;

  return (
    <div className="space-y-6">
      {/* Calendar — 2 weeks shown, scrolled one week at a time */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-lg">{rangeLabel(days)}</p>
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
                        {s.items && s.items.length > 0 && (
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
            {onResetWeek && (
              <Button
                variant="outline"
                onClick={onResetWeek}
                className="h-9 rounded-full text-muted-foreground"
              >
                Aujourd'hui
              </Button>
            )}
            <div className="flex items-center gap-1">
              <Button
                onClick={onPrevWeek}
                aria-label="Semaine précédente"
                variant="outline"
                size="iconRound"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={onNextWeek}
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
          {loading || error ? (
            <DataState status={error ? "error" : "loading"} label="le plan" onRetry={onRetry} />
          ) : (
            <>
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
                  {days.map((day) => (
                    <DayCell
                      key={day.date}
                      day={day}
                      today={today}
                      batches={batches}
                      hoveredDish={hoveredDish}
                      onHover={setHoveredDish}
                      onSelect={onSelect}
                      onMove={onMove}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Suggestions — a Dialog on desktop, a Drawer on a phone. The mobile
          Dialog was a Drawer in disguise: anchored top-14 to make room for a
          close button hanging at -top-12, capped at 100dvh-4.5rem. vaul does
          that natively, from the bottom, with drag-to-dismiss. */}
      {isDesktop ? (
        <Dialog open={!!selected} onOpenChange={closeSlot}>
          {picker && selected && (
            <DialogContent
              className="max-h-[calc(100dvh-7rem)] max-w-2xl"
              title={
                <SlotTitle
                  date={selected.date}
                  slot={selected.slot}
                  weather={selectedDay?.weather}
                />
              }
            >
              {picker}
            </DialogContent>
          )}
        </Dialog>
      ) : (
        <Drawer open={!!selected} onOpenChange={closeSlot}>
          {picker && selected && (
            <DrawerContent
              className="max-h-[92dvh]"
              title={
                <SlotTitle
                  date={selected.date}
                  slot={selected.slot}
                  weather={selectedDay?.weather}
                />
              }
            >
              {picker}
            </DrawerContent>
          )}
        </Drawer>
      )}
    </div>
  );
}

// ------------------------------------------------------------
function DayCell({
  day,
  today,
  batches,
  hoveredDish,
  onHover,
  onSelect,
  onMove,
}: {
  day: PlanDayView;
  today: string;
  batches: BatchInfo;
  hoveredDish: string | null;
  onHover: (dishId: string | null) => void;
  onSelect: (s: SlotRef) => void;
  onMove: (from: SlotRef, to: SlotRef) => void;
}) {
  const date = fromIso(day.date);
  const isToday = day.date === today;
  // Today and everything ahead is the live planning surface — white. Past days
  // are done, so they sit back on the page colour.
  const past = day.date < today;
  const w = day.weather;

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
          className={"font-semibold leading-none tabular-nums " + (isToday ? "text-primary" : "")}
        >
          <span className="text-lg lg:text-xl">{date.getDate()}</span>
          <Eyebrow as="span" className="ml-1.5 lg:hidden">
            {date.toLocaleDateString("fr-BE", { weekday: "long" })}
          </Eyebrow>
        </span>
        {w && (
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
        )}
      </div>

      {/* Side by side on a phone row, stacked in a calendar column. The wider gap
          at lg is the breathing room above "soir". */}
      <div className="mt-1 grid flex-1 grid-cols-2 gap-1 p-1.5 lg:mt-1.5 lg:flex lg:flex-col lg:gap-3 lg:p-2">
        {(["midi", "soir"] as Slot[]).map((slot) => {
          const meal = day[slot];
          const batch = meal ? batches.get(batchKey(day.date, slot)) : undefined;
          // Dimmed when another dish is being hovered elsewhere in the grid.
          const dimmed = hoveredDish != null && meal?.dishId !== hoveredDish;
          return (
            <SlotCell
              key={slot}
              date={day.date}
              slot={slot}
              meal={meal}
              batch={batch}
              dimmed={dimmed}
              onHover={onHover}
              onOpen={() => onSelect({ date: day.date, slot })}
              onDropFrom={(from) => onMove(from, { date: day.date, slot })}
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
  meal,
  batch,
  dimmed = false,
  onHover,
  onOpen,
  onDropFrom,
}: {
  date: string;
  slot: Slot;
  meal: PlanMealView | null;
  batch?: BatchStyle;
  dimmed?: boolean;
  onHover?: (dishId: string | null) => void;
  onOpen: () => void;
  onDropFrom: (from: SlotRef) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

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
        const from = JSON.parse(raw) as SlotRef;
        if (from.date === date && from.slot === slot) return;
        onDropFrom(from);
      }}
      className={
        "group relative flex flex-1 flex-col transition-opacity duration-200 " +
        (dimmed ? "opacity-35" : "opacity-100")
      }
    >
      {meal ? (
        // Tap/click opens the picker — that's where you change or remove it, so it
        // works the same on a phone as with a mouse. Drag is a desktop bonus.
        <button
          type="button"
          onClick={onOpen}
          onMouseEnter={() => onHover?.(meal.dishId)}
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
            dish={meal.dish}
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
  slot,
  suggestions,
  loading,
  currentMeal,
  onPick,
  onRemove,
}: {
  slot: Slot;
  suggestions: PlanSuggestionView[];
  loading: boolean;
  currentMeal: PlanMealView | null;
  onPick: (dishId: string, batch: boolean) => void;
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
  // Focus on open is handled by DialogContent's onOpenAutoFocus — desktop only.

  // One ranked pool for the whole modal: the caller's engine orders it, the
  // filters only narrow it. Browsing never resurrects a dish the slot's hard
  // rules rejected. Filtering keeps the suggestion, not just its dish, so it is
  // matched by identity rather than by an id whose type is the caller's business.
  const shown = useMemo(() => {
    const keep = new Set(
      applyFilter(
        suggestions.map((s) => s.dish),
        filter,
        query,
      ),
    );
    return suggestions.filter((s) => keep.has(s.dish));
  }, [suggestions, filter, query]);

  // The engine's shortlist, then everything else it would still accept.
  const shortlist = shown.slice(0, 6);
  const others = shown.slice(6);

  const bases = useMemo(
    () => [...new Set(suggestions.map((s) => s.dish.base))].sort() as Base[],
    [suggestions],
  );
  const activeCount = countFilters(filter);

  // The title lives in the shell's `title` slot, not here: the two shells wire it
  // to different primitives (Radix vs vaul), so the body must stay neutral.
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
      {currentMeal && onRemove && (
        <div className="space-y-2">
          <Eyebrow size="xs">Repas planifié</Eyebrow>
          <Card variant="solid" padding="sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <DishCard dish={currentMeal.dish} />
              </div>
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" /> Retirer du plan
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* min-h-0 or the flex child refuses to shrink and the scroll never engages. */}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto sm:space-y-7">
        {loading && suggestions.length === 0 && (
          <DataState status="loading" label="les suggestions" />
        )}

        {!loading && shown.length === 0 && (
          <p className="px-1 py-6 text-sm text-muted-foreground">
            Aucun plat ne correspond — élargissez les critères.
          </p>
        )}

        {shortlist.length > 0 && (
          <DishSection
            title="Suggestions"
            hint={`Les mieux placées pour ce créneau${slot === "midi" ? " · complet" : " · léger"}`}
            items={shortlist}
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
  items: PlanSuggestionView[];
  onPick: (dishId: string, batch: boolean) => void;
}) {
  return (
    <section>
      <div className="mb-2 flex items-baseline gap-2">
        <h3 className="text-2xs uppercase tracking-eyebrow text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((s) => (
          <SuggestionCard key={s.dishId} suggestion={s} onPick={onPick} />
        ))}
      </div>
    </section>
  );
}

function SuggestionCard({
  suggestion,
  onPick,
}: {
  suggestion: PlanSuggestionView;
  onPick: (dishId: string, batch: boolean) => void;
}) {
  const { dishId, dish, reason, leftover, exhausted } = suggestion;
  // The card is the pick target — no "Choisir" button, no score badge.
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPick(dishId, false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPick(dishId, false);
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
                onPick(dishId, true);
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
