// Location in the real project: src/Components/EditPolygon.test.tsx
// Run with: npx vitest run EditPolygon.test.tsx

import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditPolygon from "./EditPolygon";
import { renderWithProvider, renderWithSeededPolygon } from "../test-utils";
import type { usePolygonTracer } from "../Context/PolygonContext";

type Ctx = ReturnType<typeof usePolygonTracer>;

describe("EditPolygon", () => {
  it("renders nothing when no polygon is selected", () => {
    const { container } = renderWithProvider(<EditPolygon />);
    // Component returns `undefined` when there's no activePolygonData;
    // regression guard so the panel never renders an empty shell instead.
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the active polygon's name and color, and lets you rename it", async () => {
    const user = userEvent.setup();
    renderWithSeededPolygon(<EditPolygon />, (ctx) => ctx.addPolygon("Roof"));

    const nameInput = await screen.findByDisplayValue("Roof");
    await user.clear(nameInput);
    await user.type(nameInput, "Chimney");

    expect(screen.getByDisplayValue("Chimney")).toBeInTheDocument();
  });

  it("shows the points table header even for a polygon with no points yet", async () => {
    renderWithSeededPolygon(<EditPolygon />, (ctx) => ctx.addPolygon("Roof"));

    await screen.findByDisplayValue("Roof");
    expect(screen.getByText("Point")).toBeInTheDocument();
    expect(screen.getByText("X")).toBeInTheDocument();
    expect(screen.getByText("Y")).toBeInTheDocument();
  });

  it("calls removePolygon and clears selection when Delete is clicked", async () => {
    const user = userEvent.setup();
    renderWithSeededPolygon(<EditPolygon />, (ctx) => ctx.addPolygon("Roof"));

    await screen.findByDisplayValue("Roof");
    await user.click(screen.getByRole("button", { name: /delete/i }));

    // Panel should unmount itself once the polygon is gone / deselected.
    expect(screen.queryByDisplayValue("Roof")).not.toBeInTheDocument();
  });

  it("closes the panel (deselects) via the close (X) button without deleting the polygon", async () => {
    const user = userEvent.setup();
    const ctxRef: { current: Ctx | null } = { current: null };
    renderWithSeededPolygon(<EditPolygon />, (ctx) => ctx.addPolygon("Roof"), ctxRef);

    await screen.findByDisplayValue("Roof");
    const closeButtons = screen.getAllByRole("button");
    const closeBtn = closeButtons.find(
      (b) => b.querySelector(".material-symbols-outlined")?.textContent === "close"
    );
    expect(closeBtn).toBeTruthy();
    await user.click(closeBtn!);

    expect(screen.queryByDisplayValue("Roof")).not.toBeInTheDocument();
    // Read via the live ref (post-click render), not a stale mount-time
    // snapshot: the polygon itself should still exist, just unselected.
    expect(ctxRef.current!.polygons).toHaveLength(1);
    expect(ctxRef.current!.activePoly).toBeUndefined();
  });
});
