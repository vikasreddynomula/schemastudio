// src/modules/designer/components/Canvas.tsx
"use client";
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDesignerStore } from "@/modules/designer/store";
import type { Field } from "@/modules/schema/types";
import { createField } from "@/modules/designer/factories";

function TopRow({ f, index }: { f: Field; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: f.id,
    data: { containerId: "root", index },
  });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };
  const select = useDesignerStore((s) => s.select);
  const remove = useDesignerStore((s) => s.removeField);
  const addChild = useDesignerStore((s) => s.addChild);
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
          <button
            type="button"
            className="cursor-grab"
            aria-label="Drag"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            ↕
          </button>
          <button
            type="button"
            className="underline"
            onClick={(e) => {
              e.stopPropagation();
              select(f.id);
            }}
          >
            edit
          </button>
          <button
            type="button"
            className="underline text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              remove(f.id);
            }}
          >
            remove
          </button>
        </div>
      </div>

      {f.type === "section" && (
        <SectionChildren parent={f} addChild={addChild} />
      )}
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
        <button
          type="button"
          className="cursor-grab"
          aria-label="Drag"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          ↕
        </button>
        <button
          type="button"
          className="underline"
          onClick={(e) => {
            e.stopPropagation();
            select(f.id);
          }}
        >
          edit
        </button>
        <button
          type="button"
          className="underline text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            remove(f.id);
          }}
        >
          remove
        </button>
      </div>
    </div>
  );
}

function SectionChildren({ parent, addChild }: { parent: Field; addChild: (parentId: string, child: Field) => void }) {
  const children: Field[] = (parent as any).children ?? [];
  return (
    <div className="pl-4 pb-2 space-y-2">
      <div className="flex gap-2 px-2">
        <button type="button" className="border rounded px-2 py-0.5 text-xs" onClick={() => addChild(parent.id, createField("text", "Text") as any)}>+ Text</button>
        <button type="button" className="border rounded px-2 py-0.5 text-xs" onClick={() => addChild(parent.id, createField("number", "Number") as any)}>+ Number</button>
        <button type="button" className="border rounded px-2 py-0.5 text-xs" onClick={() => addChild(parent.id, createField("select", "Select") as any)}>+ Select</button>
      </div>
      <SortableContext items={children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {children.length ? (
            children.map((c, i) => <ChildRow key={c.id} parentId={parent.id} f={c} index={i} />)
          ) : (
            <p className="mx-2 text-xs opacity-70">No children yet — use the buttons above to add.</p>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function Canvas() {
  const fields = useDesignerStore((s) => s.schema.fields);
  const moveField = useDesignerStore((s) => s.moveField);
  const moveChild = useDesignerStore((s) => s.moveChild);
  const sensors = useSensors(useSensor(PointerSensor));

  const onDragEnd = (e: DragEndEvent) => {
    const activeContainer = e.active.data.current?.containerId as string | undefined;
    const overContainer = e.over?.data.current?.containerId as string | undefined;
    const fromIndex = e.active.data.current?.index as number | undefined;
    const toIndex = e.over?.data.current?.index as number | undefined;
    if (!activeContainer || !overContainer || fromIndex === undefined || toIndex === undefined) return;
    if (activeContainer !== overContainer) return;
    if (activeContainer === "root") {
      if (fromIndex !== toIndex) moveField(fromIndex, toIndex);
      return;
    }
    if (fromIndex !== toIndex) moveChild(activeContainer, fromIndex, toIndex);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {fields.length === 0 && <p className="opacity-70">Add fields from the palette →</p>}
          {fields.map((f, i) => (
            <TopRow key={f.id} f={f} index={i} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
