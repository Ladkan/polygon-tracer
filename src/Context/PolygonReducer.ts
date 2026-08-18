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
  activePoly: number | null;
  toolMode: ToolMode;
  viewport: Viewport;
}

export const initialState: PolygonTracerState = {
  image: null,
  naturalSize: { width: 0, height: 0 },
  polygons: [],
  activePoly: null,
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
  | { type: "SELECT_POLYGON"; id: number | null }
  | { type: "SET_TOOL_MODE"; toolMode: ToolMode }
  | { type: "SET_VIEWPORT"; viewport: Viewport }
  | { type: "COPY_POLYGON"; name: string};

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

function copyPolygon(activePoly: Polygon[], name: string): Polygon {

  return {
    id: nextPolygonId(),
    name,
    closed: true,
    color: activePoly[0].color,
    points: [...activePoly[0].points],
  } as Polygon
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

    case "COPY_POLYGON":
      const poly = copyPolygon(state.polygons.filter((p) => p.id === state.activePoly), action.name)

      if(!poly) return state

      return {
        ...state,
        polygons: [...state.polygons, poly],
        activePoly: poly.id,
      };

    case "REMOVE_POLYGON":
      return {
        ...state,
        polygons: state.polygons.filter((p) => p.id !== action.id),
        activePoly:
          state.activePoly === action.id ? null : state.activePoly,
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
