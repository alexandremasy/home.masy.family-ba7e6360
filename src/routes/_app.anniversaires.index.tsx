import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  generateMessage,
  nextBirthday,
  daysUntil,
  upcomingAge,
  hasBirthYear,
  STYLE_PRESETS,
  type Person,
  type Sliders,
} from "@/lib/maison-data";
import { usePeople } from "@/lib/people-store";
import { cap } from "@/lib/utils";
import { Cake, Copy, Check, Pencil, Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/dropdown-menu";
import { Eyebrow } from "@/components/eyebrow";
import { ResponsiveModal } from "@/components/responsive-modal";
import { MessageStudio } from "@/components/message-studio";
import { PersonCard } from "@/components/person-card";
import { Separator } from "@/components/separator";
import { PersonDialog, type PersonTarget } from "@/components/person-dialog";

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
    // Full-bleed stage: cancel the layout container's px so the wash + separator can
    // reach true edge to edge; the inner wrapper re-adds generous content padding.
    <div className="relative -mx-4 pt-16 sm:-mx-6">
      {/* Teal-to-page wash: teal over the first part up top, fading into the page
          background toward the bottom. absolute, not fixed — the .mode-enter
          ancestor keeps a transform, which would trap a fixed layer. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 bottom-0 -z-10 bg-gradient-to-b from-primary/15 to-transparent sm:-top-10"
      />

      <div className="space-y-8 px-6 sm:px-12">
        {/* 1 — the day's birthday, front and centre */}
        {todays.length > 0 ? (
          todays.map((p) => <TodayHero key={p.id} person={p} onEditProfile={() => setEditing(p)} />)
        ) : (
          <EmptyToday next={upcoming[0]} />
        )}

        {/* Full-bleed rule: -mx cancels the inner px, w-auto (via the data override,
            which otherwise pins w-full) lets both margins pull it to the stage edges. */}
        <Separator className="-mx-6 w-auto bg-border/40 data-[orientation=horizontal]:w-auto sm:-mx-12" />

        {/* 2 — everyone else as one date-sorted list, closed by an add card */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((p) => (
            <PersonCard key={p.id} person={p} onEdit={() => setEditing(p)} />
          ))}
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="flex items-center justify-center gap-1.5 rounded-md border border-dashed border-muted-foreground/40 p-3 text-sm text-muted-foreground transition-colors hover:border-muted-foreground hover:bg-secondary/40 hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            Ajouter une personne
          </button>
        </div>

        <PersonDialog target={editing} onOpenChange={(o) => !o && setEditing(null)} />
      </div>
    </div>
  );
}

type Variant = { label: string; sliders: Sliders; seed: number };

/** The day's birthday — the main event. Three ready drafts + a style editor. */
function TodayHero({ person, onEditProfile }: { person: Person; onEditProfile: () => void }) {
  // The three drafts are three presets — the shortcuts, not a hand-tuned copy of them.
  const variants: Variant[] = STYLE_PRESETS.slice(0, 3).map((preset, i) => ({
    label: preset.label,
    sliders: { ...preset.sliders },
    seed: i,
  }));
  const [edit, setEdit] = useState<Variant | null>(null);
  const studio = edit && (
    <MessageStudio
      key={edit.label}
      person={person}
      initialSliders={edit.sliders}
      initialSeed={edit.seed}
    />
  );

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Cake className="h-6 w-6" />
          </span>
          <div>
            <Eyebrow tone="current" size="xs" className="text-primary">
              Aujourd'hui 🎉
            </Eyebrow>
            <h1 className="text-2xl tracking-tight sm:text-3xl">
              {hasBirthYear(person.dob)
                ? `${person.name} a ${upcomingAge(person)} ans aujourd'hui.`
                : `C'est l'anniversaire de ${person.name} aujourd'hui.`}
            </h1>
            <p className="text-sm text-muted-foreground">{cap(person.relation)}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEditProfile}>
              <Pencil className="h-3.5 w-3.5" /> Éditer les infos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {variants.map((v) => (
          <SuggestionCard key={v.label} person={person} variant={v} onEdit={() => setEdit(v)} />
        ))}
      </div>

      <ResponsiveModal
        open={edit !== null}
        onOpenChange={(o) => !o && setEdit(null)}
        title={`Message pour ${person.name}`}
      >
        {studio}
      </ResponsiveModal>
    </section>
  );
}

/** One ready-to-send draft. Copy or edit its style from the card's top-right. */
function SuggestionCard({
  person,
  variant,
  onEdit,
}: {
  person: Person;
  variant: Variant;
  onEdit: () => void;
}) {
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
    <Card variant="soft">
      <div className="flex flex-1 flex-col gap-2">
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
              {copied ? (
                <Check className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span className="sr-only">{copied ? "Copié" : "Copier"}</span>
            </button>
          </div>
        </div>
        <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">{message}</p>
      </div>
    </Card>
  );
}

/** No birthday today — the main slot has nothing to write. */
function EmptyToday({ next }: { next?: Person }) {
  return (
    <Card variant="soft">
      <div className="text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
          <Cake className="h-6 w-6" />
        </div>
        <p className="mt-3 text-base">Pas d'anniversaire aujourd'hui</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {next
            ? `Le prochain, c'est ${next.name} dans ${daysUntil(nextBirthday(next))} j.`
            : "Rien de prévu pour l'instant."}
        </p>
      </div>
    </Card>
  );
}
