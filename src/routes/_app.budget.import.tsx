import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Equal,
  Lock,
  Check,
  Sparkles,
  History,
} from "lucide-react";
import { importPreviewMock, importHistory, eur2 } from "@/lib/budget-data";
import { Button } from "@/components/button";
import { Eyebrow } from "@/components/eyebrow";
import { Card } from "@/components/card";

export const Route = createFileRoute("/_app/budget/import")({
  component: ImportPage,
  head: () => ({
    meta: [
      { title: "Import — Budget" },
      { name: "description", content: "Importez vos exports iSaveMoney en toute sécurité." },
    ],
  }),
});

type Stage = "idle" | "preview" | "committed";
type Choice = "garder" | "maj";

function ImportPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [filename, setFilename] = useState<string>(importPreviewMock.filename);
  const [choices, setChoices] = useState<Record<number, Choice>>(() => {
    const o: Record<number, Choice> = {};
    importPreviewMock.modifiees.forEach((_, i) => (o[i] = "maj"));
    return o;
  });

  const onDrop = (f?: File) => {
    if (f) setFilename(f.name);
    setStage("preview");
  };
  const commit = () => setStage("committed");
  const reset = () => setStage("idle");

  const t = importPreviewMock.totals;

  return (
    <div className="space-y-6 anim-slide-up">
      <div>
        <Eyebrow size="xs">Budget · Import</Eyebrow>
        <h1 className="mt-1 text-xl tracking-tight sm:text-4xl">Importer un export iSaveMoney</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Déposez le fichier. Vous verrez exactement ce qui sera ajouté, ce qui change, et ce qui
          reste protégé — avant de valider.
        </p>
      </div>

      {stage === "idle" && (
        <DropZone dragOver={dragOver} setDragOver={setDragOver} onDrop={onDrop} />
      )}

      {stage !== "idle" && (
        <>
          <Card
            padding="sm"
            icon={<FileSpreadsheet className="h-4 w-4" />}
            title={filename}
            subline="Couvre : Juin 2025"
            action={
              <button
                onClick={reset}
                className="rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                Changer de fichier
              </button>
            }
          />

          {/* Summary banner */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBadge icon={Plus} tone="success" n={t.nouvelles} label="Nouvelles" />
            <StatBadge icon={Equal} tone="muted" n={t.inchangees} label="Inchangées" />
            <StatBadge icon={RefreshCw} tone="mustard" n={t.modifiees} label="Modifiées" />
            <StatBadge icon={Lock} tone="mustard" n={t.protegees} label="Protégées" />
          </div>

          {/* Modifiees */}
          <DiffSection
            title="Modifiées — choisir ligne par ligne"
            subtitle="Le montant a changé dans l'export. Garder votre version ou mettre à jour."
          >
            <ul className="divide-y divide-border/40">
              {importPreviewMock.modifiees.map((m, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-3 sm:flex sm:flex-wrap sm:justify-between"
                >
                  <div className="min-w-0 sm:flex-1">
                    <p className="truncate text-sm font-semibold">{m.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.date} · {m.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm tabular-nums">
                    <span className="rounded-md bg-secondary px-2 py-1 text-muted-foreground line-through">
                      {eur2(-m.oldAmount)}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="rounded-md bg-warm/10 px-2 py-1 font-semibold text-warm">
                      {eur2(-m.newAmount)}
                    </span>
                  </div>
                  <div className="col-span-2 inline-flex rounded-full border border-border/60 bg-background p-0.5 text-xs sm:col-auto">
                    <button
                      onClick={() => setChoices((c) => ({ ...c, [i]: "garder" }))}
                      className={
                        "flex-1 rounded-full px-2.5 py-1 transition-colors sm:flex-none " +
                        (choices[i] === "garder"
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground")
                      }
                    >
                      Garder
                    </button>
                    <button
                      onClick={() => setChoices((c) => ({ ...c, [i]: "maj" }))}
                      className={
                        "flex-1 rounded-full px-2.5 py-1 transition-colors sm:flex-none " +
                        (choices[i] === "maj"
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground")
                      }
                    >
                      Mettre à jour
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </DiffSection>

          {/* Protegees */}
          <DiffSection
            title="Protégées — éditions locales conservées"
            subtitle="Ces lignes ont été éditées dans le cockpit. L'import ne les touchera pas."
          >
            <ul className="divide-y divide-border/40">
              {importPreviewMock.protegees.map((p, i) => (
                <li key={i} className="flex items-center gap-3 py-3 text-sm">
                  <Lock className="h-3.5 w-3.5 text-mustard" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{p.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.date} · {p.category}
                    </p>
                  </div>
                  <span className="rounded-md bg-secondary px-2 py-1 tabular-nums text-muted-foreground">
                    {eur2(-p.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </DiffSection>

          {/* Nouvelles */}
          <DiffSection
            title="Nouvelles — à ajouter"
            subtitle="Lignes encore jamais vues. Elles seront ajoutées à la validation."
          >
            <ul className="divide-y divide-border/40">
              {importPreviewMock.nouvelles.map((n, i) => (
                <li key={i} className="flex items-center gap-3 py-3 text-sm">
                  <Plus className="h-3.5 w-3.5 text-success" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{n.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {n.date} · {n.category}
                    </p>
                  </div>
                  <span className="rounded-md bg-success/10 px-2 py-1 tabular-nums text-success">
                    {eur2(n.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </DiffSection>

          {/* Commit */}
          {stage === "preview" && (
            <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/95 px-5 py-4 shadow-lift backdrop-blur">
              <p className="text-sm">
                Prêt à fusionner — <span className="font-semibold">{t.nouvelles}</span> à ajouter,{" "}
                <span className="font-semibold">
                  {Object.values(choices).filter((c) => c === "maj").length}
                </span>{" "}
                mises à jour, <span className="font-semibold">{t.protegees}</span> protégées.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={reset}
                  className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  Annuler
                </button>
                <Button onClick={commit} variant="inverted" className="gap-1.5 rounded-full">
                  <Check className="h-3.5 w-3.5" /> Valider l'import
                </Button>
              </div>
            </div>
          )}

          {stage === "committed" && (
            <div className="rounded-2xl border border-success/30 bg-success/5 p-6 text-center anim-pop-in">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
                <Sparkles className="h-5 w-5" />
              </span>
              <p className="mt-3 text-xl tracking-tight">Import appliqué</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.nouvelles} transactions ajoutées,{" "}
                {Object.values(choices).filter((c) => c === "maj").length} mises à jour.
              </p>
              <button
                onClick={reset}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-4 py-2 text-sm hover:bg-secondary"
              >
                Importer un autre fichier
              </button>
            </div>
          )}
        </>
      )}

      {/* History */}
      <Card variant="solid" icon={<History className="h-4 w-4" />} title="Historique des imports">
        <ul className="divide-y divide-border/40">
          {importHistory.map((h) => (
            <li
              key={h.filename}
              className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{h.filename}</p>
                <p className="text-xs text-muted-foreground">
                  Importé le {h.date} · {h.month}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-success">
                  +{h.added} ajoutées
                </span>
                <span className="rounded-full bg-warm/10 px-2 py-0.5 text-warm">
                  {h.updated} màj
                </span>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Ré-importer un même mois est sûr : aucune ligne n'est dupliquée, vos éditions sont
          préservées.
        </p>
      </Card>
    </div>
  );
}

function DropZone({
  dragOver,
  setDragOver,
  onDrop,
}: {
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  onDrop: (f?: File) => void;
}) {
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onDrop(e.dataTransfer.files?.[0]);
      }}
      className={
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-card p-12 text-center transition-all duration-300 " +
        (dragOver
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border/60 hover:border-foreground/30 hover:bg-secondary/30")
      }
    >
      <span
        className={
          "grid h-14 w-14 place-items-center rounded-full transition-colors " +
          (dragOver ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")
        }
      >
        <UploadCloud className="h-6 w-6" />
      </span>
      <div>
        <p className="text-lg tracking-tight">Déposez un export ici</p>
        <p className="mt-1 text-sm text-muted-foreground">
          .xlsx ou .csv depuis iSaveMoney — ou cliquez pour parcourir
        </p>
      </div>
      <input
        type="file"
        accept=".xlsx,.csv"
        className="hidden"
        onChange={(e) => onDrop(e.target.files?.[0] ?? undefined)}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Prototype : tout fichier déposé déclenche un aperçu simulé.
      </p>
    </label>
  );
}

function StatBadge({
  icon: Icon,
  tone,
  n,
  label,
}: {
  icon: typeof Plus;
  tone: "success" | "muted" | "warm" | "mustard";
  n: number;
  label: string;
}) {
  const cls =
    tone === "success"
      ? "bg-success/10 text-success border-success/20"
      : tone === "warm"
        ? "bg-warm/10 text-warm border-warm/20"
        : tone === "mustard"
          ? "bg-mustard/15 text-mustard border-mustard/30"
          : "bg-secondary text-muted-foreground border-border/60";
  return (
    <div className={"flex items-center gap-3 rounded-2xl border p-4 shadow-soft " + cls}>
      <Icon className="h-5 w-5 shrink-0" />
      <div>
        <p className="text-xl tabular-nums leading-none">{n}</p>
        <p className="text-xs uppercase tracking-wider opacity-80">{label}</p>
      </div>
    </div>
  );
}

function DiffSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="solid" title={title} subline={subtitle}>
      {children}
    </Card>
  );
}
