"use client";
import { useDesignerStore } from "@/modules/designer/store";

export function Canvas() {
  const fields = useDesignerStore((s) => s.schema.fields);
  const select = useDesignerStore((s) => s.select);
  const remove = useDesignerStore((s) => s.removeField);

  return (
    <div className="space-y-2">
      {fields.length === 0 && (
        <p className="opacity-70">Add fields from the palette →</p>
      )}

      {fields.map((f) => (
        <div
          key={f.id}
          className="border rounded p-2 flex items-center justify-between"
        >
          <div>
            <div className="font-medium">{f.label}</div>
            <div className="text-xs opacity-70">type: {f.type}</div>
          </div>
          <div className="flex gap-2">
            <button className="underline" onClick={() => select(f.id)}>
              edit
            </button>
            <button
              className="underline text-red-600"
              onClick={() => remove(f.id)}
            >
              remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
