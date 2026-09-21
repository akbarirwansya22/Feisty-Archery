import React, { useState, useRef } from 'react';
import { 
  Printer, 
  Download, 
  Target, 
  Sliders, 
  Info, 
  FileText, 
  RotateCcw, 
  Check, 
  Sparkles, 
  HelpCircle,
  Eye,
  Maximize2,
  ZoomIn,
  Ruler,
  Compass,
  Layers,
  Calculator,
  ChevronRight,
  ShieldAlert,
  Award
} from 'lucide-react';
import { ArcheryEvent, Category } from '../../types';

export type TargetPreset = 
  | 'WA_122_FULL' 
  | 'WA_122_CENTER'
  | 'WA_80_6RING' 
  | 'WA_80_FULL' 
  | 'WA_40_SINGLE' 
  | 'WA_40_TRIPLE_VERT' 
  | 'WA_40_VEGAS'
  | 'BUTT_LAYOUT_4X80'
  | 'BUTT_LAYOUT_1X122';

interface PlottedArrow {
  id: number;
  x: number; // in mm relative to center (0,0)
  y: number;
  score: string;
  points: number;
  distanceMm: number;
}

interface TargetFaceStudioProps {
  event: ArcheryEvent | null;
  selectedCategory: Category | null;
}

export const TargetFaceStudio: React.FC<TargetFaceStudioProps> = ({
  event,
  selectedCategory
}) => {
  // Preset & Configuration States
  const [preset, setPreset] = useState<TargetPreset>('WA_80_6RING');
  const [paperSize, setPaperSize] = useState<'A4' | 'A3' | 'LETTER' | 'PLOTTER_100'>('A4');
  const [showRuler, setShowRuler] = useState<boolean>(true);
  const [showCrosshairs, setShowCrosshairs] = useState<boolean>(true);
  const [showNumbers, setShowNumbers] = useState<boolean>(true);
  const [numberAxes, setNumberAxes] = useState<'VERTICAL' | 'HORIZONTAL' | 'FOUR_AXIS'>('VERTICAL');
  const [compoundInnerTen, setCompoundInnerTen] = useState<boolean>(true);
  const [showEventWatermark, setShowEventWatermark] = useState<boolean>(true);
  const [showShaftGauge, setShowShaftGauge] = useState<boolean>(true);
  const [customTitle, setCustomTitle] = useState<string>(
    event ? `${event.name.toUpperCase()} - TARGET FACE RESMI` : 'LEMBAR SASARAN PANAHAN RESMI WORLD ARCHERY'
  );
  const [customSubtitle, setCustomSubtitle] = useState<string>(
    event 
      ? `${event.venueName.toUpperCase()} • ${event.city.toUpperCase()} • RESMI PERPANI` 
      : 'STANDAR FEDERASI PERPANI & WORLD ARCHERY'
  );

  // Interactive Arrow Plotting Simulator
  const [plottedArrows, setPlottedArrows] = useState<PlottedArrow[]>([]);
  const [activeTab, setActiveTab] = useState<'STUDIO' | 'LOGISTICS_CALC' | 'RULES_GUIDE'>('STUDIO');

  // Logistics Calculator State
  const [calcAthletes, setCalcAthletes] = useState<number>(64);
  const [calcArrowsPerAthlete, setCalcArrowsPerAthlete] = useState<number>(72);
  const [calcTargetLifespanArrows, setCalcTargetLifespanArrows] = useState<number>(36);
  const [calcSafetyBufferPercent, setCalcSafetyBufferPercent] = useState<number>(25);
  const [calcPricePerSheet, setCalcPricePerSheet] = useState<number>(25000);

  const printAreaRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Target Physical Ring Dimensions (Radius in mm from center)
  // World Archery Standard:
  // 122 cm Face: 10 rings each 61 mm wide. X-ring is 30.5 mm radius. 10-ring is 61 mm radius.
  // 80 cm Face: 10 rings each 40 mm wide. X-ring is 20 mm radius. 10-ring is 40 mm radius.
  // 40 cm Face: 10 rings each 20 mm wide. X-ring is 10 mm radius. 10-ring is 20 mm radius.

  const getRingDimensions = (targetType: '122' | '80' | '40') => {
    switch (targetType) {
      case '122':
        return {
          step: 61,
          xRadius: 30.5,
          totalRadius: 610,
          viewBoxSize: 1240,
        };
      case '80':
        return {
          step: 40,
          xRadius: 20,
          totalRadius: 400,
          viewBoxSize: 820,
        };
      case '40':
      default:
        return {
          step: 20,
          xRadius: 10,
          totalRadius: 200,
          viewBoxSize: 420,
        };
    }
  };

  // Color Palette standard World Archery
  const WA_COLORS = {
    GOLD_INNER: '#FFE500',  // 10 and X ring
    GOLD_OUTER: '#FFD700',  // 9 ring
    RED_INNER: '#FF2A2A',   // 8 ring
    RED_OUTER: '#E60000',   // 7 ring
    BLUE_INNER: '#0099FF',  // 6 ring
    BLUE_OUTER: '#0080E6',  // 5 ring
    BLACK_INNER: '#242424', // 4 ring
    BLACK_OUTER: '#141414', // 3 ring
    WHITE_INNER: '#FFFFFF', // 2 ring
    WHITE_OUTER: '#F4F4F4', // 1 ring
    DIVIDER_LINE: '#000000',
    WHITE_DIVIDER: '#FFFFFF',
  };

  // Calculate score from tapped coordinate on target face (x, y in mm)
  const calculateScoreFromCoordinate = (
    xMm: number, 
    yMm: number, 
    targetType: '122' | '80' | '40', 
    minRing: number = 1
  ): { score: string; points: number; distanceMm: number } => {
    const distanceMm = Math.sqrt(xMm * xMm + yMm * yMm);
    const { step, xRadius } = getRingDimensions(targetType);

    // Check X ring
    if (distanceMm <= xRadius) {
      return { score: 'X', points: 10, distanceMm: Math.round(distanceMm * 10) / 10 };
    }

    // Check rings 10 down to 1
    for (let ring = 10; ring >= 1; ring--) {
      const outerRadius = (11 - ring) * step;
      if (distanceMm <= outerRadius) {
        if (ring < minRing) {
          return { score: 'M', points: 0, distanceMm: Math.round(distanceMm * 10) / 10 };
        }
        return { score: ring.toString(), points: ring, distanceMm: Math.round(distanceMm * 10) / 10 };
      }
    }

    return { score: 'M', points: 0, distanceMm: Math.round(distanceMm * 10) / 10 };
  };

  // Handle click on target to plot an arrow
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>, targetType: '122' | '80' | '40', minRing: number = 1) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert click position to SVG viewBox coordinates
    const viewBox = svg.viewBox.baseVal;
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;

    const svgX = viewBox.x + clickX * scaleX;
    const svgY = viewBox.y + clickY * scaleY;

    // Target center is at (0, 0)
    const xMm = svgX;
    const yMm = svgY;

    const scoreResult = calculateScoreFromCoordinate(xMm, yMm, targetType, minRing);

    const newArrow: PlottedArrow = {
      id: plottedArrows.length + 1,
      x: Math.round(xMm * 10) / 10,
      y: Math.round(yMm * 10) / 10,
      score: scoreResult.score,
      points: scoreResult.points,
      distanceMm: scoreResult.distanceMm
    };

    setPlottedArrows([...plottedArrows, newArrow]);
  };

  // Direct Print PDF Handler
  const handlePrint = () => {
    window.print();
  };

  // Download Pure SVG File
  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `ArcheryHub-TargetFace-${preset}-${paperSize}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  // Download High-Resolution PNG (300 DPI equivalent)
  const handleDownloadPng = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URLObject = window.URL || window.webkitURL || window;
    const blobURL = URLObject.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      // Set high resolution (2400 x 2400 for crisp print quality)
      canvas.width = 2400;
      canvas.height = 2400;
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `ArcheryHub-TargetFace-${preset}-300DPI.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URLObject.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  };

  // Clear plotted arrows
  const handleClearArrows = () => {
    setPlottedArrows([]);
  };

  // Calculate logistics results
  const totalArrowsFired = calcAthletes * calcArrowsPerAthlete;
  const rawSheetsNeeded = Math.ceil(totalArrowsFired / calcTargetLifespanArrows);
  const bufferSheets = Math.ceil(rawSheetsNeeded * (calcSafetyBufferPercent / 100));
  const totalSheetsRequired = rawSheetsNeeded + bufferSheets;
  const estimatedCost = totalSheetsRequired * calcPricePerSheet;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Print Specific CSS to ensure vector isolation & exact A4/A3 layout */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #target-print-stage, #target-print-stage * {
            visibility: visible;
          }
          #target-print-stage {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: white !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Banner & Mode Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-red-600 to-amber-400 p-0.5 shadow-lg shadow-amber-500/20 flex-shrink-0">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
              <Target className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Studio Face Target & Cetak PDF Resmi
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                World Archery & PERPANI
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Generator sasaran panahan vektor presisi milimeter, penggaris kalibrasi cetak 1:1, plotting perkenaan panah, dan ekspor PDF siap cetak.
            </p>
          </div>
        </div>

        {/* Sub Navigation Modes */}
        <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => setActiveTab('STUDIO')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'STUDIO'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Studio & Cetak PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('LOGISTICS_CALC')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'LOGISTICS_CALC'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Kalkulator Kebutuhan</span>
          </button>

          <button
            onClick={() => setActiveTab('RULES_GUIDE')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'RULES_GUIDE'
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Panduan & Regulasi</span>
          </button>
        </div>
      </div>

      {activeTab === 'STUDIO' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Controls & Presets (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* 1. Target Preset Selector */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>Model & Standar Face Target</span>
                </label>
                <span className="text-[10px] text-amber-400 font-mono font-semibold">Resmi WA</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {[
                  {
                    id: 'WA_80_6RING',
                    name: '80 cm 6-Ring Center Spot',
                    desc: 'Standar Compound 50m (Ring 5–10 + Inner 10)',
                    tag: 'Compound 50m'
                  },
                  {
                    id: 'WA_122_CENTER',
                    name: '122 cm Center Spot (A4/A3 Print)',
                    desc: 'Latihan Recurve 70m / Barebow 50m (Ring 7–10 + X)',
                    tag: 'Recurve 70m'
                  },
                  {
                    id: 'WA_122_FULL',
                    name: '122 cm Full Face (10 Ring)',
                    desc: 'Skala penuh lembar utuh 1 s/d 10 + X (Plotter/Tile)',
                    tag: 'Recurve / Barebow'
                  },
                  {
                    id: 'WA_80_FULL',
                    name: '80 cm Full Face (10 Ring)',
                    desc: 'Standar Nasional PERPANI 50m/40m/30m',
                    tag: 'Standar Nasional'
                  },
                  {
                    id: 'WA_40_SINGLE',
                    name: '40 cm Single Spot Full Face',
                    desc: 'Indoor 18m Ring 1 s/d 10 + X (A3 / A4 Skala 100%)',
                    tag: 'Indoor 18m'
                  },
                  {
                    id: 'WA_40_TRIPLE_VERT',
                    name: '40 cm Vertical Triple Spot',
                    desc: 'World Archery Indoor resmi 3-Spot vertikal (6–10)',
                    tag: 'WA Indoor 3-Spot'
                  },
                  {
                    id: 'WA_40_VEGAS',
                    name: '40 cm Vegas Triangular 3-Spot',
                    desc: 'Pola segitiga Vegas Shoot (Target 1, 2, 3)',
                    tag: 'Vegas Shoot'
                  },
                  {
                    id: 'BUTT_LAYOUT_4X80',
                    name: 'Peta Bantalan 130 cm: 4x 80 cm',
                    desc: 'Tata letak 4 target atlet (Posisi A, B, C, D)',
                    tag: 'Layout Lapangan'
                  }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setPreset(item.id as TargetPreset);
                      setPlottedArrows([]);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                      preset === item.id
                        ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm'
                        : 'bg-neutral-950/60 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold leading-snug">{item.name}</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-amber-300 font-semibold">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{item.desc}</p>
                    </div>
                    {preset === item.id && (
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Paper & Precision Print Settings */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-lg space-y-4">
              <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Pengaturan Kertas & Kalibrasi Cetak</span>
              </label>

              {/* Paper Format */}
              <div>
                <span className="text-[11px] text-neutral-400 font-medium">Ukuran Lembar Kertas:</span>
                <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                  {(['A4', 'A3', 'LETTER', 'PLOTTER_100'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPaperSize(p)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                        paperSize === p
                          ? 'bg-amber-500 text-neutral-950 border-amber-500'
                          : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                      }`}
                    >
                      {p === 'PLOTTER_100' ? '1:1 Full' : p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-neutral-800 text-xs">
                {/* Calibration Ruler */}
                <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-neutral-800/50 transition">
                  <div className="flex items-center gap-2 text-neutral-300 font-medium">
                    <Ruler className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Penggaris Uji Kalibrasi 10 cm & 5 cm</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showRuler}
                    onChange={(e) => setShowRuler(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                {/* Center Crosshair */}
                <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-neutral-800/50 transition">
                  <div className="flex items-center gap-2 text-neutral-300 font-medium">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>Garis Silang Pusat (Crosshairs +)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showCrosshairs}
                    onChange={(e) => setShowCrosshairs(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                {/* Score Number Labels */}
                <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-neutral-800/50 transition">
                  <div className="flex items-center gap-2 text-neutral-300 font-medium">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Angka Nilai Cincin (Score Labels)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showNumbers}
                    onChange={(e) => setShowNumbers(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                {/* Compound Inner 10 Rule */}
                <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-neutral-800/50 transition">
                  <div className="flex items-center gap-2 text-neutral-300 font-medium">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tanda Khusus Compound Inner 10</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={compoundInnerTen}
                    onChange={(e) => setCompoundInnerTen(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                {/* Watermark Event Header */}
                <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-neutral-800/50 transition">
                  <div className="flex items-center gap-2 text-neutral-300 font-medium">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Header Identitas Event & Federasi</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showEventWatermark}
                    onChange={(e) => setShowEventWatermark(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>

                {/* Arrow Shaft Gauge (9.3mm WA Max check) */}
                <label className="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-neutral-800/50 transition">
                  <div className="flex items-center gap-2 text-neutral-300 font-medium">
                    <Info className="w-3.5 h-3.5 text-rose-400" />
                    <span>Uji Kaliber Panah (Max 9.3mm WA Gauge)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showShaftGauge}
                    onChange={(e) => setShowShaftGauge(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              {/* Title & Subtitle Customizer */}
              {showEventWatermark && (
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400">Judul Header Lembar:</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full mt-1 bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-400">Sub-judul / Venue & Federasi:</label>
                    <input
                      type="text"
                      value={customSubtitle}
                      onChange={(e) => setCustomSubtitle(e.target.value)}
                      className="w-full mt-1 bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Export Buttons */}
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-4 shadow-xl space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Cetak Langsung & Unduh Berkas</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  id="btn-print-target"
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / PDF</span>
                </button>

                <button
                  id="btn-download-svg"
                  onClick={handleDownloadSvg}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-neutral-800 hover:bg-neutral-750 text-white font-bold rounded-xl text-xs border border-neutral-700 transition"
                  title="Download format vektor SVG untuk percetakan digital banner/offset"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SVG Vektor</span>
                </button>

                <button
                  id="btn-download-png"
                  onClick={handleDownloadPng}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-neutral-800 hover:bg-neutral-750 text-white font-bold rounded-xl text-xs border border-neutral-700 transition"
                  title="Download resolusi tinggi 300 DPI PNG"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PNG 300 DPI</span>
                </button>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-200/90 leading-relaxed">
                <p className="font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Tips Cetak Skala 100% (Akurat Milimeter):
                </p>
                <p className="mt-0.5">
                  Pada dialog cetak browser, pilih opsi <strong className="text-amber-300">"Actual Size" / 100%</strong> (jangan pilih "Fit to printable area"). Periksa garis uji 10 cm dengan mistar penggaris fisik setelah dicetak.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Target Preview & Live Printable Sheet (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Sheet Toolbar & Arrow Plotting Status */}
            <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Pratinjau Lembar Cetak ({paperSize})</span>
                </span>
                <span className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded font-mono">
                  {preset.replace('WA_', '').replace('_', ' ')}
                </span>
              </div>

              {/* Arrow Plotting Summary */}
              <div className="flex items-center gap-3 text-xs">
                {plottedArrows.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 text-[11px]">
                      Panah Terplot: <strong className="text-white">{plottedArrows.length}</strong> | Total: <strong className="text-amber-400">{plottedArrows.reduce((acc, a) => acc + a.points, 0)} Poin</strong>
                    </span>
                    <button
                      onClick={handleClearArrows}
                      className="px-2 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-bold hover:bg-red-500/30 transition flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Panah
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-400 hidden sm:block">
                    💡 <em>Klik pada sasaran untuk simulasi tembakan & hitung skor otomatis.</em>
                  </p>
                )}
              </div>
            </div>

            {/* THE PRINTABLE SHEET CANVAS (Identical in Print & Preview) */}
            <div 
              ref={printAreaRef}
              id="target-print-stage"
              className="bg-white text-neutral-900 rounded-2xl shadow-2xl p-6 sm:p-8 border border-neutral-300 flex flex-col items-center justify-between relative overflow-hidden min-h-[640px]"
              style={{
                aspectRatio: paperSize === 'A4' ? '1 / 1.414' : paperSize === 'A3' ? '1 / 1.414' : '1 / 1.29'
              }}
            >
              {/* Event Watermark Header */}
              {showEventWatermark && (
                <div className="w-full flex items-center justify-between border-b-2 border-neutral-900 pb-3 mb-4">
                  <div className="text-left">
                    <h2 className="text-sm sm:text-base font-black tracking-tight text-neutral-900 uppercase">
                      {customTitle}
                    </h2>
                    <p className="text-[10px] sm:text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      {customSubtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-900 text-white px-2 py-0.5 rounded">
                        OFFICIAL TARGET FACE
                      </span>
                      <p className="text-[9px] text-neutral-500 font-mono mt-0.5">
                        STANDARD PERPANI / WA-SPEC
                      </p>
                    </div>
                    {/* Federation Emblem Representation */}
                    <div className="w-9 h-9 rounded-full border-2 border-neutral-900 flex items-center justify-center bg-neutral-50">
                      <Target className="w-5 h-5 text-neutral-900" />
                    </div>
                  </div>
                </div>
              )}

              {/* CENTER TARGET SVG RENDERING */}
              <div className="w-full flex-1 flex items-center justify-center p-2 relative">
                {/* 1. PRESET: WA 80 cm 6-Ring Center Spot */}
                {preset === 'WA_80_6RING' && (
                  <svg
                    ref={svgRef}
                    viewBox="-250 -250 500 500"
                    className="w-full max-w-[480px] max-h-[480px] cursor-crosshair drop-shadow-md select-none"
                    onClick={(e) => handleSvgClick(e, '80', 5)}
                  >
                    {/* Outer boundary background */}
                    <rect x="-250" y="-250" width="500" height="500" fill="#FFFFFF" />

                    {/* Ring 5 (Blue Outer) - Radius 240mm */}
                    <circle cx="0" cy="0" r="240" fill={WA_COLORS.BLUE_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    {/* Ring 6 (Blue Inner) - Radius 200mm */}
                    <circle cx="0" cy="0" r="200" fill={WA_COLORS.BLUE_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    {/* Ring 7 (Red Outer) - Radius 160mm */}
                    <circle cx="0" cy="0" r="160" fill={WA_COLORS.RED_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    {/* Ring 8 (Red Inner) - Radius 120mm */}
                    <circle cx="0" cy="0" r="120" fill={WA_COLORS.RED_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    {/* Ring 9 (Gold Outer) - Radius 80mm */}
                    <circle cx="0" cy="0" r="80" fill={WA_COLORS.GOLD_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    {/* Ring 10 (Gold Inner) - Radius 40mm */}
                    <circle cx="0" cy="0" r="40" fill={WA_COLORS.GOLD_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    {/* X-Ring (Center) - Radius 20mm */}
                    <circle cx="0" cy="0" r="20" fill="none" stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="0.8" strokeDasharray={compoundInnerTen ? 'none' : '2,2'} />

                    {/* Crosshairs (+) 4mm */}
                    {showCrosshairs && (
                      <g stroke="#000000" strokeWidth="1">
                        <line x1="-8" y1="0" x2="8" y2="0" />
                        <line x1="0" y1="-8" x2="0" y2="8" />
                      </g>
                    )}

                    {/* Number Labels */}
                    {showNumbers && (
                      <g fontSize="14" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central">
                        {/* Ring 5 */}
                        <text x="0" y="-220" fill="#FFFFFF">5</text>
                        <text x="0" y="220" fill="#FFFFFF">5</text>
                        {/* Ring 6 */}
                        <text x="0" y="-180" fill="#FFFFFF">6</text>
                        <text x="0" y="180" fill="#FFFFFF">6</text>
                        {/* Ring 7 */}
                        <text x="0" y="-140" fill="#FFFFFF">7</text>
                        <text x="0" y="140" fill="#FFFFFF">7</text>
                        {/* Ring 8 */}
                        <text x="0" y="-100" fill="#FFFFFF">8</text>
                        <text x="0" y="100" fill="#FFFFFF">8</text>
                        {/* Ring 9 */}
                        <text x="0" y="-60" fill="#000000">9</text>
                        <text x="0" y="60" fill="#000000">9</text>
                        {/* Ring 10 */}
                        <text x="0" y="-28" fill="#000000" fontSize="11">10</text>
                        <text x="0" y="28" fill="#000000" fontSize="11">10</text>
                        {/* X label */}
                        <text x="0" y="0" fill="#000000" fontSize="8">X</text>
                      </g>
                    )}

                    {/* Plotted Arrows */}
                    {plottedArrows.map((arrow) => (
                      <g key={arrow.id} transform={`translate(${arrow.x}, ${arrow.y})`}>
                        <circle cx="0" cy="0" r="4.65" fill="#111827" stroke="#FBBF24" strokeWidth="1.2" />
                        <circle cx="0" cy="0" r="1.5" fill="#EF4444" />
                        <text x="7" y="-5" fill="#111827" fontSize="10" fontWeight="black">
                          #{arrow.id} ({arrow.score})
                        </text>
                      </g>
                    ))}
                  </svg>
                )}

                {/* 2. PRESET: WA 122 cm Center Spot (Training Sheet 7-10+X) */}
                {preset === 'WA_122_CENTER' && (
                  <svg
                    ref={svgRef}
                    viewBox="-270 -270 540 540"
                    className="w-full max-w-[480px] max-h-[480px] cursor-crosshair drop-shadow-md select-none"
                    onClick={(e) => handleSvgClick(e, '122', 7)}
                  >
                    <rect x="-270" y="-270" width="540" height="540" fill="#FFFFFF" />

                    {/* Ring 7 (Red Outer) - Radius 244mm */}
                    <circle cx="0" cy="0" r="244" fill={WA_COLORS.RED_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    {/* Ring 8 (Red Inner) - Radius 183mm */}
                    <circle cx="0" cy="0" r="183" fill={WA_COLORS.RED_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    {/* Ring 9 (Gold Outer) - Radius 122mm */}
                    <circle cx="0" cy="0" r="122" fill={WA_COLORS.GOLD_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    {/* Ring 10 (Gold Inner) - Radius 61mm */}
                    <circle cx="0" cy="0" r="61" fill={WA_COLORS.GOLD_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    {/* X-Ring (Center) - Radius 30.5mm */}
                    <circle cx="0" cy="0" r="30.5" fill="none" stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="0.8" />

                    {/* Crosshairs */}
                    {showCrosshairs && (
                      <g stroke="#000000" strokeWidth="1">
                        <line x1="-10" y1="0" x2="10" y2="0" />
                        <line x1="0" y1="-10" x2="0" y2="10" />
                      </g>
                    )}

                    {/* Number Labels */}
                    {showNumbers && (
                      <g fontSize="15" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central">
                        <text x="0" y="-215" fill="#FFFFFF">7</text>
                        <text x="0" y="215" fill="#FFFFFF">7</text>
                        <text x="0" y="-153" fill="#FFFFFF">8</text>
                        <text x="0" y="153" fill="#FFFFFF">8</text>
                        <text x="0" y="-91" fill="#000000">9</text>
                        <text x="0" y="91" fill="#000000">9</text>
                        <text x="0" y="-45" fill="#000000" fontSize="12">10</text>
                        <text x="0" y="45" fill="#000000" fontSize="12">10</text>
                        <text x="0" y="0" fill="#000000" fontSize="9">X</text>
                      </g>
                    )}

                    {/* Plotted Arrows */}
                    {plottedArrows.map((arrow) => (
                      <g key={arrow.id} transform={`translate(${arrow.x}, ${arrow.y})`}>
                        <circle cx="0" cy="0" r="4.65" fill="#111827" stroke="#FBBF24" strokeWidth="1.2" />
                        <circle cx="0" cy="0" r="1.5" fill="#EF4444" />
                        <text x="7" y="-5" fill="#111827" fontSize="10" fontWeight="black">
                          #{arrow.id} ({arrow.score})
                        </text>
                      </g>
                    ))}
                  </svg>
                )}

                {/* 3. PRESET: WA 122 cm Full Face (1 to 10 Ring) */}
                {preset === 'WA_122_FULL' && (
                  <svg
                    ref={svgRef}
                    viewBox="-620 -620 1240 1240"
                    className="w-full max-w-[480px] max-h-[480px] cursor-crosshair drop-shadow-md select-none"
                    onClick={(e) => handleSvgClick(e, '122', 1)}
                  >
                    <rect x="-620" y="-620" width="1240" height="1240" fill="#FFFFFF" />

                    {/* Rings 1 & 2 (White) */}
                    <circle cx="0" cy="0" r="610" fill={WA_COLORS.WHITE_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="549" fill={WA_COLORS.WHITE_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1.5" />
                    {/* Rings 3 & 4 (Black) */}
                    <circle cx="0" cy="0" r="488" fill={WA_COLORS.BLACK_OUTER} stroke={WA_COLORS.WHITE_DIVIDER} strokeWidth="1" />
                    <circle cx="0" cy="0" r="427" fill={WA_COLORS.BLACK_INNER} stroke={WA_COLORS.WHITE_DIVIDER} strokeWidth="1" />
                    {/* Rings 5 & 6 (Blue) */}
                    <circle cx="0" cy="0" r="366" fill={WA_COLORS.BLUE_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="305" fill={WA_COLORS.BLUE_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1.5" />
                    {/* Rings 7 & 8 (Red) */}
                    <circle cx="0" cy="0" r="244" fill={WA_COLORS.RED_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="183" fill={WA_COLORS.RED_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1.5" />
                    {/* Rings 9 & 10 (Gold) */}
                    <circle cx="0" cy="0" r="122" fill={WA_COLORS.GOLD_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="61" fill={WA_COLORS.GOLD_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1.5" />
                    {/* X-Ring */}
                    <circle cx="0" cy="0" r="30.5" fill="none" stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />

                    {showCrosshairs && (
                      <g stroke="#000000" strokeWidth="1.5">
                        <line x1="-15" y1="0" x2="15" y2="0" />
                        <line x1="0" y1="-15" x2="0" y2="15" />
                      </g>
                    )}

                    {showNumbers && (
                      <g fontSize="28" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central">
                        <text x="0" y="-579" fill="#000000">1</text>
                        <text x="0" y="-518" fill="#000000">2</text>
                        <text x="0" y="-457" fill="#FFFFFF">3</text>
                        <text x="0" y="-396" fill="#FFFFFF">4</text>
                        <text x="0" y="-335" fill="#FFFFFF">5</text>
                        <text x="0" y="-274" fill="#FFFFFF">6</text>
                        <text x="0" y="-213" fill="#FFFFFF">7</text>
                        <text x="0" y="-152" fill="#FFFFFF">8</text>
                        <text x="0" y="-91" fill="#000000">9</text>
                        <text x="0" y="-45" fill="#000000" fontSize="20">10</text>
                      </g>
                    )}

                    {plottedArrows.map((arrow) => (
                      <g key={arrow.id} transform={`translate(${arrow.x}, ${arrow.y})`}>
                        <circle cx="0" cy="0" r="9" fill="#111827" stroke="#FBBF24" strokeWidth="2" />
                        <circle cx="0" cy="0" r="3" fill="#EF4444" />
                        <text x="14" y="-10" fill="#111827" fontSize="22" fontWeight="black">
                          #{arrow.id} ({arrow.score})
                        </text>
                      </g>
                    ))}
                  </svg>
                )}

                {/* 4. PRESET: WA 80 cm Full Face (1 to 10 Ring) */}
                {preset === 'WA_80_FULL' && (
                  <svg
                    ref={svgRef}
                    viewBox="-410 -410 820 820"
                    className="w-full max-w-[480px] max-h-[480px] cursor-crosshair drop-shadow-md select-none"
                    onClick={(e) => handleSvgClick(e, '80', 1)}
                  >
                    <rect x="-410" y="-410" width="820" height="820" fill="#FFFFFF" />

                    <circle cx="0" cy="0" r="400" fill={WA_COLORS.WHITE_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    <circle cx="0" cy="0" r="360" fill={WA_COLORS.WHITE_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    <circle cx="0" cy="0" r="320" fill={WA_COLORS.BLACK_OUTER} stroke={WA_COLORS.WHITE_DIVIDER} strokeWidth="1" />
                    <circle cx="0" cy="0" r="280" fill={WA_COLORS.BLACK_INNER} stroke={WA_COLORS.WHITE_DIVIDER} strokeWidth="1" />
                    <circle cx="0" cy="0" r="240" fill={WA_COLORS.BLUE_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    <circle cx="0" cy="0" r="200" fill={WA_COLORS.BLUE_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    <circle cx="0" cy="0" r="160" fill={WA_COLORS.RED_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    <circle cx="0" cy="0" r="120" fill={WA_COLORS.RED_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    <circle cx="0" cy="0" r="80" fill={WA_COLORS.GOLD_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    <circle cx="0" cy="0" r="40" fill={WA_COLORS.GOLD_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    <circle cx="0" cy="0" r="20" fill="none" stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="0.8" />

                    {showCrosshairs && (
                      <g stroke="#000000" strokeWidth="1">
                        <line x1="-10" y1="0" x2="10" y2="0" />
                        <line x1="0" y1="-10" x2="0" y2="10" />
                      </g>
                    )}

                    {showNumbers && (
                      <g fontSize="20" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central">
                        <text x="0" y="-380" fill="#000000">1</text>
                        <text x="0" y="-340" fill="#000000">2</text>
                        <text x="0" y="-300" fill="#FFFFFF">3</text>
                        <text x="0" y="-260" fill="#FFFFFF">4</text>
                        <text x="0" y="-220" fill="#FFFFFF">5</text>
                        <text x="0" y="-180" fill="#FFFFFF">6</text>
                        <text x="0" y="-140" fill="#FFFFFF">7</text>
                        <text x="0" y="-100" fill="#FFFFFF">8</text>
                        <text x="0" y="-60" fill="#000000">9</text>
                        <text x="0" y="-28" fill="#000000" fontSize="14">10</text>
                      </g>
                    )}

                    {plottedArrows.map((arrow) => (
                      <g key={arrow.id} transform={`translate(${arrow.x}, ${arrow.y})`}>
                        <circle cx="0" cy="0" r="6" fill="#111827" stroke="#FBBF24" strokeWidth="1.5" />
                        <circle cx="0" cy="0" r="2" fill="#EF4444" />
                        <text x="10" y="-7" fill="#111827" fontSize="14" fontWeight="black">
                          #{arrow.id} ({arrow.score})
                        </text>
                      </g>
                    ))}
                  </svg>
                )}

                {/* 5. PRESET: WA 40 cm Vertical Triple Spot (World Archery Indoor) */}
                {preset === 'WA_40_TRIPLE_VERT' && (
                  <svg
                    ref={svgRef}
                    viewBox="-120 -350 240 700"
                    className="w-full max-w-[280px] max-h-[500px] cursor-crosshair drop-shadow-md select-none"
                  >
                    <rect x="-120" y="-350" width="240" height="700" fill="#FFFFFF" />

                    {/* Target 1 (Top) at y = -220 */}
                    <g transform="translate(0, -220)">
                      <circle cx="0" cy="0" r="100" fill={WA_COLORS.BLUE_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="80" fill={WA_COLORS.RED_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="60" fill={WA_COLORS.RED_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="40" fill={WA_COLORS.GOLD_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="20" fill={WA_COLORS.GOLD_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="10" fill="none" stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="0.8" />
                      <line x1="-5" y1="0" x2="5" y2="0" stroke="#000" strokeWidth="0.8" />
                      <line x1="0" y1="-5" x2="0" y2="5" stroke="#000" strokeWidth="0.8" />
                      <text x="0" y="-108" fill="#111827" fontSize="12" fontWeight="black" textAnchor="middle">TARGET 1</text>
                    </g>

                    {/* Target 2 (Middle) at y = 0 */}
                    <g transform="translate(0, 0)">
                      <circle cx="0" cy="0" r="100" fill={WA_COLORS.BLUE_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="80" fill={WA_COLORS.RED_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="60" fill={WA_COLORS.RED_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="40" fill={WA_COLORS.GOLD_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="20" fill={WA_COLORS.GOLD_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="10" fill="none" stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="0.8" />
                      <line x1="-5" y1="0" x2="5" y2="0" stroke="#000" strokeWidth="0.8" />
                      <line x1="0" y1="-5" x2="0" y2="5" stroke="#000" strokeWidth="0.8" />
                      <text x="0" y="-108" fill="#111827" fontSize="12" fontWeight="black" textAnchor="middle">TARGET 2</text>
                    </g>

                    {/* Target 3 (Bottom) at y = 220 */}
                    <g transform="translate(0, 220)">
                      <circle cx="0" cy="0" r="100" fill={WA_COLORS.BLUE_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="80" fill={WA_COLORS.RED_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="60" fill={WA_COLORS.RED_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="40" fill={WA_COLORS.GOLD_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="20" fill={WA_COLORS.GOLD_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="10" fill="none" stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="0.8" />
                      <line x1="-5" y1="0" x2="5" y2="0" stroke="#000" strokeWidth="0.8" />
                      <line x1="0" y1="-5" x2="0" y2="5" stroke="#000" strokeWidth="0.8" />
                      <text x="0" y="-108" fill="#111827" fontSize="12" fontWeight="black" textAnchor="middle">TARGET 3</text>
                    </g>
                  </svg>
                )}

                {/* 6. PRESET: WA 40 cm Vegas Triangular 3-Spot */}
                {preset === 'WA_40_VEGAS' && (
                  <svg
                    ref={svgRef}
                    viewBox="-220 -220 440 440"
                    className="w-full max-w-[420px] max-h-[420px] cursor-crosshair drop-shadow-md select-none"
                  >
                    <rect x="-220" y="-220" width="440" height="440" fill="#FFFFFF" />

                    {/* Top Spot at (0, -100) */}
                    <g transform="translate(0, -95)">
                      <circle cx="0" cy="0" r="85" fill={WA_COLORS.BLUE_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="68" fill={WA_COLORS.RED_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="51" fill={WA_COLORS.RED_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="34" fill={WA_COLORS.GOLD_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="17" fill={WA_COLORS.GOLD_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="8.5" fill="none" stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="0.8" />
                      <line x1="-4" y1="0" x2="4" y2="0" stroke="#000" strokeWidth="0.8" />
                      <line x1="0" y1="-4" x2="0" y2="4" stroke="#000" strokeWidth="0.8" />
                      <text x="0" y="-90" fill="#111827" fontSize="11" fontWeight="black" textAnchor="middle">SPOT 1</text>
                    </g>

                    {/* Bottom Left Spot at (-100, 85) */}
                    <g transform="translate(-100, 85)">
                      <circle cx="0" cy="0" r="85" fill={WA_COLORS.BLUE_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="68" fill={WA_COLORS.RED_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="51" fill={WA_COLORS.RED_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="34" fill={WA_COLORS.GOLD_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="17" fill={WA_COLORS.GOLD_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="8.5" fill="none" stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="0.8" />
                      <line x1="-4" y1="0" x2="4" y2="0" stroke="#000" strokeWidth="0.8" />
                      <line x1="0" y1="-4" x2="0" y2="4" stroke="#000" strokeWidth="0.8" />
                      <text x="0" y="100" fill="#111827" fontSize="11" fontWeight="black" textAnchor="middle">SPOT 2</text>
                    </g>

                    {/* Bottom Right Spot at (100, 85) */}
                    <g transform="translate(100, 85)">
                      <circle cx="0" cy="0" r="85" fill={WA_COLORS.BLUE_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="68" fill={WA_COLORS.RED_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="51" fill={WA_COLORS.RED_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="34" fill={WA_COLORS.GOLD_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="17" fill={WA_COLORS.GOLD_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                      <circle cx="0" cy="0" r="8.5" fill="none" stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="0.8" />
                      <line x1="-4" y1="0" x2="4" y2="0" stroke="#000" strokeWidth="0.8" />
                      <line x1="0" y1="-4" x2="0" y2="4" stroke="#000" strokeWidth="0.8" />
                      <text x="0" y="100" fill="#111827" fontSize="11" fontWeight="black" textAnchor="middle">SPOT 3</text>
                    </g>
                  </svg>
                )}

                {/* 7. PRESET: WA 40 cm Single Spot Full Face */}
                {preset === 'WA_40_SINGLE' && (
                  <svg
                    ref={svgRef}
                    viewBox="-210 -210 420 420"
                    className="w-full max-w-[440px] max-h-[440px] cursor-crosshair drop-shadow-md select-none"
                    onClick={(e) => handleSvgClick(e, '40', 1)}
                  >
                    <rect x="-210" y="-210" width="420" height="420" fill="#FFFFFF" />

                    <circle cx="0" cy="0" r="200" fill={WA_COLORS.WHITE_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    <circle cx="0" cy="0" r="180" fill={WA_COLORS.WHITE_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    <circle cx="0" cy="0" r="160" fill={WA_COLORS.BLACK_OUTER} stroke={WA_COLORS.WHITE_DIVIDER} strokeWidth="1" />
                    <circle cx="0" cy="0" r="140" fill={WA_COLORS.BLACK_INNER} stroke={WA_COLORS.WHITE_DIVIDER} strokeWidth="1" />
                    <circle cx="0" cy="0" r="120" fill={WA_COLORS.BLUE_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    <circle cx="0" cy="0" r="100" fill={WA_COLORS.BLUE_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    <circle cx="0" cy="0" r="80" fill={WA_COLORS.RED_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    <circle cx="0" cy="0" r="60" fill={WA_COLORS.RED_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    <circle cx="0" cy="0" r="40" fill={WA_COLORS.GOLD_OUTER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    <circle cx="0" cy="0" r="20" fill={WA_COLORS.GOLD_INNER} stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="1" />
                    <circle cx="0" cy="0" r="10" fill="none" stroke={WA_COLORS.DIVIDER_LINE} strokeWidth="0.8" />

                    {showCrosshairs && (
                      <g stroke="#000000" strokeWidth="1">
                        <line x1="-5" y1="0" x2="5" y2="0" />
                        <line x1="0" y1="-5" x2="0" y2="5" />
                      </g>
                    )}

                    {showNumbers && (
                      <g fontSize="11" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle" dominantBaseline="central">
                        <text x="0" y="-190" fill="#000000">1</text>
                        <text x="0" y="-170" fill="#000000">2</text>
                        <text x="0" y="-150" fill="#FFFFFF">3</text>
                        <text x="0" y="-130" fill="#FFFFFF">4</text>
                        <text x="0" y="-110" fill="#FFFFFF">5</text>
                        <text x="0" y="-90" fill="#FFFFFF">6</text>
                        <text x="0" y="-70" fill="#FFFFFF">7</text>
                        <text x="0" y="-50" fill="#FFFFFF">8</text>
                        <text x="0" y="-30" fill="#000000">9</text>
                        <text x="0" y="-14" fill="#000000" fontSize="8">10</text>
                      </g>
                    )}

                    {plottedArrows.map((arrow) => (
                      <g key={arrow.id} transform={`translate(${arrow.x}, ${arrow.y})`}>
                        <circle cx="0" cy="0" r="3.5" fill="#111827" stroke="#FBBF24" strokeWidth="1" />
                        <circle cx="0" cy="0" r="1" fill="#EF4444" />
                        <text x="6" y="-4" fill="#111827" fontSize="8" fontWeight="black">
                          #{arrow.id} ({arrow.score})
                        </text>
                      </g>
                    ))}
                  </svg>
                )}

                {/* 8. PRESET: Peta Bantalan 130 cm (Layout 4x 80 cm: Posisi A, B, C, D) */}
                {preset === 'BUTT_LAYOUT_4X80' && (
                  <svg
                    ref={svgRef}
                    viewBox="-650 -650 1300 1300"
                    className="w-full max-w-[480px] max-h-[480px] drop-shadow-md select-none"
                  >
                    {/* The 130cm x 130cm straw/foam butt */}
                    <rect x="-650" y="-650" width="1300" height="1300" rx="30" fill="#D4AF37" stroke="#8A6818" strokeWidth="8" />
                    <rect x="-630" y="-630" width="1260" height="1260" rx="20" fill="#E8C768" stroke="#8A6818" strokeWidth="2" strokeDasharray="10,10" />

                    {/* Center measurement guidelines */}
                    <line x1="0" y1="-650" x2="0" y2="650" stroke="#8A6818" strokeWidth="2" strokeDasharray="6,6" opacity="0.4" />
                    <line x1="-650" y1="0" x2="650" y2="0" stroke="#8A6818" strokeWidth="2" strokeDasharray="6,6" opacity="0.4" />

                    {/* Target A (Top Left) at (-280, -280) */}
                    <g transform="translate(-280, -280)">
                      <circle cx="0" cy="0" r="230" fill={WA_COLORS.BLUE_OUTER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="190" fill={WA_COLORS.BLUE_INNER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="150" fill={WA_COLORS.RED_OUTER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="110" fill={WA_COLORS.RED_INNER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="70" fill={WA_COLORS.GOLD_OUTER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="35" fill={WA_COLORS.GOLD_INNER} stroke="#000" strokeWidth="2" />
                      <rect x="-40" y="-280" width="80" height="35" rx="8" fill="#1E3A8A" />
                      <text x="0" y="-256" fill="#FFF" fontSize="22" fontWeight="black" textAnchor="middle">TARGET A</text>
                    </g>

                    {/* Target B (Top Right) at (280, -280) */}
                    <g transform="translate(280, -280)">
                      <circle cx="0" cy="0" r="230" fill={WA_COLORS.BLUE_OUTER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="190" fill={WA_COLORS.BLUE_INNER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="150" fill={WA_COLORS.RED_OUTER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="110" fill={WA_COLORS.RED_INNER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="70" fill={WA_COLORS.GOLD_OUTER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="35" fill={WA_COLORS.GOLD_INNER} stroke="#000" strokeWidth="2" />
                      <rect x="-40" y="-280" width="80" height="35" rx="8" fill="#1E3A8A" />
                      <text x="0" y="-256" fill="#FFF" fontSize="22" fontWeight="black" textAnchor="middle">TARGET B</text>
                    </g>

                    {/* Target C (Bottom Left) at (-280, 280) */}
                    <g transform="translate(-280, 280)">
                      <circle cx="0" cy="0" r="230" fill={WA_COLORS.BLUE_OUTER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="190" fill={WA_COLORS.BLUE_INNER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="150" fill={WA_COLORS.RED_OUTER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="110" fill={WA_COLORS.RED_INNER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="70" fill={WA_COLORS.GOLD_OUTER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="35" fill={WA_COLORS.GOLD_INNER} stroke="#000" strokeWidth="2" />
                      <rect x="-40" y="245" width="80" height="35" rx="8" fill="#1E3A8A" />
                      <text x="0" y="269" fill="#FFF" fontSize="22" fontWeight="black" textAnchor="middle">TARGET C</text>
                    </g>

                    {/* Target D (Bottom Right) at (280, 280) */}
                    <g transform="translate(280, 280)">
                      <circle cx="0" cy="0" r="230" fill={WA_COLORS.BLUE_OUTER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="190" fill={WA_COLORS.BLUE_INNER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="150" fill={WA_COLORS.RED_OUTER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="110" fill={WA_COLORS.RED_INNER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="70" fill={WA_COLORS.GOLD_OUTER} stroke="#000" strokeWidth="2" />
                      <circle cx="0" cy="0" r="35" fill={WA_COLORS.GOLD_INNER} stroke="#000" strokeWidth="2" />
                      <rect x="-40" y="245" width="80" height="35" rx="8" fill="#1E3A8A" />
                      <text x="0" y="269" fill="#FFF" fontSize="22" fontWeight="black" textAnchor="middle">TARGET D</text>
                    </g>

                    {/* Butt Specification Badge */}
                    <rect x="-180" y="-35" width="360" height="70" rx="14" fill="#0F172A" stroke="#38BDF8" strokeWidth="3" />
                    <text x="0" y="-8" fill="#F8FAFC" fontSize="20" fontWeight="black" textAnchor="middle">BANTALAN BUSA 130 CM x 130 CM</text>
                    <text x="0" y="18" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle">STANDAR COMPOUND 50M (4 WAJAH 80CM)</text>
                  </svg>
                )}
              </div>

              {/* BOTTOM CALIBRATION & SPECIFICATION FOOTER (Essential for Accurate Physical Print) */}
              <div className="w-full border-t border-neutral-300 pt-3 mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-800">
                {/* 1. Precision 10 cm and 5 cm Calibration Ruler */}
                {showRuler && (
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-600">
                        UJI MISTAR KALIBRASI (100% SCALE):
                      </span>
                      {/* Physical 100mm (10cm) Bar rendered with millimeter ticks */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div 
                          className="h-4 border-2 border-neutral-900 bg-neutral-100 flex items-center justify-between px-1 relative"
                          style={{ width: '100mm' }}
                          title="Garis ini harus tepat berukuran 10 cm (100 mm) saat diukur dengan mistar fisik pada cetakan kertas."
                        >
                          <span className="text-[8px] font-mono font-black">0 cm</span>
                          <span className="text-[8px] font-mono font-bold text-neutral-500">5 cm</span>
                          <span className="text-[8px] font-mono font-black">10 cm</span>
                          {/* 5cm center tick mark */}
                          <div className="absolute left-1/2 -translate-x-1/2 h-full w-[1px] bg-neutral-900" />
                        </div>
                        <span className="text-[9px] font-semibold text-neutral-500">100 mm</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Arrow Shaft Gauge Indicator (Max 9.3mm WA rule) */}
                {showShaftGauge && (
                  <div className="flex items-center gap-2 bg-neutral-100 px-2.5 py-1.5 rounded-lg border border-neutral-300">
                    <div 
                      className="rounded-full border-2 border-red-600 bg-red-100 flex items-center justify-center flex-shrink-0"
                      style={{ width: '9.3mm', height: '9.3mm' }}
                      title="Diameter maksimum anak panah World Archery (9.3 mm / cal .366)"
                    >
                      <div className="w-1 h-1 bg-red-600 rounded-full" />
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-[9px] font-bold text-neutral-900">UJI MAKS. SHAFT 9.3 mm</p>
                      <p className="text-[8px] text-neutral-500">Batas kaliber World Archery</p>
                    </div>
                  </div>
                )}

                {/* 3. Official Print Verification Code */}
                <div className="text-right text-[8px] text-neutral-500 font-mono">
                  <p className="font-bold text-neutral-700">ARCHERYHUB WA-STD-2026</p>
                  <p>DISETUJUI PERPANI • VECTOR TRUE-SCALE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOGISTICS & TARGET SHEET DEMAND CALCULATOR */}
      {activeTab === 'LOGISTICS_CALC' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                Kalkulator Kebutuhan Logistik Face Target Kejuaraan
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Hitung estimasi jumlah lembar sasaran yang harus dibeli panitia berdasarkan peserta, jumlah anak panah, dan cadangan wasit.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-lg">
              Manajemen Logistik EO
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Field 1: Total Athletes */}
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400">Total Atlet Terdaftar:</label>
              <input
                type="number"
                min="1"
                value={calcAthletes}
                onChange={(e) => setCalcAthletes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-neutral-500">Semua divisi gabungan</span>
            </div>

            {/* Field 2: Arrows per Athlete */}
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400">Panah / Atlet (Total):</label>
              <input
                type="number"
                min="1"
                value={calcArrowsPerAthlete}
                onChange={(e) => setCalcArrowsPerAthlete(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-neutral-500">Kualifikasi (72) + Eliminasi</span>
            </div>

            {/* Field 3: Target Face Lifespan */}
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400">Daya Tahan Lembar:</label>
              <input
                type="number"
                min="1"
                value={calcTargetLifespanArrows}
                onChange={(e) => setCalcTargetLifespanArrows(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-neutral-500">Ganti tiap ~36 tembakan</span>
            </div>

            {/* Field 4: Safety Stock Buffer */}
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400">Cadangan Wasit (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={calcSafetyBufferPercent}
                onChange={(e) => setCalcSafetyBufferPercent(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-neutral-500">Hujan / sobekan panah</span>
            </div>

            {/* Field 5: Price per Sheet */}
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400">Harga / Lembar (Rp):</label>
              <input
                type="number"
                min="1000"
                step="5000"
                value={calcPricePerSheet}
                onChange={(e) => setCalcPricePerSheet(Math.max(1000, parseInt(e.target.value) || 1000))}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-neutral-500">Target reinforced paper</span>
            </div>
          </div>

          {/* Results Display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-xs text-neutral-400 font-medium">Total Tembakan Panah:</span>
              <p className="text-2xl font-black text-white mt-1">
                {totalArrowsFired.toLocaleString('id-ID')} <span className="text-xs text-neutral-500 font-normal">panah</span>
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">{calcAthletes} atlet × {calcArrowsPerAthlete} seri</p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
              <span className="text-xs text-neutral-400 font-medium">Kebutuhan Dasar Lembar:</span>
              <p className="text-2xl font-black text-cyan-400 mt-1">
                {rawSheetsNeeded} <span className="text-xs text-neutral-500 font-normal">lembar</span>
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">Sebelum buffer pengawas</p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <span className="text-xs text-amber-300 font-medium">Rekomendasi Pembelian (Total):</span>
              <p className="text-3xl font-black text-amber-400 mt-1">
                {totalSheetsRequired} <span className="text-sm font-semibold text-neutral-300">Lembar</span>
              </p>
              <p className="text-[11px] text-amber-200/80 mt-1">
                Termasuk cadangan {bufferSheets} lembar (+{calcSafetyBufferPercent}%)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-xs text-emerald-300 font-medium">Estimasi Biaya Pengadaan:</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                Rp {estimatedCost.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-emerald-200/80 mt-1">
                @ Rp {calcPricePerSheet.toLocaleString('id-ID')} / lembar
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WORLD ARCHERY & PERPANI RULES GUIDE */}
      {activeTab === 'RULES_GUIDE' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Target className="w-5 h-5" />
              <span>Regulasi Divisi Recurve (WA)</span>
            </div>
            <ul className="text-xs text-neutral-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span><strong>Jarak Standar:</strong> 70 Meter (Senior) & 60 Meter (U-18 Kadet).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span><strong>Ukuran Target:</strong> 122 cm Full Face (10 lingkaran konsentris, nilai 1 s/d 10 + X).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span><strong>Sistem Eliminasi:</strong> Menggunakan <em>Set System</em> (2 poin menang set, 1 poin seri, pertama meraih 6 poin memenangkan match).</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Award className="w-5 h-5" />
              <span>Regulasi Divisi Compound (WA)</span>
            </div>
            <ul className="text-xs text-neutral-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Jarak Standar:</strong> 50 Meter (Semua Kategori Umur).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Ukuran Target:</strong> 80 cm 6-Ring Reduced Face (Hanya nilai 5 s/d 10, menghemat ruang bantalan).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Aturan Inner 10:</strong> Di Compound, lingkaran X dihitung sebagai nilai 10. Lingkaran 10 luar dihitung nilai 9.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Sistem Eliminasi:</strong> Akumulasi skor total (Cumulative Score, 5 End x 3 panah = Max 150 Poin).</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Check className="w-5 h-5" />
              <span>Standar Nasional PERPANI</span>
            </div>
            <ul className="text-xs text-neutral-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Jarak Standar:</strong> 50m / 40m / 30m (divisi standar nasional busur kayu).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Ukuran Target:</strong> Umumnya menggunakan 80 cm Full Face (1 s/d 10 ring lengkap).</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Line Cutter:</strong> Bila mata panah menyentuh garis pembatas (*line cutter*), selalu dinilai ke skor yang lebih tinggi.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
