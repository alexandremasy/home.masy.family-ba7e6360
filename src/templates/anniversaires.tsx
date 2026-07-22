import { useState, type ReactNode } from "react";
import { Cake, Check, Copy, Pencil, PenLine, Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { DataState } from "@/components/data-state";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/dropdown-menu";
import { Eyebrow } from "@/components/eyebrow";
import { PersonCard } from "@/components/person-card";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Separator } from "@/components/separator";
import type { Person } from "@/lib/maison-data";

/* ─────────────────────────────────────────────────────────────────────────────
   Anniversaires, as a page — today's, front and centre, then everyone else.

   The drafts arrive written. Whether a message came out of a local generator or
   an LLM three hundred milliseconds ago is not the page's business; it shows the
   text, or says it is still being written, or says it could not be. The sentence
   over the hero arrives composed too, because "a 38 ans aujourd'hui" and "c'est
   l'anniversaire de" is a judgement about whether a birth year is known.

   Three things here are the caller's own components — the person editor, the
   message studio, and the card in the grid. They talk to an api on one side and
   a mock store on the other, so they arrive as slots rather than as props.
   ──────────────────────────────────────────────────────────────────────────── */

/** One ready-to-send draft. */
export interface BirthdayDraftView {
  /** Identifies the style — handed back when its editor is opened. */
  id: string;
  /** The style's name — "Tendre". */
  label: string;
  /** The message. Empty while it is being written or when it failed. */
  message: string;
  /** Still being written. */
  loading?: boolean;
  /** Could not be written. */
  error?: boolean;
}

/** The birthday of the day. */
export interface BirthdayHeroView {
  person: Person;
  /** The whole sentence, composed by the caller — the birth year may be unknown. */
  headline: string;
  /** How you know them, ready to show. */
  relation: string;
  drafts: BirthdayDraftView[];
}

export interface AnniversairesProps {
  /** Today's birthdays. Empty is the normal case and has its own card. */
  heroes: BirthdayHeroView[];
  /** Everyone else, already sorted by how soon their birthday falls. */
  upcoming: Person[];
  /** What the empty card says next — "Le prochain, c'est Léa dans 3 j.". */
  nextLabel?: string;
  /** Edit someone, or create one when called with `null`. */
  onEditPerson?: (person: Person | null) => void;
  /** The person editor, rendered by the caller (an api mutation on one side). */
  dialog?: ReactNode;
  /** Which draft's style editor is open. The caller owns it: it drives the studio. */
  openDraftId?: string | null;
  /** A draft's style editor was asked for. */
  onOpenDraft?: (draftId: string) => void;
  onCloseDraft?: () => void;
  /** The style editor itself, rendered by the caller. */
  studio?: ReactNode;
  /** The list is still on its way. */
  loading?: boolean;
  /** It failed. */
  error?: boolean;
  /** Retry handler for the failure state. */
  onRetry?: () => void;
}

/** Today's birthday, then everyone else. */
export function AnniversairesTemplate({
  heroes,
  upcoming,
  nextLabel,
  onEditPerson,
  dialog,
  openDraftId = null,
  onOpenDraft,
  onCloseDraft,
  studio,
  loading = false,
  error = false,
  onRetry,
}: AnniversairesProps) {
  const openDraft = heroes.flatMap((h) => h.drafts).find((d) => d.id === openDraftId);
  const openPerson = heroes.find((h) => h.drafts.some((d) => d.id === openDraftId))?.person;

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
        {error ? (
          <DataState status="error" label="les anniversaires" onRetry={onRetry} />
        ) : loading ? (
          <DataState status="loading" label="les anniversaires" />
        ) : (
          <>
            {/* 1 — the day's birthday, front and centre */}
            {heroes.length > 0 ? (
              heroes.map((hero) => (
                <TodayHero
                  key={hero.person.id}
                  hero={hero}
                  onEditProfile={() => onEditPerson?.(hero.person)}
                  onEditStyle={(id) => onOpenDraft?.(id)}
                />
              ))
            ) : (
              <EmptyToday nextLabel={nextLabel} />
            )}

            {/* Full-bleed rule: -mx cancels the inner px, w-auto (via the data override,
                which otherwise pins w-full) lets both margins pull it to the stage edges. */}
            <Separator className="-mx-6 w-auto bg-border/40 data-[orientation=horizontal]:w-auto sm:-mx-12" />

            {/* 2 — everyone else as one date-sorted list, closed by an add card */}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((p) => (
                <PersonCard key={p.id} person={p} onEdit={() => onEditPerson?.(p)} />
              ))}
              <button
                type="button"
                onClick={() => onEditPerson?.(null)}
                className="flex items-center justify-center gap-1.5 rounded-md border border-dashed border-muted-foreground/40 p-3 text-sm text-muted-foreground transition-colors hover:border-muted-foreground hover:bg-secondary/40 hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                Ajouter une personne
              </button>
            </div>
          </>
        )}

        {dialog}

        <ResponsiveModal
          open={openDraftId !== null}
          onOpenChange={(o) => !o && onCloseDraft?.()}
          title={openPerson ? `Message pour ${openPerson.name}` : (openDraft?.label ?? "Message")}
          icon={<PenLine className="h-4 w-4" />}
        >
          {studio}
        </ResponsiveModal>
      </div>
    </div>
  );
}

/** The day's birthday — the main event. Ready drafts + a style editor. */
function TodayHero({
  hero,
  onEditProfile,
  onEditStyle,
}: {
  hero: BirthdayHeroView;
  onEditProfile: () => void;
  onEditStyle: (draftId: string) => void;
}) {
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
            <h1 className="text-2xl tracking-tight sm:text-3xl">{hero.headline}</h1>
            <p className="text-sm text-muted-foreground">{hero.relation}</p>
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
        {hero.drafts.map((d) => (
          <SuggestionCard key={d.id} draft={d} onEdit={() => onEditStyle(d.id)} />
        ))}
      </div>
    </section>
  );
}

/** One draft. Copy or edit its style from the card's top-right. */
function SuggestionCard({ draft, onEdit }: { draft: BirthdayDraftView; onEdit: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!draft.message) return;
    try {
      await navigator.clipboard.writeText(draft.message);
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
          <Eyebrow size="xs">{draft.label}</Eyebrow>
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
              disabled={!draft.message}
              title="Copier"
              className="grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
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
        {/* A draft being written and a draft that failed are not the same silence. */}
        <p
          className={
            "whitespace-pre-wrap text-base leading-relaxed " +
            (draft.message ? "text-foreground" : "text-muted-foreground") +
            (draft.loading ? " opacity-50" : "")
          }
        >
          {draft.message ||
            (draft.loading ? "Génération…" : draft.error ? "Génération indisponible." : "")}
        </p>
      </div>
    </Card>
  );
}

/** No birthday today — the main slot has nothing to write. */
function EmptyToday({ nextLabel }: { nextLabel?: string }) {
  return (
    <Card variant="soft">
      <div className="text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
          <Cake className="h-6 w-6" />
        </div>
        <p className="mt-3 text-base">Pas d'anniversaire aujourd'hui</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {nextLabel ?? "Rien de prévu pour l'instant."}
        </p>
      </div>
    </Card>
  );
}
