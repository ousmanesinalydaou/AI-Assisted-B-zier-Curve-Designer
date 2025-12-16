export interface Point {
  x: number;
  y: number;
}

export enum ParameterizationMethod {
  UNIFORM = 'UNIFORM',
  CHORD_LENGTH = 'CHORD_LENGTH'
}

export interface CurveResult {
  controlPoints: Point[];
  curvePoints: Point[];
  residuals: { start: Point; end: Point }[];
  method: ParameterizationMethod;
  error: number;
}
