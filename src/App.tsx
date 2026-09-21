import React, { useState, useEffect } from 'react';
import { 
  Navbar, 
  ActiveTab 
} from './components/Navbar';
import { EventDirectory } from './components/public/EventDirectory';
import { EventDetailModal } from './components/public/EventDetailModal';
import { RegistrationModal } from './components/public/RegistrationModal';
import { LoginModal } from './components/auth/LoginModal';
import { ParticipantDashboard } from './components/participant/ParticipantDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PanitiaDashboard } from './components/organizer/PanitiaDashboard';
import { ScoringTeamDashboard } from './components/scoring/ScoringTeamDashboard';
import { EventBuilder } from './components/organizer/EventBuilder';
import { ContingentVerification } from './components/organizer/ContingentVerification';
import { QualificationScorer } from './components/scoring/QualificationScorer';
import { EliminationScorer } from './components/scoring/EliminationScorer';
import { EliminationBracket } from './components/brackets/EliminationBracket';
import { LiveLeaderboard } from './components/leaderboard/LiveLeaderboard';
import { TargetFaceStudio } from './components/target/TargetFaceStudio';
import { DatabaseArchitectureModal } from './components/architecture/DatabaseArchitectureModal';
import { Trophy, GitBranch } from 'lucide-react';
import { 
  ArcheryEvent, 
  Category, 
  Registration, 
  QualificationEnd, 
  EliminationMatch, 
  QualificationTotal,
  ArrowScore,
  AuthUser,
  UserRole
} from './types';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('PUBLIC_PORTAL');

  // Authentication & Role State
  // Default is null (Public / Free Access)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginInitialRole, setLoginInitialRole] = useState<UserRole>('PESERTA');

  // Core Data States
  const [events, setEvents] = useState<ArcheryEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ArcheryEvent | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [qualificationEnds, setQualificationEnds] = useState<QualificationEnd[]>([]);
  const [eliminationMatches, setEliminationMatches] = useState<EliminationMatch[]>([]);
  const [standings, setStandings] = useState<QualificationTotal[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // Modals
  const [detailEvent, setDetailEvent] = useState<ArcheryEvent | null>(null);
  const [registerEvent, setRegisterEvent] = useState<ArcheryEvent | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Load from Backend API
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [eventsRes, regRes, matchesRes] = await Promise.all([
        fetch('/api/events').then(r => r.json()),
        fetch('/api/registrations').then(r => r.json()),
        fetch('/api/elimination-matches').then(r => r.json())
      ]);

      if (eventsRes.success && eventsRes.data.length > 0) {
        setEvents(eventsRes.data);
        const firstEvent = eventsRes.data[0];
        setSelectedEvent(firstEvent);
        if (firstEvent.categories.length > 0) {
          setSelectedCategory(firstEvent.categories[0]);
        }
      }

      if (regRes.success) {
        setRegistrations(regRes.data);
      }

      if (matchesRes.success) {
        setEliminationMatches(matchesRes.data);
        if (matchesRes.data.length > 0) {
          setSelectedMatchId(matchesRes.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Multi-Device Realtime Sync: Poll registrations every 4 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetch('/api/registrations')
        .then(r => r.json())
        .then(json => {
          if (json.success && Array.isArray(json.data)) {
            setRegistrations(json.data);
          }
        })
        .catch(() => {});
    }, 4000);

    return () => clearInterval(pollInterval);
  }, []);

  // Fetch Category Standings when Category changes
  useEffect(() => {
    if (!selectedCategory?.id) return;

    fetch(`/api/standings/${selectedCategory.id}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setStandings(json.data);
        }
      })
      .catch(err => console.error('Standings fetch error:', err));
  }, [selectedCategory?.id, selectedEvent?.id]);

  // Handle Authentication Actions
  const handleOpenLogin = (role: UserRole = 'PESERTA') => {
    setLoginInitialRole(role);
    setIsLoginModalOpen(true);
  };

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);

    // Auto navigate to the respective dashboard
    if (user.role === 'PESERTA') {
      setActiveTab('PARTICIPANT_DASHBOARD');
    } else if (user.role === 'ADMIN') {
      setActiveTab('ADMIN_DASHBOARD');
    } else if (user.role === 'PANITIA') {
      setActiveTab('PANITIA_DASHBOARD');
    } else if (user.role === 'SCORING') {
      setActiveTab('SCORING_DASHBOARD');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('PUBLIC_PORTAL');
  };

  const handleQuickSwitchRole = (role: UserRole) => {
    if (role === 'PUBLIC') {
      setCurrentUser(null);
      setActiveTab('PUBLIC_PORTAL');
    } else if (role === 'PESERTA') {
      const pUser: AuthUser = {
        id: 'usr-peserta-01',
        name: 'Riau Ega Agatha',
        email: 'peserta@fastarchery.com',
        role: 'PESERTA',
        contingentName: 'Fast Archery Club Bandung',
        contingentId: 'cont-002'
      };
      setCurrentUser(pUser);
      setActiveTab('PARTICIPANT_DASHBOARD');
    } else if (role === 'PANITIA') {
      const panUser: AuthUser = {
        id: 'usr-panitia-01',
        name: 'Sekretariat Panitia Kejurnas',
        email: 'panitia@archeryhub.id',
        role: 'PANITIA'
      };
      setCurrentUser(panUser);
      setActiveTab('PANITIA_DASHBOARD');
    } else if (role === 'SCORING') {
      const scoreUser: AuthUser = {
        id: 'usr-wasit-01',
        name: 'Dewan Wasit PB PERPANI',
        email: 'wasit@archeryhub.id',
        role: 'SCORING'
      };
      setCurrentUser(scoreUser);
      setActiveTab('SCORING_DASHBOARD');
    } else if (role === 'ADMIN') {
      const admUser: AuthUser = {
        id: 'usr-admin-01',
        name: 'Super Administrator',
        email: 'admin@archeryhub.id',
        role: 'ADMIN'
      };
      setCurrentUser(admUser);
      setActiveTab('ADMIN_DASHBOARD');
    }
  };

  // Handle Registration Submission from Public Portal
  // Upon registering, participant is logged in and redirected into their Participant Dashboard!
  const handleSubmitRegistration = async (data: {
    eventId: string;
    categoryId: string;
    contingentName: string;
    athletesList: { athleteName: string; gender: 'Putra' | 'Putri'; birthDate?: string; nationalId?: string }[];
    paymentProofUrl?: string;
    notes?: string;
  }) => {
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        setRegistrations(prev => [...json.data, ...prev]);

        // Automatically log participant in & switch to Participant Dashboard
        const newParticipant: AuthUser = {
          id: `usr-reg-${Date.now()}`,
          name: data.athletesList[0]?.athleteName || data.contingentName,
          email: `${data.contingentName.toLowerCase().replace(/[^a-z0-9]/g, '')}@kontingen.id`,
          role: 'PESERTA',
          contingentName: data.contingentName,
          contingentId: json.data[0]?.contingentId || `cont-${Date.now()}`
        };
        setCurrentUser(newParticipant);
        setActiveTab('PARTICIPANT_DASHBOARD');

        // Close registration modal
        setRegisterEvent(null);

        alert(`Pendaftaran kontingen "${data.contingentName}" berhasil dikirim! Anda langsung dialihkan ke Dashboard Peserta untuk memantau status pembayaran, nomor bantalan target, dan jadwal tanding.`);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim pendaftaran.');
    }
  };

  // Handle Verification & Target Allocation
  const handleVerifyRegistration = async (
    id: string, 
    status: 'VERIFIED' | 'REJECTED', 
    targetNumber?: string, 
    notes?: string
  ) => {
    try {
      const res = await fetch(`/api/registrations/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, targetNumber, verificationNotes: notes })
      });
      const json = await res.json();
      if (json.success) {
        setRegistrations(prev => prev.map(r => r.id === id ? json.data : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle On-Site Check-In (Roll Call & Equipment Inspection)
  const handleCheckInAthlete = async (
    registrationId: string, 
    data: { 
      checkedInBy?: string; 
      equipmentPassed?: boolean; 
      bowPoundage?: string; 
      arrowType?: string; 
      checkInNotes?: string; 
    }
  ): Promise<boolean> => {
    try {
      const res = await fetch(`/api/registrations/${registrationId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success && json.data) {
        setRegistrations(prev => prev.map(r => r.id === registrationId ? json.data : r));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Check-in error:', err);
      return false;
    }
  };

  // Handle Cancel Check-In
  const handleCancelCheckIn = async (registrationId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/registrations/${registrationId}/cancel-check-in`, {
        method: 'POST'
      });
      const json = await res.json();
      if (json.success && json.data) {
        setRegistrations(prev => prev.map(r => r.id === registrationId ? json.data : r));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Cancel check-in error:', err);
      return false;
    }
  };

  // Handle Save Qualification End
  const handleSaveQualificationEnd = async (data: {
    registrationId: string;
    sessionNumber: number;
    endNumber: number;
    arrows: ArrowScore[];
    signedByReferee?: string;
  }) => {
    try {
      const res = await fetch('/api/qualification-ends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success) {
        // Update local qualification ends
        setQualificationEnds(prev => {
          const filtered = prev.filter(
            e => !(e.registrationId === data.registrationId &&
                   e.sessionNumber === data.sessionNumber &&
                   e.endNumber === data.endNumber)
          );
          return [...filtered, json.data];
        });

        // Refresh category standings
        if (selectedCategory?.id) {
          const sRes = await fetch(`/api/standings/${selectedCategory.id}`);
          const sJson = await sRes.json();
          if (sJson.success) {
            setStandings(sJson.data);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Record Elimination Set End
  const handleRecordSetEnd = async (
    matchId: string, 
    setNumber: number, 
    arrowsA: ArrowScore[], 
    arrowsB: ArrowScore[]
  ) => {
    try {
      const res = await fetch(`/api/elimination-matches/${matchId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setNumber, arrowsA, arrowsB })
      });
      const json = await res.json();
      if (json.success) {
        setEliminationMatches(prev => prev.map(m => m.id === matchId ? json.data : m));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Shoot-Off Resolution
  const handleResolveShootOff = async (
    matchId: string, 
    shootOffA: ArrowScore, 
    shootOffB: ArrowScore, 
    distA?: number, 
    distB?: number
  ) => {
    try {
      const res = await fetch(`/api/elimination-matches/${matchId}/shoot-off`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shootOffA, shootOffB, distA, distB })
      });
      const json = await res.json();
      if (json.success) {
        setEliminationMatches(prev => prev.map(m => m.id === matchId ? json.data : m));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Generate Bracket
  const handleGenerateBracket = async () => {
    if (!selectedCategory?.id) return;
    try {
      const res = await fetch(`/api/categories/${selectedCategory.id}/generate-bracket`, {
        method: 'POST'
      });
      const json = await res.json();
      if (json.success) {
        setEliminationMatches(prev => {
          const others = prev.filter(m => m.categoryId !== selectedCategory.id);
          return [...others, ...json.data];
        });
        if (json.data.length > 0) {
          setSelectedMatchId(json.data[0].id);
        }
        alert(`Bagan eliminasi berhasil di-generate! ${json.data.length} match pertandingan siap dimainkan.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Event Created from Builder
  const handleEventCreated = (newEvent: ArcheryEvent) => {
    setEvents(prev => [newEvent, ...prev]);
    setSelectedEvent(newEvent);
    if (newEvent.categories.length > 0) {
      setSelectedCategory(newEvent.categories[0]);
    }
    if (currentUser?.role === 'ADMIN') {
      setActiveTab('ADMIN_DASHBOARD');
    } else {
      setActiveTab('PANITIA_DASHBOARD');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-neutral-900 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
      {/* Global Role-Adaptive Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        events={events}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        currentUser={currentUser}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
        onQuickSwitchRole={handleQuickSwitchRole}
        onOpenNewEvent={() => setActiveTab('EVENT_BUILDER')}
        onOpenArchitecture={() => setIsDbModalOpen(true)}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* 1. Portal Event Publik (Akses Bebas) */}
        {activeTab === 'PUBLIC_PORTAL' && (
          <EventDirectory
            events={events}
            onSelectEvent={(ev) => setDetailEvent(ev)}
            onOpenRegistration={(ev) => setRegisterEvent(ev)}
            onNavigateToBuilder={() => {
              if (currentUser?.role === 'ADMIN') {
                setActiveTab('EVENT_BUILDER');
              } else {
                handleOpenLogin('ADMIN');
              }
            }}
            onOpenLogin={() => handleOpenLogin()}
          />
        )}

        {/* 2. Dashboard Peserta / Kontingen */}
        {activeTab === 'PARTICIPANT_DASHBOARD' && (
          <ParticipantDashboard
            currentUser={currentUser || {
              id: 'usr-peserta-guest',
              name: 'Kontingen Tamu',
              email: 'guest@kontingen.id',
              role: 'PESERTA',
              contingentName: 'Fast Archery Club Bandung'
            }}
            events={events}
            selectedEvent={selectedEvent}
            registrations={registrations}
            qualificationEnds={qualificationEnds}
            onOpenNewRegistration={() => {
              if (selectedEvent) setRegisterEvent(selectedEvent);
              else if (events.length > 0) setRegisterEvent(events[0]);
            }}
            onViewLeaderboard={() => setActiveTab('LIVE_LEADERBOARD')}
          />
        )}

        {/* 3. Dashboard Super Admin */}
        {activeTab === 'ADMIN_DASHBOARD' && (
          <AdminDashboard
            currentUser={currentUser || {
              id: 'usr-admin-demo',
              name: 'Super Administrator',
              email: 'admin@archeryhub.id',
              role: 'ADMIN'
            }}
            events={events}
            selectedEvent={selectedEvent}
            registrations={registrations}
            onSelectEvent={(ev) => {
              setSelectedEvent(ev);
              if (ev.categories.length > 0) setSelectedCategory(ev.categories[0]);
            }}
            onOpenEventBuilder={() => setActiveTab('EVENT_BUILDER')}
            onOpenVerification={() => setActiveTab('PANITIA_DASHBOARD')}
            onOpenScoring={() => setActiveTab('SCORING_DASHBOARD')}
            onOpenArchitecture={() => setIsDbModalOpen(true)}
          />
        )}

        {/* 4. Dashboard Panitia (Verifikasi, Alokasi Bantalan & On-Site Roll Call) */}
        {activeTab === 'PANITIA_DASHBOARD' && (
          <PanitiaDashboard
            event={selectedEvent}
            registrations={registrations}
            onVerifyRegistration={handleVerifyRegistration}
            onOpenEventBuilder={() => setActiveTab('EVENT_BUILDER')}
            onOpenTargetStudio={() => setActiveTab('TARGET_FACE_STUDIO')}
            onCheckInAthlete={handleCheckInAthlete}
            onCancelCheckIn={handleCancelCheckIn}
            onRefreshData={() => {
              fetch('/api/registrations')
                .then(r => r.json())
                .then(json => {
                  if (json.success) setRegistrations(json.data);
                })
                .catch(console.error);
            }}
          />
        )}

        {/* 5. Dashboard Tim Scoring / Dewan Wasit */}
        {activeTab === 'SCORING_DASHBOARD' && (
          <ScoringTeamDashboard
            event={selectedEvent}
            category={selectedCategory}
            registrations={registrations}
            qualificationEnds={qualificationEnds}
            eliminationMatches={eliminationMatches}
            selectedMatchId={selectedMatchId}
            onSelectMatch={(id) => setSelectedMatchId(id)}
            onSaveQualificationEnd={handleSaveQualificationEnd}
            onRecordSetEnd={handleRecordSetEnd}
            onResolveShootOff={handleResolveShootOff}
            onGenerateBracket={handleGenerateBracket}
          />
        )}

        {/* 6. Dynamic Event & Custom Category Builder (EO & Admin) */}
        {activeTab === 'EVENT_BUILDER' && (
          <EventBuilder
            onEventCreated={handleEventCreated}
            onCancel={() => {
              if (currentUser?.role === 'ADMIN') setActiveTab('ADMIN_DASHBOARD');
              else setActiveTab('PUBLIC_PORTAL');
            }}
          />
        )}

        {/* 7. Standalone Verifikasi Kontingen Tab (Direct access) */}
        {activeTab === 'CONTINGENT_VERIFICATION' && (
          <ContingentVerification
            event={selectedEvent}
            registrations={registrations}
            onVerifyRegistration={handleVerifyRegistration}
          />
        )}

        {/* 8. Standalone Input Skor Kualifikasi (Direct access) */}
        {activeTab === 'QUALIFICATION_SCORING' && (
          <QualificationScorer
            event={selectedEvent}
            category={selectedCategory}
            registrations={registrations}
            qualificationEnds={qualificationEnds}
            onSaveEnd={handleSaveQualificationEnd}
          />
        )}

        {/* 9. Standalone Live Match Eliminasi & Shoot-Off */}
        {activeTab === 'ELIMINATION_SCORING' && (
          <EliminationScorer
            event={selectedEvent}
            category={selectedCategory}
            matches={eliminationMatches}
            selectedMatchId={selectedMatchId}
            onSelectMatch={(id) => setSelectedMatchId(id)}
            onRecordSetEnd={handleRecordSetEnd}
            onResolveShootOff={handleResolveShootOff}
          />
        )}

        {/* Hub 2: Hasil & Kompetisi Switcher (Leaderboard & Bracket) */}
        {(activeTab === 'LIVE_LEADERBOARD' || activeTab === 'ELIMINATION_BRACKET') && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-neutral-200 p-2 sm:p-2.5 rounded-2xl mb-6 shadow-sm">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('LIVE_LEADERBOARD')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'LIVE_LEADERBOARD'
                    ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Klasemen Kualifikasi</span>
              </button>

              <button
                onClick={() => setActiveTab('ELIMINATION_BRACKET')}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  activeTab === 'ELIMINATION_BRACKET'
                    ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                <GitBranch className="w-4 h-4" />
                <span>Bagan Eliminasi (Olympic Bracket)</span>
              </button>
            </div>

            <div className="text-xs text-neutral-500 pr-2 self-end sm:self-center">
              Divisi: <strong className="text-amber-700">{selectedCategory?.name || 'Recurve Men 70m'}</strong>
            </div>
          </div>
        )}

        {/* 10. Bagan Bracket Otomatis */}
        {activeTab === 'ELIMINATION_BRACKET' && (
          <EliminationBracket
            event={selectedEvent}
            category={selectedCategory}
            matches={eliminationMatches}
            onGenerateBracket={handleGenerateBracket}
            onSelectMatchToScore={(matchId) => {
              setSelectedMatchId(matchId);
              setActiveTab('SCORING_DASHBOARD');
            }}
          />
        )}

        {/* 11. Live Leaderboard Kualifikasi */}
        {activeTab === 'LIVE_LEADERBOARD' && (
          <LiveLeaderboard
            event={selectedEvent}
            category={selectedCategory}
            standings={standings}
            registrations={registrations}
            qualificationEnds={qualificationEnds}
          />
        )}

        {/* 12. Hub 3: Target Face Studio & Cetak PDF */}
        {activeTab === 'TARGET_FACE_STUDIO' && (
          <TargetFaceStudio
            event={selectedEvent}
            selectedCategory={selectedCategory}
          />
        )}

        {/* 12. Arsitektur SQL & ERD */}
        {activeTab === 'SQL_ARCHITECTURE' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  Rancangan Arsitektur Database & DDL Schema
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  Relational PostgreSQL / CockroachDB DDL schema with multi-tenancy, dynamic category normalization, JSONB arrow storage, and Shoot-Off millimeter resolution.
                </p>
              </div>
              <button
                onClick={() => setIsDbModalOpen(true)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl text-xs transition shadow-sm"
              >
                Buka Modal Interaktif
              </button>
            </div>
            
            <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm overflow-x-auto">
              <pre className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 text-amber-300 font-mono text-xs leading-relaxed">
                {`-- Preview DDL PostgreSQL (ArcheryHub System Architect)
-- Silakan klik tombol "Buka Modal Interaktif" di atas untuk navigasi tab lengkap, salin DDL, dan penjelasan arsitektur.`}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-8 px-6 text-center text-xs text-neutral-500 space-y-2 mt-auto">
        <p className="font-semibold text-neutral-700">
          ArcheryHub — Platform Manajemen Kejuaraan Panahan Modern & World Archery Standard
        </p>
        <p className="text-neutral-400">
          Akses Bebas Publik • Portal Peserta • Dashboard Panitia & Verifikasi • Modul Dewan Wasit & Fair Play Scoring • Super Admin
        </p>
      </footer>

      {/* Global Modals */}
      <EventDetailModal
        event={detailEvent}
        onClose={() => setDetailEvent(null)}
        onOpenRegistration={(ev) => {
          setDetailEvent(null);
          setRegisterEvent(ev);
        }}
      />

      <RegistrationModal
        event={registerEvent}
        onClose={() => setRegisterEvent(null)}
        onSubmitRegistration={handleSubmitRegistration}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        initialRole={loginInitialRole}
      />

      <DatabaseArchitectureModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
      />
    </div>
  );
}
