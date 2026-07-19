import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="repas" className="w-80">
      <TabsList>
        <TabsTrigger value="repas">Repas</TabsTrigger>
        <TabsTrigger value="courses">Courses</TabsTrigger>
        <TabsTrigger value="budget">Budget</TabsTrigger>
      </TabsList>
      <TabsContent value="repas" className="text-sm text-muted-foreground">
        Le planning des repas de la semaine.
      </TabsContent>
      <TabsContent value="courses" className="text-sm text-muted-foreground">
        La liste des courses derivee des repas.
      </TabsContent>
      <TabsContent value="budget" className="text-sm text-muted-foreground">
        Le suivi des enveloppes du foyer.
      </TabsContent>
    </Tabs>
  ),
};
