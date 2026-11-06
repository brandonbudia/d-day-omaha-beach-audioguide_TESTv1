import { STOPS, StopData } from '../data/stops';
import { LANGUAGES, SupportedLanguage } from '../i18n/translations';

export interface AudioState {
  currentStopId: string;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isVoiceBoostActive: boolean;
  language: SupportedLanguage;
  error: 'unavailable' | 'playback' | null;
}

type AudioListener = (state: AudioState) => void;

class GlobalAudioPlayer {
  private state: AudioState;
  private listeners: Set<AudioListener> = new Set();
  private audioElement: HTMLAudioElement | null = null;
  private playbackFrame: number | null = null;
  private lastFrameNotification = 0;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private voiceFilterNode: BiquadFilterNode | null = null;
  private outputGainNode: GainNode | null = null;
  private playbackIntent = false;
  private contextOperation: Promise<void> = Promise.resolve();
  private playRequest = 0;
  private pendingSeek: number | null = null;

  constructor() {
    let savedLang: SupportedLanguage = 'fr';
    try {
      const stored = localStorage.getItem('dday_lang');
      if (LANGUAGES.some((language) => language.code === stored)) savedLang = stored as SupportedLanguage;
    } catch { /* Playback remains available when storage is disabled. */ }
    const initialStop = STOPS.find((s) => s.id === '01') || STOPS[0];

    this.state = {
      currentStopId: initialStop.id,
      isPlaying: false,
      currentTime: 0,
      duration: initialStop.durationSeconds,
      playbackRate: 1.0,
      isVoiceBoostActive: true,
      language: savedLang,
      error: null,
    };

    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    if (this.audioElement) return;

    this.audioElement = new Audio();
    this.audioElement.preload = 'metadata';

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement) {
        this.state.currentTime = this.audioElement.currentTime;
        if (this.audioElement.duration && !isNaN(this.audioElement.duration)) {
          this.state.duration = this.audioElement.duration;
        }
        this.notify();
      }
    });

    const syncSeek = () => {
      if (this.audioElement) {
        this.state.currentTime = this.audioElement.currentTime;
        this.notify();
      }
    };
    this.audioElement.addEventListener('seeking', syncSeek);
    this.audioElement.addEventListener('seeked', syncSeek);

    this.audioElement.addEventListener('play', () => {
      // Native media events are queued: an old play event can arrive after Pause.
      if (!this.playbackIntent) {
        this.setOutputEnabled(false);
        this.audioElement?.pause();
        return;
      }
      if (this.audioElement?.paused) return;
      this.setOutputEnabled(true);
      this.state.isPlaying = true;
      this.state.error = null;
      this.startPlaybackClock();
      this.notify();
    });
    this.audioElement.addEventListener('pause', () => {
      if (this.audioElement?.paused) {
        if (this.state.isPlaying && !this.audioElement.ended) {
          // Also respect pauses initiated by the browser or device controls.
          this.playbackIntent = false;
          this.playRequest += 1;
        }
        this.setOutputEnabled(false);
        this.state.isPlaying = false;
        this.stopPlaybackClock();
        // Keep the intent on a natural end; its subsequent ended event advances the tour.
        if (!this.playbackIntent) void this.syncAudioContext().catch(() => {});
      }
    });
    this.audioElement.addEventListener('error', () => {
      if (!this.audioElement?.error) return;
      this.playbackIntent = false;
      this.playRequest += 1;
      this.setOutputEnabled(false);
      this.state.isPlaying = false;
      this.state.error = 'unavailable';
      this.stopPlaybackClock();
      void this.syncAudioContext().catch(() => {});
    });

    this.audioElement.addEventListener('ended', () => {
      if (this.playbackIntent && this.audioElement?.ended) this.handleTrackEnded();
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      if (this.audioElement && this.audioElement.duration && !isNaN(this.audioElement.duration)) {
        this.state.duration = this.audioElement.duration;
        if (this.pendingSeek !== null) {
          const target = this.pendingSeek;
          this.pendingSeek = null;
          this.seek(target);
        }
        this.notify();
      }
    });
    this.updateAudioSource();
  }

  private updateAudioSource() {
    if (!this.audioElement) return;
    this.playRequest += 1;
    this.playbackIntent = false;
    this.setOutputEnabled(false);
    this.state.isPlaying = false;
    this.state.error = null;
    this.stopPlaybackClock(false);
    const path = `/audio/${this.state.language}/stop-${this.state.currentStopId}.mp3`;
    this.audioElement.src = path;
    this.audioElement.playbackRate = this.state.playbackRate;
    void this.syncAudioContext().catch(() => {});
  }

  private startPlaybackClock() {
    if (this.playbackFrame !== null || typeof window === 'undefined') return;

    const tick = (now: number) => {
      this.playbackFrame = null;
      if (!this.playbackIntent || !this.audioElement || this.audioElement.paused) return;

      // Keep the UI responsive for word highlighting without notifying React on every display frame.
      if (now - this.lastFrameNotification >= 33) {
        this.state.currentTime = this.audioElement.currentTime;
        this.lastFrameNotification = now;
        this.notify();
      }
      this.playbackFrame = window.requestAnimationFrame(tick);
    };

    this.playbackFrame = window.requestAnimationFrame(tick);
  }

  private stopPlaybackClock(syncTime = true) {
    if (this.playbackFrame !== null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(this.playbackFrame);
      this.playbackFrame = null;
    }
    if (this.audioElement && syncTime) {
      this.state.currentTime = this.audioElement.currentTime;
      this.notify();
    }
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

        // A separate output gate guarantees silence without touching the media position.
        this.outputGainNode = this.audioCtx.createGain();
        this.outputGainNode.gain.value = 0;

        this.sourceNode.connect(this.voiceFilterNode);
        this.voiceFilterNode.connect(this.outputGainNode);
        this.outputGainNode.connect(this.audioCtx.destination);
      }
    } catch {
      // Audio context might fail on restricted browser contexts, fall back to native element
    }
  }

  private setOutputEnabled(enabled: boolean) {
    if (this.outputGainNode && this.audioCtx) {
      this.outputGainNode.gain.setValueAtTime(enabled ? 1 : 0, this.audioCtx.currentTime);
    }
  }

  private syncAudioContext(): Promise<void> {
    const context = this.audioCtx;
    if (!context) return Promise.resolve();
    // Serialize hardware transitions and use the latest intent, so a delayed suspend
    // cannot silence a newer Play and a delayed resume cannot undo Pause.
    const operation = this.contextOperation.catch(() => {}).then(async () => {
      if (context.state === 'closed') return;
      if (this.playbackIntent) {
        if (context.state === 'suspended') await context.resume();
      } else if (context.state === 'running') {
        await context.suspend();
      }
    });
    this.contextOperation = operation;
    return operation;
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
    try {
      localStorage.setItem('dday_lang', lang);
    } catch { /* Keep the language choice for this session. */ }
    const wasPlaying = this.state.isPlaying;
    const prevTime = this.state.currentTime;

    this.updateAudioSource();
    this.seek(prevTime);
    if (wasPlaying) {
      this.play();
    }
    this.notify();
  }

  public setStop(stopId: string, autoPlay = true) {
    const target = STOPS.find((s) => s.id === stopId);
    if (!target) return;

    this.pause();
    this.pendingSeek = null;
    this.state.currentStopId = stopId;
    this.state.currentTime = 0;
    this.state.duration = target.durationSeconds;
    this.updateAudioSource();
    this.seek(0);

    if (autoPlay) {
      this.play();
    } else {
      this.pause();
    }
    this.notify();
  }

  public async play() {
    this.initAudioElement();
    if (this.audioElement?.error) {
      const position = this.state.currentTime;
      this.updateAudioSource();
      this.seek(position);
    }
    const request = ++this.playRequest;
    this.playbackIntent = true;
    try {
      this.initWebAudio();
      await this.syncAudioContext();
      if (!this.audioElement || request !== this.playRequest || !this.playbackIntent) return;
      await this.audioElement.play();
      if (!this.playbackIntent) this.audioElement.pause();
    } catch (error) {
      // A stale play request is expected when the visitor changes track or pauses.
      if (request === this.playRequest && !(error instanceof DOMException && error.name === 'AbortError')) {
        this.playbackIntent = false;
        this.setOutputEnabled(false);
        this.audioElement?.pause();
        this.state.isPlaying = false;
        this.state.error = this.audioElement?.error ? 'unavailable' : 'playback';
        this.stopPlaybackClock();
        void this.syncAudioContext().catch(() => {});
      }
    }
  }

  public pause() {
    this.playRequest += 1;
    this.playbackIntent = false;
    this.setOutputEnabled(false);
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.state.isPlaying = false;
    // pause() updates the native clock immediately; its event comes in a later task.
    this.stopPlaybackClock();
    void this.syncAudioContext().catch(() => {});
  }

  public togglePlayPause() {
    if (this.playbackIntent) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(seconds: number) {
    if (!Number.isFinite(seconds)) return;
    const clamped = Math.max(0, Math.min(seconds, this.state.duration));
    this.state.currentTime = clamped;
    if (this.audioElement) {
      this.pendingSeek = this.audioElement.readyState === 0 ? clamped : null;
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
