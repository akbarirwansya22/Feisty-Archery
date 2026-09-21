import React, { useState } from 'react';
import { 
  Target, 
  CheckCircle2, 
  RotateCcw, 
  Save, 
  Lock, 
  Unlock, 
  Award, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  FileText,
  Crosshair,
  Grid
} from 'lucide-react';
import { 
  Registration, 
  Category, 
  ArrowScore, 
  QualificationEnd, 
  ArcheryEvent 
} from '../../types';
import { InteractiveTargetFace, PlottedArrow } from './InteractiveTargetFace';
import { OfficialFitaScorecardModal } from './OfficialFitaScorecardModal';
import { archeryAudio } from '../../utils/audioSignal';

interface QualificationScorerProps {
  event: ArcheryEvent | null;
  category: Category | null;
  registrations: Registration[];
  qualificationEnds: QualificationEnd[];
  onSaveEnd: (data: {
    registrationId: string;
    sessionNumber: number;
    endNumber: number;
    arrows: ArrowScore[];
    signedByReferee?: string;
  }) => void;
}

export const QualificationScorer: React.FC<QualificationScorerProps> = ({
  event,
  category,
  registrations,
  qualificationEnds,
  onSaveEnd
}) => {
  // Filter athletes verified in this category
  const verifiedAthletes = registrations.filter(
    r => (!category || r.categoryId === category.id) && r.status === 'VERIFIED'
  );

  const [selectedRegId, setSelectedRegId] = useState<string>(
    verifiedAthletes.length > 0 ? verifiedAthletes[0].id : ''
  );
  const [sessionNumber, setSessionNumber] = useState<number>(1);
  const [endNumber, setEndNumber] = useState<number>(1);
  const [arrows, setArrows] = useState<ArrowScore[]>([]);
  const [plottedArrows, setPlottedArrows] = useState<PlottedArrow[]>([]);
  const [inputMode, setInputMode] = useState<'KEYPAD' | 'TARGET' | 'BOTH'>('BOTH');
  const [isScorecardOpen, setIsScorecardOpen] = useState<boolean>(false);
  const [refereeName, setRefereeName] = useState<string>('Wasit Juri Nasional');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const maxArrows = category?.arrowsPerEnd || 6;
  const currentAthlete = verifiedAthletes.find(a => a.id === selectedRegId) || verifiedAthletes[0];

  // Load existing end data if already recorded
  React.useEffect(() => {
    if (!currentAthlete) return;
    const existing = qualificationEnds.find(
      e => e.registrationId === currentAthlete.id &&
           e.sessionNumber === sessionNumber &&
           e.endNumber === endNumber
    );

    if (existing) {
      setArrows([...existing.arrows]);
      // Generate pseudo-plots for existing arrows
      setPlottedArrows(existing.arrows.map((arr, idx) => {
        const angle = (idx * 60) * (Math.PI / 180);
        let dist = 0.5;
        if (arr === 'X') dist = 0.03;
        else if (arr === '10') dist = 0.08;
        else if (arr === '9') dist = 0.15;
        else if (arr === '8') dist = 0.25;
        else if (arr === '7') dist = 0.35;
        else if (arr === '6') dist = 0.45;
        else if (arr === '5') dist = 0.55;
        return {
          id: idx + 1,
          score: arr,
          relX: Math.cos(angle) * dist,
          relY: Math.sin(angle) * dist
        };
      }));
      setIsLocked(existing.isVerified);
      if (existing.signedByReferee) setRefereeName(existing.signedByReferee);
    } else {
      setArrows([]);
      setPlottedArrows([]);
      setIsLocked(false);
    }
  }, [currentAthlete, sessionNumber, endNumber, qualificationEnds]);

  // World Archery Official Color Palette for Buttons
  const getArrowStyle = (score: ArrowScore) => {
    switch (score) {
      case 'X':
      case '10':
      case '9':
        return 'bg-amber-400 hover:bg-amber-300 text-amber-950 font-black border-amber-500 shadow-amber-500/20';
      case '8':
      case '7':
        return 'bg-red-600 hover:bg-red-500 text-white font-black border-red-700 shadow-red-500/20';
      case '6':
      case '5':
        return 'bg-cyan-500 hover:bg-cyan-400 text-white font-black border-cyan-600 shadow-cyan-500/20';
      case '4':
      case '3':
        return 'bg-neutral-900 hover:bg-neutral-800 text-white font-bold border-neutral-700';
      case '2':
      case '1':
        return 'bg-neutral-100 hover:bg-white text-neutral-950 font-bold border-neutral-300';
      case 'M':
      default:
        return 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300 font-bold border-neutral-600';
    }
  };

  const getArrowNumericValue = (score: ArrowScore): number => {
    if (score === 'X' || score === '10') return 10;
    if (score === 'M') return 0;
    const n = parseInt(score, 10);
    return isNaN(n) ? 0 : n;
  };

  const handleInputArrow = (score: ArrowScore) => {
    if (isLocked) {
      alert('Seri ini telah dikunci/disahkan oleh Wasit. Buka kunci terlebih dahulu untuk merevisi nilai.');
      return;
    }
    if (arrows.length >= maxArrows) return;

    archeryAudio.playArrowChirp(score);
    const newArrows = [...arrows, score];
    setArrows(newArrows);

    // Calculate a standard plot position based on score ring
    const idx = arrows.length;
    const angle = (idx * 60) * (Math.PI / 180);
    let dist = 0.5;
    if (score === 'X') dist = 0.03;
    else if (score === '10') dist = 0.08;
    else if (score === '9') dist = 0.16;
    else if (score === '8') dist = 0.26;
    else if (score === '7') dist = 0.36;
    else if (score === '6') dist = 0.46;
    else if (score === '5') dist = 0.56;
    else if (score === '4') dist = 0.66;
    else if (score === '3') dist = 0.76;
    else if (score === '2') dist = 0.86;
    else if (score === '1') dist = 0.96;
    else if (score === 'M') dist = 1.05;

    setPlottedArrows(prev => [
      ...prev,
      {
        id: idx + 1,
        score,
        relX: Math.cos(angle) * dist,
        relY: Math.sin(angle) * dist
      }
    ]);
  };

  const handlePlotArrow = (score: ArrowScore, plot?: PlottedArrow) => {
    if (isLocked || arrows.length >= maxArrows) return;
    setArrows(prev => [...prev, score]);
    if (plot) {
      setPlottedArrows(prev => [...prev, plot]);
    }
  };

  const handleDeleteLastArrow = () => {
    if (isLocked || arrows.length === 0) return;
    setArrows(arrows.slice(0, -1));
    setPlottedArrows(plottedArrows.slice(0, -1));
  };

  const handleClearEnd = () => {
    if (isLocked) return;
    setArrows([]);
    setPlottedArrows([]);
  };

  // Calculations for current end
  const currentEndSum = arrows.reduce((sum, a) => sum + getArrowNumericValue(a), 0);
  const currentTensCount = arrows.filter(a => a === '10' || a === 'X').length;
  const currentXsCount = arrows.filter(a => a === 'X').length;

  // History ends for current athlete
  const athleteEnds = qualificationEnds.filter(e => e.registrationId === currentAthlete?.id);
  const totalAccumulated = athleteEnds.reduce((sum, e) => sum + e.endScore, 0);

  const handleSaveCurrentEnd = () => {
    if (!currentAthlete) {
      alert('Pilih pemanah terlebih dahulu');
      return;
    }
    if (arrows.length !== maxArrows) {
      if (!confirm(`Jumlah anak panah baru ${arrows.length} dari ${maxArrows}. Apakah Anda yakin ingin menyimpan seri ini?`)) {
        return;
      }
    }

    // World Archery rule: Arrow values are recorded in descending order
    const sortedArrows = [...arrows].sort((a, b) => {
      if (a === 'X' && b !== 'X') return -1;
      if (b === 'X' && a !== 'X') return 1;
      return getArrowNumericValue(b) - getArrowNumericValue(a);
    });

    onSaveEnd({
      registrationId: currentAthlete.id,
      sessionNumber,
      endNumber,
      arrows: sortedArrows,
      signedByReferee: refereeName
    });

    setIsLocked(true);
    setFeedback(`Seri ${endNumber} Sesi ${sessionNumber} berhasil disimpan & diverifikasi!`);
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Context */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Target className="w-3.5 h-3.5" />
              <span>Modul Skoring Kualifikasi (World Archery Standard)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Input Skor Kualifikasi Per-Seri (End)
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Papan tombol digital wasit/pemanah. Mendukung input nilai 10 sampai M, deteksi X, total akumulasi real-time, dan audit trail fair play.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsScorecardOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Kartu Skor Resmi (FITA)</span>
            </button>
            <div className="text-right pl-2 border-l border-neutral-800">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Akumulasi Skor Atlet:</span>
              <span className="text-2xl font-black text-amber-400">{totalAccumulated} Pts</span>
            </div>
          </div>
        </div>

        {/* Athlete and End Selector Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-neutral-800/80 text-xs">
          {/* Athlete select */}
          <div className="space-y-1">
            <label className="font-bold text-neutral-400">Pilih Atlet / Pemanah Terverifikasi:</label>
            <select
              id="select-scoring-athlete"
              value={selectedRegId}
              onChange={(e) => setSelectedRegId(e.target.value)}
              className="w-full p-2.5 bg-neutral-950 rounded-xl border border-neutral-700 text-white font-semibold focus:outline-none focus:border-amber-500"
            >
              {verifiedAthletes.map(a => (
                <option key={a.id} value={a.id}>
                  [{a.targetNumber || 'No Target'}] {a.athleteName} — {a.contingentName}
                </option>
              ))}
            </select>
          </div>

          {/* Session select */}
          <div className="space-y-1">
            <label className="font-bold text-neutral-400">Sesi Kualifikasi:</label>
            <div className="flex rounded-xl overflow-hidden border border-neutral-700 bg-neutral-950 p-1">
              <button
                type="button"
                onClick={() => setSessionNumber(1)}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${
                  sessionNumber === 1 ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sesi 1 (36 Panah)
              </button>
              <button
                type="button"
                onClick={() => setSessionNumber(2)}
                className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${
                  sessionNumber === 2 ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Sesi 2 (36 Panah)
              </button>
            </div>
          </div>

          {/* End Number select */}
          <div className="space-y-1">
            <label className="font-bold text-neutral-400">Pilih Seri (End 1 - 6):</label>
            <div className="flex space-x-1 bg-neutral-950 p-1 rounded-xl border border-neutral-700">
              {[1, 2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  id={`btn-end-${num}`}
                  type="button"
                  onClick={() => setEndNumber(num)}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${
                    endNumber === num ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Scorer Interface (Score Display & Target Keypad) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Score Sheet & Arrow Cells (7 Cols) */}
        <div className="lg:col-span-7 bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/30">
                  Target {currentAthlete?.targetNumber || '01A'}
                </span>
                <span className="font-bold text-white text-base">
                  {currentAthlete?.athleteName || 'Nama Atlet'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {currentAthlete?.contingentName} • Sesi {sessionNumber}, Seri ke-{endNumber}
              </p>
            </div>

            {/* Lock Status */}
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition border ${
                isLocked
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
              }`}
              title="Kunci status nilai untuk mencegah perubahan tidak sah"
            >
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isLocked ? 'Terkunci (Sah)' : 'Dapat Diedit'}</span>
            </button>
          </div>

          {/* Arrow Slots display */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
              <span>Slot Anak Panah ({arrows.length}/{maxArrows}):</span>
              <button
                type="button"
                onClick={handleClearEnd}
                disabled={isLocked || arrows.length === 0}
                className="text-neutral-500 hover:text-red-400 disabled:opacity-40 transition flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Seri</span>
              </button>
            </div>

            <div className="grid grid-cols-6 gap-2 sm:gap-3">
              {Array.from({ length: maxArrows }).map((_, idx) => {
                const arrow = arrows[idx];
                return (
                  <div
                    key={idx}
                    id={`arrow-slot-${idx + 1}`}
                    className={`h-16 sm:h-20 rounded-2xl flex flex-col items-center justify-center border-2 transition text-lg sm:text-2xl font-black ${
                      arrow
                        ? `${getArrowStyle(arrow)} border-opacity-80 scale-100`
                        : 'bg-neutral-950 border-neutral-800 text-neutral-700 border-dashed'
                    }`}
                  >
                    <span>{arrow || '-'}</span>
                    <span className="text-[10px] text-neutral-500 font-normal">#{idx + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* End Total & Tie-Break Counters */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-center">
            <div>
              <span className="text-[11px] text-neutral-400 uppercase font-semibold block">Total Seri Ini</span>
              <span className="text-2xl font-black text-amber-400">{currentEndSum}</span>
            </div>
            <div>
              <span className="text-[11px] text-neutral-400 uppercase font-semibold block">Jumlah 10 + X</span>
              <span className="text-2xl font-black text-white">{currentTensCount}</span>
            </div>
            <div>
              <span className="text-[11px] text-neutral-400 uppercase font-semibold block">Jumlah X (Pusat)</span>
              <span className="text-2xl font-black text-cyan-400">{currentXsCount}</span>
            </div>
          </div>

          {/* Referee Sign-off field */}
          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-neutral-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Validasi Wasit & Line Judge (Fair Play)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-neutral-500 block mb-1">Nama Wasit yang Mensahkan:</label>
                <input
                  type="text"
                  value={refereeName}
                  onChange={(e) => setRefereeName(e.target.value)}
                  className="w-full p-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white text-xs focus:outline-none"
                  placeholder="Nama Wasit Juri..."
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  id="btn-save-qualification-end"
                  onClick={handleSaveCurrentEnd}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center space-x-1.5 transform active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan & Sahkan Nilai</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive World Archery Target & Keypad (5 Cols) */}
        <div className="lg:col-span-5 bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm">
                Terminal Input World Archery
              </h3>
            </div>

            {/* View Switcher: Keypad vs Target Face */}
            <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setInputMode('KEYPAD')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  inputMode === 'KEYPAD' ? 'bg-amber-500 text-neutral-950 shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Keypad
              </button>
              <button
                type="button"
                onClick={() => setInputMode('TARGET')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  inputMode === 'TARGET' ? 'bg-amber-500 text-neutral-950 shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Plot Target
              </button>
              <button
                type="button"
                onClick={() => setInputMode('BOTH')}
                className={`px-2 py-1 rounded-lg transition ${
                  inputMode === 'BOTH' ? 'bg-amber-500 text-neutral-950 shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Dual
              </button>
            </div>
          </div>

          {/* Interactive Target Plotter (when mode is TARGET or BOTH) */}
          {(inputMode === 'TARGET' || inputMode === 'BOTH') && (
            <div className="py-2 flex justify-center border-b border-neutral-800/60">
              <InteractiveTargetFace
                arrows={arrows}
                maxArrows={maxArrows}
                plottedArrows={plottedArrows}
                onPlotArrow={handlePlotArrow}
                onClearPlot={() => setPlottedArrows([])}
                disabled={isLocked}
                sizePx={inputMode === 'BOTH' ? 240 : 290}
              />
            </div>
          )}

          {/* Keypad Grid (when mode is KEYPAD or BOTH) */}
          {(inputMode === 'KEYPAD' || inputMode === 'BOTH') && (
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 flex-1">
              {/* Gold / Yellow: X, 10, 9 */}
              {(['X', '10', '9'] as ArrowScore[]).map(val => (
                <button
                  key={val}
                  id={`keypad-${val}`}
                  type="button"
                  onClick={() => handleInputArrow(val)}
                  className={`h-12 sm:h-14 rounded-xl border text-lg sm:text-xl font-black shadow-md transition transform active:scale-95 flex items-center justify-center ${getArrowStyle(val)}`}
                >
                  {val}
                </button>
              ))}

              {/* Red: 8, 7 */}
              {(['8', '7'] as ArrowScore[]).map(val => (
                <button
                  key={val}
                  id={`keypad-${val}`}
                  type="button"
                  onClick={() => handleInputArrow(val)}
                  className={`h-12 sm:h-14 rounded-xl border text-lg sm:text-xl font-black shadow-md transition transform active:scale-95 flex items-center justify-center ${getArrowStyle(val)}`}
                >
                  {val}
                </button>
              ))}

              {/* Blue: 6 */}
              <button
                id="keypad-6"
                type="button"
                onClick={() => handleInputArrow('6')}
                className={`h-12 sm:h-14 rounded-xl border text-lg sm:text-xl font-black shadow-md transition transform active:scale-95 flex items-center justify-center ${getArrowStyle('6')}`}
              >
                6
              </button>

              {/* Blue: 5 */}
              <button
                id="keypad-5"
                type="button"
                onClick={() => handleInputArrow('5')}
                className={`h-12 sm:h-14 rounded-xl border text-lg sm:text-xl font-black shadow-md transition transform active:scale-95 flex items-center justify-center ${getArrowStyle('5')}`}
              >
                5
              </button>

              {/* Black: 4, 3 */}
              {(['4', '3'] as ArrowScore[]).map(val => (
                <button
                  key={val}
                  id={`keypad-${val}`}
                  type="button"
                  onClick={() => handleInputArrow(val)}
                  className={`h-12 sm:h-14 rounded-xl border text-lg sm:text-xl font-black shadow-md transition transform active:scale-95 flex items-center justify-center ${getArrowStyle(val)}`}
                >
                  {val}
                </button>
              ))}

              {/* White: 2, 1 */}
              {(['2', '1'] as ArrowScore[]).map(val => (
                <button
                  key={val}
                  id={`keypad-${val}`}
                  type="button"
                  onClick={() => handleInputArrow(val)}
                  className={`h-12 sm:h-14 rounded-xl border text-lg sm:text-xl font-black shadow-md transition transform active:scale-95 flex items-center justify-center ${getArrowStyle(val)}`}
                >
                  {val}
                </button>
              ))}

              {/* Green / Gray: M (Miss) */}
              <button
                id="keypad-M"
                type="button"
                onClick={() => handleInputArrow('M')}
                className={`h-12 sm:h-14 rounded-xl border text-lg sm:text-xl font-black shadow-md transition transform active:scale-95 flex items-center justify-center ${getArrowStyle('M')}`}
                title="Miss (Panah keluar sasaran = 0 poin)"
              >
                M
              </button>
            </div>
          )}

          {/* Quick Corrections Bar */}
          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={handleDeleteLastArrow}
              disabled={isLocked || arrows.length === 0}
              className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs border border-neutral-700 transition"
            >
              ⌫ Hapus Terakhir
            </button>
            <button
              type="button"
              onClick={() => {
                if (endNumber < 6) setEndNumber(endNumber + 1);
              }}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-cyan-300 font-bold text-xs border border-neutral-700 transition flex items-center space-x-1"
            >
              <span>Seri Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Official World Archery Scoresheet Modal */}
      {isScorecardOpen && currentAthlete && (
        <OfficialFitaScorecardModal
          isOpen={isScorecardOpen}
          onClose={() => setIsScorecardOpen(false)}
          event={event}
          category={category}
          athlete={currentAthlete}
          qualificationEnds={qualificationEnds}
        />
      )}
    </div>
  );
};
