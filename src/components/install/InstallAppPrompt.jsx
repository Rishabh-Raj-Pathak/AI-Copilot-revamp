import { createPortal } from "react-dom";
import InstallAppButton from "./InstallAppButton.jsx";
import InstallAppModal from "./InstallAppModal.jsx";
import { useInstallAppPrompt } from "../../hooks/useInstallAppPrompt.js";

export default function InstallAppPrompt({ page = "copilot" }) {
  const { modalOpen, platform, openModal, closeModal } = useInstallAppPrompt();

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <InstallAppButton page={page} onClick={openModal} />
      <InstallAppModal
        open={modalOpen}
        platform={platform}
        onClose={closeModal}
      />
    </>,
    document.body,
  );
}
