"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDesignerStore } from "@/modules/designer/store";
import type { Field } from "@/modules/schema/types";

function RootContainer({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "root", data: { containerId: "root" } });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[200px] rounded p-2 ${isOver ? "outline outline-2 outline-blue-400" : ""}`}
    >
      {children}
    </div>
  );
}

function SectionDroppable({ sectionId, children }: { sectionId: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: `section-${sectionId}` });
  return (
    <div
      ref={setNodeRef}
      className={`${isOver ? "outline outline-2 outline-blue-400" : ""}`}
    >
      {children}
    </div>
  );
}

function TopRow({ f, index }: { f: Field; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: f.id,
    data: { containerId: "root", index },
  });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  const select = useDesignerStore((s) => s.select);
  const remove = useDesignerStore((s) => s.removeField);

  return (
    <div ref={setNodeRef} style={style} className="border rounded bg-white">
      <div
        role="button"
        tabIndex={0}
        onClick={() => select(f.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            select(f.id);
          }
        }}
        className="p-2 flex items-center justify-between cursor-pointer hover:bg-neutral-50"
      >
        <div>
          <div className="font-medium">{f.label}</div>
          <div className="text-xs opacity-70">type: {f.type} • key: {"key" in f ? (f as any).key : ""}</div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="cursor-grab" aria-label="Drag" {...attributes} {...listeners} onClick={(e) => e.stopPropagation()}>
            ↕
          </button>
          <button type="button" className="underline" onClick={(e) => { e.stopPropagation(); select(f.id); }}>
            edit
          </button>
          <button type="button" className="underline text-red-600" onClick={(e) => { e.stopPropagation(); remove(f.id); }}>
            remove
          </button>
        </div>
      </div>

      {f.type === "section" && <SectionChildren parent={f} />}
    </div>
  );
}

function ChildRow({ parentId, f, index }: { parentId: string; f: Field; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: f.id,
    data: { containerId: parentId, index },
  });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  const select = useDesignerStore((s) => s.select);
  const remove = useDesignerStore((s) => s.removeField);

  return (
    <div
      ref={setNodeRef}
      style={style}
      role="button"
      tabIndex={0}
      onClick={() => select(f.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          select(f.id);
        }
      }}
      className="mx-2 border rounded p-2 flex items-center justify-between bg-neutral-50 cursor-pointer hover:bg-neutral-100"
    >
      <div>
        <div className="font-medium">{f.label}</div>
        <div className="text-xs opacity-70">type: {f.type} • key: {"key" in f ? (f as any).key : ""}</div>
      </div>
      <div className="flex gap-2">
        <button type="button" className="cursor-grab" aria-label="Drag" {...attributes} {...listeners} onClick={(e) => e.stopPropagation()}>
          ↕
        </button>
        <button type="button" className="underline" onClick={(e) => { e.stopPropagation(); select(f.id); }}>
          edit
        </button>
        <button type="button" className="underline text-red-600" onClick={(e) => { e.stopPropagation(); remove(f.id); }}>
          remove
        </button>
      </div>
    </div>
  );
}

function SectionChildren({ parent }: { parent: Field }) {
  const children: Field[] = (parent as any).children ?? [];
  return (
    <SectionDroppable sectionId={parent.id}>
      <div className="pl-4 pb-2 space-y-2">
        <div className="space-y-2">
          <SortableContext items={children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {children.length ? (
              children.map((c, i) => <ChildRow key={c.id} parentId={parent.id} f={c} index={i} />)
            ) : (
              <p className="mx-2 text-xs opacity-70">Drag from Palette into this section or use the Palette add button.</p>
            )}
          </SortableContext>
        </div>
      </div>
    </SectionDroppable>
  );
}

export function Canvas() {
  const fields = useDesignerStore((s) => s.schema.fields);

  return (
    <RootContainer>
      <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        {fields.length === 0 && <p className="opacity-70">Drag from the palette or click to add →</p>}
        <div className="space-y-2">
          {fields.map((f, i) => (
            <TopRow key={f.id} f={f} index={i} />
          ))}
        </div>
      </SortableContext>
    </RootContainer>
  );
}
