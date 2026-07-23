// Location in the real project: src/test-utils.tsx
// Small helper so component tests exercise the *real* context/reducer instead
// of mocking usePolygonTracer — closer to what users actually experience.

import React from "react";
import { render } from "@testing-library/react";
import { PolygonTracerProvider, usePolygonTracer } from "./Context/PolygonContext";

export function renderWithProvider(ui: React.ReactElement) {
  return render(<PolygonTracerProvider>{ui}</PolygonTracerProvider>);
}

type Ctx = ReturnType<typeof usePolygonTracer>;

// Convenience harness: runs `onReady(ctx)` once on mount (e.g. to seed an
// image + polygon) then renders `children`, all sharing one provider/context
// instance, so tests don't need to mock usePolygonTracer.
//
// IMPORTANT: `ctx` is a brand-new object on every render (PolygonContext
// recomputes it via useMemo whenever state changes). If a test captures it
// once -- e.g. `let captured; onReady: (ctx) => { captured = ctx }` -- that
// variable becomes a stale snapshot the instant state changes again later.
// `captureRef` below is updated on *every* render instead, so
// `captureRef.current` always reflects the latest committed state.
export function Harness({
  onReady,
  captureRef,
  children,
}: {
  onReady?: (ctx: Ctx) => void;
  captureRef?: React.MutableRefObject<Ctx | null>;
  children: React.ReactNode;
}) {
  const ctx = usePolygonTracer();
  const ranRef = React.useRef(false);

  // Updated unconditionally on every render -- always fresh.
  if (captureRef) {
    captureRef.current = ctx;
  }

  React.useEffect(() => {
    if (!ranRef.current) {
      ranRef.current = true;
      onReady?.(ctx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

export function renderWithSeededPolygon(
  ui: React.ReactElement,
  onReady?: (ctx: Ctx) => void,
  captureRef?: React.MutableRefObject<Ctx | null>
) {
  return render(
    <PolygonTracerProvider>
      <Harness onReady={onReady} captureRef={captureRef}>
        {ui}
      </Harness>
    </PolygonTracerProvider>
  );
}
