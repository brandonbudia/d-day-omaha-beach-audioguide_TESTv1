import { useEffect, useState } from 'react';

type UpdateServiceWorkers = Pick<ServiceWorkerContainer, 'getRegistration' | 'ready' | 'addEventListener' | 'removeEventListener'>;

export function observePendingPWAUpdate(workers: UpdateServiceWorkers, onChange: (waiting: boolean) => void): () => void {
  let registration: ServiceWorkerRegistration | undefined;
  let watched = new Set<ServiceWorker>();
  let reported = false;
  let stopped = false;
  let registrationRead = 0;

  function readState() {
    if (stopped) return;
    const installing = registration?.installing;
    const waiting = registration?.waiting;
    const next = new Set<ServiceWorker>();
    if (installing) next.add(installing);
    if (waiting) next.add(waiting);
    for (const worker of watched) {
      if (!next.has(worker)) worker.removeEventListener('statechange', readState);
    }
    for (const worker of next) {
      if (!watched.has(worker)) worker.addEventListener('statechange', readState);
    }
    watched = next;
    const available = registration?.active?.state === 'activated' && waiting?.state === 'installed';
    if (available === reported) return;
    reported = available;
    onChange(available);
  }

  function bind(next: ServiceWorkerRegistration | undefined) {
    if (stopped) return;
    if (registration !== next) {
      registration?.removeEventListener('updatefound', readState);
      registration = next;
      registration?.addEventListener('updatefound', readState);
    }
    readState();
  }

  const readRegistration = () => {
    const read = ++registrationRead;
    void workers.getRegistration().then((next) => {
      if (read === registrationRead) bind(next);
    }, () => {});
  };
  workers.addEventListener('controllerchange', readRegistration);
  readRegistration();
  void workers.ready.then((active) => {
    if (!registration && !stopped) {
      registrationRead += 1;
      bind(active);
    }
  }, () => {});

  return () => {
    stopped = true;
    workers.removeEventListener('controllerchange', readRegistration);
    registration?.removeEventListener('updatefound', readState);
    for (const worker of watched) worker.removeEventListener('statechange', readState);
  };
}

export function usePWAUpdate(): boolean {
  const [waiting, setWaiting] = useState(false);
  useEffect(() => {
    const workers = navigator.serviceWorker;
    if (workers) return observePendingPWAUpdate(workers, setWaiting);
  }, []);
  return waiting;
}
