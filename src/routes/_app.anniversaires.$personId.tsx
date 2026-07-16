import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Section } from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  people, generateMessage, nextBirthday, upcomingAge, daysUntil, frLongDay,
  type Sliders,
} from "@/lib/maison-data";
import { ArrowLeft, Cake, Copy, RefreshCw, Sparkles, Check, History } from "lucide-react";
import { Eyebrow } from "@/components/Eyebrow";

export const Route = createFileRoute("/_app/anniversaires/$personId")({
  component: PersonStudio,
  head: ({ params }) => ({ meta: [{ title: `${params.personId} — Anniversaires` }] }),
});

function PersonStudio() {
  const { personId } = Route.useParams();
  const person = useMemo(() => people.find((p) => p.id === personId), [personId]);
  if (!person) throw notFound();

  const [sliders, setSliders] = useState<Sliders>(person.defaultSliders);
  const [comment, setComment] = useState("");
  const [seed, setSeed] = useState(0);
  const [copied, setCopied] = useState(false);

  const message = generateMessage(person, sliders, comment, seed);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  const set = <K extends keyof Sliders>(k: K, v: number) => setSliders((s) => ({ ...s, [k]: v }));

  return (
    <div className="space-y-6">
      <Link
        to="/anniversaires"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Tous les anniversaires
      </Link>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-warm/15 text-warm">
            <Cake className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <Eyebrow size="xs">{person.relation}</Eyebrow>
            <h1 className="font-serif text-3xl tracking-tight">{person.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {frLongDay(nextBirthday(person))} · {upcomingAge(person)} ans · dans {daysUntil(nextBirthday(person))} j
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left column — the message */}
        <div className="space-y-4 lg:col-span-3">
          <Section
            title="Message"
            action={
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setSeed((s) => s + 1)} className="h-8 gap-1"><RefreshCw className="h-3.5 w-3.5" />Regénérer</Button>
                <Button size="sm" onClick={copy} className="h-8 gap-1">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copié" : "Copier"}
                </Button>
              </div>
            }
          >
            <div className="rounded-2xl bg-primary/5 p-5">
              <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-foreground">{message}</p>
            </div>

            <div className="mt-4">
              <Label htmlFor="refine-comment" className="mb-1.5 flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                Affiner par commentaire (ex. « plus court », « clin d'oeil à la guitare »)
              </Label>
              <div className="flex items-start gap-2">
                <Textarea
                  id="refine-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Un commentaire libre pour affiner…"
                  className="min-h-[60px] flex-1"
                />
                <Button size="sm" onClick={() => setSeed((s) => s + 1)} className="h-9 gap-1">
                  <RefreshCw className="h-3.5 w-3.5" /> Appliquer
                </Button>
              </div>
              <p className="mt-2 text-3xs text-muted-foreground">
                Généré localement. Rien n'est envoyé — copiez et envoyez-le vous-même.
              </p>
            </div>
          </Section>

          {person.history.length > 0 && (
            <Section title="Historique">
              <ul className="space-y-2">
                {person.history.map((h) => (
                  <li key={h.year} className="rounded-lg border border-border/60 bg-secondary/30 p-3">
                    <Eyebrow size="xs" className="mb-1 inline-flex items-center gap-1.5">
                      <History className="h-3 w-3" /> {h.year}
                    </Eyebrow>
                    <p className="text-sm text-muted-foreground italic">« {h.message} »</p>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        {/* Right column — sliders + matière libre */}
        <div className="space-y-4 lg:col-span-2">
          <Section title="Style">
            <div className="space-y-5">
              <SliderRow label="Registre" left="pudique" right="complice" value={sliders.registre} onChange={(v) => set("registre", v)} />
              <SliderRow label="Chaleur"  left="sobre"   right="tendre"    value={sliders.chaleur}  onChange={(v) => set("chaleur", v)} />
              <SliderRow label="Humour"   left="sincère" right="taquin"    value={sliders.humour}   onChange={(v) => set("humour", v)} />
              <SliderRow label="Longueur" left="bref"    right="développé" value={sliders.longueur} onChange={(v) => set("longueur", v)} />
            </div>
            <p className="mt-4 text-3xs text-muted-foreground">
              Un plancher <b>sincère</b> est toujours appliqué — aucun réglage ne rend le message générique.
            </p>
          </Section>

          <Section title="Matière libre">
            <p className="mb-2 text-xs text-muted-foreground">
              Souvenirs, blagues, actualités — la source de personnalisation.
            </p>
            <div className="rounded-lg border border-border/60 bg-secondary/30 p-3 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {person.matiereLibre}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function SliderRow({
  label, left, right, value, onChange,
}: {
  label: string; left: string; right: string; value: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}</span>
      </div>
      <Slider min={0} max={100} step={1} value={[value]} onValueChange={([v]) => onChange(v)} />
      <div className="mt-1 flex justify-between text-3xs uppercase tracking-eyebrow text-muted-foreground">
        <span>{left}</span><span>{right}</span>
      </div>
    </div>
  );
}
