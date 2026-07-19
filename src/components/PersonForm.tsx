import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/Eyebrow";
import { NO_BIRTH_YEAR, type Person, type Sliders } from "@/lib/maison-data";

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
  "name" | "relation" | "dob" | "langue" | "matiereLibre" | "defaultSliders"
>;

export const EMPTY_PERSON: PersonDraft = {
  name: "",
  relation: "",
  dob: "",
  langue: "fr",
  matiereLibre: "",
  defaultSliders: { registre: 50, chaleur: 50, humour: 50, longueur: 50 },
};

/** The person profile form. Shared by the edit fiche and "nouvelle personne", same as DishForm. */
export function PersonForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: PersonDraft;
  submitLabel: string;
  onSubmit: (d: PersonDraft) => void;
  onCancel: () => void;
}) {
  const [d, setD] = useState<PersonDraft>(initial);
  const [touched, setTouched] = useState(false);
  const set = <K extends keyof PersonDraft>(k: K, v: PersonDraft[K]) =>
    setD((p) => ({ ...p, [k]: v }));
  const setSlider = <K extends keyof Sliders>(k: K, v: number) =>
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
    <form onSubmit={submit} className="space-y-5">
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
        <div className="mt-2 grid gap-5 sm:grid-cols-2">
          <SliderRow
            label="Registre"
            left="pudique"
            right="complice"
            value={d.defaultSliders.registre}
            onChange={(v) => setSlider("registre", v)}
          />
          <SliderRow
            label="Chaleur"
            left="sobre"
            right="tendre"
            value={d.defaultSliders.chaleur}
            onChange={(v) => setSlider("chaleur", v)}
          />
          <SliderRow
            label="Humour"
            left="sincère"
            right="taquin"
            value={d.defaultSliders.humour}
            onChange={(v) => setSlider("humour", v)}
          />
          <SliderRow
            label="Longueur"
            left="bref"
            right="développé"
            value={d.defaultSliders.longueur}
            onChange={(v) => setSlider("longueur", v)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">{submitLabel}</Button>
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

function SliderRow({
  label,
  left,
  right,
  value,
  onChange,
}: {
  label: string;
  left: string;
  right: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 text-xs">
        <span className="font-semibold">{label}</span>
      </div>
      <Slider min={0} max={100} step={1} value={[value]} onValueChange={([v]) => onChange(v)} />
      <div className="mt-1 flex justify-between text-2xs uppercase tracking-eyebrow text-muted-foreground">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}
