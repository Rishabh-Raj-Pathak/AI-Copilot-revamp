import { describe, expect, it } from "vitest";
import { formatCompactPct, formatSignedCompactPct } from "./format";

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
