import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  Printer, 
  Palette, 
  Users, 
  ShieldCheck, 
  Award, 
  Camera, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Eye, 
  QrCode, 
  Image as ImageIcon,
  Building2, 
  Sparkles,
  Search,
  Filter,
  Layers,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  ArcheryEvent, 
  Registration, 
  AccreditationRole, 
  AccreditedPerson, 
  IdCardDesignConfig, 
  SponsorItem 
} from '../../types';

interface IdCardAccreditationStudioProps {
  event: ArcheryEvent | null;
  registrations: Registration[];
}

// Preset logos for quick setup
const LOGO_PRESETS = [
  {
    name: 'Logo Target Panahan Emas',
    url: 'https://images.unsplash.com/photo-1511067007772-9da29974ce4b?w=200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Logo Lambang PERPANI Resmi',
    url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&auto=format&fit=crop&q=80'
  },
  {
    name: 'Logo Garuda Indonesia Kejuaraan',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80'
  }
];

const SPONSOR_PRESETS: Omit<SponsorItem, 'id'>[] = [
  { name: 'Bank Mandiri', tier: 'MAIN', logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80' },
  { name: 'Easton Archery', tier: 'GOLD', logoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80' },
  { name: 'Hoyt Archery', tier: 'OFFICIAL', logoUrl: '' },
  { name: 'Win & Win Racing', tier: 'OFFICIAL', logoUrl: '' },
  { name: 'Specs Indonesia', tier: 'OFFICIAL', logoUrl: '' }
];

const ZONE_DESCRIPTIONS: Record<number, { title: string; desc: string }> = {
  1: { title: 'Zona 1: Shooting Line & Target', desc: 'Garis Tembak & Area Sasaran' },
  2: { title: 'Zona 2: Waiting Line & Coaches Box', desc: 'Garis Tunggu & Tenda Atlet' },
  3: { title: 'Zona 3: DOS & Timer Tower', desc: 'Menara Wasit Pengatur Tembak' },
  4: { title: 'Zona 4: Secretariat & Result IT', desc: 'Sekretariat, Server & Ruang Medis' },
  5: { title: 'Zona 5: VIP Lounge & Podium', desc: 'Tribun Kehormatan & Panggung UPP' },
  6: { title: 'Zona 6: Media Center & Photo Line', desc: 'Area Kerja Jurnalis & Fotografer' }
};

export const IdCardAccreditationStudio: React.FC<IdCardAccreditationStudioProps> = ({
  event,
  registrations
}) => {
  // Configuration State
  const [config, setConfig] = useState<IdCardDesignConfig>({
    eventLogoUrl: 'https://images.unsplash.com/photo-1511067007772-9da29974ce4b?w=200&auto=format&fit=crop&q=80',
    organizationLogoUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&auto=format&fit=crop&q=80',
    badgeTitle: event ? event.name.toUpperCase() : 'KEJUARAAN PANAHAN NASIONAL PERPANI 2026',
    badgeSubtitle: event ? `${event.venueName.toUpperCase()} • ${event.city.toUpperCase()}` : 'STADION ARJUNA BANDUNG • RESMI PERPANI',
    headerTheme: 'EMERALD',
    sponsors: [
      { id: 'sp-1', name: 'Bank Mandiri', tier: 'MAIN', logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80' },
      { id: 'sp-2', name: 'Easton Archery', tier: 'GOLD', logoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80' },
      { id: 'sp-3', name: 'Hoyt Archery', tier: 'OFFICIAL', logoUrl: '' },
      { id: 'sp-4', name: 'Win & Win', tier: 'OFFICIAL', logoUrl: '' }
    ],
    footerNote: 'Kartu wajib dikalungkan selama berada di Field of Play (FOP). Dilarang dipindahtangankan.',
    showZoneMatrix: true,
    showLanyardSlot: true
  });

  // Accredited Personnel List
  const [personnel, setPersonnel] = useState<AccreditedPerson[]>([]);
  const [isLoadingPersonnel, setIsLoadingPersonnel] = useState<boolean>(true);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);

  // Sub-tabs in Studio
  const [studioTab, setStudioTab] = useState<'DESIGNER' | 'PERSONNEL' | 'BATCH_PRINT'>('DESIGNER');

  // Preview Person selection
  const [previewRole, setPreviewRole] = useState<AccreditationRole>('PANITIA');
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');

  // Generated QR Code Data URL for the active preview card
  const [previewQrUrl, setPreviewQrUrl] = useState<string>('');

  // New Personnel Form Modal
  const [isAddPersonModalOpen, setIsAddPersonModalOpen] = useState<boolean>(false);
  const [newPersonForm, setNewPersonForm] = useState<{
    fullName: string;
    role: AccreditationRole;
    titleOrDivision: string;
    organization: string;
    photoUrl: string;
    phone: string;
    allowedZones: number[];
  }>({
    fullName: '',
    role: 'PANITIA',
    titleOrDivision: 'Koordinator Lapangan & Pertandingan',
    organization: 'Panitia Pelaksana PERPANI',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    phone: '',
    allowedZones: [1, 2, 3, 4]
  });

  // Filter in personnel table
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Load initial config and personnel
  useEffect(() => {
    fetch('/api/idcard-config')
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setConfig(json.data);
        }
      })
      .catch(console.error);

    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    try {
      setIsLoadingPersonnel(true);
      const res = await fetch('/api/accreditation');
      const json = await res.json();
      if (json.success) {
        setPersonnel(json.data);
        if (json.data.length > 0 && !selectedPersonId) {
          setSelectedPersonId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching personnel:', err);
    } finally {
      setIsLoadingPersonnel(false);
    }
  };

  // Save config to server
  const handleSaveConfig = async () => {
    try {
      setIsSavingConfig(true);
      const res = await fetch('/api/idcard-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const json = await res.json();
      if (json.success) {
        alert('Pengaturan desain template ID Card & Sponsor berhasil disimpan!');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pengaturan template');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Add Sponsor Handler
  const handleAddSponsor = (name: string, tier: 'MAIN' | 'GOLD' | 'OFFICIAL', logoUrl: string) => {
    const newSp: SponsorItem = {
      id: `sp-${Date.now()}`,
      name: name || 'Sponsor Baru',
      tier,
      logoUrl: logoUrl || ''
    };
    setConfig(prev => ({
      ...prev,
      sponsors: [...prev.sponsors, newSp]
    }));
  };

  const handleRemoveSponsor = (id: string) => {
    setConfig(prev => ({
      ...prev,
      sponsors: prev.sponsors.filter(s => s.id !== id)
    }));
  };

  // Add Personnel Handler
  const handleCreatePersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonForm.fullName.trim()) {
      alert('Mohon isi nama lengkap personil');
      return;
    }

    try {
      const res = await fetch('/api/accreditation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPersonForm,
          eventId: event?.id || 'evt-kejurnas-2026'
        })
      });
      const json = await res.json();
      if (json.success) {
        setPersonnel(prev => [json.data, ...prev]);
        setSelectedPersonId(json.data.id);
        setPreviewRole(json.data.role);
        setIsAddPersonModalOpen(false);
        // Reset
        setNewPersonForm({
          fullName: '',
          role: 'PANITIA',
          titleOrDivision: '',
          organization: '',
          photoUrl: '',
          phone: '',
          allowedZones: [1, 2, 4]
        });
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menambahkan data personil akreditasi');
    }
  };

  const handleDeletePersonnel = async (id: string) => {
    if (!confirm('Hapus data akreditasi ini?')) return;
    try {
      const res = await fetch(`/api/accreditation/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setPersonnel(prev => prev.filter(p => p.id !== id));
        if (selectedPersonId === id) {
          const remaining = personnel.filter(p => p.id !== id);
          if (remaining.length > 0) setSelectedPersonId(remaining[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Active Person or Athlete being previewed
  const currentPersonnel = personnel.find(p => p.id === selectedPersonId) || personnel[0];
  const currentAthlete = registrations.find(r => r.id === selectedAthleteId) || registrations[0];

  // Dynamic role color definitions
  const getRoleStyle = (role: AccreditationRole) => {
    switch (role) {
      case 'ATLET':
        return {
          ribbon: 'bg-blue-600 text-white',
          badgeText: 'ATLET RESMI (ARCHER)',
          border: 'border-blue-500',
          accent: 'text-blue-400'
        };
      case 'OFFICIAL':
        return {
          ribbon: 'bg-amber-600 text-white',
          badgeText: 'PELATIH / OFFICIAL (COACH)',
          border: 'border-amber-500',
          accent: 'text-amber-400'
        };
      case 'PANITIA':
        return {
          ribbon: 'bg-rose-600 text-white',
          badgeText: 'PANITIA PELAKSANA (OC)',
          border: 'border-rose-500',
          accent: 'text-rose-400'
        };
      case 'WASIT':
        return {
          ribbon: 'bg-amber-400 text-neutral-950 font-black',
          badgeText: 'DEWAN WASIT & JURI (JUDGE)',
          border: 'border-amber-400',
          accent: 'text-amber-300'
        };
      case 'VIP':
        return {
          ribbon: 'bg-purple-600 text-white',
          badgeText: 'TAMU KEHORMATAN (VIP/VVIP)',
          border: 'border-purple-500',
          accent: 'text-purple-400'
        };
      case 'MEDIA':
        return {
          ribbon: 'bg-cyan-600 text-white',
          badgeText: 'PERS & BROADCASTER (MEDIA)',
          border: 'border-cyan-500',
          accent: 'text-cyan-400'
        };
    }
  };

  // Generate QR for preview card
  useEffect(() => {
    let payload = '';
    if (previewRole === 'ATLET' && currentAthlete) {
      payload = JSON.stringify({
        type: 'ARCHER',
        regId: currentAthlete.id,
        ath: currentAthlete.athleteName,
        target: currentAthlete.targetNumber || 'N/A'
      });
    } else if (currentPersonnel) {
      payload = JSON.stringify({
        type: 'ACCREDITATION',
        accId: currentPersonnel.id,
        code: currentPersonnel.cardCode,
        name: currentPersonnel.fullName,
        role: currentPersonnel.role,
        title: currentPersonnel.titleOrDivision,
        zones: currentPersonnel.allowedZones
      });
    }

    if (payload) {
      QRCode.toDataURL(payload, { 
        width: 180, 
        margin: 1, 
        color: { dark: '#000000', light: '#ffffff' } 
      })
        .then(url => setPreviewQrUrl(url))
        .catch(console.error);
    }
  }, [previewRole, currentPersonnel, currentAthlete]);

  // Header Theme Styles
  const getHeaderThemeClass = () => {
    switch (config.headerTheme) {
      case 'EMERALD':
        return 'from-emerald-700 via-teal-800 to-neutral-900';
      case 'NAVY':
        return 'from-blue-700 via-indigo-900 to-neutral-900';
      case 'CRIMSON':
        return 'from-red-700 via-rose-900 to-neutral-900';
      case 'GOLD':
        return 'from-amber-600 via-amber-800 to-neutral-900';
      case 'CARBON':
        return 'from-neutral-800 via-neutral-900 to-neutral-950';
    }
  };

  const filteredPersonnel = personnel.filter(p => {
    const matchSearch = p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.titleOrDivision.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.cardCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === 'ALL' || p.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      {/* Studio Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950/40 border border-indigo-500/20 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                Desain ID Card & Akreditasi Lapangan
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                World Archery & PERPANI Standard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Studio ID Card Resmi & Akreditasi Multi-Peran
            </h1>
            <p className="text-xs text-neutral-400 max-w-2xl">
              Kustomisasi logo event, sponsor pendukung, zonasi akses lapangan (Field of Play), serta cetak kartu tanda pengenal untuk Panitia, Wasit, VIP, Media, dan Atlet.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Cetak ID Card Terpilih
            </button>
          </div>
        </div>

        {/* Studio Subtabs */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex flex-wrap gap-2">
          <button
            onClick={() => setStudioTab('DESIGNER')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
              studioTab === 'DESIGNER'
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Palette className="w-4 h-4 text-indigo-400" />
            Pengaturan Desain & Sponsor
          </button>
          <button
            onClick={() => setStudioTab('PERSONNEL')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
              studioTab === 'PERSONNEL'
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            Manajemen Personil Akreditasi ({personnel.length})
          </button>
          <button
            onClick={() => setStudioTab('BATCH_PRINT')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
              studioTab === 'BATCH_PRINT'
                ? 'bg-neutral-800 text-white border border-neutral-700'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Lembar Cetak Massal (Batch Print A4)
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      {studioTab !== 'BATCH_PRINT' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Center: Studio Controls or Personnel List (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {studioTab === 'DESIGNER' && (
              <div className="space-y-6">
                {/* 1. Header Text & Event Branding */}
                <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    Branding & Teks Header Kartu
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-neutral-400 mb-1 font-semibold">Judul Kejuaraan (Header Utama)</label>
                      <input 
                        type="text"
                        value={config.badgeTitle}
                        onChange={(e) => setConfig(prev => ({ ...prev, badgeTitle: e.target.value }))}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1 font-semibold">Sub-judul / Lokasi & Tanggal</label>
                      <input 
                        type="text"
                        value={config.badgeSubtitle}
                        onChange={(e) => setConfig(prev => ({ ...prev, badgeSubtitle: e.target.value }))}
                        className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-neutral-400 mb-1.5 font-semibold">Pilihan Tema Warna Header</label>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { id: 'EMERALD', name: 'Emerald', color: 'bg-emerald-600' },
                          { id: 'NAVY', name: 'Navy Blue', color: 'bg-blue-600' },
                          { id: 'CRIMSON', name: 'Crimson', color: 'bg-rose-600' },
                          { id: 'GOLD', name: 'Gold', color: 'bg-amber-500' },
                          { id: 'CARBON', name: 'Carbon', color: 'bg-neutral-800' }
                        ].map(theme => (
                          <button
                            key={theme.id}
                            type="button"
                            onClick={() => setConfig(prev => ({ ...prev, headerTheme: theme.id as any }))}
                            className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-semibold transition ${
                              config.headerTheme === theme.id 
                                ? 'border-white bg-neutral-800 text-white ring-2 ring-indigo-500/50' 
                                : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                            }`}
                          >
                            <span className={`w-4 h-4 rounded-full ${theme.color}`} />
                            <span>{theme.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Logo Event & Organisasi */}
                <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      Logo Event & Federasi (Kiri & Kanan Header)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Event Logo */}
                    <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-200">1. Logo Utama Event</span>
                        {config.eventLogoUrl && (
                          <img 
                            src={config.eventLogoUrl} 
                            alt="Logo Event" 
                            className="w-7 h-7 object-contain bg-white rounded p-0.5"
                          />
                        )}
                      </div>
                      <input 
                        type="url"
                        placeholder="https://.../logo-event.png"
                        value={config.eventLogoUrl}
                        onChange={(e) => setConfig(prev => ({ ...prev, eventLogoUrl: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-[11px] focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] text-neutral-500">Preset:</span>
                        {LOGO_PRESETS.map((p, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setConfig(prev => ({ ...prev, eventLogoUrl: p.url }))}
                            className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px]"
                          >
                            {p.name.slice(0, 12)}...
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Federation Logo */}
                    <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-200">2. Logo Federasi (PERPANI / KONI)</span>
                        {config.organizationLogoUrl && (
                          <img 
                            src={config.organizationLogoUrl} 
                            alt="Logo Federasi" 
                            className="w-7 h-7 object-contain bg-white rounded p-0.5"
                          />
                        )}
                      </div>
                      <input 
                        type="url"
                        placeholder="https://.../logo-perpani.png"
                        value={config.organizationLogoUrl || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, organizationLogoUrl: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-[11px] focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] text-neutral-500">Preset:</span>
                        <button
                          type="button"
                          onClick={() => setConfig(prev => ({ ...prev, organizationLogoUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&auto=format&fit=crop&q=80' }))}
                          className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px]"
                        >
                          PB PERPANI
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfig(prev => ({ ...prev, organizationLogoUrl: '' }))}
                          className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-[10px]"
                        >
                          Kosongkan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Sponsor Management */}
                <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        Logo & Nama Sponsor Pendukung ({config.sponsors.length})
                      </h3>
                      <p className="text-[11px] text-neutral-400">
                        Ditampilkan pada bagian bawah ID Card sesuai standar World Archery.
                      </p>
                    </div>
                  </div>

                  {/* List of current sponsors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {config.sponsors.map(sp => (
                      <div 
                        key={sp.id}
                        className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {sp.logoUrl ? (
                            <img src={sp.logoUrl} alt={sp.name} className="w-6 h-6 object-contain rounded bg-white p-0.5 flex-shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded bg-neutral-800 flex items-center justify-center text-[9px] font-bold text-neutral-400 flex-shrink-0">
                              {sp.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{sp.name}</p>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono">
                              {sp.tier} SPONSOR
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSponsor(sp.id)}
                          className="p-1 text-neutral-500 hover:text-red-400 transition"
                          title="Hapus Sponsor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Quick add sponsor */}
                  <div className="pt-2 border-t border-neutral-800 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-neutral-400 font-semibold">Tambah Preset:</span>
                    {SPONSOR_PRESETS.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddSponsor(p.name, p.tier as any, p.logoUrl)}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs transition flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3 text-amber-400" />
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Zonasi FOP & Footer Note */}
                <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4 shadow-sm text-xs">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    Zonasi Akses Lapangan & Catatan Keamanan
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={config.showZoneMatrix}
                        onChange={(e) => setConfig(prev => ({ ...prev, showZoneMatrix: e.target.checked }))}
                        className="rounded bg-neutral-900 border-neutral-700 text-indigo-600 focus:ring-0"
                      />
                      <span className="text-neutral-200 font-medium">Tampilkan Matriks Zonasi FOP (1 2 3 4 5 6)</span>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={config.showLanyardSlot}
                        onChange={(e) => setConfig(prev => ({ ...prev, showLanyardSlot: e.target.checked }))}
                        className="rounded bg-neutral-900 border-neutral-700 text-indigo-600 focus:ring-0"
                      />
                      <span className="text-neutral-200 font-medium">Tampilkan Lubang Tali Gantungan (Lanyard Slot)</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1 font-semibold">Teks Catatan Kaki Keamanan (Footer)</label>
                    <input 
                      type="text"
                      value={config.footerNote}
                      onChange={(e) => setConfig(prev => ({ ...prev, footerNote: e.target.value }))}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveConfig}
                      disabled={isSavingConfig}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isSavingConfig ? 'Menyimpan...' : 'Simpan Perubahan Desain ID Card'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {studioTab === 'PERSONNEL' && (
              <div className="space-y-4">
                {/* Header & Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" />
                      Daftar Personil Terakreditasi ({personnel.length})
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Panitia Pelaksana, Wasit/Juri, Tamu VIP, Media, dan Official Kontingen.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddPersonModalOpen(true)}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Personil Baru
                  </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-3" />
                    <input 
                      type="text"
                      placeholder="Cari nama, divisi, klub/instansi, atau kode kartu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="ALL">Semua Peran</option>
                    <option value="PANITIA">Panitia Pelaksana (OC)</option>
                    <option value="WASIT">Dewan Wasit & Juri</option>
                    <option value="VIP">Tamu VIP / VVIP</option>
                    <option value="MEDIA">Media & Pers</option>
                    <option value="OFFICIAL">Official / Pelatih</option>
                  </select>
                </div>

                {/* Table list */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400">
                        <tr>
                          <th className="py-3 px-4 font-semibold">Nama & Foto</th>
                          <th className="py-3 px-4 font-semibold">Peran Akreditasi</th>
                          <th className="py-3 px-4 font-semibold">Jabatan / Divisi</th>
                          <th className="py-3 px-4 font-semibold">Instansi / Klub</th>
                          <th className="py-3 px-4 font-semibold">Zona FOP</th>
                          <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                        {filteredPersonnel.map(p => {
                          const roleStyle = getRoleStyle(p.role);
                          const isSelected = selectedPersonId === p.id && previewRole === p.role;
                          return (
                            <tr 
                              key={p.id}
                              className={`hover:bg-neutral-800/40 transition cursor-pointer ${
                                isSelected ? 'bg-neutral-800/60' : ''
                              }`}
                              onClick={() => {
                                setSelectedPersonId(p.id);
                                setPreviewRole(p.role);
                              }}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  {p.photoUrl ? (
                                    <img src={p.photoUrl} alt={p.fullName} className="w-8 h-8 rounded-full object-cover border border-neutral-700" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-neutral-400">
                                      {p.fullName.slice(0, 1)}
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-bold text-white block">{p.fullName}</span>
                                    <span className="font-mono text-[10px] text-neutral-500">{p.cardCode}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleStyle.ribbon}`}>
                                  {p.role}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-neutral-300 font-medium">
                                {p.titleOrDivision}
                              </td>

                              <td className="py-3 px-4 text-neutral-400">
                                {p.organization}
                              </td>

                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1 font-mono text-[10px]">
                                  {[1, 2, 3, 4, 5, 6].map(z => {
                                    const hasAccess = p.allowedZones.includes(z);
                                    return (
                                      <span 
                                        key={z} 
                                        className={`w-4 h-4 rounded flex items-center justify-center font-bold ${
                                          hasAccess ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-neutral-600'
                                        }`}
                                      >
                                        {z}
                                      </span>
                                    );
                                  })}
                                </div>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedPersonId(p.id);
                                      setPreviewRole(p.role);
                                    }}
                                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                                    title="Tampilkan di Preview"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePersonnel(p.id)}
                                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-400"
                                    title="Hapus Data"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {filteredPersonnel.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-neutral-500">
                              Tidak ada personil akreditasi yang cocok dengan pencarian.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Real-time ID Card Physical Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4 sticky top-6">
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-400" />
                Pratinjau Fisik ID Card (Real-Time)
              </span>

              {/* Preview Role Switcher */}
              <select
                value={previewRole}
                onChange={(e) => setPreviewRole(e.target.value as AccreditationRole)}
                className="px-2.5 py-1 bg-neutral-950 border border-neutral-700 rounded-lg text-xs font-bold text-white focus:outline-none"
              >
                <option value="PANITIA">Panitia (OC)</option>
                <option value="WASIT">Wasit / Juri</option>
                <option value="VIP">Tamu VIP</option>
                <option value="MEDIA">Media & Pers</option>
                <option value="OFFICIAL">Pelatih / Official</option>
                <option value="ATLET">Atlet Peserta</option>
              </select>
            </div>

            {/* THE PHYSICAL BADGE (Standard Lanyard Aspect Ratio: 10 x 14 cm) */}
            <div className="mx-auto max-w-[340px] bg-white text-neutral-950 rounded-2xl shadow-2xl overflow-hidden border border-neutral-300 relative select-none print:shadow-none print:border">
              {/* Lanyard punch hole indicator */}
              {config.showLanyardSlot && (
                <div className="pt-2 pb-1 flex justify-center bg-neutral-900">
                  <div className="w-12 h-2.5 rounded-full bg-neutral-950 border border-neutral-700 shadow-inner" />
                </div>
              )}

              {/* Card Header with Theme Gradient & Dual Logos */}
              <div className={`p-4 bg-gradient-to-r ${getHeaderThemeClass()} text-white flex items-center justify-between gap-2 border-b-2 border-amber-400`}>
                {config.eventLogoUrl ? (
                  <img 
                    src={config.eventLogoUrl} 
                    alt="Logo Event" 
                    className="w-10 h-10 object-contain bg-white/90 rounded-lg p-0.5 shadow flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    🏹
                  </div>
                )}

                <div className="text-center flex-1 min-w-0">
                  <h4 className="font-extrabold text-[11px] leading-tight tracking-tight uppercase line-clamp-2 drop-shadow-sm">
                    {config.badgeTitle}
                  </h4>
                  <p className="text-[8px] tracking-wider text-neutral-300 uppercase mt-0.5 truncate">
                    {config.badgeSubtitle}
                  </p>
                </div>

                {config.organizationLogoUrl ? (
                  <img 
                    src={config.organizationLogoUrl} 
                    alt="Logo Federasi" 
                    className="w-10 h-10 object-contain bg-white/90 rounded-lg p-0.5 shadow flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    🇮🇩
                  </div>
                )}
              </div>

              {/* Prominent Role Ribbon */}
              {(() => {
                const style = getRoleStyle(previewRole);
                return (
                  <div className={`py-1 px-3 text-center font-black tracking-widest text-xs uppercase shadow-inner ${style.ribbon}`}>
                    {style.badgeText}
                  </div>
                );
              })()}

              {/* Card Body: Photo & Personnel Details */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {/* Portrait Photo */}
                  <div className="w-20 h-24 rounded-xl border-2 border-neutral-900 overflow-hidden bg-neutral-100 flex-shrink-0 shadow-sm relative">
                    {previewRole === 'ATLET' ? (
                      <div className="w-full h-full bg-gradient-to-b from-blue-900 to-neutral-950 flex flex-col items-center justify-center text-white">
                        <Award className="w-8 h-8 text-amber-400" />
                        <span className="text-[9px] font-bold mt-1 uppercase">ARCHER</span>
                      </div>
                    ) : currentPersonnel?.photoUrl ? (
                      <img 
                        src={currentPersonnel.photoUrl} 
                        alt={currentPersonnel.fullName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400">
                        <Users className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Name & Title */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <h3 className="font-extrabold text-sm text-neutral-950 leading-tight uppercase line-clamp-2">
                      {previewRole === 'ATLET' 
                        ? (currentAthlete ? currentAthlete.athleteName : 'Nama Atlet') 
                        : (currentPersonnel ? currentPersonnel.fullName : 'Nama Lengkap')}
                    </h3>
                    <p className="text-[11px] font-bold text-indigo-900 leading-snug">
                      {previewRole === 'ATLET' 
                        ? (event?.categories.find(c => c.id === currentAthlete?.categoryId)?.name || 'Recurve Men') 
                        : (currentPersonnel ? currentPersonnel.titleOrDivision : 'Jabatan / Divisi')}
                    </p>
                    <p className="text-[10px] text-neutral-600 font-semibold truncate">
                      {previewRole === 'ATLET' 
                        ? (currentAthlete?.contingentName || 'Klub / Kontingen') 
                        : (currentPersonnel ? currentPersonnel.organization : 'Instansi Pengutus')}
                    </p>
                    <div className="pt-1">
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-800 font-bold border border-neutral-300">
                        ID: {previewRole === 'ATLET' 
                          ? (currentAthlete?.id || 'REG-001') 
                          : (currentPersonnel?.cardCode || 'ACC-OC-001')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Athlete Target Number or Non-Athlete QR section */}
                {previewRole === 'ATLET' && currentAthlete?.targetNumber && (
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-900 uppercase">Bantalan Tembak:</span>
                    <span className="font-mono text-base font-black text-amber-950">
                      {currentAthlete.targetNumber}
                    </span>
                  </div>
                )}

                {/* Scannable Field QR Code */}
                <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 text-left">
                    <span className="text-[9px] font-bold text-neutral-500 uppercase block">Akses Masuk Lapangan</span>
                    <span className="text-[10px] font-extrabold text-neutral-900 block">QR AKREDITASI RESMI</span>
                    <span className="text-[8px] text-neutral-500 block leading-tight">
                      Scan di gerbang FOP untuk verifikasi hak akses zona.
                    </span>
                  </div>

                  {previewQrUrl ? (
                    <img src={previewQrUrl} alt="QR Code" className="w-14 h-14 object-contain rounded bg-white p-0.5 border border-neutral-300 shadow-sm flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded bg-neutral-200 animate-pulse flex-shrink-0" />
                  )}
                </div>

                {/* Field of Play (FOP) Zone Matrix */}
                {config.showZoneMatrix && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[8px] font-bold text-neutral-500 uppercase">
                      <span>Field of Play (FOP) Access Zones:</span>
                    </div>
                    <div className="grid grid-cols-6 gap-1 text-center font-mono font-bold text-[10px]">
                      {[1, 2, 3, 4, 5, 6].map(z => {
                        const allowed = previewRole === 'ATLET' 
                          ? [1, 2].includes(z) 
                          : (currentPersonnel?.allowedZones || []).includes(z);
                        return (
                          <div 
                            key={z} 
                            className={`py-1 rounded border ${
                              allowed 
                                ? 'bg-neutral-950 text-amber-400 border-neutral-900 font-black shadow-sm' 
                                : 'bg-neutral-100 text-neutral-300 border-neutral-200 line-through'
                            }`}
                            title={ZONE_DESCRIPTIONS[z]?.title}
                          >
                            Z{z}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Official Sponsors Bar */}
                {config.sponsors.length > 0 && (
                  <div className="pt-2 border-t border-dashed border-neutral-300 space-y-1">
                    <span className="text-[7px] font-bold text-neutral-400 uppercase tracking-wider block text-center">
                      OFFICIAL SPONSORS & PARTNERS
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {config.sponsors.slice(0, 4).map(sp => (
                        <div key={sp.id} className="flex items-center gap-1">
                          {sp.logoUrl ? (
                            <img src={sp.logoUrl} alt={sp.name} className="h-3.5 object-contain max-w-[48px]" />
                          ) : (
                            <span className="text-[8px] font-bold text-neutral-700">{sp.name}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer disclaimer */}
                {config.footerNote && (
                  <p className="text-[7px] text-neutral-400 text-center leading-tight pt-1">
                    {config.footerNote}
                  </p>
                )}
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition inline-flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-400" />
                Cetak ID Card Ini Saja
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* TAB 3: BATCH PRINT (A4 Multi-Badge Grid) */
        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                Lembar Cetak Massal Akreditasi & ID Card (A4 Layout)
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Siap cetak langsung di kertas karton / art paper A4. Dilengkapi garis potong dan posisi lubang tali lanyard.
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Cetak Dokumen A4 Sekarang
            </button>
          </div>

          {/* Grid of badges for batch printing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {personnel.map(p => {
              const roleStyle = getRoleStyle(p.role);
              return (
                <div 
                  key={p.id}
                  className="bg-white text-neutral-950 rounded-xl overflow-hidden border border-neutral-300 shadow-md p-3 space-y-2 relative"
                >
                  {/* Punch Hole */}
                  <div className="flex justify-center pb-1">
                    <div className="w-8 h-1.5 rounded-full bg-neutral-200 border border-neutral-400" />
                  </div>

                  {/* Header */}
                  <div className={`p-2 bg-gradient-to-r ${getHeaderThemeClass()} text-white rounded-lg flex items-center justify-between gap-1`}>
                    {config.eventLogoUrl && (
                      <img src={config.eventLogoUrl} alt="Logo" className="w-6 h-6 object-contain bg-white rounded p-0.5 flex-shrink-0" />
                    )}
                    <span className="font-extrabold text-[9px] uppercase truncate flex-1 text-center">
                      {config.badgeTitle}
                    </span>
                    {config.organizationLogoUrl && (
                      <img src={config.organizationLogoUrl} alt="Logo" className="w-6 h-6 object-contain bg-white rounded p-0.5 flex-shrink-0" />
                    )}
                  </div>

                  {/* Role Ribbon */}
                  <div className={`py-0.5 px-2 text-center font-black text-[9px] uppercase rounded ${roleStyle.ribbon}`}>
                    {roleStyle.badgeText}
                  </div>

                  {/* Body */}
                  <div className="flex items-center gap-2">
                    {p.photoUrl ? (
                      <img src={p.photoUrl} alt={p.fullName} className="w-12 h-14 rounded object-cover border border-neutral-900 flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-14 rounded bg-neutral-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {p.fullName.slice(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-xs text-neutral-950 leading-tight uppercase truncate">{p.fullName}</p>
                      <p className="text-[10px] font-bold text-indigo-900 truncate">{p.titleOrDivision}</p>
                      <p className="text-[9px] text-neutral-500 truncate">{p.organization}</p>
                      <span className="font-mono text-[8px] font-bold text-neutral-700 block mt-0.5">{p.cardCode}</span>
                    </div>
                  </div>

                  {/* Zone Matrix */}
                  <div className="grid grid-cols-6 gap-0.5 text-center font-mono font-bold text-[8px] pt-1">
                    {[1, 2, 3, 4, 5, 6].map(z => (
                      <span 
                        key={z} 
                        className={`py-0.5 rounded ${
                          p.allowedZones.includes(z) ? 'bg-neutral-950 text-amber-400' : 'bg-neutral-100 text-neutral-300'
                        }`}
                      >
                        Z{z}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Add Accredited Person */}
      {isAddPersonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Tambah Personil Akreditasi Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPersonModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePersonnel} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">Nama Lengkap & Gelar *</label>
                <input 
                  type="text"
                  required
                  placeholder="Contoh: Ir. Budi Gunawan, M.Pd"
                  value={newPersonForm.fullName}
                  onChange={(e) => setNewPersonForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Peran Akreditasi *</label>
                  <select
                    value={newPersonForm.role}
                    onChange={(e) => {
                      const role = e.target.value as AccreditationRole;
                      let defaultZones = [1, 2, 4];
                      if (role === 'PANITIA') defaultZones = [1, 2, 3, 4, 5, 6];
                      if (role === 'WASIT') defaultZones = [1, 2, 3, 4];
                      if (role === 'VIP') defaultZones = [1, 4, 5];
                      if (role === 'MEDIA') defaultZones = [2, 6];
                      if (role === 'OFFICIAL') defaultZones = [2, 4];

                      setNewPersonForm(prev => ({ 
                        ...prev, 
                        role,
                        allowedZones: defaultZones 
                      }));
                    }}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none"
                  >
                    <option value="PANITIA">Panitia Pelaksana (OC)</option>
                    <option value="WASIT">Dewan Wasit & Juri (Judge)</option>
                    <option value="VIP">Tamu VIP / VVIP (KONI/Dispora)</option>
                    <option value="MEDIA">Media / Jurnalis / Broadcaster</option>
                    <option value="OFFICIAL">Pelatih / Official Tim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Jabatan / Divisi *</label>
                  <input 
                    type="text"
                    required
                    placeholder="Contoh: Koordinator Medis"
                    value={newPersonForm.titleOrDivision}
                    onChange={(e) => setNewPersonForm(prev => ({ ...prev, titleOrDivision: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Instansi / Klub Pengutus *</label>
                  <input 
                    type="text"
                    required
                    placeholder="Contoh: PB PERPANI / KONI Jabar"
                    value={newPersonForm.organization}
                    onChange={(e) => setNewPersonForm(prev => ({ ...prev, organization: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-semibold">Nomor Telepon / WhatsApp</label>
                  <input 
                    type="tel"
                    placeholder="081234567890"
                    value={newPersonForm.phone}
                    onChange={(e) => setNewPersonForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-semibold">URL Foto Profil (Opsional)</label>
                <input 
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newPersonForm.photoUrl}
                  onChange={(e) => setNewPersonForm(prev => ({ ...prev, photoUrl: e.target.value }))}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* FOP Zone Checklist */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-neutral-400 font-semibold">Hak Akses Zonasi Field of Play (FOP):</label>
                <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  {[1, 2, 3, 4, 5, 6].map(z => {
                    const checked = newPersonForm.allowedZones.includes(z);
                    return (
                      <label key={z} className="flex items-center gap-2 cursor-pointer text-[11px] text-neutral-300">
                        <input 
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewPersonForm(prev => ({ ...prev, allowedZones: [...prev.allowedZones, z].sort() }));
                            } else {
                              setNewPersonForm(prev => ({ ...prev, allowedZones: prev.allowedZones.filter(x => x !== z) }));
                            }
                          }}
                          className="rounded bg-neutral-900 border-neutral-700 text-emerald-600 focus:ring-0"
                        />
                        <span>{ZONE_DESCRIPTIONS[z]?.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddPersonModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30"
                >
                  Terbitkan ID Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
