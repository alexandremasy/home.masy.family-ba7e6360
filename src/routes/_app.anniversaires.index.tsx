import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { generateMessage, nextBirthday, daysUntil, upcomingAge, hasBirthYear, type Person, type Sliders } from "@/lib/maison-data";
import { usePeople } from "@/lib/people-store";
import { cap } from "@/lib/utils";
import { Cake, Copy, Check, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/Eyebrow";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageStudio } from "@/components/MessageStudio";
import { PersonCard } from "@/components/PersonCard";
import { PersonDialog, type PersonTarget } from "@/components/PersonDialog";

export const Route = createFileRoute("/_app/anniversaires/")({
  component: AnniversairesPage,
  head: () => ({ meta: [{ title: "Anniversaires — Maison" }] }),
});

function AnniversairesPage() {
  const { people } = usePeople();
  const [editing, setEditing] = useState<PersonTarget>(null);
  const byDays = (a: Person, b: Person) => daysUntil(nextBirthday(a)) - daysUntil(nextBirthday(b));
  const sorted = [...people].sort(byDays);

  const todays = sorted.filter((p) => daysUntil(nextBirthday(p)) === 0);
  const upcoming = sorted.filter((p) => daysUntil(nextBirthday(p)) > 0);

  return (
    <div className="space-y-8">
      {/* 1 — the day's birthday, front and centre */}
      {todays.length > 0
        ? todays.map((p) => <TodayHero key={p.id} person={p} onEditProfile={() => setEditing(p)} />)
        : <EmptyToday next={upcoming[0]} />}

      {/* 2 — everyone else as one date-sorted list, closed by an add card */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {upcoming.map((p) => (
          <PersonCard key={p.id} person={p} onEdit={() => setEditing(p)} />
        ))}
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border/60 p-3 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-secondary/40 hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          Ajouter une personne
        </button>
      </div>

      <PersonDialog target={editing} onOpenChange={(o) => !o && setEditing(null)} />
    </div>
  );
}

type Variant = { label: string; sliders: Sliders; seed: number };

/** The day's birthday — the main event. Three ready drafts + a style editor. */
function TodayHero({ person, onEditProfile }: { person: Person; onEditProfile: () => void }) {
  const d = person.defaultSliders;
  const variants: Variant[] = [
    { label: "Tendre", sliders: { ...d, chaleur: 88, humour: 25 }, seed: 0 },
    { label: "Complice", sliders: { ...d, registre: 88, humour: 82 }, seed: 1 },
    { label: "Bref", sliders: { ...d, longueur: 18 }, seed: 2 },
  ];
  const [edit, setEdit] = useState<Variant | null>(null);

  return (
    <section className="rounded-lg border border-primary/30 bg-primary/5 p-5 shadow-soft sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Cake className="h-6 w-6" />
          </span>
          <div>
            <Eyebrow tone="current" size="xs" className="text-primary">
              Aujourd'hui 🎉
            </Eyebrow>
            <h1 className="font-serif text-3xl tracking-tight">
              {hasBirthYear(person.dob)
                ? `${person.name} a ${upcomingAge(person)} ans aujourd'hui.`
                : `C'est l'anniversaire de ${person.name} aujourd'hui.`}
            </h1>
            <p className="text-sm text-muted-foreground">{cap(person.relation)}</p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={onEditProfile} className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" /> Éditer les infos
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {variants.map((v) => (
          <SuggestionCard key={v.label} person={person} variant={v} onEdit={() => setEdit(v)} />
        ))}
      </div>

      <Dialog open={edit !== null} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Message pour {person.name}</DialogTitle>
          </DialogHeader>
          {edit && (
            <MessageStudio key={edit.label} person={person} initialSliders={edit.sliders} initialSeed={edit.seed} />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

/** One ready-to-send draft. Copy or edit its style from the card's top-right. */
function SuggestionCard({ person, variant, onEdit }: { person: Person; variant: Variant; onEdit: () => void }) {
  const [copied, setCopied] = useState(false);
  const message = generateMessage(person, variant.sliders, "", variant.seed);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border/50 bg-card p-4">
      <div className="flex items-center justify-between">
        <Eyebrow size="xs">{variant.label}</Eyebrow>
        <div className="-mr-1 flex items-center gap-0.5 text-muted-foreground">
          <button
            type="button"
            onClick={onEdit}
            title="Éditer le style"
            className="grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="sr-only">Éditer le style</span>
          </button>
          <button
            type="button"
            onClick={copy}
            title="Copier"
            className="grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-secondary hover:text-foreground"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="sr-only">{copied ? "Copié" : "Copier"}</span>
          </button>
        </div>
      </div>
      <p className="whitespace-pre-wrap font-serif text-base leading-relaxed text-foreground">{message}</p>
    </div>
  );
}

/** No birthday today — the main slot has nothing to write. */
function EmptyToday({ next }: { next?: Person }) {
  return (
    <section className="rounded-lg border border-border/60 bg-card p-8 text-center shadow-soft">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
        <Cake className="h-6 w-6" />
      </div>
      <p className="mt-3 font-serif text-xl">Pas d'anniversaire aujourd'hui</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {next
          ? `Le prochain, c'est ${next.name} dans ${daysUntil(nextBirthday(next))} j.`
          : "Rien de prévu pour l'instant."}
      </p>
    </section>
  );
}
