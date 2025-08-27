"use client";

import React, { useEffect, useMemo, useState } from "react";
import type {
  Field,
  SectionField,
  SelectField,
  Schema,
} from "@/modules/schema/types";
import { z } from "zod";

/* ────────────────────────────────────────────────────────────────────────── */
/* Helpers: expression eval (visibleWhen / computed)                         */
/* ────────────────────────────────────────────────────────────────────────── */

function safeEval(expr: string | undefined, values: Record<string, any>) {
  if (!expr || !expr.trim()) return undefined;
  try {
    // expose `values` and a `get("fieldKey")` helper
    // eslint-disable-next-line no-new-func
    const fn = new Function("values", "get", `return (${expr});`) as (
      v: Record<string, any>,
      g: (k: string) => any
    ) => any;
    return fn(values, (k: string) => values[k]);
  } catch {
    // swallow eval errors; UI should already validate expression text in Inspector
    return undefined;
  }
}

function isVisible(f: Field, values: Record<string, any>) {
  if (!("visibleWhen" in f) || !f.visibleWhen) return true;
  // visibleWhen stored as plain string in your inspector
  const res = safeEval(f.visibleWhen as any, values);
  return res === undefined ? true : Boolean(res);
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Validation                                                                */
/* ────────────────────────────────────────────────────────────────────────── */

function validateField(f: Field, values: Record<string, any>): string | undefined {
  // Invisible fields: skip validation
  if (!isVisible(f, values)) return undefined;

  const v = values[f.key];

  // Required
  if (f.required) {
    const empty =
      v === undefined ||
      v === null ||
      (typeof v === "string" && v.trim() === "") ||
      (Array.isArray(v) && v.length === 0) ||
      (typeof v === "number" && Number.isNaN(v));
    if (empty) return "This field is required.";
  }

  // Computed fields shouldn't be user-set; skip other checks
  if (f.computed && (f.computed as any)?.trim?.()) return undefined;

  // Type-specific checks
  switch (f.type) {
    case "number": {
      if (v === undefined || v === null || v === "") return undefined;
      const num = Number(v);
      if (Number.isNaN(num)) return "Enter a valid number.";
      if (f.validation?.min !== undefined && num < f.validation.min)
        return `Must be ≥ ${f.validation.min}.`;
      if (f.validation?.max !== undefined && num > f.validation.max)
        return `Must be ≤ ${f.validation.max}.`;
      return undefined;
    }
    case "checkbox":
      return undefined;

    case "multiselect": {
      if (!Array.isArray(v)) return undefined;
      if (f.validation?.min !== undefined && v.length < f.validation.min)
        return `Select at least ${f.validation.min}.`;
      if (f.validation?.max !== undefined && v.length > f.validation.max)
        return `Select at most ${f.validation.max}.`;
      return undefined;
    }

    default: {
      // string-likes
      const s = v == null ? "" : String(v);
      if (f.validation?.regex && f.type !== "checkbox" && f.type !== "number" && f.type !== "multiselect") {
        try {
          const re = new RegExp(f.validation.regex);
          if (!re.test(s)) return "Value does not match pattern.";
        } catch {
          // invalid regex provided; don't block the user here
        }
      }
      if (f.validation?.min !== undefined && s.length < f.validation.min)
        return `Must be at least ${f.validation.min} characters.`;
      if (f.validation?.max !== undefined && s.length > f.validation.max)
        return `Must be at most ${f.validation.max} characters.`;
      return undefined;
    }
  }
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Main component                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

export default function FormRenderer({ schema }: { schema: Schema }) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    // seed defaults
    const initial: Record<string, any> = {};
    const seed = (arr: Field[]) => {
      for (const f of arr) {
        if (f.defaultValue !== undefined) initial[f.key] = f.defaultValue;
        if (f.type === "section") seed((f as any).children ?? []);
      }
    };
    seed(schema.fields);
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // Compute all computed fields whenever dependencies (values) change
  useEffect(() => {
    const next = { ...values };
    const applyComputed = (arr: Field[]) => {
      for (const f of arr) {
        const expr = (f as any).computed as string | undefined;
        if (expr && expr.trim()) {
          const val = safeEval(expr, next);
          if (val !== undefined) next[f.key] = val;
        }
        if (f.type === "section") applyComputed((f as any).children ?? []);
      }
    };
    applyComputed(schema.fields);
    setValues(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema]); // recompute when schema changes

  // Validate on each values change (lightweight per field)
  useEffect(() => {
    const nextErrors: Record<string, string | undefined> = {};
    const walk = (arr: Field[]) => {
      for (const f of arr) {
        nextErrors[f.key] = validateField(f, values);
        if (f.type === "section") walk((f as any).children ?? []);
      }
    };
    walk(schema.fields);
    setErrors(nextErrors);
  }, [schema, values]);

  // input change helper
  const setValue = (key: string, v: any) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  };

  // visible fields memo to avoid extra work
  const visibleKeys = useMemo(() => {
    const keys: Set<string> = new Set();
    const visit = (arr: Field[]) => {
      for (const f of arr) {
        if (isVisible(f, values)) {
          keys.add(f.key);
          if (f.type === "section") visit((f as any).children ?? []);
        }
      }
    };
    visit(schema.fields);
    return keys;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema, JSON.stringify(values)]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          // final validation pass (already current in `errors`)
          const hasError = Object.values(errors).some(Boolean);
          if (hasError) {
            alert("Please fix the highlighted errors.");
          } else {
            alert("Form valid! See values in the side panel.");
          }
        }}
      >
        {schema.fields.map((f) => (
          <FieldRenderer
            key={f.id}
            field={f}
            values={values}
            errors={errors}
            visibleKeys={visibleKeys}
            setValue={setValue}
          />
        ))}

        <div className="pt-2">
          <button type="submit" className="px-3 py-1.5 rounded border">
            Submit
          </button>
        </div>
      </form>

      {/* Values JSON panel */}
      <aside className="border rounded p-3 bg-neutral-50 overflow-auto max-h-[520px]">
        <h4 className="font-semibold mb-2">Values (live)</h4>
        <pre className="text-xs">{JSON.stringify(values, null, 2)}</pre>
      </aside>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Field Renderer (recursive)                                                */
/* ────────────────────────────────────────────────────────────────────────── */

function FieldRenderer({
  field,
  values,
  errors,
  visibleKeys,
  setValue,
}: {
  field: Field;
  values: Record<string, any>;
  errors: Record<string, string | undefined>;
  visibleKeys: Set<string>;
  setValue: (k: string, v: any) => void;
}) {
  // Visibility
  if (!visibleKeys.has(field.key)) return null;

  const err = errors[field.key];
  const helpId = `${field.key}-help`;
  const errId = `${field.key}-error`;
  const describedBy = [field.helpText ? helpId : null, err ? errId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  // Computed fields: read-only
  const isComputed = Boolean((field as any).computed?.trim?.());
  const commonLabel = (
    <label htmlFor={field.key} className="block text-sm mb-1">
      <span className="font-medium">{field.label}</span>
      {field.required && <span className="ml-1 text-red-600">*</span>}
    </label>
  );

  const commonHelp = field.helpText ? (
    <p id={helpId} className="text-xs opacity-70 mt-1">
      {field.helpText}
    </p>
  ) : null;

  const commonError = err ? (
    <p id={errId} role="alert" className="text-xs text-red-600 mt-1">
      {err}
    </p>
  ) : null;

  // by type
  switch (field.type) {
    case "section": {
      const s = field as SectionField;
      return (
        <fieldset className="border rounded p-3">
          <legend className="px-1 text-sm font-semibold">{field.label}</legend>
          {(s.children ?? []).map((c) => (
            <FieldRenderer
              key={c.id}
              field={c}
              values={values}
              errors={errors}
              visibleKeys={visibleKeys}
              setValue={setValue}
            />
          ))}
        </fieldset>
      );
    }

    case "checkbox": {
      const v = Boolean(values[field.key]);
      return (
        <div>
          <div className="flex items-center gap-2">
            <input
              id={field.key}
              type="checkbox"
              checked={v}
              onChange={(e) => setValue(field.key, e.target.checked)}
              aria-describedby={describedBy}
              disabled={isComputed}
            />
            <label htmlFor={field.key} className="text-sm">
              {field.label} {field.required && <span className="text-red-600">*</span>}
            </label>
          </div>
          {commonHelp}
          {commonError}
        </div>
      );
    }

    case "number": {
      const v = values[field.key] ?? "";
      return (
        <div>
          {commonLabel}
          <input
            id={field.key}
            type="number"
            className={`w-full border rounded px-2 py-1 ${err ? "border-red-500" : ""}`}
            value={v}
            onChange={(e) => setValue(field.key, e.target.value === "" ? "" : Number(e.target.value))}
            aria-describedby={describedBy}
            disabled={isComputed}
            placeholder={(field as any).placeholder ?? ""}
          />
          {commonHelp}
          {commonError}
        </div>
      );
    }

    case "select": {
      const f = field as SelectField;
      const v = values[field.key] ?? "";
      return (
        <div>
          {commonLabel}
          <select
            id={field.key}
            className={`w-full border rounded px-2 py-1 ${err ? "border-red-500" : ""}`}
            value={v}
            onChange={(e) => setValue(field.key, e.target.value)}
            aria-describedby={describedBy}
            disabled={isComputed}
          >
            <option value="" disabled>
              {(field as any).placeholder ?? "Select…"}
            </option>
            {f.options.map((o, idx) => (
              <option key={`${o.value}-${idx}`} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {commonHelp}
          {commonError}
        </div>
      );
    }

    case "multiselect": {
      // simple multi-select (array of values)
      const f = field as SelectField;
      const v: string[] = Array.isArray(values[field.key]) ? values[field.key] : [];
      return (
        <div>
          {commonLabel}
          <select
            id={field.key}
            multiple
            className={`w-full border rounded px-2 py-1 ${err ? "border-red-500" : ""}`}
            value={v}
            onChange={(e) =>
              setValue(
                field.key,
                Array.from(e.target.selectedOptions, (o) => o.value)
              )
            }
            aria-describedby={describedBy}
            disabled={isComputed}
          >
            {f.options.map((o, idx) => (
              <option key={`${o.value}-${idx}`} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {commonHelp}
          {commonError}
        </div>
      );
    }

    case "radio": {
      const f = field as SelectField;
      const v = values[field.key] ?? "";
      return (
        <div>
          {commonLabel}
          <div role="radiogroup" aria-describedby={describedBy} className="flex gap-4">
            {f.options.map((o, idx) => (
              <label key={`${o.value}-${idx}`} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.key}
                  value={o.value}
                  checked={v === o.value}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  disabled={isComputed}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
          {commonHelp}
          {commonError}
        </div>
      );
    }

    default: {
      // text-like
      const v = values[field.key] ?? "";
      return (
        <div>
          {commonLabel}
          <input
            id={field.key}
            type="text"
            className={`w-full border rounded px-2 py-1 ${err ? "border-red-500" : ""}`}
            value={v}
            onChange={(e) => setValue(field.key, e.target.value)}
            aria-describedby={describedBy}
            disabled={isComputed}
            placeholder={(field as any).placeholder ?? ""}
          />
          {commonHelp}
          {commonError}
        </div>
      );
    }
  }
}
