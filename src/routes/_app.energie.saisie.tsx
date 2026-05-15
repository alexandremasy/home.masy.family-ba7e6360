import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Section } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/energie/saisie")({
  component: SaisiePage,
  head: () => ({ meta: [{ title: "Saisie · Énergie — Maison" }] }),
});

const numField = (label: string, max: number) =>
  z
    .string()
    .trim()
    .nonempty({ message: `${label} est requis` })
    .refine((v) => !Number.isNaN(Number(v)), { message: `${label} doit être un nombre` })
    .refine((v) => Number(v) >= 0, { message: `${label} doit être positif` })
    .refine((v) => Number(v) <= max, { message: `${label} semble trop élevé` });

const schema = z
  .object({
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

function SaisiePage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [form, setForm] = useState<FormState>({ eau: "", jour: "", nuit: "", mazout: "", date: today });

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
      // Simule l'envoi (pas de backend pour l'instant)
      await new Promise((r) => setTimeout(r, 900));
      setStatus("success");
      toast.success("Relevé enregistré");
      setTimeout(() => navigate({ to: "/energie" }), 1100);
    } catch (err) {
      setStatus("error");
      setFormError("Impossible d'enregistrer le relevé. Réessaie.");
      toast.error("Échec de l'enregistrement");
    }
  };

  const submitting = status === "submitting";
  const done = status === "success";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Relevé mensuel" subtitle="Saisis les 4 compteurs ci-dessous." back="/energie" backLabel="Énergie" />

      <Section title="Compteurs">
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field label="Eau" unit="m³" value={form.eau} onChange={(v) => update("eau", v)} error={errors.eau} disabled={submitting || done} />
          <Field label="Électricité jour" unit="kWh" value={form.jour} onChange={(v) => update("jour", v)} error={errors.jour} disabled={submitting || done} />
          <Field label="Électricité nuit" unit="kWh" value={form.nuit} onChange={(v) => update("nuit", v)} error={errors.nuit} disabled={submitting || done} />
          <Field label="Citerne à mazout" unit="%" value={form.mazout} onChange={(v) => update("mazout", v)} error={errors.mazout} disabled={submitting || done} />

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Date</label>
            <input
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

          <button
            type="submit"
            disabled={submitting || done}
            className={
              "mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-medium transition-all disabled:opacity-80 " +
              (done ? "bg-success text-background" : "bg-foreground text-background hover:opacity-90")
            }
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Envoi en cours…</>
            ) : done ? (
              <><Check className="h-4 w-4" /> Enregistré</>
            ) : (
              "Enregistrer le relevé"
            )}
          </button>
        </form>
      </Section>
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
  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</label>
      <div
        className={
          "flex overflow-hidden rounded-xl border bg-card focus-within:ring-2 focus-within:ring-ring " +
          (error ? "border-destructive/60" : "border-border")
        }
      >
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="0"
          className="flex-1 bg-transparent px-4 py-3 text-foreground outline-none disabled:opacity-60"
        />
        <span className="grid place-items-center bg-secondary px-4 text-sm text-muted-foreground">{unit}</span>
      </div>
      {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
    </div>
  );
}
