import React from 'react';
import { 
  X, 
  Printer, 
  Target, 
  ShieldCheck, 
  Award, 
  FileText,
  CheckCircle2
} from 'lucide-react';
import { 
  ArcheryEvent, 
  Category, 
  Registration, 
  QualificationEnd, 
  ArrowScore 
} from '../../types';

interface OfficialFitaScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: ArcheryEvent | null;
  category: Category | null;
  athlete: Registration | null;
  qualificationEnds: QualificationEnd[];
}

export const OfficialFitaScorecardModal: React.FC<OfficialFitaScorecardModalProps> = ({
  isOpen,
  onClose,
  event,
  category,
  athlete,
  qualificationEnds
}) => {
  if (!isOpen || !athlete) return null;

  const getArrowNumericValue = (score: ArrowScore): number => {
    if (score === 'X' || score === '10') return 10;
    if (score === 'M') return 0;
    const n = parseInt(score, 10);
    return isNaN(n) ? 0 : n;
  };

  // Ends for this athlete
  const athleteEnds = qualificationEnds.filter(e => e.registrationId === athlete.id);

  // Compute session 1 ends (ends 1-6)
  const session1Ends = Array.from({ length: 6 }).map((_, i) => {
    const found = athleteEnds.find(e => e.sessionNumber === 1 && e.endNumber === i + 1);
    return found || null;
  });

  // Compute session 2 ends (ends 1-6)
  const session2Ends = Array.from({ length: 6 }).map((_, i) => {
    const found = athleteEnds.find(e => e.sessionNumber === 2 && e.endNumber === i + 1);
    return found || null;
  });

  // Calculate cumulative and totals for Session 1
  let runningTotal1 = 0;
  let s1Score = 0;
  let s1Tens = 0;
  let s1Xs = 0;
  const s1Rows = session1Ends.map((end, idx) => {
    const arrows = end?.arrows || [];
    const endScore = end ? end.endScore : arrows.reduce((acc, a) => acc + getArrowNumericValue(a), 0);
    runningTotal1 += endScore;
    s1Score += endScore;
    const tens = arrows.filter(a => a === '10' || a === 'X').length;
    const xs = arrows.filter(a => a === 'X').length;
    s1Tens += tens;
    s1Xs += xs;
    return {
      endNum: idx + 1,
      arrows,
      endScore,
      runningTotal: runningTotal1,
      tens,
      xs,
      isVerified: end?.isVerified || false
    };
  });

  // Calculate cumulative and totals for Session 2
  let runningTotal2 = s1Score;
  let s2Score = 0;
  let s2Tens = 0;
  let s2Xs = 0;
  const s2Rows = session2Ends.map((end, idx) => {
    const arrows = end?.arrows || [];
    const endScore = end ? end.endScore : arrows.reduce((acc, a) => acc + getArrowNumericValue(a), 0);
    runningTotal2 += endScore;
    s2Score += endScore;
    const tens = arrows.filter(a => a === '10' || a === 'X').length;
    const xs = arrows.filter(a => a === 'X').length;
    s2Tens += tens;
    s2Xs += xs;
    return {
      endNum: idx + 1,
      arrows,
      endScore,
      runningTotal: runningTotal2,
      tens,
      xs,
      isVerified: end?.isVerified || false
    };
  });

  const grandTotal = s1Score + s2Score;
  const totalTens = s1Tens + s2Tens;
  const totalXs = s1Xs + s2Xs;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-6 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>World Archery Official Scoresheet</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">
                  FITA 720 ROUND
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Kartu Skor Resmi Kualifikasi Sesuai Regulasi World Archery & PB PERPANI
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Cetak / Print Scorecard</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Scorecard Container */}
        <div className="p-6 space-y-6 text-xs text-neutral-200">
          {/* Header Metadata Grid */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Nomor Bantalan</span>
              <span className="font-mono text-base font-black text-amber-400">
                {athlete.targetNumber || 'Target TBD'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Nama Pemanah</span>
              <span className="font-bold text-white text-sm truncate block">
                {athlete.athleteName}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Kontingen / Klub</span>
              <span className="text-neutral-300 font-medium truncate block">
                {athlete.contingentName}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase font-bold block">Divisi & Jarak</span>
              <span className="text-amber-300 font-semibold truncate block">
                {category ? `${category.name} (${category.distanceMeters}m)` : 'Recurve 70m'}
              </span>
            </div>
          </div>

          {/* Sesi 1 Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>Sesi 1 (Distance 1 — 36 Arrows)</span>
              </h3>
              <span className="font-mono text-xs font-bold text-neutral-400">
                Subtotal: <strong className="text-amber-400">{s1Score}</strong> / 360
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-neutral-800">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-neutral-950 text-neutral-400 text-[11px] font-bold border-b border-neutral-800">
                    <th className="py-2 px-3 text-left">End</th>
                    <th className="py-2 px-2">1</th>
                    <th className="py-2 px-2">2</th>
                    <th className="py-2 px-2">3</th>
                    <th className="py-2 px-2">4</th>
                    <th className="py-2 px-2">5</th>
                    <th className="py-2 px-2">6</th>
                    <th className="py-2 px-3 text-amber-400">Skor Seri</th>
                    <th className="py-2 px-3 text-white">Akumulasi</th>
                    <th className="py-2 px-2">10+X</th>
                    <th className="py-2 px-2">X</th>
                    <th className="py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 font-mono text-xs">
                  {s1Rows.map((r) => (
                    <tr key={r.endNum} className="hover:bg-neutral-850/50">
                      <td className="py-2 px-3 text-left font-bold text-neutral-400">{r.endNum}</td>
                      {[0, 1, 2, 3, 4, 5].map((aIdx) => (
                        <td key={aIdx} className="py-2 px-2 text-neutral-200">
                          {r.arrows[aIdx] || '-'}
                        </td>
                      ))}
                      <td className="py-2 px-3 font-black text-amber-400 bg-neutral-950/40">
                        {r.endScore || 0}
                      </td>
                      <td className="py-2 px-3 font-black text-white bg-neutral-950/60">
                        {r.runningTotal || 0}
                      </td>
                      <td className="py-2 px-2 text-neutral-300">{r.tens}</td>
                      <td className="py-2 px-2 text-cyan-400">{r.xs}</td>
                      <td className="py-2 px-2">
                        {r.isVerified ? (
                          <span className="text-[10px] text-emerald-400 font-sans font-bold">Sah ✓</span>
                        ) : (
                          <span className="text-[10px] text-neutral-500 font-sans">Draft</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-neutral-950 font-bold text-white border-t-2 border-neutral-700">
                    <td colSpan={7} className="py-2.5 px-3 text-right text-xs font-sans text-neutral-400">
                      Subtotal Sesi 1:
                    </td>
                    <td className="py-2.5 px-3 text-amber-400 text-sm font-black">{s1Score}</td>
                    <td className="py-2.5 px-3 text-white text-sm font-black">{s1Score}</td>
                    <td className="py-2.5 px-2 text-neutral-200">{s1Tens}</td>
                    <td className="py-2.5 px-2 text-cyan-400">{s1Xs}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sesi 2 Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                <span>Sesi 2 (Distance 2 — 36 Arrows)</span>
              </h3>
              <span className="font-mono text-xs font-bold text-neutral-400">
                Subtotal: <strong className="text-cyan-400">{s2Score}</strong> / 360
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-neutral-800">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-neutral-950 text-neutral-400 text-[11px] font-bold border-b border-neutral-800">
                    <th className="py-2 px-3 text-left">End</th>
                    <th className="py-2 px-2">1</th>
                    <th className="py-2 px-2">2</th>
                    <th className="py-2 px-2">3</th>
                    <th className="py-2 px-2">4</th>
                    <th className="py-2 px-2">5</th>
                    <th className="py-2 px-2">6</th>
                    <th className="py-2 px-3 text-cyan-400">Skor Seri</th>
                    <th className="py-2 px-3 text-white">Akumulasi</th>
                    <th className="py-2 px-2">10+X</th>
                    <th className="py-2 px-2">X</th>
                    <th className="py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 font-mono text-xs">
                  {s2Rows.map((r) => (
                    <tr key={r.endNum} className="hover:bg-neutral-850/50">
                      <td className="py-2 px-3 text-left font-bold text-neutral-400">{r.endNum}</td>
                      {[0, 1, 2, 3, 4, 5].map((aIdx) => (
                        <td key={aIdx} className="py-2 px-2 text-neutral-200">
                          {r.arrows[aIdx] || '-'}
                        </td>
                      ))}
                      <td className="py-2 px-3 font-black text-cyan-400 bg-neutral-950/40">
                        {r.endScore || 0}
                      </td>
                      <td className="py-2 px-3 font-black text-white bg-neutral-950/60">
                        {r.runningTotal || 0}
                      </td>
                      <td className="py-2 px-2 text-neutral-300">{r.tens}</td>
                      <td className="py-2 px-2 text-cyan-400">{r.xs}</td>
                      <td className="py-2 px-2">
                        {r.isVerified ? (
                          <span className="text-[10px] text-emerald-400 font-sans font-bold">Sah ✓</span>
                        ) : (
                          <span className="text-[10px] text-neutral-500 font-sans">Draft</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-neutral-950 font-bold text-white border-t-2 border-neutral-700">
                    <td colSpan={7} className="py-2.5 px-3 text-right text-xs font-sans text-neutral-400">
                      Subtotal Sesi 2:
                    </td>
                    <td className="py-2.5 px-3 text-cyan-400 text-sm font-black">{s2Score}</td>
                    <td className="py-2.5 px-3 text-white text-sm font-black">{grandTotal}</td>
                    <td className="py-2.5 px-2 text-neutral-200">{s2Tens}</td>
                    <td className="py-2.5 px-2 text-cyan-400">{s2Xs}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Grand Total Summary Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-neutral-950 to-cyan-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">
                GRAND TOTAL AKUMULASI (72 ARROWS)
              </span>
              <p className="text-[11px] text-neutral-500">
                Resmi disahkan untuk kualifikasi penentuan bagan aduan eliminasi
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <span className="text-[10px] text-neutral-500 block">Total 10+X</span>
                <span className="font-mono text-xl font-bold text-white">{totalTens}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-neutral-500 block">Total X</span>
                <span className="font-mono text-xl font-bold text-cyan-400">{totalXs}</span>
              </div>
              <div className="text-center bg-neutral-900 px-4 py-2 rounded-xl border border-neutral-700">
                <span className="text-[10px] text-amber-400 block font-bold">TOTAL SKOR</span>
                <span className="font-mono text-3xl font-black text-amber-400">{grandTotal}</span>
              </div>
            </div>
          </div>

          {/* Signatures Section (World Archery standard) */}
          <div className="pt-4 border-t border-neutral-800 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-8">
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                Tanda Tangan Pemanah (Archer)
              </span>
              <div className="pt-2 border-t border-dashed border-neutral-700 text-[11px] text-neutral-400">
                {athlete.athleteName}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-8">
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                Target Captain / Pemanah Saksi
              </span>
              <div className="pt-2 border-t border-dashed border-neutral-700 text-[11px] text-neutral-400">
                Nama & TTD Saksi Bantalan
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-8">
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                Wasit Juri Lapangan (Line Judge)
              </span>
              <div className="pt-2 border-t border-dashed border-neutral-700 text-[11px] text-emerald-400 font-semibold">
                ✓ Terverifikasi PB PERPANI
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
