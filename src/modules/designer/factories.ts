// src/modules/designer/factories.ts
import type { Field, FieldType, SelectOption } from "@/modules/schema/types";



function safeId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    // fallback: generate UUID manually
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

const rid = () => safeId();
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
