/**
 * Persistent admin-managed overrides that link a sample example
 * (by its `ex-N` style id) to a specific FinPrompt library id.
 *
 * Stored in localStorage so non-technical admins can re-map without
 * touching examples.json. Applied on top of the auto-resolution logic.
 */

const STORAGE_KEY = "finprompt:sample-mapping-overrides:v1";
const EVENT_NAME = "finprompt:sample-mapping-overrides:changed";

type OverrideMap = Record<string, number>; // exampleId -> promptId (0 = explicitly unlinked)

function read(): OverrideMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? (parsed as OverrideMap) : {};
  } catch {
    return {};
  }
}

function write(map: OverrideMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch {
    // ignore quota / privacy mode errors
  }
}

export function getAllOverrides(): OverrideMap {
  return read();
}

export function getOverride(exampleId: string): number | undefined {
  const map = read();
  return Object.prototype.hasOwnProperty.call(map, exampleId) ? map[exampleId] : undefined;
}

export function setOverride(exampleId: string, promptId: number) {
  const map = read();
  map[exampleId] = promptId;
  write(map);
}

export function clearOverride(exampleId: string) {
  const map = read();
  if (exampleId in map) {
    delete map[exampleId];
    write(map);
  }
}

export function clearAllOverrides() {
  write({});
}

/** Subscribe to override changes (same tab + cross-tab via storage event). */
export function subscribeOverrides(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onLocal = () => cb();
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener(EVENT_NAME, onLocal);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT_NAME, onLocal);
    window.removeEventListener("storage", onStorage);
  };
}
