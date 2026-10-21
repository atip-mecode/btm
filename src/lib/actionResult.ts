export type ActionResult<T, E extends string = string> =
  | { success: true; data: T }
  | { success: false; error: { code: E; message: string } };
