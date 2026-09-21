import React, { useState } from 'react';
import { 
  GitBranch, 
  Trophy, 
  Crown, 
  Play, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Radio
} from 'lucide-react';
import { EliminationMatch, Category, ArcheryEvent } from '../../types';
import { BroadcastArenaOverlay } from '../tournament/BroadcastArenaOverlay';

interface EliminationBracketProps {
  event: ArcheryEvent | null;
  category: Category | null;
  matches: EliminationMatch[];
  onGenerateBracket: () => void;
  onSelectMatchToScore: (matchId: string) => void;
}

export const EliminationBracket: React.FC<EliminationBracketProps> = ({
  event,
  category,
  matches,
  onGenerateBracket,
  onSelectMatchToScore
}) => {
  const [broadcastMatch, setBroadcastMatch] = useState<EliminationMatch | null>(null);
  const currentCategoryMatches = matches.filter(m => !category || m.categoryId === category.id);

  // Group matches by round
  const qfMatches = currentCategoryMatches.filter(m => m.roundName === 'Perempat Final');
  const sfMatches = currentCategoryMatches.filter(m => m.roundName === 'Semifinal');
  const bronzeMatch = currentCategoryMatches.find(m => m.isBronzeFinal || m.roundName === 'Perebutan Medali Perunggu');
  const goldMatch = currentCategoryMatches.find(m => m.isGoldFinal || m.roundName === 'Final Perebutan Emas');

  const renderMatchCard = (match: EliminationMatch) => {
    const isCompleted = match.status === 'COMPLETED';
    const isLive = match.status === 'LIVE';

    return (
      <div 
        key={match.id}
        id={`bracket-match-${match.id}`}
        className={`w-72 bg-neutral-900 rounded-xl border-2 transition overflow-hidden shadow-lg ${
          isLive 
            ? 'border-amber-500 shadow-amber-500/10' 
            : isCompleted 
            ? 'border-neutral-700' 
            : 'border-neutral-800'
        }`}
      >
        {/* Match Header */}
        <div className="bg-neutral-950 px-3 py-1.5 border-b border-neutral-800 flex items-center justify-between text-[11px]">
          <span className="font-semibold text-neutral-400">Match #{match.matchNumber}</span>
          <div className="flex items-center space-x-1">
            {isLive && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold animate-pulse">
                LIVE
              </span>
            )}
            <span className="text-neutral-500 text-[10px] truncate max-w-[120px]">
              {match.targetLine || 'Bantalan TBD'}
            </span>
          </div>
        </div>

        {/* Archer A row */}
        <div className={`p-2.5 flex items-center justify-between text-xs border-b border-neutral-800/60 ${
          match.winnerId && match.winnerId === match.athleteA?.registrationId 
            ? 'bg-amber-500/10 font-bold' 
            : ''
        }`}>
          <div className="flex items-center space-x-2 truncate">
            <span className="w-5 h-5 rounded bg-neutral-800 text-neutral-400 font-mono text-[10px] flex items-center justify-center shrink-0">
              {match.athleteA?.seed || '?'}
            </span>
            <div className="truncate">
              <p className="text-white truncate font-medium">
                {match.athleteA?.athleteName || 'BYE / TBD'}
              </p>
              <p className="text-[10px] text-neutral-500 truncate">{match.athleteA?.contingentName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0 pl-2">
            {match.winnerId === match.athleteA?.registrationId && (
              <Crown className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="font-mono text-sm font-black text-amber-400">
              {match.eliminationType === 'SET_SYSTEM' ? match.setPointsA : match.totalScoreA}
            </span>
          </div>
        </div>

        {/* Archer B row */}
        <div className={`p-2.5 flex items-center justify-between text-xs ${
          match.winnerId && match.winnerId === match.athleteB?.registrationId 
            ? 'bg-amber-500/10 font-bold' 
            : ''
        }`}>
          <div className="flex items-center space-x-2 truncate">
            <span className="w-5 h-5 rounded bg-neutral-800 text-neutral-400 font-mono text-[10px] flex items-center justify-center shrink-0">
              {match.athleteB?.seed || '?'}
            </span>
            <div className="truncate">
              <p className="text-white truncate font-medium">
                {match.athleteB?.athleteName || 'BYE / TBD'}
              </p>
              <p className="text-[10px] text-neutral-500 truncate">{match.athleteB?.contingentName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0 pl-2">
            {match.winnerId === match.athleteB?.registrationId && (
              <Crown className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="font-mono text-sm font-black text-cyan-400">
              {match.eliminationType === 'SET_SYSTEM' ? match.setPointsB : match.totalScoreB}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-2 bg-neutral-950/60 border-t border-neutral-800/80 flex items-center gap-1.5">
          <button
            onClick={() => onSelectMatchToScore(match.id)}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-300 text-[11px] font-semibold transition flex items-center justify-center space-x-1"
          >
            <Play className="w-3 h-3" />
            <span>Skor Match</span>
          </button>
          <button
            type="button"
            onClick={() => setBroadcastMatch(match)}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-600 hover:text-white text-neutral-400 transition"
            title="Buka Layar Siaran TV Arena (Broadcast)"
          >
            <Radio className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Sistem Bagan Eliminasi Otomatis (Olympic Archery Tree)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Bagan Eliminasi: {category?.name || 'Kategori Terpilih'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Generator bagan eliminasi standar World Archery. Memetakan peringkat kualifikasi (Seed 1 vs Seed 8, 4 vs 5, 3 vs 6, 2 vs 7).
            </p>
          </div>

          <button
            id="btn-generate-bracket"
            onClick={onGenerateBracket}
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center space-x-2 transform active:scale-95 whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate Bracket Dari Kualifikasi</span>
          </button>
        </div>
      </div>

      {/* Visual Tournament Tree */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 shadow-2xl overflow-x-auto">
        <div className="min-w-[950px] flex items-stretch justify-between space-x-8 py-4">
          {/* Round 1: Perempat Final (Quarterfinals) */}
          <div className="space-y-6 flex flex-col justify-around">
            <div className="border-b border-neutral-800 pb-2">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                Perempat Final (Quarterfinals)
              </h4>
              <span className="text-[10px] text-neutral-500">4 Match Eliminasi</span>
            </div>
            {qfMatches.length > 0 ? (
              qfMatches.map(renderMatchCard)
            ) : (
              <div className="w-72 p-6 rounded-xl border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
                Belum di-generate
              </div>
            )}
          </div>

          {/* Round 2: Semifinal */}
          <div className="space-y-6 flex flex-col justify-around">
            <div className="border-b border-neutral-800 pb-2">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-cyan-400">
                Semifinal
              </h4>
              <span className="text-[10px] text-neutral-500">2 Match Perebutan Tiket Final</span>
            </div>
            {sfMatches.length > 0 ? (
              sfMatches.map(renderMatchCard)
            ) : (
              <div className="w-72 p-6 rounded-xl border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
                Menunggu babak perempat final
              </div>
            )}
          </div>

          {/* Round 3: Medal Matches (Bronze & Gold) */}
          <div className="space-y-8 flex flex-col justify-center">
            {/* Gold Medal Match */}
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 border-b border-neutral-800 pb-1 text-xs">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="font-extrabold text-amber-400 uppercase tracking-wider">
                  Final Perebutan Medali Emas
                </span>
              </div>
              {goldMatch ? (
                renderMatchCard(goldMatch)
              ) : (
                <div className="w-72 p-6 rounded-xl border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
                  Menunggu pemenang semifinal
                </div>
              )}
            </div>

            {/* Bronze Medal Match */}
            <div className="space-y-2">
              <div className="flex items-center space-x-1.5 border-b border-neutral-800 pb-1 text-xs">
                <Trophy className="w-4 h-4 text-amber-700" />
                <span className="font-extrabold text-amber-600 uppercase tracking-wider">
                  Perebutan Medali Perunggu
                </span>
              </div>
              {bronzeMatch ? (
                renderMatchCard(bronzeMatch)
              ) : (
                <div className="w-72 p-6 rounded-xl border border-dashed border-neutral-800 text-center text-xs text-neutral-500">
                  Menunggu perebutan perunggu
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Live Match Overlay */}
      {broadcastMatch && (
        <BroadcastArenaOverlay
          event={event}
          category={category}
          match={broadcastMatch}
          onClose={() => setBroadcastMatch(null)}
        />
      )}
    </div>
  );
};
