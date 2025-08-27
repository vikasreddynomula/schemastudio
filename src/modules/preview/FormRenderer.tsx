// src/modules/preview/FormRenderer.tsx
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Schema, Field } from "@/modules/schema/types";
import { evalVisibility } from "@/modules/preview/visibility";
import { evalComputed } from "@/modules/preview/computed";

type Props = { schema: Schema };

// Build a Zod schema from our field definitions
function zodFromField(f: Field) {
  let base: z.ZodTypeAny;
  switch (f.type) {
    case "number":
  // Accepts form strings, converts to number, and errors nicely
  base = z.preprocess((v) => {
    if (v === "" || v === undefined || v === null) return undefined;
    const n = Number(v as any);
    return Number.isFinite(n) ? n : NaN;
  }, z.number())
    .refine((v) => v === undefined || Number.isFinite(v), {
      message: "Must be a number",
    });
  break;

    case "checkbox":
      base = z.boolean().optional();
      break;
    default:
      base = z.string();
  }

  if (f.required) {
    base = base.refine(
      (v) => (f.type === "checkbox" ? v === true : v !== undefined && v !== ""),
      { message: "Required" }
    );
  }
  if (f.validation?.min !== undefined) {
    const min = f.validation.min;
    base = base.refine((v: any) =>
      typeof v === "number" ? v >= min! : String(v ?? "").length >= min!, { message: `Min ${min}` });
  }
  if (f.validation?.max !== undefined) {
    const max = f.validation.max;
    base = base.refine((v: any) =>
      typeof v === "number" ? v <= max! : String(v ?? "").length <= max!, { message: `Max ${max}` });
  }
  if (f.validation?.regex) {
    base = (z.string() as z.ZodString).regex(new RegExp(f.validation.regex));
  }
  return base;
}

export default function FormRenderer({ schema }: Props) {
  // Build a runtime Zod object: { [key]: rule }
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of schema.fields) {
    shape[f.key] = zodFromField(f);
  }

  const form = useForm({
    mode: "onChange",
    resolver: zodResolver(z.object(shape)),
  });
  const values = form.watch();

  return (
    <div className="grid grid-cols-2 gap-4">
      <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
        {schema.fields.map((f) => (
          <FieldControl key={f.id} field={f} form={form} values={values} />
        ))}
      </form>

      <pre className="border rounded p-3 bg-neutral-50 text-xs overflow-auto">
        {JSON.stringify(values, null, 2)}
      </pre>
    </div>
  );
}

function FieldControl({
  field,
  form,
  values,
}: {
  field: Field;
  form: ReturnType<typeof useForm>;
  values: any;
}) {
  // Conditional visibility
  const visible = evalVisibility(field.visibleWhen, values);
  if (!visible) return null;

  // Computed default/value
  const computed = evalComputed(field.computed, values);

  const {
    register,
    formState: { errors },
    setValue,
  } = form as any;

  const name = field.key;

  switch (field.type) {
    case "text":
      return (
        <label className="block">
          <span className="text-sm font-medium">{field.label}</span>
          <input
            className="mt-1 w-full border rounded px-2 py-1"
            {...register(name)}
            placeholder={field.placeholder}
            defaultValue={computed ?? field.defaultValue}
            aria-invalid={!!errors[name]}
            aria-describedby={`${name}-err`}
          />
          {errors[name] && (
            <div id={`${name}-err`} role="alert" className="text-red-600 text-xs mt-1">
              {String(errors[name]?.message ?? "Invalid")}
            </div>
          )}
        </label>
      );

    case "number":
      return (
        <label className="block">
          <span className="text-sm font-medium">{field.label}</span>
          <input
            type="number"
            className="mt-1 w-full border rounded px-2 py-1"
            {...register(name)}
            placeholder={field.placeholder}
            defaultValue={computed ?? field.defaultValue}
            aria-invalid={!!errors[name]}
            aria-describedby={`${name}-err`}
          />
          {errors[name] && (
            <div id={`${name}-err`} role="alert" className="text-red-600 text-xs mt-1">
              {String(errors[name]?.message ?? "Invalid")}
            </div>
          )}
        </label>
      );

    case "date":
      return (
        <label className="block">
          <span className="text-sm font-medium">{field.label}</span>
          <input
            type="date"
            className="mt-1 w-full border rounded px-2 py-1"
            {...register(name)}
            defaultValue={computed ?? field.defaultValue}
            aria-invalid={!!errors[name]}
            aria-describedby={`${name}-err`}
          />
          {errors[name] && (
            <div id={`${name}-err`} role="alert" className="text-red-600 text-xs mt-1">
              {String(errors[name]?.message ?? "Invalid")}
            </div>
          )}
        </label>
      );

    case "checkbox":
      return (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register(name)}
            defaultChecked={computed ?? field.defaultValue}
            aria-invalid={!!errors[name]}
            aria-describedby={`${name}-err`}
            onChange={(e) => setValue(name, e.currentTarget.checked)}
          />
          <span className="text-sm font-medium">{field.label}</span>
          {errors[name] && (
            <div id={`${name}-err`} role="alert" className="text-red-600 text-xs mt-1">
              {String(errors[name]?.message ?? "Invalid")}
            </div>
          )}
        </label>
      );

    default:
      return <div className="text-sm opacity-70">Unsupported field type: {field.type}</div>;
  }
}
