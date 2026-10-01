import { createContext, useContext } from "react";

export const ToastContext = createContext(null);

/**
 * `const toast = useAppToast(); toast.show({ title, message, tone, action })`.
 * A no-op outside `AppToastProvider`, so desktop-only trees can call it safely.
 */
export function useAppToast() {
  return useContext(ToastContext) ?? { show: () => {}, dismiss: () => {} };
}
