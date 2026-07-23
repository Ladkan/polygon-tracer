import type { Point2D, Polygon } from "../types/polygon";
import { getRandomHexColor } from "../utils";

export type ToolMode = "select" | "draw" | "pan";

export interface Viewport {
  scale: number;
  pan: { x: number; y: number };
}

export interface PolygonTracerState {
  image: string | null;
  naturalSize: { width: number; height: number };
  polygons: Polygon[];
  activePoly: number | undefined;
  toolMode: ToolMode;
  viewport: Viewport;
}

export const initialState: PolygonTracerState = {
  image: null,
  naturalSize: { width: 0, height: 0 },
  polygons: [],
  activePoly: undefined,
  toolMode: "draw",
  viewport: { scale: 1, pan: { x: 0, y: 0 } },
};

export type PolygonTracerAction =
  | {
      type: "IMAGE_LOADED";
      image: string;
      naturalSize: { width: number; height: number };
      viewport: Viewport;
    }
  | { type: "ADD_POLYGON"; name: string }
  | { type: "UPDATE_POLYGON"; polygon: Polygon }
  | { type: "REMOVE_POLYGON"; id: number }
  | { type: "SELECT_POLYGON"; id: number | undefined }
  | { type: "SET_TOOL_MODE"; toolMode: ToolMode }
  | { type: "SET_VIEWPORT"; viewport: Viewport };

let idSeed = Date.now();
function nextPolygonId(): number {
  idSeed += 1;
  return idSeed;
}

function makePolygon(name: string): Polygon {
  return {
    id: nextPolygonId(),
    name,
    closed: false,
    color: getRandomHexColor(),
    points: [] as Point2D[],
  } as Polygon;
}

export function polygonTracerReducer(
  state: PolygonTracerState,
  action: PolygonTracerAction
): PolygonTracerState {
  switch (action.type) {
    case "IMAGE_LOADED": {
      const poly = makePolygon("Polygon 1");
      return {
        ...state,
        image: action.image,
        naturalSize: action.naturalSize,
        polygons: [poly],
        activePoly: poly.id,
        toolMode: "draw",
        viewport: action.viewport,
      };
    }

    case "ADD_POLYGON": {
      const poly = makePolygon(action.name);
      return {
        ...state,
        polygons: [...state.polygons, poly],
        activePoly: poly.id,
        toolMode: "draw",
      };
    }

    case "UPDATE_POLYGON":
      return {
        ...state,
        polygons: state.polygons.map((p) =>
          p.id === action.polygon.id ? action.polygon : p
        ),
      };

    case "REMOVE_POLYGON":
      return {
        ...state,
        polygons: state.polygons.filter((p) => p.id !== action.id),
        activePoly:
          state.activePoly === action.id ? undefined : state.activePoly,
      };

    case "SELECT_POLYGON":
      return { ...state, activePoly: action.id };

    case "SET_TOOL_MODE":
      return { ...state, toolMode: action.toolMode };

    case "SET_VIEWPORT":
      return { ...state, viewport: action.viewport };

    default:
      return state;
  }
}
