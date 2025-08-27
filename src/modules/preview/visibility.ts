export function evalVisibility(expr: string | undefined, values: Record<string, any>): boolean {
    if (!expr) return true;
    try {
    // very simple sandbox – replace with safe expression evaluator later
    // eslint-disable-next-line no-new-func
    const fn = new Function("values", `with(values){ return (${expr}); }`);
    return !!fn(values);
    } catch {
    return true;
    }
    }