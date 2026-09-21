import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Calendar as CalendarIcon, 
  Tag, 
  ChevronRight, 
  CheckCircle, 
  Users, 
  Filter, 
  PlusCircle, 
  ShieldCheck,
  Building2
} from 'lucide-react';
import { ArcheryEvent, Division } from '../../types';

interface EventDirectoryProps {
  events: ArcheryEvent[];
  onSelectEvent: (event: ArcheryEvent) => void;
  onOpenRegistration: (event: ArcheryEvent) => void;
  onNavigateToBuilder: () => void;
  onOpenLogin?: () => void;
}

export const EventDirectory: React.FC<EventDirectoryProps> = ({
  events,
  onSelectEvent,
  onOpenRegistration,
  onNavigateToBuilder,
  onOpenLogin
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('ALL');
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');

  // Available filters
  const provinces = ['ALL', 'DKI Jakarta', 'Jawa Barat', 'Jawa Timur', 'Jawa Tengah', 'Banten', 'DI Yogyakarta'];
  const divisions: (Division | 'ALL')[] = ['ALL', 'Recurve', 'Compound', 'Nasional', 'Barebow', 'Tradisional'];

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProvince = selectedProvince === 'ALL' || event.province === selectedProvince;
    const matchesDivision = selectedDivision === 'ALL' || event.categories.some(c => c.division === selectedDivision);

    return matchesSearch && matchesProvince && matchesDivision;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner Section */}
      <div className="relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900/90 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=1600&q=80" 
          alt="Archery Range"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-30"
        />
        <div className="relative z-20 max-w-3xl p-8 sm:p-12 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Portal Resmi Kejuaraan Panahan Terintegrasi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Temukan & Ikuti Kejuaraan Panahan di Seluruh Indonesia
          </h1>
          <p className="text-neutral-300 text-base sm:text-lg leading-relaxed">
            Daftarkan atlet dan klub panahan Anda ke kompetisi terverifikasi. Dilengkapi dengan sistem skoring kualifikasi, eliminasi set system berstandar World Archery, dan live bracket real-time.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <button
              id="btn-hero-create-event"
              onClick={onNavigateToBuilder}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Event Baru (Organizer EO)</span>
            </button>
            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-white font-semibold text-sm border border-neutral-700 transition"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Masuk Petugas & Peserta</span>
              </button>
            )}
            <a 
              href="#directory-list"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 font-semibold text-sm border border-neutral-800 transition"
            >
              <span>Jelajahi Event Di Bawah</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Workflow Explainer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-neutral-800 text-amber-400 font-bold text-xs flex items-center justify-center">1</span>
            <h4 className="font-bold text-white text-xs">Akses Bebas Publik</h4>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Siapa pun bebas menjelajah seluruh kalender event, membaca juklak perlombaan, dan memantau live leaderboard real-time tanpa perlu login.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/70 border border-emerald-500/30 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">2</span>
            <h4 className="font-bold text-emerald-300 text-xs">Pendaftaran & Dashboard Peserta</h4>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Pilih event lalu klik <strong>"Daftar Sekarang"</strong>. Setelah mendaftar, Anda langsung otomatis diarahkan ke <strong>Dashboard Peserta</strong> untuk melihat status berkas, nomor bantalan target, dan kartu atlet.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/70 border border-purple-500/30 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center">3</span>
            <h4 className="font-bold text-purple-300 text-xs">Login Admin, Panitia & Wasit</h4>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            Akses dashboard operasional dilindungi login: <strong>Panitia</strong> (verifikasi & lane allocation), <strong>Tim Scoring</strong> (keypad World Archery & eliminasi), dan <strong>Admin</strong> (kendali sistem).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div id="directory-list" className="bg-neutral-900/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl border border-neutral-800 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              id="input-search-events"
              type="text"
              placeholder="Cari nama kejuaraan, kota, venue, atau nama EO..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 rounded-xl border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
            />
          </div>

          {/* Province Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-neutral-400 hidden sm:block" />
            <select
              id="select-province-filter"
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="px-3 py-2.5 bg-neutral-950 rounded-xl border border-neutral-700 text-neutral-200 text-sm focus:outline-none focus:border-amber-500"
            >
              {provinces.map(prov => (
                <option key={prov} value={prov}>
                  {prov === 'ALL' ? '🌍 Semua Wilayah' : prov}
                </option>
              ))}
            </select>

            {/* Division Filter */}
            <select
              id="select-division-filter"
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="px-3 py-2.5 bg-neutral-950 rounded-xl border border-neutral-700 text-neutral-200 text-sm focus:outline-none focus:border-amber-500"
            >
              {divisions.map(div => (
                <option key={div} value={div}>
                  {div === 'ALL' ? '🎯 Semua Divisi' : `Divisi ${div}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Division Quick Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-2 pb-1 scrollbar-none text-xs">
          <span className="text-neutral-400 font-medium whitespace-nowrap">Filter Divisi Cepat:</span>
          {divisions.map(div => (
            <button
              key={div}
              onClick={() => setSelectedDivision(div)}
              className={`px-3 py-1 rounded-lg border transition whitespace-nowrap ${
                selectedDivision === div
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 font-bold'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
              }`}
            >
              {div === 'ALL' ? 'Semua Divisi' : div}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => {
          const totalQuota = event.categories.reduce((acc, c) => acc + c.quota, 0);
          const totalRegistered = event.categories.reduce((acc, c) => acc + (c.registeredCount || 0), 0);

          return (
            <div 
              key={event.id}
              id={`event-card-${event.id}`}
              className="group bg-neutral-900/90 rounded-2xl border border-neutral-800 overflow-hidden hover:border-amber-500/50 transition duration-300 flex flex-col shadow-lg hover:shadow-amber-500/5"
            >
              {/* Event Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-neutral-950">
                <img 
                  src={event.bannerUrl} 
                  alt={event.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  {event.status === 'REGISTRATION_OPEN' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-neutral-950 shadow-md">
                      Pendaftaran Dibuka
                    </span>
                  )}
                  {event.status === 'ONGOING' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-neutral-950 shadow-md animate-pulse">
                      🔴 Sedang Berlangsung
                    </span>
                  )}
                  {event.status === 'COMPLETED' && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-700 text-neutral-300">
                      Selesai
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-neutral-300">
                  <div className="flex items-center space-x-1.5 bg-neutral-900/80 px-2.5 py-1 rounded-md backdrop-blur-sm border border-neutral-800">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="truncate max-w-[180px]">{event.organizerName}</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-neutral-900/80 px-2.5 py-1 rounded-md backdrop-blur-sm border border-neutral-800">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{totalRegistered}/{totalQuota} Atlet</span>
                  </div>
                </div>
              </div>

              {/* Event Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition leading-snug">
                    {event.name}
                  </h3>

                  <div className="space-y-1.5 text-xs text-neutral-400">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="truncate">{event.venueName}, {event.city}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{event.startDate} s/d {event.endDate}</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2 pt-1">
                    {event.description}
                  </p>
                </div>

                {/* Available Categories Chips */}
                <div className="space-y-2 pt-2 border-t border-neutral-800">
                  <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold block">
                    Kategori Lomba ({event.categories.length} Nomor):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto scrollbar-none">
                    {event.categories.map(cat => (
                      <span 
                        key={cat.id}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-800 text-neutral-300 border border-neutral-700"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          cat.division === 'Recurve' ? 'bg-amber-400' :
                          cat.division === 'Compound' ? 'bg-cyan-400' :
                          cat.division === 'Nasional' ? 'bg-emerald-400' :
                          cat.division === 'Barebow' ? 'bg-purple-400' : 'bg-orange-400'
                        }`} />
                        <span>{cat.division} {cat.distanceMeters}m</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex items-center space-x-2">
                  <button
                    id={`btn-detail-${event.id}`}
                    onClick={() => onSelectEvent(event)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition text-center"
                  >
                    Detail & Juklak
                  </button>
                  <button
                    id={`btn-register-${event.id}`}
                    onClick={() => onOpenRegistration(event)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition text-center shadow-md shadow-amber-500/10"
                  >
                    Daftar Sekarang
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-500">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Tidak ada event yang cocok</h3>
          <p className="text-sm text-neutral-400 max-w-md mx-auto">
            Coba ubah kata kunci pencarian atau sesuaikan filter wilayah dan divisi panahan.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedProvince('ALL');
              setSelectedDivision('ALL');
            }}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg"
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
};
