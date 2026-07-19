import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { generateMessage, type Person, type Sliders } from "@/lib/maison-data";
import { Copy, RefreshCw, Sparkles, Check } from "lucide-react";

/**
 * The message studio — live-generated draft with style sliders and a free-text
 * refinement. Extracted so it can live inside the "edit style" dialog. No
 * history: a birthday message is written fresh each year.
 */
export function MessageStudio({
  person,
  initialSliders,
  initialSeed = 0,
}: {
  person: Person;
  initialSliders?: Sliders;
  initialSeed?: number;
}) {
  const [sliders, setSliders] = useState<Sliders>(initialSliders ?? person.defaultSliders);
  const [comment, setComment] = useState("");
  const [seed, setSeed] = useState(initialSeed);
  const [copied, setCopied] = useState(false);

  const message = generateMessage(person, sliders, comment, seed);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const set = <K extends keyof Sliders>(k: K, v: number) => setSliders((s) => ({ ...s, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="relative rounded-lg bg-primary/5 p-5">
        <div className="absolute right-3 top-3 flex items-center gap-0.5 text-muted-foreground">
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            title="Regénérer"
            className="grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-secondary hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="sr-only">Regénérer</span>
          </button>
          <button
            type="button"
            onClick={copy}
            title="Copier"
            className="grid h-7 w-7 place-items-center rounded-md transition-colors hover:bg-secondary hover:text-foreground"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span className="sr-only">{copied ? "Copié" : "Copier"}</span>
          </button>
        </div>
        <p className="whitespace-pre-wrap pr-16 font-serif text-lg leading-relaxed text-foreground">
          {message}
        </p>
      </div>

      <div className="space-y-5 rounded-lg border border-border/60 p-4">
        <SliderRow
          label="Registre"
          left="pudique"
          right="complice"
          value={sliders.registre}
          onChange={(v) => set("registre", v)}
        />
        <SliderRow
          label="Chaleur"
          left="sobre"
          right="tendre"
          value={sliders.chaleur}
          onChange={(v) => set("chaleur", v)}
        />
        <SliderRow
          label="Humour"
          left="sincère"
          right="taquin"
          value={sliders.humour}
          onChange={(v) => set("humour", v)}
        />
        <SliderRow
          label="Longueur"
          left="bref"
          right="développé"
          value={sliders.longueur}
          onChange={(v) => set("longueur", v)}
        />

        <div className="border-t border-border/60 pt-4">
          <Label
            htmlFor="refine-comment"
            className="mb-1.5 flex items-center gap-1.5 text-xs font-normal text-muted-foreground"
          >
            <Sparkles className="h-3 w-3 text-primary" />
            Affiner par commentaire (ex. « plus court », « clin d'oeil à la guitare »)
          </Label>
          <Textarea
            id="refine-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Un commentaire libre pour affiner…"
            className="min-h-[60px]"
          />
        </div>
      </div>
    </div>
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
