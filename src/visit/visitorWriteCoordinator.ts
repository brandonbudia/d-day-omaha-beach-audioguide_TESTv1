export type CoordinateVisitorWrite = (write: () => void) => Promise<void>;

export const VISITOR_COORDINATION_DB = 'dday-visitor-write-coordination-v1';
const GATE_STORE = 'gate';
const ACQUISITION_TIMEOUT_MS = 5_000;

export function createIndexedDBWriteCoordinator(factory: Pick<IDBFactory, 'open'>, timeoutMs = ACQUISITION_TIMEOUT_MS): CoordinateVisitorWrite {
  return (write) => new Promise<void>((resolve, reject) => {
    let connection: IDBDatabase | undefined;
    let transaction: IDBTransaction | undefined;
    let settled = false;

    const finish = (success: boolean, error?: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      connection?.close();
      if (success) resolve();
      else reject(error);
    };
    const timeout = setTimeout(() => {
      finish(false, new DOMException('Visitor write coordination timed out', 'TimeoutError'));
      try { transaction?.abort(); } catch { /* The transaction may already have ended. */ }
    }, timeoutMs);

    let opening: IDBOpenDBRequest;
    try { opening = factory.open(VISITOR_COORDINATION_DB, 1); }
    catch (error) { finish(false, error); return; }

    opening.onerror = () => finish(false, opening.error);
    opening.onupgradeneeded = () => {
      if (settled) { opening.transaction?.abort(); return; }
      try { opening.result.createObjectStore(GATE_STORE); }
      catch (error) {
        finish(false, error);
        opening.transaction?.abort();
      }
    };
    opening.onsuccess = () => {
      const database = opening.result;
      if (settled) { database.close(); return; }
      connection = database;
      database.onversionchange = () => database.close();
      try {
        const gate = database.transaction(GATE_STORE, 'readwrite');
        transaction = gate;
        gate.onabort = () => finish(false, gate.error ?? new DOMException('Visitor write coordination aborted', 'AbortError'));
        // A read on the empty store grants the exclusive transaction. It stores no visitor data.
        const sentinel = gate.objectStore(GATE_STORE).get('visitor');
        sentinel.onerror = () => finish(false, sentinel.error);
        sentinel.onsuccess = () => {
          if (settled) return;
          // The LocalStorage read, merge and write run synchronously while the gate is held.
          try { write(); }
          catch (error) { finish(false, error); return; }
          finish(true);
        };
      } catch (error) {
        finish(false, error);
      }
    };
  });
}
