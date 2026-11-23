import assert from 'node:assert/strict';
import { until } from './chrome.mjs';

export function recordAudio() {
  const results = [];
  window.__ddayFixtureAudio = results;
  window.Audio = new Proxy(window.Audio, {
    construct(Original, args) {
      const audio = Reflect.construct(Original, args);
      results.push(audio);
      return audio;
    },
  });
}

export function audioSample() {
  const audio = window.__ddayFixtureAudio.find((item) => item.currentSrc.includes('/audio/fr/stop-10.mp3'));
  return audio && {
    src: audio.currentSrc, time: audio.currentTime, paused: audio.paused, ready: audio.readyState,
    error: audio.error?.code ?? null, decoded: audio.webkitAudioDecodedByteCount ?? 0,
  };
}

export async function readFrenchPack() {
  const cache = await caches.open('dday-verified-media-v1');
  const entries = await cache.keys();
  const audio = await Promise.all(entries.filter((entry) => new URL(entry.url).pathname.startsWith('/audio/fr/')).map(async (entry) => {
    const response = await cache.match(entry);
    const data = await response.arrayBuffer();
    const hash = await crypto.subtle.digest('SHA-256', data);
    const sha256 = Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
    const url = new URL(entry.url);
    return { url: url.pathname + url.search, bytes: data.byteLength, sha256, header: response.headers.get('x-dday-verified-sha256') };
  }));
  return { entries: entries.map(({ url }) => url).sort(), audio: audio.sort((a, b) => a.url.localeCompare(b.url)) };
}

export async function offlineProof(tab, path) {
  const probe = await tab.evaluate(async (path) => {
    const url = `${path}?id=${crypto.randomUUID()}`;
    const status = await fetch(url, { method: 'POST', cache: 'no-store' }).then((response) => response.status, () => null);
    return { url: new URL(url, location.origin).href, status, online: navigator.onLine };
  }, path);
  assert.equal(probe.status, null, 'La requête POST indépendante doit échouer.');
  assert.equal(probe.online, false);
  const request = tab.events.find(({ type, data }) => type === 'Network.requestWillBeSent' && data.request.url === probe.url);
  assert(request, 'Chrome doit relever la tentative réseau de contrôle.');
  const failure = await until(() => tab.events.find(({ type, data }) => type === 'Network.loadingFailed' && data.requestId === request.data.requestId), 'Échec réseau CDP attendu');
  assert.equal(failure.data.errorText, 'net::ERR_INTERNET_DISCONNECTED');
  return failure.data.errorText;
}
