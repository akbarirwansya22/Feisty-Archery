import { ArcheryEvent, Registration, QualificationEnd, EliminationMatch } from '../types';

export const INITIAL_EVENTS: ArcheryEvent[] = [
  {
    id: 'evt-001',
    organizerId: 'org-001',
    organizerName: 'PB PERPANI Indonesia & Dispora',
    name: 'Kejurnas Panahan Piala Menpora 2026',
    slug: 'kejurnas-piala-menpora-2026',
    description: 'Kejuaraan Nasional Panahan Terbesar tahun 2026 memperebutkan Piala Bergilir Menteri Pemuda dan Olahraga. Mempertandingkan nomor Recurve, Compound, Nasional, dan Barebow berstandar World Archery.',
    venueName: 'Stadion Panahan Gelora Bung Karno (GBK)',
    venueAddress: 'Jl. Pintu Satu Senayan, Gelora, Jakarta Pusat',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    startDate: '2026-10-15',
    endDate: '2026-10-20',
    registrationDeadline: '2026-10-01T23:59:59Z',
    bannerUrl: 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=1200&q=80',
    status: 'ONGOING',
    createdAt: '2026-08-01',
    categories: [
      {
        id: 'cat-001',
        eventId: 'evt-001',
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
        quota: 32,
        registeredCount: 8
      },
      {
        id: 'cat-002',
        eventId: 'evt-001',
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
        quota: 32,
        registeredCount: 6
      },
      {
        id: 'cat-003',
        eventId: 'evt-001',
        name: 'Nasional / Standar Bow U-15 Putri 30m',
        division: 'Nasional',
        ageCategory: 'U-15',
        gender: 'Putri',
        distanceMeters: 30,
        targetFaceCm: 80,
        formatQualification: '2 Sesi x 6 Seri (72 Panah)',
        arrowsPerEnd: 6,
        endsPerSession: 6,
        sessionsCount: 2,
        eliminationType: 'SET_SYSTEM',
        eliminationQuota: 8,
        fee: 300000,
        quota: 32,
        registeredCount: 5
      },
      {
        id: 'cat-004',
        eventId: 'evt-001',
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
        quota: 32,
        registeredCount: 4
      }
    ]
  },
  {
    id: 'evt-002',
    organizerId: 'org-002',
    organizerName: 'Pengprov PERPANI Jawa Timur',
    name: 'Surabaya Open Archery International 2026',
    slug: 'surabaya-open-archery-2026',
    description: 'Kejuaraan panahan terbuka tingkat nasional dan internasional dengan sirkuit kualifikasi PON. Dilengkapi fasilitas live scoring digital dan arena outdoor berstandar Asia.',
    venueName: 'Lapangan Panahan KONI Jawa Timur',
    venueAddress: 'Jl. Kertajaya Indah Timur No. 4, Surabaya',
    city: 'Surabaya',
    province: 'Jawa Timur',
    startDate: '2026-11-10',
    endDate: '2026-11-14',
    registrationDeadline: '2026-10-25T23:59:59Z',
    bannerUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    status: 'REGISTRATION_OPEN',
    createdAt: '2026-08-10',
    categories: [
      {
        id: 'cat-005',
        eventId: 'evt-002',
        name: 'Recurve U-18 Putra 60m',
        division: 'Recurve',
        ageCategory: 'U-18',
        gender: 'Putra',
        distanceMeters: 60,
        targetFaceCm: 122,
        formatQualification: '2 Sesi x 6 Seri (72 Panah)',
        arrowsPerEnd: 6,
        endsPerSession: 6,
        sessionsCount: 2,
        eliminationType: 'SET_SYSTEM',
        eliminationQuota: 16,
        fee: 400000,
        quota: 48,
        registeredCount: 12
      },
      {
        id: 'cat-006',
        eventId: 'evt-002',
        name: 'Compound Umum Putri 50m',
        division: 'Compound',
        ageCategory: 'Umum',
        gender: 'Putri',
        distanceMeters: 50,
        targetFaceCm: 80,
        formatQualification: '2 Sesi x 6 Seri (72 Panah)',
        arrowsPerEnd: 6,
        endsPerSession: 6,
        sessionsCount: 2,
        eliminationType: 'CUMULATIVE_SCORE',
        eliminationQuota: 8,
        fee: 400000,
        quota: 32,
        registeredCount: 7
      }
    ]
  },
  {
    id: 'evt-003',
    organizerId: 'org-003',
    organizerName: 'Bandung Archery Sports Club (BASC)',
    name: 'Bandung Traditional & Horsebow Championship 2026',
    slug: 'bandung-traditional-horsebow-2026',
    description: 'Kejuaraan panahan tradisional, jemparingan, dan horsebow melestarikan teknik panahan nusantara dengan standar kompetisi modern dan fair play.',
    venueName: 'Arcamanik Sport Center Indoor Hall',
    venueAddress: 'Jl. Pacuan Kuda No. 120, Sukamiskin, Bandung',
    city: 'Bandung',
    province: 'Jawa Barat',
    startDate: '2026-12-05',
    endDate: '2026-12-07',
    registrationDeadline: '2026-11-20T23:59:59Z',
    bannerUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    status: 'REGISTRATION_OPEN',
    createdAt: '2026-08-20',
    categories: [
      {
        id: 'cat-007',
        eventId: 'evt-003',
        name: 'Tradisional Horsebow Umum Putra 20m',
        division: 'Tradisional',
        ageCategory: 'Umum',
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
        quota: 36,
        registeredCount: 14
      }
    ]
  }
];

export const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: 'reg-001',
    categoryId: 'cat-001',
    eventId: 'evt-001',
    athleteId: 'ath-001',
    athleteName: 'Arif Dwi Pangestu',
    gender: 'Putra',
    contingentId: 'cont-001',
    contingentName: 'D\'Archers Club Jakarta',
    targetNumber: '01A',
    status: 'VERIFIED',
    paymentAmount: 350000,
    registeredAt: '2026-09-01'
  },
  {
    id: 'reg-002',
    categoryId: 'cat-001',
    eventId: 'evt-001',
    athleteId: 'ath-002',
    athleteName: 'Riau Ega Agatha',
    gender: 'Putra',
    contingentId: 'cont-002',
    contingentName: 'Fast Archery Club Bandung',
    targetNumber: '01B',
    status: 'VERIFIED',
    paymentAmount: 350000,
    registeredAt: '2026-09-02'
  },
  {
    id: 'reg-003',
    categoryId: 'cat-001',
    eventId: 'evt-001',
    athleteId: 'ath-003',
    athleteName: 'Alviyanto Bagas Prastyadi',
    gender: 'Putra',
    contingentId: 'cont-003',
    contingentName: 'Arrowhead Surabaya',
    targetNumber: '02A',
    status: 'VERIFIED',
    paymentAmount: 350000,
    registeredAt: '2026-09-03'
  },
  {
    id: 'reg-004',
    categoryId: 'cat-001',
    eventId: 'evt-001',
    athleteId: 'ath-004',
    athleteName: 'Bagas Kharisma',
    gender: 'Putra',
    contingentId: 'cont-004',
    contingentName: 'Patriot Archery Bekasi',
    targetNumber: '02B',
    status: 'VERIFIED',
    paymentAmount: 350000,
    registeredAt: '2026-09-04'
  },
  {
    id: 'reg-005',
    categoryId: 'cat-001',
    eventId: 'evt-001',
    athleteId: 'ath-005',
    athleteName: 'Hendra Purnama',
    gender: 'Putra',
    contingentId: 'cont-001',
    contingentName: 'D\'Archers Club Jakarta',
    targetNumber: '03A',
    status: 'VERIFIED',
    paymentAmount: 350000,
    registeredAt: '2026-09-05'
  },
  {
    id: 'reg-006',
    categoryId: 'cat-001',
    eventId: 'evt-001',
    athleteId: 'ath-006',
    athleteName: 'Okka Bagus Subekti',
    gender: 'Putra',
    contingentId: 'cont-005',
    contingentName: 'Sriwijaya Archery Club',
    targetNumber: '03B',
    status: 'VERIFIED',
    paymentAmount: 350000,
    registeredAt: '2026-09-06'
  },
  {
    id: 'reg-007',
    categoryId: 'cat-001',
    eventId: 'evt-001',
    athleteId: 'ath-007',
    athleteName: 'Faris Pratama',
    gender: 'Putra',
    contingentId: 'cont-002',
    contingentName: 'Fast Archery Club Bandung',
    targetNumber: '04A',
    status: 'VERIFIED',
    paymentAmount: 350000,
    registeredAt: '2026-09-07'
  },
  {
    id: 'reg-008',
    categoryId: 'cat-001',
    eventId: 'evt-001',
    athleteId: 'ath-008',
    athleteName: 'Kurniawan Santoso',
    gender: 'Putra',
    contingentId: 'cont-003',
    contingentName: 'Arrowhead Surabaya',
    targetNumber: '04B',
    status: 'VERIFIED',
    paymentAmount: 350000,
    registeredAt: '2026-09-08'
  },
  // Pending verification example
  {
    id: 'reg-009',
    categoryId: 'cat-001',
    eventId: 'evt-001',
    athleteId: 'ath-009',
    athleteName: 'Zaki Raihan',
    gender: 'Putra',
    contingentId: 'cont-006',
    contingentName: 'Mataram Archery Team',
    targetNumber: undefined,
    status: 'PENDING_PAYMENT',
    paymentProofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
    paymentAmount: 350000,
    notes: 'Bukti transfer BCA an. Zaki Raihan - Menunggu verifikasi berkas NIK',
    registeredAt: '2026-09-12'
  },
  // Compound sample
  {
    id: 'reg-010',
    categoryId: 'cat-002',
    eventId: 'evt-001',
    athleteId: 'ath-010',
    athleteName: 'Prima Wisnu Wardhana',
    gender: 'Putra',
    contingentId: 'cont-003',
    contingentName: 'Arrowhead Surabaya',
    targetNumber: '05A',
    status: 'VERIFIED',
    paymentAmount: 350000,
    registeredAt: '2026-09-05'
  },
  {
    id: 'reg-011',
    categoryId: 'cat-002',
    eventId: 'evt-001',
    athleteId: 'ath-011',
    athleteName: 'Deki Hastian Adika',
    gender: 'Putra',
    contingentId: 'cont-002',
    contingentName: 'Fast Archery Club Bandung',
    targetNumber: '05B',
    status: 'VERIFIED',
    paymentAmount: 350000,
    registeredAt: '2026-09-06'
  }
];

export const INITIAL_QUALIFICATION_ENDS: QualificationEnd[] = [
  // Ends for reg-001 (Arif Dwi Pangestu)
  {
    id: 'qend-001-1-1',
    registrationId: 'reg-001',
    sessionNumber: 1,
    endNumber: 1,
    arrows: ['X', '10', '10', '9', '9', '9'],
    endScore: 57,
    tensCount: 3,
    xCount: 1,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-001-1-2',
    registrationId: 'reg-001',
    sessionNumber: 1,
    endNumber: 2,
    arrows: ['X', 'X', '10', '9', '9', '8'],
    endScore: 56,
    tensCount: 3,
    xCount: 2,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-001-1-3',
    registrationId: 'reg-001',
    sessionNumber: 1,
    endNumber: 3,
    arrows: ['10', '10', '9', '9', '9', '9'],
    endScore: 56,
    tensCount: 2,
    xCount: 0,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-001-1-4',
    registrationId: 'reg-001',
    sessionNumber: 1,
    endNumber: 4,
    arrows: ['X', '10', '9', '9', '8', '8'],
    endScore: 54,
    tensCount: 2,
    xCount: 1,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-001-1-5',
    registrationId: 'reg-001',
    sessionNumber: 1,
    endNumber: 5,
    arrows: ['X', 'X', '10', '10', '9', '9'],
    endScore: 58,
    tensCount: 4,
    xCount: 2,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-001-1-6',
    registrationId: 'reg-001',
    sessionNumber: 1,
    endNumber: 6,
    arrows: ['X', '10', '9', '9', '9', '8'],
    endScore: 55,
    tensCount: 2,
    xCount: 1,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  // Session 2 for reg-001
  {
    id: 'qend-001-2-1',
    registrationId: 'reg-001',
    sessionNumber: 2,
    endNumber: 1,
    arrows: ['X', 'X', '10', '9', '9', '9'],
    endScore: 57,
    tensCount: 3,
    xCount: 2,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-001-2-2',
    registrationId: 'reg-001',
    sessionNumber: 2,
    endNumber: 2,
    arrows: ['10', '10', '9', '9', '8', '8'],
    endScore: 54,
    tensCount: 2,
    xCount: 0,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-001-2-3',
    registrationId: 'reg-001',
    sessionNumber: 2,
    endNumber: 3,
    arrows: ['X', '10', '10', '9', '9', '9'],
    endScore: 57,
    tensCount: 3,
    xCount: 1,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-001-2-4',
    registrationId: 'reg-001',
    sessionNumber: 2,
    endNumber: 4,
    arrows: ['X', 'X', '10', '9', '9', '9'],
    endScore: 57,
    tensCount: 3,
    xCount: 2,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-001-2-5',
    registrationId: 'reg-001',
    sessionNumber: 2,
    endNumber: 5,
    arrows: ['10', '9', '9', '9', '8', '8'],
    endScore: 53,
    tensCount: 1,
    xCount: 0,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-001-2-6',
    registrationId: 'reg-001',
    sessionNumber: 2,
    endNumber: 6,
    arrows: ['X', 'X', '10', '10', '9', '9'],
    endScore: 58,
    tensCount: 4,
    xCount: 2,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },

  // Ends for reg-002 (Riau Ega Agatha)
  {
    id: 'qend-002-1-1',
    registrationId: 'reg-002',
    sessionNumber: 1,
    endNumber: 1,
    arrows: ['X', '10', '9', '9', '9', '9'],
    endScore: 56,
    tensCount: 2,
    xCount: 1,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-002-1-2',
    registrationId: 'reg-002',
    sessionNumber: 1,
    endNumber: 2,
    arrows: ['X', 'X', '10', '9', '9', '9'],
    endScore: 57,
    tensCount: 3,
    xCount: 2,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-002-1-3',
    registrationId: 'reg-002',
    sessionNumber: 1,
    endNumber: 3,
    arrows: ['10', '10', '9', '8', '8', '8'],
    endScore: 53,
    tensCount: 2,
    xCount: 0,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-002-1-4',
    registrationId: 'reg-002',
    sessionNumber: 1,
    endNumber: 4,
    arrows: ['X', '10', '10', '9', '9', '9'],
    endScore: 57,
    tensCount: 3,
    xCount: 1,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-002-1-5',
    registrationId: 'reg-002',
    sessionNumber: 1,
    endNumber: 5,
    arrows: ['X', '10', '9', '9', '8', '8'],
    endScore: 54,
    tensCount: 2,
    xCount: 1,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-002-1-6',
    registrationId: 'reg-002',
    sessionNumber: 1,
    endNumber: 6,
    arrows: ['X', 'X', '10', '9', '9', '8'],
    endScore: 56,
    tensCount: 3,
    xCount: 2,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  // Session 2 for reg-002
  {
    id: 'qend-002-2-1',
    registrationId: 'reg-002',
    sessionNumber: 2,
    endNumber: 1,
    arrows: ['X', '10', '10', '9', '9', '9'],
    endScore: 57,
    tensCount: 3,
    xCount: 1,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-002-2-2',
    registrationId: 'reg-002',
    sessionNumber: 2,
    endNumber: 2,
    arrows: ['X', 'X', '10', '9', '9', '9'],
    endScore: 57,
    tensCount: 3,
    xCount: 2,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-002-2-3',
    registrationId: 'reg-002',
    sessionNumber: 2,
    endNumber: 3,
    arrows: ['10', '9', '9', '9', '8', '8'],
    endScore: 53,
    tensCount: 1,
    xCount: 0,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-002-2-4',
    registrationId: 'reg-002',
    sessionNumber: 2,
    endNumber: 4,
    arrows: ['X', '10', '10', '9', '9', '8'],
    endScore: 56,
    tensCount: 3,
    xCount: 1,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-002-2-5',
    registrationId: 'reg-002',
    sessionNumber: 2,
    endNumber: 5,
    arrows: ['X', '10', '9', '9', '9', '8'],
    endScore: 55,
    tensCount: 2,
    xCount: 1,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  },
  {
    id: 'qend-002-2-6',
    registrationId: 'reg-002',
    sessionNumber: 2,
    endNumber: 6,
    arrows: ['X', 'X', '10', '10', '9', '8'],
    endScore: 57,
    tensCount: 4,
    xCount: 2,
    isVerified: true,
    signedByReferee: 'Wasit Nasional A'
  }
];

export const INITIAL_ELIMINATION_MATCHES: EliminationMatch[] = [
  // 8-Man Bracket for cat-001 (Recurve Umum Putra 70m - Set System)
  // Match 1: Seed 1 (Arif) vs Seed 8 (Kurniawan)
  {
    id: 'elim-001',
    categoryId: 'cat-001',
    roundName: 'Perempat Final',
    roundOrder: 2,
    matchNumber: 1,
    eliminationType: 'SET_SYSTEM',
    athleteA: {
      registrationId: 'reg-001',
      athleteName: 'Arif Dwi Pangestu',
      contingentName: 'D\'Archers Club Jakarta',
      seed: 1
    },
    athleteB: {
      registrationId: 'reg-008',
      athleteName: 'Kurniawan Santoso',
      contingentName: 'Arrowhead Surabaya',
      seed: 8
    },
    status: 'COMPLETED',
    winnerId: 'reg-001',
    setPointsA: 6,
    setPointsB: 2,
    totalScoreA: 111,
    totalScoreB: 104,
    targetLine: 'Bantalan 01A vs 01B',
    nextMatchId: 'elim-005',
    ends: [
      {
        setNumber: 1,
        arrowsA: ['10', '9', '9'],
        arrowsB: ['9', '8', '8'],
        scoreA: 28,
        scoreB: 25,
        setPointsA: 2,
        setPointsB: 0
      },
      {
        setNumber: 2,
        arrowsA: ['9', '9', '9'],
        arrowsB: ['10', '9', '8'],
        scoreA: 27,
        scoreB: 27,
        setPointsA: 1,
        setPointsB: 1
      },
      {
        setNumber: 3,
        arrowsA: ['9', '9', '8'],
        arrowsB: ['10', '9', '9'],
        scoreA: 26,
        scoreB: 28,
        setPointsA: 0,
        setPointsB: 2
      },
      {
        setNumber: 4,
        arrowsA: ['X', '10', '10'],
        arrowsB: ['9', '8', '7'],
        scoreA: 30,
        scoreB: 24,
        setPointsA: 2,
        setPointsB: 0
      }
    ]
  },
  // Match 2: Seed 4 (Bagas Kharisma) vs Seed 5 (Hendra Purnama)
  {
    id: 'elim-002',
    categoryId: 'cat-001',
    roundName: 'Perempat Final',
    roundOrder: 2,
    matchNumber: 2,
    eliminationType: 'SET_SYSTEM',
    athleteA: {
      registrationId: 'reg-004',
      athleteName: 'Bagas Kharisma',
      contingentName: 'Patriot Archery Bekasi',
      seed: 4
    },
    athleteB: {
      registrationId: 'reg-005',
      athleteName: 'Hendra Purnama',
      contingentName: 'D\'Archers Club Jakarta',
      seed: 5
    },
    status: 'COMPLETED',
    winnerId: 'reg-005',
    setPointsA: 4,
    setPointsB: 6,
    totalScoreA: 135,
    totalScoreB: 138,
    targetLine: 'Bantalan 02A vs 02B',
    nextMatchId: 'elim-005',
    ends: [
      { setNumber: 1, arrowsA: ['9', '9', '8'], arrowsB: ['10', '9', '9'], scoreA: 26, scoreB: 28, setPointsA: 0, setPointsB: 2 },
      { setNumber: 2, arrowsA: ['10', '9', '9'], arrowsB: ['9', '9', '8'], scoreA: 28, scoreB: 26, setPointsA: 2, setPointsB: 0 },
      { setNumber: 3, arrowsA: ['10', '9', '8'], arrowsB: ['9', '9', '9'], scoreA: 27, scoreB: 27, setPointsA: 1, setPointsB: 1 },
      { setNumber: 4, arrowsA: ['9', '9', '9'], arrowsB: ['9', '9', '9'], scoreA: 27, scoreB: 27, setPointsA: 1, setPointsB: 1 },
      { setNumber: 5, arrowsA: ['9', '9', '9'], arrowsB: ['10', '10', '10'], scoreA: 27, scoreB: 30, setPointsA: 0, setPointsB: 2 }
    ]
  },
  // Match 3: Seed 3 (Alviyanto Bagas) vs Seed 6 (Okka Bagus)
  {
    id: 'elim-003',
    categoryId: 'cat-001',
    roundName: 'Perempat Final',
    roundOrder: 2,
    matchNumber: 3,
    eliminationType: 'SET_SYSTEM',
    athleteA: {
      registrationId: 'reg-003',
      athleteName: 'Alviyanto Bagas Prastyadi',
      contingentName: 'Arrowhead Surabaya',
      seed: 3
    },
    athleteB: {
      registrationId: 'reg-006',
      athleteName: 'Okka Bagus Subekti',
      contingentName: 'Sriwijaya Archery Club',
      seed: 6
    },
    status: 'COMPLETED',
    winnerId: 'reg-003',
    setPointsA: 6,
    setPointsB: 0,
    totalScoreA: 86,
    totalScoreB: 78,
    targetLine: 'Bantalan 03A vs 03B',
    nextMatchId: 'elim-006',
    ends: [
      { setNumber: 1, arrowsA: ['10', '9', '9'], arrowsB: ['9', '9', '8'], scoreA: 28, scoreB: 26, setPointsA: 2, setPointsB: 0 },
      { setNumber: 2, arrowsA: ['X', '10', '9'], arrowsB: ['9', '8', '8'], scoreA: 29, scoreB: 25, setPointsA: 2, setPointsB: 0 },
      { setNumber: 3, arrowsA: ['10', '10', '9'], arrowsB: ['9', '9', '9'], scoreA: 29, scoreB: 27, setPointsA: 2, setPointsB: 0 }
    ]
  },
  // Match 4: Seed 2 (Riau Ega) vs Seed 7 (Faris Pratama)
  {
    id: 'elim-004',
    categoryId: 'cat-001',
    roundName: 'Perempat Final',
    roundOrder: 2,
    matchNumber: 4,
    eliminationType: 'SET_SYSTEM',
    athleteA: {
      registrationId: 'reg-002',
      athleteName: 'Riau Ega Agatha',
      contingentName: 'Fast Archery Club Bandung',
      seed: 2
    },
    athleteB: {
      registrationId: 'reg-007',
      athleteName: 'Faris Pratama',
      contingentName: 'Fast Archery Club Bandung',
      seed: 7
    },
    status: 'COMPLETED',
    winnerId: 'reg-002',
    setPointsA: 7,
    setPointsB: 1,
    totalScoreA: 113,
    totalScoreB: 104,
    targetLine: 'Bantalan 04A vs 04B',
    nextMatchId: 'elim-006',
    ends: [
      { setNumber: 1, arrowsA: ['10', '9', '9'], arrowsB: ['9', '9', '8'], scoreA: 28, scoreB: 26, setPointsA: 2, setPointsB: 0 },
      { setNumber: 2, arrowsA: ['9', '9', '9'], arrowsB: ['9', '9', '9'], scoreA: 27, scoreB: 27, setPointsA: 1, setPointsB: 1 },
      { setNumber: 3, arrowsA: ['X', '10', '9'], arrowsB: ['9', '8', '8'], scoreA: 29, scoreB: 25, setPointsA: 2, setPointsB: 0 },
      { setNumber: 4, arrowsA: ['X', '10', '9'], arrowsB: ['9', '9', '8'], scoreA: 29, scoreB: 26, setPointsA: 2, setPointsB: 0 }
    ]
  },
  // Semifinal 1: Winner Match 1 (Arif) vs Winner Match 2 (Hendra Purnama)
  {
    id: 'elim-005',
    categoryId: 'cat-001',
    roundName: 'Semifinal',
    roundOrder: 3,
    matchNumber: 1,
    eliminationType: 'SET_SYSTEM',
    athleteA: {
      registrationId: 'reg-001',
      athleteName: 'Arif Dwi Pangestu',
      contingentName: 'D\'Archers Club Jakarta',
      seed: 1
    },
    athleteB: {
      registrationId: 'reg-005',
      athleteName: 'Hendra Purnama',
      contingentName: 'D\'Archers Club Jakarta',
      seed: 5
    },
    status: 'LIVE',
    setPointsA: 4,
    setPointsB: 4,
    totalScoreA: 111,
    totalScoreB: 111,
    targetLine: 'Bantalan Arena 01A vs 01B',
    nextMatchId: 'elim-008', // Gold Final
    ends: [
      { setNumber: 1, arrowsA: ['10', '9', '9'], arrowsB: ['9', '9', '9'], scoreA: 28, scoreB: 27, setPointsA: 2, setPointsB: 0 },
      { setNumber: 2, arrowsA: ['9', '9', '8'], arrowsB: ['10', '10', '9'], scoreA: 26, scoreB: 29, setPointsA: 0, setPointsB: 2 },
      { setNumber: 3, arrowsA: ['10', '10', '9'], arrowsB: ['10', '9', '9'], scoreA: 29, scoreB: 28, setPointsA: 2, setPointsB: 0 },
      { setNumber: 4, arrowsA: ['9', '9', '9'], arrowsB: ['10', '10', '9'], scoreA: 27, scoreB: 29, setPointsA: 0, setPointsB: 2 }
    ]
  },
  // Semifinal 2: Winner Match 3 (Alviyanto Bagas) vs Winner Match 4 (Riau Ega)
  {
    id: 'elim-006',
    categoryId: 'cat-001',
    roundName: 'Semifinal',
    roundOrder: 3,
    matchNumber: 2,
    eliminationType: 'SET_SYSTEM',
    athleteA: {
      registrationId: 'reg-003',
      athleteName: 'Alviyanto Bagas Prastyadi',
      contingentName: 'Arrowhead Surabaya',
      seed: 3
    },
    athleteB: {
      registrationId: 'reg-002',
      athleteName: 'Riau Ega Agatha',
      contingentName: 'Fast Archery Club Bandung',
      seed: 2
    },
    status: 'PENDING',
    setPointsA: 0,
    setPointsB: 0,
    totalScoreA: 0,
    totalScoreB: 0,
    targetLine: 'Bantalan Arena 02A vs 02B',
    nextMatchId: 'elim-008',
    ends: []
  },
  // Bronze Medal Final
  {
    id: 'elim-007',
    categoryId: 'cat-001',
    roundName: 'Perebutan Medali Perunggu',
    roundOrder: 4,
    matchNumber: 1,
    eliminationType: 'SET_SYSTEM',
    status: 'PENDING',
    setPointsA: 0,
    setPointsB: 0,
    totalScoreA: 0,
    totalScoreB: 0,
    targetLine: 'Arena Final Target B',
    isBronzeFinal: true,
    ends: []
  },
  // Gold Medal Final
  {
    id: 'elim-008',
    categoryId: 'cat-001',
    roundName: 'Final Perebutan Emas',
    roundOrder: 4,
    matchNumber: 2,
    eliminationType: 'SET_SYSTEM',
    status: 'PENDING',
    setPointsA: 0,
    setPointsB: 0,
    totalScoreA: 0,
    totalScoreB: 0,
    targetLine: 'Arena Final Target A',
    isGoldFinal: true,
    ends: []
  }
];
