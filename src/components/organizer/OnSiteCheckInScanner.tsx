import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { 
  QrCode, 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Search, 
  Printer, 
  RefreshCw, 
  UserCheck, 
  Sliders, 
  Sparkles, 
  Wifi, 
  X,
  Volume2,
  Maximize2,
  Award,
  Users
} from 'lucide-react';
import { ArcheryEvent, Registration, AccreditedPerson } from '../../types';

interface OnSiteCheckInScannerProps {
  event: ArcheryEvent | null;
  registrations: Registration[];
  onCheckInAthlete: (
    registrationId: string, 
    data: { 
      checkedInBy?: string; 
      equipmentPassed?: boolean; 
      bowPoundage?: string; 
      arrowType?: string; 
      checkInNotes?: string; 
    }
  ) => Promise<boolean>;
  onCancelCheckIn: (registrationId: string) => Promise<boolean>;
  onRefreshData?: () => void;
}

export const OnSiteCheckInScanner: React.FC<OnSiteCheckInScannerProps> = ({
  event,
  registrations,
  onCheckInAthlete,
  onCancelCheckIn,
  onRefreshData
}) => {
  // Filter registrations for current event
  const eventRegistrations = registrations.filter(r => 
    !event || r.eventId === event.id
  );
  const verifiedAthletes = eventRegistrations.filter(r => r.status === 'VERIFIED');
  const checkedInAthletes = verifiedAthletes.filter(r => r.isCheckedIn);
  const pendingCheckInAthletes = verifiedAthletes.filter(r => !r.isCheckedIn);

  // Scanner state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [searchQuery, setSearchQuery] = useState('');
  const [scannedRegistration, setScannedRegistration] = useState<Registration | null>(null);
  const [scannedAccreditation, setScannedAccreditation] = useState<AccreditedPerson | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CHECKED_IN' | 'PENDING'>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Equipment Inspection Form State for currently scanned athlete
  const [bowPoundage, setBowPoundage] = useState('38 lbs');
  const [arrowType, setArrowType] = useState('Easton X10 / Carbon');
  const [equipmentPassed, setEquipmentPassed] = useState(true);
  const [inspectorName, setInspectorName] = useState('Juri Meja Registrasi 1');
  const [inspectionNotes, setInspectionNotes] = useState('');

  // Audio tone generator for scan beep
  const playBeep = (isSuccess = true) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isSuccess) {
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // E6
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.18);
      } else {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // AudioContext not allowed without user gesture
    }
  };

  // Video & Canvas refs for QR detection
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        scanQRCode();
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      setCameraError('Akses kamera tidak diizinkan atau tidak ditemukan perangkat webcam pada browser ini. Anda dapat menggunakan input manual atau tombol simulasi di bawah.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Scan QR from video frame loop
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        handleRawScannedText(code.data);
        return; // Pause scanning while inspecting
      }
    }

    animationFrameId.current = requestAnimationFrame(scanQRCode);
  };

  // Process Scanned Data string (e.g. JSON or ID or target or accreditation)
  const handleRawScannedText = async (text: string) => {
    const cleanText = text.trim();

    // 0. Check if this is an Accreditation QR (Panitia, Wasit, VIP, Media, Official)
    let isAccreditation = false;
    let accCode = '';

    try {
      const parsed = JSON.parse(cleanText);
      if (parsed.type === 'ACCREDITATION' && (parsed.code || parsed.accId)) {
        isAccreditation = true;
        accCode = parsed.code || parsed.accId;
      }
    } catch {
      // not json
    }

    if (!isAccreditation && cleanText.toUpperCase().startsWith('ACC-')) {
      isAccreditation = true;
      accCode = cleanText;
    }

    if (isAccreditation) {
      try {
        const res = await fetch(`/api/accreditation/validate/${encodeURIComponent(accCode)}`);
        const json = await res.json();
        if (json.success && json.data) {
          playBeep(true);
          setScannedAccreditation(json.data);
          setScannedRegistration(null);
          setNotification({
            type: 'success',
            message: `Akreditasi Valid: ${json.data.fullName} (${json.data.role} - ${json.data.titleOrDivision})`
          });
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    let targetReg: Registration | undefined;

    // 1. Try to parse JSON format
    try {
      const parsed = JSON.parse(cleanText);
      if (parsed.regId) {
        targetReg = eventRegistrations.find(r => r.id === parsed.regId);
      }
    } catch {
      // not JSON
    }

    // 2. Direct ID or ARCH- prefix
    if (!targetReg) {
      const normalized = cleanText.replace(/^ARCH-/, '');
      targetReg = eventRegistrations.find(r => 
        r.id.toLowerCase() === normalized.toLowerCase() ||
        r.id.toLowerCase() === cleanText.toLowerCase()
      );
    }

    // 3. Match by Target Number e.g. "04A"
    if (!targetReg) {
      targetReg = eventRegistrations.find(r => 
        r.targetNumber && r.targetNumber.toLowerCase() === cleanText.toLowerCase()
      );
    }

    // 4. Match by Athlete Name
    if (!targetReg) {
      targetReg = eventRegistrations.find(r => 
        r.athleteName.toLowerCase().includes(cleanText.toLowerCase())
      );
    }

    if (targetReg) {
      playBeep(true);
      selectAthleteForInspection(targetReg);
      setNotification({
        type: 'success',
        message: `Berhasil mendeteksi QR Atlet: ${targetReg.athleteName} (Target ${targetReg.targetNumber || 'N/A'})`
      });
    } else {
      playBeep(false);
      setNotification({
        type: 'error',
        message: `QR Code tidak cocok dengan database peserta: "${cleanText}"`
      });
    }
  };

  // Set athlete for inspection
  const selectAthleteForInspection = (reg: Registration) => {
    setScannedAccreditation(null);
    setScannedRegistration(reg);
    setBowPoundage(reg.bowPoundage || '38 lbs');
    setArrowType(reg.arrowType || 'Easton X10 / Carbon One');
    setEquipmentPassed(reg.equipmentPassed !== undefined ? reg.equipmentPassed : true);
    setInspectionNotes(reg.checkInNotes || '');
  };

  // Submit Check-in and Equipment Inspection
  const handleConfirmCheckIn = async () => {
    if (!scannedRegistration) return;
    setIsSubmitting(true);
    try {
      const success = await onCheckInAthlete(scannedRegistration.id, {
        checkedInBy: inspectorName,
        equipmentPassed,
        bowPoundage,
        arrowType,
        checkInNotes: inspectionNotes
      });

      if (success) {
        playBeep(true);
        setNotification({
          type: 'success',
          message: `Atlet ${scannedRegistration.athleteName} SAH terdaftar ulang di lapangan & SIAP TEMBAK!`
        });
        // Update local scanned preview
        setScannedRegistration(prev => prev ? {
          ...prev,
          isCheckedIn: true,
          checkedInAt: new Date().toISOString(),
          checkedInBy: inspectorName,
          equipmentPassed,
          bowPoundage,
          arrowType,
          checkInNotes: inspectionNotes
        } : null);

        // resume camera if active
        if (isCameraActive) {
          scanQRCode();
        }
      }
    } catch {
      setNotification({
        type: 'error',
        message: 'Gagal memperbarui status registrasi ulang. Periksa koneksi server.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel check-in
  const handleCancelCheckIn = async (regId: string) => {
    setIsSubmitting(true);
    try {
      const success = await onCancelCheckIn(regId);
      if (success) {
        setNotification({
          type: 'success',
          message: 'Status check-in atlet berhasil dibatalkan.'
        });
        if (scannedRegistration && scannedRegistration.id === regId) {
          setScannedRegistration(prev => prev ? { ...prev, isCheckedIn: false } : null);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Filtered athlete list for review
  const displayedAthletes = verifiedAthletes.filter(reg => {
    const matchSearch = 
      reg.athleteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.contingentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.targetNumber && reg.targetNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      reg.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    if (filterStatus === 'CHECKED_IN') return reg.isCheckedIn;
    if (filterStatus === 'PENDING') return !reg.isCheckedIn;
    return true;
  });

  const checkInPercentage = verifiedAthletes.length > 0 
    ? Math.round((checkedInAthletes.length / verifiedAthletes.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Multi-Device Sync Indicator */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-amber-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5" />
              On-Site Check-In & Equipment Inspection
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-mono border border-emerald-500/20 flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              Multi-Device Real-time Sync
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Meja Registrasi Ulang Lapangan & Uji Alat Busur
          </h2>
          <p className="text-xs text-neutral-400 max-w-xl">
            Pindai QR code pada E-Badge atlet saat tiba di lapangan, pastikan kehadiran fisik (*Roll Call*), verifikasi spesifikasi busur (*Equipment Inspection*), dan tetapkan kesiapan tembak.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onRefreshData && (
            <button
              onClick={onRefreshData}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition flex items-center gap-1.5"
              title="Sinkronisasi data terkini antar perangkat"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              Sinkronisasi
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-400" />
            Cetak Roll Call Sheet
          </button>
        </div>
      </div>

      {/* Progress & Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400">Total Atlet Terverifikasi</span>
          <div className="text-2xl font-extrabold text-white font-mono">
            {verifiedAthletes.length}
          </div>
          <span className="text-[10px] text-neutral-500 block">Lulus verifikasi berkas</span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-emerald-500/20 space-y-1">
          <span className="text-[11px] font-semibold text-emerald-400">Hadir & Siap Tembak</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {checkedInAthletes.length}
          </div>
          <span className="text-[10px] text-neutral-500 block">Sudah scan di lapangan</span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-amber-500/20 space-y-1">
          <span className="text-[11px] font-semibold text-amber-400">Belum Roll Call</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {pendingCheckInAthletes.length}
          </div>
          <span className="text-[10px] text-neutral-500 block">Menunggu kehadiran fisik</span>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <span className="text-[11px] font-semibold text-neutral-400">Tingkat Kehadiran</span>
          <div className="text-2xl font-extrabold text-white font-mono">
            {checkInPercentage}%
          </div>
          {/* Mini progress bar */}
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div 
              className="bg-emerald-400 h-full transition-all duration-500"
              style={{ width: `${checkInPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold animate-in fade-in duration-200 ${
          notification.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-neutral-800/50 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Scanner Viewport (Left) vs Scanned Athlete Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera Scanner & Input Search */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                Pemindai Kamera QR Code Lapangan
              </h3>
              <div className="flex items-center gap-2">
                {isCameraActive ? (
                  <button
                    onClick={stopCamera}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    Matikan Kamera
                  </button>
                ) : (
                  <button
                    onClick={startCamera}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Nyalakan Kamera Scanner
                  </button>
                )}
              </div>
            </div>

            {/* Video Viewport Container */}
            <div className="relative aspect-video rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden flex items-center justify-center">
              {isCameraActive ? (
                <>
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover"
                  />
                  {/* Target Crosshair / Reticle Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative w-56 h-56 border-2 border-amber-400/80 rounded-2xl shadow-2xl flex items-center justify-center">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-amber-400 -mt-1 -ml-1" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-amber-400 -mt-1 -mr-1" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-amber-400 -mb-1 -ml-1" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-amber-400 -mb-1 -mr-1" />
                      {/* Animated Laser Line */}
                      <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 inset-x-3 flex justify-between items-center text-[10px] text-white/80 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg">
                    <span>Arahkan kode QR E-Badge atlet ke dalam kotak</span>
                    <button
                      onClick={() => {
                        const next = facingMode === 'environment' ? 'user' : 'environment';
                        setFacingMode(next);
                        stopCamera();
                        setTimeout(startCamera, 200);
                      }}
                      className="text-amber-400 hover:underline font-semibold"
                    >
                      Ganti Kamera
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-6 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 flex items-center justify-center mx-auto">
                    <QrCode className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-neutral-300">
                      Kamera Scanner Belum Aktif
                    </p>
                    <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                      Klik "Nyalakan Kamera Scanner" untuk memindai E-Badge fisik atau gunakan pencarian instan di bawah.
                    </p>
                  </div>
                  {cameraError && (
                    <div className="text-[11px] text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 max-w-sm mx-auto text-left">
                      {cameraError}
                    </div>
                  )}
                </div>
              )}
              {/* Hidden Canvas for QR Frame Decoupling */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Manual Code / Barcode Gun Input */}
            <div className="space-y-2 pt-2 border-t border-neutral-850">
              <label className="text-[11px] font-semibold text-neutral-400 flex items-center justify-between">
                <span>Input Cepat / Barcode Gun USB / Ketik ID / Nama:</span>
                <span className="text-[10px] text-neutral-500">Tekan Enter untuk cari</span>
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Contoh: reg-001, atau 04A, atau Diananda..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      handleRawScannedText(searchQuery);
                    }
                  }}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-24 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => {
                    if (searchQuery.trim()) handleRawScannedText(searchQuery);
                  }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg text-xs transition"
                >
                  Cari & Scan
                </button>
              </div>
            </div>

            {/* Simulation Demo Buttons: 1-Click Scan Any Verified Athlete */}
            <div className="space-y-2 pt-2 border-t border-neutral-850">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Simulasi Scan Cepat (Uji Langsung Tanpa Kamera):
                </span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1 bg-neutral-950/50 rounded-xl border border-neutral-800/80">
                {verifiedAthletes.slice(0, 6).map(athlete => (
                  <button
                    key={athlete.id}
                    onClick={() => {
                      playBeep(true);
                      selectAthleteForInspection(athlete);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition flex items-center gap-1.5 ${
                      athlete.isCheckedIn 
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' 
                        : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
                    }`}
                  >
                    <span>{athlete.athleteName}</span>
                    <span className="font-mono text-[10px] text-amber-400/80">({athlete.targetNumber || 'N/A'})</span>
                    {athlete.isCheckedIn && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Scanned Athlete Inspection Sheet */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Lembar Pemeriksaan Atlet & Uji Alat (Inspection Card)
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Validasi fisik kehadiran atlet dan kesesuaian alat tanding di lapangan.
                </p>
              </div>
              {scannedRegistration?.isCheckedIn && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  SUDAH CHECK-IN
                </span>
              )}
            </div>

            {scannedAccreditation ? (
              /* Accredited Personnel Verification View */
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-gradient-to-r from-neutral-950 via-neutral-950 to-indigo-950/40 border border-indigo-500/30 flex items-start gap-4">
                  {scannedAccreditation.photoUrl ? (
                    <img 
                      src={scannedAccreditation.photoUrl} 
                      alt={scannedAccreditation.fullName} 
                      className="w-16 h-20 rounded-xl object-cover border-2 border-indigo-500/50 shrink-0" 
                    />
                  ) : (
                    <div className="w-16 h-20 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center font-bold text-xl text-neutral-300 shrink-0">
                      {scannedAccreditation.fullName.slice(0, 1)}
                    </div>
                  )}

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        AKREDITASI RESMI SAH
                      </span>
                      <span className="font-mono text-xs font-bold text-neutral-400">
                        {scannedAccreditation.cardCode}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-white truncate">
                      {scannedAccreditation.fullName}
                    </h4>

                    <p className="text-xs font-bold text-indigo-400">
                      {scannedAccreditation.titleOrDivision}
                    </p>

                    <p className="text-[11px] text-neutral-400">
                      {scannedAccreditation.organization}
                    </p>
                  </div>
                </div>

                {/* Role and Zone Access Verification */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <span className="font-semibold text-neutral-400">Status Peran:</span>
                    <span className="font-bold text-amber-400 uppercase">
                      {scannedAccreditation.role}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold text-neutral-200 block uppercase tracking-wider text-[10px]">
                      Hak Akses Zonasi Field of Play (FOP):
                    </span>
                    <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
                      {[
                        { z: 1, name: 'Z1: Garis Tembak & Target' },
                        { z: 2, name: 'Z2: Tenda Atlet & Box' },
                        { z: 3, name: 'Z3: Menara Wasit DOS' },
                        { z: 4, name: 'Z4: Sekretariat & IT' },
                        { z: 5, name: 'Z5: Lounge VIP & UPP' },
                        { z: 6, name: 'Z6: Media Center' }
                      ].map(item => {
                        const allowed = scannedAccreditation.allowedZones.includes(item.z);
                        return (
                          <div 
                            key={item.z}
                            className={`p-2 rounded-lg border text-center font-bold ${
                              allowed 
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                                : 'bg-neutral-900 text-neutral-600 border-neutral-800 line-through'
                            }`}
                          >
                            <span className="block">{item.name}</span>
                            <span className="text-[9px] font-sans block mt-0.5">
                              {allowed ? 'IZIN MASUK' : 'DILARANG'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setScannedAccreditation(null)}
                    className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold rounded-xl text-xs transition"
                  >
                    Tutup & Lanjutkan Scan Lainnya
                  </button>
                </div>
              </div>
            ) : scannedRegistration ? (
              <div className="space-y-5">
                {/* Athlete Bio Card */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-neutral-950 font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
                    {scannedRegistration.athleteName.charAt(0)}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-base font-bold text-white truncate">
                        {scannedRegistration.athleteName}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs">
                        Target: {scannedRegistration.targetNumber || 'N/A'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-amber-400">
                      {scannedRegistration.contingentName}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] text-neutral-400 pt-1">
                      <span className="font-mono bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                        ID: {scannedRegistration.id}
                      </span>
                      <span className="bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                        {scannedRegistration.gender}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Equipment Inspection Checklist Form */}
                <div className="space-y-3 bg-neutral-950/60 p-4 rounded-xl border border-neutral-800 text-xs">
                  <span className="font-bold text-neutral-200 uppercase tracking-wider text-[11px] block flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    Formulir Uji Kelayakan Alat (World Archery / PERPANI Rulebook)
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">Poundage Tarikan Busur:</label>
                      <select
                        value={bowPoundage}
                        onChange={(e) => setBowPoundage(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="26 lbs">26 lbs (Pemula/U-12)</option>
                        <option value="30 lbs">30 lbs</option>
                        <option value="34 lbs">34 lbs</option>
                        <option value="38 lbs">38 lbs (Standar Recurve)</option>
                        <option value="42 lbs">42 lbs</option>
                        <option value="45 lbs">45 lbs</option>
                        <option value="55 lbs">55 lbs (Batas Compound Max 60lbs)</option>
                        <option value="60 lbs">60 lbs (Compound Max)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-neutral-400">Tipe / Seri Anak Panah:</label>
                      <input
                        type="text"
                        value={arrowType}
                        onChange={(e) => setArrowType(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        placeholder="e.g. Easton X10, Carbon Express"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-400">Petugas / Juri Pemeriksa:</label>
                    <input
                      type="text"
                      value={inspectorName}
                      onChange={(e) => setInspectorName(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Status Toggle */}
                  <div className="pt-2 flex items-center justify-between border-t border-neutral-800">
                    <span className="text-[11px] text-neutral-300 font-semibold">
                      Hasil Inspeksi Alat Busur:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEquipmentPassed(true)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          equipmentPassed 
                            ? 'bg-emerald-500 text-neutral-950 shadow-md' 
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Lulus Uji Alat
                      </button>
                      <button
                        type="button"
                        onClick={() => setEquipmentPassed(false)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          !equipmentPassed 
                            ? 'bg-red-500 text-white shadow-md' 
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        Gagal / Belum Sesuai
                      </button>
                    </div>
                  </div>
                </div>

                {/* Confirm Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={handleConfirmCheckIn}
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {scannedRegistration.isCheckedIn ? 'Perbarui Data Check-In' : 'Sahkan Check-In & Siap Tembak'}
                  </button>

                  {scannedRegistration.isCheckedIn && (
                    <button
                      onClick={() => handleCancelCheckIn(scannedRegistration.id)}
                      disabled={isSubmitting}
                      className="py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-red-400 hover:text-red-300 border border-neutral-700 font-bold text-xs transition disabled:opacity-50"
                    >
                      Batalkan Check-In
                    </button>
                  )}
                </div>

                {scannedRegistration.checkedInAt && (
                  <p className="text-[10px] text-center text-neutral-500">
                    Tercatat hadir pada: {new Date(scannedRegistration.checkedInAt).toLocaleTimeString('id-ID')} WIB oleh {scannedRegistration.checkedInBy}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-600 flex items-center justify-center mx-auto">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Belum Ada Atlet Dipindai</h4>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Gunakan kamera di sebelah kiri untuk scan QR Code ID Card atlet, atau pilih salah satu atlet dari daftar di bawah.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Full Attendance Table (Roll Call Master Sheet) */}
      <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              Daftar Presensi Lapangan & Roll Call ({displayedAthletes.length} Atlet)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Klik nama atlet untuk membuka lembar inspeksi atau ubah status kehadiran langsung.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === 'ALL' 
                  ? 'bg-neutral-800 text-white border border-neutral-700' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Semua ({verifiedAthletes.length})
            </button>
            <button
              onClick={() => setFilterStatus('CHECKED_IN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                filterStatus === 'CHECKED_IN' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'text-neutral-400 hover:text-emerald-400'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Sudah Hadir ({checkedInAthletes.length})
            </button>
            <button
              onClick={() => setFilterStatus('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                filterStatus === 'PENDING' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'text-neutral-400 hover:text-amber-400'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Belum Hadir ({pendingCheckInAthletes.length})
            </button>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-neutral-400 uppercase font-mono text-[10px] border-b border-neutral-800">
              <tr>
                <th className="py-3 px-4">Bantalan</th>
                <th className="py-3 px-4">Nama Atlet</th>
                <th className="py-3 px-4">Kontingen / Klub</th>
                <th className="py-3 px-4">Uji Alat Busur</th>
                <th className="py-3 px-4">Status Roll Call</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 bg-neutral-900">
              {displayedAthletes.map(reg => (
                <tr 
                  key={reg.id}
                  className={`hover:bg-neutral-850/50 transition cursor-pointer ${
                    scannedRegistration?.id === reg.id ? 'bg-amber-500/10 border-l-2 border-amber-500' : ''
                  }`}
                  onClick={() => selectAthleteForInspection(reg)}
                >
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">
                    {reg.targetNumber || 'N/A'}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {reg.athleteName}
                  </td>
                  <td className="py-3 px-4 text-neutral-300">
                    {reg.contingentName}
                  </td>
                  <td className="py-3 px-4">
                    {reg.equipmentPassed !== undefined ? (
                      reg.equipmentPassed ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Lulus ({reg.bowPoundage || '38 lbs'})
                        </span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Revisi Alat
                        </span>
                      )
                    ) : (
                      <span className="text-neutral-500 italic">Belum diuji</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {reg.isCheckedIn ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Hadir & Siap
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold flex items-center gap-1 w-fit">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Belum Hadir
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => selectAthleteForInspection(reg)}
                      className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium border border-neutral-700 transition"
                    >
                      Buka Form
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
