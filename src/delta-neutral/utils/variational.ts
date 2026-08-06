/**
 * Variational cookie onboarding — frontend read + upload.
 *
 * Variational authenticates via the user's exported browser session cookies
 * (copied with the Cookie-Editor extension), not a wallet signature. The user
 * copies the session JSON to the clipboard, pastes it here, we parse it in the
 * browser and hand it to the backend.
 *
 * `uploadVariationalCookies` is deliberately a stub: it validates the payload and
 * resolves after a short simulated round-trip, so the prototype flow is complete
 * end-to-end without a live backend. Nothing leaves the browser and nothing is
 * persisted (a refresh replays the flow from the top — the project convention).
 *
 * To make this real, replace the body of `uploadVariationalCookies` with a
 * `fetch(...)` to the ingest endpoint. No caller changes: it already returns a
 * Promise of the same shape.
 */

/** One entry of a Cookie-Editor export (only the fields we care to check). */
export type VariationalCookie = {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  expirationDate?: number;
};

export type ParsedCookieFile = {
  cookies: VariationalCookie[];
  /** Distinct domains seen — surfaced in the UI so the user can sanity-check the export. */
  domains: string[];
};

/**
 * Parse and lightly validate an exported cookie file. Returns null when the text
 * is not a JSON array of cookie-shaped objects, so callers can show an error
 * without throwing.
 */
export function parseCookieFile(text: string): ParsedCookieFile | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (!Array.isArray(data) || data.length === 0) return null;

  const cookies: VariationalCookie[] = [];
  for (const entry of data) {
    if (
      !entry ||
      typeof entry !== "object" ||
      typeof (entry as Record<string, unknown>).name !== "string" ||
      typeof (entry as Record<string, unknown>).value !== "string"
    ) {
      return null;
    }
    cookies.push(entry as VariationalCookie);
  }

  const domains = Array.from(
    new Set(
      cookies
        .map((c) => (c.domain ? c.domain.replace(/^\./, "") : ""))
        .filter((d): d is string => d.length > 0),
    ),
  );

  return { cookies, domains };
}

export type UploadCookiesInput = {
  /** Optional label for the source (e.g. a filename); pasted sessions have none. */
  fileName?: string;
  content: string;
  cookieCount: number;
};

export type UploadCookiesResult = {
  ok: true;
  /** Optional wallet the backend maps the session to; the builder falls back to a mock. */
  wallet?: string;
};

/** Simulated ingest latency (ms) so the loading state is visible in the prototype. */
const SIMULATED_UPLOAD_MS = 1400;

/**
 * Send the exported cookies to the backend.
 *
 * STUB — see the file header. Swap this body for a real `fetch(...)` when the
 * ingest endpoint exists; the signature and return shape stay the same.
 */
export function uploadVariationalCookies(
  input: UploadCookiesInput,
): Promise<UploadCookiesResult> {
  return new Promise((resolve, reject) => {
    if (!input.content || input.cookieCount <= 0) {
      reject(new Error("No cookies to upload."));
      return;
    }
    window.setTimeout(() => {
      resolve({ ok: true });
    }, SIMULATED_UPLOAD_MS);
  });
}
