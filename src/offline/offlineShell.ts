export const OFFLINE_SHELL_MESSAGE = 'DDAY_OFFLINE_SHELL_CHECK_V1';
export const OFFLINE_SHELL_REVISION_META = 'dday-offline-shell-revision';

type ShellServiceWorkers = Pick<ServiceWorkerContainer, 'controller' | 'getRegistration'>;

function requestShellStatus(worker: ServiceWorker, revision: string, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    const finish = (ready: boolean) => {
      clearTimeout(timer);
      channel.port1.close();
      channel.port2.close();
      resolve(ready);
    };
    const timer = setTimeout(() => finish(false), timeoutMs);
    channel.port1.onmessage = ({ data }) => {
      finish(data?.type === OFFLINE_SHELL_MESSAGE && data.revision === revision && data.ready === true);
    };
    channel.port1.onmessageerror = () => finish(false);
    try { worker.postMessage({ type: OFFLINE_SHELL_MESSAGE, revision }, [channel.port2]); }
    catch { finish(false); }
  });
}

export async function hasActiveOfflineShell(workers: ShellServiceWorkers, revision: string, timeoutMs = 1_500): Promise<boolean> {
  if (!revision || typeof MessageChannel === 'undefined') return false;
  try {
    // Retry once if the page gets a new controller during an inspection.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = workers.controller;
      const registration = await workers.getRegistration();
      if (workers.controller !== controller) continue;
      if (!controller || controller !== registration?.active || controller.state !== 'activated') return false;
      const ready = await requestShellStatus(controller, revision, timeoutMs);
      if (workers.controller === controller) return ready && registration.active === controller && controller.state === 'activated';
    }
  } catch { /* A failed check leaves the pack status independent of the shell. */ }
  return false;
}

export function checkOfflineShell(): Promise<boolean> {
  const revision = globalThis.document?.querySelector<HTMLMetaElement>(`meta[name="${OFFLINE_SHELL_REVISION_META}"]`)?.content;
  const workers = globalThis.navigator?.serviceWorker;
  return revision && workers ? hasActiveOfflineShell(workers, revision) : Promise.resolve(false);
}
