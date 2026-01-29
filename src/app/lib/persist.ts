export type PersistedStateV1 = {
  version: 1;
  screen: "menu" | "characterSelect" | "play";
  muted: boolean;
  durations: { focus: number; brk: number; long: number };
  characterName: string | null;
  hasSession: boolean;
};

const KEY = "mp_state_v1";

export function loadState(): PersistedStateV1 | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedStateV1;
    if (parsed?.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveState(state: PersistedStateV1) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
