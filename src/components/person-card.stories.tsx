import type { Meta, StoryObj } from "@storybook/react-vite";
import { NO_BIRTH_YEAR, people, type Person } from "@/lib/maison-data";
import { PersonCard } from "@/components/person-card";

const withYear = people.find((p) => p.id === "maman") ?? people[0];

// A person tracked on day + month alone (no birth year → no age line).
const noYear: Person = {
  id: "voisin",
  name: "Voisin Marc",
  dob: `${NO_BIRTH_YEAR}-06-21`,
  langue: "fr",
  relation: "voisin",
  defaultSliders: { registre: 2, chaleur: 2, humour: 2, longueur: 1 },
  matiereLibre: "",
  history: [],
};

const meta = {
  title: "Information/Person Card",
  component: PersonCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  args: { person: withYear },
} satisfies Meta<typeof PersonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No `onEdit` — a static tile. */
export const Static: Story = {};

/** With `onEdit` it becomes a button opening the edit modal. */
export const Actionable: Story = {
  args: { onEdit: () => {} },
};

/** No birth year: the age is dropped, only relation · date remain. */
export const NoBirthYear: Story = {
  args: { person: noYear, onEdit: () => {} },
};
