import { useState } from "react";
import { usePeople } from "@/lib/people-store";
import { PersonForm, EMPTY_PERSON, type PersonDraft } from "@/components/person-form";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/button";
import { Alert, AlertConfirm, AlertActions, AlertCancel, AlertContent } from "@/components/alert";
import type { Person } from "@/lib/maison-data";
import { Trash2, UserRound } from "lucide-react";

export type PersonTarget = Person | "new" | null;

/**
 * Add / edit a person, through the shared ResponsiveModal (bottom sheet on mobile,
 * centred dialog on desktop). Deleting still goes through an Alert.
 */
export function PersonDialog({
  target,
  onOpenChange,
}: {
  target: PersonTarget;
  onOpenChange: (open: boolean) => void;
}) {
  const { create, update, remove } = usePeople();
  const [confirming, setConfirming] = useState(false);

  const editing = target && target !== "new" ? target : null;
  const isNew = target === "new";
  const open = target !== null;
  const title = isNew ? "Nouvelle personne" : editing?.name;

  const initial: PersonDraft = editing
    ? {
        name: editing.name,
        relation: editing.relation,
        dob: editing.dob.slice(0, 10),
        langue: editing.langue,
        matiereLibre: editing.matiereLibre,
        defaultSliders: editing.defaultSliders,
        styles: editing.styles,
      }
    : EMPTY_PERSON;

  const removeButton = editing && (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setConfirming(true)}
      className="shrink-0 gap-1.5 text-destructive hover:text-destructive"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Retirer
    </Button>
  );

  // The form lives in the body, its actions in the sheet's footer — hence the shared
  // id: a submit button outside a form needs `form` to reach it.
  const formId = "person-form";
  const form = (
    <PersonForm
      key={editing?.id ?? "new"}
      id={formId}
      initial={initial}
      onSubmit={(d) => {
        if (isNew) create(d);
        else if (editing) update(editing.id, d);
        onOpenChange(false);
      }}
    />
  );

  const confirm = editing && (
    <Alert open={confirming} onOpenChange={setConfirming}>
      <AlertContent
        tone="destructive"
        title={`Retirer ${editing.name} ?`}
        footer={
          <AlertActions>
            <AlertCancel>Annuler</AlertCancel>
            <AlertConfirm
              onClick={() => {
                remove(editing.id);
                onOpenChange(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Retirer
            </AlertConfirm>
          </AlertActions>
        }
      >
        La personne sort du calendrier des anniversaires et des suggestions.
      </AlertContent>
    </Alert>
  );

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      icon={<UserRound className="h-4 w-4" />}
      trailing={removeButton}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" form={formId}>
            {isNew ? "Ajouter" : "Enregistrer"}
          </Button>
        </>
      }
    >
      {form}
      {confirm}
    </ResponsiveModal>
  );
}
