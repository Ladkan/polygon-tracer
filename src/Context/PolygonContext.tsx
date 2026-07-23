import { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import type { Polygon } from "../types/polygon";
import { initialState, polygonTracerReducer, type PolygonTracerAction, type PolygonTracerState, type ToolMode, type Viewport } from "./PolygonReducer";

interface PolygonTracerContextValue extends PolygonTracerState {
  dispatch: React.Dispatch<PolygonTracerAction>;
  activePolygonData: Polygon | undefined;

  loadImage: (
    image: string,
    naturalSize: { width: number, height: number },
    viewport: Viewport
  ) => void;
  addPolygon: (name: string) => void;
  updatePolygon: (polygon: Polygon) => void;
  removePolygon: (id: number) => void;
  selectPolygon: (id: number | undefined) => void;
  setToolMode: (mode: ToolMode) => void;
  setViewport: (viewport: Viewport) => void;
}

const PolygonTracerContext = createContext<PolygonTracerContextValue | null>(null)

export function PolygonTracerProvider({
  children
}: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(polygonTracerReducer, initialState)

  const activePolygonData = useMemo(
    () => state.polygons.find((p) => p.id === state.activePoly),
    [state.polygons, state.activePoly]
  )

  const loadImage = useCallback(
    (
      image: string,
      naturalSize: { width: number, height: number },
      viewport: Viewport
    ) => dispatch({ type: "IMAGE_LOADED", image, naturalSize, viewport }), [])

  const addPolygon = useCallback(
    (name: string) => dispatch({ type: "ADD_POLYGON", name }),
    []
 )
  const updatePolygon = useCallback(
    (polygon: Polygon) => dispatch({ type: "UPDATE_POLYGON", polygon }),
    []
  );
  const removePolygon = useCallback(
    (id: number) => dispatch({ type: "REMOVE_POLYGON", id }),
    []
  );
  const selectPolygon = useCallback(
    (id: number | undefined) => dispatch({ type: "SELECT_POLYGON", id }),
    []
  );
  const setToolMode = useCallback(
    (toolMode: ToolMode) => dispatch({ type: "SET_TOOL_MODE", toolMode }),
    []
  );
  const setViewport = useCallback(
    (viewport: Viewport) => dispatch({ type: "SET_VIEWPORT", viewport }),
    []
  );

  const value = useMemo<PolygonTracerContextValue>(
    () => ({
      ...state,
      dispatch,
      activePolygonData,
      loadImage,
      addPolygon,
      updatePolygon,
      removePolygon,
      selectPolygon,
      setToolMode,
      setViewport
    }),
    [
      state,
      activePolygonData,
      loadImage,
      addPolygon,
      updatePolygon,
      removePolygon,
      selectPolygon,
      setToolMode,
      setViewport
    ]
  );

  return (
    <PolygonTracerContext.Provider value={value}>
      {children}
    </PolygonTracerContext.Provider>
  )

}


export function usePolygonTracer() {
  const ctx = useContext(PolygonTracerContext)
  if (!ctx) {
    throw new Error(
      "usePolygonTracer must be used within a PolygonTracerProvider"
    )
  }
  return ctx
}
