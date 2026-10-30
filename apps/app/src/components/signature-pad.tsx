"use client";

import { useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Minimal signature pad (pointer events, works with mouse, touch and pen).
 * Writes a PNG data URL into a hidden input named `name`.
 */
export function SignaturePad({ name = "signature" }: { name?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [value, setValue] = useState("");

  function ctx() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const c = canvas.getContext("2d");
    if (!c) return null;
    c.lineWidth = 2.2;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.strokeStyle = "#0a0a0a";
    return c;
  }

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    const scaleY = e.currentTarget.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = ctx();
    if (!c) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = point(e);
    c.beginPath();
    c.moveTo(p.x, p.y);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const c = ctx();
    if (!c) return;
    const p = point(e);
    c.lineTo(p.x, p.y);
    c.stroke();
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    setValue(canvasRef.current?.toDataURL("image/png") ?? "");
  }

  function clear() {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setValue("");
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={600}
        height={180}
        aria-label="Zone de signature : signez avec la souris, le doigt ou un stylet"
        role="img"
        className="h-36 w-full touch-none rounded-lg border-2 border-dashed bg-white"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <input type="hidden" name={name} value={value} />
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {value ? "Signature prête." : "Signez dans le cadre ci-dessus."}
        </p>
        <Button type="button" variant="ghost" size="sm" onClick={clear}>
          <Eraser /> Effacer
        </Button>
      </div>
    </div>
  );
}
