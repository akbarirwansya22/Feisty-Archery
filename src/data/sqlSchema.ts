export const POSTGRESQL_DDL_SCHEMA = `-- ============================================================================
-- ARCHERYHUB DATABASE ARCHITECTURE & RELATIONAL SCHEMA (PostgreSQL / CockroachDB)
-- Designed by Senior Full-Stack Architect for Multi-Event & Dynamic Archery Engine
-- Compliant with World Archery (WA) & PERPANI Official Rulebooks
-- ============================================================================

-- 1. EXTENSIONS & CUSTOM ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE event_status_enum AS ENUM (
    'DRAFT', 
    'REGISTRATION_OPEN', 
    'ONGOING', 
    'COMPLETED', 
    'CANCELLED'
);

CREATE TYPE division_enum AS ENUM (
    'Recurve', 
    'Compound', 
    'Nasional', 
    'Barebow', 
    'Tradisional'
);

CREATE TYPE age_category_enum AS ENUM (
    'U-9', 
    'U-12', 
    'U-15', 
    'U-18', 
    'Umum', 
    'Master 50+'
);

CREATE TYPE gender_enum AS ENUM ('Putra', 'Putri', 'Campuran');

CREATE TYPE elimination_type_enum AS ENUM (
    'SET_SYSTEM',       -- For Recurve, Standard Bow / Nasional, Barebow (2-1-0 points, first to 6)
    'CUMULATIVE_SCORE'  -- For Compound (5 ends x 3 arrows, total cumulative score out of 150)
);

CREATE TYPE registration_status_enum AS ENUM (
    'PENDING_PAYMENT', 
    'VERIFIED', 
    'REJECTED', 
    'WITHDRAWN'
);

CREATE TYPE match_status_enum AS ENUM (
    'PENDING', 
    'LIVE', 
    'COMPLETED', 
    'BYE'
);

-- ============================================================================
-- 2. CORE MULTI-TENANT ENTITIES (Organizers & Events)
-- ============================================================================

CREATE TABLE organizers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    venue_name VARCHAR(255) NOT NULL,
    venue_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    banner_url TEXT,
    guidebook_url TEXT,
    status event_status_enum DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_event_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_reg_deadline CHECK (registration_deadline <= start_date)
);

-- ============================================================================
-- 3. DYNAMIC CUSTOM CATEGORY BUILDER TABLE
-- Allows EO to customize every single archery parameter per category freely
-- ============================================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,                   -- e.g. "Recurve Umum Putra 70m"
    division division_enum NOT NULL,              -- Recurve, Compound, Nasional, etc.
    age_category age_category_enum NOT NULL,      -- U-12, U-15, Umum, etc.
    gender gender_enum NOT NULL,                  -- Putra / Putri
    distance_meters INT NOT NULL,                 -- 70, 50, 40, 30, 20, 15, 10
    target_face_cm INT NOT NULL,                  -- 122, 80, 40
    format_qualification VARCHAR(100) NOT NULL,   -- e.g. "2 Sesi x 6 Seri (72 Panah)"
    arrows_per_end INT NOT NULL DEFAULT 6,        -- 3 or 6 arrows per end
    ends_per_session INT NOT NULL DEFAULT 6,      -- usually 6 ends
    sessions_count INT NOT NULL DEFAULT 2,        -- 1 or 2 qualification sessions
    elimination_type elimination_type_enum NOT NULL, -- SET_SYSTEM vs CUMULATIVE_SCORE
    elimination_quota INT NOT NULL DEFAULT 16,    -- 4, 8, 16, 32 cut for elimination
    fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,    -- Registration fee in IDR
    quota INT NOT NULL DEFAULT 32,                -- Max capacity of participants
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_category_quota CHECK (quota > 0),
    CONSTRAINT chk_category_fee CHECK (fee >= 0)
);

-- ============================================================================
-- 4. PARTICIPANTS, CONTINGENTS & REGISTRATIONS
-- ============================================================================

CREATE TABLE contingents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,                   -- e.g. "Fast Archery Club Bandung"
    city VARCHAR(100) NOT NULL,
    official_name VARCHAR(255) NOT NULL,          -- Contingent Manager / Coach
    official_phone VARCHAR(50) NOT NULL,
    official_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE athletes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contingent_id UUID NOT NULL REFERENCES contingents(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    gender gender_enum NOT NULL,
    birth_date DATE NOT NULL,
    national_id VARCHAR(50),                      -- NIK / NISN / Paspor
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    contingent_id UUID NOT NULL REFERENCES contingents(id) ON DELETE CASCADE,
    target_number VARCHAR(10),                    -- e.g. "01A", "14B" assigned by EO
    status registration_status_enum DEFAULT 'PENDING_PAYMENT',
    payment_proof_url TEXT,
    payment_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES organizers(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_athlete_category UNIQUE (category_id, athlete_id)
);

-- ============================================================================
-- 5. QUALIFICATION SCORING ENGINE (Real-Time & Fair Play Audit Trail)
-- Stores each arrow atomically to enable tamper-proof audits & tie-breakers
-- ============================================================================

CREATE TABLE qualification_ends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    session_number INT NOT NULL CHECK (session_number IN (1, 2)),
    end_number INT NOT NULL CHECK (end_number BETWEEN 1 AND 12),
    arrows JSONB NOT NULL,                        -- Array of arrows e.g. ["X", "10", "9", "9", "8", "7"]
    end_score INT NOT NULL,                       -- Sum of values (X counts as 10)
    tens_count INT NOT NULL DEFAULT 0,            -- Number of 10s and Xs
    x_count INT NOT NULL DEFAULT 0,               -- Specific count of Xs
    is_verified BOOLEAN DEFAULT FALSE,            -- Locked by Line Judge/Wasit
    signed_by_referee VARCHAR(255),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_reg_session_end UNIQUE (registration_id, session_number, end_number)
);

-- Denormalized cache table for sub-millisecond Live Leaderboard performance
CREATE TABLE qualification_standings (
    registration_id UUID PRIMARY KEY REFERENCES registrations(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    session_1_score INT DEFAULT 0,
    session_2_score INT DEFAULT 0,
    total_score INT GENERATED ALWAYS AS (session_1_score + session_2_score) STORED,
    total_tens INT DEFAULT 0,
    total_xs INT DEFAULT 0,
    arrows_shot INT DEFAULT 0,
    current_rank INT,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. AUTOMATIC ELIMINATION ENGINE & BRACKETS
-- Supports Olympic Set System (Recurve) & Cumulative Score (Compound)
-- ============================================================================

CREATE TABLE elimination_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    round_name VARCHAR(100) NOT NULL,             -- '16 Besar', 'Perempat Final', 'Semifinal', 'Final Emas'
    round_order INT NOT NULL,                     -- 1 = 1/16, 2 = 1/8, 3 = QF, 4 = SF, 5 = Medal Matches
    match_number INT NOT NULL,                    -- Unique sequential index in round
    athlete_a_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
    athlete_b_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
    seed_a INT,                                   -- Qualification Rank e.g. 1
    seed_b INT,                                   -- Qualification Rank e.g. 16 or 8
    match_type elimination_type_enum NOT NULL,    -- SET_SYSTEM or CUMULATIVE_SCORE
    status match_status_enum DEFAULT 'PENDING',
    winner_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
    set_points_a INT DEFAULT 0,                   -- For SET_SYSTEM: 0..6
    set_points_b INT DEFAULT 0,
    total_score_a INT DEFAULT 0,                  -- For CUMULATIVE_SCORE: 0..150
    total_score_b INT DEFAULT 0,
    shoot_off_a VARCHAR(5),                       -- "X", "10", "9", etc. if tied 5-5 or score equal
    shoot_off_b VARCHAR(5),
    shoot_off_dist_a_mm NUMERIC(6, 2),            -- Distance to center in millimeters if same score
    shoot_off_dist_b_mm NUMERIC(6, 2),
    target_lane VARCHAR(50),                      -- e.g. "Bantalan 12A vs 12B"
    next_match_id UUID REFERENCES elimination_matches(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE elimination_ends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES elimination_matches(id) ON DELETE CASCADE,
    set_number INT NOT NULL CHECK (set_number BETWEEN 1 AND 5),
    arrows_a JSONB NOT NULL,                      -- e.g. ["10", "9", "9"] (3 arrows)
    arrows_b JSONB NOT NULL,                      -- e.g. ["9", "9", "8"]
    score_a INT NOT NULL,                         -- e.g. 28
    score_b INT NOT NULL,                         -- e.g. 26
    set_points_a INT DEFAULT 0,                   -- 2 if won, 1 if tie, 0 if lost
    set_points_b INT DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_match_set UNIQUE (match_id, set_number)
);

-- ============================================================================
-- 7. PERFORMANCE OPTIMIZATION INDEXES
-- Designed for concurrent scoring during peak live tournaments
-- ============================================================================

CREATE INDEX idx_events_status_dates ON events(status, start_date);
CREATE INDEX idx_categories_event ON categories(event_id);
CREATE INDEX idx_registrations_category_status ON registrations(category_id, status);
CREATE INDEX idx_qualification_ends_reg ON qualification_ends(registration_id, session_number, end_number);
CREATE INDEX idx_standings_category_rank ON qualification_standings(category_id, total_score DESC, total_tens DESC, total_xs DESC);
CREATE INDEX idx_elimination_matches_cat_round ON elimination_matches(category_id, round_order, match_number);
`;

export const ARCHERY_HUB_SQL_DDL = POSTGRESQL_DDL_SCHEMA;

export const ARCHITECTURE_EXPLANATION = {
  folderStructure: `
/ArcheryHub
├── server.ts                    # Backend API (Express + Vite Middleware integration)
├── src/
│   ├── types/index.ts           # Comprehensive Domain Models & TypeScript Interfaces
│   ├── data/
│   │   ├── seedData.ts          # Realistic tournament datasets (PERPANI & World Archery compliant)
│   │   └── sqlSchema.ts         # Complete PostgreSQL/MySQL Production DDL & Indexes
│   ├── components/
│   │   ├── Navbar.tsx           # Global App Navigation & Role Switcher
│   │   ├── public/
│   │   │   ├── EventDirectory.tsx    # Filterable Public Event Portal
│   │   │   ├── EventDetailModal.tsx  # Detailed Event Dossier, Juklak & Categories
│   │   │   └── RegistrationModal.tsx # Athlete & Club Contingent Registration Modal
│   │   ├── organizer/
│   │   │   ├── EventBuilder.tsx      # Multi-Event & Dynamic Custom Category Builder
│   │   │   └── ContingentVerification.tsx # Payment Slip Verification & Target Assigning
│   │   ├── scoring/
│   │   │   ├── QualificationScorer.tsx # Interactive World Archery Target Keypad
│   │   │   └── EliminationScorer.tsx   # Set System (Recurve) & Total Score (Compound) Match Scorer
│   │   ├── brackets/
│   │   │   └── EliminationBracket.tsx  # Auto-Seeding Generator & Visual Tournament Tree
│   │   ├── leaderboard/
│   │   │   └── LiveLeaderboard.tsx     # Real-Time Standings & Tie-Break Rankings
│   │   └── architecture/
│   │       └── DatabaseArchitectureModal.tsx # Interactive SQL ERD & Architecture Inspector
│   ├── App.tsx                  # Master Application Controller & Synchronized State Store
│   ├── main.tsx                 # React App Entrypoint
│   └── index.css                # Tailwind CSS & Custom Archery Target Color Accents
`.trim(),
  keyPrinciples: [
    "Multi-Event & Multi-Tenant: Setiap EO memiliki event tersendiri dengan isolasi data lengkap melalui organizer_id dan event_id.",
    "Dynamic Custom Category Builder: Bebas mengatur Divisi (Recurve, Compound, Nasional, Barebow, Tradisional), Umur (U-9 sampai Master 50+), Jarak (10m - 70m), Target Face (40cm - 122cm), dan Sistem Eliminasi (Set System vs Cumulative).",
    "Audited Fair Play Scoring: Penyimpanan panah atomik (X, 10, 9..M) dalam JSONB untuk audit tie-break akurat, dengan tandatangan digital wasit/line judge.",
    "Dual Elimination Engine: Mendukung Olympic Set System (first to 6 points, shoot-off closest to center) dan Compound Cumulative Total Score (15 panah max 150 poin).",
    "Instant Automatic Seeding: Menghitung peringkat kualifikasi secara otomatis (Skor Total -> 10s -> Xs) dan menghasilkan bagan eliminasi standar World Archery (Seed 1 vs Seed Terbawah)."
  ]
};
