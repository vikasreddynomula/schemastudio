// src/modules/designer/factories.ts
import type { Field, FieldType, SelectOption } from "@/modules/schema/types";

const rid = () => crypto.randomUUID();
const rkey = (t: string) => `${t}_${Math.random().toString(36).slice(2,6)}`;

export function createField(type: FieldType, label: string): Field {
  const base = { id: rid(), key: rkey(type), type, label, placeholder: "", validation: {} };
  if (type === "select" || type === "multiselect" || type === "radio") {
    return { ...base, options: sampleOptions() } as Field;
  }
  if (type === "section") return { ...base, children: [] } as Field;
  if (type === "array")   return { ...base, of: { ...base, id: rid(), key: rkey("item"), type: "text", label: "Item" } as any } as Field;
  return base as Field;
}

export function sampleOptions(): SelectOption[] {
  return [
    { value: "one", label: "One" },
    { value: "two", label: "Two" },
    { value: "three", label: "Three" },
  ];
}
