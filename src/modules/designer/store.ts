// src/modules/designer/store.ts
import { create } from "zustand";
import type { Schema, Field } from "@/modules/schema/types";

export type DesignerState = {
  schema: Schema;
  selectedId?: string;
  clipboard?: Field | null;
  history: { past: Schema[]; present: Schema; future: Schema[] };
};

export type DesignerActions = {
  select: (id?: string) => void;
  addField: (field: Field) => void;
  updateField: (id: string, patch: Partial<Field>) => void;
  removeField: (id: string) => void;
  moveField: (from: number, to: number) => void;
  copy: (id: string) => void;
  paste: (toIndex?: number) => void;
  undo: () => void;
  redo: () => void;
  importSchema: (schema: Schema) => void;
  exportSchema: () => string;
};

type Store = DesignerState & DesignerActions;

const emptySchema: Schema = { version: 1, fields: [] };

function pushHistory(state: DesignerState, next: Schema): DesignerState {
  return {
    ...state,
    schema: next,
    history: {
      past: [...state.history.past, state.history.present],
      present: next,
      future: [],
    },
  };
}

export const useDesignerStore = create<Store>((set, get) => ({
  schema: emptySchema,
  selectedId: undefined,
  clipboard: null,
  history: { past: [], present: emptySchema, future: [] },

  select: (id) => set({ selectedId: id }),

  addField: (field) =>
    set((s) => {
      const next: Schema = { ...s.schema, fields: [...s.schema.fields, field] };
      return pushHistory(s, next);
    }),

  updateField: (id, patch) =>
    set((s) => {
      const next: Schema = {
        ...s.schema,
        fields: s.schema.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      };
      return pushHistory(s, next);
    }),

  removeField: (id) =>
    set((s) => {
      const next: Schema = {
        ...s.schema,
        fields: s.schema.fields.filter((f) => f.id !== id),
      };
      const clearedSel = s.selectedId === id ? undefined : s.selectedId;
      const withHist = pushHistory({ ...s, selectedId: clearedSel }, next);
      return withHist;
    }),

  moveField: (from, to) =>
    set((s) => {
      if (from === to) return s;
      const arr = [...s.schema.fields];
      const [item] = arr.splice(from, 1);
      if (!item) return s;
      arr.splice(to, 0, item);
      const next: Schema = { ...s.schema, fields: arr };
      return pushHistory(s, next);
    }),

  copy: (id) =>
    set((s) => ({
      ...s,
      clipboard: s.schema.fields.find((f) => f.id === id) ?? null,
    })),

  paste: (toIndex) =>
    set((s) => {
      const src = s.clipboard;
      if (!src) return s;
      const clone: Field = {
        ...(src as any),
        id: crypto.randomUUID(),
        key:
          (src as any).key != null
            ? `${(src as any).key}_${Math.random().toString(36).slice(2, 6)}`
            : crypto.randomUUID(),
      };
      const arr = [...s.schema.fields];
      if (typeof toIndex === "number") arr.splice(toIndex, 0, clone);
      else arr.push(clone);
      const next: Schema = { ...s.schema, fields: arr };
      return pushHistory(s, next);
    }),

  undo: () =>
    set((s) => {
      const past = [...s.history.past];
      const prev = past.pop();
      if (!prev) return s;
      const future = [s.history.present, ...s.history.future];
      return {
        ...s,
        schema: prev,
        history: { past, present: prev, future },
      };
    }),

  redo: () =>
    set((s) => {
      const [next, ...restFuture] = s.history.future;
      if (!next) return s;
      const past = [...s.history.past, s.history.present];
      return {
        ...s,
        schema: next,
        history: { past, present: next, future: restFuture },
      };
    }),

  importSchema: (schema) =>
    set((s) => pushHistory(s, schema)),

  exportSchema: () => JSON.stringify(get().schema, null, 2),
}));

// Optional: keyboard shortcuts (Cmd/Ctrl+Z / Shift+Cmd/Ctrl+Z)
if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    const store = useDesignerStore.getState();
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) store.redo();
      else store.undo();
    }
  });
}
