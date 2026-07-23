// Location in the real project: src/Context/PolygonReducer.test.ts
// Run with: npx vitest run PolygonReducer.test.ts
//
// Pure reducer -> no rendering, no DOM, fastest tests in the suite.
// These should catch regressions in state transitions independent of the UI.

import { describe, it, expect } from "vitest";
import {
  polygonTracerReducer,
  initialState,
  type PolygonTracerState,
  type Viewport,
} from "./PolygonReducer";

const viewport: Viewport = { scale: 1, pan: { x: 0, y: 0 } };
const naturalSize = { width: 800, height: 600 };

describe("polygonTracerReducer", () => {
  describe("IMAGE_LOADED", () => {
    it("resets state and seeds a first polygon named 'Polygon 1'", () => {
      const next = polygonTracerReducer(initialState, {
        type: "IMAGE_LOADED",
        image: "data:image/png;base64,xxx",
        naturalSize,
        viewport,
      });

      expect(next.image).toBe("data:image/png;base64,xxx");
      expect(next.naturalSize).toEqual(naturalSize);
      expect(next.polygons).toHaveLength(1);
      expect(next.polygons[0].name).toBe("Polygon 1");
      expect(next.polygons[0].points).toEqual([]);
      expect(next.polygons[0].closed).toBe(false);
      expect(next.activePoly).toBe(next.polygons[0].id);
      expect(next.toolMode).toBe("draw");
      expect(next.viewport).toEqual(viewport);
    });

    it("discards polygons from a previously loaded image", () => {
      const withPolygons: PolygonTracerState = {
        ...initialState,
        polygons: [
          { id: 1, name: "Old", closed: true, color: "#fff", points: [{ x: 1, y: 1 }] },
        ],
        activePoly: 1,
      };

      const next = polygonTracerReducer(withPolygons, {
        type: "IMAGE_LOADED",
        image: "next.png",
        naturalSize,
        viewport,
      });

      expect(next.polygons).toHaveLength(1);
      expect(next.polygons[0].name).toBe("Polygon 1");
      expect(next.activePoly).not.toBe(1);
    });
  });

  describe("ADD_POLYGON", () => {
    it("appends a polygon and makes it active", () => {
      const state: PolygonTracerState = { ...initialState, polygons: [], activePoly: undefined };
      const next = polygonTracerReducer(state, { type: "ADD_POLYGON", name: "Roof" });

      expect(next.polygons).toHaveLength(1);
      expect(next.polygons[0].name).toBe("Roof");
      expect(next.activePoly).toBe(next.polygons[0].id);
      expect(next.toolMode).toBe("draw");
    });

    it("does not remove existing polygons when adding a new one", () => {
      const state = polygonTracerReducer(initialState, { type: "ADD_POLYGON", name: "A" });
      const next = polygonTracerReducer(state, { type: "ADD_POLYGON", name: "B" });

      expect(next.polygons).toHaveLength(2);
      expect(next.polygons.map((p) => p.name)).toEqual(["A", "B"]);
      expect(next.activePoly).toBe(next.polygons[1].id);
    });

    it("assigns unique, increasing ids even for rapid calls (no collisions)", () => {
      let state = initialState;
      const ids = new Set<number>();
      for (let i = 0; i < 50; i++) {
        state = polygonTracerReducer(state, { type: "ADD_POLYGON", name: `P${i}` });
      }
      state.polygons.forEach((p) => ids.add(p.id));
      expect(ids.size).toBe(50); // no duplicate ids
    });
  });

  describe("UPDATE_POLYGON", () => {
    it("replaces only the matching polygon by id", () => {
      const state: PolygonTracerState = {
        ...initialState,
        polygons: [
          { id: 1, name: "A", closed: false, color: "#111", points: [] },
          { id: 2, name: "B", closed: false, color: "#222", points: [] },
        ],
      };

      const next = polygonTracerReducer(state, {
        type: "UPDATE_POLYGON",
        polygon: { id: 2, name: "B renamed", closed: true, color: "#222", points: [{ x: 5, y: 5 }] },
      });

      expect(next.polygons[0]).toEqual(state.polygons[0]); // untouched
      expect(next.polygons[1].name).toBe("B renamed");
      expect(next.polygons[1].closed).toBe(true);
    });

    it("is a no-op (produces no matching change) if the id does not exist", () => {
      const state: PolygonTracerState = {
        ...initialState,
        polygons: [{ id: 1, name: "A", closed: false, color: "#111", points: [] }],
      };
      const next = polygonTracerReducer(state, {
        type: "UPDATE_POLYGON",
        polygon: { id: 999, name: "Ghost", closed: false, color: "#000", points: [] },
      });
      expect(next.polygons).toEqual(state.polygons);
    });
  });

  describe("REMOVE_POLYGON", () => {
    it("removes the polygon and clears activePoly when the active one is removed", () => {
      const state: PolygonTracerState = {
        ...initialState,
        polygons: [{ id: 1, name: "A", closed: false, color: "#111", points: [] }],
        activePoly: 1,
      };
      const next = polygonTracerReducer(state, { type: "REMOVE_POLYGON", id: 1 });
      expect(next.polygons).toHaveLength(0);
      expect(next.activePoly).toBeUndefined();
    });

    it("keeps activePoly untouched when removing a non-active polygon", () => {
      const state: PolygonTracerState = {
        ...initialState,
        polygons: [
          { id: 1, name: "A", closed: false, color: "#111", points: [] },
          { id: 2, name: "B", closed: false, color: "#222", points: [] },
        ],
        activePoly: 2,
      };
      const next = polygonTracerReducer(state, { type: "REMOVE_POLYGON", id: 1 });
      expect(next.polygons.map((p) => p.id)).toEqual([2]);
      expect(next.activePoly).toBe(2);
    });
  });

  describe("SELECT_POLYGON", () => {
    it("sets the active polygon id", () => {
      const next = polygonTracerReducer(initialState, { type: "SELECT_POLYGON", id: 42 });
      expect(next.activePoly).toBe(42);
    });

    it("allows clearing the selection with undefined", () => {
      const state = { ...initialState, activePoly: 42 };
      const next = polygonTracerReducer(state, { type: "SELECT_POLYGON", id: undefined });
      expect(next.activePoly).toBeUndefined();
    });
  });

  describe("SET_TOOL_MODE / SET_VIEWPORT", () => {
    it("updates toolMode without touching other fields", () => {
      const next = polygonTracerReducer(initialState, { type: "SET_TOOL_MODE", toolMode: "pan" });
      expect(next.toolMode).toBe("pan");
      expect(next.polygons).toBe(initialState.polygons);
    });

    it("replaces the viewport wholesale", () => {
      const nextViewport: Viewport = { scale: 2.5, pan: { x: 10, y: -4 } };
      const next = polygonTracerReducer(initialState, { type: "SET_VIEWPORT", viewport: nextViewport });
      expect(next.viewport).toEqual(nextViewport);
    });
  });

  describe("unknown action", () => {
    it("returns the state unchanged", () => {
      // @ts-expect-error intentionally invalid action for the default-case test
      const next = polygonTracerReducer(initialState, { type: "NOT_REAL" });
      expect(next).toBe(initialState);
    });
  });
});
