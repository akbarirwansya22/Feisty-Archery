// Web Audio API Synthesizer for Archery Tournament Signals (World Archery / DOS standard)
class ArcheryAudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a single beep / horn tone with specified frequency, duration, and ramp
  public playTone(freq: number, durationSec: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + durationSec);
    } catch {
      // Audio autoplay policies might catch this, suppress safely
    }
  }

  // World Archery Official Whistle / Buzzer Signals:
  // 1 Whistle (1 long blast) -> "Shoot" / Mulai Menembak
  public playStartShooting() {
    this.playTone(880, 0.6, 'sawtooth', 0.25); // high A5 horn
  }

  // 2 Whistles (2 medium blasts) -> "Archers to the line" / Pemanah ke Garis Tembak
  public playArchersToLine() {
    this.playTone(784, 0.35, 'sawtooth', 0.25);
    setTimeout(() => {
      this.playTone(784, 0.35, 'sawtooth', 0.25);
    }, 450);
  }

  // 3 Whistles (3 medium blasts) -> "Retrieve arrows & score" / Cabut Panah & Skoring
  public playRetrieveArrows() {
    this.playTone(659, 0.3, 'sawtooth', 0.25);
    setTimeout(() => {
      this.playTone(659, 0.3, 'sawtooth', 0.25);
    }, 380);
    setTimeout(() => {
      this.playTone(659, 0.45, 'sawtooth', 0.25);
    }, 760);
  }

  // 4+ Whistles (emergency stop) -> "Cease Fire" / Berhenti Darurat
  public playEmergencyStop() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.playTone(1046, 0.18, 'square', 0.35); // C6 sharp siren
      }, i * 220);
    }
  }

  // Arrow scored chirp
  public playArrowChirp(score: string) {
    if (score === 'X' || score === '10') {
      this.playTone(1200, 0.15, 'sine', 0.2);
      setTimeout(() => this.playTone(1600, 0.25, 'sine', 0.25), 100);
    } else if (score === 'M') {
      this.playTone(220, 0.25, 'triangle', 0.2);
    } else {
      this.playTone(750, 0.12, 'sine', 0.18);
    }
  }
}

export const archeryAudio = new ArcheryAudioEngine();
