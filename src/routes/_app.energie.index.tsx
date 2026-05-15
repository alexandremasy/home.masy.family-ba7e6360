import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { energie } from "@/lib/mock-data";
import { ArrowRight, Droplet, Zap, Flame } from "lucide-react";

export const Route = createFileRoute("/_app/energie/")({
  component: EnergiePage,
  head: () => ({ meta: [{ title: "Énergie — Maison" }] }),
});

function EnergiePage() {
  const elecHistory = energie.history.map((h) => ({ month: h.month, kWh: h.jour + h.nuit, jour: h.jour, nuit: h.nuit }));
  const max = Math.max(...elecHistory.map((h) => h.kWh));
  const currentElec = energie.current.jour + energie.current.nuit;

  return (
    <div className="space-y-6">
      <PageHeader title="Énergie" subtitle="Consommation mensuelle et relevés" />

      {energie.monthlyDue && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-warm p-6 text-warm-foreground sm:p-8 anim-pop-in">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] opacity-70">À faire</p>
            <p className="mt-1 font-serif text-2xl">Relevé mensuel à saisir</p>
          </div>
          <Link to="/energie/saisie" className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background">
            Saisir <ArrowRight className="h-4 w-4 icon-hover-x transition-transform" />
          </Link>
        </div>
      )}

      <Section
        title="Électricité"
        action={
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-primary anim-glow" />
            <strong className="text-foreground">{currentElec} kWh</strong> ce mois
          </span>
        }
      >
        <div className="flex h-56 items-end gap-4 stagger">
          {elecHistory.map((h, i) => {
            const isCurrent = i === elecHistory.length - 1;
            const heightPct = (h.kWh / max) * 100;
            return (
              <div key={h.month} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[10px] tabular-nums text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">{h.kWh}</span>
                <div
                  className={"w-full max-w-[60px] rounded-t-xl transition-all duration-700 hover:scale-y-105 origin-bottom " + (isCurrent ? "bg-primary" : "bg-secondary")}
                  style={{ height: `${heightPct}%` }}
                  title={`${h.kWh} kWh (jour ${h.jour} · nuit ${h.nuit})`}
                />
                <p className={"text-xs " + (isCurrent ? "font-medium text-foreground" : "text-muted-foreground")}>{h.month}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Vue unifiée jour + nuit. Le détail par compteur reste accessible à la saisie.</p>
      </Section>

      <Section title="Détails par mois">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="py-3 text-left font-medium">Mois</th>
                <th className="py-3 text-right font-medium"><span className="inline-flex items-center gap-1"><Droplet className="h-3 w-3" />Eau</span></th>
                <th className="py-3 text-right font-medium"><span className="inline-flex items-center gap-1"><Zap className="h-3 w-3" />Électricité</span></th>
                <th className="py-3 text-right font-medium"><span className="inline-flex items-center gap-1"><Flame className="h-3 w-3" />Mazout</span></th>
              </tr>
            </thead>
            <tbody>
              {energie.history.map((h) => (
                <tr key={h.month} className="border-b border-border/30 transition-colors hover:bg-secondary/40">
                  <td className="py-3 font-medium">{h.month}</td>
                  <td className="py-3 text-right tabular-nums">{h.eau} m³</td>
                  <td className="py-3 text-right tabular-nums">{h.jour + h.nuit} kWh</td>
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
