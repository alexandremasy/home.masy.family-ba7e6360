import { useState } from "react";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { Slider } from "@/components/slider";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { Button } from "@/components/button";
import { Eyebrow } from "@/components/eyebrow";
import {
  NO_BIRTH_YEAR,
  STYLE_AXES,
  STYLE_PRESETS,
  type Person,
  type SliderStep,
  type Sliders,
  type StyleId,
} from "@/lib/maison-data";

const MONTHS = [
  "Janv.",
  "Févr.",
  "Mars",
  "Avr.",
  "Mai",
  "Juin",
  "Juil.",
  "Août",
  "Sept.",
  "Oct.",
  "Nov.",
  "Déc.",
];

/** The editable fields of a person — id and history are the store's business. */
export type PersonDraft = Pick<
  Person,
  "name" | "relation" | "dob" | "langue" | "matiereLibre" | "defaultSliders" | "styles"
>;

export const EMPTY_PERSON: PersonDraft = {
  name: "",
  relation: "",
  dob: "",
  langue: "fr",
  matiereLibre: "",
  defaultSliders: { registre: 2, chaleur: 2, humour: 2, longueur: 2 },
  styles: ["tendre", "complice", "bref"],
};

/** The person profile form. Shared by the edit fiche and "nouvelle personne", same as DishForm. */
export function PersonForm({
  id,
  initial,
  onSubmit,
}: {
  /** Ties the sheet footer's submit button to this form — the actions live out there. */
  id: string;
  initial: PersonDraft;
  onSubmit: (d: PersonDraft) => void;
}) {
  const [d, setD] = useState<PersonDraft>(initial);
  const [touched, setTouched] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const set = <K extends keyof PersonDraft>(k: K, v: PersonDraft[K]) =>
    setD((p) => ({ ...p, [k]: v }));

  const setSlider = <K extends keyof Sliders>(k: K, v: SliderStep) =>
    setD((p) => ({ ...p, defaultSliders: { ...p.defaultSliders, [k]: v } }));

  // Birthday is day + month (required) with an optional year — kept apart from the
  // draft's ISO dob, which we only reassemble on submit.
  const [yy0, mm0, dd0] = (initial.dob || "").split("-");
  const [birthDay, setBirthDay] = useState(dd0 ? String(Number(dd0)) : "");
  const [birthMonth, setBirthMonth] = useState(mm0 ?? "");
  const [birthYear, setBirthYear] = useState(yy0 && yy0 !== NO_BIRTH_YEAR ? yy0 : "");

  const nameError = d.name.trim().length === 0;
  const dobError = !birthDay || !birthMonth;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (nameError || dobError) return;
    const dob = `${birthYear || NO_BIRTH_YEAR}-${birthMonth}-${birthDay.padStart(2, "0")}`;
    onSubmit({ ...d, name: d.name.trim(), relation: d.relation.trim(), dob });
  };

  return (
    <form id={id} onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom">
          <Input
            value={d.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={touched && nameError}
          />
          {touched && nameError && (
            <p className="mt-1 text-xs text-destructive">Le nom est requis.</p>
          )}
        </Field>
        <Field label="Relation">
          <Input
            value={d.relation}
            onChange={(e) => set("relation", e.target.value)}
            placeholder="frère, maman, amie d'enfance…"
          />
        </Field>
        <div className="sm:col-span-2">
          <Eyebrow size="xs" as="span">
            Date d'anniversaire
          </Eyebrow>
          <div className="mt-1.5 flex gap-2">
            <Input
              type="number"
              min={1}
              max={31}
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              placeholder="Jour"
              aria-invalid={touched && dobError}
              className="w-20"
            />
            <Select value={birthMonth} onValueChange={setBirthMonth}>
              <SelectTrigger aria-label="Mois" aria-invalid={touched && dobError} className="w-28">
                <SelectValue placeholder="Mois" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((mo, i) => (
                  <SelectItem key={mo} value={String(i + 1).padStart(2, "0")}>
                    {mo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="Année (opt.)"
              className="w-28"
            />
          </div>
          {touched && dobError && (
            <p className="mt-1 text-xs text-destructive">Le jour et le mois sont requis.</p>
          )}
        </div>
      </div>

      <Field label="Matière libre">
        <p className="mb-1.5 text-2xs text-muted-foreground">
          Souvenirs, blagues, actualités — la source qui personnalise les messages.
        </p>
        <Textarea
          value={d.matiereLibre}
          onChange={(e) => set("matiereLibre", e.target.value)}
          className="min-h-[140px]"
        />
      </Field>

      <div>
        <Eyebrow size="xs" as="span">
          Style par défaut
        </Eyebrow>
        {/* Three tones per person — the drafts offered on the day. Picking a fourth
            drops the oldest, so the choice is always exactly three. */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {STYLE_PRESETS.map((preset) => {
            const picked = d.styles.includes(preset.id);
            return (
              <Button
                key={preset.id}
                type="button"
                size="sm"
                variant={picked ? "inverted" : "outline"}
                title={preset.description}
                onClick={() => set("styles", nextStyles(d.styles, preset.id))}
              >
                {preset.label}
              </Button>
            );
          })}
        </div>

        {/* The scales are the fine print: most people never open this. */}
        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronRight
            className={cn("h-3.5 w-3.5 transition-transform", advanced && "rotate-90")}
          />
          Réglage fin
        </button>

        {advanced && (
          <div className="mt-4 space-y-5">
            {STYLE_AXES.map((axis) => (
              <SliderRow
                key={axis.key}
                label={axis.label}
                stops={axis.stops}
                value={d.defaultSliders[axis.key]}
                onChange={(v) => setSlider(axis.key, v)}
              />
            ))}
          </div>
        )}
      </div>
    </form>
  );
}

/** A label wrapping its own input — the nesting is what associates them. Same as DishForm. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <Eyebrow size="xs" as="span">
        {label}
      </Eyebrow>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

/** One axis of the tone, as a scale of named steps. */
function SliderRow({
  label,
  stops,
  value,
  onChange,
}: {
  label: string;
  stops: readonly string[];
  value: SliderStep;
  onChange: (v: SliderStep) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 text-xs">
        <span className="font-semibold">{label}</span>
      </div>
      <Slider
        min={0}
        max={stops.length - 1}
        step={1}
        stops={[...stops]}
        value={[value]}
        onValueChange={([v]) => onChange(v as SliderStep)}
      />
    </div>
  );
}

/** Keep exactly three: picking a new one drops the oldest, unpicking a chosen one frees a slot. */
function nextStyles(current: StyleId[], id: StyleId): StyleId[] {
  if (current.includes(id)) return current.filter((s) => s !== id);
  return [...current, id].slice(-3);
}
