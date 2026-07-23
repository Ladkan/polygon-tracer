// Location in the real project: src/Components/Modal.test.tsx
// Run with: npx vitest run Modal.test.tsx

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import Modal from "./Modal";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Modal", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(
      <Modal isOpen={false} setState={vi.fn()}>
        <p>content</p>
      </Modal>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders children when isOpen is true", () => {
    const { getByText } = render(
      <Modal isOpen={true} setState={vi.fn()}>
        <p>content</p>
      </Modal>
    );
    expect(getByText("content")).toBeInTheDocument();
  });

  it("calls setState(false) when the close button is clicked", () => {
    const setState = vi.fn();
    const { getByRole } = render(
      <Modal isOpen={true} setState={setState}>
        <p>content</p>
      </Modal>
    );
    fireEvent.click(getByRole("button"));
    expect(setState).toHaveBeenCalledWith(false);
  });

  it("closes on Escape while open", () => {
    const setState = vi.fn();
    render(
      <Modal isOpen={true} setState={setState}>
        <p>content</p>
      </Modal>
    );
    fireEvent.keyUp(window, { code: "Escape" });
    expect(setState).toHaveBeenCalledWith(false);
  });

  // --- Regression test -------------------------------------------------
  // BUG: `if (!isOpen) return null` happens BEFORE the `useEffect` call.
  // That means when isOpen is false, zero hooks run; when it flips to true,
  // one hook runs. React requires the same hooks in the same order on every
  // render of a given component instance, so toggling isOpen on an already
  // mounted Modal throws "Rendered more hooks than during the previous
  // render." This test documents/guards that failure so it gets fixed by
  // moving the `if (!isOpen) return null` below the `useEffect` call.
  it("does not violate the Rules of Hooks when isOpen toggles from false to true", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const { rerender } = render(
      <Modal isOpen={false} setState={vi.fn()}>
        <p>content</p>
      </Modal>
    );

    expect(() => {
      rerender(
        <Modal isOpen={true} setState={vi.fn()}>
          <p>content</p>
        </Modal>
      );
    }).not.toThrow();

    consoleError.mockRestore();
  });

  // --- Regression test -------------------------------------------------
  // BUG: the cleanup function calls addEventListener instead of
  // removeEventListener, so every mount leaks a 'keyup' listener on window.
  // After N mounts, N stale handlers accumulate and each keeps firing
  // setState for modals that are long gone.
  it("removes its keyup listener on unmount (no leaked handlers)", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(
      <Modal isOpen={true} setState={vi.fn()}>
        <p>content</p>
      </Modal>
    );

    const keyupAdds = addSpy.mock.calls.filter((c) => c[0] === "keyup").length;
    expect(keyupAdds).toBe(1);

    unmount();

    const keyupRemoves = removeSpy.mock.calls.filter((c) => c[0] === "keyup").length;
    expect(keyupRemoves).toBe(1); // currently fails: cleanup calls addEventListener again
  });
});
