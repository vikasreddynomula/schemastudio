"use client";
import { useDesignerStore } from "@/modules/designer/store";

export function Toolbar() {
  const undo = useDesignerStore((s) => s.undo);
  const redo = useDesignerStore((s) => s.redo);
  const exportSchema = useDesignerStore((s) => s.exportSchema);
  const importSchema = useDesignerStore((s) => s.importSchema);

  return (
    <div className="flex items-center gap-2 sticky top-0 z-20 bg-white/90 backdrop-blur p-2 rounded border">
      <button type="button" className="border rounded px-2 py-1" onClick={undo}>
        Undo
      </button>
      <button type="button" className="border rounded px-2 py-1" onClick={redo}>
        Redo
      </button>
      <button
        type="button"
        className="border rounded px-2 py-1"
        onClick={() => {
          const txt = exportSchema();
          navigator.clipboard.writeText(txt);
          alert("Schema copied to clipboard");
        }}
      >
        Export
      </button>
      <label className="border rounded px-2 py-1 cursor-pointer">
        Import
        <input
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const text = await file.text();
            importSchema(JSON.parse(text));
          }}
        />
      </label>
    </div>
  );
}
