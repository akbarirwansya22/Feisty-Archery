import React from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Building2, 
  Target, 
  FileText, 
  Clock, 
  Users, 
  DollarSign, 
  CheckCircle2,
  Download
} from 'lucide-react';
import { ArcheryEvent } from '../../types';

interface EventDetailModalProps {
  event: ArcheryEvent | null;
  onClose: () => void;
  onOpenRegistration: (event: ArcheryEvent) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onOpenRegistration
}) => {
  if (!event) return null;

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div 
        id="modal-event-detail"
        className="relative w-full max-w-4xl bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header with image */}
        <div className="relative h-56 sm:h-64 w-full bg-neutral-950 shrink-0">
          <img 
            src={event.bannerUrl} 
            alt={event.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />
          
          <button
            id="btn-close-event-detail"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900/80 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-700 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500 text-neutral-950">
                {event.status === 'REGISTRATION_OPEN' ? 'Pendaftaran Dibuka' : event.status}
              </span>
              <span className="text-xs text-neutral-300 bg-neutral-900/80 px-2.5 py-0.5 rounded-md backdrop-blur-sm border border-neutral-700">
                Official WA & PERPANI Rules
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {event.name}
            </h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 text-neutral-200">
          {/* Fast Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
            <div className="space-y-1">
              <div className="text-neutral-400 flex items-center space-x-1.5 font-medium">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Penyelenggara (EO)</span>
              </div>
              <p className="font-bold text-white truncate">{event.organizerName}</p>
            </div>

            <div className="space-y-1">
              <div className="text-neutral-400 flex items-center space-x-1.5 font-medium">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Tanggal Pelaksanaan</span>
              </div>
              <p className="font-bold text-white">{event.startDate} s/d {event.endDate}</p>
            </div>

            <div className="space-y-1">
              <div className="text-neutral-400 flex items-center space-x-1.5 font-medium">
                <MapPin className="w-4 h-4 text-red-400" />
                <span>Venue & Lokasi</span>
              </div>
              <p className="font-bold text-white truncate">{event.venueName}, {event.city}</p>
            </div>

            <div className="space-y-1">
              <div className="text-neutral-400 flex items-center space-x-1.5 font-medium">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Batas Pendaftaran</span>
              </div>
              <p className="font-bold text-amber-400 truncate">{new Date(event.registrationDeadline).toLocaleDateString('id-ID')}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Deskripsi & Informasi Kejuaraan</span>
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Dynamic Categories Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>Daftar Kategori & Nomor Perlombaan ({event.categories.length} Kategori)</span>
              </h3>
              <span className="text-xs text-neutral-400">Dikonfigurasi via Dynamic Category Builder</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.categories.map((cat, idx) => (
                <div 
                  key={cat.id} 
                  className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 hover:border-neutral-700 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 mr-2">
                        #{idx + 1}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                      {formatRupiah(cat.fee)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400 pt-1">
                    <div>
                      <span className="text-neutral-500">Divisi:</span> <span className="font-semibold text-neutral-200">{cat.division}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Kategori:</span> <span className="font-semibold text-neutral-200">{cat.ageCategory} ({cat.gender})</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Jarak Tembak:</span> <span className="font-semibold text-amber-300">{cat.distanceMeters} Meter</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Target Face:</span> <span className="font-semibold text-neutral-200">{cat.targetFaceCm} cm</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Sistem Kualifikasi:</span> <span className="font-semibold text-neutral-200">{cat.formatQualification}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Sistem Eliminasi:</span> <span className="font-semibold text-cyan-300">
                        {cat.eliminationType === 'SET_SYSTEM' ? 'Set System (Olympic)' : 'Cumulative Score'} (Top {cat.eliminationQuota})
                      </span>
                    </div>
                  </div>

                  {/* Quota bar */}
                  <div className="space-y-1 pt-1 border-t border-neutral-800 text-[11px]">
                    <div className="flex justify-between text-neutral-400">
                      <span>Kapasitas Peserta:</span>
                      <span className="font-bold text-neutral-200">
                        {cat.registeredCount || 0} / {cat.quota} Kuota
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${Math.min(100, ((cat.registeredCount || 0) / cat.quota) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Guidebook & Schedule preview */}
          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Petunjuk Teknis & Jadwal Pertandingan (JUKLAK/JUKNIS)</p>
                <p className="text-xs text-neutral-400">Format resmi peraturan perlombaan, ketentuan seragam, dan jadwal per sesi.</p>
              </div>
            </div>
            <button 
              onClick={() => alert(`Unduhan Juklak untuk ${event.name} dimulai. Dokumen PDF siap dicetak.`)}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center space-x-1.5 border border-neutral-700 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Unduh Juklak (PDF)</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium transition"
          >
            Kembali
          </button>

          <button
            id="btn-modal-register-now"
            onClick={() => {
              onClose();
              onOpenRegistration(event);
            }}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-95"
          >
            Daftar Kontingen / Atlet Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
