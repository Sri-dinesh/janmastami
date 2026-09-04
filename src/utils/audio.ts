/**
 * Web Audio API synthesizer for Krishna Janmashtami
 * Generates authentic Bansuri (bamboo flute) notes, temple bells, butter pops, and meditative tanpura drone
 * without relying on external audio files that might fail or cause CORS issues.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private fluteTimer: number | null = null;
  private bgAudio: HTMLAudioElement | null = null;
  private bgAudioVolume: number = 0.20; // Serene low sound for divine background atmosphere

  // Pentatonic bansuri raga notes (Raga Bhupali / Mohanam: Sa, Re, Ga, Pa, Dha)
  private readonly ragaNotes = [
    293.66, // D4 (Sa)
    329.63, // E4 (Re)
    369.99, // F#4 (Ga)
    440.00, // A4 (Pa)
    493.88, // B4 (Dha)
    587.33, // D5 (Sa high)
    659.25, // E5 (Re high)
    739.99, // F#5 (Ga high)
    880.00, // A5 (Pa high)
  ];

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.bgAudio && typeof Audio !== 'undefined') {
      this.bgAudio = new Audio('/krishna_and_his_leel.mp3');
      this.bgAudio.loop = true;
      this.bgAudio.volume = this.bgAudioVolume;
      this.bgAudio.preload = 'auto';
      this.bgAudio.addEventListener('error', () => {
        if (this.bgAudio) {
          this.bgAudio.src = 'krishna_and_his_leel.mp3';
        }
      });
    }
  }

  public toggleMute(): boolean {
    this.init();
    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      this.stopAmbientDrone();
      this.pauseBackgroundMusic();
    } else {
      this.startAmbientDrone();
      this.playBackgroundMusic();
      this.playFlutePhrase();
    }
    return !this.isMuted;
  }

  public playBackgroundMusic() {
    this.init();
    if (this.isMuted || !this.bgAudio) return;
    this.bgAudio.volume = this.bgAudioVolume;
    const playPromise = this.bgAudio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy: will resume on next user click/interaction
      });
    }
  }

  public pauseBackgroundMusic() {
    if (this.bgAudio) {
      this.bgAudio.pause();
    }
  }

  public setBackgroundMusicVolume(volume: number) {
    this.bgAudioVolume = Math.max(0, Math.min(1, volume));
    if (this.bgAudio) {
      this.bgAudio.volume = this.bgAudioVolume;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Starts a warm, soft meditative Tanpura drone (Sa - Pa resonance)
   */
  public startAmbientDrone() {
    if (this.isMuted || !this.ctx) return;
    try {
      if (this.droneGain) {
        this.droneGain.gain.setTargetAtTime(0.04, this.ctx.currentTime, 0.5);
        return;
      }

      const now = this.ctx.currentTime;
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.001, now);
      this.droneGain.gain.exponentialRampToValueAtTime(0.04, now + 2);

      // Low pass filter to keep it warm and non-intrusive
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      // Root Sa (D3 ~ 146.83 Hz)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(146.83, now);

      // Pa fifth (A3 ~ 220.00 Hz)
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'triangle';
      this.droneOsc2.frequency.setValueAtTime(220.00, now);

      this.droneOsc1.connect(filter);
      this.droneOsc2.connect(filter);
      filter.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);

      this.droneOsc1.start();
      this.droneOsc2.start();

      // Periodically play spontaneous sweet bansuri phrases every 12-18 seconds
      this.scheduleFluteAmbience();
    } catch {
      // Audio fallback silent
    }
  }

  public stopAmbientDrone() {
    if (!this.ctx || !this.droneGain) return;
    try {
      this.droneGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.4);
      if (this.fluteTimer) {
        window.clearTimeout(this.fluteTimer);
        this.fluteTimer = null;
      }
    } catch {
      // Audio fallback
    }
  }

  private scheduleFluteAmbience() {
    if (this.fluteTimer) window.clearTimeout(this.fluteTimer);
    if (this.isMuted) return;

    const delay = 10000 + Math.random() * 8000;
    this.fluteTimer = window.setTimeout(() => {
      if (!this.isMuted) {
        this.playFlutePhrase();
        this.scheduleFluteAmbience();
      }
    }, delay);
  }

  /**
   * Synthesize a melodic bansuri (bamboo flute) note with breath characteristics & vibrato
   */
  public playFluteNote(freq?: number, duration: number = 1.2) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const targetFreq = freq || this.ragaNotes[Math.floor(Math.random() * this.ragaNotes.length)];

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, now);
      masterGain.gain.exponentialRampToValueAtTime(0.08, now + 0.15); // soft breath attack
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Main flute tone (sine with warm harmonics)
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(targetFreq, now);

      // Subtle pitch bend at start (gamak / meend expression in Indian music)
      osc.frequency.setValueAtTime(targetFreq * 0.98, now);
      osc.frequency.exponentialRampToValueAtTime(targetFreq, now + 0.08);

      // Vibrato LFO
      const vibrato = this.ctx.createOscillator();
      vibrato.frequency.setValueAtTime(5.2, now); // ~5Hz vibrato
      const vibratoGain = this.ctx.createGain();
      vibratoGain.gain.setValueAtTime(targetFreq * 0.012, now); // gentle vibrato depth
      vibrato.connect(osc.frequency);
      vibrato.start(now);
      vibrato.stop(now + duration);

      // Flute air breathiness filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(targetFreq * 1.5, now);
      filter.Q.setValueAtTime(3.0, now);

      osc.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Plays a sweet 3-4 note traditional bansuri phrase
   */
  public playFlutePhrase() {
    if (this.isMuted || !this.ctx) return;
    const phrase = [
      this.ragaNotes[2], // Ga
      this.ragaNotes[3], // Pa
      this.ragaNotes[4], // Dha
      this.ragaNotes[5], // Sa high
    ];

    phrase.forEach((note, index) => {
      window.setTimeout(() => {
        if (!this.isMuted) {
          this.playFluteNote(note, 1.4);
        }
      }, index * 420);
    });
  }

  /**
   * Sacred temple bell chime sound
   */
  public playTempleBell() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const baseFreq = 880; // A5 metallic bell harmonic

      [1, 1.52, 2.01, 2.76, 3.4].forEach((ratio, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const decay = 2.4 - i * 0.3;

        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(baseFreq * ratio, now);

        gain.gain.setValueAtTime(0.04 / (i + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.4, decay));

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + decay);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Cute butter splash / pop sound for Matki interaction
   */
  public playButterPop() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);

      // Followed by sweet flute chime
      window.setTimeout(() => this.playFluteNote(this.ragaNotes[5], 0.8), 120);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Gentle cow moo / bell chime
   */
  public playCowBell() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(620, now);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(650, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.42);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Auspicious celebration chime
   */
  public playBlessingChime() {
    if (this.isMuted || !this.ctx) return;
    this.playTempleBell();
    window.setTimeout(() => this.playFlutePhrase(), 400);
  }
}

export const soundEngine = new SoundEngine();
