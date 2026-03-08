import { useEffect, useRef } from "react";

interface FloatingNumber {
  id: number;
  x: number;
  y: number;
  value: string;
  color: string;
  speed: number;
  opacity: number;
  fontSize: number;
}

interface Candle {
  x: number;
  open: number;
  close: number;
  high: number;
  low: number;
  color: string;
}

const NEON_GREEN = "oklch(0.88 0.2 165)";
const NEON_RED = "oklch(0.6 0.24 25)";

const marketNumbers = [
  "NIFTY 22,847",
  "+0.42%",
  "BANKNIFTY 48,203",
  "-0.18%",
  "22,850",
  "22,800",
  "22,900",
  "48,250",
  "48,150",
  "RSI 58.4",
  "MACD +12.3",
  "EMA 22,820",
  "SMA 22,780",
  "VOL 2.4M",
  "ATR 45.2",
  "BB 22,950",
  "SELL",
  "BUY",
  "CALL 23,000",
  "PUT 22,500",
  "IV 12.4%",
  "OI 1.2M",
];

function generateCandles(width: number, height: number): Candle[] {
  const candles: Candle[] = [];
  const candleWidth = 14;
  const gap = 6;
  const totalCandles = Math.floor(width / (candleWidth + gap)) + 2;
  const midY = height * 0.55;
  const amplitude = height * 0.25;

  let prevClose = midY;
  for (let i = 0; i < totalCandles; i++) {
    const change = (Math.random() - 0.48) * amplitude * 0.12;
    const open = prevClose;
    const close = open + change;
    const high = Math.min(open, close) - Math.random() * amplitude * 0.06;
    const low = Math.max(open, close) + Math.random() * amplitude * 0.06;
    const isBull = close <= open;
    candles.push({
      x: i * (candleWidth + gap),
      open,
      close,
      high,
      low,
      color: isBull ? NEON_GREEN : NEON_RED,
    });
    prevClose = close;
  }
  return candles;
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const offsetRef = useRef(0);
  const numbersRef = useRef<FloatingNumber[]>([]);
  const nextIdRef = useRef(0);
  const candlesRef = useRef<Candle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      candlesRef.current = generateCandles(canvas.width * 2, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // Seed initial floating numbers
    for (let i = 0; i < 12; i++) {
      spawnNumber(canvas.width, canvas.height);
    }

    function spawnNumber(w: number, h: number) {
      const colors = [
        "rgba(0, 229, 255, 0.55)",
        "rgba(0, 255, 163, 0.45)",
        "rgba(0, 229, 255, 0.35)",
        "rgba(0, 255, 163, 0.3)",
        "rgba(0, 229, 255, 0.25)",
      ];
      numbersRef.current.push({
        id: nextIdRef.current++,
        x: Math.random() * w,
        y: h + 20 + Math.random() * 80,
        value: marketNumbers[Math.floor(Math.random() * marketNumbers.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 0.3 + Math.random() * 0.5,
        opacity: 0,
        fontSize: 9 + Math.floor(Math.random() * 6),
      });
    }

    let lastSpawn = 0;

    function draw(timestamp: number) {
      if (!canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // ── Base background ──
      ctx.fillStyle = "oklch(0.1 0.022 255)";
      ctx.fillRect(0, 0, w, h);

      // ── Animated grid ──
      const gridSize = 48;
      const gridAlpha = 0.06 + 0.02 * Math.sin(timestamp * 0.0005);
      ctx.strokeStyle = `rgba(0, 229, 255, ${gridAlpha})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x <= w; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y <= h; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      // ── Subtle radial glow at bottom-left corner ──
      const gradL = ctx.createRadialGradient(0, h, 0, 0, h, w * 0.5);
      gradL.addColorStop(0, "rgba(0, 229, 255, 0.06)");
      gradL.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradL;
      ctx.fillRect(0, 0, w, h);

      // ── Radial glow at top-right ──
      const gradR = ctx.createRadialGradient(w, 0, 0, w, 0, w * 0.45);
      gradR.addColorStop(0, "rgba(0, 255, 163, 0.05)");
      gradR.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradR;
      ctx.fillRect(0, 0, w, h);

      // ── Scrolling candlestick chart ──
      const candleWidth = 14;
      const gap = 6;
      const scrollSpeed = 0.4;
      offsetRef.current =
        (offsetRef.current + scrollSpeed) % (candleWidth + gap);

      ctx.save();
      ctx.globalAlpha = 0.22;
      for (const candle of candlesRef.current) {
        const cx = candle.x - offsetRef.current;
        if (cx < -(candleWidth + gap) || cx > w + 20) continue;

        const bodyTop = Math.min(candle.open, candle.close);
        const bodyBot = Math.max(candle.open, candle.close);
        const bodyH = Math.max(2, bodyBot - bodyTop);

        const isCyan = candle.color === NEON_GREEN;
        ctx.strokeStyle = candle.color;
        ctx.fillStyle = isCyan
          ? "rgba(0, 255, 163, 0.25)"
          : "rgba(255, 80, 60, 0.2)";

        // Wick
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + candleWidth / 2, candle.high);
        ctx.lineTo(cx + candleWidth / 2, candle.low);
        ctx.stroke();

        // Body
        ctx.lineWidth = 0.5;
        ctx.fillRect(cx, bodyTop, candleWidth, bodyH);
        ctx.strokeRect(cx, bodyTop, candleWidth, bodyH);
      }
      ctx.restore();

      // ── Moving scan line ──
      const scanY = ((timestamp * 0.04) % (h + 60)) - 30;
      const scanGrad = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
      scanGrad.addColorStop(0, "rgba(0, 229, 255, 0)");
      scanGrad.addColorStop(0.5, "rgba(0, 229, 255, 0.06)");
      scanGrad.addColorStop(1, "rgba(0, 229, 255, 0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 2, w, 4);

      // ── Floating market numbers ──
      if (timestamp - lastSpawn > 900) {
        spawnNumber(w, h);
        lastSpawn = timestamp;
      }

      ctx.font = "";
      numbersRef.current = numbersRef.current.filter((n) => {
        n.y -= n.speed;
        // Fade in/out
        if (n.y > h - 40) {
          n.opacity = Math.min(1, n.opacity + 0.04);
        } else if (n.y < 100) {
          n.opacity = Math.max(0, n.opacity - 0.03);
        }
        if (n.opacity <= 0 && n.y < 80) return false;

        ctx.save();
        ctx.globalAlpha = n.opacity * 0.9;
        ctx.font = `${n.fontSize}px "Geist Mono", monospace`;
        ctx.fillStyle = n.color;
        ctx.fillText(n.value, n.x, n.y);
        ctx.restore();
        return true;
      });

      // ── Vignette overlay ──
      const vignette = ctx.createRadialGradient(
        w / 2,
        h / 2,
        h * 0.2,
        w / 2,
        h / 2,
        h,
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(11,15,26,0.7)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      tabIndex={-1}
      data-ocid="animated_bg.canvas_target"
    />
  );
}
