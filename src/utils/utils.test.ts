// Location in the real project: src/utils/index.test.ts
// Run with: npx vitest run utils.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getPoint,
  distanceToSegment,
  copyJSON,
  copyCSSClipPath,
  copySVGTag,
  getRandomHexColor,
  isInputFocused,
} from "../utils";

describe("getRandomHexColor", () => {
  it("always returns a 7-char #rrggbb string", () => {
    for (let i = 0; i < 20; i++) {
      const color = getRandomHexColor();
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

describe("getPoint", () => {
  const makeSvgRef = (rect: Partial<DOMRect>) => ({
    current: { getBoundingClientRect: () => ({ left: 0, top: 0, ...rect }) },
  });

  it("maps client coordinates to image space at scale 1, no pan", () => {
    const svgRef = makeSvgRef({});
    const p = getPoint(svgRef, { clientX: 50, clientY: 30 }, 1, { x: 0, y: 0 });
    expect(p).toEqual({ x: 50, y: 30 });
  });

  it("accounts for pan offset", () => {
    const svgRef = makeSvgRef({});
    const p = getPoint(svgRef, { clientX: 60, clientY: 40 }, 1, { x: 10, y: 5 });
    expect(p).toEqual({ x: 50, y: 35 });
  });

  it("accounts for zoom scale", () => {
    const svgRef = makeSvgRef({});
    const p = getPoint(svgRef, { clientX: 100, clientY: 100 }, 2, { x: 0, y: 0 });
    expect(p).toEqual({ x: 50, y: 50 });
  });

  it("accounts for the SVG element's own offset on the page", () => {
    const svgRef = makeSvgRef({ left: 20, top: 10 });
    const p = getPoint(svgRef, { clientX: 120, clientY: 60 }, 1, { x: 0, y: 0 });
    // clientX/Y are first made relative to the svg's bounding box
    expect(p).toEqual({ x: 100, y: 50 });
  });
});

describe("distanceToSegment", () => {
  it("is 0 for a point that lies exactly on the segment", () => {
    const d = distanceToSegment({ x: 5, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 });
    expect(d).toBe(0);
  });

  it("returns perpendicular distance for a point beside the segment", () => {
    const d = distanceToSegment({ x: 5, y: 5 }, { x: 0, y: 0 }, { x: 10, y: 0 });
    expect(d).toBe(5);
  });

  it("clamps to the nearest endpoint when the projection falls before the segment", () => {
    const d = distanceToSegment({ x: -5, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 });
    expect(d).toBe(5);
  });

  it("clamps to the nearest endpoint when the projection falls after the segment", () => {
    const d = distanceToSegment({ x: 15, y: 0 }, { x: 0, y: 0 }, { x: 10, y: 0 });
    expect(d).toBe(5);
  });

  it("does not throw for a degenerate (zero-length) segment", () => {
    // a === b: lenSq is 0, function should fall back to distance-to-point
    const d = distanceToSegment({ x: 3, y: 4 }, { x: 0, y: 0 }, { x: 0, y: 0 });
    expect(d).toBe(5);
  });
});

describe("clipboard export helpers", () => {
  beforeEach(() => {
    // jsdom doesn't implement navigator.clipboard by default
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("copyJSON writes pretty-printed point array", async () => {
    const points = [{ x: 1, y: 2 }, { x: 3, y: 4 }];
    await copyJSON(points);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(JSON.stringify(points, null, 2));
  });

  it("copySVGTag writes a polygon tag with points, fill and stroke", async () => {
    const points = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
    await copySVGTag(points, "Roof", "#4ae176");
    const written = (navigator.clipboard.writeText as any).mock.calls[0][0] as string;
    expect(written).toContain('points="0,0 10,0 10,10"');
    expect(written).toContain('fill="#4ae176"');
    expect(written).toContain("//Roof");
  });

  it("copyCSSClipPath converts absolute px to percentages of naturalSize", async () => {
    const points = [{ x: 0, y: 0 }, { x: 100, y: 50 }];
    await copyCSSClipPath(points, "Roof", { width: 200, height: 100 });
    const written = (navigator.clipboard.writeText as any).mock.calls[0][0] as string;
    expect(written).toContain("0.0% 0.0%");
    expect(written).toContain("50.0% 50.0%");
  });

  it("copyCSSClipPath is a no-op when naturalSize is not yet known (width/height 0)", async () => {
    await copyCSSClipPath([{ x: 1, y: 1 }], "Roof", { width: 0, height: 0 });
    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
  });

  it("logs and does not throw if the clipboard write is rejected", async () => {
    (navigator.clipboard.writeText as any).mockRejectedValueOnce(new Error("denied"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(copyJSON([{ x: 1, y: 1 }])).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
  });
});

describe("isInputFocused", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // NOTE: jsdom doesn't implement `isContentEditable` as a reliable boolean
  // (it can come back `undefined`), unlike real browsers. We assert
  // truthy/falsy rather than strict `toBe(true/false)` so these tests check
  // the app's logic and not a jsdom quirk.
  it("is false when nothing / body is focused", () => {
    expect(isInputFocused()).toBeFalsy();
  });

  it("is true when an <input> is focused", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    expect(isInputFocused()).toBe(true);
  });

  // jsdom does not implement `isContentEditable` at all (it's always
  // `undefined`, see https://github.com/jsdom/jsdom/issues/1670), so this
  // path can't be meaningfully asserted here. Real browsers return a
  // proper boolean, so the app code is fine — cover this scenario in the
  // Playwright/e2e suite instead, where a real browser engine is used.
  it.skip("is true when a contentEditable element is focused (needs a real browser — see e2e suite)", () => {
    const div = document.createElement("div");
    div.contentEditable = "true";
    div.tabIndex = 0;
    document.body.appendChild(div);
    div.focus();
    expect(isInputFocused()).toBe(true);
  });

  it("is false when a plain button is focused", () => {
    const btn = document.createElement("button");
    document.body.appendChild(btn);
    btn.focus();
    expect(isInputFocused()).toBeFalsy();
  });
});
