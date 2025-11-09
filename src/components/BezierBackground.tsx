import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface BezierCurve {
  points: Point[];
  color: string;
  opacity: number;
}

export function BezierBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const curvesRef = useRef<BezierCurve[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize curves
    const colors = [
      'rgba(139, 92, 246, 0.3)', // purple
      'rgba(6, 182, 212, 0.3)',  // cyan
      'rgba(236, 72, 153, 0.3)', // pink
      'rgba(59, 130, 246, 0.3)', // blue
    ];

    const createPoint = (x: number, y: number): Point => ({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    });

    const createCurve = (): BezierCurve => {
      const numPoints = 4; // Cubic Bézier
      const points: Point[] = [];
      for (let i = 0; i < numPoints; i++) {
        points.push(createPoint(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        ));
      }
      return {
        points,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0.3 + Math.random() * 0.4,
      };
    };

    // Create initial curves
    curvesRef.current = Array.from({ length: 5 }, createCurve);

    // Draw cubic Bézier curve
    const drawBezier = (curve: BezierCurve) => {
      const [p0, p1, p2, p3] = curve.points;
      
      ctx.strokeStyle = curve.color;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.globalAlpha = curve.opacity;

      // Draw the curve
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      ctx.stroke();

      // Draw control polygon with subtle lines
      ctx.strokeStyle = curve.color.replace('0.3', '0.15');
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw control points
      curve.points.forEach((point, index) => {
        ctx.fillStyle = curve.color.replace('0.3', '0.5');
        ctx.beginPath();
        ctx.arc(point.x, point.y, index === 0 || index === 3 ? 4 : 3, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
    };

    // Update point positions
    const updatePoint = (point: Point) => {
      point.x += point.vx;
      point.y += point.vy;

      // Bounce off walls
      if (point.x < 0 || point.x > canvas.width) {
        point.vx *= -1;
        point.x = Math.max(0, Math.min(canvas.width, point.x));
      }
      if (point.y < 0 || point.y > canvas.height) {
        point.vy *= -1;
        point.y = Math.max(0, Math.min(canvas.height, point.y));
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw all curves
      curvesRef.current.forEach((curve) => {
        curve.points.forEach(updatePoint);
        drawBezier(curve);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
