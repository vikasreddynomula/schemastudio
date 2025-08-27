// src/modules/designer/components/OptionsEditor.tsx
"use client";

import { nanoid } from "nanoid";

export type Option = { id: string; label: string; value: string };

export function OptionsEditor({
  options,
  onChange,
}: {
  options: Option[];
  onChange: (opts: Option[]) => void;
}) {
  const update = (id: string, patch: Partial<Option>) =>
    onChange(options.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  return (
    <div className="space-y-2">
      <label className="font-medium">Choices</label>
      {options.map((o) => (
        <div key={o.id} className="flex gap-2">
          <input
            className="flex-1 rounded border p-1"
            placeholder="Label"
            value={o.label}
            onChange={(e) => update(o.id, { label: e.target.value })}
          />
          <input
            className="flex-1 rounded border p-1"
            placeholder="Value"
            value={o.value}
            onChange={(e) => update(o.id, { value: e.target.value })}
          />
          <button
            type="button"
            className="text-red-600"
            onClick={() => onChange(options.filter((x) => x.id !== o.id))}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-blue-600 underline"
        onClick={() =>
          onChange([...options, { id: nanoid(), label: "", value: "" }])
        }
      >
        + Add option
      </button>
    </div>
  );
}
