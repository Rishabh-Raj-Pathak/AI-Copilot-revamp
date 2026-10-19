/** Join class names, dropping anything falsy */
export function cx(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(' ')
}
