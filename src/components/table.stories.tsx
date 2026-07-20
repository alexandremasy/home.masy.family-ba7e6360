import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

const meta = {
  title: "Information/Table",
  component: Table,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const courses = [
  { item: "Courgettes", quantite: "4", rayon: "Legumes" },
  { item: "Creme fraiche", quantite: "1", rayon: "Frais" },
  { item: "Gruyere rape", quantite: "200 g", rayon: "Frais" },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>Liste des courses de la semaine.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Article</TableHead>
          <TableHead>Quantite</TableHead>
          <TableHead className="text-right">Rayon</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((c) => (
          <TableRow key={c.item}>
            <TableCell className="font-semibold">{c.item}</TableCell>
            <TableCell>{c.quantite}</TableCell>
            <TableCell className="text-right">{c.rayon}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total articles</TableCell>
          <TableCell className="text-right">{courses.length}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};
