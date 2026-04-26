import { useEffect, useRef } from "react";
import { useStore } from "../store";

export default function AmbientBreath() {
  const ambient = useStore((s) => s.ambientProfile);
  const glowRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      phase: number;
    }

    const particles: Particle[] = [];
    const count = Math.floor(30 * ambient.particleChaos);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.3 + 0.1,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const pulse = Math.sin(time * 0.001 + p.phase) * 0.5 + 0.5;
        const alpha = p.alpha * pulse * ambient.opacityMax * 3;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = ambient.color + Math.floor(alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });

      // Soft glow in center
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.4;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      const breathe = (Math.sin(time * 0.001 * (4 / ambient.breatheDuration)) + 1) / 2;
      const opacity = ambient.opacityMin + (ambient.opacityMax - ambient.opacityMin) * breathe;
      grad.addColorStop(0, ambient.color + Math.floor(opacity * 40).toString(16).padStart(2, "0"));
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [ambient]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        ref={glowRef}
        className="absolute inset-0 transition-all duration-[2000ms] ease-in-out"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${ambient.color}08 0%, transparent 70%)`,
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}
