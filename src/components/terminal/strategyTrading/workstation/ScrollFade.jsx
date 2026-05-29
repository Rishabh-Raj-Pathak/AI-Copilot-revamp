import { forwardRef, useImperativeHandle, useRef } from "react";
import { useCopilotTheme } from "../StrategyCopilotContext.jsx";
import { useScrollEdges } from "./useScrollEdges.js";

const FADE_SIZE_Y = 16;
const FADE_SIZE_X = 20;

/**
 * v2: hidden scrollbar + edge fades when content overflows.
 * v1: falls back to minimal-scrollbar (no fades).
 */
const ScrollFade = forwardRef(function ScrollFade(
  {
    axis = "y",
    fadeColor = "var(--ds-copilot-v2-bg)",
    fadeSize,
    className = "",
    viewportClassName = "",
    children,
  },
  forwardedRef,
) {
  const theme = useCopilotTheme();
  const scrollRef = useRef(null);
  const { start, end } = useScrollEdges(scrollRef, axis);

  useImperativeHandle(forwardedRef, () => scrollRef.current);

  const overflowClass = axis === "x" ? "overflow-x-auto" : "overflow-y-auto";
  const size = fadeSize ?? (axis === "x" ? FADE_SIZE_X : FADE_SIZE_Y);

  if (!theme.isV2) {
    return (
      <div
        ref={scrollRef}
        className={`minimal-scrollbar ${overflowClass} ${className} ${viewportClassName}`.trim()}
      >
        {children}
      </div>
    );
  }

  const startGradient =
    axis === "y"
      ? `linear-gradient(to bottom, ${fadeColor}, transparent)`
      : `linear-gradient(to right, ${fadeColor}, transparent)`;
  const endGradient =
    axis === "y"
      ? `linear-gradient(to top, ${fadeColor}, transparent)`
      : `linear-gradient(to left, ${fadeColor}, transparent)`;

  const outerClass =
    axis === "y"
      ? `relative flex min-h-0 min-w-0 flex-col overflow-hidden ${className}`
      : `relative min-h-0 min-w-0 overflow-hidden ${className}`;
  const viewportScrollClass =
    axis === "y"
      ? `min-h-0 flex-1 basis-0 ${overflowClass} ${viewportClassName}`
      : `${overflowClass} ${viewportClassName}`;

  return (
    <div className={outerClass.trim()}>
      {start ? (
        <div
          aria-hidden
          className="pointer-events-none absolute z-10 transition-opacity duration-150"
          style={
            axis === "y"
              ? {
                  top: 0,
                  left: 0,
                  right: 0,
                  height: size,
                  background: startGradient,
                }
              : {
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: size,
                  background: startGradient,
                }
          }
        />
      ) : null}
      <div
        ref={scrollRef}
        className={`ds-scrollbar-hidden ${viewportScrollClass}`.trim()}
      >
        {children}
      </div>
      {end ? (
        <div
          aria-hidden
          className="pointer-events-none absolute z-10 transition-opacity duration-150"
          style={
            axis === "y"
              ? {
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: size,
                  background: endGradient,
                }
              : {
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: size,
                  background: endGradient,
                }
          }
        />
      ) : null}
    </div>
  );
});

export default ScrollFade;
