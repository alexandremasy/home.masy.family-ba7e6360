import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { people, type Person } from "./maison-data";

/**
 * Mock-only people store. Same shortcut as the dish store: `people` is a
 * module-level array that the suggestions, the calendar and the "à venir" list
 * all read at call time, so we mutate it in place and bump a counter to
 * re-render. Editing someone's matière libre here shows up in their birthday
 * suggestions at once, no refactor.
 *
 * The mockup can afford this (no persistence, single tab). In the real app the
 * person profile lives behind the api — see MAISON-BRIEF.
 */
interface PeopleStore {
  people: Person[];
  get: (id: string) => Person | undefined;
  create: (d: Omit<Person, "id" | "history">) => Person;
  update: (id: string, patch: Partial<Omit<Person, "id">>) => void;
  remove: (id: string) => void;
}

const Ctx = createContext<PeopleStore | null>(null);

function slug(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "personne"
  );
}

export function PeopleProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);

  const store = useMemo<PeopleStore>(
    () => ({
      people: [...people],
      get: (id) => people.find((p) => p.id === id),
      create: (d) => {
        let id = slug(d.name);
        if (people.some((x) => x.id === id)) {
          let n = 2;
          while (people.some((x) => x.id === `${id}-${n}`)) n++;
          id = `${id}-${n}`;
        }
        const created: Person = { ...d, id, history: [] };
        people.push(created);
        bump();
        return created;
      },
      update: (id, patch) => {
        const i = people.findIndex((p) => p.id === id);
        if (i === -1) return;
        people[i] = { ...people[i], ...patch };
        bump();
      },
      remove: (id) => {
        const i = people.findIndex((p) => p.id === id);
        if (i === -1) return;
        people.splice(i, 1);
        bump();
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [version],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function usePeople(): PeopleStore {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePeople must be used inside <PeopleProvider>");
  return c;
}
