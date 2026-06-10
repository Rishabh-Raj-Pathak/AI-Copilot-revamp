import { useCallback, useState } from "react";

/** @returns {"ios" | "android" | "other"} */
export function detectInstallPlatform() {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent;
  const isIos =
    (/iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) &&
    !window.MSStream;
  if (isIos) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export function useInstallAppPrompt() {
  const [modalOpen, setModalOpen] = useState(false);
  const platform = detectInstallPlatform();

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  return {
    modalOpen,
    platform,
    openModal,
    closeModal,
  };
}
