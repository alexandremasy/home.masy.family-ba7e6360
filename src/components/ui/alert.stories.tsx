import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertTriangle, Info, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

// The meaningful pair here is `default` (a neutral note) and `warn` (the terracotta
// alert tone). `destructive` stays for genuine errors.
const meta = {
  title: "UI/Alert",
  component: Alert,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "warn", "destructive"] },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Alert {...args}>
      <Info />
      <AlertTitle>Synchronisation terminee</AlertTitle>
      <AlertDescription>Les donnees du foyer sont a jour.</AlertDescription>
    </Alert>
  ),
};

export const Warn: Story = {
  render: (args) => (
    <Alert {...args} variant="warn">
      <AlertTriangle />
      <AlertTitle>Budget bientot depasse</AlertTitle>
      <AlertDescription>Il reste 42 EUR sur l'enveloppe Courses.</AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: (args) => (
    <Alert {...args} variant="destructive">
      <Terminal />
      <AlertTitle>Erreur de connexion</AlertTitle>
      <AlertDescription>Impossible de joindre l'API. Reessayez plus tard.</AlertDescription>
    </Alert>
  ),
};
