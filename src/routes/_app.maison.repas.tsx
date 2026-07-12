import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Section } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  dishes, dishById, suggestFor, coherenceSignals, initialPlan, WINDOW_DAYS, iso,
  isWeekend, frDay, addDays,
  type PlanEntry, type Slot, type Dish, type WeatherHint,
} from "@/lib/maison-data";
import {
  Sun, ThermometerSun, Sparkles, X, RefreshCw, Search, Plus, Repeat, Flame, Info,
  AlertTriangle, Clock, Package, Move,
} from "lucide-react";

export const Route = createFileRoute("/_app/maison/repas")({
  component: RepasPage,
  head: () => ({ meta: [{ title: "Repas — Maison" }] }),
});

const mockWeather: WeatherHint = { heatwave: false, label: "Doux, 18°" };

function RepasPage() {
  const [plan, setPlan] = useState<PlanEntry[]>(initialPlan);
  const [selected, setSelected] = useState<{ date: string; slot: Slot } | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [depOpen, setDepOpen] = useState(false);

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
  const selectedSuggestions = selected && selectedDate
    ? suggestFor(selectedDate, selected.slot, plan, mockWeather)
    : [];

  return (
    <div className="space-y-6">
      {/* Header row: weather + coherence signals */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Fenêtre de planification</p>
          <p className="mt-1 font-serif text-lg">
            {frDay(WINDOW_DAYS[0])} → {frDay(WINDOW_DAYS[WINDOW_DAYS.length - 1])}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Glissante, ~10 jours · évaluée sur 2 semaines</p>
        </div>
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
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Cohérence fenêtre</p>
          <ul className="mt-1 space-y-1">
            {signals.slice(0, 3).map((s, i) => (
              <li key={i} className={"inline-flex items-start gap-1.5 text-xs " + (s.tone === "warn" ? "text-warm" : "text-muted-foreground")}>
                {s.tone === "warn" ? <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> : <Info className="mt-0.5 h-3 w-3 shrink-0" />}
                <span>{s.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Section
        title="Planification"
        action={
          <div className="flex items-center gap-2">
            <Popover open={depOpen} onOpenChange={setDepOpen}>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Repeat className="h-3.5 w-3.5" /> Dépannage
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <DepannagePanel onClose={() => setDepOpen(false)} />
              </PopoverContent>
            </Popover>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {WINDOW_DAYS.map((d) => {
            const key = iso(d);
            const weekend = isWeekend(d);
            const midi = plan.find((e) => e.date === key && e.slot === "midi");
            const soir = plan.find((e) => e.date === key && e.slot === "soir");
            return (
              <div
                key={key}
                className={
                  "flex flex-col overflow-hidden rounded-xl border shadow-soft " +
                  (weekend ? "border-warm/40 bg-warm/5" : "border-border/60 bg-card")
                }
              >
                <div className="flex items-center justify-between px-3 py-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  <span>{frDay(d)}</span>
                  {weekend && <span className="inline-flex items-center gap-1 text-warm"><Flame className="h-3 w-3" />batch</span>}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 border-t border-border/60 p-2">
                  <SlotCell
                    date={key} slot="midi" entry={midi}
                    weekend={weekend}
                    onOpen={() => setSelected({ date: key, slot: "midi" })}
                    onRemove={() => remove(key, "midi")}
                    onDropFrom={(from) => move(from, { date: key, slot: "midi" })}
                  />
                  <SlotCell
                    date={key} slot="soir" entry={soir}
                    weekend={weekend}
                    onOpen={() => setSelected({ date: key, slot: "soir" })}
                    onRemove={() => remove(key, "soir")}
                    onDropFrom={(from) => move(from, { date: key, slot: "soir" })}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Move className="h-3 w-3" /> Glissez un plat vers un autre créneau pour le déplacer.
        </p>
      </Section>

      {/* Selection panel */}
      {selected && selectedDate && (
        <Section
          title={`${frDay(selectedDate)} · ${selected.slot === "midi" ? "Midi" : "Soir"}`}
          action={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setCustomOpen((v) => !v)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Composer
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)} className="gap-1.5">
                <X className="h-3.5 w-3.5" /> Fermer
              </Button>
            </div>
          }
        >
          <p className="mb-3 text-xs text-muted-foreground">
            Suggestions contextuelles — {isWeekend(selectedDate) ? "weekend, souple" : (selected.slot === "midi" ? "midi semaine → emportable + réchauffable" : "soir semaine → plutôt léger")}.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {selectedSuggestions.map(({ dish, reason, score }) => (
              <SuggestionCard
                key={dish.id}
                dish={dish}
                reason={reason}
                score={score}
                onPick={() => {
                  upsert({ date: selected.date, slot: selected.slot, dishId: dish.id });
                  setSelected(null);
                }}
                onBatch={dish.rendement > 1 ? () => {
                  // Also add the leftover to the next available slot
                  upsert({ date: selected.date, slot: selected.slot, dishId: dish.id });
                  const nextDate = iso(addDays(selectedDate, 1));
                  const nextSlot: Slot = selected.slot;
                  upsert({ date: nextDate, slot: nextSlot, dishId: dish.id, batchOfDate: selected.date });
                  setSelected(null);
                } : undefined}
              />
            ))}
          </div>

          {customOpen && (
            <div className="mt-4">
              <CustomSearch onPick={(dish) => {
                upsert({ date: selected.date, slot: selected.slot, dishId: dish.id });
                setSelected(null);
                setCustomOpen(false);
              }} />
            </div>
          )}
        </Section>
      )}
    </div>
  );
}

// ------------------------------------------------------------
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
        "group relative flex min-h-[68px] flex-col justify-between rounded-lg border p-2 text-left transition-all " +
        (dragOver ? "border-primary bg-primary/5 " : "border-transparent ") +
        (entry ? "bg-secondary/50" : "bg-transparent")
      }
    >
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>{slot === "midi" ? "Midi" : "Soir"}</span>
        {!weekend && slot === "midi" && !entry && <span className="inline-flex items-center gap-0.5 text-[9px]"><Package className="h-2.5 w-2.5" />emport.</span>}
      </div>
      {entry && dish ? (
        <div
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("application/json", JSON.stringify({ date, slot }));
            e.dataTransfer.effectAllowed = "move";
          }}
          className="mt-1 cursor-grab active:cursor-grabbing"
        >
          <p className="line-clamp-2 font-medium text-sm leading-snug">{dish.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
            <span className="rounded-full bg-background px-1.5 py-0.5">{dish.base}</span>
            {isBatch && <span className="inline-flex items-center gap-0.5 rounded-full bg-warm/15 px-1.5 py-0.5 text-warm"><Repeat className="h-2.5 w-2.5" />batch</span>}
            {dish.densite === "léger" && <span>· léger</span>}
            {dish.temperature === "froid" && <span>· froid</span>}
          </div>
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
          className="mt-1 flex flex-1 items-center justify-center gap-1 rounded-md border border-dashed border-border py-2 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Sparkles className="h-3 w-3" /> Suggérer
        </button>
      )}
    </div>
  );
}

function SuggestionCard({
  dish, reason, score, onPick, onBatch,
}: {
  dish: Dish; reason: string; score: number;
  onPick: () => void; onBatch?: () => void;
}) {
  return (
    <div className="group relative flex flex-col rounded-xl border border-border/60 bg-card p-3 transition-all hover:border-primary hover:shadow-lift">
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
      <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
        <Sparkles className="h-3 w-3 text-primary" />{reason}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" onClick={onPick} className="h-7 flex-1 text-xs">Choisir</Button>
        {onBatch && (
          <Button size="sm" variant="outline" onClick={onBatch} className="h-7 gap-1 text-xs" title="Batch : couvre aussi le créneau suivant">
            <Repeat className="h-3 w-3" /> ×2
          </Button>
        )}
      </div>
    </div>
  );
}

function CustomSearch({ onPick }: { onPick: (d: Dish) => void }) {
  const [q, setQ] = useState("");
  const filtered = q
    ? dishes.filter((d) =>
        d.name.toLowerCase().includes(q.toLowerCase()) ||
        d.modifiers.some((m) => m.name.toLowerCase().includes(q.toLowerCase()))
      )
    : dishes;
  return (
    <div className="rounded-xl border border-border/60 bg-secondary/30 p-3">
      <p className="mb-2 text-xs text-muted-foreground">Recherche libre — base, plat, composant.</p>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="poulet, riz, salade…" className="pl-8" />
      </div>
      <div className="mt-3 grid max-h-64 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
        {filtered.slice(0, 12).map((d) => (
          <button
            key={d.id}
            onClick={() => onPick(d)}
            className="flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-card"
          >
            <span className="truncate">{d.name}</span>
            <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">{d.base}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DepannagePanel({ onClose }: { onClose: () => void }) {
  const [leftover, setLeftover] = useState("");
  const matches = leftover
    ? dishes
        .filter((d) => d.modifiers.some((m) => m.name.toLowerCase().includes(leftover.toLowerCase())))
        .slice(0, 6)
    : [];
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Dépannage</p>
        <p className="text-xs text-muted-foreground">Un reste à écouler ? Idées qui vont avec.</p>
      </div>
      <Input
        placeholder="ex. reste de poulet, saumon, courgette…"
        value={leftover}
        onChange={(e) => setLeftover(e.target.value)}
        autoFocus
      />
      <div className="space-y-1">
        {matches.map((d) => (
          <div key={d.id} className="flex items-center justify-between rounded-md bg-secondary/40 px-2 py-1.5 text-xs">
            <span className="truncate">{d.name}</span>
            <span className="ml-2 shrink-0 text-muted-foreground">{d.base}</span>
          </div>
        ))}
        {leftover && matches.length === 0 && (
          <p className="text-xs text-muted-foreground">Aucune idée toute prête — essayez un autre composant.</p>
        )}
      </div>
      <Button size="sm" variant="ghost" onClick={onClose} className="w-full gap-1"><Clock className="h-3 w-3" />Fermer</Button>
    </div>
  );
}
