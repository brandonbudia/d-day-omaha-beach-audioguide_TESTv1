import { STOPS, StopData } from '../data/stops';
import { SupportedLanguage } from '../i18n/translations';

export interface AudioState {
  currentStopId: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isVoiceBoostActive: boolean;
  language: SupportedLanguage;
}

type AudioListener = (state: AudioState) => void;

class GlobalAudioPlayer {
  private state: AudioState;
  private listeners: Set<AudioListener> = new Set();
  private audioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private voiceFilterNode: BiquadFilterNode | null = null;
  private ambientNoiseNode: AudioNode | null = null;
  private isSynthesizing = false;
  private synthTimer: number | null = null;

  constructor() {
    const savedLang = (typeof localStorage !== 'undefined' && localStorage.getItem('dday_lang')) as SupportedLanguage || 'fr';
    const initialStop = STOPS.find((s) => s.id === '01') || STOPS[0];

    this.state = {
      currentStopId: initialStop.id,
      isPlaying: false,
      currentTime: 0,
      duration: initialStop.durationSeconds,
      playbackRate: 1.0,
      isVoiceBoostActive: true,
      language: savedLang,
    };

    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    if (this.audioElement) return;

    this.audioElement = new Audio();
    this.audioElement.preload = 'metadata';
    this.updateAudioSource();

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement && !this.isSynthesizing) {
        this.state.currentTime = this.audioElement.currentTime;
        if (this.audioElement.duration && !isNaN(this.audioElement.duration)) {
          this.state.duration = this.audioElement.duration;
        }
        this.notify();
      }
    });

    this.audioElement.addEventListener('ended', () => {
      this.handleTrackEnded();
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      if (this.audioElement && this.audioElement.duration && !isNaN(this.audioElement.duration)) {
        this.state.duration = this.audioElement.duration;
        this.notify();
      }
    });
  }

  private updateAudioSource() {
    if (!this.audioElement) return;
    const path = `/audio/${this.state.language}/stop-${this.state.currentStopId}.mp3`;
    this.audioElement.src = path;
    this.audioElement.playbackRate = this.state.playbackRate;
  }

  private initWebAudio() {
    if (this.audioCtx || typeof window === 'undefined') return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      if (this.audioElement && !this.sourceNode) {
        this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
        // Voice filter: Peaking filter around 2.5kHz to cut ambient beach wind & boost voice clarity
        this.voiceFilterNode = this.audioCtx.createBiquadFilter();
        this.voiceFilterNode.type = 'peaking';
        this.voiceFilterNode.frequency.value = 2500;
        this.voiceFilterNode.Q.value = 1.2;
        this.voiceFilterNode.gain.value = this.state.isVoiceBoostActive ? 6.0 : 0.0;

        this.sourceNode.connect(this.voiceFilterNode);
        this.voiceFilterNode.connect(this.audioCtx.destination);
      }
    } catch {
      // Audio context might fail on restricted browser contexts, fall back to native element
    }
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): AudioState {
    return { ...this.state };
  }

  private notify() {
    const copy = { ...this.state };
    this.listeners.forEach((fn) => fn(copy));
  }

  public getCurrentStop(): StopData {
    return STOPS.find((s) => s.id === this.state.currentStopId) || STOPS[0];
  }

  public setLanguage(lang: SupportedLanguage) {
    if (this.state.language === lang) return;
    this.state.language = lang;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dday_lang', lang);
    }
    const wasPlaying = this.state.isPlaying;
    const prevTime = this.state.currentTime;

    this.updateAudioSource();
    if (this.audioElement) {
      this.audioElement.currentTime = prevTime;
    }
    if (wasPlaying) {
      this.play();
    }
    this.notify();
  }

  public setStop(stopId: string, autoPlay = true) {
    const target = STOPS.find((s) => s.id === stopId);
    if (!target) return;

    this.state.currentStopId = stopId;
    this.state.currentTime = 0;
    this.state.duration = target.durationSeconds;
    this.updateAudioSource();

    if (autoPlay) {
      this.play();
    } else {
      this.pause();
    }
    this.notify();
  }

  public async play() {
    this.initAudioElement();
    this.initWebAudio();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    if (this.audioElement) {
      try {
        await this.audioElement.play();
        this.state.isPlaying = true;
        this.notify();
      } catch {
        // Fallback simulated progress timer if media autoplay is blocked by browser
        this.startSimulatedPlayback();
      }
    } else {
      this.startSimulatedPlayback();
    }
  }

  private startSimulatedPlayback() {
    this.state.isPlaying = true;
    this.notify();
    if (this.synthTimer) clearInterval(this.synthTimer);
    this.synthTimer = window.setInterval(() => {
      if (this.state.isPlaying) {
        const nextTime = this.state.currentTime + 1 * this.state.playbackRate;
        if (nextTime >= this.state.duration) {
          this.handleTrackEnded();
        } else {
          this.state.currentTime = nextTime;
          this.notify();
        }
      }
    }, 1000);
  }

  public pause() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    if (this.synthTimer) {
      clearInterval(this.synthTimer);
      this.synthTimer = null;
    }
    this.state.isPlaying = false;
    this.notify();
  }

  public togglePlayPause() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(seconds: number) {
    const clamped = Math.max(0, Math.min(seconds, this.state.duration));
    this.state.currentTime = clamped;
    if (this.audioElement) {
      try {
        this.audioElement.currentTime = clamped;
      } catch {
        // ignore if not loaded yet
      }
    }
    this.notify();
  }

  public rewind(seconds = 15) {
    this.seek(this.state.currentTime - seconds);
  }

  public forward(seconds = 15) {
    this.seek(this.state.currentTime + seconds);
  }

  public nextStop() {
    const currentIndex = STOPS.findIndex((s) => s.id === this.state.currentStopId);
    if (currentIndex >= 0 && currentIndex < STOPS.length - 1) {
      this.setStop(STOPS[currentIndex + 1].id, true);
    } else {
      // Loop to beginning
      this.setStop(STOPS[0].id, true);
    }
  }

  public prevStop() {
    const currentIndex = STOPS.findIndex((s) => s.id === this.state.currentStopId);
    if (currentIndex > 0) {
      this.setStop(STOPS[currentIndex - 1].id, true);
    } else {
      this.seek(0);
    }
  }

  public cyclePlaybackRate() {
    const rates = [1.0, 1.25, 0.8];
    const currentIndex = rates.indexOf(this.state.playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    this.state.playbackRate = nextRate;
    if (this.audioElement) {
      this.audioElement.playbackRate = nextRate;
    }
    this.notify();
  }

  public toggleVoiceBoost() {
    this.state.isVoiceBoostActive = !this.state.isVoiceBoostActive;
    if (this.voiceFilterNode) {
      this.voiceFilterNode.gain.value = this.state.isVoiceBoostActive ? 6.0 : 0.0;
    }
    this.notify();
  }

  private handleTrackEnded() {
    // Auto-advance to next stop
    this.nextStop();
  }
}

export const audioPlayer = new GlobalAudioPlayer();
