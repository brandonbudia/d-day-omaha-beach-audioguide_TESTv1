import { STOPS, StopData } from '../data/stops';
import { LANGUAGES, SupportedLanguage } from '../i18n/translations';
import { getMediaResource } from '../data/mediaCatalog';
import { visitorStore, type HeardRange, type PlaybackCheckpoint } from '../visit/visitorStore';

export interface AudioState {
  currentStopId: string;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isVoiceBoostActive: boolean;
  language: SupportedLanguage;
  error: 'unavailable' | 'playback' | null;
  errorReason: 'network' | 'decode' | 'unsupported' | 'blocked' | 'unknown' | null;
}

type AudioListener = (state: AudioState) => void;
const AUDIO_PREFERENCES_KEY = 'dday-audio-preferences-v1';
const PLAYBACK_RATES = [1.0, 1.25, 0.8];
// HTMLMediaElement readiness levels and MediaError codes are available even in hosts
// that do not expose the corresponding constructors as globals.
const HAVE_FUTURE_DATA = 3;
const MEDIA_ERR_ABORTED = 1;
const MEDIA_ERR_NETWORK = 2;
const MEDIA_ERR_DECODE = 3;
const MEDIA_ERR_SRC_NOT_SUPPORTED = 4;
const getMediaErrorReason = (error: MediaError): AudioState['errorReason'] => {
  switch (error.code) {
    case MEDIA_ERR_NETWORK: return 'network';
    case MEDIA_ERR_DECODE: return 'decode';
    case MEDIA_ERR_SRC_NOT_SUPPORTED: return 'unsupported';
    default: return 'unknown';
  }
};
const isAudioPreferences = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value) && (value as Record<string, unknown>).version === 1);

export function getResumablePlayback(checkpoint?: PlaybackCheckpoint): PlaybackCheckpoint | undefined {
  if (!checkpoint || !STOPS.some((stop) => stop.id === checkpoint.id)) return;
  const resource = getMediaResource(checkpoint.id, checkpoint.language);
  if (resource.status === 'unavailable' || resource.sha256 !== checkpoint.audioIdentity) return;
  return checkpoint.positionSeconds >= resource.durationSeconds - 0.5 ? { ...checkpoint, positionSeconds: 0 } : checkpoint;
}

class GlobalAudioPlayer {
  private state: AudioState;
  private listeners: Set<AudioListener> = new Set();
  private audioElement: HTMLAudioElement | null = null;
  private playbackFrame: number | null = null;
  private lastFrameNotification = 0;
  private audioCtx: AudioContext | null = null;
  private voiceFilterNode: BiquadFilterNode | null = null;
  private outputGainNode: GainNode | null = null;
  private playbackIntent = false;
  private contextOperation: Promise<void> = Promise.resolve();
  private playRequest = 0;
  private pendingSeek: number | null = null;
  private checkpointSource: { id: string; language: SupportedLanguage; audioIdentity: string; durationSeconds: number } | null = null;
  private checkpointStarted = false;
  private hasManualSeek = false;
  private lastCheckpointAt = 0;
  private lastCheckpointSignature = '';
  private completionBlockedByEndSeek = false;
  private audioPreferences: Record<string, unknown> | null = null;

  constructor() {
    let savedLang: SupportedLanguage = 'fr';
    let savedRate = 1;
    let savedVoiceBoost = true;
    try {
      const stored = localStorage.getItem('dday_lang');
      if (LANGUAGES.some((language) => language.code === stored)) savedLang = stored as SupportedLanguage;
    } catch { /* Playback remains available when storage is disabled. */ }
    try {
      const saved = localStorage.getItem(AUDIO_PREFERENCES_KEY);
      const preferences: unknown = saved === null ? { version: 1 } : JSON.parse(saved);
      if (isAudioPreferences(preferences)) {
        this.audioPreferences = { ...preferences };
        if (typeof preferences.playbackRate === 'number' && PLAYBACK_RATES.includes(preferences.playbackRate)) savedRate = preferences.playbackRate;
        if (typeof preferences.isVoiceBoostActive === 'boolean') savedVoiceBoost = preferences.isVoiceBoostActive;
      }
    } catch { /* An unreadable or unknown preference format is preserved untouched. */ }
    const lastPlayback = visitorStore.getSnapshot().lastPlayback;
    const savedPlayback = lastPlayback?.language === savedLang ? getResumablePlayback(lastPlayback) : undefined;
    const initialStop = STOPS.find((stop) => stop.id === savedPlayback?.id) ?? STOPS[0];
    // A direct link can select a language before the media element starts preloading.
    const linkLanguage = new URLSearchParams(typeof window === 'undefined' ? undefined : window.location?.search).get('hl');
    const initialLang = LANGUAGES.find((language) => language.code === linkLanguage)?.code ?? savedLang;
    const initialResource = getMediaResource(initialStop.id, initialLang);
    const initialPosition = initialLang === savedLang ? savedPlayback?.positionSeconds ?? 0 : 0;
    if (initialLang !== savedLang) {
      try { localStorage.setItem('dday_lang', initialLang); } catch { /* Keep the link's language for this session. */ }
    }

    this.state = {
      currentStopId: initialStop.id,
      isPlaying: false,
      isBuffering: false,
      currentTime: initialPosition,
      duration: initialResource.status === 'unavailable' ? 0 : initialResource.durationSeconds,
      playbackRate: savedRate,
      isVoiceBoostActive: savedVoiceBoost,
      language: initialLang,
      error: null,
      errorReason: null,
    };
    this.pendingSeek = initialPosition > 0 ? initialPosition : null;

    if (typeof window !== 'undefined') {
      this.initAudioElement();
      if (typeof window.addEventListener === 'function') window.addEventListener('pagehide', () => this.flushCheckpoint());
      if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.hidden) this.flushCheckpoint(); });
    }
  }

  private initAudioElement() {
    if (this.audioElement) return;

    this.audioElement = new Audio();
    this.audioElement.crossOrigin = 'anonymous';
    this.audioElement.preload = 'metadata';

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement) {
        this.state.currentTime = this.pendingSeek ?? this.audioElement.currentTime;
        if (this.audioElement.duration && !isNaN(this.audioElement.duration)) {
          this.state.duration = this.audioElement.duration;
        }
        this.captureCheckpoint();
        this.notify();
      }
    });

    const syncSeek = () => {
      if (this.audioElement) {
        this.state.currentTime = this.pendingSeek ?? this.audioElement.currentTime;
        this.captureCheckpoint();
        this.notify();
      }
    };
    this.audioElement.addEventListener('seeking', () => {
      if (this.audioElement) this.completionBlockedByEndSeek = this.audioElement.currentTime >= this.state.duration - 0.001;
      syncSeek();
    });
    this.audioElement.addEventListener('seeked', syncSeek);

    this.audioElement.addEventListener('play', () => {
      // Native media events are queued: an old play event can arrive after Pause.
      if (!this.playbackIntent) {
        this.setOutputEnabled(false);
        this.audioElement?.pause();
        return;
      }
      if (this.audioElement?.paused) return;
      // Playing again after an ended recording may make the browser rewind natively.
      if (this.audioElement && this.audioElement.currentTime < this.state.duration - 0.001) this.completionBlockedByEndSeek = false;
      this.setOutputEnabled(true);
      this.checkpointStarted = true;
      this.lastCheckpointAt = Date.now();
      this.state.isPlaying = true;
      this.state.error = null;
      this.state.errorReason = null;
      this.startPlaybackClock();
      this.captureCheckpoint(false, true);
      this.notify();
    });
    this.audioElement.addEventListener('waiting', () => {
      const media = this.audioElement;
      if (this.playbackIntent && media && !media.paused && media.readyState < HAVE_FUTURE_DATA) this.setBuffering(true);
    });
    this.audioElement.addEventListener('playing', () => {
      const media = this.audioElement;
      if (this.playbackIntent && media && !media.paused && media.readyState >= HAVE_FUTURE_DATA) this.setBuffering(false);
    });
    this.audioElement.addEventListener('pause', () => {
      if (this.audioElement?.paused) {
        // A queued pause from a stopped generation can arrive before the new play reaches the media element.
        if (this.playbackIntent && this.state.isBuffering && !this.state.isPlaying) return;
        if (this.state.isPlaying && !this.audioElement.ended) {
          // Also respect pauses initiated by the browser or device controls.
          this.playbackIntent = false;
          this.playRequest += 1;
        }
        this.setOutputEnabled(false);
        this.state.isPlaying = false;
        this.state.isBuffering = false;
        this.stopPlaybackClock();
        this.flushCheckpoint();
        // Keep the intent on a natural end; its subsequent ended event advances the tour.
        if (!this.playbackIntent) void this.syncAudioContext().catch(() => {});
      }
    });
    this.audioElement.addEventListener('error', () => {
      const error = this.audioElement?.error;
      if (!error) return;
      if (error.code === MEDIA_ERR_ABORTED) this.stopAfterFailure(null, null);
      else this.stopAfterFailure('unavailable', getMediaErrorReason(error));
    });

    this.audioElement.addEventListener('ended', () => {
      if (this.playbackIntent && this.audioElement?.ended) {
        this.captureCheckpoint(true, true);
        this.handleTrackEnded();
      }
    });

    this.audioElement.addEventListener('loadedmetadata', () => {
      if (this.audioElement && this.audioElement.duration && !isNaN(this.audioElement.duration)) {
        this.state.duration = this.audioElement.duration;
        if (this.pendingSeek !== null) {
          const target = this.pendingSeek;
          this.pendingSeek = null;
          this.seekTo(target);
        }
        this.notify();
      }
    });
    this.updateAudioSource();
  }

  private updateAudioSource() {
    if (!this.audioElement) return;
    this.flushCheckpoint();
    this.checkpointStarted = false;
    this.hasManualSeek = false;
    this.lastCheckpointSignature = '';
    this.completionBlockedByEndSeek = false;
    this.playRequest += 1;
    this.playbackIntent = false;
    this.setOutputEnabled(false);
    this.state.isPlaying = false;
    this.state.isBuffering = false;
    this.state.error = null;
    this.state.errorReason = null;
    this.stopPlaybackClock(false);
    const resource = getMediaResource(this.state.currentStopId, this.state.language);
    if (resource.status === 'unavailable') {
      this.checkpointSource = null;
      this.state.duration = 0;
      if (this.audioElement.hasAttribute('src')) {
        this.audioElement.removeAttribute('src');
        this.audioElement.load();
      }
    } else {
      this.checkpointSource = { id: this.state.currentStopId, language: this.state.language, audioIdentity: resource.sha256, durationSeconds: resource.durationSeconds };
      this.state.duration = resource.durationSeconds;
      this.audioElement.src = resource.url;
    }
    this.audioElement.playbackRate = this.state.playbackRate;
    void this.syncAudioContext().catch(() => {});
  }

  private captureCheckpoint(ended = false, force = false) {
    const media = this.audioElement;
    const source = this.checkpointSource;
    if (!media || !source || source.durationSeconds <= 0 || this.pendingSeek !== null || media.readyState === 0) return;
    const now = Date.now();
    if (!force && now - this.lastCheckpointAt < 5000) return;
    const playedRanges: HeardRange[] = [];
    if (this.checkpointStarted) {
      try {
        const played = media.played;
        for (let index = 0; index < (played?.length ?? 0); index += 1) playedRanges.push([played.start(index), played.end(index)]);
      } catch { /* Never infer listening from seeks when played ranges are unavailable. */ }
    }
    if (playedRanges.length === 0) {
      if (!this.hasManualSeek) return;
      const saved = visitorStore.getSnapshot();
      const checkpoint = saved.lastPlayback;
      const record = saved.pieces[source.id]?.listening[source.language];
      // A paused seek can update the last genuinely heard recording's position,
      // but opening or seeking in an unheard station must not create listening.
      if (!checkpoint || checkpoint.id !== source.id || checkpoint.language !== source.language || checkpoint.audioIdentity !== source.audioIdentity
        || record?.audioIdentity !== source.audioIdentity || !record.heardRanges.length
        || media.currentTime === checkpoint.positionSeconds) return;
    }
    const signature = JSON.stringify([source.id, source.language, source.audioIdentity, media.currentTime, playedRanges, ended]);
    if (signature === this.lastCheckpointSignature) return;
    this.lastCheckpointAt = now;
    this.lastCheckpointSignature = signature;
    // Browsers can dispatch ended after a seek straight to duration. That event must
    // not complete a recording, even if older sessions already supplied its tail.
    visitorStore.capturePlayback({ ...source, positionSeconds: media.currentTime, playedRanges, ended: ended && this.checkpointStarted && !this.completionBlockedByEndSeek });
  }

  /** Used before a deliberate reload and on pagehide; never writes at frame frequency. */
  public flushCheckpoint() {
    this.captureCheckpoint(false, true);
  }

  /** Restores only an exact known audio version, paused, without replacing active playback. */
  public restoreLastPlayback(): boolean {
    if (this.state.isPlaying || this.playbackIntent) return false;
    const checkpoint = getResumablePlayback(visitorStore.getSnapshot().lastPlayback);
    if (!checkpoint) return false;
    this.pause();
    this.state.language = checkpoint.language;
    try { localStorage.setItem('dday_lang', checkpoint.language); } catch { /* The explicit resume still works for this visit. */ }
    this.setStop(checkpoint.id, false);
    this.seekTo(checkpoint.positionSeconds);
    return true;
  }

  private startPlaybackClock() {
    if (this.playbackFrame !== null || typeof window === 'undefined') return;

    const tick = (now: number) => {
      this.playbackFrame = null;
      if (!this.playbackIntent || !this.audioElement || this.audioElement.paused) return;

      // Keep the UI responsive for word highlighting without notifying React on every display frame.
      if (now - this.lastFrameNotification >= 33) {
        this.state.currentTime = this.pendingSeek ?? this.audioElement.currentTime;
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
      this.state.currentTime = this.pendingSeek ?? this.audioElement.currentTime;
      this.notify();
    }
  }

  private initWebAudio() {
    if (!this.audioElement || typeof window === 'undefined') return;
    if (this.audioCtx) {
      if (!this.outputGainNode) throw new Error('Cannot connect audio output');
      return;
    }
    let context: AudioContext | undefined;
    let source: MediaElementAudioSourceNode;
    let filter: BiquadFilterNode;
    let gain: GainNode;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      context = new AudioContextClass();
      filter = context.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = 2500;
      filter.Q.value = 1.2;
      filter.gain.value = this.state.isVoiceBoostActive ? 6.0 : 0.0;
      gain = context.createGain();
      gain.gain.value = 0;

      // Build the output graph before diverting the media element's native sound.
      filter.connect(gain);
      gain.connect(context.destination);
      source = context.createMediaElementSource(this.audioElement);
    } catch {
      void context?.close?.().catch(() => {});
      return;
    }
    this.audioCtx = context;
    try {
      source.connect(filter);
      this.voiceFilterNode = filter;
    } catch {
      // Once the element is routed, keep sound on the output gate if the voice filter fails.
      source.connect(gain);
    }
    this.outputGainNode = gain;
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
    this.flushCheckpoint();
    this.state.language = lang;
    try {
      localStorage.setItem('dday_lang', lang);
    } catch { /* Keep the language choice for this session. */ }
    const wasPlaying = this.state.isPlaying;

    this.updateAudioSource();
    // A different narration has its own wording and duration. Its seconds do
    // not correspond to the old language's position; keep that checkpoint only.
    this.seekTo(0);
    if (wasPlaying && getMediaResource(this.state.currentStopId, lang).status !== 'unavailable') {
      void this.play();
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
    this.seekTo(0);

    if (autoPlay) {
      this.play();
    } else {
      this.pause();
    }
    this.notify();
  }

  public async play() {
    this.initAudioElement();
    if (getMediaResource(this.state.currentStopId, this.state.language).status === 'unavailable') {
      this.pause();
      this.state.error = 'unavailable';
      this.state.errorReason = null;
      this.notify();
      return;
    }
    if (this.audioElement?.error) {
      const position = this.state.currentTime;
      this.updateAudioSource();
      this.seekTo(position);
    }
    const request = ++this.playRequest;
    this.playbackIntent = true;
    if (!this.state.isPlaying) this.setBuffering(true);
    try {
      this.initWebAudio();
      await this.syncAudioContext();
      if (!this.audioElement || request !== this.playRequest || !this.playbackIntent) return;
      await this.audioElement.play();
      if (!this.playbackIntent) this.audioElement.pause();
      if (request === this.playRequest && this.playbackIntent) this.setBuffering(false);
    } catch (error) {
      // Rejections from replaced starts are expected. A current abort must release the play intent.
      if (request === this.playRequest) {
        const name = error instanceof Error ? error.name : undefined;
        const mediaError = this.audioElement?.error;
        if (name === 'AbortError') this.stopAfterFailure(null, null, true);
        else if (mediaError) this.stopAfterFailure('unavailable', getMediaErrorReason(mediaError), true);
        else this.stopAfterFailure('playback', name === 'NotAllowedError' ? 'blocked' : name === 'NotSupportedError' ? 'unsupported' : 'unknown', true);
      }
    }
  }

  private setBuffering(buffering: boolean) {
    if (this.state.isBuffering === buffering) return;
    this.state.isBuffering = buffering;
    this.notify();
  }

  private stopAfterFailure(error: AudioState['error'], reason: AudioState['errorReason'], pauseMedia = false) {
    this.playbackIntent = false;
    this.playRequest += 1;
    this.setOutputEnabled(false);
    this.state.isPlaying = false;
    this.state.isBuffering = false;
    this.state.error = error;
    this.state.errorReason = reason;
    if (pauseMedia) this.audioElement?.pause();
    this.stopPlaybackClock();
    this.flushCheckpoint();
    void this.syncAudioContext().catch(() => {});
  }

  public pause() {
    this.playRequest += 1;
    this.playbackIntent = false;
    this.setOutputEnabled(false);
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.state.isPlaying = false;
    this.state.isBuffering = false;
    // pause() updates the native clock immediately; its event comes in a later task.
    this.stopPlaybackClock();
    this.flushCheckpoint();
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
    this.hasManualSeek = true;
    this.seekTo(seconds);
  }

  private seekTo(seconds: number) {
    const clamped = Math.max(0, Math.min(seconds, this.state.duration));
    this.completionBlockedByEndSeek = clamped >= this.state.duration - 0.001;
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
    this.captureCheckpoint();
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
    const currentIndex = PLAYBACK_RATES.indexOf(this.state.playbackRate);
    const nextRate = PLAYBACK_RATES[(currentIndex + 1) % PLAYBACK_RATES.length];
    this.state.playbackRate = nextRate;
    if (this.audioElement) {
      this.audioElement.playbackRate = nextRate;
    }
    this.saveAudioPreferences();
    this.notify();
  }

  public toggleVoiceBoost() {
    this.state.isVoiceBoostActive = !this.state.isVoiceBoostActive;
    if (this.voiceFilterNode) {
      this.voiceFilterNode.gain.value = this.state.isVoiceBoostActive ? 6.0 : 0.0;
    }
    this.saveAudioPreferences();
    this.notify();
  }

  private saveAudioPreferences() {
    if (!this.audioPreferences) return;
    try {
      // Read before merging so an unfamiliar schema or concurrent unknown fields
      // are never replaced by the player's two supported preference controls.
      const saved = localStorage.getItem(AUDIO_PREFERENCES_KEY);
      const latest: unknown = saved === null ? this.audioPreferences : JSON.parse(saved);
      if (!isAudioPreferences(latest)) return;
      const next = { ...latest, version: 1, playbackRate: this.state.playbackRate, isVoiceBoostActive: this.state.isVoiceBoostActive };
      localStorage.setItem(AUDIO_PREFERENCES_KEY, JSON.stringify(next));
      this.audioPreferences = next;
    } catch { /* The selected controls remain effective when persistence is denied. */ }
  }

  private handleTrackEnded() {
    // Auto-advance to next stop
    this.nextStop();
  }
}

export const audioPlayer = new GlobalAudioPlayer();
