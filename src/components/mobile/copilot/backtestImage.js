/**
 * "Copy Image" on the backtest sheet: a share card of the idea drawn on a
 * canvas, then put on the clipboard (or handed to the native share sheet where
 * the clipboard can't take images).
 *
 * Drawn rather than screenshotted — the sheet scrolls and is taller than any
 * screen, and a fixed card reads the same wherever it's pasted.
 */

const W = 600;
const H = 340;
const FONT = '"Onest", system-ui, sans-serif';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

/**
 * @param {{ symbol: string, side: "long" | "short", tiles: { label: string, value: string, color: string }[], footer: string }} card
 * @returns {Promise<Blob>}
 */
export function renderBacktestCard(card) {
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("Canvas unavailable"));
  ctx.scale(scale, scale);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#584200";
  ctx.lineWidth = 1;
  roundRect(ctx, 0.5, 0.5, W - 1, H - 1, 20);
  ctx.stroke();

  // Header: symbol + side pill, brand line on the right.
  ctx.fillStyle = "#f4f4f5";
  ctx.font = `700 26px ${FONT}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(card.symbol, 28, 52);
  const symbolW = ctx.measureText(card.symbol).width;

  const short = card.side === "short";
  const sideLabel = short ? "Short" : "Long";
  ctx.font = `600 13px ${FONT}`;
  const pillW = ctx.measureText(sideLabel).width + 24;
  ctx.fillStyle = short ? "#260808" : "#05150c";
  roundRect(ctx, 28 + symbolW + 12, 32, pillW, 26, 13);
  ctx.fill();
  ctx.fillStyle = short ? "#d53d3d" : "#269755";
  ctx.fillText(sideLabel, 28 + symbolW + 24, 50);

  ctx.textAlign = "right";
  ctx.fillStyle = "#f2b500";
  ctx.font = `600 13px ${FONT}`;
  ctx.fillText("HyprEarn AI Copilot", W - 28, 50);
  ctx.textAlign = "left";

  // 2 × 2 price tiles.
  const gap = 12;
  const tileW = (W - 56 - gap) / 2;
  const tileH = 96;
  card.tiles.slice(0, 4).forEach((tile, i) => {
    const x = 28 + (i % 2) * (tileW + gap);
    const y = 84 + Math.floor(i / 2) * (tileH + gap);
    ctx.strokeStyle = "#584200";
    roundRect(ctx, x + 0.5, y + 0.5, tileW - 1, tileH - 1, 16);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = `700 11px ${FONT}`;
    ctx.fillText(tile.label.toUpperCase(), x + 16, y + 30);
    ctx.fillStyle = tile.color;
    ctx.font = `600 19px ${FONT}`;
    ctx.fillText(tile.value, x + 16, y + 62, tileW - 32);
  });

  ctx.fillStyle = "#8b8f98";
  ctx.font = `400 13px ${FONT}`;
  ctx.fillText(card.footer, 28, H - 26, W - 56);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Encode failed"))), "image/png");
  });
}

/**
 * Clipboard first; native share sheet second.
 * @returns {Promise<"copied" | "shared" | "cancelled">}
 */
export async function copyBacktestCard(card) {
  const blobPromise = renderBacktestCard(card);

  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      // Safari wants the promise itself, inside the tap's call stack.
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blobPromise })]);
      return "copied";
    } catch {
      /* fall through to the share sheet */
    }
  }

  const blob = await blobPromise;
  const file = new File([blob], `${card.symbol}-backtest.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `${card.symbol} backtest` });
      return "shared";
    } catch (err) {
      if (err?.name === "AbortError") return "cancelled";
      throw err;
    }
  }
  throw new Error("Image copy unsupported");
}
