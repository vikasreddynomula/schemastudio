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
  addChild: (parentId: string, child: Field) => void;
  updateField: (id: string, patch: Partial<Field>) => void;
  removeField: (id: string) => void;
  moveField: (from: number, to: number) => void;
  moveChild: (parentId: string, from: number, to: number) => void;
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

function findFieldRecursive(fields: Field[], id: string): Field | undefined {
  for (const f of fields) {
    if (f.id === id) return f;
    if (f.type === "section") {
      const hit = findFieldRecursive((f as any).children, id);
      if (hit) return hit;
    }
  }
  return undefined;
}

function mapFieldsRecursive(fields: Field[], fn: (f: Field) => Field): Field[] {
  return fields.map((f) => {
    const withChildren =
      f.type === "section"
        ? { ...(f as any), children: mapFieldsRecursive((f as any).children, fn) }
        : f;
    return fn(withChildren);
  });
}

function removeFieldRecursive(fields: Field[], id: string): Field[] {
  const out: Field[] = [];
  for (const f of fields) {
    if (f.id === id) continue;
    if (f.type === "section") {
      out.push({ ...(f as any), children: removeFieldRecursive((f as any).children, id) });
    } else {
      out.push(f);
    }
  }
  return out;
}

function addChildRecursive(fields: Field[], parentId: string, child: Field): Field[] {
  return fields.map((f) => {
    if (f.id === parentId && f.type === "section") {
      return { ...(f as any), children: [...(f as any).children, child] };
    }
    if (f.type === "section") {
      return { ...(f as any), children: addChildRecursive((f as any).children, parentId, child) };
    }
    return f;
  });
}

function moveChildRecursive(fields: Field[], parentId: string, from: number, to: number): Field[] {
  return fields.map((f) => {
    if (f.id === parentId && f.type === "section") {
      const children = [...(f as any).children];
      const [it] = children.splice(from, 1);
      if (!it) return f;
      children.splice(to, 0, it);
      return { ...(f as any), children };
    }
    if (f.type === "section") {
      return { ...(f as any), children: moveChildRecursive((f as any).children, parentId, from, to) };
    }
    return f;
  });
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

  addChild: (parentId, child) =>
    set((s) => {
      const next: Schema = { ...s.schema, fields: addChildRecursive(s.schema.fields, parentId, child) };
      return pushHistory(s, next);
    }),

  updateField: (id, patch) =>
    set((s) => {
      const next: Schema = {
        ...s.schema,
        fields: mapFieldsRecursive(s.schema.fields, (f) => (f.id === id ? { ...f, ...patch } : f)),
      };
      return pushHistory(s, next);
    }),

  removeField: (id) =>
    set((s) => {
      const next: Schema = { ...s.schema, fields: removeFieldRecursive(s.schema.fields, id) };
      const clearedSel = s.selectedId === id ? undefined : s.selectedId;
      return pushHistory({ ...s, selectedId: clearedSel }, next);
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

  moveChild: (parentId, from, to) =>
    set((s) => {
      const next: Schema = { ...s.schema, fields: moveChildRecursive(s.schema.fields, parentId, from, to) };
      return pushHistory(s, next);
    }),

  copy: (id) =>
    set((s) => ({
      ...s,
      clipboard: findFieldRecursive(s.schema.fields, id) ?? null,
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
      return { ...s, schema: prev, history: { past, present: prev, future } };
    }),

  redo: () =>
    set((s) => {
      const [next, ...restFuture] = s.history.future;
      if (!next) return s;
      const past = [...s.history.past, s.history.present];
      return { ...s, schema: next, history: { past, present: next, future: restFuture } };
    }),

  importSchema: (schema) => set((s) => pushHistory(s, schema)),

  exportSchema: () => JSON.stringify(get().schema, null, 2),
}));

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
