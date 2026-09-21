import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  Eye, 
  ShieldCheck, 
  Tag, 
  Users, 
  FileText, 
  Filter, 
  Clock, 
  Check, 
  X,
  ExternalLink
} from 'lucide-react';
import { Registration, ArcheryEvent } from '../../types';

interface ContingentVerificationProps {
  registrations: Registration[];
  event: ArcheryEvent | null;
  onVerifyRegistration: (id: string, status: 'VERIFIED' | 'REJECTED', targetNumber?: string, notes?: string) => void;
}

export const ContingentVerification: React.FC<ContingentVerificationProps> = ({
  registrations,
  event,
  onVerifyRegistration
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [targetNumberInput, setTargetNumberInput] = useState<string>('');

  // Filter registrations by current event and criteria
  const currentEventRegistrations = registrations.filter(r => !event || r.eventId === event.id);

  const filteredRegistrations = currentEventRegistrations.filter(r => {
    const matchesSearch = 
      r.athleteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.contingentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.targetNumber && r.targetNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = currentEventRegistrations.filter(r => r.status === 'PENDING_PAYMENT').length;
  const verifiedCount = currentEventRegistrations.filter(r => r.status === 'VERIFIED').length;
  const rejectedCount = currentEventRegistrations.filter(r => r.status === 'REJECTED').length;

  const handleSaveTarget = (id: string) => {
    if (!targetNumberInput.trim()) {
      alert('Masukkan nomor target bantalan, misal: 04A');
      return;
    }
    onVerifyRegistration(id, 'VERIFIED', targetNumberInput.toUpperCase(), 'Nomor bantalan disetujui');
    setEditingTargetId(null);
    setTargetNumberInput('');
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Stats */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Modul Verifikasi Berkas & Alokasi Bantalan</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Verifikasi Pendaftaran Kontingen
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Event: <span className="text-amber-400 font-semibold">{event?.name || 'Seluruh Event'}</span>
            </p>
          </div>

          {/* Stat Badges */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <span className="text-[10px] font-semibold block uppercase">Menunggu</span>
              <span className="text-xl font-extrabold">{pendingCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="text-[10px] font-semibold block uppercase">Terverifikasi</span>
              <span className="text-xl font-extrabold">{verifiedCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
              <span className="text-[10px] font-semibold block uppercase">Ditolak</span>
              <span className="text-xl font-extrabold">{rejectedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Cari atlet, klub, bantalan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-950 rounded-lg border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-neutral-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-950 rounded-lg border border-neutral-700 text-neutral-200 text-xs focus:outline-none"
          >
            <option value="ALL">Semua Status ({currentEventRegistrations.length})</option>
            <option value="PENDING_PAYMENT">Menunggu Verifikasi ({pendingCount})</option>
            <option value="VERIFIED">Terverifikasi ({verifiedCount})</option>
            <option value="REJECTED">Ditolak ({rejectedCount})</option>
          </select>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-neutral-950 text-neutral-400 uppercase tracking-wider font-semibold border-b border-neutral-800 text-[11px]">
              <tr>
                <th className="p-4">No. Target</th>
                <th className="p-4">Nama Atlet</th>
                <th className="p-4">Klub / Kontingen</th>
                <th className="p-4">Kategori Lomba</th>
                <th className="p-4">Biaya & Bukti</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredRegistrations.map((reg) => {
                const category = event?.categories.find(c => c.id === reg.categoryId);

                return (
                  <tr key={reg.id} className="hover:bg-neutral-800/50 transition">
                    {/* Target lane */}
                    <td className="p-4">
                      {editingTargetId === reg.id ? (
                        <div className="flex items-center space-x-1">
                          <input
                            type="text"
                            placeholder="04A"
                            value={targetNumberInput}
                            onChange={(e) => setTargetNumberInput(e.target.value)}
                            className="w-16 p-1.5 bg-neutral-950 rounded border border-amber-500 text-white font-mono text-xs uppercase"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveTarget(reg.id)}
                            className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-500"
                            title="Simpan"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingTargetId(null)}
                            className="p-1.5 bg-neutral-700 text-white rounded hover:bg-neutral-600"
                            title="Batal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className={`font-mono font-bold px-2.5 py-1 rounded text-xs border ${
                            reg.targetNumber 
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                              : 'bg-neutral-800 text-neutral-500 border-neutral-700'
                          }`}>
                            {reg.targetNumber || 'Belum Ada'}
                          </span>
                          <button
                            onClick={() => {
                              setEditingTargetId(reg.id);
                              setTargetNumberInput(reg.targetNumber || '');
                            }}
                            className="text-neutral-500 hover:text-white text-[10px] underline"
                          >
                            Ubah
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Athlete Name */}
                    <td className="p-4">
                      <p className="font-bold text-white text-sm">{reg.athleteName}</p>
                      <p className="text-[11px] text-neutral-500">{reg.gender}</p>
                    </td>

                    {/* Contingent */}
                    <td className="p-4">
                      <p className="font-semibold text-neutral-200">{reg.contingentName}</p>
                      <p className="text-[10px] text-neutral-500">{new Date(reg.registeredAt).toLocaleDateString('id-ID')}</p>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {category?.name || 'Nomor Pertandingan'}
                      </span>
                    </td>

                    {/* Fee & Payment proof */}
                    <td className="p-4">
                      <p className="font-semibold text-white">{formatRupiah(reg.paymentAmount)}</p>
                      {reg.paymentProofUrl ? (
                        <button
                          onClick={() => setSelectedProofUrl(reg.paymentProofUrl || '')}
                          className="text-cyan-400 hover:text-cyan-300 text-[11px] inline-flex items-center space-x-1 mt-0.5"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Lihat Bukti Transfer</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-neutral-500">Tanpa Bukti</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      {reg.status === 'VERIFIED' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" />
                          <span>Terverifikasi</span>
                        </span>
                      )}
                      {reg.status === 'PENDING_PAYMENT' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" />
                          <span>Menunggu</span>
                        </span>
                      )}
                      {reg.status === 'REJECTED' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
                          <XCircle className="w-3 h-3" />
                          <span>Ditolak</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {reg.status !== 'VERIFIED' && (
                          <button
                            id={`btn-verify-${reg.id}`}
                            onClick={() => {
                              const autoTarget = reg.targetNumber || `0${Math.floor(Math.random() * 8) + 1}A`;
                              onVerifyRegistration(reg.id, 'VERIFIED', autoTarget, 'Verifikasi berkas & bukti transfer disetujui');
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>
                        )}
                        {reg.status !== 'REJECTED' && (
                          <button
                            onClick={() => {
                              const reason = prompt('Masukkan alasan penolakan berkas:', 'Bukti transfer tidak terbaca / kuota penuh');
                              if (reason) {
                                onVerifyRegistration(reg.id, 'REJECTED', undefined, reason);
                              }
                            }}
                            className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg text-xs font-semibold transition"
                          >
                            Tolak
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRegistrations.length === 0 && (
          <div className="p-12 text-center text-neutral-500 space-y-2">
            <Users className="w-8 h-8 mx-auto text-neutral-600" />
            <p className="text-sm font-semibold text-neutral-400">Tidak ada data pendaftaran atlet yang cocok</p>
          </div>
        )}
      </div>

      {/* Proof of Payment Viewer Modal */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-neutral-900 rounded-2xl border border-neutral-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Bukti Pembayaran / Slip Bank</span>
              </h3>
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-neutral-700 bg-neutral-950">
              <img src={selectedProofUrl} alt="Bukti Transfer" className="w-full max-h-80 object-contain" />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedProofUrl(null)}
                className="px-4 py-2 bg-neutral-800 text-neutral-200 text-xs rounded-xl font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
