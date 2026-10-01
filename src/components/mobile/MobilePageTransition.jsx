import { motion, useReducedMotion } from "framer-motion";
import useIsMobile from "./useIsMobile.js";
import { PUSHED_PAGES } from "./MobileAppContext.js";

const PUSH_EASE = [0.32, 0.72, 0, 1];

/**
 * Screen-change motion for the phone shell.
 *
 * - Pushed screens (Compete, Points, Profile, ...) slide in from the right.
 * - Tab switches cross-fade quickly, the way native tab bars swap content.
 *
 * Desktop gets the children untouched — no wrapper element, no motion.
 */
export default function MobilePageTransition({ pageKey, children }) {
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  if (!isMobile || reduceMotion) return children;

  const pushed = PUSHED_PAGES.has(pageKey);
  return (
    <motion.div
      key={pageKey}
      initial={pushed ? { opacity: 0.4, x: 48 } : { opacity: 0 }}
      animate={{ opacity: 1, x: 0 }}
      transition={pushed ? { duration: 0.3, ease: PUSH_EASE } : { duration: 0.14, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
