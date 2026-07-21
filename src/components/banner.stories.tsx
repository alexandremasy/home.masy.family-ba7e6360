import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertTriangle, Info, Terminal } from "lucide-react";
import { Banner, BannerDescription, BannerTitle } from "./banner";

// The meaningful pair here is `default` (a neutral note) and `warn` (the terracotta
// alert tone). `destructive` stays for genuine errors.
const meta = {
  title: "Information/Banner",
  component: Banner,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "warn", "destructive"] },
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Banner {...args}>
      <Info />
      <BannerTitle>Synchronisation terminee</BannerTitle>
      <BannerDescription>Les donnees du foyer sont a jour.</BannerDescription>
    </Banner>
  ),
};

export const Warn: Story = {
  render: (args) => (
    <Banner {...args} variant="warn">
      <AlertTriangle />
      <BannerTitle>Budget bientot depasse</BannerTitle>
      <BannerDescription>Il reste 42 EUR sur l'enveloppe Courses.</BannerDescription>
    </Banner>
  ),
};

export const Destructive: Story = {
  render: (args) => (
    <Banner {...args} variant="destructive">
      <Terminal />
      <BannerTitle>Erreur de connexion</BannerTitle>
      <BannerDescription>Impossible de joindre l'API. Reessayez plus tard.</BannerDescription>
    </Banner>
  ),
};
