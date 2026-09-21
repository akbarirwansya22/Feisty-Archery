import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { 
  INITIAL_EVENTS, 
  INITIAL_REGISTRATIONS, 
  INITIAL_QUALIFICATION_ENDS, 
  INITIAL_ELIMINATION_MATCHES 
} from './src/data/seedData';
import { POSTGRESQL_DDL_SCHEMA, ARCHITECTURE_EXPLANATION } from './src/data/sqlSchema';
import { 
  ArcheryEvent, 
  Category, 
  Registration, 
  QualificationEnd, 
  EliminationMatch,
  ArrowScore,
  QualificationTotal,
  IdCardDesignConfig,
  AccreditedPerson,
  SponsorItem
} from './src/types/index';

// In-Memory Relational State (mirrors PostgreSQL database tables)
let events: ArcheryEvent[] = [...INITIAL_EVENTS];
let registrations: Registration[] = [...INITIAL_REGISTRATIONS];
let qualificationEnds: QualificationEnd[] = [...INITIAL_QUALIFICATION_ENDS];
let eliminationMatches: EliminationMatch[] = [...INITIAL_ELIMINATION_MATCHES];

// Default ID Card Template & Sponsors Configuration
let idCardConfig: IdCardDesignConfig = {
  eventLogoUrl: 'https://images.unsplash.com/photo-1511067007772-9da29974ce4b?w=200&auto=format&fit=crop&q=80',
  organizationLogoUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&auto=format&fit=crop&q=80',
  badgeTitle: 'KEJUARAAN PANAHAN NASIONAL PERPANI 2026',
  badgeSubtitle: 'STADION ARJUNA BANDUNG • 24-28 OKTOBER 2026',
  headerTheme: 'EMERALD',
  sponsors: [
    {
      id: 'sp-1',
      name: 'Bank Mandiri',
      logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80',
      tier: 'MAIN'
    },
    {
      id: 'sp-2',
      name: 'Easton Archery',
      logoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format&fit=crop&q=80',
      tier: 'GOLD'
    },
    {
      id: 'sp-3',
      name: 'Hoyt Archery',
      logoUrl: '',
      tier: 'OFFICIAL'
    },
    {
      id: 'sp-4',
      name: 'Win & Win',
      logoUrl: '',
      tier: 'OFFICIAL'
    }
  ],
  footerNote: 'Kartu wajib dikalungkan selama berada di area Field of Play (FOP). Dilarang dipindahtangankan.',
  showZoneMatrix: true,
  showLanyardSlot: true
};

// Official Accredited Personnel (Panitia, Wasit, VIP, Media, Official)
let accreditedPersonnel: AccreditedPerson[] = [
  {
    id: 'acc-1',
    eventId: 'evt-kejurnas-2026',
    fullName: 'Ir. Bambang Trihatmojo, M.Si',
    role: 'PANITIA',
    titleOrDivision: 'Ketua Panitia Pelaksana (OC Chair)',
    organization: 'Pengprov PERPANI Jawa Barat',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    phone: '081234567890',
    allowedZones: [1, 2, 3, 4, 5, 6],
    cardCode: 'ACC-OC-001',
    createdAt: new Date().toISOString()
  },
  {
    id: 'acc-2',
    eventId: 'evt-kejurnas-2026',
    fullName: 'Drs. H. Hendra Wijaya, IJ',
    role: 'WASIT',
    titleOrDivision: 'Ketua Dewan Wasit (Chairman of Judges)',
    organization: 'World Archery / PB PERPANI Judge Commission',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    phone: '081198765432',
    allowedZones: [1, 2, 3, 4],
    cardCode: 'ACC-JDG-001',
    createdAt: new Date().toISOString()
  },
  {
    id: 'acc-3',
    eventId: 'evt-kejurnas-2026',
    fullName: 'Dr. Hj. Ratna Sari, Sp.KO',
    role: 'PANITIA',
    titleOrDivision: 'Koordinator Medis & Doping Control',
    organization: 'Dinas Kesehatan & Tim Medis PERPANI',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
    phone: '081322334455',
    allowedZones: [1, 2, 4],
    cardCode: 'ACC-MED-001',
    createdAt: new Date().toISOString()
  },
  {
    id: 'acc-4',
    eventId: 'evt-kejurnas-2026',
    fullName: 'Mayor Jenderal (Purn) Suryo Broto',
    role: 'VIP',
    titleOrDivision: 'Ketua Umum KONI Pusat (Tamu Kehormatan)',
    organization: 'Komite Olahraga Nasional Indonesia',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    phone: '081100011122',
    allowedZones: [1, 4, 5],
    cardCode: 'ACC-VIP-001',
    createdAt: new Date().toISOString()
  },
  {
    id: 'acc-5',
    eventId: 'evt-kejurnas-2026',
    fullName: 'Rizky Ramadhan',
    role: 'MEDIA',
    titleOrDivision: 'Lead Photographer & Broadcast Crew',
    organization: 'Antara Foto / Archery TV Indonesia',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    phone: '085712345678',
    allowedZones: [2, 6],
    cardCode: 'ACC-MED-005',
    createdAt: new Date().toISOString()
  },
  {
    id: 'acc-6',
    eventId: 'evt-kejurnas-2026',
    fullName: 'Coach Denny Agus Prabowo',
    role: 'OFFICIAL',
    titleOrDivision: 'Pelatih Kepala Divisi Recurve',
    organization: 'Fast Archery Club Bandung',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    phone: '081298877665',
    allowedZones: [2, 4],
    cardCode: 'ACC-OFF-012',
    createdAt: new Date().toISOString()
  }
];

// Helper to calculate arrow value
export function getArrowNumericValue(score: ArrowScore): number {
  if (score === 'X' || score === '10') return 10;
  if (score === 'M') return 0;
  const parsed = parseInt(score, 10);
  return isNaN(parsed) ? 0 : parsed;
}

// Calculate qualification standings for a category
export function calculateCategoryStandings(categoryId: string): QualificationTotal[] {
  const categoryRegs = registrations.filter(r => r.categoryId === categoryId && r.status === 'VERIFIED');
  
  const standings: QualificationTotal[] = categoryRegs.map(reg => {
    const ends = qualificationEnds.filter(e => e.registrationId === reg.id);
    let s1 = 0;
    let s2 = 0;
    let tens = 0;
    let xs = 0;
    let totalArrows = 0;

    for (const end of ends) {
      for (const arrow of end.arrows) {
        const val = getArrowNumericValue(arrow);
        if (end.sessionNumber === 1) s1 += val;
        else s2 += val;

        if (arrow === '10' || arrow === 'X') tens++;
        if (arrow === 'X') xs++;
        totalArrows++;
      }
    }

    const total = s1 + s2;
    const avg = totalArrows > 0 ? Number((total / totalArrows).toFixed(2)) : 0;

    return {
      registrationId: reg.id,
      athleteName: reg.athleteName,
      contingentName: reg.contingentName,
      targetNumber: reg.targetNumber || 'N/A',
      session1Score: s1,
      session2Score: s2,
      totalScore: total,
      tensCount: tens,
      xCount: xs,
      averageArrow: avg,
      rank: 0
    };
  });

  // Sort by Total Score (desc), then Tens count (desc), then Xs count (desc)
  standings.sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.tensCount !== a.tensCount) return b.tensCount - a.tensCount;
    return b.xCount - a.xCount;
  });

  // Assign ranks
  standings.forEach((s, idx) => {
    s.rank = idx + 1;
  });

  return standings;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // =========================================================================
  // BACKEND REST APIS FOR ARCHERYHUB
  // =========================================================================

  // 1. Get all events with optional filters
  app.get('/api/events', (req, res) => {
    const { search, province, division } = req.query;
    let result = [...events];

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(q) || 
        e.city.toLowerCase().includes(q) || 
        e.organizerName.toLowerCase().includes(q)
      );
    }

    if (province && typeof province === 'string' && province !== 'ALL') {
      result = result.filter(e => e.province === province);
    }

    if (division && typeof division === 'string' && division !== 'ALL') {
      result = result.filter(e => e.categories.some(c => c.division === division));
    }

    res.json({ success: true, data: result });
  });

  // 2. Get single event detail
  app.get('/api/events/:id', (req, res) => {
    const event = events.find(e => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event tidak ditemukan' });
    }
    res.json({ success: true, data: event });
  });

  // 3. Dynamic Event Builder: Create new event with custom categories
  app.post('/api/events', (req, res) => {
    const body = req.body;
    if (!body.name || !body.venueName || !body.startDate) {
      return res.status(400).json({ success: false, message: 'Harap lengkapi informasi utama event' });
    }

    const newId = `evt-${Date.now().toString(36)}`;
    const newEvent: ArcheryEvent = {
      id: newId,
      organizerId: body.organizerId || 'org-user',
      organizerName: body.organizerName || 'Indonesian Archery Organizer',
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: body.description || '',
      venueName: body.venueName,
      venueAddress: body.venueAddress || '',
      city: body.city || 'Jakarta',
      province: body.province || 'DKI Jakarta',
      startDate: body.startDate,
      endDate: body.endDate || body.startDate,
      registrationDeadline: body.registrationDeadline || body.startDate,
      bannerUrl: body.bannerUrl || 'https://images.unsplash.com/photo-1511295742362-92c96b124e52?auto=format&fit=crop&w=1200&q=80',
      status: body.status || 'REGISTRATION_OPEN',
      createdAt: new Date().toISOString(),
      categories: (body.categories || []).map((cat: Partial<Category>, idx: number) => ({
        id: `cat-${newId}-${idx + 1}`,
        eventId: newId,
        name: cat.name || `${cat.division} ${cat.ageCategory} ${cat.gender} ${cat.distanceMeters}m`,
        division: cat.division || 'Recurve',
        ageCategory: cat.ageCategory || 'Umum',
        gender: cat.gender || 'Putra',
        distanceMeters: Number(cat.distanceMeters) || 70,
        targetFaceCm: Number(cat.targetFaceCm) || 122,
        formatQualification: cat.formatQualification || '2 Sesi x 6 Seri (72 Panah)',
        arrowsPerEnd: Number(cat.arrowsPerEnd) || 6,
        endsPerSession: Number(cat.endsPerSession) || 6,
        sessionsCount: Number(cat.sessionsCount) || 2,
        eliminationType: cat.eliminationType || (cat.division === 'Compound' ? 'CUMULATIVE_SCORE' : 'SET_SYSTEM'),
        eliminationQuota: Number(cat.eliminationQuota) || 8,
        fee: Number(cat.fee) || 350000,
        quota: Number(cat.quota) || 32,
        registeredCount: 0
      }))
    };

    events.unshift(newEvent);
    res.status(201).json({ success: true, data: newEvent });
  });

  // 4. Add custom category to existing event
  app.post('/api/events/:id/categories', (req, res) => {
    const event = events.find(e => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event tidak ditemukan' });
    }

    const cat = req.body;
    const newCategory: Category = {
      id: `cat-${event.id}-${Date.now().toString(36)}`,
      eventId: event.id,
      name: cat.name || `${cat.division} ${cat.ageCategory} ${cat.gender} ${cat.distanceMeters}m`,
      division: cat.division || 'Recurve',
      ageCategory: cat.ageCategory || 'Umum',
      gender: cat.gender || 'Putra',
      distanceMeters: Number(cat.distanceMeters) || 50,
      targetFaceCm: Number(cat.targetFaceCm) || 80,
      formatQualification: cat.formatQualification || '2 Sesi x 6 Seri (72 Panah)',
      arrowsPerEnd: Number(cat.arrowsPerEnd) || 6,
      endsPerSession: Number(cat.endsPerSession) || 6,
      sessionsCount: Number(cat.sessionsCount) || 2,
      eliminationType: cat.eliminationType || (cat.division === 'Compound' ? 'CUMULATIVE_SCORE' : 'SET_SYSTEM'),
      eliminationQuota: Number(cat.eliminationQuota) || 8,
      fee: Number(cat.fee) || 350000,
      quota: Number(cat.quota) || 32,
      registeredCount: 0
    };

    event.categories.push(newCategory);
    res.status(201).json({ success: true, data: newCategory });
  });

  // 5. Registrations endpoint
  app.get('/api/registrations', (req, res) => {
    const { eventId, categoryId } = req.query;
    let result = [...registrations];
    if (eventId) result = result.filter(r => r.eventId === eventId);
    if (categoryId) result = result.filter(r => r.categoryId === categoryId);
    res.json({ success: true, data: result });
  });

  // Register single or collective contingent
  app.post('/api/registrations', (req, res) => {
    const { categoryId, eventId, athletesList, contingentName, paymentProofUrl, notes } = req.body;
    if (!categoryId || !athletesList || !athletesList.length) {
      return res.status(400).json({ success: false, message: 'Data pendaftaran tidak lengkap' });
    }

    const createdRegs: Registration[] = [];
    const event = events.find(e => e.id === eventId);
    const category = event?.categories.find(c => c.id === categoryId);
    const fee = category?.fee || 350000;

    for (const item of athletesList) {
      const reg: Registration = {
        id: `reg-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
        categoryId,
        eventId,
        athleteId: `ath-${Date.now().toString(36)}`,
        athleteName: item.athleteName,
        gender: item.gender || 'Putra',
        contingentId: `cont-${Date.now().toString(36)}`,
        contingentName: contingentName || 'Independen / Klub Panahan',
        targetNumber: undefined,
        status: 'PENDING_PAYMENT',
        paymentProofUrl: paymentProofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
        paymentAmount: fee,
        notes: notes || 'Pendaftaran mandiri / kontingen online',
        registeredAt: new Date().toISOString()
      };
      registrations.push(reg);
      createdRegs.push(reg);

      if (category) {
        category.registeredCount = (category.registeredCount || 0) + 1;
      }
    }

    res.status(201).json({ success: true, count: createdRegs.length, data: createdRegs });
  });

  // Verify registration / Assign target number
  app.patch('/api/registrations/:id/verify', (req, res) => {
    const { status, targetNumber, notes } = req.body;
    const reg = registrations.find(r => r.id === req.params.id);
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registrasi tidak ditemukan' });
    }

    if (status) reg.status = status;
    if (targetNumber) reg.targetNumber = targetNumber;
    if (notes) reg.notes = notes;

    res.json({ success: true, data: reg });
  });

  // On-Site Roll Call & Equipment Inspection Check-In
  app.post('/api/registrations/:id/check-in', (req, res) => {
    const { checkedInBy, equipmentPassed, bowPoundage, arrowType, checkInNotes } = req.body;
    const reg = registrations.find(r => r.id === req.params.id);
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Data atlet tidak ditemukan' });
    }

    reg.isCheckedIn = true;
    reg.checkedInAt = new Date().toISOString();
    reg.checkedInBy = checkedInBy || 'Petugas Meja Registrasi Lapangan';
    reg.equipmentPassed = equipmentPassed !== undefined ? equipmentPassed : true;
    if (bowPoundage) reg.bowPoundage = bowPoundage;
    if (arrowType) reg.arrowType = arrowType;
    if (checkInNotes) reg.checkInNotes = checkInNotes;

    res.json({ 
      success: true, 
      message: `Atlet ${reg.athleteName} berhasil check-in di lapangan dan dinyatakan siap tembak!`,
      data: reg 
    });
  });

  // Cancel check-in (revert status if scanned by mistake)
  app.post('/api/registrations/:id/cancel-check-in', (req, res) => {
    const reg = registrations.find(r => r.id === req.params.id);
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Data atlet tidak ditemukan' });
    }

    reg.isCheckedIn = false;
    reg.checkedInAt = undefined;
    reg.checkedInBy = undefined;
    reg.equipmentPassed = undefined;

    res.json({ 
      success: true, 
      message: `Status check-in untuk ${reg.athleteName} telah dibatalkan`,
      data: reg 
    });
  });

  // 6. Qualification Scoring: Standings & Leaderboard
  app.get('/api/qualification/:categoryId/standings', (req, res) => {
    const standings = calculateCategoryStandings(req.params.categoryId);
    const ends = qualificationEnds.filter(e => {
      const reg = registrations.find(r => r.id === e.registrationId);
      return reg?.categoryId === req.params.categoryId;
    });

    res.json({ 
      success: true, 
      data: {
        standings,
        ends
      } 
    });
  });

  // Record or update a qualification end
  app.post('/api/qualification/ends', (req, res) => {
    const { registrationId, sessionNumber, endNumber, arrows, signedByReferee } = req.body;
    if (!registrationId || !arrows || !Array.isArray(arrows)) {
      return res.status(400).json({ success: false, message: 'Format data seri panah tidak valid' });
    }

    let endScore = 0;
    let tensCount = 0;
    let xCount = 0;

    for (const a of arrows as ArrowScore[]) {
      const val = getArrowNumericValue(a);
      endScore += val;
      if (a === '10' || a === 'X') tensCount++;
      if (a === 'X') xCount++;
    }

    // Check if end already exists
    const existingIndex = qualificationEnds.findIndex(
      e => e.registrationId === registrationId && 
           e.sessionNumber === sessionNumber && 
           e.endNumber === endNumber
    );

    const endRecord: QualificationEnd = {
      id: existingIndex >= 0 ? qualificationEnds[existingIndex].id : `qend-${Date.now().toString(36)}`,
      registrationId,
      sessionNumber,
      endNumber,
      arrows,
      endScore,
      tensCount,
      xCount,
      isVerified: true,
      signedByReferee: signedByReferee || 'Wasit Juri Pertandingan'
    };

    if (existingIndex >= 0) {
      qualificationEnds[existingIndex] = endRecord;
    } else {
      qualificationEnds.push(endRecord);
    }

    const reg = registrations.find(r => r.id === registrationId);
    const updatedStandings = reg ? calculateCategoryStandings(reg.categoryId) : [];

    res.json({ 
      success: true, 
      data: endRecord, 
      standings: updatedStandings 
    });
  });

  // 7. Elimination Engine: Get matches & brackets
  app.get('/api/elimination/:categoryId', (req, res) => {
    const matches = eliminationMatches.filter(m => m.categoryId === req.params.categoryId);
    res.json({ success: true, data: matches });
  });

  // Auto-generate bracket based on qualification rank (Seed 1 vs lowest seed)
  app.post('/api/elimination/:categoryId/generate', (req, res) => {
    const { categoryId } = req.params;
    const standings = calculateCategoryStandings(categoryId);
    const event = events.find(e => e.categories.some(c => c.id === categoryId));
    const category = event?.categories.find(c => c.id === categoryId);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    const quota = category.eliminationQuota || 8; // default 8
    const topArchers = standings.slice(0, quota);

    if (topArchers.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Minimal 2 atlet yang terverifikasi dan memiliki skor kualifikasi untuk membuat bagan eliminasi' 
      });
    }

    // Remove existing matches for this category
    eliminationMatches = eliminationMatches.filter(m => m.categoryId !== categoryId);

    const matchType = category.eliminationType;
    const newMatches: EliminationMatch[] = [];

    if (quota === 8) {
      // 8-Man Bracket Standard Seeds:
      // Match 1: 1 vs 8
      // Match 2: 4 vs 5
      // Match 3: 3 vs 6
      // Match 4: 2 vs 7
      const seedPairings = [
        { a: 1, b: 8, lane: 'Bantalan 01A vs 01B', next: 'elim-sf-1' },
        { a: 4, b: 5, lane: 'Bantalan 02A vs 02B', next: 'elim-sf-1' },
        { a: 3, b: 6, lane: 'Bantalan 03A vs 03B', next: 'elim-sf-2' },
        { a: 2, b: 7, lane: 'Bantalan 04A vs 04B', next: 'elim-sf-2' }
      ];

      seedPairings.forEach((pair, idx) => {
        const archerA = topArchers.find(a => a.rank === pair.a);
        const archerB = topArchers.find(a => a.rank === pair.b);

        newMatches.push({
          id: `elim-qf-${idx + 1}-${Date.now().toString(36)}`,
          categoryId,
          roundName: 'Perempat Final',
          roundOrder: 2,
          matchNumber: idx + 1,
          eliminationType: matchType,
          athleteA: archerA ? {
            registrationId: archerA.registrationId,
            athleteName: archerA.athleteName,
            contingentName: archerA.contingentName,
            seed: pair.a
          } : undefined,
          athleteB: archerB ? {
            registrationId: archerB.registrationId,
            athleteName: archerB.athleteName,
            contingentName: archerB.contingentName,
            seed: pair.b
          } : undefined,
          status: (archerA && !archerB) ? 'BYE' : 'PENDING',
          winnerId: (archerA && !archerB) ? archerA.registrationId : undefined,
          setPointsA: 0,
          setPointsB: 0,
          totalScoreA: 0,
          totalScoreB: 0,
          targetLine: pair.lane,
          nextMatchId: pair.next,
          ends: []
        });
      });

      // Semifinals placeholders
      newMatches.push({
        id: 'elim-sf-1',
        categoryId,
        roundName: 'Semifinal',
        roundOrder: 3,
        matchNumber: 1,
        eliminationType: matchType,
        status: 'PENDING',
        setPointsA: 0,
        setPointsB: 0,
        totalScoreA: 0,
        totalScoreB: 0,
        targetLine: 'Bantalan Arena 01A vs 01B',
        nextMatchId: 'elim-final-gold',
        ends: []
      });

      newMatches.push({
        id: 'elim-sf-2',
        categoryId,
        roundName: 'Semifinal',
        roundOrder: 3,
        matchNumber: 2,
        eliminationType: matchType,
        status: 'PENDING',
        setPointsA: 0,
        setPointsB: 0,
        totalScoreA: 0,
        totalScoreB: 0,
        targetLine: 'Bantalan Arena 02A vs 02B',
        nextMatchId: 'elim-final-gold',
        ends: []
      });

      // Bronze Final
      newMatches.push({
        id: 'elim-final-bronze',
        categoryId,
        roundName: 'Perebutan Medali Perunggu',
        roundOrder: 4,
        matchNumber: 1,
        eliminationType: matchType,
        status: 'PENDING',
        setPointsA: 0,
        setPointsB: 0,
        totalScoreA: 0,
        totalScoreB: 0,
        targetLine: 'Arena Final Target B',
        isBronzeFinal: true,
        ends: []
      });

      // Gold Final
      newMatches.push({
        id: 'elim-final-gold',
        categoryId,
        roundName: 'Final Perebutan Emas',
        roundOrder: 4,
        matchNumber: 2,
        eliminationType: matchType,
        status: 'PENDING',
        setPointsA: 0,
        setPointsB: 0,
        totalScoreA: 0,
        totalScoreB: 0,
        targetLine: 'Arena Final Target A',
        isGoldFinal: true,
        ends: []
      });
    }

    eliminationMatches.push(...newMatches);
    res.json({ success: true, count: newMatches.length, data: newMatches });
  });

  // Record an elimination set/end
  app.post('/api/elimination/match/:matchId/end', (req, res) => {
    const { matchId } = req.params;
    const { arrowsA, arrowsB, setNumber } = req.body;

    const match = eliminationMatches.find(m => m.id === matchId);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Pertandingan eliminasi tidak ditemukan' });
    }

    let scoreA = 0;
    for (const a of (arrowsA as ArrowScore[])) scoreA += getArrowNumericValue(a);

    let scoreB = 0;
    for (const b of (arrowsB as ArrowScore[])) scoreB += getArrowNumericValue(b);

    let setPointsA = 0;
    let setPointsB = 0;

    if (match.eliminationType === 'SET_SYSTEM') {
      if (scoreA > scoreB) {
        setPointsA = 2;
        setPointsB = 0;
      } else if (scoreB > scoreA) {
        setPointsA = 0;
        setPointsB = 2;
      } else {
        setPointsA = 1;
        setPointsB = 1;
      }
    }

    // Upsert or push end
    const existingEndIndex = match.ends.findIndex(e => e.setNumber === setNumber);
    const endData = {
      setNumber,
      arrowsA,
      arrowsB,
      scoreA,
      scoreB,
      setPointsA,
      setPointsB
    };

    if (existingEndIndex >= 0) {
      match.ends[existingEndIndex] = endData;
    } else {
      match.ends.push(endData);
    }

    // Recalculate match totals
    let currentSetA = 0;
    let currentSetB = 0;
    let totalScoreA = 0;
    let totalScoreB = 0;

    match.ends.forEach(end => {
      currentSetA += end.setPointsA || 0;
      currentSetB += end.setPointsB || 0;
      totalScoreA += end.scoreA;
      totalScoreB += end.scoreB;
    });

    match.setPointsA = currentSetA;
    match.setPointsB = currentSetB;
    match.totalScoreA = totalScoreA;
    match.totalScoreB = totalScoreB;

    // Check winner
    if (match.eliminationType === 'SET_SYSTEM') {
      if (currentSetA >= 6) {
        match.winnerId = match.athleteA?.registrationId;
        match.status = 'COMPLETED';
      } else if (currentSetB >= 6) {
        match.winnerId = match.athleteB?.registrationId;
        match.status = 'COMPLETED';
      } else {
        match.status = 'LIVE';
      }
    } else {
      // Compound Cumulative Score (5 ends)
      if (match.ends.length >= 5) {
        if (totalScoreA > totalScoreB) {
          match.winnerId = match.athleteA?.registrationId;
          match.status = 'COMPLETED';
        } else if (totalScoreB > totalScoreA) {
          match.winnerId = match.athleteB?.registrationId;
          match.status = 'COMPLETED';
        } else {
          // Tie -> Shoot-off required
          match.status = 'LIVE';
        }
      } else {
        match.status = 'LIVE';
      }
    }

    res.json({ success: true, data: match });
  });

  // Shoot-off resolution
  app.post('/api/elimination/match/:matchId/shoot-off', (req, res) => {
    const { matchId } = req.params;
    const { shootOffA, shootOffB, distA_mm, distB_mm } = req.body;

    const match = eliminationMatches.find(m => m.id === matchId);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Pertandingan eliminasi tidak ditemukan' });
    }

    match.shootOffA = shootOffA;
    match.shootOffB = shootOffB;
    match.shootOffDistanceA_mm = distA_mm;
    match.shootOffDistanceB_mm = distB_mm;

    const valA = getArrowNumericValue(shootOffA);
    const valB = getArrowNumericValue(shootOffB);

    if (shootOffA === 'X' && shootOffB !== 'X') {
      match.winnerId = match.athleteA?.registrationId;
    } else if (shootOffB === 'X' && shootOffA !== 'X') {
      match.winnerId = match.athleteB?.registrationId;
    } else if (valA > valB) {
      match.winnerId = match.athleteA?.registrationId;
    } else if (valB > valA) {
      match.winnerId = match.athleteB?.registrationId;
    } else {
      // Same value, compare closest to center in mm
      if (distA_mm != null && distB_mm != null) {
        match.winnerId = distA_mm < distB_mm 
          ? match.athleteA?.registrationId 
          : match.athleteB?.registrationId;
      }
    }

    match.status = 'COMPLETED';
    res.json({ success: true, data: match });
  });

  // 8. SQL Architecture & DDL Endpoint
  app.get('/api/schema', (req, res) => {
    res.json({
      success: true,
      ddl: POSTGRESQL_DDL_SCHEMA,
      architecture: ARCHITECTURE_EXPLANATION
    });
  });

  // 9. ID Card Design & Sponsors Configuration Endpoints
  app.get('/api/idcard-config', (req, res) => {
    res.json({ success: true, data: idCardConfig });
  });

  app.put('/api/idcard-config', (req, res) => {
    idCardConfig = {
      ...idCardConfig,
      ...req.body
    };
    res.json({ success: true, data: idCardConfig });
  });

  // 10. Accreditation Management (Panitia, Wasit, VIP, Media, Official)
  app.get('/api/accreditation', (req, res) => {
    const { eventId, role } = req.query;
    let list = [...accreditedPersonnel];
    if (eventId) {
      list = list.filter(p => p.eventId === eventId);
    }
    if (role) {
      list = list.filter(p => p.role === role);
    }
    res.json({ success: true, count: list.length, data: list });
  });

  app.post('/api/accreditation', (req, res) => {
    const { fullName, role, titleOrDivision, organization, photoUrl, phone, allowedZones, eventId } = req.body;
    if (!fullName || !role) {
      return res.status(400).json({ success: false, message: 'Nama lengkap dan peran akreditasi wajib diisi' });
    }

    const count = accreditedPersonnel.filter(p => p.role === role).length + 1;
    const prefix = role.slice(0, 3).toUpperCase();
    const cardCode = `ACC-${prefix}-${count.toString().padStart(3, '0')}`;

    const newPerson: AccreditedPerson = {
      id: `acc-${Date.now()}`,
      eventId: eventId || (events[0]?.id || 'evt-default'),
      fullName,
      role,
      titleOrDivision: titleOrDivision || role,
      organization: organization || 'Official Delegation',
      photoUrl: photoUrl || '',
      phone: phone || '',
      allowedZones: Array.isArray(allowedZones) && allowedZones.length > 0 ? allowedZones : [1, 2, 4],
      cardCode,
      createdAt: new Date().toISOString()
    };

    accreditedPersonnel.unshift(newPerson);
    res.status(201).json({ success: true, data: newPerson });
  });

  app.delete('/api/accreditation/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = accreditedPersonnel.length;
    accreditedPersonnel = accreditedPersonnel.filter(p => p.id !== id);
    if (accreditedPersonnel.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Data akreditasi tidak ditemukan' });
    }
    res.json({ success: true, message: 'Data akreditasi berhasil dihapus' });
  });

  // Validate Accreditation by QR Code
  app.get('/api/accreditation/validate/:code', (req, res) => {
    const { code } = req.params;
    const person = accreditedPersonnel.find(
      p => p.cardCode.toLowerCase() === code.toLowerCase() || p.id.toLowerCase() === code.toLowerCase()
    );
    if (!person) {
      return res.status(404).json({ success: false, message: 'Akreditasi tidak valid atau tidak terdaftar' });
    }
    res.json({ success: true, data: person });
  });

  // =========================================================================
  // VITE MIDDLEWARE / PRODUCTION STATIC FALLBACK
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ArcheryHub backend and client running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
