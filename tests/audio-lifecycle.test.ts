import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';

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
  readyState = 1;
  paused = true;
  ended = false;
  muted = false;
  volume = 1;
  error: object | null = null;
  playCalls = 0;
  pauseCalls = 0;
  private source = '';
  private tasks: { type: string; action?: () => void }[] = [];
  private pendingPlays: ReturnType<typeof deferred>[] = [];

  get src() { return this.source; }
  set src(value: string) {
    this.source = value;
    this.currentTime = 0;
    this.paused = true;
    this.ended = false;
  }

  play() {
    this.playCalls += 1;
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

async function fixture(name: string) {
  const media = new MediaMock();
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
    createMediaElementSource: () => new NodeMock(),
    createBiquadFilter: () => new NodeMock(),
    createGain() { const gain = new NodeMock(); this.gains.push(gain); return gain; },
    async resume() { this.resumeCalls += 1; await this.resumeGate?.promise; this.state = 'running'; },
    async suspend() { this.suspendCalls += 1; await this.suspendGate?.promise; this.state = 'suspended'; },
  };
  Object.defineProperties(globalThis, {
    Audio: { configurable: true, value: class { constructor() { instances += 1; return media; } } },
    window: { configurable: true, value: {
      requestAnimationFrame: (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; },
      cancelAnimationFrame: (id: number) => frames.delete(id),
      AudioContext: class { constructor() { return context; } },
    } },
    localStorage: { configurable: true, value: { getItem: () => 'fr', setItem: () => {} } },
  });
  const url = new URL('../src/audio/audioStore.ts', import.meta.url);
  url.searchParams.set('lifecycle', name);
  const { audioPlayer: player } = await import(url.href) as typeof import('../src/audio/audioStore');
  const start = async () => {
    const pending = player.play();
    await nextTurn();
    media.flush();
    await pending;
  };
  return { media, player, frames, context, start, instances: () => instances };
}

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
  assert.equal(media.src, '/audio/fr/stop-02.mp3');
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
