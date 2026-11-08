export type ActionState = { ok: boolean; message?: string; errors?: Record<string, string>; data?: Record<string, unknown> } | null;

export function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const i of issues) {
    const k = String(i.path[0] ?? "form");
    if (!errors[k]) errors[k] = i.message;
  }
  return errors;
}
