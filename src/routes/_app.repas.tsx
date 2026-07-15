import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  dishes, dishById, suggestFor, coherenceSignals, initialPlan, CAL_WEEKS, iso,
  isWeekend, isPast, frLongDay, addDays, TODAY,
  type PlanEntry, type Slot, type Dish, type WeatherHint,
} from "@/lib/maison-data";
import {
  Sun, ThermometerSun, Sparkles, X, RefreshCw, Search, Repeat, Flame, Info,
  AlertTriangle, Package, Move, UtensilsCrossed,
} from "lucide-react";

export const Route = createFileRoute("/_app/maison/repas")({
  component: RepasPage,
  head: () => ({ meta: [{ title: "Repas — Maison" }] }),
});

const mockWeather: WeatherHint = { heatwave: false, label: "Doux, 18°" };
const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function RepasPage() {
  const [plan, setPlan] = useState<PlanEntry[]>(initialPlan);
  const [selected, setSelected] = useState<{ date: string; slot: Slot } | null>(null);
  const [query, setQuery] = useState("");

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
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
      {/* ---- Calendar: 2 weeks, monday-first ---- */}
      <div>
        <div className="mb-2 grid grid-cols-7 gap-2 px-1">
          {WEEKDAYS.map((d) => (
            <p key={d} className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{d}</p>
          ))}
        </div>

        <div className="space-y-2">
          {CAL_WEEKS.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-2">
              {week.map((d) => (
                <DayCell
                  key={iso(d)}
                  date={d}
                  plan={plan}
                  selected={selected}
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

      {/* ---- Rail: context, or the selected slot. Never a modal. ---- */}
      <aside className="lg:sticky lg:top-24 space-y-3">
        {selected && selectedDate ? (
          <SlotPanel
            date={selectedDate}
            slot={selected.slot}
            plan={plan}
            query={query}
            onQuery={setQuery}
            onClose={() => { setSelected(null); setQuery(""); }}
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
              setQuery("");
            }}
          />
        ) : (
          <ContextPanel signals={signals} />
        )}
      </aside>
    </div>
  );
}

// ------------------------------------------------------------
function DayCell({
  date, plan, selected, onSelect, onRemove, onMove,
}: {
  date: Date;
  plan: PlanEntry[];
  selected: { date: string; slot: Slot } | null;
  onSelect: (s: { date: string; slot: Slot }) => void;
  onRemove: (date: string, slot: Slot) => void;
  onMove: (from: { date: string; slot: Slot }, to: { date: string; slot: Slot }) => void;
}) {
  const key = iso(date);
  const weekend = isWeekend(date);
  const past = isPast(date);
  const today = key === iso(TODAY);

  return (
    <div
      className={
        "flex min-h-[9.5rem] flex-col overflow-hidden rounded-xl border transition-colors " +
        (past ? "border-border/40 bg-transparent opacity-45 " : weekend ? "border-warm/40 bg-warm/5 " : "border-border/60 bg-card ") +
        (today ? "ring-2 ring-primary/50" : "")
      }
    >
      <div className="flex items-baseline justify-between px-2 pt-2">
        <span className={"font-serif text-lg leading-none tabular-nums " + (today ? "text-primary" : past ? "text-muted-foreground" : "")}>
          {date.getDate()}
        </span>
        {weekend && !past && <Flame className="h-3 w-3 text-warm" aria-label="Jour de batch" />}
      </div>

      <div className="mt-1.5 flex flex-1 flex-col gap-1 p-1.5">
        {(["midi", "soir"] as Slot[]).map((slot) => (
          <SlotCell
            key={slot}
            date={key}
            slot={slot}
            entry={plan.find((e) => e.date === key && e.slot === slot)}
            weekend={weekend}
            past={past}
            active={selected?.date === key && selected.slot === slot}
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
  date, slot, entry, weekend, past, active, onOpen, onRemove, onDropFrom,
}: {
  date: string; slot: Slot; entry?: PlanEntry; weekend: boolean; past: boolean; active: boolean;
  onOpen: () => void; onRemove: () => void;
  onDropFrom: (from: { date: string; slot: Slot }) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const dish = entry ? dishById(entry.dishId) : undefined;
  const isBatch = !!entry?.batchOfDate;

  if (past && !dish) return <div className="flex-1" />;

  return (
    <div
      onDragOver={past ? undefined : (e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={past ? undefined : (e) => {
        setDragOver(false);
        const raw = e.dataTransfer.getData("application/json");
        if (!raw) return;
        const from = JSON.parse(raw) as { date: string; slot: Slot };
        if (from.date === date && from.slot === slot) return;
        onDropFrom(from);
      }}
      className={
        "group relative flex flex-1 flex-col rounded-lg border p-1.5 text-left transition-all " +
        (dragOver ? "border-primary bg-primary/5 " : active ? "border-primary " : "border-transparent ") +
        (entry ? "bg-secondary/50" : "")
      }
    >
      <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>{slot === "midi" ? "Midi" : "Soir"}</span>
        {!weekend && !past && slot === "midi" && !entry && <Package className="h-2.5 w-2.5" aria-label="Emportable" />}
      </div>

      {entry && dish ? (
        <div
          draggable={!past}
          onDragStart={(e) => {
            e.dataTransfer.setData("application/json", JSON.stringify({ date, slot }));
            e.dataTransfer.effectAllowed = "move";
          }}
          className={"mt-0.5 flex-1 " + (past ? "" : "cursor-grab active:cursor-grabbing")}
        >
          <p className="line-clamp-2 text-xs font-medium leading-snug">{dish.name}</p>
          {isBatch && (
            <span className="mt-1 inline-flex items-center gap-0.5 rounded-full bg-warm/15 px-1.5 py-0.5 text-[9px] text-warm">
              <Repeat className="h-2.5 w-2.5" />batch
            </span>
          )}
          {!past && (
            <div className="absolute right-1 top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button onClick={onOpen} aria-label="Changer" className="grid h-5 w-5 place-items-center rounded-md bg-card text-muted-foreground hover:text-foreground">
                <RefreshCw className="h-2.5 w-2.5" />
              </button>
              <button onClick={onRemove} aria-label="Retirer" className="grid h-5 w-5 place-items-center rounded-md bg-card text-muted-foreground hover:text-destructive">
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={onOpen}
          aria-label={`Suggérer un plat — ${slot}`}
          className="mt-0.5 flex flex-1 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Sparkles className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

// ------------------------------------------------------------
function ContextPanel({ signals }: { signals: Array<{ tone: "warn" | "info"; text: string }> }) {
  return (
    <>
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Météo</p>
        <p className="mt-1 inline-flex items-center gap-2 font-serif text-lg">
          {mockWeather.heatwave ? <ThermometerSun className="h-5 w-5 text-warm" /> : <Sun className="h-5 w-5 text-accent-foreground" />}
          {mockWeather.label}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {mockWeather.heatwave ? "Suggestions basculées vers froid pour midi." : "Défauts appliqués (léger le soir)."}
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Cohérence des 2 semaines</p>
        <ul className="mt-2 space-y-1.5">
          {signals.slice(0, 4).map((s, i) => (
            <li key={i} className={"flex items-start gap-1.5 text-xs " + (s.tone === "warn" ? "text-warm" : "text-muted-foreground")}>
              {s.tone === "warn" ? <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> : <Info className="mt-0.5 h-3 w-3 shrink-0" />}
              <span>{s.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-dashed border-border/60 p-4">
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <UtensilsCrossed className="h-3.5 w-3.5" />
          Choisissez un créneau pour voir les suggestions.
        </p>
      </div>
    </>
  );
}

function SlotPanel({
  date, slot, plan, query, onQuery, onClose, onPick,
}: {
  date: Date; slot: Slot; plan: PlanEntry[];
  query: string; onQuery: (q: string) => void;
  onClose: () => void;
  onPick: (dish: Dish, batch: boolean) => void;
}) {
  const suggestions = useMemo(() => suggestFor(date, slot, plan, mockWeather), [date, slot, plan]);
  const searching = query.trim().length > 0;
  const results = searching
    ? dishes.filter((d) =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.modifiers.some((m) => m.name.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 10)
    : [];

  return (
    <div className="flex max-h-[calc(100vh-8rem)] flex-col rounded-2xl border border-border/60 bg-card shadow-soft">
      <div className="flex items-start justify-between gap-2 border-b border-border/60 p-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {slot === "midi" ? "Midi" : "Soir"}
          </p>
          <p className="mt-0.5 truncate font-serif text-lg leading-tight">{frLongDay(date)}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {isWeekend(date)
              ? "Weekend, souple."
              : slot === "midi" ? "Midi semaine → emportable + réchauffable." : "Soir semaine → plutôt léger."}
          </p>
        </div>
        <button onClick={onClose} aria-label="Fermer" className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="border-b border-border/60 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Chercher un plat, un reste…" className="h-8 pl-8 text-xs" />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {searching ? (
          results.length ? (
            results.map((d) => (
              <button
                key={d.id}
                onClick={() => onPick(d, false)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-secondary"
              >
                <span className="truncate">{d.name}</span>
                <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">{d.base}</span>
              </button>
            ))
          ) : (
            <p className="px-1 text-xs text-muted-foreground">Rien ne correspond — essayez un autre composant.</p>
          )
        ) : (
          suggestions.map(({ dish, reason, score }) => (
            <SuggestionRow key={dish.id} dish={dish} reason={reason} score={score} onPick={onPick} />
          ))
        )}
      </div>
    </div>
  );
}

function SuggestionRow({
  dish, reason, score, onPick,
}: {
  dish: Dish; reason: string; score: number;
  onPick: (dish: Dish, batch: boolean) => void;
}) {
  return (
    <div className="group rounded-xl border border-border/60 p-2.5 transition-all hover:border-primary hover:shadow-lift">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 font-serif text-sm leading-tight">{dish.name}</p>
        <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">{score}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {dish.modifiers.slice(0, 3).map((m) => (
          <Badge key={m.name} variant="secondary" className="text-[9px] font-normal">{m.name}</Badge>
        ))}
      </div>
      <p className="mt-1.5 inline-flex items-start gap-1 text-[10px] text-muted-foreground">
        <Sparkles className="mt-0.5 h-2.5 w-2.5 shrink-0 text-primary" />{reason}
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        <Button size="sm" onClick={() => onPick(dish, false)} className="h-6 flex-1 text-[11px]">Choisir</Button>
        {dish.rendement > 1 && (
          <Button
            size="sm" variant="outline" onClick={() => onPick(dish, true)}
            className="h-6 gap-1 text-[11px]" title="Batch : couvre aussi le créneau suivant"
          >
            <Repeat className="h-2.5 w-2.5" />×2
          </Button>
        )}
      </div>
    </div>
  );
}
