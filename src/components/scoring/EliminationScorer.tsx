import React, { useState } from 'react';
import { 
  Target, 
  Trophy, 
  Crown, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Swords, 
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Radio,
  Maximize2
} from 'lucide-react';
import { 
  EliminationMatch, 
  Category, 
  ArrowScore, 
  ArcheryEvent 
} from '../../types';
import { archeryAudio } from '../../utils/audioSignal';
import { BroadcastArenaOverlay } from '../tournament/BroadcastArenaOverlay';

interface EliminationScorerProps {
  event: ArcheryEvent | null;
  category: Category | null;
  matches: EliminationMatch[];
  selectedMatchId: string | null;
  onSelectMatch: (id: string) => void;
  onRecordSetEnd: (matchId: string, setNumber: number, arrowsA: ArrowScore[], arrowsB: ArrowScore[]) => void;
  onResolveShootOff: (matchId: string, shootOffA: ArrowScore, shootOffB: ArrowScore, distA?: number, distB?: number) => void;
}

export const EliminationScorer: React.FC<EliminationScorerProps> = ({
  event,
  category,
  matches,
  selectedMatchId,
  onSelectMatch,
  onRecordSetEnd,
  onResolveShootOff
}) => {
  const currentCategoryMatches = matches.filter(m => !category || m.categoryId === category.id);
  const activeMatch = currentCategoryMatches.find(m => m.id === selectedMatchId) || currentCategoryMatches[0];

  // Set number being edited (1 to 5)
  const [activeSetNum, setActiveSetNum] = useState<number>(1);
  const [arrowsA, setArrowsA] = useState<ArrowScore[]>([]);
  const [arrowsB, setArrowsB] = useState<ArrowScore[]>([]);
  const [activeArcherFocus, setActiveArcherFocus] = useState<'A' | 'B'>('A');
  const [showBroadcast, setShowBroadcast] = useState<boolean>(false);

  // Shoot-off states
  const [soArrowA, setSoArrowA] = useState<ArrowScore>('10');
  const [soArrowB, setSoArrowB] = useState<ArrowScore>('10');
  const [soDistA, setSoDistA] = useState<number>(15.2);
  const [soDistB, setSoDistB] = useState<number>(18.5);

  // Sync with current match set
  React.useEffect(() => {
    if (!activeMatch) return;
    const existingEnd = activeMatch.ends.find(e => e.setNumber === activeSetNum);
    if (existingEnd) {
      setArrowsA([...existingEnd.arrowsA]);
      setArrowsB([...existingEnd.arrowsB]);
    } else {
      setArrowsA([]);
      setArrowsB([]);
    }
  }, [activeMatch, activeSetNum]);

  const getArrowNumericValue = (score: ArrowScore): number => {
    if (score === 'X' || score === '10') return 10;
    if (score === 'M') return 0;
    const n = parseInt(score, 10);
    return isNaN(n) ? 0 : n;
  };

  const getArrowBadgeColor = (val: ArrowScore) => {
    if (val === 'X' || val === '10' || val === '9') return 'bg-amber-400 text-amber-950 border-amber-500 font-black';
    if (val === '8' || val === '7') return 'bg-red-600 text-white border-red-700 font-black';
    if (val === '6' || val === '5') return 'bg-cyan-500 text-white border-cyan-600 font-black';
    if (val === '4' || val === '3') return 'bg-neutral-900 text-white border-neutral-700 font-bold';
    if (val === '2' || val === '1') return 'bg-neutral-100 text-neutral-900 border-neutral-300 font-bold';
    return 'bg-neutral-700 text-neutral-300 border-neutral-600 font-bold';
  };

  const handleInputArrow = (score: ArrowScore) => {
    archeryAudio.playArrowChirp(score);
    if (activeArcherFocus === 'A') {
      if (arrowsA.length < 3) {
        const nextA = [...arrowsA, score];
        setArrowsA(nextA);
        if (nextA.length === 3 && arrowsB.length < 3) {
          setActiveArcherFocus('B');
        }
      }
    } else {
      if (arrowsB.length < 3) {
        const nextB = [...arrowsB, score];
        setArrowsB(nextB);
      }
    }
  };

  const scoreA = arrowsA.reduce((sum, a) => sum + getArrowNumericValue(a), 0);
  const scoreB = arrowsB.reduce((sum, b) => sum + getArrowNumericValue(b), 0);

  const handleSaveSet = () => {
    if (!activeMatch) return;
    if (arrowsA.length !== 3 || arrowsB.length !== 3) {
      if (!confirm('Jumlah panah belum lengkap (3 panah per atlet). Lanjutkan simpan seri ini?')) {
        return;
      }
    }

    onRecordSetEnd(activeMatch.id, activeSetNum, arrowsA, arrowsB);
    if (activeSetNum < 5) {
      setActiveSetNum(activeSetNum + 1);
      setActiveArcherFocus('A');
    }
  };

  // Detect if shoot-off is needed:
  // In Set System: after set 5 or earlier, score is tied 5 - 5
  const isSetSystemTie = activeMatch?.eliminationType === 'SET_SYSTEM' && 
                         activeMatch.setPointsA === 5 && 
                         activeMatch.setPointsB === 5;

  // In Compound: after 5 ends, total scores are equal
  const isCompoundTie = activeMatch?.eliminationType === 'CUMULATIVE_SCORE' && 
                        activeMatch.ends.length >= 5 && 
                        activeMatch.totalScoreA === activeMatch.totalScoreB && 
                        activeMatch.totalScoreA > 0;

  const requiresShootOff = isSetSystemTie || isCompoundTie;

  if (!activeMatch) {
    return (
      <div className="p-12 text-center text-neutral-500 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-4">
        <Swords className="w-12 h-12 mx-auto text-neutral-600" />
        <h3 className="text-base font-bold text-white">Belum Ada Pertandingan Eliminasi</h3>
        <p className="text-xs text-neutral-400">
          Silakan buka tab "Bagan Bracket Otomatis" dan klik "Generate Bracket dari Hasil Kualifikasi".
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top Match Bar Selector */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <Swords className="w-3.5 h-3.5" />
              <span>Modul Skoring Babak Eliminasi Head-to-Head</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Live Match Controller ({activeMatch.roundName})
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Format: <span className="font-bold text-amber-400">
                {activeMatch.eliminationType === 'SET_SYSTEM' ? 'Olympic Set System (First to 6 Set Points)' : 'Compound Total Score (5 Seri x 3 Panah)'}
              </span> • {activeMatch.targetLine || 'Bantalan Lapangan'}
            </p>
          </div>

          {/* Quick Match Switcher & Broadcast Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBroadcast(true)}
              className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition flex items-center gap-1.5 animate-pulse"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Layar TV Arena (Jumbotron)</span>
            </button>

            <div className="flex items-center space-x-1.5 pl-2 border-l border-neutral-800">
              <span className="text-xs text-neutral-400 font-medium">Pilih Match:</span>
              <select
                value={activeMatch.id}
                onChange={(e) => onSelectMatch(e.target.value)}
                className="p-2 bg-neutral-950 rounded-xl border border-neutral-700 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
              >
                {currentCategoryMatches.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.roundName} #{m.matchNumber}: {m.athleteA?.athleteName || 'BYE'} vs {m.athleteB?.athleteName || 'BYE'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Duel Scoreboard Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
          {/* Archer A Card (5 Cols) */}
          <div className={`md:col-span-5 p-5 rounded-2xl border-2 transition ${
            activeMatch.winnerId === activeMatch.athleteA?.registrationId
              ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10'
              : 'bg-neutral-950 border-neutral-800'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                  Seed #{activeMatch.athleteA?.seed || 1}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                  {activeMatch.athleteA?.athleteName || 'Pemanah A (TBD)'}
                </h3>
                <p className="text-xs text-neutral-400">{activeMatch.athleteA?.contingentName || 'Klub Panahan'}</p>
              </div>

              {activeMatch.winnerId === activeMatch.athleteA?.registrationId && (
                <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30">
                  <Crown className="w-4 h-4" />
                  <span>PEMENANG</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-neutral-500 uppercase font-semibold block">
                  {activeMatch.eliminationType === 'SET_SYSTEM' ? 'Set Points' : 'Total Score'}
                </span>
                <span className="text-4xl sm:text-5xl font-black text-amber-400">
                  {activeMatch.eliminationType === 'SET_SYSTEM' ? activeMatch.setPointsA : activeMatch.totalScoreA}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-500 block">Total Akumulasi Panah</span>
                <span className="text-sm font-bold text-neutral-300">{activeMatch.totalScoreA} Poin</span>
              </div>
            </div>
          </div>

          {/* VS & Match Status (1 Col) */}
          <div className="md:col-span-1 text-center flex flex-col items-center justify-center">
            <span className="text-xl font-black text-neutral-600">VS</span>
            <span className="text-[10px] uppercase font-bold text-neutral-400 mt-1">
              {activeMatch.status}
            </span>
          </div>

          {/* Archer B Card (5 Cols) */}
          <div className={`md:col-span-5 p-5 rounded-2xl border-2 transition ${
            activeMatch.winnerId === activeMatch.athleteB?.registrationId
              ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10'
              : 'bg-neutral-950 border-neutral-800'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                  Seed #{activeMatch.athleteB?.seed || 8}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                  {activeMatch.athleteB?.athleteName || 'Pemanah B (TBD)'}
                </h3>
                <p className="text-xs text-neutral-400">{activeMatch.athleteB?.contingentName || 'Klub Panahan'}</p>
              </div>

              {activeMatch.winnerId === activeMatch.athleteB?.registrationId && (
                <div className="flex items-center space-x-1 text-amber-400 text-xs font-bold bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30">
                  <Crown className="w-4 h-4" />
                  <span>PEMENANG</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-neutral-500 uppercase font-semibold block">
                  {activeMatch.eliminationType === 'SET_SYSTEM' ? 'Set Points' : 'Total Score'}
                </span>
                <span className="text-4xl sm:text-5xl font-black text-cyan-400">
                  {activeMatch.eliminationType === 'SET_SYSTEM' ? activeMatch.setPointsB : activeMatch.totalScoreB}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-500 block">Total Akumulasi Panah</span>
                <span className="text-sm font-bold text-neutral-300">{activeMatch.totalScoreB} Poin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shoot-Off Alert Banner if Tied */}
        {requiresShootOff && (
          <div className="mt-6 p-4 rounded-xl bg-amber-500/20 border-2 border-amber-500 text-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <div>
                <p className="text-sm font-bold text-amber-300">BABAK PENENTUAN: SATU PANAH SHOOT-OFF!</p>
                <p className="text-xs text-neutral-300">
                  Kedua pemanah imbang. Masing-masing melepaskan 1 anak panah. Nilai tertinggi (atau panah terdekat ke titik tengah dalam mm) menjadi pemenang.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <div className="flex items-center space-x-1">
                <span>Panah A:</span>
                <select 
                  value={soArrowA} 
                  onChange={(e) => setSoArrowA(e.target.value as ArrowScore)}
                  className="bg-neutral-900 p-1 rounded border border-neutral-700 text-white font-bold"
                >
                  {['X', '10', '9', '8', '7', 'M'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <input 
                  type="number" 
                  step="0.1" 
                  value={soDistA} 
                  onChange={(e) => setSoDistA(Number(e.target.value))} 
                  placeholder="Jarak mm" 
                  className="w-16 p-1 bg-neutral-900 rounded border border-neutral-700 text-white text-[11px]"
                  title="Jarak ke pusat (mm)"
                />
              </div>

              <div className="flex items-center space-x-1">
                <span>Panah B:</span>
                <select 
                  value={soArrowB} 
                  onChange={(e) => setSoArrowB(e.target.value as ArrowScore)}
                  className="bg-neutral-900 p-1 rounded border border-neutral-700 text-white font-bold"
                >
                  {['X', '10', '9', '8', '7', 'M'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <input 
                  type="number" 
                  step="0.1" 
                  value={soDistB} 
                  onChange={(e) => setSoDistB(Number(e.target.value))} 
                  placeholder="Jarak mm" 
                  className="w-16 p-1 bg-neutral-900 rounded border border-neutral-700 text-white text-[11px]"
                  title="Jarak ke pusat (mm)"
                />
              </div>

              <button
                onClick={() => onResolveShootOff(activeMatch.id, soArrowA, soArrowB, soDistA, soDistB)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg"
              >
                Sahkan Pemenang
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Set-by-Set Score Sheet */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="font-bold text-white text-sm">
            Riwayat 5 Seri Tembakan (Set 1 s/d Set 5)
          </h3>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map(setNum => (
              <button
                key={setNum}
                onClick={() => setActiveSetNum(setNum)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  activeSetNum === setNum
                    ? 'bg-amber-500 text-neutral-950 shadow-md'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                }`}
              >
                Set #{setNum}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Set Input */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
          {/* Archer A Set Input */}
          <div 
            onClick={() => setActiveArcherFocus('A')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition ${
              activeArcherFocus === 'A' ? 'border-amber-500 bg-amber-500/5' : 'border-neutral-800 bg-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">
                Panah {activeMatch.athleteA?.athleteName || 'Pemanah A'} (Set #{activeSetNum})
              </span>
              <span className="text-xs text-neutral-400">Skor Seri: <strong className="text-white text-sm">{scoreA}</strong></span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              {[0, 1, 2].map(idx => (
                <div 
                  key={idx}
                  className={`h-14 rounded-xl border flex items-center justify-center text-xl font-bold ${
                    arrowsA[idx] ? getArrowBadgeColor(arrowsA[idx]) : 'bg-neutral-950 border-neutral-700 text-neutral-600 border-dashed'
                  }`}
                >
                  {arrowsA[idx] || '-'}
                </div>
              ))}
            </div>
          </div>

          {/* Archer B Set Input */}
          <div 
            onClick={() => setActiveArcherFocus('B')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition ${
              activeArcherFocus === 'B' ? 'border-cyan-500 bg-cyan-500/5' : 'border-neutral-800 bg-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400">
                Panah {activeMatch.athleteB?.athleteName || 'Pemanah B'} (Set #{activeSetNum})
              </span>
              <span className="text-xs text-neutral-400">Skor Seri: <strong className="text-white text-sm">{scoreB}</strong></span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              {[0, 1, 2].map(idx => (
                <div 
                  key={idx}
                  className={`h-14 rounded-xl border flex items-center justify-center text-xl font-bold ${
                    arrowsB[idx] ? getArrowBadgeColor(arrowsB[idx]) : 'bg-neutral-950 border-neutral-700 text-neutral-600 border-dashed'
                  }`}
                >
                  {arrowsB[idx] || '-'}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mini Keypad for Fast Input */}
        <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>
              Sedang mengisi panah: <strong className={activeArcherFocus === 'A' ? 'text-amber-400' : 'text-cyan-400'}>
                {activeArcherFocus === 'A' ? activeMatch.athleteA?.athleteName : activeMatch.athleteB?.athleteName}
              </strong>
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  if (activeArcherFocus === 'A') setArrowsA([]);
                  else setArrowsB([]);
                }}
                className="text-neutral-500 hover:text-red-400 transition"
              >
                Reset Panah
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['X', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M'] as ArrowScore[]).map(val => (
              <button
                key={val}
                type="button"
                onClick={() => handleInputArrow(val)}
                className={`w-12 h-12 rounded-xl border text-lg font-black transition transform active:scale-95 flex items-center justify-center ${getArrowBadgeColor(val)}`}
              >
                {val}
              </button>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              id="btn-save-elimination-end"
              type="button"
              onClick={handleSaveSet}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs shadow-md transition"
            >
              Simpan Seri #{activeSetNum} & Hitung Poin
            </button>
          </div>
        </div>
      </div>

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
