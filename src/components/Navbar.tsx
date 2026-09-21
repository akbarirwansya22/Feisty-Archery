import React, { useState } from 'react';
import { 
  Target, 
  Calendar, 
  Settings, 
  CheckCircle2, 
  Edit3, 
  GitBranch, 
  Trophy, 
  Database,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  Award,
  Users,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { ArcheryEvent, Category, AuthUser, UserRole } from '../types';

export type ActiveTab = 
  | 'PUBLIC_PORTAL' 
  | 'PARTICIPANT_DASHBOARD'
  | 'ADMIN_DASHBOARD'
  | 'PANITIA_DASHBOARD'
  | 'SCORING_DASHBOARD'
  | 'EVENT_BUILDER' 
  | 'CONTINGENT_VERIFICATION' 
  | 'QUALIFICATION_SCORING' 
  | 'ELIMINATION_SCORING' 
  | 'ELIMINATION_BRACKET' 
  | 'LIVE_LEADERBOARD' 
  | 'TARGET_FACE_STUDIO'
  | 'SQL_ARCHITECTURE';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  events: ArcheryEvent[];
  selectedEvent: ArcheryEvent | null;
  setSelectedEvent: (event: ArcheryEvent) => void;
  selectedCategory: Category | null;
  setSelectedCategory: (cat: Category) => void;
  currentUser: AuthUser | null;
  onOpenLogin: (role?: UserRole) => void;
  onLogout: () => void;
  onQuickSwitchRole: (role: UserRole) => void;
  onOpenNewEvent: () => void;
  onOpenArchitecture: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  events,
  selectedEvent,
  setSelectedEvent,
  selectedCategory,
  setSelectedCategory,
  currentUser,
  onOpenLogin,
  onLogout,
  onQuickSwitchRole,
  onOpenNewEvent,
  onOpenArchitecture
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const currentRole = currentUser?.role || 'PUBLIC';

  return (
    <header className="sticky top-0 z-40 bg-white text-neutral-900 border-b border-neutral-200 shadow-sm">
      {/* Top Banner & Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => {
              if (currentRole === 'PESERTA') setActiveTab('PARTICIPANT_DASHBOARD');
              else if (currentRole === 'ADMIN') setActiveTab('ADMIN_DASHBOARD');
              else if (currentRole === 'PANITIA') setActiveTab('PANITIA_DASHBOARD');
              else if (currentRole === 'SCORING') setActiveTab('SCORING_DASHBOARD');
              else setActiveTab('PUBLIC_PORTAL');
            }}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-red-600 to-cyan-500 p-0.5 shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                <Target className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-neutral-950">
                  Archery<span className="text-amber-600">Hub</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  WA & PERPANI
                </span>
              </div>
              <p className="text-xs text-neutral-500 hidden sm:block">
                Portal Event, Registrasi Kontingen & Fair Play Scoring
              </p>
            </div>
          </div>

          {/* Quick Context Switchers & Auth Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Event Selector */}
            <div className="hidden lg:flex items-center space-x-2 bg-neutral-100 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs">
              <span className="text-neutral-500 font-medium">Event:</span>
              <select 
                className="bg-transparent text-neutral-900 font-semibold focus:outline-none cursor-pointer max-w-[160px] truncate"
                value={selectedEvent?.id || ''}
                onChange={(e) => {
                  const ev = events.find(item => item.id === e.target.value);
                  if (ev) {
                    setSelectedEvent(ev);
                    if (ev.categories.length > 0) {
                      setSelectedCategory(ev.categories[0]);
                    }
                  }
                }}
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id} className="bg-white text-neutral-900">
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            {selectedEvent && selectedEvent.categories.length > 0 && (
              <div className="hidden xl:flex items-center space-x-2 bg-neutral-100 px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs">
                <span className="text-neutral-500 font-medium">Kategori:</span>
                <select 
                  className="bg-transparent text-neutral-900 font-semibold focus:outline-none cursor-pointer max-w-[150px] truncate"
                  value={selectedCategory?.id || ''}
                  onChange={(e) => {
                    const cat = selectedEvent.categories.find(c => c.id === e.target.value);
                    if (cat) setSelectedCategory(cat);
                  }}
                >
                  {selectedEvent.categories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-white text-neutral-900">
                      {cat.name} ({cat.distanceMeters}m)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Architecture DDL button */}
            <button
              id="btn-nav-sql-arch"
              onClick={onOpenArchitecture}
              className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-semibold transition"
              title="Lihat Arsitektur Relasional Database & SQL DDL"
            >
              <Database className="w-3.5 h-3.5 text-cyan-600" />
              <span>SQL DDL</span>
            </button>

            {/* Role Switcher & Auth Section */}
            <div className="relative">
              {currentUser ? (
                <div className="flex items-center space-x-2 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                  {/* Current Active Role Badge */}
                  <div 
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className="flex items-center space-x-2 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-neutral-200/70 transition text-xs"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                      currentUser.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                        : currentUser.role === 'PANITIA' 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : currentUser.role === 'SCORING' 
                        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {currentUser.role === 'ADMIN' && <Award className="w-3.5 h-3.5" />}
                      {currentUser.role === 'PANITIA' && <ShieldCheck className="w-3.5 h-3.5" />}
                      {currentUser.role === 'SCORING' && <Target className="w-3.5 h-3.5" />}
                      {currentUser.role === 'PESERTA' && <Users className="w-3.5 h-3.5" />}
                    </div>

                    <div className="hidden sm:block text-left">
                      <p className="font-bold text-neutral-900 text-[11px] leading-tight truncate max-w-[120px]">
                        {currentUser.contingentName || currentUser.name}
                      </p>
                      <span className={`text-[9px] uppercase font-bold tracking-wider ${
                        currentUser.role === 'ADMIN' ? 'text-purple-600' :
                        currentUser.role === 'PANITIA' ? 'text-blue-600' :
                        currentUser.role === 'SCORING' ? 'text-amber-700' :
                        'text-emerald-700'
                      }`}>
                        {currentUser.role}
                      </span>
                    </div>

                    <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={onLogout}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-neutral-200 transition"
                    title="Keluar (Logout) ke Akses Bebas"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    id="btn-login-trigger"
                    onClick={() => onOpenLogin()}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md shadow-amber-500/20 transition"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Masuk / Login</span>
                  </button>
                </div>
              )}

              {/* Quick Role Switcher Dropdown */}
              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-2xl shadow-xl p-2 z-50 text-xs space-y-1 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-[10px] text-neutral-500 font-bold uppercase tracking-wider border-b border-neutral-100 flex items-center justify-between">
                    <span>Ganti Role Instan</span>
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </div>

                  <button
                    onClick={() => {
                      onQuickSwitchRole('PUBLIC');
                      setIsRoleDropdownOpen(false);
                      setActiveTab('PUBLIC_PORTAL');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition ${
                      currentRole === 'PUBLIC' ? 'bg-neutral-100 text-neutral-950 font-bold' : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-neutral-500" />
                    <div>
                      <p className="font-semibold text-[11px]">Tamu (Akses Bebas)</p>
                      <p className="text-[10px] text-neutral-500">Melihat daftar event & hasil</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onQuickSwitchRole('PESERTA');
                      setIsRoleDropdownOpen(false);
                      setActiveTab('PARTICIPANT_DASHBOARD');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition ${
                      currentRole === 'PESERTA' ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Users className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-[11px]">Peserta / Kontingen</p>
                      <p className="text-[10px] text-neutral-500">Fast Archery Club Bandung</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onQuickSwitchRole('PANITIA');
                      setIsRoleDropdownOpen(false);
                      setActiveTab('PANITIA_DASHBOARD');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition ${
                      currentRole === 'PANITIA' ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200' : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-semibold text-[11px]">Panitia / EO</p>
                      <p className="text-[10px] text-neutral-500">Verifikasi berkas & bantalan</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onQuickSwitchRole('SCORING');
                      setIsRoleDropdownOpen(false);
                      setActiveTab('SCORING_DASHBOARD');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition ${
                      currentRole === 'SCORING' ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200' : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Target className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="font-semibold text-[11px]">Tim Scoring / Wasit</p>
                      <p className="text-[10px] text-neutral-500">Keypad World Archery & eliminasi</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onQuickSwitchRole('ADMIN');
                      setIsRoleDropdownOpen(false);
                      setActiveTab('ADMIN_DASHBOARD');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition ${
                      currentRole === 'ADMIN' ? 'bg-purple-50 text-purple-800 font-bold border border-purple-200' : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Award className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="font-semibold text-[11px]">Super Admin</p>
                      <p className="text-[10px] text-neutral-500">Kendali penuh sistem & builder</p>
                    </div>
                  </button>

                  <div className="pt-1 border-t border-neutral-100">
                    <button
                      onClick={() => {
                        setIsRoleDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition text-[11px] font-semibold flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar — Clean, Intuitive 4-Hub Structure */}
      <div className="bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between overflow-x-auto py-2 scrollbar-none text-xs sm:text-sm font-medium gap-2">
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* 1. Hub 1: Event & Pendaftaran */}
              <button
                id="tab-public-portal"
                onClick={() => setActiveTab('PUBLIC_PORTAL')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap font-bold ${
                  activeTab === 'PUBLIC_PORTAL' || activeTab === 'EVENT_BUILDER'
                    ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Event & Pendaftaran</span>
              </button>

              {/* 2. Hub 2: Hasil & Bracket Eliminasi */}
              <button
                id="tab-results-hub"
                onClick={() => setActiveTab('LIVE_LEADERBOARD')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap font-bold ${
                  activeTab === 'LIVE_LEADERBOARD' || activeTab === 'ELIMINATION_BRACKET'
                    ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Hasil & Leaderboard</span>
              </button>

              {/* 3. Hub 3: Face Target Studio & Cetak PDF */}
              <button
                id="tab-target-studio"
                onClick={() => setActiveTab('TARGET_FACE_STUDIO')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap font-bold relative ${
                  activeTab === 'TARGET_FACE_STUDIO'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 shadow-md shadow-amber-500/25'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
                }`}
              >
                <Target className="w-4 h-4 text-amber-700" />
                <span>Face Target & PDF</span>
                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                  activeTab === 'TARGET_FACE_STUDIO' 
                    ? 'bg-neutral-950 text-amber-400' 
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  WA-STD
                </span>
              </button>

              {/* 4. Hub 4: Workspace Turnamen (Sesuai Peran Aktif) */}
              <button
                id="tab-workspace-hub"
                onClick={() => {
                  if (currentRole === 'PESERTA') setActiveTab('PARTICIPANT_DASHBOARD');
                  else if (currentRole === 'PANITIA') setActiveTab('PANITIA_DASHBOARD');
                  else if (currentRole === 'SCORING') setActiveTab('SCORING_DASHBOARD');
                  else if (currentRole === 'ADMIN') setActiveTab('ADMIN_DASHBOARD');
                  else {
                    setActiveTab('PANITIA_DASHBOARD');
                  }
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl transition whitespace-nowrap font-bold ${
                  activeTab === 'PANITIA_DASHBOARD' || 
                  activeTab === 'SCORING_DASHBOARD' || 
                  activeTab === 'PARTICIPANT_DASHBOARD' || 
                  activeTab === 'ADMIN_DASHBOARD' ||
                  activeTab === 'CONTINGENT_VERIFICATION' ||
                  activeTab === 'QUALIFICATION_SCORING' ||
                  activeTab === 'ELIMINATION_SCORING'
                    ? currentRole === 'ADMIN' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : currentRole === 'PANITIA' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : currentRole === 'SCORING' ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                      : currentRole === 'PESERTA' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {currentRole === 'PANITIA' ? 'Workspace Panitia (ID Card & Roll Call)' :
                   currentRole === 'SCORING' ? 'Workspace Wasit (Scoring WA)' :
                   currentRole === 'PESERTA' ? 'Dashboard Kontingen' :
                   currentRole === 'ADMIN' ? 'Admin Panel & Builder' :
                   'Workspace Turnamen'}
                </span>
              </button>
            </div>

            {/* Sub-Actions & Secondary Tools */}
            <div className="hidden lg:flex items-center space-x-2 flex-shrink-0">
              {/* Event Builder shortcut for Admin */}
              {currentRole === 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('EVENT_BUILDER')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    activeTab === 'EVENT_BUILDER'
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-purple-600" />
                  <span>Builder</span>
                </button>
              )}

              {/* Database ERD Modal trigger */}
              <button
                id="btn-nav-sql-arch"
                onClick={onOpenArchitecture}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 text-xs font-semibold transition shadow-sm"
                title="Lihat Arsitektur Relasional Database & SQL DDL"
              >
                <Database className="w-3.5 h-3.5 text-cyan-600" />
                <span>Skema SQL</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
