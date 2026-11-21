import { STORAGE_KEYS, saveToStorage, loadFromStorage } from './storage';

export interface TestLogEntry {
  event: string;
  detail: Record<string, unknown> | string;
  at: string;
}

const MAX_ENTRIES = 500;
let queue: Promise<unknown> = Promise.resolve();

/** Appends an entry. Calls are serialised so rapid events don't overwrite each other. */
export function logEvent(event: string, detail: TestLogEntry['detail'] = {}): Promise<void> {
  queue = queue.then(async () => {
    const entries = (await loadFromStorage<TestLogEntry[]>(STORAGE_KEYS.TEST_LOG)) ?? [];
    entries.push({ event, detail, at: new Date().toISOString() });
    await saveToStorage(STORAGE_KEYS.TEST_LOG, entries.slice(-MAX_ENTRIES));
  }).catch(() => {});
  return queue as Promise<void>;
}

export async function getLog(): Promise<TestLogEntry[]> {
  await queue;
  return (await loadFromStorage<TestLogEntry[]>(STORAGE_KEYS.TEST_LOG)) ?? [];
}

export async function clearLog(): Promise<void> {
  await queue;
  await saveToStorage(STORAGE_KEYS.TEST_LOG, []);
}

export function formatLogAsText(entries: TestLogEntry[]): string {
  return entries
    .map((e) => `${e.at}  ${e.event}  ${typeof e.detail === 'string' ? e.detail : JSON.stringify(e.detail)}`)
    .join('\n');
}
