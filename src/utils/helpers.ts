import { Point2D } from '../types';

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function distance(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

export function getCanvasCoordinates(
  event: MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement
): Point2D {
  const rect = canvas.getBoundingClientRect();
  const clientX = 'touches' in event ? event.touches[0]?.clientX ?? 0 : event.clientX;
  const clientY = 'touches' in event ? event.touches[0]?.clientY ?? 0 : event.clientY;
  
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
    timestamp: Date.now(),
  };
}

export function resamplePoints(points: Point2D[], spacing: number): Point2D[] {
  if (points.length < 2) return points;
  
  const resampled: Point2D[] = [points[0]];
  let totalDistance = 0;
  let targetDistance = spacing;
  
  for (let i = 1; i < points.length; i++) {
    const segmentLength = distance(points[i - 1], points[i]);
    totalDistance += segmentLength;
    
    while (totalDistance >= targetDistance) {
      const ratio = (targetDistance - (totalDistance - segmentLength)) / segmentLength;
      const interpolated = {
        x: lerp(points[i - 1].x, points[i].x, ratio),
        y: lerp(points[i - 1].y, points[i].y, ratio),
      };
      resampled.push(interpolated);
      targetDistance += spacing;
    }
  }
  
  // Always include the last point
  if (resampled[resampled.length - 1] !== points[points.length - 1]) {
    resampled.push(points[points.length - 1]);
  }
  
  return resampled;
}

export function smoothPoints(points: Point2D[], windowSize: number = 5): Point2D[] {
  if (points.length <= windowSize) return points;
  
  const smoothed: Point2D[] = [];
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let i = 0; i < points.length; i++) {
    const start = Math.max(0, i - halfWindow);
    const end = Math.min(points.length - 1, i + halfWindow);
    
    let sumX = 0;
    let sumY = 0;
    let count = 0;
    
    for (let j = start; j <= end; j++) {
      sumX += points[j].x;
      sumY += points[j].y;
      count++;
    }
    
    smoothed.push({
      x: sumX / count,
      y: sumY / count,
    });
  }
  
  return smoothed;
}