export type Polygon = {
  id: number;
  name: string;
  points: Point2D[];
  color: string;
  closed: boolean;
}

export type Point2D = {
  x: number;
  y: number;
}

export type PolyIdIdx = {
  polyId: number;
  pointIndex: number;
}
