import React from 'react';
import { 
  Radio, 
  X, 
  Trophy, 
  Target, 
  Wind, 
  Crown, 
  ShieldCheck, 
  Clock, 
  Maximize2 
} from 'lucide-react';
import { EliminationMatch, Category, ArcheryEvent, ArrowScore } from '../../types';

interface BroadcastArenaOverlayProps {
  event: ArcheryEvent | null;
  category: Category | null;
  match: EliminationMatch | null;
  onClose: () => void;
}

export const BroadcastArenaOverlay: React.FC<BroadcastArenaOverlayProps> = ({
  event,
  category,
  match,
  onClose
}) => {
  if (!match) return null;

  const isSetSystem = match.eliminationType === 'SET_SYSTEM';

  const getArrowColorStyle = (score: ArrowScore) => {
    switch (score) {
      case 'X':
      case '10':
      case '9':
        return 'bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 border-amber-400 font-black';
      case '8':
      case '7':
        return 'bg-gradient-to-b from-red-500 to-red-700 text-white border-red-600 font-black';
      case '6':
      case '5':
        return 'bg-gradient-to-b from-sky-400 to-sky-600 text-white border-sky-500 font-black';
      case '4':
      case '3':
        return 'bg-gradient-to-b from-neutral-800 to-neutral-950 text-white border-neutral-700 font-bold';
      case '2':
      case '1':
        return 'bg-gradient-to-b from-neutral-100 to-neutral-200 text-neutral-900 border-neutral-300 font-bold';
      default:
        return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  // Get current active end
  const currentEnd = match.ends[match.ends.length - 1];

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200">
      {/* Top TV Broadcast Bar */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black tracking-widest uppercase animate-pulse">
            <Radio className="w-3.5 h-3.5" />
            <span>World Archery Live Feed</span>
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide uppercase">
              {event?.name || 'Kejurnas Panahan'}
            </h2>
            <p className="text-xs text-neutral-400">
              {category?.name || 'Recurve Men'} ({category?.distanceMeters}m) • {match.roundName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-800 text-xs">
            <Target className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-neutral-300">
              {match.targetLine || 'Target 12A vs 12B'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Stadium Arena Graphic (Olympic / World Cup Lower Third Layout) */}
      <div className="max-w-6xl w-full mx-auto my-auto space-y-6">
        {/* Round Badge Banner */}
        <div className="text-center space-y-1">
          <span className="px-4 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-extrabold tracking-widest uppercase">
            {match.isGoldFinal ? '★ GOLD MEDAL MATCH ★' : match.isBronzeFinal ? 'BRONZE MEDAL MATCH' : match.roundName}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {isSetSystem ? 'Set System (First to 6 Set Points)' : 'Cumulative Score (15 Arrows)'}
          </h1>
        </div>

        {/* Head-to-Head Split Scoreboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
          {/* ARCHER A (Left) */}
          <div className={`p-6 rounded-3xl bg-neutral-900 border-2 transition shadow-2xl relative overflow-hidden ${
            match.winnerId === match.athleteA?.registrationId 
              ? 'border-amber-500 bg-gradient-to-br from-neutral-900 via-neutral-900 to-amber-950/40' 
              : 'border-neutral-800'
          }`}>
            {/* Seed badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-xl bg-neutral-800 text-amber-400 font-mono font-black text-sm flex items-center justify-center border border-neutral-700 shadow">
                  #{match.athleteA?.seed || 1}
                </span>
                <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
                  Bantalan A
                </span>
              </div>
              {match.winnerId === match.athleteA?.registrationId && (
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500 text-neutral-950 font-black text-xs">
                  <Crown className="w-3.5 h-3.5" />
                  <span>PEMENANG</span>
                </div>
              )}
            </div>

            {/* Archer Profile */}
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">
                {match.athleteA?.athleteName || 'Archer A'}
              </h3>
              <p className="text-sm font-semibold text-neutral-400 truncate">
                {match.athleteA?.contingentName || 'Klub Panahan'}
              </p>
            </div>

            {/* Big Match Score Display */}
            <div className="mt-6 pt-6 border-t border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-neutral-400 block">
                  {isSetSystem ? 'Set Points' : 'Total Score'}
                </span>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono text-5xl sm:text-6xl font-black text-amber-400 tracking-tight">
                    {isSetSystem ? match.setPointsA : match.totalScoreA}
                  </span>
                  {isSetSystem && (
                    <span className="text-xl font-bold text-neutral-500">/ 6</span>
                  )}
                </div>
              </div>

              {/* Set points pips (circles) */}
              {isSetSystem && (
                <div className="flex space-x-2">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div 
                      key={idx}
                      className={`w-4 h-4 rounded-full border-2 transition ${
                        idx < match.setPointsA 
                          ? 'bg-amber-400 border-amber-400 shadow-md shadow-amber-400/50' 
                          : 'bg-neutral-950 border-neutral-700'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Current End Arrow Scores */}
            <div className="mt-6 pt-4 border-t border-neutral-800/60">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span>Panah Seri Ini (End):</span>
                <span className="font-bold text-white">
                  Skor Seri: {currentEnd?.scoreA ?? '-'}
                </span>
              </div>
              <div className="flex space-x-2">
                {(currentEnd?.arrowsA || ['10', '9', '9'] as ArrowScore[]).map((arr, i) => (
                  <div
                    key={i}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono text-xl border shadow ${getArrowColorStyle(arr)}`}
                  >
                    {arr}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ARCHER B (Right) */}
          <div className={`p-6 rounded-3xl bg-neutral-900 border-2 transition shadow-2xl relative overflow-hidden ${
            match.winnerId === match.athleteB?.registrationId 
              ? 'border-cyan-500 bg-gradient-to-br from-neutral-900 via-neutral-900 to-cyan-950/40' 
              : 'border-neutral-800'
          }`}>
            {/* Seed badge */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-xl bg-neutral-800 text-cyan-400 font-mono font-black text-sm flex items-center justify-center border border-neutral-700 shadow">
                  #{match.athleteB?.seed || 2}
                </span>
                <span className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
                  Bantalan B
                </span>
              </div>
              {match.winnerId === match.athleteB?.registrationId && (
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500 text-neutral-950 font-black text-xs">
                  <Crown className="w-3.5 h-3.5" />
                  <span>PEMENANG</span>
                </div>
              )}
            </div>

            {/* Archer Profile */}
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate">
                {match.athleteB?.athleteName || 'Archer B'}
              </h3>
              <p className="text-sm font-semibold text-neutral-400 truncate">
                {match.athleteB?.contingentName || 'Klub Panahan'}
              </p>
            </div>

            {/* Big Match Score Display */}
            <div className="mt-6 pt-6 border-t border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-neutral-400 block">
                  {isSetSystem ? 'Set Points' : 'Total Score'}
                </span>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono text-5xl sm:text-6xl font-black text-cyan-400 tracking-tight">
                    {isSetSystem ? match.setPointsB : match.totalScoreB}
                  </span>
                  {isSetSystem && (
                    <span className="text-xl font-bold text-neutral-500">/ 6</span>
                  )}
                </div>
              </div>

              {/* Set points pips (circles) */}
              {isSetSystem && (
                <div className="flex space-x-2">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div 
                      key={idx}
                      className={`w-4 h-4 rounded-full border-2 transition ${
                        idx < match.setPointsB 
                          ? 'bg-cyan-400 border-cyan-400 shadow-md shadow-cyan-400/50' 
                          : 'bg-neutral-950 border-neutral-700'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Current End Arrow Scores */}
            <div className="mt-6 pt-4 border-t border-neutral-800/60">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span>Panah Seri Ini (End):</span>
                <span className="font-bold text-white">
                  Skor Seri: {currentEnd?.scoreB ?? '-'}
                </span>
              </div>
              <div className="flex space-x-2">
                {(currentEnd?.arrowsB || ['9', '9', '8'] as ArrowScore[]).map((arr, i) => (
                  <div
                    key={i}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono text-xl border shadow ${getArrowColorStyle(arr)}`}
                  >
                    {arr}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Shoot-Off Notification Banner if tied */}
        {match.shootOffA && match.shootOffB && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-neutral-900 to-red-950/80 border border-red-500 text-center space-y-1">
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-400">
              ★ TIE-BREAKER: 1-ARROW SHOOT-OFF RESULT ★
            </span>
            <div className="flex justify-center items-center space-x-8 font-mono text-xl font-black text-white">
              <span>Archer A: {match.shootOffA} ({match.shootOffDistanceA_mm ?? 15} mm)</span>
              <span className="text-red-400">VS</span>
              <span>Archer B: {match.shootOffB} ({match.shootOffDistanceB_mm ?? 18} mm)</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Ticker */}
      <div className="border-t border-neutral-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-2">
        <span>© World Archery Official Scoring Format • Ianseo Compatible Engine</span>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold transition"
        >
          Kembali ke Dashboard Lapangan
        </button>
      </div>
    </div>
  );
};
