import React, { useState } from 'react';
import { 
  Trophy, 
  Search, 
  Medal, 
  ArrowUp, 
  Target, 
  Filter, 
  Printer, 
  Download,
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { 
  Category, 
  ArcheryEvent, 
  Registration, 
  QualificationEnd, 
  QualificationTotal 
} from '../../types';
import { OfficialFitaScorecardModal } from '../scoring/OfficialFitaScorecardModal';

interface LiveLeaderboardProps {
  event: ArcheryEvent | null;
  category: Category | null;
  standings: QualificationTotal[];
  onRefresh?: () => void;
  registrations?: Registration[];
  qualificationEnds?: QualificationEnd[];
}

export const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({
  event,
  category,
  standings,
  onRefresh,
  registrations = [],
  qualificationEnds = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAthleteForScorecard, setSelectedAthleteForScorecard] = useState<Registration | null>(null);

  const filteredStandings = standings.filter(s => 
    s.athleteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contingentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.targetNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top1 = standings[0];
  const top2 = standings[1];
  const top3 = standings[2];

  const quotaCut = category?.eliminationQuota || 8;

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5" />
              <span>Peringkat Resmi Kualifikasi & Live Scoring</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Live Leaderboard Kualifikasi
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Kategori: <span className="text-white font-bold">{category?.name || 'Recurve Umum Putra 70m'}</span> • 
              Urutan berdasarkan: <span className="text-amber-400 font-semibold">Total Skor → Total 10s → Total Xs</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold border border-neutral-700 transition flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Hasil Standings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {standings.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rank 2 (Silver) */}
          <div className="order-2 md:order-1 p-5 rounded-2xl bg-neutral-900 border border-neutral-800 text-center relative overflow-hidden shadow-lg">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-300 text-slate-950 font-black text-xl flex items-center justify-center shadow-md">
              2
            </div>
            <p className="font-extrabold text-white text-base mt-2 truncate">{top2?.athleteName}</p>
            <p className="text-xs text-neutral-400 truncate">{top2?.contingentName}</p>
            <div className="mt-3 pt-3 border-t border-neutral-800 flex justify-around text-xs">
              <div>
                <span className="text-neutral-500 block text-[10px]">Total Skor</span>
                <span className="font-black text-lg text-slate-200">{top2?.totalScore}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">10s / Xs</span>
                <span className="font-bold text-neutral-300">{top2?.tensCount} / {top2?.xCount}</span>
              </div>
            </div>
          </div>

          {/* Rank 1 (Gold) */}
          <div className="order-1 md:order-2 p-6 rounded-2xl bg-gradient-to-b from-amber-500/20 via-neutral-900 to-neutral-900 border-2 border-amber-500 text-center relative overflow-hidden shadow-2xl scale-105 z-10">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-400 text-amber-950 font-black text-2xl flex items-center justify-center shadow-xl shadow-amber-500/30">
              1
            </div>
            <div className="inline-flex items-center space-x-1 text-amber-400 text-[10px] font-bold mt-2 uppercase tracking-widest">
              <Medal className="w-3.5 h-3.5" />
              <span>Seed #1 Kualifikasi</span>
            </div>
            <p className="font-black text-white text-lg sm:text-xl truncate">{top1?.athleteName}</p>
            <p className="text-xs text-neutral-300 truncate">{top1?.contingentName}</p>
            <div className="mt-3 pt-3 border-t border-neutral-800 flex justify-around text-xs">
              <div>
                <span className="text-neutral-400 block text-[10px]">Total Skor</span>
                <span className="font-black text-2xl text-amber-400">{top1?.totalScore}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px]">10s / Xs</span>
                <span className="font-bold text-white text-base">{top1?.tensCount} / {top1?.xCount}</span>
              </div>
              <div>
                <span className="text-neutral-400 block text-[10px]">Rata-rata</span>
                <span className="font-bold text-cyan-300 text-base">{top1?.averageArrow}</span>
              </div>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="order-3 p-5 rounded-2xl bg-neutral-900 border border-neutral-800 text-center relative overflow-hidden shadow-lg">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-700 text-amber-100 font-black text-xl flex items-center justify-center shadow-md">
              3
            </div>
            <p className="font-extrabold text-white text-base mt-2 truncate">{top3?.athleteName}</p>
            <p className="text-xs text-neutral-400 truncate">{top3?.contingentName}</p>
            <div className="mt-3 pt-3 border-t border-neutral-800 flex justify-around text-xs">
              <div>
                <span className="text-neutral-500 block text-[10px]">Total Skor</span>
                <span className="font-black text-lg text-amber-600">{top3?.totalScore}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[10px]">10s / Xs</span>
                <span className="font-bold text-neutral-300">{top3?.tensCount} / {top3?.xCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Cari pemanah, klub, bantalan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-950 rounded-lg border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="text-xs text-neutral-400 hidden sm:flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Lolos Babak Eliminasi (Top {quotaCut})</span>
        </div>
      </div>

      {/* Full Standings Table */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800 text-[11px]">
              <tr>
                <th className="p-4 text-center w-14">Rank</th>
                <th className="p-4 w-20">Bantalan</th>
                <th className="p-4">Nama Atlet</th>
                <th className="p-4">Klub / Kontingen</th>
                <th className="p-4 text-center">Sesi 1</th>
                <th className="p-4 text-center">Sesi 2</th>
                <th className="p-4 text-center">Total Skor</th>
                <th className="p-4 text-center">10s</th>
                <th className="p-4 text-center">Xs</th>
                <th className="p-4 text-center">Rata2 Panah</th>
                <th className="p-4 text-right">Status Kualifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 font-medium">
              {filteredStandings.map((archer) => {
                const isCut = archer.rank <= quotaCut;

                return (
                  <tr 
                    key={archer.registrationId} 
                    className={`hover:bg-neutral-800/50 transition ${
                      isCut ? 'bg-neutral-900' : 'opacity-70'
                    }`}
                  >
                    {/* Rank */}
                    <td className="p-4 text-center">
                      <span className={`w-7 h-7 rounded-lg font-bold font-mono inline-flex items-center justify-center text-xs ${
                        archer.rank === 1 ? 'bg-amber-400 text-amber-950' :
                        archer.rank === 2 ? 'bg-slate-300 text-slate-950' :
                        archer.rank === 3 ? 'bg-amber-700 text-amber-100' :
                        'bg-neutral-800 text-neutral-300'
                      }`}>
                        {archer.rank}
                      </span>
                    </td>

                    {/* Target # */}
                    <td className="p-4">
                      <span className="font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 font-bold text-amber-400">
                        {archer.targetNumber || 'N/A'}
                      </span>
                    </td>

                    {/* Athlete Name */}
                    <td className="p-4">
                      <p className="font-bold text-white text-sm">{archer.athleteName}</p>
                    </td>

                    {/* Contingent */}
                    <td className="p-4 text-neutral-300 font-semibold">
                      {archer.contingentName}
                    </td>

                    {/* Session 1 */}
                    <td className="p-4 text-center font-mono">
                      {archer.session1Score}
                    </td>

                    {/* Session 2 */}
                    <td className="p-4 text-center font-mono">
                      {archer.session2Score}
                    </td>

                    {/* Total */}
                    <td className="p-4 text-center">
                      <span className="font-mono text-base font-black text-amber-400">
                        {archer.totalScore}
                      </span>
                    </td>

                    {/* 10s */}
                    <td className="p-4 text-center font-mono text-neutral-200">
                      {archer.tensCount}
                    </td>

                    {/* Xs */}
                    <td className="p-4 text-center font-mono text-cyan-400">
                      {archer.xCount}
                    </td>

                    {/* Average */}
                    <td className="p-4 text-center font-mono text-neutral-400">
                      {archer.averageArrow.toFixed(2)}
                    </td>

                    {/* Status & Scoresheet Action */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isCut ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Lolos #{archer.rank}</span>
                          </span>
                        ) : (
                          <span className="text-neutral-500 text-xs">
                            Gugur
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            const foundReg = registrations.find(r => r.id === archer.registrationId);
                            if (foundReg) {
                              setSelectedAthleteForScorecard(foundReg);
                            } else {
                              // Synthetic registration from archer data
                              setSelectedAthleteForScorecard({
                                id: archer.registrationId,
                                athleteId: `ath-${archer.registrationId}`,
                                athleteName: archer.athleteName,
                                gender: 'Putra',
                                contingentId: 'ctg-default',
                                contingentName: archer.contingentName,
                                targetNumber: archer.targetNumber,
                                eventId: event?.id || '',
                                categoryId: category?.id || '',
                                status: 'VERIFIED',
                                paymentAmount: 250000,
                                registeredAt: new Date().toISOString()
                              });
                            }
                          }}
                          className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-300 text-[11px] font-semibold transition flex items-center gap-1"
                          title="Lihat & Cetak Kartu Skor Resmi FITA"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Scoresheet</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official FITA Scoresheet Modal */}
      {selectedAthleteForScorecard && (
        <OfficialFitaScorecardModal
          isOpen={!!selectedAthleteForScorecard}
          onClose={() => setSelectedAthleteForScorecard(null)}
          event={event}
          category={category}
          athlete={selectedAthleteForScorecard}
          qualificationEnds={qualificationEnds}
        />
      )}
    </div>
  );
};
