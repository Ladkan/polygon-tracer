// Location in the real project: src/Components/SavedPolygons.test.tsx
// Run with: npx vitest run SavedPolygons.test.tsx

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SavedPolygons from "./SavedPolygons";
import { renderWithSeededPolygon } from "../test-utils";
import type { usePolygonTracer } from "../Context/PolygonContext";

type Ctx = ReturnType<typeof usePolygonTracer>;

describe("SavedPolygons", () => {
  it("shows the empty state when there are no polygons", () => {
    renderWithSeededPolygon(
      <SavedPolygons handleImageUpload={vi.fn()} createPolygon={vi.fn()} />
    );
    expect(screen.getByText(/no polygons saved yet/i)).toBeInTheDocument();
  });

  it("lists polygons and lets you select one", async () => {
    const user = userEvent.setup();
    const ctxRef: { current: Ctx | null } = { current: null };
    renderWithSeededPolygon(
      <SavedPolygons handleImageUpload={vi.fn()} createPolygon={vi.fn()} />,
      (ctx) => ctx.addPolygon("Roof"),
      ctxRef
    );

    const row = await screen.findByText("Roof");
    await user.click(row);

    expect(ctxRef.current!.activePoly).toBeDefined();
  });

  it("calls createPolygon when 'Add Polygon' is clicked", async () => {
    const user = userEvent.setup();
    const createPolygon = vi.fn();
    renderWithSeededPolygon(
      <SavedPolygons handleImageUpload={vi.fn()} createPolygon={createPolygon} />
    );

    await user.click(screen.getByRole("button", { name: /add polygon/i }));
    expect(createPolygon).toHaveBeenCalledTimes(1);
  });

  // --- Regression test -----------------------------------------------
  // Deleting a polygon must NOT also select it: the delete button's click
  // handler needs e.stopPropagation() so it doesn't bubble up to the row's
  // own onClick (which calls selectPolygon). Confirms the fix is in place
  // and guards against it regressing.
  it("deleting a polygon does not also select it (delete button stopPropagation)", async () => {
    const user = userEvent.setup();
    const ctxRef: { current: Ctx | null } = { current: null };
    renderWithSeededPolygon(
      <SavedPolygons handleImageUpload={vi.fn()} createPolygon={vi.fn()} />,
      (ctx) => {
        ctx.addPolygon("A");
        ctx.addPolygon("B"); // B becomes active
      },
      ctxRef
    );

    await screen.findByText("A");
    const rowA = screen.getByText("A").closest("div.group") as HTMLElement;
    const deleteBtn = rowA.querySelector("button") as HTMLElement;

    await user.click(deleteBtn);

    // "A" should be gone from the DOM...
    await screen.findByText(/1 Points|0 Points/); // wait a tick for re-render (loose)
    expect(screen.queryByText("A")).not.toBeInTheDocument();

    // ...and read the *current* context (via the live ref, not a stale
    // mount-time snapshot) to confirm selection stayed on "B".
    const current = ctxRef.current!;
    const polyB = current.polygons.find((p) => p.name === "B");
    expect(polyB).toBeDefined();
    expect(current.activePoly).toBe(polyB!.id);
  });
});
