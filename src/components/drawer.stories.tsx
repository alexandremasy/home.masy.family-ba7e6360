import type { Meta, StoryObj } from "@storybook/react-vite";
import { Drawer, DrawerActions, DrawerClose, DrawerContent, DrawerTrigger } from "./drawer";
import { Button } from "./button";

const meta = {
  title: "Overlays/Drawer",
  component: Drawer,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Ouvrir le tiroir</Button>
      </DrawerTrigger>
      <DrawerContent
        title="Détails de la course"
        subline="Ajustez la quantité avant de valider."
        footer={
          <DrawerActions>
            <DrawerClose asChild>
              <Button variant="outline">Fermer</Button>
            </DrawerClose>
            <Button variant="inverted">Valider</Button>
          </DrawerActions>
        }
      >
        <p className="text-sm text-muted-foreground">2 kg de pommes de terre.</p>
      </DrawerContent>
    </Drawer>
  ),
};
