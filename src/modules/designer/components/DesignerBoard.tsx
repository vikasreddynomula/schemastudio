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
import { Inspector } from "@/modules/designer/components/Inspector";
import { useState } from "react";

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
        (overId === "root"
          ? "root"
          : overId?.startsWith("section-")
          ? overId.slice("section-".length)
          : undefined)) as string | undefined;

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

  // --- mobile tabs (Palette / Canvas / Inspector) ---
  const [tab, setTab] = useState<"palette" | "canvas" | "inspector">("canvas");

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd} collisionDetection={rectIntersection}>
      {/* Mobile tab bar */}
      <div className="md:hidden sticky top-[52px] z-20 bg-white/90 dark:bg-neutral-900/85 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-3 py-2 flex items-center gap-2 text-sm">
          <TabBtn active={tab === "palette"} onClick={() => setTab("palette")}>Palette</TabBtn>
          <TabBtn active={tab === "canvas"} onClick={() => setTab("canvas")}>Canvas</TabBtn>
          <TabBtn active={tab === "inspector"} onClick={() => setTab("inspector")}>Inspector</TabBtn>
        </div>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-[260px_1fr_340px] gap-4">
        <aside className="border rounded p-2 bg-white dark:bg-neutral-900 dark:border-neutral-800">
          <h3 className="font-semibold mb-2">Palette</h3>
          <Palette />
        </aside>

        <main className="border rounded p-2 bg-white dark:bg-neutral-900 dark:border-neutral-800">
          <Canvas />
        </main>

        <aside className="border rounded p-2 bg-white dark:bg-neutral-900 dark:border-neutral-800">
          <Inspector />
        </aside>
      </div>

      {/* Mobile stacked panes */}
      <div className="md:hidden">
        {tab === "palette" && (
          <section className="p-3">
            <h3 className="font-semibold mb-2">Palette</h3>
            <div className="border rounded p-2 bg-white dark:bg-neutral-900 dark:border-neutral-800">
              <Palette />
            </div>
          </section>
        )}

        {tab === "canvas" && (
          <section className="p-3">
            <h3 className="font-semibold mb-2">Canvas</h3>
            <div className="border rounded p-2 bg-white dark:bg-neutral-900 dark:border-neutral-800">
              <Canvas />
            </div>
          </section>
        )}

        {tab === "inspector" && (
          <section className="p-3">
            <h3 className="font-semibold mb-2">Inspector</h3>
            <div className="border rounded p-2 bg-white dark:bg-neutral-900 dark:border-neutral-800">
              <Inspector />
            </div>
          </section>
        )}
      </div>
    </DndContext>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded border text-sm",
        active
          ? "bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100"
          : "border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
