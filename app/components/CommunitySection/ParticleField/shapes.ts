import feather from "./shapes/feather.json";
import waves from "./shapes/waves.json";
import diamond from "./shapes/diamond.json";
import architecture from "./shapes/architecture.json";
import crescent from "./shapes/crescent.json";
import logo from "./shapes/9t7logo.json";

export type Point = readonly [number, number];

export interface ShapeData {
  readonly points: readonly Point[];
  readonly sourceImage: string;
  readonly count: number;
}

export const SHAPES: readonly ShapeData[] = [
  feather as unknown as ShapeData,
  waves as unknown as ShapeData,
  diamond as unknown as ShapeData,
  architecture as unknown as ShapeData,
  crescent as unknown as ShapeData,
  logo as unknown as ShapeData,
];

export const SHAPE_COUNT = SHAPES.length;
export const PARTICLE_COUNT = SHAPES[0].count;

for (const shape of SHAPES) {
  if (shape.count !== PARTICLE_COUNT) {
    throw new Error(
      `Shape ${shape.sourceImage} has ${shape.count} points; expected ${PARTICLE_COUNT}. Re-run extraction with matching --count.`
    );
  }
}
