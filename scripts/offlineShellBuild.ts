import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import type { GenerateSWOptions, ManifestTransform } from 'workbox-build';
import { SHARED_OFFLINE_RESOURCES } from '../src/data/mediaCatalog';
import { OFFLINE_SHELL_MESSAGE, OFFLINE_SHELL_REVISION_META } from '../src/offline/offlineShell';

const sharedFiles = SHARED_OFFLINE_RESOURCES.map(({ url }) => url.slice(1));
const hash = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');

export function createOfflineShellBuild() {
  const importScripts: string[] = [];
  let output: { directory: string; publicDirectory: string; workerSource: string };
  let shell: { revision: string; required: string[]; workerFile: string } | undefined;

  const plugin: Plugin = {
    name: 'audioguide-offline-shell',
    apply: 'build',
    async configResolved(config) {
      output = {
        directory: resolve(config.root, config.build.outDir),
        publicDirectory: config.publicDir,
        workerSource: await readFile(resolve(config.root, 'scripts/offlineShellWorker.js'), 'utf8'),
      };
    },
    transformIndexHtml: {
      order: 'post',
      async handler(html, context) {
        if (context.path !== '/index.html' || !context.bundle) return;
        const bundleFiles = Object.keys(context.bundle).filter((file) => /\.(?:m?js|css)$/.test(file));
        const required = ['index.html', ...bundleFiles, ...sharedFiles].sort();
        const sharedRevisions = await Promise.all(sharedFiles.map(async (file) => {
          if (!output.publicDirectory) return null;
          try { return hash(await readFile(resolve(output.publicDirectory, file))); }
          catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
            return null;
          }
        }));
        const revision = hash(JSON.stringify([html, required, sharedRevisions, output.workerSource, OFFLINE_SHELL_MESSAGE]));
        const workerFile = `offline-shell-worker-${revision}.js`;
        shell = { revision, required, workerFile };
        importScripts[0] = `./${workerFile}`;
        return [{ tag: 'meta', attrs: { name: OFFLINE_SHELL_REVISION_META, content: revision }, injectTo: 'head' }];
      },
    },
  };

  // Use Workbox's final revisions for the critical URLs, including hashed chunks
  // with no revision query. The unfiltered build list detects excluded files.
  const attest: ManifestTransform = async (manifest) => {
    if (!shell) return { manifest };
    const keys = new Map(manifest.map(({ url, revision }) => [url, { url, revision }]));
    const entries = shell.required.flatMap((url) => keys.get(url) ?? []);
    const metadata = {
      type: OFFLINE_SHELL_MESSAGE,
      metaName: OFFLINE_SHELL_REVISION_META,
      revision: shell.revision,
      complete: entries.length === shell.required.length,
      entries,
    };
    await writeFile(resolve(output.directory, shell.workerFile), `(${output.workerSource.trim()})(${JSON.stringify(metadata)});\n`);
    return { manifest };
  };

  const workbox: Pick<GenerateSWOptions, 'importScripts' | 'manifestTransforms' | 'globIgnores'> = {
    importScripts,
    manifestTransforms: [attest],
    globIgnores: ['**/node_modules/**/*', 'offline-shell-worker-*.js'],
  };
  return { plugin, workbox };
}
