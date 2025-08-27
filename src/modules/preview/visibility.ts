export function evalVisibility(expr: string | undefined, values: Record<string, any>): boolean {
    if (!expr) return true;
    try {
    const fn = new Function("values", `with(values){ return (${expr}); }`);
    return !!fn(values);
    } catch {
    return true;
    }
    }