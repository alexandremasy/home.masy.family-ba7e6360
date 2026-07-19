import type { Meta, StoryObj } from "@storybook/react-vite";
import { Inbox } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./empty";
import { Button } from "./button";

const meta = {
  title: "UI/Empty",
  component: Empty,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Inbox />
        </EmptyMedia>
        <EmptyTitle>Aucun repas planifie</EmptyTitle>
        <EmptyDescription>
          Commencez par ajouter un plat au planning de la semaine.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="inverted">Ajouter un repas</Button>
      </EmptyContent>
    </Empty>
  ),
};
