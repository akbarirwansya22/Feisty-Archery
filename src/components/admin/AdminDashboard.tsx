import React from 'react';
import { 
  Award, 
  Calendar, 
  Users, 
  DollarSign, 
  Plus, 
  Settings, 
  ShieldCheck, 
  Target, 
  Database, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowRight 
} from 'lucide-react';
import { ArcheryEvent, Registration, AuthUser } from '../../types';

interface AdminDashboardProps {
  currentUser: AuthUser;
  events: ArcheryEvent[];
  selectedEvent: ArcheryEvent | null;
  registrations: Registration[];
  onSelectEvent: (ev: ArcheryEvent) => void;
  onOpenEventBuilder: () => void;
  onOpenVerification: () => void;
  onOpenScoring: () => void;
  onOpenArchitecture: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  events,
  selectedEvent,
  registrations,
  onSelectEvent,
  onOpenEventBuilder,
  onOpenVerification,
  onOpenScoring,
  onOpenArchitecture
}) => {
  // Aggregate KPIs
  const totalEvents = events.length;
  const totalAthletes = registrations.length;
  const uniqueClubs = new Set(registrations.map(r => r.contingentName)).size;
  const totalRevenue = registrations.reduce((acc, r) => acc + (r.paymentAmount || 0), 0);
  const verifiedRevenue = registrations
    .filter(r => r.status === 'VERIFIED')
    .reduce((acc, r) => acc + (r.paymentAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Admin Executive Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-purple-950/40 border border-purple-500/20 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/30 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Super Admin Console
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Log Masuk: {currentUser.name} ({currentUser.email})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Pusat Kendali Eksekutif Kejuaraan Panahan
            </h1>
            <p className="text-xs text-neutral-400 max-w-2xl">
              Mengelola multi-event kejuaraan, pembuat kategori kustom fleksibel PERPANI/World Archery, pengawasan finansial pendaftaran, dan audit kepatuhan scoring.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenEventBuilder}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Buat Event & Kategori Baru
            </button>
            <button
              onClick={onOpenArchitecture}
              className="px-4 py-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 font-semibold text-xs border border-cyan-800 transition flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              Skema DDL & ERD
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="mt-6 pt-6 border-t border-neutral-800 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span>Total Kejuaraan</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{totalEvents} Event</p>
            <span className="text-[10px] text-emerald-400 font-medium">Multi-Tenancy Siap</span>
          </div>

          <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span>Total Atlet Terdaftar</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-white">{totalAthletes} Pemanah</p>
            <span className="text-[10px] text-neutral-400 font-medium">Dari {uniqueClubs} Klub/Kontingen</span>
          </div>

          <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span>Pemasukan Terverifikasi</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              Rp {verifiedRevenue.toLocaleString('id-ID')}
            </p>
            <span className="text-[10px] text-neutral-400 font-medium">
              Total Potensi: Rp {totalRevenue.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80">
            <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
              <span>Status Sistem</span>
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">Aktif & Siap</p>
            <span className="text-[10px] text-purple-400 font-medium">PostgreSQL / In-Memory Sync</span>
          </div>
        </div>
      </div>

      {/* Grid: Event Management & Quick Navigation Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Master Event Directory for Admin */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              Daftar Seluruh Kejuaraan (Multi-Event)
            </h2>
            <span className="text-xs text-neutral-400">Pilih event untuk mengelola</span>
          </div>

          <div className="space-y-3">
            {events.map((ev) => {
              const isCurrent = selectedEvent?.id === ev.id;
              const evRegs = registrations.filter(r => r.eventId === ev.id);
              const verifiedCount = evRegs.filter(r => r.status === 'VERIFIED').length;

              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCurrent
                      ? 'bg-neutral-900 border-amber-500/80 shadow-lg shadow-amber-500/10'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        ev.status === 'ONGOING'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : ev.status === 'REGISTRATION_OPEN'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}>
                        {ev.status}
                      </span>
                      <span className="text-xs text-neutral-400">{ev.city}, {ev.province}</span>
                    </div>

                    <h3 className="font-bold text-base text-white hover:text-amber-300 transition">
                      {ev.name}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-1">
                      Venue: {ev.venueName} • Tanggal: {ev.startDate} s/d {ev.endDate}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-neutral-400 pt-1">
                      <span>Kategori: <strong className="text-neutral-200">{ev.categories.length} Nomor</strong></span>
                      <span>Peserta: <strong className="text-neutral-200">{evRegs.length} Atlet ({verifiedCount} Terverifikasi)</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isCurrent && (
                      <span className="text-xs text-amber-400 font-bold px-2 py-1 bg-amber-500/10 rounded-lg">
                        Sedang Aktif
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(ev);
                        onOpenVerification();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
                    >
                      Kelola Kontingen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Quick Roles & Fast Dispatch */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-purple-400" />
            Aksi Cepat & Navigasi Modul
          </h2>

          <div className="space-y-3">
            <button
              onClick={onOpenEventBuilder}
              className="w-full text-left p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 hover:bg-neutral-850 transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-white group-hover:text-amber-300">
                  Dynamic Event & Category Builder
                </span>
                <Plus className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-[11px] text-neutral-400">
                Tambah nomor perlombaan baru: Recurve, Compound, Barebow, Tradisional dengan jarak & target face fleksibel.
              </p>
            </button>

            <button
              onClick={onOpenVerification}
              className="w-full text-left p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-blue-500/50 hover:bg-neutral-850 transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-white group-hover:text-blue-300">
                  Verifikasi Berkas & Alokasi Bantalan
                </span>
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-[11px] text-neutral-400">
                Pemeriksaan bukti transfer peserta, persetujuan atlet sah, dan penentuan nomor bantalan tembak (lane 01A..30D).
              </p>
            </button>

            <button
              onClick={onOpenScoring}
              className="w-full text-left p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-850 transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-white group-hover:text-emerald-300">
                  Modul Wasit & Live Scoring
                </span>
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-neutral-400">
                Keypad World Archery (X, 10..M), audit tanda tangan wasit, dan kontrol match eliminasi head-to-head.
              </p>
            </button>

            <button
              onClick={onOpenArchitecture}
              className="w-full text-left p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-cyan-500/50 hover:bg-neutral-850 transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-white group-hover:text-cyan-300">
                  Skema Database SQL & DDL
                </span>
                <Database className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-[11px] text-neutral-400">
                Arsitektur relasional PostgreSQL ternormalisasi 3NF, multi-tenancy, dan model kolom JSONB.
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
