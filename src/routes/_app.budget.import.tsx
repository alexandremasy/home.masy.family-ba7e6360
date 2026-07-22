import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ImportTemplate,
  type ImportHistoryView,
  type ImportPreviewView,
} from "@/templates/budget-import";
import { importPreviewMock, importHistory } from "@/lib/budget-data";

export const Route = createFileRoute("/_app/budget/import")({
  component: ImportPage,
  head: () => ({
    meta: [
      { title: "Import — Budget" },
      { name: "description", content: "Importez vos exports iSaveMoney en toute sécurité." },
    ],
  }),
});

/**
 * The page is the template; this file only pretends to be a backend.
 *
 * Any dropped file yields the same canned diff — enough to make the page *feel*
 * right, which is what a mockup owes. The cockpit posts the real file and gets a
 * real preview back; the template cannot tell, because it only ever sees a
 * filename, three lists and counts.
 */
function ImportPage() {
  const [dropped, setDropped] = useState<string | null>(null);
  const [committed, setCommitted] = useState(false);

  // The mock keeps its amounts positive and lets each list decide how to show
  // them; the template takes one convention — signed, as it reads.
  const preview = useMemo<ImportPreviewView | null>(() => {
    if (!dropped) return null;
    const m = importPreviewMock;
    return {
      filename: dropped,
      month: "Juin 2025",
      counts: {
        added: m.totals.nouvelles,
        unchanged: m.totals.inchangees,
        updated: m.totals.modifiees,
        protectedCount: m.totals.protegees,
      },
      updated: m.modifiees.map((x) => ({
        key: `${x.date}|${x.label}`,
        label: x.label,
        date: x.date,
        category: x.category,
        amount: -x.newAmount,
        previousAmount: -x.oldAmount,
      })),
      protectedLines: m.protegees.map((x) => ({
        key: `${x.date}|${x.label}`,
        label: x.label,
        date: x.date,
        category: x.category,
        amount: -x.amount,
      })),
      added: m.nouvelles.map((x) => ({
        key: `${x.date}|${x.label}`,
        label: x.label,
        date: x.date,
        category: x.category,
        amount: x.amount,
      })),
    };
  }, [dropped]);

  const history = useMemo<ImportHistoryView[]>(
    () =>
      importHistory.map((h) => ({
        key: h.filename,
        filename: h.filename,
        date: h.date,
        month: h.month,
        added: h.added,
        updated: h.updated,
      })),
    [],
  );

  return (
    <ImportTemplate
      preview={preview}
      committed={committed}
      history={history}
      onFile={(f) => {
        setCommitted(false);
        setDropped(f.name);
      }}
      onCommit={() => setCommitted(true)}
      onReset={() => {
        setCommitted(false);
        setDropped(null);
      }}
    />
  );
}
