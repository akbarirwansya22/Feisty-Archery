import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Calendar, 
  MapPin, 
  Target, 
  Sparkles, 
  Layers, 
  FileText, 
  DollarSign, 
  Users, 
  Check, 
  HelpCircle,
  Building
} from 'lucide-react';
import { ArcheryEvent, Category, Division, AgeCategory, Gender, EliminationType } from '../../types';

interface EventBuilderProps {
  onEventCreated: (newEvent: ArcheryEvent) => void;
  onCancel?: () => void;
}

interface DynamicCategoryDraft {
  id: string;
  name: string;
  division: Division;
  ageCategory: AgeCategory;
  gender: Gender;
  distanceMeters: number;
  targetFaceCm: number;
  formatQualification: string;
  arrowsPerEnd: number;
  endsPerSession: number;
  sessionsCount: number;
  eliminationType: EliminationType;
  eliminationQuota: number;
  fee: number;
  quota: number;
}

export const EventBuilder: React.FC<EventBuilderProps> = ({
  onEventCreated,
  onCancel
}) => {
  // Event Profile State
  const [name, setName] = useState('');
  const [organizerName, setOrganizerName] = useState('Pengcab / EO Panahan Profesional');
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('Jakarta');
  const [province, setProvince] = useState('DKI Jakarta');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-04');
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-10-20');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=1200&q=80');

  // Dynamic Categories Draft State
  const [categories, setCategories] = useState<DynamicCategoryDraft[]>([
    {
      id: 'draft-1',
      name: 'Recurve Umum Putra 70m',
      division: 'Recurve',
      ageCategory: 'Umum',
      gender: 'Putra',
      distanceMeters: 70,
      targetFaceCm: 122,
      formatQualification: '2 Sesi x 6 Seri (72 Panah)',
      arrowsPerEnd: 6,
      endsPerSession: 6,
      sessionsCount: 2,
      eliminationType: 'SET_SYSTEM',
      eliminationQuota: 8,
      fee: 350000,
      quota: 32
    },
    {
      id: 'draft-2',
      name: 'Compound Umum Putra 50m',
      division: 'Compound',
      ageCategory: 'Umum',
      gender: 'Putra',
      distanceMeters: 50,
      targetFaceCm: 80,
      formatQualification: '2 Sesi x 6 Seri (72 Panah)',
      arrowsPerEnd: 6,
      endsPerSession: 6,
      sessionsCount: 2,
      eliminationType: 'CUMULATIVE_SCORE',
      eliminationQuota: 8,
      fee: 350000,
      quota: 32
    }
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Quick Preset Templates
  const applyStandardPerpaniTemplate = () => {
    setCategories([
      {
        id: `draft-${Date.now()}-1`,
        name: 'Recurve Umum Putra 70m',
        division: 'Recurve',
        ageCategory: 'Umum',
        gender: 'Putra',
        distanceMeters: 70,
        targetFaceCm: 122,
        formatQualification: '2 Sesi x 6 Seri (72 Panah)',
        arrowsPerEnd: 6,
        endsPerSession: 6,
        sessionsCount: 2,
        eliminationType: 'SET_SYSTEM',
        eliminationQuota: 16,
        fee: 350000,
        quota: 48
      },
      {
        id: `draft-${Date.now()}-2`,
        name: 'Recurve Umum Putri 70m',
        division: 'Recurve',
        ageCategory: 'Umum',
        gender: 'Putri',
        distanceMeters: 70,
        targetFaceCm: 122,
        formatQualification: '2 Sesi x 6 Seri (72 Panah)',
        arrowsPerEnd: 6,
        endsPerSession: 6,
        sessionsCount: 2,
        eliminationType: 'SET_SYSTEM',
        eliminationQuota: 16,
        fee: 350000,
        quota: 48
      },
      {
        id: `draft-${Date.now()}-3`,
        name: 'Compound Umum Putra 50m',
        division: 'Compound',
        ageCategory: 'Umum',
        gender: 'Putra',
        distanceMeters: 50,
        targetFaceCm: 80,
        formatQualification: '2 Sesi x 6 Seri (72 Panah)',
        arrowsPerEnd: 6,
        endsPerSession: 6,
        sessionsCount: 2,
        eliminationType: 'CUMULATIVE_SCORE',
        eliminationQuota: 16,
        fee: 350000,
        quota: 48
      },
      {
        id: `draft-${Date.now()}-4`,
        name: 'Nasional / Standar Bow Umum 30m',
        division: 'Nasional',
        ageCategory: 'Umum',
        gender: 'Putra',
        distanceMeters: 30,
        targetFaceCm: 80,
        formatQualification: '2 Sesi x 6 Seri (72 Panah)',
        arrowsPerEnd: 6,
        endsPerSession: 6,
        sessionsCount: 2,
        eliminationType: 'SET_SYSTEM',
        eliminationQuota: 16,
        fee: 300000,
        quota: 48
      },
      {
        id: `draft-${Date.now()}-5`,
        name: 'Barebow Umum Putra 50m',
        division: 'Barebow',
        ageCategory: 'Umum',
        gender: 'Putra',
        distanceMeters: 50,
        targetFaceCm: 122,
        formatQualification: '2 Sesi x 6 Seri (72 Panah)',
        arrowsPerEnd: 6,
        endsPerSession: 6,
        sessionsCount: 2,
        eliminationType: 'SET_SYSTEM',
        eliminationQuota: 8,
        fee: 300000,
        quota: 32
      }
    ]);
  };

  const applyJuniorTemplate = () => {
    setCategories([
      {
        id: `draft-${Date.now()}-1`,
        name: 'Nasional U-12 Putra 20m',
        division: 'Nasional',
        ageCategory: 'U-12',
        gender: 'Putra',
        distanceMeters: 20,
        targetFaceCm: 80,
        formatQualification: '2 Sesi x 6 Seri (72 Panah)',
        arrowsPerEnd: 6,
        endsPerSession: 6,
        sessionsCount: 2,
        eliminationType: 'SET_SYSTEM',
        eliminationQuota: 8,
        fee: 250000,
        quota: 32
      },
      {
        id: `draft-${Date.now()}-2`,
        name: 'Nasional U-12 Putri 20m',
        division: 'Nasional',
        ageCategory: 'U-12',
        gender: 'Putri',
        distanceMeters: 20,
        targetFaceCm: 80,
        formatQualification: '2 Sesi x 6 Seri (72 Panah)',
        arrowsPerEnd: 6,
        endsPerSession: 6,
        sessionsCount: 2,
        eliminationType: 'SET_SYSTEM',
        eliminationQuota: 8,
        fee: 250000,
        quota: 32
      },
      {
        id: `draft-${Date.now()}-3`,
        name: 'Recurve U-15 Putra 50m',
        division: 'Recurve',
        ageCategory: 'U-15',
        gender: 'Putra',
        distanceMeters: 50,
        targetFaceCm: 122,
        formatQualification: '2 Sesi x 6 Seri (72 Panah)',
        arrowsPerEnd: 6,
        endsPerSession: 6,
        sessionsCount: 2,
        eliminationType: 'SET_SYSTEM',
        eliminationQuota: 8,
        fee: 300000,
        quota: 32
      }
    ]);
  };

  // Add individual category
  const handleAddCategory = () => {
    const newCat: DynamicCategoryDraft = {
      id: `draft-${Date.now()}`,
      name: 'Kategori Baru',
      division: 'Recurve',
      ageCategory: 'Umum',
      gender: 'Putra',
      distanceMeters: 50,
      targetFaceCm: 122,
      formatQualification: '2 Sesi x 6 Seri (72 Panah)',
      arrowsPerEnd: 6,
      endsPerSession: 6,
      sessionsCount: 2,
      eliminationType: 'SET_SYSTEM',
      eliminationQuota: 8,
      fee: 300000,
      quota: 32
    };
    setCategories([...categories, newCat]);
  };

  const handleUpdateCategory = (index: number, field: keyof DynamicCategoryDraft, value: any) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-update standard title
    if (field === 'division' || field === 'ageCategory' || field === 'gender' || field === 'distanceMeters') {
      const c = updated[index];
      c.name = `${c.division} ${c.ageCategory} ${c.gender} ${c.distanceMeters}m`;
      // Auto switch elimination rule by division convention
      if (c.division === 'Compound') {
        c.eliminationType = 'CUMULATIVE_SCORE';
        c.targetFaceCm = 80;
      } else {
        c.eliminationType = 'SET_SYSTEM';
      }
    }

    setCategories(updated);
  };

  const handleRemoveCategory = (index: number) => {
    if (categories.length <= 1) {
      alert('Event wajib memiliki minimal satu kategori perlombaan.');
      return;
    }
    setCategories(categories.filter((_, idx) => idx !== index));
  };

  // Save Event and Categories
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Harap isi judul / nama kejuaraan event');
      return;
    }
    if (!venueName.trim()) {
      alert('Harap isi nama venue / lapangan panahan');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name,
        organizerName,
        venueName,
        city,
        province,
        startDate,
        endDate,
        registrationDeadline,
        description: description || `Kejuaraan panahan resmi diselenggarakan oleh ${organizerName}.`,
        bannerUrl,
        categories: categories.map(c => ({
          name: c.name,
          division: c.division,
          ageCategory: c.ageCategory,
          gender: c.gender,
          distanceMeters: Number(c.distanceMeters),
          targetFaceCm: Number(c.targetFaceCm),
          formatQualification: c.formatQualification,
          arrowsPerEnd: Number(c.arrowsPerEnd),
          endsPerSession: Number(c.endsPerSession),
          sessionsCount: Number(c.sessionsCount),
          eliminationType: c.eliminationType,
          eliminationQuota: Number(c.eliminationQuota),
          fee: Number(c.fee),
          quota: Number(c.quota)
        }))
      };

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.success) {
        setFeedbackMessage('Event dan seluruh Kategori Kustom berhasil diterbitkan!');
        setTimeout(() => {
          onEventCreated(json.data);
        }, 600);
      } else {
        alert(json.message || 'Gagal menyimpan event');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memproses data event.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>Organizer Dashboard & Dynamic Event Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Dynamic Event & Custom Category Builder
            </h1>
            <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
              Sebagai Event Organizer (EO), Anda memiliki kendali penuh untuk mendefinisikan nomor pertandingan: Kategori Umur, Divisi, Jarak Tembak, Target Face, hingga Format Skoring (Set System vs Total Score).
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              id="btn-preset-perpani"
              onClick={applyStandardPerpaniTemplate}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm"
              title="Otomatis terapkan 5 kategori resmi PERPANI"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Template Standar PERPANI</span>
            </button>
            <button
              type="button"
              onClick={applyJuniorTemplate}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-cyan-300 border border-neutral-700 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Template Usia Dini / Junior</span>
            </button>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-sm flex items-center space-x-2 animate-bounce">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="font-bold">{feedbackMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSaveEvent} className="space-y-8">
        {/* Step 1: Profil Event */}
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-md">
          <div className="flex items-center space-x-2 border-b border-neutral-800 pb-3">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              1. Informasi & Profil Kejuaraan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-neutral-300">Nama Kejuaraan / Event *</label>
              <input
                id="input-builder-event-name"
                type="text"
                placeholder="Contoh: Piala Gubernur Jawa Barat Archery Open 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-neutral-950 rounded-xl border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500 font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-neutral-300">Nama Penyelenggara (EO / Pengcab)</label>
              <input
                type="text"
                placeholder="Pengprov PERPANI / Archery Club"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="w-full p-3 bg-neutral-950 rounded-xl border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-neutral-300">Nama Venue / Lapangan *</label>
              <input
                id="input-builder-venue"
                type="text"
                placeholder="Contoh: Lapangan Panahan Arcamanik"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full p-3 bg-neutral-950 rounded-xl border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-neutral-300">Kota / Kabupaten *</label>
              <input
                type="text"
                placeholder="Bandung"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-3 bg-neutral-950 rounded-xl border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-neutral-300">Provinsi *</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full p-3 bg-neutral-950 rounded-xl border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="DKI Jakarta">DKI Jakarta</option>
                <option value="Jawa Barat">Jawa Barat</option>
                <option value="Jawa Timur">Jawa Timur</option>
                <option value="Jawa Tengah">Jawa Tengah</option>
                <option value="Banten">Banten</option>
                <option value="DI Yogyakarta">DI Yogyakarta</option>
                <option value="Sumatera Utara">Sumatera Utara</option>
                <option value="Bali">Bali</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-neutral-300">Tanggal Mulai Kejuaraan</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 bg-neutral-950 rounded-xl border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-neutral-300">Tanggal Selesai</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 bg-neutral-950 rounded-xl border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-neutral-300">Batas Akhir Pendaftaran</label>
              <input
                type="date"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                className="w-full p-3 bg-neutral-950 rounded-xl border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3 space-y-1.5">
              <label className="font-bold text-neutral-300">Deskripsi & Peraturan Umum</label>
              <textarea
                placeholder="Jelaskan mengenai format lomba, syarat atlet, ketentuan busur & anak panah..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-3 bg-neutral-950 rounded-xl border border-neutral-700 text-white text-xs focus:outline-none focus:border-amber-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Step 2: DYNAMIC CUSTOM CATEGORY BUILDER */}
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-3">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-lg font-bold text-white">
                  2. Custom Category Builder ({categories.length} Nomor Pertandingan)
                </h2>
                <p className="text-xs text-neutral-400">
                  Konfigurasi fleksibel: Divisi, Kategori Umur, Jarak, Target Face, Kuota, dan Sistem Skoring.
                </p>
              </div>
            </div>

            <button
              type="button"
              id="btn-add-custom-category"
              onClick={handleAddCategory}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-cyan-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Kategori Baru</span>
            </button>
          </div>

          {/* Categories List */}
          <div className="space-y-4">
            {categories.map((cat, idx) => (
              <div 
                key={cat.id}
                id={`category-draft-card-${idx + 1}`}
                className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4 relative group hover:border-neutral-700 transition"
              >
                {/* Header per category */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 font-extrabold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={cat.name}
                      onChange={(e) => handleUpdateCategory(idx, 'name', e.target.value)}
                      className="font-bold text-white text-sm sm:text-base bg-transparent border-b border-transparent hover:border-neutral-600 focus:border-amber-500 focus:outline-none px-1"
                      placeholder="Nama Kategori..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 font-semibold border border-neutral-700">
                      {cat.eliminationType === 'SET_SYSTEM' ? 'Olympic Set System' : 'Cumulative 150 Score'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(idx)}
                      className="p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition"
                      title="Hapus nomor pertandingan ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                  {/* Divisi */}
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-400">Divisi Busur</label>
                    <select
                      value={cat.division}
                      onChange={(e) => handleUpdateCategory(idx, 'division', e.target.value)}
                      className="w-full p-2.5 bg-neutral-900 rounded-lg border border-neutral-700 text-white font-medium focus:outline-none focus:border-amber-500"
                    >
                      <option value="Recurve">Recurve</option>
                      <option value="Compound">Compound</option>
                      <option value="Nasional">Nasional / Standar</option>
                      <option value="Barebow">Barebow</option>
                      <option value="Tradisional">Tradisional</option>
                    </select>
                  </div>

                  {/* Kategori Umur */}
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-400">Kategori Umur</label>
                    <select
                      value={cat.ageCategory}
                      onChange={(e) => handleUpdateCategory(idx, 'ageCategory', e.target.value)}
                      className="w-full p-2.5 bg-neutral-900 rounded-lg border border-neutral-700 text-white font-medium focus:outline-none focus:border-amber-500"
                    >
                      <option value="U-9">U-9 (Di bawah 9 thn)</option>
                      <option value="U-12">U-12 (SD)</option>
                      <option value="U-15">U-15 (SMP)</option>
                      <option value="U-18">U-18 (SMA)</option>
                      <option value="Umum">Umum (Open)</option>
                      <option value="Master 50+">Master 50+</option>
                    </select>
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-400">Jenis Kelamin</label>
                    <select
                      value={cat.gender}
                      onChange={(e) => handleUpdateCategory(idx, 'gender', e.target.value)}
                      className="w-full p-2.5 bg-neutral-900 rounded-lg border border-neutral-700 text-white font-medium focus:outline-none"
                    >
                      <option value="Putra">Putra</option>
                      <option value="Putri">Putri</option>
                      <option value="Campuran">Campuran (Mix)</option>
                    </select>
                  </div>

                  {/* Jarak Tembak */}
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-400">Jarak Tembak (Meter)</label>
                    <select
                      value={cat.distanceMeters}
                      onChange={(e) => handleUpdateCategory(idx, 'distanceMeters', Number(e.target.value))}
                      className="w-full p-2.5 bg-neutral-900 rounded-lg border border-neutral-700 text-amber-400 font-bold focus:outline-none"
                    >
                      <option value={70}>70 Meter (Olympic)</option>
                      <option value={60}>60 Meter</option>
                      <option value={50}>50 Meter (Compound/Barebow)</option>
                      <option value={40}>40 Meter</option>
                      <option value={30}>30 Meter (Nasional)</option>
                      <option value={20}>20 Meter</option>
                      <option value={15}>15 Meter</option>
                      <option value={10}>10 Meter</option>
                    </select>
                  </div>

                  {/* Target Face */}
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-400">Ukuran Target Face</label>
                    <select
                      value={cat.targetFaceCm}
                      onChange={(e) => handleUpdateCategory(idx, 'targetFaceCm', Number(e.target.value))}
                      className="w-full p-2.5 bg-neutral-900 rounded-lg border border-neutral-700 text-white font-medium focus:outline-none"
                    >
                      <option value={122}>122 cm (Full Ring)</option>
                      <option value={80}>80 cm (6-Ring / Full)</option>
                      <option value={40}>40 cm (Single / 3-Spot)</option>
                    </select>
                  </div>

                  {/* Sistem Eliminasi */}
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-400">Format Eliminasi</label>
                    <select
                      value={cat.eliminationType}
                      onChange={(e) => handleUpdateCategory(idx, 'eliminationType', e.target.value)}
                      className="w-full p-2.5 bg-neutral-900 rounded-lg border border-neutral-700 text-cyan-300 font-semibold focus:outline-none"
                    >
                      <option value="SET_SYSTEM">Set System (Recurve / 2-1-0)</option>
                      <option value="CUMULATIVE_SCORE">Total Score (Compound / 150)</option>
                    </select>
                  </div>
                </div>

                {/* Sub Row: Quota & Fee */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-neutral-800/80">
                  <div className="space-y-1">
                    <label className="font-medium text-neutral-400">Kuota Peserta Maksimal</label>
                    <input
                      type="number"
                      value={cat.quota}
                      onChange={(e) => handleUpdateCategory(idx, 'quota', Number(e.target.value))}
                      className="w-full p-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                      min={4}
                      max={256}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-neutral-400">Biaya Pendaftaran (Rp)</label>
                    <input
                      type="number"
                      value={cat.fee}
                      onChange={(e) => handleUpdateCategory(idx, 'fee', Number(e.target.value))}
                      className="w-full p-2 bg-neutral-900 rounded-lg border border-neutral-700 text-amber-400 font-bold"
                      step={25000}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-neutral-400">Bagan Eliminasi (Cut-off)</label>
                    <select
                      value={cat.eliminationQuota}
                      onChange={(e) => handleUpdateCategory(idx, 'eliminationQuota', Number(e.target.value))}
                      className="w-full p-2 bg-neutral-900 rounded-lg border border-neutral-700 text-white"
                    >
                      <option value={4}>Top 4 (Semifinal Langsung)</option>
                      <option value={8}>Top 8 (Perempat Final)</option>
                      <option value={16}>Top 16 (Babak 16 Besar)</option>
                      <option value={32}>Top 32 (Babak 32 Besar)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-neutral-400">Format Kualifikasi</label>
                    <input
                      type="text"
                      value={cat.formatQualification}
                      onChange={(e) => handleUpdateCategory(idx, 'formatQualification', e.target.value)}
                      className="w-full p-2 bg-neutral-900 rounded-lg border border-neutral-700 text-neutral-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit & Publish Bar */}
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="text-xs text-neutral-400">
            <p className="font-semibold text-white">Siap Menerbitkan Event?</p>
            <p>Event akan otomatis tampil pada Portal Publik dan membuka modul pendaftaran & skoring.</p>
          </div>

          <div className="flex items-center space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              id="btn-publish-event"
              disabled={isSaving}
              className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-700 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition transform active:scale-95 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan ke Database...' : 'Terbitkan Kejuaraan & Simpan Kategori'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
