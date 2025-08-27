"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
} from "@dnd-kit/core";
import { useDesignerStore } from "@/modules/designer/store";
import { Palette } from "@/modules/designer/components/Palette";
import { Canvas } from "@/modules/designer/components/Canvas";
import { createField } from "@/modules/designer/factories";
import type { Field } from "@/modules/schema/types";

function findFieldById(fields: Field[], id: string): Field | undefined {
  for (const f of fields) {
    if (f.id === id) return f;
    if (f.type === "section") {
      const hit = findFieldById((f as any).children ?? [], id);
      if (hit) return hit;
    }
  }
  return undefined;
}

export function DesignerBoard() {
  const moveField = useDesignerStore((s) => s.moveField);
  const moveChild = useDesignerStore((s) => s.moveChild);
  const addField = useDesignerStore((s) => s.addField);
  const addChild = useDesignerStore((s) => s.addChild);
  const schema = useDesignerStore((s) => s.schema);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const onDragEnd = (e: DragEndEvent) => {
    const from = e.active.data.current as any;
    const overId = e.over?.id as string | undefined;

    if (!from) return;

    if (from.from === "palette") {
      if (!overId) return;
      const fld = createField(from.type, from.label) as any;

      if (overId === "root") {
        addField(fld);
        return;
      }
      if (overId.startsWith("section-")) {
        const sectionId = overId.slice("section-".length);
        addChild(sectionId, fld);
        return;
      }

      const overField = findFieldById(schema.fields, overId);
      if (overField?.type === "section") {
        addChild(overField.id, fld);
      } else {
        addField(fld);
      }
      return;
    }

    const activeContainer = from.containerId as string | undefined;
    const overData = e.over?.data.current as any;
    const overContainer =
      (overData?.containerId ??
        (overId === "root" ? "root" : overId?.startsWith("section-") ? overId.slice("section-".length) : undefined)) as
        | string
        | undefined;
    const fromIndex = from.index as number | undefined;
    const toIndex = overData?.index as number | undefined;

    if (!activeContainer || !overContainer || fromIndex === undefined || toIndex === undefined) return;
    if (activeContainer !== overContainer) return;

    if (activeContainer === "root") {
      if (fromIndex !== toIndex) moveField(fromIndex, toIndex);
      return;
    }
    if (fromIndex !== toIndex) moveChild(activeContainer, fromIndex, toIndex);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd} collisionDetection={rectIntersection}>
      <div className="grid grid-cols-[240px_1fr] gap-4">
        <aside className="border rounded p-2">
          <h3 className="font-semibold mb-2">Palette</h3>
          <Palette />
        </aside>
        <main className="border rounded p-2">
          <Canvas />
        </main>
      </div>
    </DndContext>
  );
}
