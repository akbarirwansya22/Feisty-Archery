export type Division = 
  | 'Recurve' 
  | 'Compound' 
  | 'Nasional' 
  | 'Barebow' 
  | 'Tradisional';

export type AgeCategory = 
  | 'U-9' 
  | 'U-12' 
  | 'U-15' 
  | 'U-18' 
  | 'Umum' 
  | 'Master 50+';

export type Gender = 'Putra' | 'Putri' | 'Campuran';

export type EliminationType = 'SET_SYSTEM' | 'CUMULATIVE_SCORE';

export type RegistrationStatus = 'PENDING_PAYMENT' | 'VERIFIED' | 'REJECTED';

export type EventStatus = 'DRAFT' | 'REGISTRATION_OPEN' | 'ONGOING' | 'COMPLETED';

export type ArrowScore = 'X' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2' | '1' | 'M';

export type UserRole = 'PUBLIC' | 'PESERTA' | 'PANITIA' | 'SCORING' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  contingentId?: string;
  contingentName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface Category {
  id: string;
  eventId: string;
  name: string;
  division: Division;
  ageCategory: AgeCategory;
  gender: Gender;
  distanceMeters: number; // e.g., 70, 50, 40, 30, 20
  targetFaceCm: number; // e.g., 122, 80, 40
  formatQualification: string; // e.g. "2 Sesi x 6 Seri (72 Panah)"
  arrowsPerEnd: number; // 3 or 6
  endsPerSession: number; // 6
  sessionsCount: number; // 1 or 2
  eliminationType: EliminationType;
  eliminationQuota: number; // 4, 8, 16, 32
  fee: number; // in IDR
  quota: number;
  registeredCount?: number;
  createdAt?: string;
}

export interface EventOrganizer {
  id: string;
  name: string;
  email: string;
  phone: string;
  logoUrl?: string;
  verified: boolean;
}

export interface ArcheryEvent {
  id: string;
  organizerId: string;
  organizerName: string;
  name: string;
  slug: string;
  description: string;
  venueName: string;
  venueAddress: string;
  city: string;
  province: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  bannerUrl: string;
  guidebookUrl?: string;
  status: EventStatus;
  categories: Category[];
  totalAthletesCount?: number;
  totalClubsCount?: number;
  createdAt: string;
}

export interface Athlete {
  id: string;
  contingentId: string;
  contingentName: string;
  name: string;
  gender: 'Putra' | 'Putri';
  birthDate: string;
  nationalId?: string; // NIK / KTP / KIA
  photoUrl?: string;
}

export interface Registration {
  id: string;
  categoryId: string;
  eventId: string;
  athleteId: string;
  athleteName: string;
  gender: 'Putra' | 'Putri';
  contingentId: string;
  contingentName: string;
  targetNumber?: string; // e.g. "04A"
  status: RegistrationStatus;
  paymentProofUrl?: string;
  paymentAmount: number;
  notes?: string;
  registeredAt: string;
  // On-Site Check-in / Roll Call & Equipment Inspection
  isCheckedIn?: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  equipmentPassed?: boolean;
  bowPoundage?: string;
  arrowType?: string;
  checkInNotes?: string;
}

export interface QualificationEnd {
  id: string;
  registrationId: string;
  sessionNumber: number; // 1 or 2
  endNumber: number; // 1 to 6
  arrows: ArrowScore[];
  endScore: number;
  tensCount: number;
  xCount: number;
  isVerified: boolean;
  signedByReferee?: string;
}

export interface QualificationTotal {
  registrationId: string;
  athleteName: string;
  contingentName: string;
  targetNumber?: string;
  session1Score: number;
  session2Score: number;
  totalScore: number;
  tensCount: number;
  xCount: number;
  averageArrow: number;
  rank: number;
}

export interface EliminationEnd {
  setNumber: number;
  arrowsA: ArrowScore[];
  arrowsB: ArrowScore[];
  scoreA: number;
  scoreB: number;
  setPointsA?: number; // 2, 1, or 0 in Set System
  setPointsB?: number;
}

export interface EliminationMatch {
  id: string;
  categoryId: string;
  roundName: 'Babak 16 Besar' | 'Perempat Final' | 'Semifinal' | 'Perebutan Medali Perunggu' | 'Final Perebutan Emas';
  roundOrder: number; // 1: Round of 16, 2: QF, 3: SF, 4: Bronze/Final
  matchNumber: number;
  athleteA?: {
    registrationId: string;
    athleteName: string;
    contingentName: string;
    seed: number;
  };
  athleteB?: {
    registrationId: string;
    athleteName: string;
    contingentName: string;
    seed: number;
  };
  eliminationType: EliminationType;
  winnerId?: string; // registrationId
  status: 'PENDING' | 'LIVE' | 'COMPLETED' | 'BYE';
  setPointsA: number;
  setPointsB: number;
  totalScoreA: number;
  totalScoreB: number;
  shootOffA?: ArrowScore;
  shootOffB?: ArrowScore;
  shootOffDistanceA_mm?: number;
  shootOffDistanceB_mm?: number;
  ends: EliminationEnd[];
  targetLine?: string; // e.g. "Target 12A vs 12B"
  nextMatchId?: string;
  isGoldFinal?: boolean;
  isBronzeFinal?: boolean;
}

export type AccreditationRole = 'ATLET' | 'OFFICIAL' | 'PANITIA' | 'WASIT' | 'VIP' | 'MEDIA';

export interface SponsorItem {
  id: string;
  name: string;
  logoUrl: string;
  tier: 'MAIN' | 'GOLD' | 'OFFICIAL';
}

export interface IdCardDesignConfig {
  eventLogoUrl: string;
  organizationLogoUrl?: string; // e.g. PERPANI / KONI
  badgeTitle: string;
  badgeSubtitle: string;
  headerTheme: 'EMERALD' | 'NAVY' | 'CRIMSON' | 'GOLD' | 'CARBON';
  sponsors: SponsorItem[];
  footerNote: string;
  showZoneMatrix: boolean;
  showLanyardSlot: boolean;
}

export interface AccreditedPerson {
  id: string;
  eventId: string;
  fullName: string;
  role: AccreditationRole;
  titleOrDivision: string; // e.g. "Ketua OC", "Wasit Garis (Line Judge)", "Ketua Umum KONI", "Pelatih Kepala"
  organization: string; // e.g. "PB PERPANI", "Dispora Jawa Barat", "Fast Archery Club Bandung"
  photoUrl?: string;
  phone?: string;
  allowedZones: number[]; // e.g. [1, 2, 3, 4, 5, 6]
  cardCode: string; // e.g. "ACC-PAN-001"
  createdAt: string;
}
