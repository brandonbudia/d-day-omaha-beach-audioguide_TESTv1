import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { getMediaResource } from '../src/data/mediaCatalog';
import { importWithUnavailableAudio } from './helpers/unavailable-audio';

function deferred() {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

class MediaMock extends EventTarget {
  currentTime = 0;
  duration = 114.169;
  playbackRate = 1;
  preload = '';
  crossOrigin = '';
  readyState = 1;
  paused = true;
  ended = false;
  muted = false;
  volume = 1;
  error: object | null = null;
  nextPlayError: Error | null = null;
  playCalls = 0;
  pauseCalls = 0;
  loadCalls = 0;
  sourceAssignments: string[] = [];
  private source = '';
  private tasks: { type: string; action?: () => void }[] = [];
  private pendingPlays: ReturnType<typeof deferred>[] = [];
  playedRanges: [number, number][] = [];
  get played() {
    return { length: this.playedRanges.length, start: (index: number) => this.playedRanges[index][0], end: (index: number) => this.playedRanges[index][1] };
  }

  get src() { return this.source; }
  set src(value: string) {
    this.source = value;
    this.sourceAssignments.push(value);
    this.currentTime = 0;
    this.paused = true;
    this.ended = false;
    this.error = null;
    this.playedRanges = [];
  }

  hasAttribute(name: string) { return name === 'src' && this.source !== ''; }
  removeAttribute(name: string) {
    if (name === 'src') this.src = '';
  }
  load() {
    this.loadCalls += 1;
    this.readyState = 0;
    this.duration = NaN;
    this.error = null;
  }

  play() {
    this.playCalls += 1;
    if (this.nextPlayError) {
      const error = this.nextPlayError;
      this.nextPlayError = null;
      return Promise.reject(error);
    }
    this.paused = false;
    this.ended = false;
    const pending = deferred();
    this.pendingPlays.push(pending);
    this.queue('play');
    this.queue('playing', () => {
      if (!this.paused) this.pendingPlays.splice(0).forEach((item) => item.resolve());
    });
    return pending.promise;
  }

  pause() {
    this.pauseCalls += 1;
    if (this.paused) return;
    this.paused = true;
    // Native pause changes paused immediately, but dispatches events in a later task.
    const pending = this.pendingPlays.splice(0);
    this.queue('timeupdate');
    this.queue('pause', () => pending.forEach((item) => item.reject(new DOMException('Paused before playing', 'AbortError'))));
  }

  queue(type: string, action?: () => void) { this.tasks.push({ type, action }); }
  flushOne(type: string) {
    const index = this.tasks.findIndex((task) => task.type === type);
    assert.notEqual(index, -1, `missing queued ${type} event`);
    const [task] = this.tasks.splice(index, 1);
    this.dispatchEvent(new Event(task.type));
    task.action?.();
  }
  flush() {
    while (this.tasks.length) {
      const task = this.tasks.shift()!;
      this.dispatchEvent(new Event(task.type));
      task.action?.();
    }
  }
}

class ParamMock {
  value = 1;
  cancelScheduledValues() { return this; }
  setValueAtTime(value: number) { this.value = value; return this; }
}

class NodeMock {
  gain = new ParamMock();
  frequency = new ParamMock();
  Q = new ParamMock();
  type = '';
  connect<T>(destination: T) { return destination; }
  disconnect() {}
}

const storedValues = new Map<string, string>();
let storageWrites = 0;
const storageMock = {
  getItem: (key: string) => storedValues.get(key) ?? null,
  setItem: (key: string, value: string) => { storedValues.set(key, value); storageWrites += 1; },
};

async function fixture(name: string, seed: Record<string, string> = {}, search = '', unavailableAudio: string[] = []) {
  storedValues.clear();
  storedValues.set('dday_lang', 'fr');
  Object.entries(seed).forEach(([key, value]) => storedValues.set(key, value));
  storageWrites = 0;
  const media = new MediaMock();
  const windowEvents = new EventTarget();
  const documentEvents = Object.assign(new EventTarget(), { hidden: false });
  const frames = new Map<number, FrameRequestCallback>();
  let frameId = 0;
  let instances = 0;
  const context = {
    state: 'running' as 'running' | 'suspended' | 'closed',
    currentTime: 900.5,
    destination: new NodeMock(),
    gains: [] as NodeMock[],
    resumeGate: null as ReturnType<typeof deferred> | null,
    suspendGate: null as ReturnType<typeof deferred> | null,
    resumeCalls: 0,
    suspendCalls: 0,
    closeCalls: 0,
    createMediaElementSource: () => new NodeMock(),
    createBiquadFilter: () => new NodeMock(),
    createGain() { const gain = new NodeMock(); this.gains.push(gain); return gain; },
    async resume() { this.resumeCalls += 1; await this.resumeGate?.promise; this.state = 'running'; },
    async suspend() { this.suspendCalls += 1; await this.suspendGate?.promise; this.state = 'suspended'; },
    async close() { this.closeCalls += 1; this.state = 'closed'; },
  };
  Object.defineProperties(globalThis, {
    Audio: { configurable: true, value: class { constructor() { instances += 1; return media; } } },
    window: { configurable: true, value: {
      location: { search },
      addEventListener: windowEvents.addEventListener.bind(windowEvents),
      requestAnimationFrame: (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; },
      cancelAnimationFrame: (id: number) => frames.delete(id),
      AudioContext: class { constructor() { return context; } },
      localStorage: storageMock,
    } },
    document: { configurable: true, value: documentEvents },
    localStorage: { configurable: true, value: storageMock },
  });
  const { visitorStore } = await import('../src/visit/visitorStore');
  visitorStore.reloadFromStorage();
  const url = new URL('../src/audio/audioStore.ts', import.meta.url);
  url.searchParams.set('lifecycle', name);
  type AudioStore = typeof import('../src/audio/audioStore');
  const { audioPlayer: player } = unavailableAudio.length
    ? await importWithUnavailableAudio<AudioStore>(url, unavailableAudio)
    : await import(url.href) as AudioStore;
  const start = async () => {
    const pending = player.play();
    await nextTurn();
    media.flush();
    await pending;
  };
  return { media, player, frames, context, start, visitorStore, windowEvents, documentEvents, writes: () => storageWrites, instances: () => instances };
}

test('current media AbortError releases the intent so the next Play click starts immediately', async () => {
  const { media, player } = await fixture('current-abort-retry');
  media.nextPlayError = new DOMException('Playback interrupted', 'AbortError');
  await player.play();
  assert.equal(player.getState().isPlaying, false);
  assert.equal(player.getState().isBuffering, false);
  assert.equal(player.getState().error, null);
  player.togglePlayPause();
  await nextTurn();
  assert.equal(media.playCalls, 2);
  media.flush();
  await nextTurn();
  assert.equal(player.getState().isPlaying, true);
});

test('the player reports startup and native buffering without crediting unheard time or changing pause intent', async () => {
  const { media, player, writes } = await fixture('native-buffering');
  const pending = player.play();
  assert.equal(player.getState().isBuffering, true);
  assert.equal(player.getState().isPlaying, false);
  await nextTurn();
  media.flushOne('play');
  assert.equal(player.getState().isBuffering, true, 'play does not mean media playback has started');
  media.readyState = 4;
  media.flushOne('playing');
  await pending;
  assert.equal(player.getState().isBuffering, false);
  assert.equal(player.getState().isPlaying, true);
  media.readyState = 2;
  media.dispatchEvent(new Event('waiting'));
  assert.equal(player.getState().isBuffering, true);
  assert.equal(writes(), 0);
  player.togglePlayPause();
  media.dispatchEvent(new Event('waiting'));
  media.dispatchEvent(new Event('playing'));
  assert.equal(player.getState().isBuffering, false);
  assert.equal(player.getState().isPlaying, false);
  assert.equal(writes(), 0);
});

test('network, decode and unsupported media failures are distinct and a native cancellation can be retried', async () => {
  for (const [code, reason] of [[1, null], [2, 'network'], [3, 'decode'], [4, 'unsupported']] as const) {
    const { media, player, start } = await fixture(`native-media-error-${code}`);
    await start();
    media.paused = true;
    media.error = { code };
    media.dispatchEvent(new Event('error'));
    assert.equal(player.getState().error, code === 1 ? null : 'unavailable');
    assert.equal(player.getState().errorReason, reason);
    assert.equal(player.getState().isPlaying, false);
    assert.equal(player.getState().isBuffering, false);
    await start();
    assert.equal(player.getState().isPlaying, true);
    assert.equal(player.getState().errorReason, null);
  }
});

test('a refusal by native play remains distinguishable from a source error', async () => {
  const { media, player, start } = await fixture('native-play-blocked');
  media.nextPlayError = new DOMException('Gesture required', 'NotAllowedError');
  await player.play();
  assert.equal(player.getState().error, 'playback');
  assert.equal(player.getState().errorReason, 'blocked');
  assert.equal(player.getState().isBuffering, false);
  await start();
  assert.equal(player.getState().error, null);
  assert.equal(player.getState().isPlaying, true);
});

test('a failure preparing Web Audio leaves the native element connected to its output', async () => {
  const { player, context, start } = await fixture('web-audio-preparation-failure');
  let diverted = false;
  context.createMediaElementSource = () => { diverted = true; return new NodeMock(); };
  context.createBiquadFilter = () => { throw new Error('filter unavailable'); };
  await start();
  assert.equal(diverted, false);
  assert.equal(context.closeCalls, 1);
  assert.equal(player.getState().isPlaying, true);
  assert.equal(player.getState().error, null);
});

test('an unavailable voice filter connection falls back to the existing output gate', async () => {
  const { player, context, start } = await fixture('web-audio-filter-fallback');
  const filter = new NodeMock();
  const source = new NodeMock();
  const connected: unknown[] = [];
  context.createBiquadFilter = () => filter;
  context.createMediaElementSource = () => source;
  source.connect = <T>(destination: T) => {
    if (destination === filter) throw new Error('filter connection unavailable');
    connected.push(destination);
    return destination;
  };
  await start();
  assert.deepEqual(connected, [context.gains[0]]);
  assert.equal(context.gains[0].gain.value, 1);
  player.pause();
  assert.equal(context.gains[0].gain.value, 0);
});

test('pagehide flushes the last audible interval without completing the station', async () => {
  const { media, start, windowEvents, visitorStore, writes } = await fixture('pagehide-checkpoint');
  await start();
  assert.equal(writes(), 0);
  media.currentTime = 7.12;
  media.playedRanges = [[0, 7.12]];
  windowEvents.dispatchEvent(new Event('pagehide'));
  const listening = visitorStore.getSnapshot().pieces['01'].listening.fr;
  assert.equal(listening?.positionSeconds, 7.12);
  assert.equal(listening?.completedAt, undefined);
  assert.deepEqual(listening?.heardRanges, [[0, 7.12]]);
});

test('pause captures the precise media time and cancels its frame before delayed native events', async () => {
  const { media, player, frames, context, start } = await fixture('synchronous-pause');
  await start();
  assert.equal(player.getState().isPlaying, true);
  assert.equal(frames.size, 1);
  media.currentTime = 45.553;
  player.pause();
  assert.equal(media.paused, true);
  assert.equal(player.getState().isPlaying, false);
  assert.equal(player.getState().currentTime, 45.553);
  assert.equal(frames.size, 0);
  // The media clock is authoritative, not the unrelated AudioContext clock.
  assert.notEqual(player.getState().currentTime, context.currentTime);
  for (const output of context.gains) assert.equal(output.gain.value, 0);
  media.flush();
  assert.equal(player.getState().currentTime, 45.553);
});

test('a queued play event cannot turn a deliberate pause back into playback', async () => {
  const { media, player, frames } = await fixture('late-play');
  const pending = player.play();
  await nextTurn();
  assert.equal(media.playCalls, 1);
  player.pause();
  media.flushOne('play');
  assert.equal(media.paused, true);
  assert.equal(player.getState().isPlaying, false);
  assert.equal(frames.size, 0);
  media.flush();
  await pending;
});

test('pause cancels a start waiting for AudioContext.resume without a later native play', async () => {
  const { media, player, context } = await fixture('pending-resume');
  context.state = 'suspended';
  context.resumeGate = deferred();
  const pending = player.play();
  await nextTurn();
  assert.equal(context.resumeCalls, 1);
  player.pause();
  context.resumeGate.resolve();
  await pending;
  assert.equal(media.playCalls, 0);
  assert.equal(media.paused, true);
  assert.equal(player.getState().isPlaying, false);
  await nextTurn();
  assert.equal(context.state, 'suspended');
  assert.equal(context.gains.length, 1);
  assert.equal(context.gains[0].gain.value, 0);
});

test('pause silences the output immediately and a delayed suspend cannot stop a newer play', async () => {
  const { media, player, frames, context, start } = await fixture('pending-suspend-new-play');
  await start();
  assert.equal(context.gains.length, 1);
  assert.equal(context.gains[0].gain.value, 1);
  media.currentTime = 45.553;
  context.suspendGate = deferred();
  player.pause();
  assert.equal(context.gains[0].gain.value, 0);
  assert.equal(media.currentTime, 45.553);
  assert.equal(frames.size, 0);
  await nextTurn();
  assert.equal(context.suspendCalls, 1);
  const pending = player.play();
  await nextTurn();
  assert.equal(media.playCalls, 1, 'new media play must wait for the outstanding hardware transition');
  assert.equal(context.gains[0].gain.value, 0);
  context.suspendGate.resolve();
  await nextTurn();
  media.flush(); // Includes the old pause event after the new native play has begun.
  await pending;
  await nextTurn();
  assert.equal(context.state, 'running');
  assert.equal(context.resumeCalls, 1);
  assert.equal(player.getState().isPlaying, true);
  assert.equal(media.paused, false);
  assert.equal(media.currentTime, 45.553);
  assert.equal(context.gains[0].gain.value, 1);
  assert.equal(frames.size, 1);
  player.pause();
  media.flush();
});

test('a delayed pause from a previous play does not clear a newer start waiting for AudioContext', async () => {
  const { media, player, context, start } = await fixture('late-pause-buffering');
  await start();
  player.pause();
  await nextTurn();
  assert.equal(context.state, 'suspended');
  context.resumeGate = deferred();
  const replay = player.play();
  await nextTurn();
  assert.equal(media.paused, true);
  assert.equal(player.getState().isBuffering, true);
  try {
    media.flushOne('pause');
    assert.equal(player.getState().isBuffering, true, 'the current start has not yet resumed its AudioContext');
  } finally {
    context.resumeGate.resolve();
    await nextTurn();
    media.flush();
    await replay;
  }
  assert.equal(player.getState().isPlaying, true);
  assert.equal(player.getState().isBuffering, false);
  player.pause();
  media.flush();
});

test('a station selected during loading plays only the replacement track and ignores an old ended event', async () => {
  const { media, player, context, visitorStore } = await fixture('change-station-during-start');
  context.state = 'suspended';
  context.resumeGate = deferred();
  const previous = player.play();
  await nextTurn();
  assert.equal(player.getState().isBuffering, true);
  assert.equal(media.playCalls, 0);
  media.queue('ended');
  player.setStop('02', true);
  context.resumeGate.resolve();
  await previous;
  await nextTurn();
  assert.equal(media.src, getMediaResource('02', 'fr').url);
  assert.equal(media.playCalls, 1);
  media.flush();
  await nextTurn();
  assert.equal(player.getState().currentStopId, '02');
  assert.equal(player.getState().isPlaying, true);
  assert.equal(visitorStore.getSnapshot().lastPlayback, undefined);
  player.pause();
  media.flush();
});

test('hiding an active tab flushes its real position and returning to a paused tab does not start it', async () => {
  const { media, player, start, visitorStore, documentEvents, writes } = await fixture('visibility-checkpoint');
  await start();
  media.currentTime = 8.25;
  media.playedRanges = [[0, 8.25]];
  documentEvents.hidden = true;
  documentEvents.dispatchEvent(new Event('visibilitychange'));
  assert.equal(visitorStore.getSnapshot().lastPlayback?.positionSeconds, 8.25);
  assert.equal(writes(), 1);

  media.pause();
  media.flush();
  documentEvents.hidden = false;
  documentEvents.dispatchEvent(new Event('visibilitychange'));
  assert.equal(media.playCalls, 1);
  assert.equal(player.getState().isPlaying, false);
  assert.equal(writes(), 1);
});

test('a natural end after discontinuous listening remains completed when the station is replayed', async (context) => {
  let now = 1000;
  context.mock.method(Date, 'now', () => now);
  const { media, player, start, visitorStore } = await fixture('complete-and-replay');
  const duration = getMediaResource('01', 'fr').durationSeconds;
  media.duration = duration;
  await start();
  media.currentTime = duration;
  media.playedRanges = [[0, duration / 2], [duration * 0.55, duration]];
  media.ended = true;
  media.paused = true;
  media.queue('pause');
  media.queue('ended');
  now = 1500;
  media.flush();
  await nextTurn();
  media.flush();
  assert.equal(player.getState().currentStopId, '02');
  assert.equal(visitorStore.getSnapshot().pieces['01'].listening.fr?.completedAt, 1500);

  player.setStop('01', false);
  await start();
  now = 2000;
  media.currentTime = 3;
  media.playedRanges = [[0, 3]];
  player.pause();
  media.flush();
  const replayed = visitorStore.getSnapshot().pieces['01'].listening.fr;
  assert.equal(replayed?.completedAt, 1500);
  assert.equal(replayed?.positionSeconds, 3);
  assert.deepEqual(replayed?.heardRanges, [[0, duration / 2], [duration * 0.55, duration]]);
});

test('play-pause-play during a pending resume obeys only the latest play request', async () => {
  const { media, player, context } = await fixture('pending-resume-latest-play');
  context.state = 'suspended';
  context.resumeGate = deferred();
  const original = player.play();
  await nextTurn();
  player.pause();
  const latest = player.play();
  await nextTurn();
  assert.equal(context.resumeCalls, 1);
  assert.equal(media.playCalls, 0);
  assert.equal(context.gains[0].gain.value, 0);
  context.resumeGate.resolve();
  await nextTurn();
  media.flush();
  await Promise.all([original, latest]);
  await nextTurn();
  assert.equal(media.playCalls, 1);
  assert.equal(player.getState().isPlaying, true);
  assert.equal(context.state, 'running');
  assert.equal(context.gains[0].gain.value, 1);
  player.pause();
  media.flush();
});

test('two rapid toggle presses cancel a pending start instead of starting after the second press', async () => {
  const { media, player, context } = await fixture('toggle-pending-start');
  context.state = 'suspended';
  context.resumeGate = deferred();
  player.togglePlayPause();
  await nextTurn();
  assert.equal(context.resumeCalls, 1);
  assert.equal(player.getState().isPlaying, false);
  player.togglePlayPause();
  context.resumeGate.resolve();
  await nextTurn();
  media.flush();
  await nextTurn();
  try {
    assert.equal(media.playCalls, 0);
    assert.equal(media.paused, true);
    assert.equal(player.getState().isPlaying, false);
    assert.equal(context.gains[0].gain.value, 0);
  } finally {
    player.pause();
    media.flush();
  }
});

test('a failed context resume leaves the output silent and does not poison a later retry', async () => {
  const { media, player, context, start } = await fixture('resume-error-retry');
  context.state = 'suspended';
  context.resumeGate = deferred();
  const pending = player.play();
  await nextTurn();
  context.resumeGate.reject(new DOMException('Context unavailable', 'NotAllowedError'));
  await pending;
  await nextTurn();
  assert.equal(player.getState().isPlaying, false);
  assert.equal(player.getState().error, 'playback');
  assert.equal(media.paused, true);
  assert.equal(context.gains[0].gain.value, 0);
  context.resumeGate = null;
  await start();
  assert.equal(player.getState().isPlaying, true);
  assert.equal(player.getState().error, null);
  assert.equal(context.gains[0].gain.value, 1);
  player.pause();
  media.flush();
});

test('a queued old end event after a station switch cannot start another station', async () => {
  const { media, player, start } = await fixture('stale-ended');
  await start();
  media.currentTime = media.duration;
  media.ended = true;
  media.queue('ended');
  player.setStop('02', false);
  media.flushOne('ended');
  assert.equal(player.getState().currentStopId, '02');
  assert.equal(player.getState().isPlaying, false);
  assert.equal(media.src, getMediaResource('02', 'fr').url);
  assert.equal(media.paused, true);
  media.flush();
});

test('resume keeps the exact position, skips, speed, shared media and legitimate auto-advance', async () => {
  const { media, player, frames, start, instances } = await fixture('resume-navigation');
  await start();
  media.currentTime = 45.553;
  player.pause();
  media.flush();
  await start();
  assert.equal(media.currentTime, 45.553);
  assert.equal(frames.size, 1);
  player.forward(15);
  assert.equal(media.currentTime, 60.553);
  player.rewind(15);
  assert.equal(media.currentTime, 45.553);
  player.cyclePlaybackRate();
  assert.equal(media.playbackRate, 1.25);
  player.cyclePlaybackRate();
  assert.equal(media.playbackRate, 0.8);
  player.cyclePlaybackRate();
  assert.equal(media.playbackRate, 1);
  media.currentTime = media.duration;
  media.paused = true;
  media.ended = true;
  media.queue('timeupdate');
  media.queue('pause');
  media.queue('ended');
  media.flush();
  await nextTurn();
  media.flush();
  assert.equal(player.getState().currentStopId, '02');
  assert.equal(player.getState().isPlaying, true);
  player.prevStop();
  await nextTurn();
  media.flush();
  assert.equal(player.getState().currentStopId, '01');
  assert.equal(media.currentTime, 0);
  assert.equal(instances(), 1);
  player.pause();
  media.flush();
});

test('played checkpoints are throttled independently of animation frames and pause flushes the precise time', async (t) => {
  let now = 10000;
  t.mock.method(Date, 'now', () => now);
  const { media, player, frames, start, visitorStore, writes } = await fixture('checkpoint-throttle');
  await start();
  assert.equal(media.crossOrigin, 'anonymous');
  assert.equal(writes(), 0, 'merely pressing Play must not invent a heard interval');
  for (let index = 1; index <= 60; index += 1) {
    now = 10000 + index * 50;
    media.currentTime = index / 20;
    media.playedRanges = [[0, media.currentTime]];
    const [id, callback] = frames.entries().next().value!;
    frames.delete(id);
    callback(index * 50);
    media.dispatchEvent(new Event('timeupdate'));
  }
  assert.equal(writes(), 0, 'frame notifications and frequent timeupdate events cannot cause storage writes');
  now = 15001;
  media.currentTime = 12;
  media.playedRanges = [[0, 12]];
  media.dispatchEvent(new Event('timeupdate'));
  assert.equal(writes(), 1);
  media.currentTime = 13.123;
  media.playedRanges = [[0, 13.123]];
  player.pause();
  assert.equal(writes(), 2);
  assert.equal(visitorStore.getSnapshot().lastPlayback?.positionSeconds, 13.123);
  assert.deepEqual(visitorStore.getSnapshot().pieces['01'].listening.fr?.heardRanges, [[0, 13.123]]);
  media.flush();
  player.flushCheckpoint();
  assert.equal(writes(), 2, 'delayed pause and identical flushes are deduplicated');
});

test('restoring an exact audio checkpoint stays paused and cannot replace active playback', async () => {
  const resource = getMediaResource('02', 'fr');
  const seed = JSON.stringify({ version: 2, pieces: {}, lastPlayback: { id: '02', language: 'fr', audioIdentity: resource.sha256, durationSeconds: resource.durationSeconds, positionSeconds: 24.123, updatedAt: 100 } });
  const { media, player, visitorStore, writes, start } = await fixture('checkpoint-restore', { dday_visitor_state_v2: seed }, '?hl=invalid');
  assert.equal(player.getState().currentStopId, '02');
  assert.equal(player.getState().currentTime, 24.123);
  assert.equal(media.playCalls, 0);
  assert.equal(writes(), 0, 'initialization is read-only');
  media.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(media.currentTime, 24.123);
  player.setStop('01', false);
  assert.equal(player.restoreLastPlayback(), true);
  assert.equal(player.getState().currentStopId, '02');
  assert.equal(media.currentTime, 24.123);
  assert.equal(media.playCalls, 0);
  await start();
  visitorStore.capturePlayback({ id: '03', language: 'fr', positionSeconds: 8, durationSeconds: 100, audioIdentity: getMediaResource('03', 'fr').sha256, playedRanges: [[0, 8]] });
  assert.equal(player.restoreLastPlayback(), false);
  assert.equal(player.getState().currentStopId, '02');
  player.pause();
  media.flush();
});

test('a direct language link selects its first audio source without reusing the previous language position', async () => {
  const resource = getMediaResource('02', 'fr');
  const seed = JSON.stringify({ version: 2, pieces: {}, lastPlayback: { id: '02', language: 'fr', audioIdentity: resource.sha256, durationSeconds: resource.durationSeconds, positionSeconds: 24.123, updatedAt: 100 } });
  const { media, player, visitorStore, writes } = await fixture('startup-link-language', { dday_visitor_state_v2: seed }, '?hl=en');

  assert.deepEqual(media.sourceAssignments, [getMediaResource('02', 'en').url]);
  assert.equal(player.getState().language, 'en');
  assert.equal(player.getState().currentStopId, '02');
  assert.equal(player.getState().currentTime, 0);
  assert.equal(media.playCalls, 0);
  assert.equal(visitorStore.getSnapshot().lastPlayback?.positionSeconds, 24.123);
  assert.equal(storedValues.get('dday_lang'), 'en');
  assert.equal(writes(), 1, 'only the language preference is persisted');
});

test('a changed audio hash cannot restore a stale position and unavailable recordings cannot start', async () => {
  const seed = JSON.stringify({ version: 2, pieces: {}, lastPlayback: { id: '02', language: 'fr', audioIdentity: 'old-sha', durationSeconds: 100, positionSeconds: 55, updatedAt: 100 } });
  const { media, player } = await fixture('checkpoint-hash-and-unavailable', { dday_visitor_state_v2: seed }, '', ['nl:22', 'it:21']);
  assert.equal(player.getState().currentStopId, '01');
  assert.equal(player.getState().currentTime, 0);
  assert.equal(player.restoreLastPlayback(), false);
  player.setStop('22', false);
  player.setLanguage('nl');
  await player.play();
  assert.equal(media.playCalls, 0);
  assert.equal(player.getState().error, 'unavailable');
  player.setStop('21', false);
  player.setLanguage('it');
  await player.play();
  assert.equal(media.playCalls, 0);
  assert.equal(player.getState().error, 'unavailable');
});

test('restored French 22 uses the shared player with its new audio identity and real duration', async () => {
  const { media, player, start, instances } = await fixture('restored-french-22');
  player.setStop('21', false);
  player.setStop('22', false);
  const restored = getMediaResource('22', 'fr');
  assert.equal(restored.status, 'ready');
  assert.equal(media.src, restored.url);
  media.duration = restored.durationSeconds;
  media.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(player.getState().duration, 142.0623);
  await start();
  assert.equal(player.getState().isPlaying, true);
  player.seek(131.25);
  assert.equal(media.currentTime, 131.25);
  player.pause();
  media.flush();
  player.setStop('21', false);
  assert.equal(media.src, getMediaResource('21', 'fr').url);
  assert.equal(instances(), 1, 'station navigation preserves the shared audio element');
});

test('changing a playing narration language starts its own clock at zero and preserves the previous listening record', async () => {
  const { media, player, visitorStore, start, instances } = await fixture('language-independent-clock');
  player.setStop('21', false);
  const french = getMediaResource('21', 'fr');
  const english = getMediaResource('21', 'en');
  assert.notEqual(french.durationSeconds, english.durationSeconds);
  media.duration = french.durationSeconds;
  media.dispatchEvent(new Event('loadedmetadata'));
  await start();
  media.currentTime = 90.375;
  media.playedRanges = [[0, 90.375]];
  media.dispatchEvent(new Event('timeupdate'));

  player.setLanguage('en');
  assert.equal(player.getState().currentStopId, '21');
  assert.equal(player.getState().currentTime, 0);
  assert.equal(media.currentTime, 0);
  assert.equal(media.src, english.url);
  assert.equal(player.getState().duration, english.durationSeconds);
  assert.deepEqual(visitorStore.getSnapshot().pieces['21'].listening.fr?.heardRanges, [[0, 90.375]]);
  assert.equal(visitorStore.getSnapshot().pieces['21'].listening.fr?.positionSeconds, 90.375);
  assert.equal(visitorStore.getSnapshot().pieces['21'].listening.en, undefined, 'switching cannot invent English listening');

  media.duration = english.durationSeconds;
  media.dispatchEvent(new Event('loadedmetadata'));
  await nextTurn();
  media.flush();
  assert.equal(player.getState().isPlaying, true, 'an explicitly changed language preserves active playback');
  assert.equal(media.currentTime, 0);
  media.currentTime = 6.25;
  media.playedRanges = [[0, 6.25]];
  player.pause();
  media.flush();
  assert.deepEqual(visitorStore.getSnapshot().pieces['21'].listening.en?.heardRanges, [[0, 6.25]]);
  assert.deepEqual(visitorStore.getSnapshot().pieces['21'].listening.fr?.heardRanges, [[0, 90.375]]);
  assert.equal(instances(), 1);
});

test('changing a paused language stays paused and does not seek the new narration to the old position', async () => {
  const { media, player, visitorStore } = await fixture('language-paused');
  player.setStop('21', false);
  player.seek(170.125);
  player.setLanguage('en');
  assert.equal(player.getState().currentStopId, '21');
  assert.equal(player.getState().language, 'en');
  assert.equal(player.getState().currentTime, 0);
  assert.equal(media.currentTime, 0);
  assert.equal(player.getState().isPlaying, false);
  assert.equal(media.playCalls, 0);
  assert.deepEqual(visitorStore.getSnapshot().pieces, {}, 'a paused seek or language change cannot create listening');
  assert.equal(storedValues.get('dday_lang'), 'en');
});

test('switching a playing narration to an unavailable language resets the clock and cannot autoplay its placeholder', async () => {
  const { media, player, visitorStore, start } = await fixture('language-unavailable', {}, '', ['it:21']);
  player.setStop('21', false);
  media.duration = getMediaResource('21', 'fr').durationSeconds;
  media.dispatchEvent(new Event('loadedmetadata'));
  await start();
  media.currentTime = 170.125;
  media.playedRanges = [[0, 170.125]];
  media.dispatchEvent(new Event('timeupdate'));
  const calls = media.playCalls;
  player.setLanguage('it');
  media.flush();
  await nextTurn();
  assert.equal(player.getState().currentStopId, '21');
  assert.equal(player.getState().language, 'it');
  assert.equal(player.getState().currentTime, 0);
  assert.equal(media.currentTime, 0);
  assert.equal(player.getState().isPlaying, false);
  assert.equal(media.paused, true);
  assert.equal(media.playCalls, calls);
  assert.equal(media.src, '');
  assert.equal(media.loadCalls, 1, 'resetting the media element releases the old recording');
  assert.equal(player.getState().duration, 0);
  assert.deepEqual(visitorStore.getSnapshot().pieces['21'].listening.fr?.heardRanges, [[0, 170.125]]);
  assert.equal(visitorStore.getSnapshot().pieces['21'].listening.it, undefined);
  await player.play();
  assert.equal(media.playCalls, calls, 'the explicit play guard also remains active');
  assert.equal(player.getState().error, 'unavailable');
});

test('an unavailable language at startup has no media source and can switch to a real recording', async () => {
  const resource = getMediaResource('21', 'fr');
  const checkpoint = JSON.stringify({ version: 2, pieces: {}, lastPlayback: { id: '21', language: 'fr', audioIdentity: resource.sha256, durationSeconds: resource.durationSeconds, positionSeconds: 1, updatedAt: 100 } });
  const { media, player, start, instances } = await fixture('startup-no-placeholder', { dday_visitor_state_v2: checkpoint }, '?hl=it', ['it:21']);
  assert.equal(player.getState().currentStopId, '21');
  assert.equal(media.src, '');
  assert.equal(media.loadCalls, 0, 'an empty element needs no reset');
  assert.equal(player.getState().duration, 0);
  await player.play();
  assert.equal(media.playCalls, 0);

  player.setLanguage('fr');
  assert.equal(media.src, resource.url);
  await start();
  assert.equal(player.getState().isPlaying, true);
  assert.equal(instances(), 1);
});

test('a seek directly to the end cannot complete even an otherwise fully heard recording', async () => {
  const { media, player, visitorStore, start } = await fixture('seek-end-with-old-ranges');
  await start();
  media.duration = getMediaResource('01', 'fr').durationSeconds;
  media.playedRanges = [[0, media.duration]];
  media.currentTime = media.duration - 1;
  media.dispatchEvent(new Event('timeupdate'));
  player.seek(media.duration);
  media.paused = true;
  media.ended = true;
  media.queue('pause');
  media.queue('ended');
  media.flush();
  assert.equal(visitorStore.getSnapshot().pieces['01'].listening.fr?.completedAt, undefined);
  await nextTurn();
  media.flush();
  player.pause();
  media.flush();
});

test('playback speed and voice boost survive reload without autoplay or loss of unknown preferences', async () => {
  const preferenceKey = 'dday-audio-preferences-v1';
  const { player, media, writes } = await fixture('preferences-save', { [preferenceKey]: JSON.stringify({ version: 1, authorAddition: { preserve: true } }) });
  assert.equal(writes(), 0);
  player.cyclePlaybackRate();
  player.toggleVoiceBoost();
  const saved = storedValues.get(preferenceKey)!;
  assert.deepEqual(JSON.parse(saved), { version: 1, authorAddition: { preserve: true }, playbackRate: 1.25, isVoiceBoostActive: false });
  assert.equal(media.playCalls, 0);
  const reloaded = await fixture('preferences-reload', { [preferenceKey]: saved });
  assert.equal(reloaded.player.getState().playbackRate, 1.25);
  assert.equal(reloaded.player.getState().isVoiceBoostActive, false);
  assert.equal(reloaded.media.playbackRate, 1.25);
  assert.equal(reloaded.media.playCalls, 0);
  assert.equal(reloaded.writes(), 0, 'reading preferences must never overwrite them');
  await reloaded.start();
  assert.equal(reloaded.context.gains[0].gain.value, 1, 'restoring voice settings preserves the output gate');
  reloaded.player.pause();
  reloaded.media.flush();
});

test('audio preferences validate their values and protect unreadable or future formats', async () => {
  const preferenceKey = 'dday-audio-preferences-v1';
  const invalid = await fixture('preferences-invalid-values', { [preferenceKey]: JSON.stringify({ version: 1, playbackRate: 100, isVoiceBoostActive: 'false', addition: 'keep' }) });
  assert.equal(invalid.player.getState().playbackRate, 1);
  assert.equal(invalid.player.getState().isVoiceBoostActive, true);
  invalid.player.cyclePlaybackRate();
  assert.equal(JSON.parse(storedValues.get(preferenceKey)!).addition, 'keep');
  for (const [index, raw] of ['broken JSON', JSON.stringify({ version: 2, future: true })].entries()) {
    const protectedPreferences = await fixture(`preferences-protected-${index}`, { [preferenceKey]: raw });
    protectedPreferences.player.cyclePlaybackRate();
    protectedPreferences.player.toggleVoiceBoost();
    assert.equal(storedValues.get(preferenceKey), raw);
    assert.equal(protectedPreferences.player.getState().playbackRate, 1.25);
    assert.equal(protectedPreferences.player.getState().isVoiceBoostActive, false);
  }
});

test('a paused seek after restoration saves only position and never creates listening for an unheard station', async () => {
  const resource = getMediaResource('02', 'fr');
  const record = { audioIdentity: resource.sha256, durationSeconds: resource.durationSeconds, positionSeconds: 24.123, heardRanges: [[0, 24.123]], updatedAt: 100 };
  const seed = JSON.stringify({ version: 2, pieces: { '02': { consulted: false, listening: { fr: record } } }, lastListenedId: '02', lastPlayback: { id: '02', language: 'fr', ...record } });
  const { media, player, visitorStore, writes } = await fixture('paused-restored-seek', { dday_visitor_state_v2: seed });
  media.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(writes(), 0, 'restoration alone is read-only');
  assert.equal(media.currentTime, 24.123);
  player.seek(38.567);
  player.flushCheckpoint();
  const saved = visitorStore.getSnapshot();
  assert.equal(saved.lastPlayback?.positionSeconds, 38.567);
  assert.equal(saved.lastListenedId, '02');
  assert.deepEqual(saved.pieces['02'].listening.fr?.heardRanges, record.heardRanges);
  assert.equal(saved.pieces['02'].listening.fr?.completedAt, undefined);
  assert.equal(media.playCalls, 0);
  const disk = storedValues.get('dday_visitor_state_v2')!;
  const reloaded = await fixture('paused-restored-seek-reload', { dday_visitor_state_v2: disk });
  reloaded.media.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(reloaded.media.currentTime, 38.567);
  assert.equal(reloaded.writes(), 0);
  reloaded.player.setStop('03', false);
  reloaded.player.seek(20);
  reloaded.player.flushCheckpoint();
  assert.equal(reloaded.visitorStore.getSnapshot().lastPlayback?.id, '02');
  assert.equal(reloaded.visitorStore.getSnapshot().lastListenedId, '02');
  assert.equal(reloaded.visitorStore.getSnapshot().pieces['03'], undefined);
});

test('reopening a heard station without playing preserves its saved position for explicit resume', async () => {
  const { media, player, visitorStore, start } = await fixture('reopen-without-playing');
  await start();
  media.currentTime = 24.123;
  media.playedRanges = [[0, 24.123]];
  player.pause();
  media.flush();

  player.setStop('02', false);
  player.setStop('01', false);
  media.dispatchEvent(new Event('loadedmetadata'));
  media.dispatchEvent(new Event('timeupdate'));
  player.flushCheckpoint();

  assert.equal(player.getState().currentTime, 0);
  assert.equal(visitorStore.getSnapshot().lastPlayback?.positionSeconds, 24.123);
  await start();
  player.pause();
  media.flush();
  assert.equal(visitorStore.getSnapshot().lastPlayback?.positionSeconds, 24.123);
  assert.equal(player.restoreLastPlayback(), true);
  assert.equal(media.currentTime, 24.123);
});

test('events before metadata preserve the pending resume position and checkpoint', async () => {
  const resource = getMediaResource('02', 'fr');
  const record = { audioIdentity: resource.sha256, durationSeconds: resource.durationSeconds, positionSeconds: 24.123, heardRanges: [[0, 24.123]], updatedAt: 100 };
  const seed = JSON.stringify({ version: 2, pieces: { '02': { consulted: false, listening: { fr: record } } }, lastListenedId: '02', lastPlayback: { id: '02', language: 'fr', ...record } });
  const { media, player, visitorStore, writes } = await fixture('resume-before-metadata', { dday_visitor_state_v2: seed });
  media.readyState = 0;
  media.duration = NaN;
  const pending = player.play();
  await nextTurn();
  media.flushOne('play');
  media.dispatchEvent(new Event('timeupdate'));
  player.pause();
  media.flush();
  await pending;

  assert.equal(player.getState().currentTime, 24.123);
  assert.equal(visitorStore.getSnapshot().lastPlayback?.positionSeconds, 24.123);
  assert.equal(writes(), 0);
  media.readyState = 1;
  media.duration = resource.durationSeconds;
  media.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(media.currentTime, 24.123);
  assert.equal(player.getState().isPlaying, false);
});
