import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Target, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Download,
  Calendar,
  Filter,
  QrCode,
  Palette
} from 'lucide-react';
import { ArcheryEvent, Registration } from '../../types';
import { ContingentVerification } from './ContingentVerification';
import { OnSiteCheckInScanner } from './OnSiteCheckInScanner';
import { IdCardAccreditationStudio } from './IdCardAccreditationStudio';

interface PanitiaDashboardProps {
  event: ArcheryEvent | null;
  registrations: Registration[];
  onVerifyRegistration: (id: string, status: 'VERIFIED' | 'REJECTED', targetNumber?: string, notes?: string) => Promise<void>;
  onOpenEventBuilder: () => void;
  onCheckInAthlete?: (
    registrationId: string, 
    data: { 
      checkedInBy?: string; 
      equipmentPassed?: boolean; 
      bowPoundage?: string; 
      arrowType?: string; 
      checkInNotes?: string; 
    }
  ) => Promise<boolean>;
  onCancelCheckIn?: (registrationId: string) => Promise<boolean>;
  onRefreshData?: () => void;
  onOpenTargetStudio?: () => void;
}

export const PanitiaDashboard: React.FC<PanitiaDashboardProps> = ({
  event,
  registrations,
  onVerifyRegistration,
  onOpenEventBuilder,
  onCheckInAthlete,
  onCancelCheckIn,
  onRefreshData,
  onOpenTargetStudio
}) => {
  const [viewTab, setViewTab] = useState<'VERIFICATION' | 'TARGET_MAP' | 'ON_SITE_CHECKIN' | 'ID_CARD_STUDIO'>('ON_SITE_CHECKIN');

  const eventRegs = event ? registrations.filter(r => r.eventId === event.id) : registrations;
  const verifiedCount = eventRegs.filter(r => r.status === 'VERIFIED').length;
  const pendingCount = eventRegs.filter(r => r.status === 'PENDING_PAYMENT').length;
  const allocatedCount = eventRegs.filter(r => r.targetNumber).length;
  const checkedInCount = eventRegs.filter(r => r.isCheckedIn).length;

  return (
    <div className="space-y-6">
      {/* Panitia Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-blue-950/40 border border-blue-500/20 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Sekretariat & Panitia Pelaksana
              </span>
              {event && (
                <span className="text-xs text-neutral-400 font-medium">
                  {event.name}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Verifikasi Kontingen & Penempatan Bantalan
            </h1>
            <p className="text-xs text-neutral-400 max-w-2xl">
              Memeriksa bukti transfer pembayaran, melegitimasi status atlet resmi PERPANI, serta mengatur alokasi nomor bantalan target tembak (Lane Allocation).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenTargetStudio && (
              <button
                onClick={onOpenTargetStudio}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Target className="w-4 h-4" />
                <span>Studio Face Target WA & PDF</span>
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              Cetak Dokumen
            </button>
          </div>
        </div>

        {/* Counters */}
        <div className="mt-6 pt-6 border-t border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
            <p className="text-[11px] text-neutral-400">Total Pendaftar</p>
            <p className="text-xl font-bold text-white mt-0.5">{eventRegs.length} Atlet</p>
          </div>
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
            <p className="text-[11px] text-emerald-400">Terverifikasi Sah</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{verifiedCount} Atlet</p>
          </div>
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
            <p className="text-[11px] text-amber-400">Menunggu Review</p>
            <p className="text-xl font-bold text-amber-400 mt-0.5">{pendingCount} Atlet</p>
          </div>
          <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
            <p className="text-[11px] text-cyan-400">Nomor Bantalan Ditetapkan</p>
            <p className="text-xl font-bold text-cyan-400 mt-0.5">{allocatedCount} / {verifiedCount}</p>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex flex-wrap space-x-2 border-b border-neutral-800 pb-2 gap-y-2">
        <button
          onClick={() => setViewTab('ON_SITE_CHECKIN')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
            viewTab === 'ON_SITE_CHECKIN'
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <QrCode className="w-4 h-4 text-emerald-400" />
          <span>Registrasi Ulang Lapangan (Roll Call & Uji Alat)</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
            {checkedInCount} / {verifiedCount} Hadir
          </span>
        </button>

        <button
          onClick={() => setViewTab('VERIFICATION')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
            viewTab === 'VERIFICATION'
              ? 'bg-neutral-800 text-white border border-neutral-700'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          Verifikasi Pembayaran & Berkas
        </button>

        <button
          onClick={() => setViewTab('TARGET_MAP')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
            viewTab === 'TARGET_MAP'
              ? 'bg-neutral-800 text-white border border-neutral-700'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Target className="w-4 h-4 text-amber-400" />
          Peta Alokasi Bantalan (Lane Map)
        </button>

        <button
          onClick={() => setViewTab('ID_CARD_STUDIO')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
            viewTab === 'ID_CARD_STUDIO'
              ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-700/60'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          <Palette className="w-4 h-4 text-indigo-400" />
          <span>Desain ID Card & Akreditasi</span>
        </button>
      </div>

      {/* Tab 0: On-Site Check-In Scanner & Roll Call */}
      {viewTab === 'ON_SITE_CHECKIN' && onCheckInAthlete && onCancelCheckIn && (
        <OnSiteCheckInScanner
          event={event}
          registrations={registrations}
          onCheckInAthlete={onCheckInAthlete}
          onCancelCheckIn={onCancelCheckIn}
          onRefreshData={onRefreshData}
        />
      )}

      {/* Tab 1: Embedded Full Verification Component */}
      {viewTab === 'VERIFICATION' && (
        <ContingentVerification
          event={event}
          registrations={registrations}
          onVerifyRegistration={onVerifyRegistration}
        />
      )}

      {/* Tab 2: Visual Target Lane Map */}
      {viewTab === 'TARGET_MAP' && (
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Matriks Penempatan Bantalan Sasaran (Target Lane Allocation)
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Distribusi pemanah pada setiap bantalan (posisi A, B, C, D) untuk rotasi tembak adil.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Lane Matrix
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 16 }).map((_, idx) => {
              const targetNumber = (idx + 1).toString().padStart(2, '0');
              const targetAthletes = eventRegs.filter(r => r.targetNumber && r.targetNumber.startsWith(targetNumber));

              return (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition space-y-2"
                >
                  <div className="flex items-center justify-between border-b border-neutral-850 pb-1.5">
                    <span className="font-mono font-bold text-sm text-amber-400">
                      Bantalan {targetNumber}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-semibold">
                      {targetAthletes.length}/4 Atlet
                    </span>
                  </div>

                  <div className="space-y-1">
                    {['A', 'B', 'C', 'D'].map(pos => {
                      const athlete = targetAthletes.find(r => r.targetNumber === `${targetNumber}${pos}`);
                      return (
                        <div 
                          key={pos}
                          className={`px-2 py-1 rounded text-[11px] flex items-center justify-between ${
                            athlete 
                              ? 'bg-neutral-900 border border-neutral-800 text-neutral-200' 
                              : 'bg-neutral-950/40 text-neutral-600 border border-dashed border-neutral-850'
                          }`}
                        >
                          <span className="font-mono font-bold text-amber-400/80 mr-1">{pos}:</span>
                          <span className="truncate flex-1 font-medium">
                            {athlete ? athlete.athleteName : 'Kosong'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: ID Card Designer & Accreditation Studio */}
      {viewTab === 'ID_CARD_STUDIO' && (
        <IdCardAccreditationStudio
          event={event}
          registrations={registrations}
        />
      )}
    </div>
  );
};
