import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Section } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { Check } from "lucide-react";

export const Route = createFileRoute("/_app/energie/saisie")({
  component: SaisiePage,
  head: () => ({ meta: [{ title: "Saisie · Énergie — Maison" }] }),
});

function SaisiePage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ eau: "", jour: "", nuit: "", mazout: "", date: today });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
    setTimeout(() => navigate({ to: "/energie" }), 1200);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Relevé mensuel" subtitle="Saisis les 4 compteurs ci-dessous." back="/energie" backLabel="Énergie" />

      <Section title="Compteurs">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Eau" unit="m³" value={form.eau} onChange={(v) => setForm({ ...form, eau: v })} />
          <Field label="Électricité jour" unit="kWh" value={form.jour} onChange={(v) => setForm({ ...form, jour: v })} />
          <Field label="Électricité nuit" unit="kWh" value={form.nuit} onChange={(v) => setForm({ ...form, nuit: v })} />
          <Field label="Citerne à mazout" unit="litres" value={form.mazout} onChange={(v) => setForm({ ...form, mazout: v })} />

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted-foreground">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={done}
            className={"mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-medium transition-all " + (done ? "bg-success text-background" : "bg-foreground text-background hover:opacity-90")}
          >
            {done ? <><Check className="h-4 w-4" /> Enregistré</> : "Enregistrer le relevé"}
          </button>
        </form>
      </Section>
    </div>
  );
}

function Field({ label, unit, value, onChange }: { label: string; unit: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</label>
      <div className="flex overflow-hidden rounded-xl border border-border bg-card focus-within:ring-2 focus-within:ring-ring">
        <input
          type="number" inputMode="decimal" step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="flex-1 bg-transparent px-4 py-3 text-foreground outline-none"
        />
        <span className="grid place-items-center bg-secondary px-4 text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
