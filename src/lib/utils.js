/**
 * Concatenate class names; extend with `clsx` / `tailwind-merge` if class conflicts appear.
 * @param {...(string | false | null | undefined)} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ')
}
