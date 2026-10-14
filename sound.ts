/**
 * Web Audio API synthesizer for SOURCE AI subtle iOS-inspired Liquid Glass sounds.
 * Synthesized mathematically without any external audio asset dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterVolume: number = 0.5;
  private soundEnabled: boolean = false;
  private interfaceSounds: boolean = true;
  private responseSounds: boolean = true;

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem('source_ai_sound_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.masterVolume = typeof parsed.masterVolume === 'number' ? parsed.masterVolume : 0.5;
        this.soundEnabled = Boolean(parsed.soundEnabled);
        this.interfaceSounds = parsed.interfaceSounds !== undefined ? Boolean(parsed.interfaceSounds) : true;
        this.responseSounds = parsed.responseSounds !== undefined ? Boolean(parsed.responseSounds) : true;
      }
    } catch {
      // LocalStorage fallback
    }
  }

  public saveSettings(settings: {
    soundEnabled: boolean;
    masterVolume: number;
    interfaceSounds: boolean;
    responseSounds: boolean;
  }) {
    this.soundEnabled = settings.soundEnabled;
    this.masterVolume = settings.masterVolume;
    this.interfaceSounds = settings.interfaceSounds;
    this.responseSounds = settings.responseSounds;
    try {
      localStorage.setItem('source_ai_sound_settings', JSON.stringify(settings));
    } catch {}
  }

  public getSettings() {
    return {
      soundEnabled: this.soundEnabled,
      masterVolume: this.masterVolume,
      interfaceSounds: this.interfaceSounds,
      responseSounds: this.responseSounds,
    };
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Soft glass click
  public playClick() {
    if (!this.soundEnabled || !this.interfaceSounds) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.04);

    gain.gain.setValueAtTime(this.masterVolume * 0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Liquid bubble pop / menu tap
  public playMenuOpen() {
    if (!this.soundEnabled || !this.interfaceSounds) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.06);

    gain.gain.setValueAtTime(this.masterVolume * 0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Tool switch / mode select chime
  public playToolSelect() {
    if (!this.soundEnabled || !this.interfaceSounds) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [587.33, 880].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(this.masterVolume * 0.1, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.04 + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.1);
    });
  }

  // Message sent whoosh
  public playSend() {
    if (!this.soundEnabled || !this.interfaceSounds) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(980, t + 0.09);

    gain.gain.setValueAtTime(this.masterVolume * 0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  // AI response completed harmonic chime
  public playComplete() {
    if (!this.soundEnabled || !this.responseSounds) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 glass chime
    notes.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + index * 0.05);

      const noteTime = t + index * 0.05;
      gain.gain.setValueAtTime(this.masterVolume * 0.08, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.25);
    });
  }

  // Subtle futuristic boot chime for opening
  public playStartup() {
    if (!this.soundEnabled || !this.interfaceSounds) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chords = [392.0, 587.33, 783.99, 1174.66]; // G chord
    chords.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(this.masterVolume * 0.07, t + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.85);
    });
  }
}

export const sound = new SoundEngine();
