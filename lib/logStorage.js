import { LOG_STORAGE_KEY, createLog } from './logModel';

// ─── 내부 헬퍼 ───────────────────────────────────────────────────────────────

/** localStorage에서 로그 배열을 읽어 반환. 파싱 실패 시 빈 배열. */
function _read() {
  try {
    const raw = window.localStorage.getItem(LOG_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** 로그 배열을 localStorage에 씀. */
function _write(logs) {
  try {
    window.localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // 저장 용량 초과 등 무시
  }
}

// ─── 정렬 ────────────────────────────────────────────────────────────────────

/**
 * 로그 배열을 최신순(createdAt 내림차순)으로 정렬해 반환합니다.
 * 원본 배열을 변경하지 않습니다.
 * @param {import('./logModel').StringLog[]} logs
 * @returns {import('./logModel').StringLog[]}
 */
export function sortByLatest(logs) {
  return [...logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ─── 조회 ────────────────────────────────────────────────────────────────────

/**
 * 전체 로그를 최신순으로 반환합니다.
 * @returns {import('./logModel').StringLog[]}
 */
export function getAllLogs() {
  return sortByLatest(_read());
}

/**
 * ID로 단일 로그를 반환합니다. 없으면 null.
 * @param {string} id
 * @returns {import('./logModel').StringLog | null}
 */
export function getLogById(id) {
  return _read().find((l) => l.id === id) ?? null;
}

/**
 * racketModel 기준으로 로그를 필터링합니다 (대소문자 무시).
 * @param {string} racketModel
 * @returns {import('./logModel').StringLog[]}
 */
export function filterByRacketModel(racketModel) {
  const q = racketModel.trim().toLowerCase();
  if (!q) return getAllLogs();
  return getAllLogs().filter((l) =>
    l.racketModel.toLowerCase().includes(q)
  );
}

/**
 * mainString 또는 crossString에서 검색합니다 (대소문자 무시).
 * @param {string} query
 * @returns {import('./logModel').StringLog[]}
 */
export function searchByString(query) {
  const q = query.trim().toLowerCase();
  if (!q) return getAllLogs();
  return getAllLogs().filter(
    (l) =>
      l.mainString.toLowerCase().includes(q) ||
      l.crossString.toLowerCase().includes(q)
  );
}

// ─── 생성 / 수정 / 삭제 ──────────────────────────────────────────────────────

/**
 * 새 로그를 저장합니다. id와 createdAt은 자동 생성됩니다.
 * @param {Partial<import('./logModel').StringLog>} partial
 * @returns {import('./logModel').StringLog} 저장된 로그
 */
export function createNewLog(partial) {
  const logs = _read();
  const newLog = createLog(partial);
  _write([newLog, ...logs]);
  return newLog;
}

/**
 * 기존 로그를 업데이트합니다.
 * @param {string} id
 * @param {Partial<import('./logModel').StringLog>} data
 */
export function updateLog(id, data) {
  const updated = _read().map((l) => (l.id === id ? { ...l, ...data } : l));
  _write(updated);
}

/**
 * 로그를 삭제합니다.
 * @param {string} id
 */
export function deleteLog(id) {
  _write(_read().filter((l) => l.id !== id));
}

// ─── 하위 호환 별칭 (기존 페이지에서 사용 중) ───────────────────────────────

/** @deprecated getAllLogs() 사용 권장 */
export const getLogs = getAllLogs;

/** @deprecated getLogById() 사용 권장 */
export const getLog = getLogById;

/** @deprecated createNewLog() 사용 권장 */
export const saveLog = createNewLog;
