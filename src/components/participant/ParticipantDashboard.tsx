import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Users, 
  Target, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Award, 
  Printer, 
  QrCode, 
  Calendar, 
  MapPin, 
  Plus, 
  ArrowRight,
  TrendingUp,
  X,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { ArcheryEvent, Category, Registration, QualificationEnd, AuthUser } from '../../types';
import { OfficialFitaScorecardModal } from '../scoring/OfficialFitaScorecardModal';

interface ParticipantDashboardProps {
  currentUser: AuthUser;
  events: ArcheryEvent[];
  selectedEvent: ArcheryEvent | null;
  registrations: Registration[];
  qualificationEnds: QualificationEnd[];
  onOpenNewRegistration: () => void;
  onViewLeaderboard: () => void;
}

export const ParticipantDashboard: React.FC<ParticipantDashboardProps> = ({
  currentUser,
  events,
  selectedEvent,
  registrations,
  qualificationEnds,
  onOpenNewRegistration,
  onViewLeaderboard
}) => {
  // Filter registrations that belong to this participant / contingent
  // If user has a contingentName, match by contingentName, else show matching athlete or recent
  const contingentName = currentUser.contingentName || 'Fast Archery Club Bandung';
  
  const myRegistrations = registrations.filter(r => 
    r.contingentName?.toLowerCase().includes(contingentName.toLowerCase()) ||
    r.athleteName?.toLowerCase().includes(currentUser.name.toLowerCase()) ||
    r.contingentId === currentUser.contingentId
  );

  // Selected athlete for ID Card preview
  const [selectedAthleteCard, setSelectedAthleteCard] = useState<Registration | null>(null);
  // Selected athlete for Official FITA Scorecard modal
  const [selectedScorecardAthlete, setSelectedScorecardAthlete] = useState<Registration | null>(null);
  // Generated QR Code Data URL for E-Badge
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!selectedAthleteCard) {
      setQrDataUrl('');
      return;
    }
    const payload = JSON.stringify({
      regId: selectedAthleteCard.id,
      ath: selectedAthleteCard.athleteName,
      target: selectedAthleteCard.targetNumber || 'N/A'
    });
    QRCode.toDataURL(payload, { 
      width: 220, 
      margin: 1, 
      color: { dark: '#000000', light: '#ffffff' } 
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [selectedAthleteCard]);

  // Active tab inside participant dashboard
  const [activeTab, setActiveTab] = useState<'ATHLETES' | 'SCORES' | 'SCHEDULE'>('ATHLETES');

  // Stats
  const totalAthletes = myRegistrations.length;
  const verifiedAthletes = myRegistrations.filter(r => r.status === 'VERIFIED').length;
  const pendingAthletes = myRegistrations.filter(r => r.status === 'PENDING_PAYMENT').length;

  return (
    <div className="space-y-6">
      {/* Contingent Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-emerald-950/40 border border-emerald-500/20 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Portal Kontingen & Atlet
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Akun: {currentUser.name}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {contingentName}
            </h1>

            {selectedEvent ? (
              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300">
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-white">{selectedEvent.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{selectedEvent.venueName}, {selectedEvent.city}</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{selectedEvent.startDate} s/d {selectedEvent.endDate}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                Silakan pilih kejuaraan pada menu atas untuk memantau status kontingen Anda.
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewRegistration}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Daftar Atlet Tambahan
            </button>
            <button
              onClick={onViewLeaderboard}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs border border-neutral-700 transition flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Live Skor Kejuaraan
            </button>
          </div>
        </div>

        {/* Quick KPI Counters */}
        <div className="mt-6 pt-6 border-t border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
            <p className="text-[11px] text-neutral-400">Total Atlet Terdaftar</p>
            <p className="text-xl font-bold text-white mt-0.5">{totalAthletes} Atlet</p>
          </div>
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
            <p className="text-[11px] text-emerald-400">Status Terverifikasi (Lolos)</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{verifiedAthletes} Atlet</p>
          </div>
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
            <p className="text-[11px] text-amber-400">Menunggu Verifikasi Pembayaran</p>
            <p className="text-xl font-bold text-amber-400 mt-0.5">{pendingAthletes} Atlet</p>
          </div>
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
            <p className="text-[11px] text-cyan-400">Bantalan Terpasang</p>
            <p className="text-xl font-bold text-cyan-400 mt-0.5">
              {myRegistrations.filter(r => r.targetNumber).length} / {totalAthletes}
            </p>
          </div>
        </div>
      </div>

      {/* Participant Sub-navigation Tabs */}
      <div className="flex space-x-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('ATHLETES')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'ATHLETES'
              ? 'bg-neutral-800 text-white border border-neutral-700'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          Daftar Atlet & Nomor Bantalan ({myRegistrations.length})
        </button>

        <button
          onClick={() => setActiveTab('SCORES')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'SCORES'
              ? 'bg-neutral-800 text-white border border-neutral-700'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Target className="w-4 h-4 text-amber-400" />
          Monitoring Nilai Kualifikasi Atlet
        </button>

        <button
          onClick={() => setActiveTab('SCHEDULE')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
            activeTab === 'SCHEDULE'
              ? 'bg-neutral-800 text-white border border-neutral-700'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Clock className="w-4 h-4 text-cyan-400" />
          Jadwal & Briefing Lapangan
        </button>
      </div>

      {/* Tab 1: Athletes List & Target Lane */}
      {activeTab === 'ATHLETES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Daftar Atlet Kontingen & Alokasi Target Tembak
            </h2>
            <span className="text-xs text-neutral-400">
              Klik "Lihat E-Badge" untuk mencetak kartu peserta resmi
            </span>
          </div>

          {myRegistrations.length === 0 ? (
            <div className="p-12 text-center bg-neutral-900 rounded-2xl border border-neutral-800">
              <Users className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">Belum Ada Atlet Terdaftar</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                Kontingen Anda belum memiliki pendaftaran atlet aktif untuk event ini. Silakan klik tombol di bawah untuk mendaftar.
              </p>
              <button
                onClick={onOpenNewRegistration}
                className="mt-4 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition"
              >
                Daftarkan Atlet Sekarang
              </button>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Nama Atlet</th>
                      <th className="py-3 px-4">Gender</th>
                      <th className="py-3 px-4">Bantalan (Target)</th>
                      <th className="py-3 px-4">Status Verifikasi</th>
                      <th className="py-3 px-4">Biaya Pendaftaran</th>
                      <th className="py-3 px-4 text-right">Kartu Atlet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {myRegistrations.map((reg) => {
                      return (
                        <tr key={reg.id} className="hover:bg-neutral-850/60 transition">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-amber-400 border border-neutral-700">
                                {reg.athleteName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-neutral-100">{reg.athleteName}</p>
                                <p className="text-[10px] text-neutral-500">ID: {reg.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-neutral-300">
                            {reg.gender}
                          </td>
                          <td className="py-3.5 px-4">
                            {reg.targetNumber ? (
                              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                                Bantalan {reg.targetNumber}
                              </span>
                            ) : (
                              <span className="text-neutral-500 italic">
                                Belum dialokasikan panitia
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {reg.isCheckedIn ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5 w-fit">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                Hadir & Siap Tembak
                              </span>
                            ) : reg.status === 'VERIFIED' ? (
                              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold flex items-center gap-1.5 w-fit">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Terverifikasi Sah
                              </span>
                            ) : reg.status === 'REJECTED' ? (
                              <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 font-semibold flex items-center gap-1.5 w-fit">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Ditolak
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold flex items-center gap-1.5 w-fit">
                                <Clock className="w-3.5 h-3.5" />
                                Menunggu Verifikasi
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-neutral-300">
                            Rp {reg.paymentAmount.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedAthleteCard(reg)}
                                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg border border-neutral-700 font-medium transition inline-flex items-center gap-1.5 text-xs"
                              >
                                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                                <span>E-Badge</span>
                              </button>
                              <button
                                onClick={() => setSelectedScorecardAthlete(reg)}
                                className="px-3 py-1.5 bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-neutral-300 rounded-lg border border-neutral-700 font-semibold transition inline-flex items-center gap-1.5 text-xs"
                                title="Lihat & Cetak Lembar Skor Resmi FITA"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Scoresheet</span>
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
          )}
        </div>
      )}

      {/* Tab 2: Monitoring Nilai Kualifikasi Atlet */}
      {activeTab === 'SCORES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              Rekap Perolehan Skor Seri Kualifikasi Atlet Kontingen
            </h2>
            <button
              onClick={onViewLeaderboard}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              Lihat Leaderboard Lengkap <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRegistrations.map(reg => {
              const ends = qualificationEnds.filter(e => e.registrationId === reg.id);
              const totalScore = ends.reduce((acc, e) => acc + e.endScore, 0);
              const totalTens = ends.reduce((acc, e) => acc + e.tensCount, 0);
              const totalXs = ends.reduce((acc, e) => acc + e.xCount, 0);

              return (
                <div key={reg.id} className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white">{reg.athleteName}</h3>
                      <p className="text-xs text-neutral-400">Target: {reg.targetNumber || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-amber-400 font-mono">
                        {totalScore}
                      </span>
                      <span className="text-xs text-neutral-500 block">Total Poin</span>
                    </div>
                  </div>

                  {/* Summary Pills */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                      <span className="text-neutral-500 block text-[10px]">Seri Tercatat</span>
                      <span className="font-bold text-white">{ends.length} / 12 End</span>
                    </div>
                    <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                      <span className="text-neutral-500 block text-[10px]">Jumlah 10s</span>
                      <span className="font-bold text-amber-300">{totalTens}</span>
                    </div>
                    <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                      <span className="text-neutral-500 block text-[10px]">Jumlah Xs</span>
                      <span className="font-bold text-amber-400">{totalXs}</span>
                    </div>
                  </div>

                  {/* Ends Breakdown */}
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-400 mb-2">
                      Rincian Anak Panah Tiap End:
                    </p>
                    {ends.length === 0 ? (
                      <p className="text-xs text-neutral-500 italic">
                        Belum ada seri panah yang dimasukkan oleh Tim Scoring.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {ends.map((end, idx) => (
                          <div 
                            key={end.id || idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-850 text-xs"
                          >
                            <span className="font-semibold text-neutral-400 font-mono">
                              S{end.sessionNumber}-End {end.endNumber}
                            </span>
                            <div className="flex items-center gap-1 font-mono">
                              {end.arrows.map((arr, aIdx) => (
                                <span 
                                  key={aIdx}
                                  className={`w-6 h-6 flex items-center justify-center font-bold text-[11px] rounded ${
                                    arr === 'X' || arr === '10' || arr === '9'
                                      ? 'bg-amber-500 text-neutral-950'
                                      : arr === '8' || arr === '7'
                                      ? 'bg-red-600 text-white'
                                      : arr === '6' || arr === '5'
                                      ? 'bg-sky-600 text-white'
                                      : arr === '4' || arr === '3'
                                      ? 'bg-neutral-800 text-white'
                                      : 'bg-neutral-700 text-neutral-300'
                                  }`}
                                >
                                  {arr}
                                </span>
                              ))}
                            </div>
                            <span className="font-bold text-white font-mono">
                              ={end.endScore}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Scoresheet Action Button */}
                  <div className="pt-2 border-t border-neutral-800 flex justify-end">
                    <button
                      onClick={() => setSelectedScorecardAthlete(reg)}
                      className="px-3 py-1.5 bg-neutral-950 hover:bg-amber-500 hover:text-neutral-950 text-neutral-300 rounded-lg border border-neutral-800 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lembar Skor FITA</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Jadwal & Briefing Lapangan */}
      {activeTab === 'SCHEDULE' && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Jadwal Pelaksanaan & Briefing Lapangan Resmi
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Waktu resmi mengacu pada jadwal Technical Meeting panitia PERPANI
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Jadwal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Pagi (07.00 - 08.00 WIB)
              </span>
              <h4 className="font-bold text-white text-sm">Pemeriksaan Alat & Pemanasan</h4>
              <p className="text-xs text-neutral-400">
                Official check busur, arrow inspection, dan 2 end tembakan percobaan (practice ends) di bantalan masing-masing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Sesi 1 (08.30 - 11.30 WIB)
              </span>
              <h4 className="font-bold text-white text-sm">Babak Kualifikasi Sesi 1</h4>
              <p className="text-xs text-neutral-400">
                6 seri x 6 anak panah (36 panah). Waktu tembak 180 detik (4 menit) per seri dengan sinyal peluit resmi.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Sesi 2 & Eliminasi (13.30 WIB)
              </span>
              <h4 className="font-bold text-white text-sm">Kualifikasi Sesi 2 & Head-to-Head</h4>
              <p className="text-xs text-neutral-400">
                Penyelesaian 36 panah sesi 2, pengumuman seeding eliminasi, dilanjutkan babak 16 besar & perempat final.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-300 space-y-2">
            <h4 className="font-bold text-amber-300">Peraturan Lapangan:</h4>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>Pemanah wajib mengenakan seragam kontingen berkerah dan sepatu olahraga tertutup.</li>
              <li>Dilarang membawa alat komunikasi / smartphone ke shooting line.</li>
              <li>Pencatatan nilai pada scoring sheet kertas dan tablet wasit harus diverifikasi sebelum anak panah dicabut dari target.</li>
            </ul>
          </div>
        </div>
      )}

      {/* MODAL: Athlete E-Badge / ID Card */}
      {selectedAthleteCard && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedAthleteCard(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Visual ID Card Layout */}
            <div className="p-6 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 border-b border-neutral-800 flex flex-col items-center text-center relative">
              <div className="w-full flex justify-between items-center text-[10px] text-amber-400 font-bold uppercase tracking-widest border-b border-neutral-800 pb-2 mb-4">
                <span>Official Athlete Badge</span>
                <span>PERPANI Standard</span>
              </div>

              {/* Avatar Photo */}
              <div className="w-24 h-24 rounded-2xl bg-neutral-800 border-2 border-amber-500/50 p-1 mb-3 shadow-lg shadow-amber-500/10 flex items-center justify-center">
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-3xl font-extrabold text-neutral-950">
                  {selectedAthleteCard.athleteName.charAt(0)}
                </div>
              </div>

              <h3 className="text-lg font-bold text-white">
                {selectedAthleteCard.athleteName}
              </h3>
              <p className="text-xs font-semibold text-amber-400 mt-0.5">
                {selectedAthleteCard.contingentName}
              </p>

              {/* Target Lane Badge */}
              <div className="mt-4 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-sm">
                TARGET: {selectedAthleteCard.targetNumber || 'MENUNGGU PLACEMENT'}
              </div>

              {/* Event Info */}
              <p className="text-[11px] text-neutral-400 mt-3 max-w-xs">
                {selectedEvent?.name || 'Kejuaraan Panahan Nasional'}
              </p>
            </div>

            {/* Badge Details & Barcode */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                  <span className="text-neutral-500 text-[10px] block">Nomor ID Registrasi</span>
                  <span className="font-mono font-bold text-white">{selectedAthleteCard.id}</span>
                </div>
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                  <span className="text-neutral-500 text-[10px] block">Status Roll Call Lapangan</span>
                  {selectedAthleteCard.isCheckedIn ? (
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      HADIR & SIAP TEMBAK
                    </span>
                  ) : (
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      BELUM ROLL CALL
                    </span>
                  )}
                </div>
              </div>

              {/* Scannable QR Code for Field Check-in */}
              <div className="p-4 bg-white rounded-2xl text-neutral-950 text-center space-y-2 flex flex-col items-center justify-center shadow-lg">
                {qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt="QR Code Registrasi Atlet" 
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center bg-neutral-100 rounded-lg">
                    <QrCode className="w-12 h-12 text-neutral-400 animate-pulse" />
                  </div>
                )}
                <div className="space-y-0.5">
                  <span className="font-mono text-[11px] font-bold tracking-wider text-neutral-900 block">
                    ID: {selectedAthleteCard.id}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">
                    Tunjukkan QR ini ke petugas meja registrasi lapangan
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => window.print()}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Cetak E-Badge Atlet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official FITA Scoresheet Modal */}
      {selectedScorecardAthlete && (
        <OfficialFitaScorecardModal
          isOpen={!!selectedScorecardAthlete}
          onClose={() => setSelectedScorecardAthlete(null)}
          event={selectedEvent}
          category={selectedEvent?.categories.find(c => c.id === selectedScorecardAthlete.categoryId) || null}
          athlete={selectedScorecardAthlete}
          qualificationEnds={qualificationEnds}
        />
      )}
    </div>
  );
};
