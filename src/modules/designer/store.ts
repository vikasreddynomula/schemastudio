"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Field, Schema } from "@/modules/schema/types";

// ---- your existing types (simplified for brevity) ----
type DesignerStore = {
  schema: Schema;
  history: { past: Schema[]; future: Schema[] };
  selectedId?: string;
  clipboard?: Field[] | null;

  // actions (use your own implementations if they exist)
  setSchema: (s: Schema) => void;
  importSchema: (s: Schema) => void;
  exportSchema: () => string;

  select: (id?: string) => void;
  updateField: (id: string, patch: Partial<Field>) => void;
  addField: (f: Field) => void;
  addChild: (sectionId: string, f: Field) => void;
  removeField: (id: string) => void;
  moveField: (from: number, to: number) => void;
  moveChild: (parentId: string, from: number, to: number) => void;

  copy: (id: string | string[]) => void;
  paste: (targetSectionId?: string) => void;

  undo: () => void;
  redo: () => void;
};

const STORAGE_KEY = "schemastudio_designer_v1";

export const useDesignerStore = create<DesignerStore>()(
  persist(
    (set, get) => ({
      schema: { version: 1, fields: [] },
      history: { past: [], future: [] },
      selectedId: undefined,
      clipboard: null,

      setSchema: (s) => set({ schema: s }),
      importSchema: (s) => set({ schema: s, history: { past: [], future: [] } }),
      exportSchema: () => JSON.stringify(get().schema, null, 2),

      select: (id) => set({ selectedId: id }),

      updateField: (id, patch) =>
        set((st) => {
          const next = structuredClone(st.schema);
          const visit = (arr: Field[]): boolean => {
            const i = arr.findIndex((f) => f.id === id);
            if (i >= 0) {
              arr[i] = { ...arr[i], ...patch } as Field;
              return true;
            }
            for (const f of arr) {
              const kids = (f as any).children as Field[] | undefined;
              if (kids && visit(kids)) return true;
            }
            return false;
          };
          visit(next.fields);
          return { schema: next };
        }),

      addField: (f) =>
        set((st) => ({ schema: { ...st.schema, fields: [...st.schema.fields, f] } })),

      addChild: (sectionId, f) =>
        set((st) => {
          const next = structuredClone(st.schema);
          const stack: Field[] = [...next.fields];
          while (stack.length) {
            const node = stack.pop()!;
            if (node.id === sectionId) {
              (node as any).children = (node as any).children ?? [];
              (node as any).children.push(f);
              break;
            }
            const kids = (node as any).children as Field[] | undefined;
            if (kids) stack.push(...kids);
          }
          return { schema: next };
        }),

      removeField: (id) =>
        set((st) => {
          const next = structuredClone(st.schema);
          const prune = (arr: Field[]) =>
            arr.filter((f) => {
              if (f.id === id) return false;
              if ((f as any).children) (f as any).children = prune((f as any).children);
              return true;
            });
          next.fields = prune(next.fields);
          return { schema: next };
        }),

      moveField: (from, to) =>
        set((st) => {
          const arr = [...st.schema.fields];
          const [item] = arr.splice(from, 1);
          arr.splice(to, 0, item);
          return { schema: { ...st.schema, fields: arr } };
        }),

      moveChild: (parentId, from, to) =>
        set((st) => {
          const next = structuredClone(st.schema);
          const stack: Field[] = [...next.fields];
          while (stack.length) {
            const node = stack.pop()!;
            if (node.id === parentId) {
              const kids = ((node as any).children ?? []) as Field[];
              const [item] = kids.splice(from, 1);
              kids.splice(to, 0, item);
              (node as any).children = kids;
              break;
            }
            const kids = (node as any).children as Field[] | undefined;
            if (kids) stack.push(...kids);
          }
          return { schema: next };
        }),

      copy: (ids) => {
        const idList = Array.isArray(ids) ? ids : [ids];
        const pick = (arr: Field[], id: string): Field | undefined => {
          for (const f of arr) {
            if (f.id === id) return f;
            const kids = (f as any).children as Field[] | undefined;
            const hit = kids && pick(kids, id);
            if (hit) return hit;
          }
        };
        const deepClone = (f: Field): Field => ({
          ...f,
          id: nanoid(),
          children: (f as any).children?.map(deepClone),
        } as any);
        const fields = idList.map((id) => pick(get().schema.fields, id)).filter(Boolean) as Field[];
        set({ clipboard: fields.map(deepClone) });
      },

      paste: (targetSectionId) =>
        set((st) => {
          if (!st.clipboard?.length) return {};
          const next = structuredClone(st.schema);
          if (targetSectionId) {
            const stack: Field[] = [...next.fields];
            while (stack.length) {
              const node = stack.pop()!;
              if (node.id === targetSectionId) {
                (node as any).children = (node as any).children ?? [];
                (node as any).children.push(...structuredClone(st.clipboard));
                return { schema: next };
              }
              const kids = (node as any).children as Field[] | undefined;
              if (kids) stack.push(...kids);
            }
          }
          next.fields.push(...structuredClone(st.clipboard));
          return { schema: next };
        }),

      // Simple history example (cap to 20)
      undo: () => {
        const { history, schema } = get();
        const prev = history.past[history.past.length - 1];
        if (!prev) return;
        set({
          schema: prev,
          history: {
            past: history.past.slice(0, -1),
            future: [schema, ...history.future].slice(0, 20),
          },
        });
      },
      redo: () => {
        const { history, schema } = get();
        const next = history.future[0];
        if (!next) return;
        set({
          schema: next,
          history: {
            past: [...history.past, schema].slice(-20),
            future: history.future.slice(1),
          },
        });
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Only persist what we need (schema/history/selectedId)
      partialize: (state) => ({
        schema: state.schema,
        history: state.history,
        selectedId: state.selectedId,
      }),
      // Optional: migrate older versions here
      // migrate: (persisted, version) => persisted,
    }
  )
);
