import { registerHooks } from 'node:module';

// Alternate catalogue lookup for one test module, leaving the real corpus intact.
export async function importWithUnavailableAudio<T>(moduleUrl: URL, recordings: string[]): Promise<T> {
  const catalogueUrl = new URL('../../src/data/mediaCatalog.ts', import.meta.url).href;
  const source = `
    import { getMediaResource as real } from ${JSON.stringify(catalogueUrl)};
    export function getMediaResource(id, language) {
      if (${JSON.stringify(recordings)}.includes(language + ':' + id)) {
        return { ...real(id, language), status: 'unavailable', reason: 'placeholder' };
      }
      return real(id, language);
    }
  `;
  const fixtureUrl = 'data:text/javascript,' + encodeURIComponent(source);
  const hooks = registerHooks({
    resolve(specifier, context, next) {
      if (context.parentURL === moduleUrl.href && specifier === '../data/mediaCatalog') {
        return { url: fixtureUrl, shortCircuit: true };
      }
      return next(specifier, context);
    },
  });
  try {
    return await import(moduleUrl.href);
  } finally {
    hooks.deregister();
  }
}
