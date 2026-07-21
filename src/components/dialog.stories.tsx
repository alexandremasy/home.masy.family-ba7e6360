import type { Meta, StoryObj } from "@storybook/react-vite";
import { CalendarPlus } from "lucide-react";
import { Dialog, DialogActions, DialogClose, DialogContent, DialogTrigger } from "./dialog";
import { Badge } from "./badge";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "Overlays/Dialog",
  component: Dialog,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every slot at once — icon, title, subline, action, body, footer. */
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="inverted">Nouveau repas</Button>
      </DialogTrigger>
      <DialogContent
        icon={<CalendarPlus className="h-4 w-4" />}
        title="Ajouter un repas"
        subline="Mardi 21 juillet · dîner"
        action={<Badge variant="secondary">Brouillon</Badge>}
        footer={
          <DialogActions>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button variant="inverted">Enregistrer</Button>
          </DialogActions>
        }
      >
        <div className="grid gap-3">
          <Label htmlFor="plat">Plat</Label>
          <Input id="plat" placeholder="Gratin de courgettes" />
        </div>
      </DialogContent>
    </Dialog>
  ),
};

/** The floor: a title and a body. No icon, no action, no footer. */
export const TitleOnly: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="inverted">Nouveau repas</Button>
      </DialogTrigger>
      <DialogContent title="Ajouter un repas" subline="Renseignez le plat et le jour prévu.">
        <div className="grid gap-3">
          <Label htmlFor="plat-2">Plat</Label>
          <Input id="plat-2" placeholder="Gratin de courgettes" />
        </div>
      </DialogContent>
    </Dialog>
  ),
};

/** A long body scrolls on its own; the header and the footer stay put. */
export const ScrollingBody: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="inverted">Voir les plats</Button>
      </DialogTrigger>
      <DialogContent
        title="Plats"
        subline="24 plats dans la bibliothèque"
        footer={
          <DialogActions>
            <DialogClose asChild>
              <Button variant="outline">Fermer</Button>
            </DialogClose>
          </DialogActions>
        }
      >
        <ul className="space-y-2">
          {Array.from({ length: 24 }, (_, i) => (
            <li key={i} className="rounded-lg bg-secondary/50 px-3 py-2 text-sm">
              Plat n° {i + 1}
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  ),
};
