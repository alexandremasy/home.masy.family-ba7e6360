import { useEffect, useState, type ReactNode } from "react";
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
  Loader2,
} from "lucide-react";
import { eur2 } from "@/lib/budget-data";
import { Button } from "@/components/button";
import { Eyebrow } from "@/components/eyebrow";
import { Card } from "@/components/card";

/* ─────────────────────────────────────────────────────────────────────────────
   The import, as a page.

   Its props are its OWN shapes, deliberately minimal — not the mock's types and
   not the api's. Every amount arrives ALREADY SIGNED and every date already
   worded: this page renders a diff, it does not interpret one.

   The three stages are not state either. `preview` decides between the drop zone
   and the diff, `committed` between the diff and the receipt — because reaching
   either is the caller's asynchronous business (parse the file, post it), and a
   page cannot pretend to know it happened. What stays here is the keep/update
   choice, which is a reading of the diff and belongs to whoever reads it.
   ──────────────────────────────────────────────────────────────────────────── */

/** One line of the diff, whichever section it sits in. */
export interface ImportDiffView {
  /** Opaque line identity, handed back for the lines to keep. */
  key: string;
  label: string;
  /** Already worded — the page prints it as it comes. */
  date: string;
  /** Already composed, subcategory included. */
  category: string;
  /** SIGNED, as it should read. */
  amount: number;
  /** What it was, SIGNED. Only the updated section has one. */
  previousAmount?: number | null;
}

/** The headline counts, one badge each. */
export interface ImportCountsView {
  added: number;
  unchanged: number;
  updated: number;
  protectedCount: number;
}

/** What the file would do, before anything is written. */
export interface ImportPreviewView {
  filename: string;
  /** The period the file covers, already worded. */
  month: string;
  counts: ImportCountsView;
  /** Lines whose amount changed — the ones offering a choice. */
  updated: ImportDiffView[];
  /** Lines edited here, which the import will not touch. */
  protectedLines: ImportDiffView[];
  /** Lines never seen before. */
  added: ImportDiffView[];
}

/** One past import. */
export interface ImportHistoryView {
  key: string;
  filename: string;
  /** Already worded. */
  date: string;
  month: string;
  added: number;
  updated: number;
}

export interface ImportTemplateProps {
  /** What the dropped file would do. `null` shows the drop zone instead. */
  preview: ImportPreviewView | null;
  /** The import went through — shows the receipt in place of the commit bar. */
  committed?: boolean;
  /** Past imports, most recent first. */
  history: ImportHistoryView[];
  /** A file is being read, or the import is being written. */
  busy?: boolean;
  /** A file was dropped or picked. The caller turns it into a preview. */
  onFile: (file: File) => void;
  /** Apply the import. `keptKeys` are the updated lines the reader chose NOT to take. */
  onCommit: (keptKeys: string[]) => void;
  /** Back to the drop zone. */
  onReset: () => void;
}

export function ImportTemplate({
  preview,
  committed = false,
  history,
  busy = false,
  onFile,
  onCommit,
  onReset,
}: ImportTemplateProps) {
  const [dragOver, setDragOver] = useState(false);
  // Per-line keep/update, defaulting to update — the export is the newer truth
  // unless the reader says otherwise. Reset whenever a new preview lands.
  const [kept, setKept] = useState<Set<string>>(new Set());
  useEffect(() => setKept(new Set()), [preview]);

  const updatedCount = preview ? preview.updated.length - kept.size : 0;

  const choose = (key: string, keep: boolean) =>
    setKept((s) => {
      const n = new Set(s);
      if (keep) n.add(key);
      else n.delete(key);
      return n;
    });

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

      {!preview ? (
        <DropZone dragOver={dragOver} setDragOver={setDragOver} busy={busy} onFile={onFile} />
      ) : (
        <>
          <Card
            padding="sm"
            icon={<FileSpreadsheet className="h-4 w-4" />}
            title={preview.filename}
            subline={`Couvre : ${preview.month}`}
            trailing={
              <button
                onClick={onReset}
                className="rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                Changer de fichier
              </button>
            }
          />

          {/* Summary banner */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBadge icon={Plus} tone="success" n={preview.counts.added} label="Nouvelles" />
            <StatBadge icon={Equal} tone="muted" n={preview.counts.unchanged} label="Inchangées" />
            <StatBadge
              icon={RefreshCw}
              tone="mustard"
              n={preview.counts.updated}
              label="Modifiées"
            />
            <StatBadge
              icon={Lock}
              tone="mustard"
              n={preview.counts.protectedCount}
              label="Protégées"
            />
          </div>

          {preview.updated.length > 0 && (
            <DiffSection
              title="Modifiées — choisir ligne par ligne"
              subtitle="Le montant a changé dans l'export. Garder votre version ou mettre à jour."
            >
              <ul className="divide-y divide-border/40">
                {preview.updated.map((m) => (
                  <li
                    key={m.key}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-3 sm:flex sm:flex-wrap sm:justify-between"
                  >
                    <DiffLabel d={m} className="sm:flex-1" />
                    <div className="flex items-center gap-2 text-sm tabular-nums">
                      {m.previousAmount != null && (
                        <span className="rounded-md bg-secondary px-2 py-1 text-muted-foreground line-through">
                          {eur2(m.previousAmount)}
                        </span>
                      )}
                      <span className="text-muted-foreground">→</span>
                      <span className="rounded-md bg-warm/10 px-2 py-1 font-semibold text-warm">
                        {eur2(m.amount)}
                      </span>
                    </div>
                    <div className="col-span-2 inline-flex rounded-full border border-border/60 bg-background p-0.5 text-xs sm:col-auto">
                      <button
                        onClick={() => choose(m.key, true)}
                        className={
                          "flex-1 rounded-full px-2.5 py-1 transition-colors sm:flex-none " +
                          (kept.has(m.key)
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:text-foreground")
                        }
                      >
                        Garder
                      </button>
                      <button
                        onClick={() => choose(m.key, false)}
                        className={
                          "flex-1 rounded-full px-2.5 py-1 transition-colors sm:flex-none " +
                          (kept.has(m.key)
                            ? "text-muted-foreground hover:text-foreground"
                            : "bg-foreground text-background")
                        }
                      >
                        Mettre à jour
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </DiffSection>
          )}

          {preview.protectedLines.length > 0 && (
            <DiffSection
              title="Protégées — éditions locales conservées"
              subtitle="Ces lignes ont été éditées dans le cockpit. L'import ne les touchera pas."
            >
              <ul className="divide-y divide-border/40">
                {preview.protectedLines.map((p) => (
                  <li key={p.key} className="flex items-center gap-3 py-3 text-sm">
                    <Lock className="h-3.5 w-3.5 text-mustard" />
                    <DiffLabel d={p} className="flex-1" />
                    <span className="rounded-md bg-secondary px-2 py-1 tabular-nums text-muted-foreground">
                      {eur2(p.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </DiffSection>
          )}

          {preview.added.length > 0 && (
            <DiffSection
              title="Nouvelles — à ajouter"
              subtitle="Lignes encore jamais vues. Elles seront ajoutées à la validation."
            >
              <ul className="divide-y divide-border/40">
                {preview.added.map((n) => (
                  <li key={n.key} className="flex items-center gap-3 py-3 text-sm">
                    <Plus className="h-3.5 w-3.5 text-success" />
                    <DiffLabel d={n} className="flex-1" />
                    <span className="rounded-md bg-success/10 px-2 py-1 tabular-nums text-success">
                      {eur2(n.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </DiffSection>
          )}

          {committed ? (
            <div className="rounded-2xl border border-success/30 bg-success/5 p-6 text-center anim-pop-in">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/15 text-success">
                <Sparkles className="h-5 w-5" />
              </span>
              <p className="mt-3 text-xl tracking-tight">Import appliqué</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {preview.counts.added} transactions ajoutées, {updatedCount} mises à jour.
              </p>
              <button
                onClick={onReset}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-4 py-2 text-sm hover:bg-secondary"
              >
                Importer un autre fichier
              </button>
            </div>
          ) : (
            <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/95 px-5 py-4 shadow-lift backdrop-blur">
              <p className="text-sm">
                Prêt à fusionner — <span className="font-semibold">{preview.counts.added}</span> à
                ajouter, <span className="font-semibold">{updatedCount}</span> mises à jour,{" "}
                <span className="font-semibold">{preview.counts.protectedCount}</span> protégées.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={onReset}
                  className="rounded-full px-4 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  Annuler
                </button>
                <Button
                  onClick={() => onCommit([...kept])}
                  disabled={busy}
                  variant="inverted"
                  className="gap-1.5 rounded-full"
                >
                  {busy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}{" "}
                  Valider l'import
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* History */}
      <Card variant="solid" icon={<History className="h-4 w-4" />} title="Historique des imports">
        <ul className="divide-y divide-border/40">
          {history.map((h) => (
            <li
              key={h.key}
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
          {history.length === 0 && (
            <li className="py-3 text-sm text-muted-foreground">Aucun import pour l'instant.</li>
          )}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Ré-importer un même mois est sûr : aucune ligne n'est dupliquée, vos éditions sont
          préservées.
        </p>
      </Card>
    </div>
  );
}

function DiffLabel({ d, className = "" }: { d: ImportDiffView; className?: string }) {
  return (
    <div className={"min-w-0 " + className}>
      <p className="truncate text-sm font-semibold">{d.label}</p>
      <p className="text-xs text-muted-foreground">
        {d.date} · {d.category}
      </p>
    </div>
  );
}

function DropZone({
  dragOver,
  setDragOver,
  busy,
  onFile,
}: {
  dragOver: boolean;
  setDragOver: (v: boolean) => void;
  busy: boolean;
  onFile: (f: File) => void;
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
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
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
        {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
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
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
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
  children: ReactNode;
}) {
  return (
    <Card variant="solid" title={title} subline={subtitle}>
      {children}
    </Card>
  );
}
