import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/Card";
import { energie } from "@/lib/mock-data";
import { ArrowRight, Droplet, Sun, Moon, Flame } from "lucide-react";

export const Route = createFileRoute("/_app/energie/")({
  component: EnergiePage,
  head: () => ({ meta: [{ title: "Énergie — Maison" }] }),
});

function EnergiePage() {
  const max = Math.max(...energie.history.map((h) => h.jour + h.nuit));
  return (
    <div className="space-y-6">
      <div className="px-1">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Cockpit</Link>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Énergie</h1>
        <p className="mt-1 text-muted-foreground">Consommation mensuelle et relevés</p>
      </div>

      {energie.monthlyDue && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-warm p-6 text-warm-foreground sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] opacity-70">À faire</p>
            <p className="mt-1 font-serif text-2xl">Relevé mensuel à saisir</p>
          </div>
          <Link to="/energie/saisie" className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background">
            Saisir <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <Section title="Électricité" action={<span className="text-sm text-muted-foreground">5 derniers mois (kWh)</span>}>
        <div className="flex h-56 items-end gap-4">
          {energie.history.map((h) => {
            const total = h.jour + h.nuit;
            const heightPct = (total / max) * 100;
            const jourPct = (h.jour / total) * 100;
            return (
              <div key={h.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative w-full max-w-[60px] flex-1 overflow-hidden rounded-t-xl bg-secondary" style={{ height: `${heightPct}%` }}>
                  <div className="absolute bottom-0 w-full bg-warm" style={{ height: `${100 - jourPct}%` }} />
                  <div className="absolute bottom-0 w-full bg-accent" style={{ height: `${100 - jourPct}%`, transform: `translateY(-100%)`, height: `${jourPct}%` }} />
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">{h.month}</p>
                  <p className="text-xs font-medium">{total}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /> Jour</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warm" /> Nuit</span>
        </div>
      </Section>

      <Section title="Détails par mois">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="py-3 text-left font-medium">Mois</th>
                <th className="py-3 text-right font-medium"><span className="inline-flex items-center gap-1"><Droplet className="h-3 w-3" />Eau</span></th>
                <th className="py-3 text-right font-medium"><span className="inline-flex items-center gap-1"><Sun className="h-3 w-3" />Jour</span></th>
                <th className="py-3 text-right font-medium"><span className="inline-flex items-center gap-1"><Moon className="h-3 w-3" />Nuit</span></th>
                <th className="py-3 text-right font-medium"><span className="inline-flex items-center gap-1"><Flame className="h-3 w-3" />Mazout</span></th>
              </tr>
            </thead>
            <tbody>
              {energie.history.map((h) => (
                <tr key={h.month} className="border-b border-border/30">
                  <td className="py-3 font-medium">{h.month}</td>
                  <td className="py-3 text-right tabular-nums">{h.eau} m³</td>
                  <td className="py-3 text-right tabular-nums">{h.jour} kWh</td>
                  <td className="py-3 text-right tabular-nums">{h.nuit} kWh</td>
                  <td className="py-3 text-right tabular-nums">{h.mazout} L</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
