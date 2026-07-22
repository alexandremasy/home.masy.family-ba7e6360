import { useNavigate } from "@tanstack/react-router";
import { useId, useState } from "react";
import { z } from "zod";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Label } from "@/components/label";
import { PageHeader } from "@/components/page-header";

/* ─────────────────────────────────────────────────────────────────────────────
   The monthly reading, as a page — four counters and the date they were read.

   The form and its validation are the page's own: what a plausible meter value
   is does not change with where it is stored, and a form that only finds out
   the number is negative after a round-trip is a worse form. What the page does
   NOT own is the write — it hands back four numbers and a date, and whether
   that lands in an upsert or in memory is the caller's business. A rejection
   comes back as a thrown error and is shown above the button.
   ──────────────────────────────────────────────────────────────────────────── */

/** What one monthly reading records. Meter values, as entered. */
export interface EnergieSaisieValues {
  /** Water meter, m³. */
  eau: number;
  /** Day-rate electricity meter, kWh. */
  jour: number;
  /** Night-rate electricity meter, kWh. */
  nuit: number;
  /** Fuel-oil tank level, %. */
  mazout: number;
  /** Reading date, ISO `yyyy-mm-dd`. */
  date: string;
}

export interface EnergieSaisieProps {
  /**
   * Record the reading. Throwing rejects the submission: the message is shown
   * above the button and the form stays filled in.
   */
  onSubmit: (values: EnergieSaisieValues) => Promise<void> | void;
  /** Where to go once it is recorded. */
  doneTo: string;
}

const numField = (label: string, max: number) =>
  z
    .string()
    .trim()
    .nonempty({ message: `${label} est requis` })
    .refine((v) => !Number.isNaN(Number(v)), { message: `${label} doit être un nombre` })
    .refine((v) => Number(v) >= 0, { message: `${label} doit être positif` })
    .refine((v) => Number(v) <= max, { message: `${label} semble trop élevé` });

const schema = z.object({
  eau: numField("Eau", 100000),
  jour: numField("Électricité jour", 1000000),
  nuit: numField("Électricité nuit", 1000000),
  mazout: numField("Mazout", 100),
  date: z
    .string()
    .nonempty({ message: "La date est requise" })
    .refine((v) => !Number.isNaN(Date.parse(v)), { message: "Date invalide" })
    .refine((v) => new Date(v).getTime() <= Date.now() + 24 * 3600 * 1000, {
      message: "La date ne peut pas être dans le futur",
    }),
});

type FormState = { eau: string; jour: string; nuit: string; mazout: string; date: string };
type Status = "idle" | "submitting" | "success" | "error";

/** The monthly reading form. */
export function EnergieSaisieTemplate({ onSubmit, doneTo }: EnergieSaisieProps) {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [form, setForm] = useState<FormState>({
    eau: "",
    jour: "",
    nuit: "",
    mazout: "",
    date: today,
  });

  const update = (k: keyof FormState, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setErrors({});

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof FormState;
        if (k && !fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      setFormError("Merci de corriger les erreurs ci-dessous.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      await onSubmit({
        eau: Number(form.eau),
        jour: Number(form.jour),
        nuit: Number(form.nuit),
        mazout: Number(form.mazout),
        date: form.date,
      });
      setStatus("success");
      setTimeout(() => navigate({ to: doneTo }), 1100);
    } catch (err) {
      setStatus("error");
      setFormError(err instanceof Error ? err.message : "Impossible d'enregistrer le relevé.");
    }
  };

  const submitting = status === "submitting";
  const done = status === "success";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Relevé mensuel" subtitle="Saisis les 4 compteurs ci-dessous." />

      <Card variant="solid" title="Compteurs">
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field
            label="Eau"
            unit="m³"
            value={form.eau}
            onChange={(v) => update("eau", v)}
            error={errors.eau}
            disabled={submitting || done}
          />
          <Field
            label="Électricité jour"
            unit="kWh"
            value={form.jour}
            onChange={(v) => update("jour", v)}
            error={errors.jour}
            disabled={submitting || done}
          />
          <Field
            label="Électricité nuit"
            unit="kWh"
            value={form.nuit}
            onChange={(v) => update("nuit", v)}
            error={errors.nuit}
            disabled={submitting || done}
          />
          <Field
            label="Citerne à mazout"
            unit="%"
            value={form.mazout}
            onChange={(v) => update("mazout", v)}
            error={errors.mazout}
            disabled={submitting || done}
          />

          <div>
            <Label
              htmlFor="releve-date"
              className="mb-1.5 block text-xs uppercase tracking-eyebrow text-muted-foreground"
            >
              Date
            </Label>
            <input
              id="releve-date"
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              disabled={submitting || done}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            />
            {errors.date && <p className="mt-1.5 text-sm text-destructive">{errors.date}</p>}
          </div>

          {formError && status === "error" && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {done && (
            <div className="flex items-start gap-2 rounded-xl border border-success/40 bg-success/5 px-4 py-3 text-sm text-success">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Relevé enregistré. Redirection…</span>
            </div>
          )}

          <Button
            type="submit"
            variant="inverted"
            disabled={submitting || done}
            className={
              // The only CTA with an alternate fill — `done` overrides the variant.
              "mt-2 h-auto w-full gap-2 rounded-full px-6 py-3 disabled:opacity-80 " +
              (done ? "bg-success text-background hover:bg-success" : "")
            }
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours…
              </>
            ) : done ? (
              <>
                <Check className="h-4 w-4" /> Enregistré
              </>
            ) : (
              "Enregistrer le relevé"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}

function Field({
  label,
  unit,
  value,
  onChange,
  error,
  disabled,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  // The label is a SIBLING of the input, not its parent — so nesting doesn't
  // associate them and clicking the label did nothing. htmlFor is what wires it.
  const id = useId();
  return (
    <div>
      <Label
        htmlFor={id}
        className="mb-1.5 block text-xs uppercase tracking-eyebrow text-muted-foreground"
      >
        {label}
      </Label>
      <div
        className={
          "flex overflow-hidden rounded-xl border bg-card focus-within:ring-2 focus-within:ring-ring " +
          (error ? "border-destructive/60" : "border-border")
        }
      >
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="0"
          className="flex-1 bg-transparent px-4 py-3 text-foreground outline-none disabled:opacity-60"
        />
        <span className="grid place-items-center bg-secondary px-4 text-sm text-muted-foreground">
          {unit}
        </span>
      </div>
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}
