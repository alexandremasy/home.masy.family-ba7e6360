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
import { MessageStudio } from "@/components/message-studio";
import { PersonDialog, type PersonTarget } from "@/components/person-dialog";
import { AnniversairesTemplate, type BirthdayHeroView } from "@/templates/anniversaires";

export const Route = createFileRoute("/_app/anniversaires/")({
  component: AnniversairesPage,
  head: () => ({ meta: [{ title: "Anniversaires — Maison" }] }),
});

/** The page is the template; this file only pretends to be a backend. */
function AnniversairesPage() {
  const { people } = usePeople();
  const [editing, setEditing] = useState<PersonTarget>(null);
  const [openDraft, setOpenDraft] = useState<string | null>(null);

  const sorted = [...people].sort(
    (a, b) => daysUntil(nextBirthday(a)) - daysUntil(nextBirthday(b)),
  );
  const todays = sorted.filter((p) => daysUntil(nextBirthday(p)) === 0);
  const upcoming = sorted.filter((p) => daysUntil(nextBirthday(p)) > 0);

  // The drafts are the three styles chosen for this person, in order. Over in the
  // cockpit each one is a real LLM call; here the generator answers immediately.
  const styleOf = (p: Person, id: string) =>
    STYLE_PRESETS.find((preset) => preset.id === id && p.styles.includes(preset.id));
  const draftsOf = (p: Person) =>
    p.styles
      .map((id) => STYLE_PRESETS.find((preset) => preset.id === id))
      .filter((preset) => preset !== undefined)
      .map((preset, i) => ({
        id: `${p.id}:${preset.id}`,
        label: preset.label,
        message: generateMessage(p, { ...preset.sliders } as Sliders, "", i),
      }));

  const heroes: BirthdayHeroView[] = todays.map((p) => ({
    person: p,
    headline: hasBirthYear(p.dob)
      ? `${p.name} a ${upcomingAge(p)} ans aujourd'hui.`
      : `C'est l'anniversaire de ${p.name} aujourd'hui.`,
    relation: cap(p.relation),
    drafts: draftsOf(p),
  }));

  // Which person + style the open studio is for.
  const [personId, styleId] = (openDraft ?? "").split(":");
  const studioPerson = todays.find((p) => p.id === personId);
  const preset = studioPerson ? styleOf(studioPerson, styleId) : undefined;

  const next = upcoming[0];

  return (
    <AnniversairesTemplate
      heroes={heroes}
      upcoming={upcoming}
      nextLabel={
        next
          ? `Le prochain, c'est ${next.name} dans ${daysUntil(nextBirthday(next))} j.`
          : undefined
      }
      onEditPerson={(p) => setEditing(p ?? "new")}
      dialog={<PersonDialog target={editing} onOpenChange={(o) => !o && setEditing(null)} />}
      openDraftId={openDraft}
      onOpenDraft={setOpenDraft}
      onCloseDraft={() => setOpenDraft(null)}
      studio={
        studioPerson && preset ? (
          <MessageStudio
            key={openDraft ?? ""}
            person={studioPerson}
            initialSliders={{ ...preset.sliders }}
            initialSeed={studioPerson.styles.indexOf(preset.id)}
          />
        ) : null
      }
    />
  );
}
