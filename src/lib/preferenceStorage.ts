import type { PersistStorage } from 'zustand/middleware';

// Preferences are optional: corrupt data, blocked storage and quota errors must
// never prevent hydration or stop a user choosing a location for this visit.
export function createPreferenceStorage<T>(): PersistStorage<T> {
  return {
    getItem(name) {
      try {
        const raw = window.localStorage.getItem(name);
        if (!raw) return null;
        const saved = JSON.parse(raw);
        if (!saved || typeof saved.state !== 'object' || !saved.state || Array.isArray(saved.state)) return null;
        return saved;
      } catch { return null; }
    },
    setItem(name, value) {
      try { window.localStorage.setItem(name, JSON.stringify(value)); } catch { /* Keep the in-memory choice. */ }
    },
    removeItem(name) {
      try { window.localStorage.removeItem(name); } catch { /* Storage may be disabled. */ }
    },
  };
}
