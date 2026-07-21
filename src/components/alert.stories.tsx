import type { Meta, StoryObj } from "@storybook/react-vite";
import { Trash2 } from "lucide-react";
import {
  Alert,
  AlertConfirm,
  AlertActions,
  AlertCancel,
  AlertContent,
  AlertTrigger,
} from "./alert";
import { Button } from "./button";

const meta = {
  title: "Overlays/Alert",
  component: Alert,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTrigger asChild>
        <Button variant="destructive">Supprimer le repas</Button>
      </AlertTrigger>
      <AlertContent
        icon={<Trash2 className="h-4 w-4" />}
        tone="destructive"
        title="Confirmer la suppression"
        footer={
          <AlertActions>
            <AlertCancel>Annuler</AlertCancel>
            <AlertConfirm>Supprimer</AlertConfirm>
          </AlertActions>
        }
      >
        Cette action est irréversible. Le repas sera retiré du planning.
      </AlertContent>
    </Alert>
  ),
};
