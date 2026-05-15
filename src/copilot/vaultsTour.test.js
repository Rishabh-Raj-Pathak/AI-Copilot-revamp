import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockDriver, driverFactory } = vi.hoisted(() => {
  const mockDriver = {
    isActive: vi.fn(() => true),
    getActiveIndex: vi.fn(() => 0),
    refresh: vi.fn(),
    moveNext: vi.fn(),
    drive: vi.fn(),
    destroy: vi.fn(),
  };
  return {
    mockDriver,
    driverFactory: vi.fn(() => mockDriver),
  };
});

vi.mock("driver.js", () => ({
  driver: driverFactory,
}));

import {
  VAULTS_TOUR_STEP,
  VAULTS_TOUR_STORAGE_KEY,
  advanceVaultsTourAfterFeaturedActivateClick,
  getVaultsTourAdvanceTargetAfterFeaturedActivate,
  isVaultsTourCompleted,
  notifyVaultsTourDexChanged,
  shouldVaultsTourAutoAdvanceOnDexChange,
  startVaultsProductTour,
} from "./vaultsTour.js";

describe("getVaultsTourAdvanceTargetAfterFeaturedActivate", () => {
  it("returns null for invalid indices", () => {
    expect(getVaultsTourAdvanceTargetAfterFeaturedActivate(-1)).toBeNull();
    expect(getVaultsTourAdvanceTargetAfterFeaturedActivate(NaN)).toBeNull();
  });

  it("jumps to activated from overview, DEX, and explore (skips tune/activate)", () => {
    expect(
      getVaultsTourAdvanceTargetAfterFeaturedActivate(VAULTS_TOUR_STEP.OVERVIEW),
    ).toEqual({
      type: "jump",
      stepIndex: VAULTS_TOUR_STEP.ACTIVATED,
    });
    expect(
      getVaultsTourAdvanceTargetAfterFeaturedActivate(VAULTS_TOUR_STEP.DEX),
    ).toEqual({
      type: "jump",
      stepIndex: VAULTS_TOUR_STEP.ACTIVATED,
    });
    expect(
      getVaultsTourAdvanceTargetAfterFeaturedActivate(VAULTS_TOUR_STEP.EXPLORE),
    ).toEqual({
      type: "jump",
      stepIndex: VAULTS_TOUR_STEP.ACTIVATED,
    });
  });

  it("advances one step from tune/activate", () => {
    expect(
      getVaultsTourAdvanceTargetAfterFeaturedActivate(VAULTS_TOUR_STEP.ACTIVATE),
    ).toEqual({ type: "next" });
  });

  it("does not advance when already on activated step", () => {
    expect(
      getVaultsTourAdvanceTargetAfterFeaturedActivate(VAULTS_TOUR_STEP.ACTIVATED),
    ).toBeNull();
  });
});

describe("shouldVaultsTourAutoAdvanceOnDexChange", () => {
  it("auto-advances only on DEX step when venue changes", () => {
    expect(
      shouldVaultsTourAutoAdvanceOnDexChange(
        VAULTS_TOUR_STEP.DEX,
        "all",
        "hyperliquid",
      ),
    ).toBe(true);
    expect(
      shouldVaultsTourAutoAdvanceOnDexChange(VAULTS_TOUR_STEP.DEX, "all", "all"),
    ).toBe(false);
    expect(
      shouldVaultsTourAutoAdvanceOnDexChange(
        VAULTS_TOUR_STEP.EXPLORE,
        "all",
        "hyperliquid",
      ),
    ).toBe(false);
    expect(
      shouldVaultsTourAutoAdvanceOnDexChange(VAULTS_TOUR_STEP.DEX, null, "hyperliquid"),
    ).toBe(false);
  });
});

describe("isVaultsTourCompleted", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("is false when key is missing", () => {
    expect(isVaultsTourCompleted()).toBe(false);
  });

  it("is true when completion flag is set", () => {
    localStorage.setItem(VAULTS_TOUR_STORAGE_KEY, "1");
    expect(isVaultsTourCompleted()).toBe(true);
  });
});

function captureVaultsTourDexBaseline() {
  const config = driverFactory.mock.calls.at(-1)?.[0];
  const dexStep = config?.steps?.[VAULTS_TOUR_STEP.DEX];
  dexStep?.onHighlighted?.(null, null, { driver: mockDriver });
}

function stubMatchMedia(matches = false) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("vaults tour driver integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubMatchMedia(false);
    mockDriver.isActive.mockReturnValue(true);
    mockDriver.getActiveIndex.mockReturnValue(VAULTS_TOUR_STEP.OVERVIEW);
    vi.stubGlobal("requestAnimationFrame", (cb) => {
      cb();
      return 0;
    });
    document.body.innerHTML = `
      <div data-tour="vaults-overview"></div>
      <div data-tour="vaults-dex-tabs"></div>
      <div data-tour="vaults-opportunities"></div>
      <div data-tour="vaults-featured-tour-controls"></div>
      <div data-tour="vaults-activated-section"></div>
    `;
  });

  it("startVaultsProductTour requires featured tour controls in the DOM", () => {
    document.body.innerHTML = "";
    expect(startVaultsProductTour()).toBeNull();
    expect(driverFactory).not.toHaveBeenCalled();
  });

  it("advanceVaultsTourAfterFeaturedActivateClick jumps from explore to activated", () => {
    mockDriver.getActiveIndex.mockReturnValue(VAULTS_TOUR_STEP.EXPLORE);
    startVaultsProductTour({ getVaultsDexId: () => "all" });

    const advanced = advanceVaultsTourAfterFeaturedActivateClick();

    expect(advanced).toBe(true);
    expect(mockDriver.drive).toHaveBeenCalledWith(VAULTS_TOUR_STEP.ACTIVATED);
    expect(mockDriver.moveNext).not.toHaveBeenCalled();
    expect(mockDriver.refresh).toHaveBeenCalled();
  });

  it("advanceVaultsTourAfterFeaturedActivateClick uses moveNext on activate step", () => {
    mockDriver.getActiveIndex.mockReturnValue(VAULTS_TOUR_STEP.ACTIVATE);
    startVaultsProductTour({ getVaultsDexId: () => "all" });

    advanceVaultsTourAfterFeaturedActivateClick();

    expect(mockDriver.moveNext).toHaveBeenCalled();
    expect(mockDriver.drive).not.toHaveBeenCalledWith(VAULTS_TOUR_STEP.ACTIVATED);
  });

  it("advanceVaultsTourAfterFeaturedActivateClick returns false when tour inactive", () => {
    mockDriver.isActive.mockReturnValue(false);
    expect(advanceVaultsTourAfterFeaturedActivateClick()).toBe(false);
  });

  it("notifyVaultsTourDexChanged moves next when DEX changes on DEX step", () => {
    mockDriver.getActiveIndex.mockReturnValue(VAULTS_TOUR_STEP.DEX);
    startVaultsProductTour({ getVaultsDexId: () => "all" });
    captureVaultsTourDexBaseline();

    notifyVaultsTourDexChanged("hyperliquid");

    expect(mockDriver.moveNext).toHaveBeenCalled();
  });

  it("notifyVaultsTourDexChanged does nothing when DEX unchanged", () => {
    mockDriver.getActiveIndex.mockReturnValue(VAULTS_TOUR_STEP.DEX);
    startVaultsProductTour({ getVaultsDexId: () => "all" });
    captureVaultsTourDexBaseline();
    mockDriver.moveNext.mockClear();

    notifyVaultsTourDexChanged("all");

    expect(mockDriver.moveNext).not.toHaveBeenCalled();
  });
});
