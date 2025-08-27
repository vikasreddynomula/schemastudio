export function evalComputed(expr: string | undefined, values: Record<string, any>) {
    if (!expr) return undefined;
    try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("values", `with(values){ return (${expr}); }`);
    return fn(values);
    } catch {
    return undefined;
    }
    }