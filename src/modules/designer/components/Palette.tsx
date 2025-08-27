// src/modules/designer/components/Palette.tsx
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
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 1000 : "auto",
    touchAction: "none",
  };

  return (
    <button
      type="button"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      aria-label={`Drag ${label} from palette`}
      title="Drag to add"
      className={[
        "inline-flex items-center justify-center select-none",
        "h-8 w-8 sm:h-8 sm:w-8 rounded",
        "border border-neutral-300 hover:bg-neutral-100",
        "dark:border-neutral-700 dark:hover:bg-neutral-800",
        isDragging ? "cursor-grabbing" : "cursor-grab",
      ].join(" ")}
      onClick={(e) => e.preventDefault()} // avoid focusing/activating when starting drag
    >
      ↕
    </button>
  );
}

export function Palette() {
  const addField = useDesignerStore((s) => s.addField);

  return (
    <ul className="space-y-2 text-sm sm:text-base">
      {items.map((it) => (
        <li
          key={it.type}
          className="flex items-center justify-between gap-2 min-w-0"
        >
          <button
            type="button"
            className={[
              "flex-1 min-w-0 text-left rounded px-2 py-1",
              "border border-neutral-300 bg-white hover:bg-neutral-50 active:bg-neutral-100",
              "dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:active:bg-neutral-800/80",
            ].join(" ")}
            onClick={() => addField(createField(it.type as any, it.label) as any)}
          >
            + <span className="truncate align-middle">{it.label}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
