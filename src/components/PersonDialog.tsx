import { useState } from "react";
import { usePeople } from "@/lib/people-store";
import { PersonForm, EMPTY_PERSON, type PersonDraft } from "@/components/PersonForm";
import { ResponsiveModal } from "@/components/ResponsiveModal";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Person } from "@/lib/maison-data";
import { Trash2 } from "lucide-react";

export type PersonTarget = Person | "new" | null;

/**
 * Add / edit a person, through the shared ResponsiveModal (bottom sheet on mobile,
 * centred dialog on desktop). Deleting still goes through an AlertDialog.
 */
export function PersonDialog({ target, onOpenChange }: { target: PersonTarget; onOpenChange: (open: boolean) => void }) {
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

  const form = (
    <PersonForm
      key={editing?.id ?? "new"}
      initial={initial}
      submitLabel={isNew ? "Ajouter" : "Enregistrer"}
      onCancel={() => onOpenChange(false)}
      onSubmit={(d) => {
        if (isNew) create(d);
        else if (editing) update(editing.id, d);
        onOpenChange(false);
      }}
    />
  );

  const confirm = editing && (
    <AlertDialog open={confirming} onOpenChange={setConfirming}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Retirer {editing.name} ?</AlertDialogTitle>
          <AlertDialogDescription>
            La personne sort du calendrier des anniversaires et des suggestions.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              remove(editing.id);
              onOpenChange(false);
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Retirer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} title={title} headerAction={removeButton}>
      {form}
      {confirm}
    </ResponsiveModal>
  );
}
