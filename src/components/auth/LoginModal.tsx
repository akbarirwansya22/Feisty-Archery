import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Users, 
  Target, 
  Award, 
  Lock, 
  Mail, 
  ArrowRight, 
  Building, 
  UserCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { AuthUser, UserRole } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: AuthUser) => void;
  initialRole?: UserRole;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  initialRole = 'PESERTA'
}) => {
  const [activeTab, setActiveTab] = useState<'PRESET' | 'FORM'>('PRESET');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole === 'PUBLIC' ? 'PESERTA' : initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contingentName, setContingentName] = useState('');
  const [fullName, setFullName] = useState('');

  if (!isOpen) return null;

  // Preset Accounts for instant 1-click test
  const demoAccounts = [
    {
      role: 'PESERTA' as UserRole,
      title: 'Peserta / Kontingen',
      subtitle: 'Atlet & Official Tim Klub Panahan',
      email: 'peserta@fastarchery.com',
      name: 'Riau Ega Agatha (Official Fast Archery)',
      contingentName: 'Fast Archery Club Bandung',
      icon: Users,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description: 'Melihat status pendaftaran, alokasi nomor bantalan target tembak (01B), e-ID Card atlet, dan riwayat skor kualifikasi.'
    },
    {
      role: 'PANITIA' as UserRole,
      title: 'Panitia / EO',
      subtitle: 'Sekretariat & Tim Verifikasi Lomba',
      email: 'panitia@archeryhub.id',
      name: 'Sekretariat Panitia Kejurnas',
      icon: ShieldCheck,
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      description: 'Verifikasi berkas & bukti transfer pembayaran atlet, alokasi nomor bantalan target tembak, cetak daftar peserta massal.'
    },
    {
      role: 'SCORING' as UserRole,
      title: 'Tim Scoring / Wasit',
      subtitle: 'Dewan Wasit & Scorer Lapangan',
      email: 'wasit@archeryhub.id',
      name: 'Dewan Wasit PB PERPANI',
      icon: Target,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      description: 'Input skor per-end keypad World Archery resmi, tanda tangan digital wasit fair-play, kontrol match eliminasi & shoot-off tie breaker.'
    },
    {
      role: 'ADMIN' as UserRole,
      title: 'Super Admin',
      subtitle: 'Administrator Sistem & Penyelenggara',
      email: 'admin@archeryhub.id',
      name: 'Super Administrator',
      icon: Award,
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      description: 'Akses penuh seluruh modul: Dynamic Event & Category Builder, statistik eksekutif, rekap finansial, dan audit sistem.'
    }
  ];

  const handleSelectPreset = (account: typeof demoAccounts[0]) => {
    onLogin({
      id: `usr-${account.role.toLowerCase()}-01`,
      name: account.name,
      email: account.email,
      role: account.role,
      contingentName: account.contingentName,
      contingentId: account.contingentName ? 'cont-002' : undefined
    });
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert('Silakan masukkan email.');
      return;
    }
    const defaultName = fullName || (email.split('@')[0] || 'Pengguna');
    onLogin({
      id: `usr-${Date.now()}`,
      name: defaultName,
      email: email,
      role: selectedRole,
      contingentName: selectedRole === 'PESERTA' ? (contingentName || 'Kontingen Mandiri') : undefined,
      contingentId: selectedRole === 'PESERTA' ? `cont-${Date.now()}` : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Akses Dashboard & Autentikasi
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Role-Based Access
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Pilih peran untuk masuk ke Dashboard Peserta, Admin, Panitia, atau Tim Scoring
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner: Akses Bebas vs Akses Login */}
        <div className="px-6 py-3 bg-neutral-950 border-b border-neutral-800 flex items-start gap-2.5 text-xs text-neutral-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-cyan-300">Akses Bebas Publik:</strong> Semua orang dapat menjelajah daftar event dan melihat live standings tanpa login. Untuk mendaftar dan mengelola data perlombaan, masuklah sesuai peran di bawah.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 flex space-x-2 border-b border-neutral-800">
          <button
            onClick={() => setActiveTab('PRESET')}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'PRESET'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            1-Click Demo Login (Paling Cepat)
          </button>
          <button
            onClick={() => setActiveTab('FORM')}
            className={`pb-3 px-4 text-xs font-bold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'FORM'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Login Kustom / Akun Baru
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {activeTab === 'PRESET' ? (
            <div className="space-y-3">
              <p className="text-xs text-neutral-400 font-medium">
                Pilih akun demo di bawah untuk langsung mencoba dashboard masing-masing role:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {demoAccounts.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <button
                      key={acc.role}
                      onClick={() => handleSelectPreset(acc)}
                      className="group text-left p-4 rounded-xl bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 transition flex flex-col justify-between space-y-3 relative hover:shadow-lg"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${acc.badgeColor}`}>
                            {acc.title}
                          </span>
                          <Icon className="w-4 h-4 text-neutral-400 group-hover:text-amber-400 transition" />
                        </div>
                        <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition">
                          {acc.name}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5 font-mono">
                          {acc.email}
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
                          {acc.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs text-amber-400 font-semibold group-hover:translate-x-0.5 transition">
                        <span>Masuk sebagai {acc.title}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Role Picker */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Pilih Peran Akun (Role)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['PESERTA', 'PANITIA', 'SCORING', 'ADMIN'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`p-2.5 rounded-lg border text-xs font-bold text-center transition ${
                        selectedRole === r
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {r === 'PESERTA' && '🏹 Peserta'}
                      {r === 'PANITIA' && '📋 Panitia'}
                      {r === 'SCORING' && '🎯 Wasit'}
                      {r === 'ADMIN' && '👑 Admin'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Nama Lengkap / Kontak
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {selectedRole === 'PESERTA' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Nama Kontingen / Klub Panahan
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={contingentName}
                      onChange={(e) => setContingentName(e.target.value)}
                      placeholder="Contoh: Satria Archery Club Jakarta"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Masuk ke Dashboard ({selectedRole})
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <span>Sistem Kejuaraan Panahan Terintegrasi World Archery & PERPANI</span>
          <button onClick={onClose} className="hover:text-neutral-300 transition">
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
