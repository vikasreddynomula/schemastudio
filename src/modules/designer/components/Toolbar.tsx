"use client";
import { useDesignerStore } from "@/modules/designer/store";

export function Toolbar() {
  const undo = useDesignerStore((s) => s.undo);
  const redo = useDesignerStore((s) => s.redo);
  const exportSchema = useDesignerStore((s) => s.exportSchema);
  const importSchema = useDesignerStore((s) => s.importSchema);

  return (
    <div
      className="
        sticky top-0 z-20
        flex items-center gap-2
        p-2 rounded
        bg-white/90 backdrop-blur border border-neutral-200
        text-neutral-900
        shadow-sm
        dark:bg-neutral-900/85 dark:border-neutral-800 dark:text-neutral-100
      "
    >
      <ToolbarButton onClick={undo} label="Undo" />
      <ToolbarButton onClick={redo} label="Redo" />

      <ToolbarButton
        onClick={() => {
          const txt = exportSchema();
          navigator.clipboard.writeText(txt);
          alert("Schema copied to clipboard");
        }}
        label="Export"
      />

      <label
        className="
          inline-flex items-center
          px-2 py-1 rounded border border-neutral-300
          text-sm
          cursor-pointer select-none
          hover:bg-neutral-50 active:bg-neutral-100
          focus:outline-none focus:ring-2 focus:ring-blue-500/50
          dark:border-neutral-700 dark:hover:bg-neutral-800 dark:active:bg-neutral-700
        "
      >
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

function ToolbarButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        inline-flex items-center
        px-2 py-1 rounded
        border border-neutral-300
        text-sm
        hover:bg-neutral-50 active:bg-neutral-100
        focus:outline-none focus:ring-2 focus:ring-blue-500/50
        dark:border-neutral-700 dark:hover:bg-neutral-800 dark:active:bg-neutral-700
      "
    >
      {label}
    </button>
  );
}
