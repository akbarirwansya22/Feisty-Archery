import React, { useState } from 'react';
import { 
  Target, 
  Edit3, 
  GitBranch, 
  ShieldCheck, 
  Trophy, 
  Award, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { 
  ArcheryEvent, 
  Category, 
  Registration, 
  QualificationEnd, 
  EliminationMatch, 
  ArrowScore 
} from '../../types';
import { QualificationScorer } from './QualificationScorer';
import { EliminationScorer } from './EliminationScorer';
import { EliminationBracket } from '../brackets/EliminationBracket';
import { TournamentClockBar } from '../tournament/TournamentClockBar';
import { BroadcastArenaOverlay } from '../tournament/BroadcastArenaOverlay';

interface ScoringTeamDashboardProps {
  event: ArcheryEvent | null;
  category: Category | null;
  registrations: Registration[];
  qualificationEnds: QualificationEnd[];
  eliminationMatches: EliminationMatch[];
  selectedMatchId: string | null;
  onSelectMatch: (matchId: string) => void;
  onSaveQualificationEnd: (data: {
    registrationId: string;
    sessionNumber: number;
    endNumber: number;
    arrows: ArrowScore[];
    signedByReferee?: string;
  }) => Promise<void>;
  onRecordSetEnd: (
    matchId: string, 
    setNumber: number, 
    arrowsA: ArrowScore[], 
    arrowsB: ArrowScore[]
  ) => Promise<void>;
  onResolveShootOff: (
    matchId: string, 
    shootOffA: ArrowScore, 
    shootOffB: ArrowScore, 
    distA?: number, 
    distB?: number
  ) => Promise<void>;
  onGenerateBracket: () => Promise<void>;
}

export const ScoringTeamDashboard: React.FC<ScoringTeamDashboardProps> = ({
  event,
  category,
  registrations,
  qualificationEnds,
  eliminationMatches,
  selectedMatchId,
  onSelectMatch,
  onSaveQualificationEnd,
  onRecordSetEnd,
  onResolveShootOff,
  onGenerateBracket
}) => {
  const [subTab, setSubTab] = useState<'QUALIFICATION' | 'ELIMINATION' | 'BRACKET'>('QUALIFICATION');
  const [showClock, setShowClock] = useState<boolean>(true);
  const [showBroadcast, setShowBroadcast] = useState<boolean>(false);

  const activeMatch = eliminationMatches.find(m => m.id === selectedMatchId) || eliminationMatches[0];

  return (
    <div className="space-y-6">
      {/* Stadium Tournament Clock & Acoustic Whistle Bar */}
      {showClock && (
        <TournamentClockBar
          onToggleBroadcastView={() => setShowBroadcast(true)}
          isBroadcastActive={showBroadcast}
        />
      )}

      {/* Scoring Team Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-amber-500/20 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Dewan Wasit & Tim Scoring Lapangan
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                World Archery Rulebook Edition
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pusat Penilaian Skor Resmi (Fair Play Module)
            </h1>
            <p className="text-xs text-neutral-400 max-w-2xl">
              Gunakan tombol panah World Archery berstandar internasional, kunci skor per-seri dengan tanda tangan wasit, dan selesaikan aduan eliminasi / shoot-off tie breaker.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-neutral-950/80 rounded-xl border border-neutral-800 text-right">
              <span className="text-[10px] text-neutral-500 block uppercase font-bold">Kategori Aktif</span>
              <span className="text-xs font-bold text-amber-300">
                {category ? `${category.name} (${category.distanceMeters}m)` : 'Belum dipilih'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex space-x-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setSubTab('QUALIFICATION')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
            subTab === 'QUALIFICATION'
              ? 'bg-neutral-800 text-white border border-neutral-700 shadow'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Edit3 className="w-4 h-4 text-amber-400" />
          1. Input Skor Kualifikasi (Keypad WA)
        </button>

        <button
          onClick={() => setSubTab('ELIMINATION')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
            subTab === 'ELIMINATION'
              ? 'bg-neutral-800 text-white border border-neutral-700 shadow'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Target className="w-4 h-4 text-cyan-400" />
          2. Live Match Eliminasi & Shoot-Off
        </button>

        <button
          onClick={() => setSubTab('BRACKET')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
            subTab === 'BRACKET'
              ? 'bg-neutral-800 text-white border border-neutral-700 shadow'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <GitBranch className="w-4 h-4 text-emerald-400" />
          3. Bagan Bracket Otomatis
        </button>
      </div>

      {/* View Modules */}
      {subTab === 'QUALIFICATION' && (
        <QualificationScorer
          event={event}
          category={category}
          registrations={registrations}
          qualificationEnds={qualificationEnds}
          onSaveEnd={onSaveQualificationEnd}
        />
      )}

      {subTab === 'ELIMINATION' && (
        <EliminationScorer
          event={event}
          category={category}
          matches={eliminationMatches}
          selectedMatchId={selectedMatchId}
          onSelectMatch={onSelectMatch}
          onRecordSetEnd={onRecordSetEnd}
          onResolveShootOff={onResolveShootOff}
        />
      )}

      {subTab === 'BRACKET' && (
        <EliminationBracket
          event={event}
          category={category}
          matches={eliminationMatches}
          onGenerateBracket={onGenerateBracket}
          onSelectMatchToScore={(matchId) => {
            onSelectMatch(matchId);
            setSubTab('ELIMINATION');
          }}
        />
      )}

      {/* Broadcast Jumbotron Overlay */}
      {showBroadcast && activeMatch && (
        <BroadcastArenaOverlay
          event={event}
          category={category}
          match={activeMatch}
          onClose={() => setShowBroadcast(false)}
        />
      )}
    </div>
  );
};
