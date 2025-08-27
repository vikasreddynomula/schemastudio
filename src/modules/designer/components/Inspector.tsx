"use client";

import FormRenderer from "@/modules/preview/FormRenderer";
import { useDesignerStore } from "@/modules/designer/store";
import type {
  ChangeEvent,
  ReactNode,
} from "react";
import type {
  Field,
  SelectField,
  SectionField,
  ArrayField,
  Schema,
} from "@/modules/schema/types";

export function Inspector() {
  const schema = useDesignerStore((s) => s.schema);
  const selectedId = useDesignerStore((s) => s.selectedId);
  const field = useDesignerStore((s) =>
    s.schema.fields.find((f) => f.id === selectedId)
  );

  const update = useDesignerStore((s) => s.updateField);
  const copy = useDesignerStore((s) => s.copy);
  const paste = useDesignerStore((s) => s.paste);
  const exportSchema = useDesignerStore((s) => s.exportSchema);
  const importSchema = useDesignerStore((s) => s.importSchema);

  const onText =
    (key: "key" | "label" | "placeholder" | "helpText") =>
    (e: ChangeEvent<HTMLInputElement>) =>
      field && update(field.id, { [key]: e.target.value } as Partial<Field>);

  const onRequired = (e: ChangeEvent<HTMLInputElement>) =>
    field && update(field.id, { required: e.target.checked });

  const onDefault = (e: ChangeEvent<HTMLInputElement>) =>
    field && update(field.id, { defaultValue: e.target.value });

  const onMin = (e: ChangeEvent<HTMLInputElement>) =>
    field &&
    update(field.id, {
      validation: {
        ...field.validation,
        min: e.target.value ? Number(e.target.value) : undefined,
      },
    });

  const onMax = (e: ChangeEvent<HTMLInputElement>) =>
    field &&
    update(field.id, {
      validation: {
        ...field.validation,
        max: e.target.value ? Number(e.target.value) : undefined,
      },
    });

  const onRegex = (e: ChangeEvent<HTMLInputElement>) =>
    field &&
    update(field.id, {
      validation: {
        ...field.validation,
        regex: e.target.value || undefined,
      },
    });

  const onVisibleWhen = (e: ChangeEvent<HTMLInputElement>) =>
    field && update(field.id, { visibleWhen: e.target.value || undefined });

  const onComputed = (e: ChangeEvent<HTMLInputElement>) =>
    field && update(field.id, { computed: e.target.value || undefined });

  return (
    <div className="grid grid-rows-[auto_auto_1fr] gap-3">
      <aside className="space-y-2 border rounded p-3">
        <h3 className="font-semibold">Inspector</h3>

        {field ? (
          <div className="space-y-2">
            <Labeled label="Key (unique)">
              <input
                className="w-full border rounded px-2 py-1"
                value={field.key}
                onChange={onText("key")}
              />
            </Labeled>

            <Labeled label="Label">
              <input
                className="w-full border rounded px-2 py-1"
                value={field.label}
                onChange={onText("label")}
              />
            </Labeled>

            {"placeholder" in field && (
              <Labeled label="Placeholder">
                <input
                  className="w-full border rounded px-2 py-1"
                  value={field.placeholder ?? ""}
                  onChange={onText("placeholder")}
                />
              </Labeled>
            )}

            <Labeled label="Help Text">
              <input
                className="w-full border rounded px-2 py-1"
                value={field.helpText ?? ""}
                onChange={onText("helpText")}
              />
            </Labeled>

            <div className="flex items-center gap-2">
              <input
                id="req"
                type="checkbox"
                checked={!!field.required}
                onChange={onRequired}
              />
              <label htmlFor="req">Required</label>
            </div>

            {/* Default value editor (simple text for now) */}
            <Labeled label="Default Value">
              <input
                className="w-full border rounded px-2 py-1"
                value={String(field.defaultValue ?? "")}
                onChange={onDefault}
              />
            </Labeled>

            {/* Validation */}
            <div className="grid grid-cols-3 gap-2">
              <Labeled label="Min">
                <input
                  type="number"
                  className="w-full border rounded px-2 py-1"
                  value={field.validation?.min ?? ""}
                  onChange={onMin}
                />
              </Labeled>
              <Labeled label="Max">
                <input
                  type="number"
                  className="w-full border rounded px-2 py-1"
                  value={field.validation?.max ?? ""}
                  onChange={onMax}
                />
              </Labeled>
              <Labeled label="Regex">
                <input
                  className="w-full border rounded px-2 py-1"
                  placeholder="/^abc/"
                  value={field.validation?.regex ?? ""}
                  onChange={onRegex}
                />
              </Labeled>
            </div>

            {/* Expressions */}
            <Labeled label="Visible When (expression)">
              <input
                className="w-full border rounded px-2 py-1"
                placeholder="age >= 18 && subscribed"
                value={field.visibleWhen ?? ""}
                onChange={onVisibleWhen}
              />
            </Labeled>
            <Help>
              <b>Tip:</b> Reference other field <code>key</code>s, e.g.{" "}
              <code>age &gt;= 18</code> or{" "}
              <code>firstName + " " + lastName</code>.
            </Help>

            <Labeled label="Computed (expression)">
              <input
                className="w-full border rounded px-2 py-1"
                placeholder="firstName + ' ' + lastName"
                value={field.computed ?? ""}
                onChange={onComputed}
              />
            </Labeled>

            {/* Options editor for select-like fields */}
            {(field.type === "select" ||
              field.type === "multiselect" ||
              field.type === "radio") && (
              <OptionsEditor field={field as SelectField} />
            )}

            {/* Section / Array hints */}
            {field.type === "section" && <SectionHint />}
            {field.type === "array" && (
              <p className="text-xs opacity-70">
                Array renders a repeatable field based on its <code>of</code>{" "}
                template.
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                className="border rounded px-2 py-1"
                onClick={() => copy(field.id)}
              >
                Copy
              </button>
              <button
                type="button"
                className="border rounded px-2 py-1"
                onClick={() => paste()}
              >
                Paste
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
                    importSchema(JSON.parse(text) as Schema);
                  }}
                />
              </label>
              <ResetSchemaButton />
            </div>
          </div>
        ) : (
          <p className="opacity-75">
            Select a field on the canvas to edit its properties.
          </p>
        )}
      </aside>

      <aside className="border rounded p-3 overflow-auto">
        <h3 className="font-semibold">Live Preview</h3>
        <FormRenderer schema={schema} />
      </aside>

      <aside className="border rounded p-3">
        <h3 className="font-semibold">Schema JSON</h3>
        <pre className="border rounded p-3 bg-neutral-50 text-xs overflow-auto max-h-64">
          {JSON.stringify(schema, null, 2)}
        </pre>
      </aside>
    </div>
  );
}


function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="block mb-1 opacity-80">{label}</span>
      {children}
    </label>
  );
}

function Help({ children }: { children: ReactNode }) {
  return <p className="text-xs opacity-70">{children}</p>;
}

function OptionsEditor({ field }: { field: SelectField }) {
  const update = useDesignerStore((s) => s.updateField);

  const add = () =>
    update(field.id, {
      options: [...field.options, { value: "new", label: "New option" }],
    } as Partial<SelectField>);

  const set = (i: number, key: "label" | "value", v: string) => {
    const next = field.options.map((o, idx) => (idx === i ? { ...o, [key]: v } : o));
    update(field.id, { options: next } as Partial<SelectField>);
  };

  const remove = (i: number) => {
    const next = field.options.filter((_, idx) => idx !== i);
    update(field.id, { options: next } as Partial<SelectField>);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">Options</span>
        <button type="button" className="border rounded px-2 py-0.5" onClick={add}>
          + Add
        </button>
      </div>
      {field.options.map((opt, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <input
            className="border rounded px-2 py-1"
            value={opt.label}
            onChange={(e) => set(i, "label", e.target.value)}
            placeholder="Label"
          />
          <input
            className="border rounded px-2 py-1"
            value={opt.value}
            onChange={(e) => set(i, "value", e.target.value)}
            placeholder="Value"
          />
          <button
            type="button"
            className="text-red-600 underline"
            onClick={() => remove(i)}
          >
            remove
          </button>
        </div>
      ))}
    </div>
  );
}

function SectionHint() {
  return (
    <p className="text-xs opacity-70">
      <b>Section</b> groups fields for layout. You can reorder and add other
      fields inside this section from the Canvas.
    </p>
  );
}

function ResetSchemaButton() {
  const importSchema = useDesignerStore((s) => s.importSchema);
  return (
    <button
      type="button"
      className="border rounded px-2 py-1"
      onClick={() => importSchema({ version: 1, fields: [] })}
    >
      Reset schema
    </button>
  );
}
