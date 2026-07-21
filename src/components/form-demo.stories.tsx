import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Euro, Search } from "lucide-react";

import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Slider } from "./slider";
import { Switch } from "./switch";
import { Textarea } from "./textarea";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

/**
 * Every form control on one page, wired as a real form. This is where the controls are
 * compared against each other — heights, label rhythm, vertical spacing, focus rings —
 * which no single-component story can show.
 *
 * It is a demo, not a product screen: it deliberately puts controls side by side that the
 * app never uses together.
 */
const meta = {
  title: "Forms/Form",
  parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** One field: label, control, and an optional hint or error tied to it by `aria-describedby`. */
function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {(error || hint) && (
        <p
          id={`${htmlFor}-desc`}
          className={error ? "text-xs text-destructive" : "text-xs text-muted-foreground"}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

function DemoForm() {
  const [submitting, setSubmitting] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const [name, setName] = React.useState("");
  const nameError = touched && name.trim() === "" ? "Le nom est requis." : undefined;

  return (
    <form
      className="w-96 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (name.trim() === "") return;
        setSubmitting(true);
        // Demo only: nothing is sent anywhere.
        setTimeout(() => setSubmitting(false), 1600);
      }}
    >
      <Field label="Nom" htmlFor="demo-name" error={nameError} hint="Tel qu'il apparaîtra partout.">
        <Input
          id="demo-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(nameError)}
          aria-describedby="demo-name-desc"
          placeholder="Anna"
        />
      </Field>

      <Field label="Recherche" htmlFor="demo-search">
        <Input id="demo-search" iconLeft={<Search />} placeholder="Chercher un plat…" />
      </Field>

      <Field
        label="Budget mensuel"
        htmlFor="demo-budget"
        hint="Laisser vide pour ne pas plafonner."
      >
        <Input
          id="demo-budget"
          type="number"
          suffix={<Euro className="size-3" />}
          placeholder="0"
        />
      </Field>

      <Field label="Catégorie" htmlFor="demo-category">
        <Select>
          <SelectTrigger id="demo-category">
            <SelectValue placeholder="Choisir une catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="repas">Repas</SelectItem>
            <SelectItem value="courses">Courses</SelectItem>
            <SelectItem value="energie">Énergie</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <Field label="Période" htmlFor="demo-period">
        <ToggleGroup type="single" defaultValue="semaine" id="demo-period" className="w-full">
          <ToggleGroupItem value="jour" className="flex-1">
            Jour
          </ToggleGroupItem>
          <ToggleGroupItem value="semaine" className="flex-1">
            Semaine
          </ToggleGroupItem>
          <ToggleGroupItem value="mois" className="flex-1">
            Mois
          </ToggleGroupItem>
        </ToggleGroup>
      </Field>

      <Field label="Ton du message" htmlFor="demo-tone">
        <Slider
          id="demo-tone"
          defaultValue={[40]}
          max={100}
          step={5}
          ticks={5}
          minLabel="Sobre"
          maxLabel="Tendre"
          showValue="interaction"
          formatValue={(v) => `${v} %`}
        />
      </Field>

      <Field label="Note" htmlFor="demo-note" hint="Optionnel.">
        <Textarea id="demo-note" rows={3} placeholder="Ajouter une note" />
      </Field>

      <div className="space-y-3 rounded-md border border-input p-3">
        <label className="flex items-center gap-2.5 text-sm">
          <Checkbox aria-describedby="demo-terms-desc" />
          Ajouter au calendrier partagé
        </label>
        <div className="flex items-center justify-between text-sm">
          <span>Rappel la veille</span>
          <Switch defaultChecked />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost">
          Annuler
        </Button>
        <Button type="submit" variant="inverted" loading={submitting}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}

/**
 * Submit with the name empty to see the invalid state land on the field, then submit again
 * with a name to see the button take the round-trip.
 */
export const Playground: Story = {
  render: () => <DemoForm />,
};
