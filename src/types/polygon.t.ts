export type Polygon = {
  id: number;
  name: string;
  points: Point2D[];
  color: string;
}

export type Point2D = {
  x: number;
  y: number;
}
