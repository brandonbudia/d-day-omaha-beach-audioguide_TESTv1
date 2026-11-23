import assert from 'node:assert/strict';
import test from 'node:test';
import { observePendingPWAUpdate } from '../src/hooks/usePWAUpdate';

class Worker extends EventTarget {
  constructor(public state: ServiceWorkerState) { super(); }
  transition(state: ServiceWorkerState) {
    this.state = state;
    this.dispatchEvent(new Event('statechange'));
  }
  postMessage() { assert.fail('a passive update observer must never message the worker'); }
}

class Registration extends EventTarget {
  active: Worker | null = null;
  installing: Worker | null = null;
  waiting: Worker | null = null;

  install(worker: Worker) {
    this.installing = worker;
    this.dispatchEvent(new Event('updatefound'));
  }
  waitForActivation(worker: Worker) {
    this.installing = null;
    this.waiting = worker;
    worker.transition('installed');
  }
  activate(worker: Worker) {
    this.waiting = null;
    this.active = worker;
    worker.transition('activated');
  }
  update() { assert.fail('the observer must leave update scheduling to the browser'); }
}

class WorkerContainer extends EventTarget {
  constructor(
    private readonly registration: () => Promise<Registration | undefined>,
    public readonly ready: Promise<Registration>,
  ) { super(); }
  getRegistration() { return this.registration(); }
}

function watch(container: WorkerContainer, updates: boolean[]) {
  return observePendingPWAUpdate(container as unknown as ServiceWorkerContainer, (waiting) => updates.push(waiting));
}

function flushEvents() { return new Promise<void>((resolve) => { setImmediate(resolve); }); }

test('passive update notices follow a waiting replacement across tabs without acting on the worker', async () => {
  const registration = new Registration();
  const initial = new Worker('installing');
  const next = new Worker('installing');
  const firstTab = new WorkerContainer(async () => registration, Promise.resolve(registration));
  const secondTab = new WorkerContainer(async () => registration, Promise.resolve(registration));
  const firstNotice: boolean[] = [], secondNotice: boolean[] = [];
  const stopFirst = watch(firstTab, firstNotice);
  await flushEvents();

  registration.install(initial);
  registration.waitForActivation(initial);
  assert.deepEqual(firstNotice, [], 'there is no update notice on the first installation');
  registration.activate(initial);
  registration.install(next);
  assert.deepEqual(firstNotice, [], 'a new worker still installing is not ready');
  registration.waitForActivation(next);
  assert.deepEqual(firstNotice, [true]);
  assert.equal(registration.active, initial);

  const stopSecond = watch(secondTab, secondNotice);
  await flushEvents();
  assert.deepEqual(secondNotice, [true], 'an already waiting worker is discovered by a newly opened tab');
  stopFirst();
  registration.activate(next);
  secondTab.dispatchEvent(new Event('controllerchange'));
  await flushEvents();
  assert.deepEqual(firstNotice, [true], 'closed tabs stop observing');
  assert.deepEqual(secondNotice, [true, false]);
  stopSecond();
});

test('observation attaches when registration becomes ready and discards a late stale result', async () => {
  const registration = new Registration();
  registration.active = new Worker('activated');
  registration.waitForActivation(new Worker('installing'));
  let finishInitialRead: (registration: Registration | undefined) => void;
  let finishReady: (registration: Registration) => void;
  const initialRead = new Promise<Registration | undefined>((resolve) => { finishInitialRead = resolve; });
  const ready = new Promise<Registration>((resolve) => { finishReady = resolve; });
  const container = new WorkerContainer(() => initialRead, ready);
  const notices: boolean[] = [];
  const stop = watch(container, notices);
  finishReady!(registration);
  await flushEvents();
  finishInitialRead!(undefined);
  await flushEvents();
  assert.deepEqual(notices, [true]);
  stop();
});
