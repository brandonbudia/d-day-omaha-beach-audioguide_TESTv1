(metadata) => {
  // Cache naming and revision keys match the generated Workbox 7 precache.
  const cacheName = `workbox-precache-v2-${self.registration.scope}`;
  const keys = metadata.entries.map(({ url, revision }) => {
    const key = new URL(url, self.location.href);
    if (revision) key.searchParams.set('__WB_REVISION__', revision);
    return key.href;
  });

  async function isShellReady() {
    if (!metadata.complete || !keys.length) return false;
    const matches = await Promise.all(keys.map((key) => self.caches.match(key, { cacheName })));
    if (!matches.every((response) => response?.status === 200)) return false;
    const index = matches[metadata.entries.findIndex(({ url }) => url === 'index.html')];
    const html = await index?.text();
    return html?.includes(`name="${metadata.metaName}" content="${metadata.revision}"`) ?? false;
  }

  self.addEventListener('message', (event) => {
    const port = event.ports[0];
    if (!port || event.data?.type !== metadata.type) return;
    const ready = event.data.revision === metadata.revision ? isShellReady().catch(() => false) : Promise.resolve(false);
    event.waitUntil(ready.then((value) => port.postMessage({ type: metadata.type, revision: metadata.revision, ready: value })));
  });
}
