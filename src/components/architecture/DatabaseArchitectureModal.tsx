import React, { useState } from 'react';
import { 
  X, 
  Database, 
  FileCode, 
  FolderTree, 
  Copy, 
  Check, 
  Layers, 
  ShieldCheck,
  Server
} from 'lucide-react';
import { ARCHERY_HUB_SQL_DDL } from '../../data/sqlSchema';

interface DatabaseArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseArchitectureModal: React.FC<DatabaseArchitectureModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'SQL_DDL' | 'FOLDER_STRUCTURE' | 'ARCH_EXPLANATION'>('SQL_DDL');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(ARCHERY_HUB_SQL_DDL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div 
        id="modal-database-architecture"
        className="relative w-full max-w-5xl bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-6 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-bold text-amber-400">System Architect Dossier</span>
                <span className="text-xs text-neutral-400">PostgreSQL / Multi-Event ERD</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Rancangan Struktur Database Relasional & Arsitektur Sistem
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-800 bg-neutral-950 px-6 space-x-4 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('SQL_DDL')}
            className={`py-3 flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'SQL_DDL' 
                ? 'border-amber-500 text-amber-400' 
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Skema SQL Relasional (DDL)</span>
          </button>
          <button
            onClick={() => setActiveTab('FOLDER_STRUCTURE')}
            className={`py-3 flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'FOLDER_STRUCTURE' 
                ? 'border-amber-500 text-amber-400' 
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Struktur Folder & Modularitas</span>
          </button>
          <button
            onClick={() => setActiveTab('ARCH_EXPLANATION')}
            className={`py-3 flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'ARCH_EXPLANATION' 
                ? 'border-amber-500 text-amber-400' 
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Prinsip Desain Fair Play & Skoring</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs text-neutral-300 font-mono">
          {activeTab === 'SQL_DDL' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 text-[11px]">
                  Skema DDL PostgreSQL dengan Foreign Keys, ENUM Types, JSONB Arrow Storage, dan Check Constraints.
                </span>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center space-x-1.5 transition text-[11px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin SQL DDL'}</span>
                </button>
              </div>
              <pre className="p-4 bg-neutral-950 rounded-xl border border-neutral-800 text-amber-300 text-[11px] overflow-x-auto leading-relaxed">
                {ARCHERY_HUB_SQL_DDL}
              </pre>
            </div>
          )}

          {activeTab === 'FOLDER_STRUCTURE' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono text-[11px] leading-relaxed space-y-2">
                <p className="text-amber-400 font-bold">// Arsitektur Folder ArcheryHub Full-Stack</p>
                <p>archeryhub/</p>
                <p>├── server.ts                    # Backend API Express (REST, Scoring Engine, Bracket Generator)</p>
                <p>├── src/</p>
                <p>│   ├── types/                  # Global domain types & World Archery contracts</p>
                <p>│   │   └── index.ts</p>
                <p>│   ├── data/</p>
                <p>│   │   ├── sqlSchema.ts        # PostgreSQL DDL, Architecture & Entity Relationships</p>
                <p>│   │   └── seedData.ts         # Sample official tournaments, categories, archers</p>
                <p>│   ├── components/</p>
                <p>│   │   ├── Navbar.tsx          # Dual-Mode switcher (Public Portal vs EO Dashboard)</p>
                <p>│   │   ├── public/             # Athlete & Public Facing</p>
                <p>│   │   │   ├── EventDirectory.tsx     # Discovery, search, filters</p>
                <p>│   │   │   ├── EventDetailModal.tsx   # Detailed event dossier & categories</p>
                <p>│   │   │   └── RegistrationModal.tsx  # Contingent & athlete enrollment</p>
                <p>│   │   ├── organizer/          # Event Organizer (EO) Management</p>
                <p>│   │   │   ├── EventBuilder.tsx       # Dynamic Custom Category Builder</p>
                <p>│   │   │   └── ContingentVerification.tsx # Target allocation & payment approval</p>
                <p>│   │   ├── scoring/            # Fair Play & Match Controllers</p>
                <p>│   │   │   ├── QualificationScorer.tsx # Official per-end arrow keypad & referee sign-off</p>
                <p>│   │   │   └── EliminationScorer.tsx   # Olympic Set System & Compound 150 duel scorer</p>
                <p>│   │   ├── brackets/           # Auto-Seeding & Visualization</p>
                <p>│   │   │   └── EliminationBracket.tsx  # Tournament tree (Seed 1 vs 8, 4 vs 5, etc.)</p>
                <p>│   │   ├── leaderboard/        # Real-time Standings</p>
                <p>│   │   │   └── LiveLeaderboard.tsx     # Live Qualification rankings (Total, 10s, Xs)</p>
                <p>│   │   └── architecture/       # Database & System Specs</p>
                <p>│   │       └── DatabaseArchitectureModal.tsx</p>
                <p>│   ├── App.tsx                 # Root coordinator & multi-tab navigation</p>
                <p>│   ├── main.tsx</p>
                <p>│   └── index.css               # Tailwind CSS styles</p>
              </div>
            </div>
          )}

          {activeTab === 'ARCH_EXPLANATION' && (
            <div className="space-y-4 text-xs font-sans text-neutral-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h4 className="text-amber-400 font-bold text-sm">1. Fleksibilitas Multi-Event & Custom Category Builder</h4>
                <p>
                  Sistem dirancang dengan normalisasi tingkat 3 (3NF) memisahkan entitas <code>organizers</code>, <code>events</code>, dan <code>event_categories</code>. Setiap EO dapat membuat kategori kustom tanpa batasan: memilih kombinasi Divisi (Recurve, Compound, Nasional, Barebow, Tradisional), Kategori Umur (U-9 sampai Master 50+), Jarak (10m s/d 70m), dan Target Face (40cm, 80cm, 122cm).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h4 className="text-amber-400 font-bold text-sm">2. Penyimpanan Skor Atomik & Fair Play Audit Trail</h4>
                <p>
                  Setiap anak panah disimpan dalam kolom <code>JSONB</code> pada tabel <code>qualification_ends</code>. Nilai panah ('X', '10', '9'..'M') diaudit dengan tanda tangan digital wasit (<code>signed_by_referee</code>) serta status kunci (<code>is_verified</code>). Hal ini mencegah kecurangan atau manipulasi nilai pasca-seri ditembakkan.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <h4 className="text-amber-400 font-bold text-sm">3. Dual Engine Eliminasi & Aturan Shoot-Off</h4>
                <p>
                  Engine eliminasi otomatis mendeteksi tipe divisi:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-neutral-400">
                  <li><strong>Set System (Recurve / Nasional):</strong> Menang seri = 2 poin, seri = 1 poin, kalah = 0 poin. Pemanah pertama mencapai 6 set poin memenangkan duel. Jika imbang 5-5, berlaku 1 anak panah Shoot-Off.</li>
                  <li><strong>Cumulative Total Score (Compound):</strong> 5 seri x 3 anak panah = 15 anak panah (maksimum 150 poin). Poin tertinggi memenangkan duel.</li>
                  <li><strong>Tie-Breaker Millimeter:</strong> Jika nilai panah shoot-off identik (misal 10 vs 10 atau 9 vs 9), jarak fisik anak panah ke pusat target (X-Ring center distance) diukur dalam milimeter untuk menentukan pemenang mutlak secara objektif.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
