import React, { useRef, useEffect, useState } from 'react';
import { Box, ZoomIn, ZoomOut } from 'lucide-react';

interface Lab3DRendererProps {
  telemetryVal: number;
  width?: number;
  height?: number;
  label?: string;
}

export const Lab3DRenderer: React.FC<Lab3DRendererProps> = ({
  telemetryVal,
  width = 400,
  height = 260,
  label = 'Modelo Tridimensional Espacial'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotX, setRotX] = useState<number>(0.5);
  const [rotY, setRotY] = useState<number>(0.8);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Fundo espacial profundo
      const grad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width / 2);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Auto rotação contínua lenta
      const currentRotY = rotY + 0.008;

      // Matriz de projeção 3D -> 2D
      const project = (x: number, y: number, z: number) => {
        // Rotação em Y
        const cosY = Math.cos(currentRotY);
        const sinY = Math.sin(currentRotY);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotação em X
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        // Projeção em perspectiva com zoom
        const distance = 400;
        const scale = (distance / (distance + z2)) * zoom;
        return {
          px: width / 2 + x1 * scale,
          py: height / 2 + y2 * scale,
          scale
        };
      };

      // Vértices de um poliedro 3D modulado pelo valor telemétrico
      const r = 55 + (telemetryVal % 25);
      const vertices = [
        [-r, -r, -r], [r, -r, -r], [r, r, -r], [-r, r, -r],
        [-r, -r, r], [r, -r, r], [r, r, r], [-r, r, r]
      ];

      const projected = vertices.map(v => project(v[0], v[1], v[2]));

      // Arestas do cubo
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
      ];

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projected[i].px, projected[i].py);
        ctx.lineTo(projected[j].px, projected[j].py);
        ctx.stroke();
      });

      // Esfera central / Núcleo
      const core = project(0, 0, 0);
      ctx.fillStyle = '#E4683F';
      ctx.beginPath();
      ctx.arc(core.px, core.py, 12 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Órbita circular no plano XZ
      ctx.strokeStyle = 'rgba(228, 104, 63, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.1) {
        const p = project(Math.cos(a) * (r * 1.5), 0, Math.sin(a) * (r * 1.5));
        if (a === 0) ctx.moveTo(p.px, p.py);
        else ctx.lineTo(p.px, p.py);
      }
      ctx.closePath();
      ctx.stroke();

      // Planeta ou partícula na órbita
      const orbitAngle = Date.now() * 0.002;
      const electron = project(Math.cos(orbitAngle) * (r * 1.5), 0, Math.sin(orbitAngle) * (r * 1.5));
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(electron.px, electron.py, 5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // HUD overlay
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(8, 8, 180, 24);
      ctx.strokeStyle = '#E4683F';
      ctx.strokeRect(8, 8, 180, 24);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px monospace';
      ctx.fillText(`3D WebGPU | Zoom: ${zoom.toFixed(1)}x`, 14, 24);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [width, height, rotX, rotY, zoom, telemetryVal]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setRotY(prev => prev + dx * 0.01);
    setRotX(prev => Math.max(-1.5, Math.min(1.5, prev + dy * 0.01)));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden relative shadow-md select-none">
      <div className="bg-slate-900/90 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-1.5">
          <Box className="w-3.5 h-3.5 text-[#E4683F]" />
          <span className="font-semibold">{label}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setZoom(prev => Math.min(2.5, prev + 0.2))}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Aproximar (Zoom In)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Afastar (Zoom Out)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-auto cursor-grab active:cursor-grabbing block"
      />
    </div>
  );
};
