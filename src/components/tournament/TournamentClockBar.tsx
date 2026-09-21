import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Wind, 
  Clock, 
  Radio, 
  AlertTriangle,
  Flame,
  Maximize2
} from 'lucide-react';
import { archeryAudio } from '../../utils/audioSignal';

interface TournamentClockBarProps {
  onToggleBroadcastView?: () => void;
  isBroadcastActive?: boolean;
}

export const TournamentClockBar: React.FC<TournamentClockBarProps> = ({
  onToggleBroadcastView,
  isBroadcastActive = false
}) => {
  // Timer state (in seconds)
  // Default 20 seconds (individual alternate) or 120s (end)
  const [timerMode, setTimerMode] = useState<20 | 120 | 240>(20);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Simulated live arena wind
  const [windSpeed, setWindSpeed] = useState<number>(1.6);
  const [windDegree, setWindDegree] = useState<number>(35);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            if (soundEnabled) archeryAudio.playRetrieveArrows();
            return 0;
          }
          // Warning at 10 seconds
          if (prev === 11 && soundEnabled) {
            archeryAudio.playTone(600, 0.2, 'square', 0.2);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, soundEnabled]);

  // Periodic wind fluctuation
  useEffect(() => {
    const windInt = setInterval(() => {
      setWindSpeed(prev => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(1));
      setWindDegree(prev => (prev + Math.floor(Math.random() * 10 - 5) + 360) % 360);
    }, 4000);
    return () => clearInterval(windInt);
  }, []);

  const handleStartTimer = () => {
    if (!isRunning) {
      if (soundEnabled && timeLeft === timerMode) {
        archeryAudio.playStartShooting();
      }
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  const handleResetTimer = (seconds: 20 | 120 | 240) => {
    setIsRunning(false);
    setTimerMode(seconds);
    setTimeLeft(seconds);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Phase logic
  const isWarning = timeLeft <= 10 && timeLeft > 0;
  const isStopped = timeLeft === 0;

  return (
    <div className="bg-neutral-950 border-b border-neutral-800 text-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: Tournament Phase & Signals */}
          <div className="flex items-center space-x-3">
            {/* World Archery Stadium Status Light */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800">
              <div 
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  isStopped
                    ? 'bg-red-500 shadow-lg shadow-red-500/80 animate-pulse'
                    : 'bg-red-950 opacity-40'
                }`}
                title="Red Light: Stop / Cease Fire"
              />
              <div 
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  isWarning && isRunning
                    ? 'bg-amber-400 shadow-lg shadow-amber-400/80 animate-ping'
                    : 'bg-amber-950 opacity-40'
                }`}
                title="Yellow Light: 10s Warning"
              />
              <div 
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  !isWarning && !isStopped && isRunning
                    ? 'bg-emerald-400 shadow-lg shadow-emerald-400/80'
                    : 'bg-emerald-950 opacity-40'
                }`}
                title="Green Light: Shoot Allowed"
              />
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider ml-1.5 text-neutral-300">
                {isStopped ? 'STOP' : isWarning ? '10s WARNING' : isRunning ? 'SHOOT' : 'READY'}
              </span>
            </div>

            {/* DOS Whistle Signal Triggers */}
            <div className="hidden sm:flex items-center space-x-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
              <span className="text-[10px] text-neutral-400 px-1 font-bold">Peluit DOS:</span>
              <button
                type="button"
                onClick={() => {
                  if (soundEnabled) archeryAudio.playArchersToLine();
                }}
                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-semibold transition"
                title="2 Tiupan: Pemanah maju ke shooting line"
              >
                2x Garis
              </button>
              <button
                type="button"
                onClick={() => {
                  if (soundEnabled) archeryAudio.playStartShooting();
                  if (!isRunning) setIsRunning(true);
                }}
                className="px-2 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 text-[10px] font-semibold transition"
                title="1 Tiupan: Mulai menembak"
              >
                1x Tembak
              </button>
              <button
                type="button"
                onClick={() => {
                  if (soundEnabled) archeryAudio.playRetrieveArrows();
                  setIsRunning(false);
                }}
                className="px-2 py-1 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-700/50 text-[10px] font-semibold transition"
                title="3 Tiupan: Selesai tembak, ambil panah & skoring"
              >
                3x Skoring
              </button>
              <button
                type="button"
                onClick={() => {
                  if (soundEnabled) archeryAudio.playEmergencyStop();
                  setIsRunning(false);
                }}
                className="px-2 py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 border border-red-700/50 text-[10px] font-bold transition"
                title="Tiupan bertubi-tubi: Berhenti darurat!"
              >
                Darurat
              </button>
            </div>
          </div>

          {/* Center: Digital Stadium Clock & Controls */}
          <div className="flex items-center space-x-3">
            {/* Clock Numbers */}
            <div className="flex items-center space-x-2 bg-neutral-900/90 px-3.5 py-1 rounded-xl border border-neutral-800">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className={`font-mono text-xl sm:text-2xl font-black tracking-widest ${
                isStopped ? 'text-red-400 animate-pulse' :
                isWarning ? 'text-amber-400' :
                'text-emerald-400'
              }`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={handleStartTimer}
              className={`p-2 rounded-xl transition ${
                isRunning 
                  ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400' 
                  : 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'
              }`}
              title={isRunning ? 'Jeda Timer' : 'Mulai Timer'}
            >
              {isRunning ? <Pause className="w-4 h-4 font-bold" /> : <Play className="w-4 h-4 font-bold" />}
            </button>

            {/* Timer Presets */}
            <div className="flex space-x-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-[11px] font-mono font-bold">
              <button
                type="button"
                onClick={() => handleResetTimer(20)}
                className={`px-2 py-1 rounded transition ${
                  timerMode === 20 ? 'bg-neutral-800 text-amber-400' : 'text-neutral-400 hover:text-white'
                }`}
                title="20 detik (Aduan bergantian / Shoot-off)"
              >
                20s
              </button>
              <button
                type="button"
                onClick={() => handleResetTimer(120)}
                className={`px-2 py-1 rounded transition ${
                  timerMode === 120 ? 'bg-neutral-800 text-amber-400' : 'text-neutral-400 hover:text-white'
                }`}
                title="120 detik (3 anak panah per seri)"
              >
                120s
              </button>
              <button
                type="button"
                onClick={() => handleResetTimer(240)}
                className={`px-2 py-1 rounded transition ${
                  timerMode === 240 ? 'bg-neutral-800 text-amber-400' : 'text-neutral-400 hover:text-white'
                }`}
                title="240 detik (6 anak panah per seri)"
              >
                240s
              </button>
            </div>
          </div>

          {/* Right: Wind Gauge & Broadcast Toggle */}
          <div className="flex items-center space-x-2.5">
            {/* Live Wind Vector */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono text-neutral-300 font-bold">{windSpeed} m/s</span>
              <span 
                className="inline-block text-cyan-400 font-bold transition-transform duration-500"
                style={{ transform: `rotate(${windDegree}deg)` }}
                title={`Arah Angin: ${windDegree}°`}
              >
                ↑
              </span>
            </div>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-lg border transition ${
                soundEnabled 
                  ? 'bg-neutral-800 text-amber-400 border-neutral-700' 
                  : 'bg-neutral-950 text-neutral-600 border-neutral-800'
              }`}
              title={soundEnabled ? 'Suara Peluit Aktif' : 'Mute Suara'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Broadcast Overlay Toggle */}
            {onToggleBroadcastView && (
              <button
                type="button"
                onClick={onToggleBroadcastView}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                  isBroadcastActive
                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30 animate-pulse'
                    : 'bg-neutral-900 hover:bg-neutral-850 text-neutral-300 border-neutral-800'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-red-400" />
                <span>{isBroadcastActive ? 'Tutup TV Feed' : 'Mode Siaran TV (Chyron)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
