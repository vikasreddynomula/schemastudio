// src/modules/designer/components/Palette.tsx
"use client";
import { useDesignerStore } from "@/modules/designer/store";
import { nanoid } from "nanoid";

const items = [
  { type: "text", label: "Text" },
  { type: "number", label: "Number" },
  { type: "date", label: "Date" },
  { type: "checkbox", label: "Checkbox" },
];

export function Palette() {
  const add = useDesignerStore((s) => s.addField);

  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.type}>
          <button
            className="w-full text-left border rounded px-2 py-1 hover:bg-accent"
            onClick={() =>
              add({
                id: nanoid(),
                key: `${it.type}_${nanoid(4)}`, // <-- required for Field
                type: it.type as any,
                label: it.label,
                placeholder: "",
              } as any)
            }
          >
            + {it.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
