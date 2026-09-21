import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Trash2, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle,
  CreditCard,
  Building,
  Target
} from 'lucide-react';
import { ArcheryEvent, Category } from '../../types';

interface RegistrationModalProps {
  event: ArcheryEvent | null;
  onClose: () => void;
  onSubmitRegistration: (data: {
    eventId: string;
    categoryId: string;
    contingentName: string;
    athletesList: { athleteName: string; gender: 'Putra' | 'Putri'; birthDate?: string; nationalId?: string }[];
    paymentProofUrl?: string;
    notes?: string;
  }) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  event,
  onClose,
  onSubmitRegistration
}) => {
  if (!event) return null;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    event.categories.length > 0 ? event.categories[0].id : ''
  );
  const [contingentName, setContingentName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [athletes, setAthletes] = useState<Array<{ athleteName: string; gender: 'Putra' | 'Putri'; birthDate: string; nationalId: string }>>([
    { athleteName: '', gender: 'Putra', birthDate: '2005-01-01', nationalId: '' }
  ]);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedCategory = event.categories.find(c => c.id === selectedCategoryId) || event.categories[0];
  const feePerAthlete = selectedCategory ? selectedCategory.fee : 350000;
  const totalPayment = feePerAthlete * athletes.length;

  const handleAddAthlete = () => {
    setAthletes([
      ...athletes, 
      { athleteName: '', gender: selectedCategory?.gender === 'Putri' ? 'Putri' : 'Putra', birthDate: '2005-01-01', nationalId: '' }
    ]);
  };

  const handleRemoveAthlete = (index: number) => {
    if (athletes.length <= 1) return;
    setAthletes(athletes.filter((_, idx) => idx !== index));
  };

  const handleUpdateAthlete = (index: number, field: string, value: any) => {
    const updated = [...athletes];
    updated[index] = { ...updated[index], [field]: value };
    setAthletes(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!contingentName.trim()) {
      setErrorMessage('Harap isi nama klub, kontingen, atau sekolah');
      return;
    }

    for (let i = 0; i < athletes.length; i++) {
      if (!athletes[i].athleteName.trim()) {
        setErrorMessage(`Harap lengkapi nama atlet nomor #${i + 1}`);
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitRegistration({
        eventId: event.id,
        categoryId: selectedCategoryId,
        contingentName,
        athletesList: athletes,
        paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
        notes: notes || `Pendaftaran oleh ${managerName} (${managerPhone})`
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div 
        id="modal-registration"
        className="relative w-full max-w-3xl bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-6 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                Pendaftaran Atlet / Kontingen
              </span>
              <span className="text-xs text-neutral-400">Online Registration</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Formulir Pendaftaran {event.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-neutral-200">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step 1: Pilih Kategori */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
              <Target className="w-4 h-4 text-amber-400" />
              <span>1. Pilih Kategori Perlombaan</span>
            </label>
            <select
              id="select-registration-category"
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full p-3 bg-neutral-950 rounded-xl border border-neutral-700 text-white font-medium text-sm focus:outline-none focus:border-amber-500"
            >
              {event.categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.division} - {cat.distanceMeters}m) — Biaya: {formatRupiah(cat.fee)}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Info Klub / Kontingen */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
              <Building className="w-4 h-4 text-cyan-400" />
              <span>2. Informasi Klub / Kontingen / Sekolah</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <input
                  id="input-contingent-name"
                  type="text"
                  placeholder="Nama Klub / Kontingen *"
                  value={contingentName}
                  onChange={(e) => setContingentName(e.target.value)}
                  className="w-full p-3 bg-neutral-950 rounded-xl border border-neutral-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div className="sm:col-span-1">
                <input
                  type="text"
                  placeholder="Nama Official / Pelatih"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full p-3 bg-neutral-950 rounded-xl border border-neutral-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="sm:col-span-1">
                <input
                  type="text"
                  placeholder="No. WhatsApp / HP *"
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  className="w-full p-3 bg-neutral-950 rounded-xl border border-neutral-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Daftar Atlet */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>3. Data Pemanah / Atlet ({athletes.length} Atlet)</span>
              </label>
              <button
                type="button"
                id="btn-add-athlete"
                onClick={handleAddAthlete}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold transition"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Tambah Atlet</span>
              </button>
            </div>

            <div className="space-y-3">
              {athletes.map((athlete, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs"
                >
                  <div className="sm:col-span-1 text-center font-bold text-neutral-500">
                    #{idx + 1}
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Nama Lengkap Atlet *"
                      value={athlete.athleteName}
                      onChange={(e) => handleUpdateAthlete(idx, 'athleteName', e.target.value)}
                      className="w-full p-2.5 bg-neutral-900 rounded-lg border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <select
                      value={athlete.gender}
                      onChange={(e) => handleUpdateAthlete(idx, 'gender', e.target.value)}
                      className="w-full p-2.5 bg-neutral-900 rounded-lg border border-neutral-700 text-white text-xs focus:outline-none"
                    >
                      <option value="Putra">Putra</option>
                      <option value="Putri">Putri</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="NIK / No. KIA / KTP"
                      value={athlete.nationalId}
                      onChange={(e) => handleUpdateAthlete(idx, 'nationalId', e.target.value)}
                      className="w-full p-2.5 bg-neutral-900 rounded-lg border border-neutral-700 text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-center">
                    {athletes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAthlete(idx)}
                        className="p-2 text-neutral-500 hover:text-red-400 transition"
                        title="Hapus atlet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 4: Ringkasan Biaya & Bukti Pembayaran */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <p className="text-xs font-semibold text-neutral-400">Total Biaya Pendaftaran</p>
                <p className="text-lg font-extrabold text-amber-400">
                  {formatRupiah(totalPayment)}
                </p>
              </div>
              <span className="text-xs text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
                {athletes.length} Atlet x {formatRupiah(feePerAthlete)}
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-300 flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                <span>Upload Bukti Transfer Pembayaran</span>
              </label>
              
              <div 
                onClick={() => setProofUploaded(!proofUploaded)}
                className={`cursor-pointer p-4 rounded-xl border-2 border-dashed text-center transition flex flex-col items-center justify-center space-y-2 ${
                  proofUploaded 
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-neutral-700 bg-neutral-900/50 hover:border-neutral-500 text-neutral-400'
                }`}
              >
                {proofUploaded ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <span className="text-xs font-bold">Bukti Pembayaran Terlampir: bukti_transfer_bca.jpg</span>
                    <span className="text-[11px] text-neutral-400">Klik untuk mengganti</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6 text-amber-400" />
                    <span className="text-xs font-medium">Klik untuk melampirkan screenshot / foto struk transfer bank</span>
                    <span className="text-[11px] text-neutral-500">Format JPG, PNG atau PDF (Maks. 5 MB)</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">Catatan Tambahan (Opsional):</label>
              <textarea
                placeholder="Misal: Nomor rekening pengirim atau permintaan slot sesi target tertentu..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-neutral-900 rounded-xl border border-neutral-700 text-white text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              id="btn-submit-registration"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-700 text-neutral-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition transform active:scale-95"
            >
              {isSubmitting ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran & Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
