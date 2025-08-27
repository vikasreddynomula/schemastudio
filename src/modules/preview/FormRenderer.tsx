"use client";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  Schema,
  Field,
  SelectField,
  SectionField,
  ArrayField,
} from "@/modules/schema/types";
import { evalVisibility } from "@/modules/preview/visibility";
import { evalComputed } from "@/modules/preview/computed";
import { useDesignerStore } from "@/modules/designer/store";

type Props = { schema: Schema };


function zodForPrimitive(f: Field) {
  let base: z.ZodTypeAny;

  switch (f.type) {
    case "number":
      base = z
        .preprocess((v) => {
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

    case "multiselect":
      base = z.array(z.string()).optional();
      break;

    case "select":
    case "radio":
    case "text":
    case "date":
    default:
      base = z.string().optional();
      break;
  }

  if (f.required) {
    if (f.type === "checkbox") {
      base = (base as z.ZodAny).refine((v) => v === true, { message: "Required" });
    } else if (f.type === "multiselect") {
      base = (base as z.ZodArray<z.ZodString>).min(1, { message: "Required" });
    } else {
      base = (base as z.ZodAny).refine((v: any) => v !== undefined && v !== "", {
        message: "Required",
      });
    }
  }

  if (f.validation?.min !== undefined) {
    const min = f.validation.min;
    base = (base as z.ZodAny).refine(
      (v: any) =>
        typeof v === "number"
          ? v >= min!
          : Array.isArray(v)
          ? v.length >= min!
          : String(v ?? "").length >= min!,
      { message: `Min ${min}` }
    );
  }
  if (f.validation?.max !== undefined) {
    const max = f.validation.max;
    base = (base as z.ZodAny).refine(
      (v: any) =>
        typeof v === "number"
          ? v <= max!
          : Array.isArray(v)
          ? v.length <= max!
          : String(v ?? "").length <= max!,
      { message: `Max ${max}` }
    );
  }

  if (f.validation?.regex && f.type !== "checkbox" && f.type !== "number" && f.type !== "multiselect") {
    base = (z.string().optional() as z.ZodString).regex(new RegExp(f.validation.regex));
  }

  return base;
}

function collectZod(shape: Record<string, z.ZodTypeAny>, f: Field): void {
  if (f.type === "section") {
    (f as SectionField).children.forEach((c) => collectZod(shape, c));
    return;
  }
  if (f.type === "array") {
    const af = f as ArrayField;
    const item = zodForPrimitive(af.of as Field);
    let arr = z.array(item).optional();
    if (f.required) arr = arr.min(1, { message: "Required" });
    shape[f.key] = arr;
    return;
  }
  shape[f.key] = zodForPrimitive(f);
}

/* ---------------- Component ---------------- */

export default function FormRenderer({ schema }: Props) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of schema.fields) collectZod(shape, f);

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

/* ---------------- Field renderer ---------------- */

function FieldControl({
  field,
  form,
  values,
  nameOverride,
}: {
  field: Field;
  form: ReturnType<typeof useForm>;
  values: any;
  nameOverride?: string;
}) {
  const select = useDesignerStore((s) => s.select); // <-- NEW

  const visible = evalVisibility(field.visibleWhen, values);
  if (!visible) return null;

  const computed = evalComputed(field.computed, values);

  const {
    register,
    control,
    formState: { errors },
    setValue,
    getValues,
  } = form as any;

  const name = nameOverride ?? field.key;

  /* ---- Containers ---- */
  if (field.type === "section") {
    const sec = field as SectionField;
    return (
      <fieldset className="border rounded p-3">
        <legend
          className="px-1 font-medium cursor-pointer select-none"
          onClick={() => select(field.id)}              // <-- click section legend selects it
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              select(field.id);
            }
          }}
          tabIndex={0}
          role="button"
        >
          {field.label}
        </legend>
        {sec.children.map((child) => (
          <FieldControl key={child.id} field={child as Field} form={form} values={values} />
        ))}
      </fieldset>
    );
  }

  if (field.type === "array") {
    const af = field as ArrayField;
    const items: any[] = getValues(name) ?? [];
    const add = () => setValue(name, [...items, null], { shouldDirty: true, shouldTouch: true });
    const remove = (i: number) =>
      setValue(
        name,
        items.filter((_: any, idx: number) => idx !== i),
        { shouldDirty: true, shouldTouch: true }
      );

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-sm font-medium text-left cursor-pointer"
            onClick={() => select(field.id)}            // <-- click array title selects it
          >
            {field.label}
          </button>
          <button type="button" className="border rounded px-2 py-0.5" onClick={add}>
            + Add
          </button>
        </div>

        {items.map((_: any, i: number) => (
          <div key={i} className="border rounded p-2">
            <FieldControl
              field={af.of as Field}
              form={form}
              values={values}
              nameOverride={`${name}.${i}`}
            />
            <button
              type="button"
              className="text-red-600 underline text-xs"
              onClick={() => remove(i)}
            >
              remove
            </button>
          </div>
        ))}
      </div>
    );
  }


  const focusSelect = { onFocus: () => select(field.id) };

  switch (field.type) {
    case "text":
      return (
        <label className="block">
          <span className="text-sm font-medium">{field.label}</span>
          <input
            className="mt-1 w-full border rounded px-2 py-1"
            {...register(name)}
            {...focusSelect}  
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
            {...focusSelect}
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
            {...focusSelect}
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
            {...focusSelect}
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

    case "select": {
      const sf = field as SelectField;
      return (
        <label className="block">
          <span className="text-sm font-medium">{field.label}</span>
          <Controller
            name={name}
            control={control}
            render={({ field: ctrl }) => (
              <select
                className="mt-1 w-full border rounded px-2 py-1"
                value={ctrl.value ?? ""}
                onChange={ctrl.onChange}
                onFocus={() => select(field.id)}           // <-- select on focus
              >
                <option value="">-- choose --</option>
                {sf.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
          />
          {errors[name] && (
            <div id={`${name}-err`} role="alert" className="text-red-600 text-xs mt-1">
              {String(errors[name]?.message ?? "Invalid")}
            </div>
          )}
        </label>
      );
    }

    case "multiselect": {
      const sf = field as SelectField;
      return (
        <label className="block">
          <span className="text-sm font-medium">{field.label}</span>
          <Controller
            name={name}
            control={control}
            render={({ field: ctrl }) => (
              <select
                multiple
                className="mt-1 w-full border rounded px-2 py-1"
                value={ctrl.value ?? []}
                onChange={(e) => {
                  const vals = Array.from(e.currentTarget.selectedOptions).map((o) => o.value);
                  ctrl.onChange(vals);
                }}
                onFocus={() => select(field.id)}           // <-- select on focus
              >
                {sf.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
          />
          {errors[name] && (
            <div id={`${name}-err`} role="alert" className="text-red-600 text-xs mt-1">
              {String(errors[name]?.message ?? "Invalid")}
            </div>
          )}
        </label>
      );
    }

    case "radio": {
      const sf = field as SelectField;
      return (
        <fieldset className="space-y-1">
          <legend className="text-sm font-medium">{field.label}</legend>
          <Controller
            name={name}
            control={control}
            render={({ field: ctrl }) => (
              <div className="flex flex-col gap-1">
                {sf.options.map((o) => (
                  <label key={o.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={ctrl.value === o.value}
                      onChange={() => ctrl.onChange(o.value)}
                      onFocus={() => select(field.id)}     // <-- select on focus
                    />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
            )}
          />
          {errors[name] && (
            <div id={`${name}-err`} role="alert" className="text-red-600 text-xs mt-1">
              {String(errors[name]?.message ?? "Invalid")}
            </div>
          )}
        </fieldset>
      );
    }

    default:
      return <div className="text-sm opacity-70">Unsupported field type: {field.type}</div>;
  }
}
