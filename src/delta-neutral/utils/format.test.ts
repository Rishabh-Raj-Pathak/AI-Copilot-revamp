import { describe, expect, it } from "vitest";
import {
  formatClock,
  formatCompactPct,
  formatDayMonth,
  formatDayTime,
  formatElapsed,
  formatIsoDuration,
  formatSignedCompactPct,
  formatTimeRange,
} from "./format";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("formatElapsed", () => {
  it("states a span to its two largest units, down to the minute", () => {
    expect(formatElapsed(12 * MINUTE + 4 * SECOND)).toBe("12m");
    expect(formatElapsed(20 * HOUR + 24 * MINUTE + 59 * SECOND)).toBe("20h 24m");
    expect(formatElapsed(3 * DAY + 6 * HOUR + 17 * MINUTE)).toBe("3d 6h");
  });

  it("drops an empty minor unit", () => {
    expect(formatElapsed(HOUR)).toBe("1h");
    expect(formatElapsed(DAY + 30 * MINUTE)).toBe("1d");
  });

  it("floors rather than rounds — a trade is not a minute old until it is", () => {
    expect(formatElapsed(59.9 * SECOND)).toBe("<1m");
  });

  it("clamps a clock-skewed future start to zero and blanks a missing one", () => {
    expect(formatElapsed(-5 * SECOND)).toBe("<1m");
    expect(formatElapsed(Number.NaN)).toBe("—");
  });
});

describe("formatTimeRange", () => {
  const open = new Date(2026, 8, 27, 23, 17, 40).getTime();

  it("dates both ends of a trade that ran across midnight", () => {
    const close = new Date(2026, 8, 28, 19, 42, 11).getTime();
    expect(formatTimeRange(open, close)).toBe("27 Sep 23:17 → 28 Sep 19:42");
  });

  it("dates the day once when the trade opened and closed on it", () => {
    const close = new Date(2026, 8, 27, 23, 58, 2).getTime();
    expect(formatTimeRange(open, close)).toBe("27 Sep 23:17 → 23:58");
  });

  it("runs to Now while the trade is still open", () => {
    expect(formatTimeRange(open)).toBe("27 Sep 23:17 → Now");
  });
});

describe("formatIsoDuration", () => {
  it("omits the zero components", () => {
    expect(formatIsoDuration(3 * DAY + 6 * HOUR + 17 * MINUTE)).toBe("P3DT6H17M");
    expect(formatIsoDuration(45 * SECOND)).toBe("PT45S");
    expect(formatIsoDuration(DAY)).toBe("P1D");
  });

  it("still states an empty span", () => {
    expect(formatIsoDuration(0)).toBe("PT0S");
  });
});

describe("formatClock / formatDayMonth", () => {
  const ts = new Date(2026, 8, 28, 9, 4, 7).getTime();

  it("reads local 24-hour time, zero-padded", () => {
    expect(formatClock(ts)).toBe("09:04:07");
    expect(formatClock(ts, false)).toBe("09:04");
  });

  it("reads the local day and short month", () => {
    expect(formatDayMonth(ts)).toBe("28 Sep");
    expect(formatDayTime(ts)).toBe("28 Sep 09:04");
  });
});

describe("formatCompactPct", () => {
  it("states a spread-sized rate as a plain decimal", () => {
    // Three leading zeros is where the subscript starts paying for itself; above
    // that the plain decimal is the shorter of the two.
    expect(formatCompactPct(0.0247)).toBe("0.0247%");
    expect(formatCompactPct(0.44)).toBe("0.44%");
    expect(formatCompactPct(0.001)).toBe("0.001%");
  });

  it("collapses a long run of leading zeros into a subscript count", () => {
    expect(formatCompactPct(0.00005)).toBe("0.0₄5%");
    expect(formatCompactPct(0.000000961)).toBe("0.0₆961%");
  });

  it("carries significant figures, not decimal places", () => {
    // The whole point: 6dp would render the first as all zeros and pad the second.
    expect(formatCompactPct(0.0000001234)).toBe("0.0₆1234%");
    expect(formatCompactPct(12.3456789)).toBe("12.35%");
  });

  it("does not pad an exact value out with trailing zeros", () => {
    expect(formatCompactPct(0.014)).toBe("0.014%");
    expect(formatCompactPct(0.0000005)).toBe("0.0₆5%");
  });

  it("keeps the sign on the value, not on the magnitude", () => {
    expect(formatCompactPct(-0.0247)).toBe("-0.0247%");
    expect(formatCompactPct(-0.00005)).toBe("-0.0₄5%");
  });

  it("has an answer for zero and for a non-number", () => {
    // log10(0) is -Infinity, which would otherwise produce a subscript of Infinity.
    expect(formatCompactPct(0)).toBe("0%");
    expect(formatCompactPct(Number.NaN)).toBe("—");
    expect(formatCompactPct(Number.POSITIVE_INFINITY)).toBe("—");
  });
});

describe("formatSignedCompactPct", () => {
  it("marks a positive rate explicitly and leaves zero unsigned", () => {
    expect(formatSignedCompactPct(0.0247)).toBe("+0.0247%");
    expect(formatSignedCompactPct(-0.0247)).toBe("-0.0247%");
    expect(formatSignedCompactPct(0)).toBe("0%");
  });
});
