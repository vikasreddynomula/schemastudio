"use client";

import { useState } from "react";

function safeCompile(expr: string) {
  try {
    // compile expression as function of `values`
    // eslint-disable-next-line no-new-func
    const fn = new Function("values", "get", `return (${expr});`);
    return { fn, error: null };
  } catch (err: any) {
    return { fn: null, error: err.message };
  }
}

export function ExpressionEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (val: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);
    const { error } = safeCompile(val);
    setError(error);
  };

  return (
    <div className="space-y-1">
      <label className="font-medium">{label}</label>
      <textarea
        className="w-full rounded border p-1 font-mono text-sm"
        rows={2}
        value={value ?? ""}
        onChange={handleChange}
        placeholder="e.g. values.age > 18"
      />
      {error ? (
        <p className="text-xs text-red-600">❌ {error}</p>
      ) : value?.trim() ? (
        <p className="text-xs text-green-600">✅ valid</p>
      ) : null}
    </div>
  );
}
