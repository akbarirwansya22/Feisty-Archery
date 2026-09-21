import React, { useState, useRef } from 'react';
import { ArrowScore } from '../../types';
import { Target, RotateCcw, Crosshair } from 'lucide-react';
import { archeryAudio } from '../../utils/audioSignal';

export interface PlottedArrow {
  id: number;
  score: ArrowScore;
  relX: number; // -1 to +1 from center
  relY: number; // -1 to +1 from center
}

interface InteractiveTargetFaceProps {
  arrows: ArrowScore[];
  maxArrows?: number;
  plottedArrows?: PlottedArrow[];
  onPlotArrow: (score: ArrowScore, plot?: PlottedArrow) => void;
  onClearPlot?: () => void;
  disabled?: boolean;
  sizePx?: number;
}

export const InteractiveTargetFace: React.FC<InteractiveTargetFaceProps> = ({
  arrows,
  maxArrows = 6,
  plottedArrows = [],
  onPlotArrow,
  onClearPlot,
  disabled = false,
  sizePx = 320
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; score: ArrowScore } | null>(null);

  // Concentric ring radii scaled from 0 to 100
  // World Archery official relative proportions:
  // Ring 10 = 10% radius, Ring X = 5% radius, each outer ring is +10%
  const calculateScoreFromDistance = (distNorm: number): ArrowScore => {
    if (distNorm <= 0.055) return 'X';
    if (distNorm <= 0.105) return '10';
    if (distNorm <= 0.205) return '9';
    if (distNorm <= 0.305) return '8';
    if (distNorm <= 0.405) return '7';
    if (distNorm <= 0.505) return '6';
    if (distNorm <= 0.605) return '5';
    if (distNorm <= 0.705) return '4';
    if (distNorm <= 0.805) return '3';
    if (distNorm <= 0.905) return '2';
    if (distNorm <= 1.005) return '1';
    return 'M';
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled || arrows.length >= maxArrows) return;
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = rect.width / 2;

    const relX = (clickX - centerX) / radius;
    const relY = (clickY - centerY) / radius;
    const distNorm = Math.sqrt(relX * relX + relY * relY);

    const score = calculateScoreFromDistance(distNorm);
    archeryAudio.playArrowChirp(score);

    const newPlot: PlottedArrow = {
      id: arrows.length + 1,
      score,
      relX,
      relY
    };

    onPlotArrow(score, newPlot);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (disabled || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = rect.width / 2;

    const relX = (clickX - centerX) / radius;
    const relY = (clickY - centerY) / radius;
    const distNorm = Math.sqrt(relX * relX + relY * relY);

    const score = calculateScoreFromDistance(distNorm);
    setHoverCoord({ x: clickX, y: clickY, score });
  };

  const handleMouseLeave = () => {
    setHoverCoord(null);
  };

  return (
    <div className="flex flex-col items-center select-none space-y-3">
      {/* Target Face Header / Prompt */}
      <div className="flex items-center justify-between w-full px-1 text-xs text-neutral-400">
        <div className="flex items-center gap-1.5 font-semibold text-neutral-300">
          <Crosshair className="w-3.5 h-3.5 text-amber-400" />
          <span>Plot Target Digital (Tap / Klik Lingkaran)</span>
        </div>
        {hoverCoord && (
          <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            Nilai: {hoverCoord.score}
          </span>
        )}
      </div>

      {/* Target Face SVG (World Archery standard rings) */}
      <div 
        className="relative rounded-full shadow-2xl p-1 bg-neutral-950 border-4 border-neutral-800 transition transform hover:scale-[1.01]"
        style={{ width: sizePx, height: sizePx }}
      >
        <svg
          ref={svgRef}
          viewBox="-110 -110 220 220"
          className="w-full h-full cursor-crosshair rounded-full overflow-hidden"
          onClick={handleSvgClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Subtle stadium shadow */}
            <radialGradient id="targetLighting" cx="40%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
            </radialGradient>
          </defs>

          {/* Miss border background (Target stand surround) */}
          <circle cx="0" cy="0" r="108" fill="#18181b" stroke="#27272a" strokeWidth="2" />

          {/* Ring 1 (White) */}
          <circle cx="0" cy="0" r="100" fill="#ffffff" stroke="#1f2421" strokeWidth="0.8" />
          {/* Ring 2 (White) */}
          <circle cx="0" cy="0" r="90" fill="#ffffff" stroke="#1f2421" strokeWidth="0.8" />

          {/* Ring 3 (Black) */}
          <circle cx="0" cy="0" r="80" fill="#1f2421" stroke="#ffffff" strokeWidth="0.5" />
          {/* Ring 4 (Black) */}
          <circle cx="0" cy="0" r="70" fill="#1f2421" stroke="#ffffff" strokeWidth="0.5" />

          {/* Ring 5 (Blue) */}
          <circle cx="0" cy="0" r="60" fill="#00A3E0" stroke="#0072b2" strokeWidth="0.8" />
          {/* Ring 6 (Blue) */}
          <circle cx="0" cy="0" r="50" fill="#00A3E0" stroke="#0072b2" strokeWidth="0.8" />

          {/* Ring 7 (Red) */}
          <circle cx="0" cy="0" r="40" fill="#ED1C24" stroke="#b91c1c" strokeWidth="0.8" />
          {/* Ring 8 (Red) */}
          <circle cx="0" cy="0" r="30" fill="#ED1C24" stroke="#b91c1c" strokeWidth="0.8" />

          {/* Ring 9 (Gold) */}
          <circle cx="0" cy="0" r="20" fill="#FFD700" stroke="#d97706" strokeWidth="0.8" />
          {/* Ring 10 (Gold) */}
          <circle cx="0" cy="0" r="10" fill="#FFD700" stroke="#d97706" strokeWidth="0.8" />

          {/* Ring X (Inner Gold Center) */}
          <circle cx="0" cy="0" r="5" fill="#FFE500" stroke="#d97706" strokeWidth="0.6" />

          {/* Center Crosshair '+' */}
          <line x1="-3" y1="0" x2="3" y2="0" stroke="#78350f" strokeWidth="0.6" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="#78350f" strokeWidth="0.6" />

          {/* Concentric Ring Numbers (White on black, black on colors) */}
          <text x="0" y="-93" fontSize="5" fontWeight="bold" textAnchor="middle" fill="#71717a">1</text>
          <text x="0" y="-83" fontSize="5" fontWeight="bold" textAnchor="middle" fill="#71717a">2</text>
          <text x="0" y="-73" fontSize="5" fontWeight="bold" textAnchor="middle" fill="#e4e4e7">3</text>
          <text x="0" y="-63" fontSize="5" fontWeight="bold" textAnchor="middle" fill="#e4e4e7">4</text>
          <text x="0" y="-53" fontSize="5" fontWeight="bold" textAnchor="middle" fill="#0c4a6e">5</text>
          <text x="0" y="-43" fontSize="5" fontWeight="bold" textAnchor="middle" fill="#0c4a6e">6</text>
          <text x="0" y="-33" fontSize="5" fontWeight="bold" textAnchor="middle" fill="#450a0a">7</text>
          <text x="0" y="-23" fontSize="5" fontWeight="bold" textAnchor="middle" fill="#450a0a">8</text>
          <text x="0" y="-13" fontSize="4.5" fontWeight="bold" textAnchor="middle" fill="#78350f">9</text>
          <text x="0" y="-6.5" fontSize="3.5" fontWeight="extrabold" textAnchor="middle" fill="#78350f">10</text>

          {/* Overlaid lighting glare */}
          <circle cx="0" cy="0" r="100" fill="url(#targetLighting)" pointerEvents="none" />

          {/* Plotted Arrow Hit Pins */}
          {plottedArrows.map((plot, idx) => {
            const cx = plot.relX * 100;
            const cy = plot.relY * 100;
            return (
              <g key={idx} className="transition-all transform">
                {/* Outer shadow / ring */}
                <circle cx={cx} cy={cy} r="4" fill="#090d16" stroke="#fbbf24" strokeWidth="1" />
                {/* Inner dot */}
                <circle cx={cx} cy={cy} r="2.8" fill="#18181b" />
                {/* Arrow number label */}
                <text
                  x={cx}
                  y={cy + 1.2}
                  fontSize="3"
                  fontWeight="black"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontFamily="monospace"
                >
                  {plot.id || idx + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Outer Ring Labels */}
        <div className="absolute top-2 left-2 text-[9px] font-mono text-neutral-500 font-bold">
          WA TARGET 122cm
        </div>
      </div>

      {/* Target Legend Bar */}
      <div className="flex items-center justify-between w-full px-2 text-[11px] text-neutral-400">
        <span className="font-mono">
          Panah: <strong className="text-white">{arrows.length}</strong>/{maxArrows}
        </span>
        {onClearPlot && plottedArrows.length > 0 && (
          <button
            type="button"
            onClick={onClearPlot}
            className="text-[10px] text-neutral-400 hover:text-red-400 flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3 h-3" />
            Hapus Plot
          </button>
        )}
      </div>
    </div>
  );
};
