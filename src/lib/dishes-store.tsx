import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { dishes, type Dish } from "./maison-data";

/**
 * Mock-only dish store.
 *
 * `dishes` is a module-level array that `dishById`, `suggestFor` and
 * `deriveCourses` all read **at call time**. Rather than thread a pool through
 * every one of them, we mutate that array in place and bump a counter to
 * re-render — so an edited dish shows up in the plan, the suggestions and the
 * shopping list at once, with no refactor.
 *
 * This is a shortcut the mockup can afford (no persistence, single tab). In the
 * real app this lives behind the api — see MAISON-BRIEF.
 */
interface DishesStore {
  dishes: Dish[];
  get: (id: string) => Dish | undefined;
  create: (d: Omit<Dish, "id">) => Dish;
  update: (id: string, patch: Omit<Dish, "id">) => void;
  remove: (id: string) => void;
}

const Ctx = createContext<DishesStore | null>(null);

function slug(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "plat"
  );
}

export function DishesProvider({ children }: { children: ReactNode }) {
  const [version, setVersion] = useState(0);
  const bump = () => setVersion((v) => v + 1);

  const store = useMemo<DishesStore>(
    () => ({
      dishes: [...dishes],
      get: (id) => dishes.find((d) => d.id === id),
      create: (d) => {
        let id = slug(d.name);
        // Collisions are possible — "Salade" twice — so suffix rather than clobber.
        if (dishes.some((x) => x.id === id)) {
          let n = 2;
          while (dishes.some((x) => x.id === `${id}-${n}`)) n++;
          id = `${id}-${n}`;
        }
        const created: Dish = { ...d, id };
        dishes.push(created);
        bump();
        return created;
      },
      update: (id, patch) => {
        const i = dishes.findIndex((d) => d.id === id);
        if (i === -1) return;
        dishes[i] = { ...patch, id };
        bump();
      },
      remove: (id) => {
        const i = dishes.findIndex((d) => d.id === id);
        if (i === -1) return;
        dishes.splice(i, 1);
        bump();
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }),
    [version],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useDishes(): DishesStore {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDishes must be used inside <DishesProvider>");
  return c;
}
