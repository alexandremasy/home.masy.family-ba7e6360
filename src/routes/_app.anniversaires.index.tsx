import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/Card";
import { people, nextBirthday, daysUntil, upcomingAge, frLongDay } from "@/lib/maison-data";
import { Cake, ArrowRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/Eyebrow";

export const Route = createFileRoute("/_app/anniversaires/")({
  component: AnniversairesPage,
  head: () => ({ meta: [{ title: "Anniversaires — Maison" }] }),
});

function AnniversairesPage() {
  const sorted = [...people].sort((a, b) => daysUntil(nextBirthday(a)) - daysUntil(nextBirthday(b)));
  const upcoming = sorted[0];

  return (
    <div className="space-y-6">
      {upcoming && (
        <div className="rounded-2xl border border-mustard/40 bg-mustard/5 p-5 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Eyebrow tone="current" size="xs" className="text-mustard inline-flex items-center gap-1.5">
                <Bell className="h-3 w-3" /> Prochain anniversaire
              </Eyebrow>
              <p className="mt-1 font-serif text-xl">{upcoming.name}</p>
              <p className="text-sm text-muted-foreground">
                {frLongDay(nextBirthday(upcoming))} · {upcomingAge(upcoming)} ans · dans {daysUntil(nextBirthday(upcoming))} j
              </p>
            </div>
            <Button asChild variant="inverted" className="gap-1.5 rounded-full transition-transform hover:translate-x-0.5">
              <Link to="/anniversaires/$personId" params={{ personId: upcoming.id }}>
                Écrire <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      <Section title="Calendrier">
        <ul className="divide-y divide-border/60">
          {sorted.map((p) => {
            const next = nextBirthday(p);
            const days = daysUntil(next);
            return (
              <li key={p.id}>
                <Link
                  to="/anniversaires/$personId"
                  params={{ personId: p.id }}
                  className="group flex items-center gap-3 py-3 transition-colors hover:bg-secondary/40 -mx-2 px-2 rounded-lg"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground group-hover:bg-warm/15 group-hover:text-warm">
                    <Cake className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-lg leading-tight">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.relation} · {upcomingAge(p)} ans · {new Date(p.dob).toLocaleDateString("fr-BE", { day: "numeric", month: "long" })}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-serif text-lg tabular-nums">{days} <span className="text-xs text-muted-foreground">j</span></p>
                    <Eyebrow size="xs">{p.history.length} msg{p.history.length !== 1 ? "s" : ""}</Eyebrow>
                  </div>
                  <ArrowRight className="ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}
