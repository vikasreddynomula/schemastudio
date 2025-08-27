"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useDesignerStore } from "@/modules/designer/store";
import { createField } from "@/modules/designer/factories";

const items = [
  { type: "text", label: "Text" },
  { type: "number", label: "Number" },
  { type: "date", label: "Date" },
  { type: "checkbox", label: "Checkbox" },
  { type: "select", label: "Select" },
  { type: "multiselect", label: "Multi-select" },
  { type: "radio", label: "Radio group" },
  { type: "section", label: "Section" },
  { type: "array", label: "Array" },
] as const;

function DragHandle({ id, type, label }: { id: string; type: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { from: "palette", type, label },
  });
  
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <span
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`px-2 py-1 rounded border select-none ${
        isDragging ? 'cursor-grabbing bg-blue-100 border-blue-300' : 'cursor-grab hover:bg-gray-100'
      }`}
      aria-label="Drag to add"
      title="Drag to add"
    >
      ↕
    </span>
  );
}

export function Palette() {
  const addField = useDesignerStore((s) => s.addField);

  return (
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it.type} className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="flex-1 text-left border rounded px-2 py-1 hover:bg-neutral-100"
            onClick={() => addField(createField(it.type as any, it.label) as any)}
          >
            + {it.label}
          </button>
          <DragHandle id={`palette-${it.type}`} type={it.type} label={it.label} />
        </li>
      ))}
    </ul>
  );
}