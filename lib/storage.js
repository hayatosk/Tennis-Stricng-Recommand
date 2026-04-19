import { STORAGE_KEY } from './constants';

export function loadSavedForm(defaultValue) {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    return { ...defaultValue, ...parsed, priorities: { ...defaultValue.priorities, ...(parsed.priorities || {}) } };
  } catch {
    return defaultValue;
  }
}

export function saveForm(form) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  } catch {
    // ignore storage failure
  }
}
