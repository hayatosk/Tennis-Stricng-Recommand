/**
 * @typedef {Object} StringLog
 * @property {string} id           - 자동 생성 타임스탬프 ID
 * @property {string} createdAt    - 저장 시각 (ISO 8601, 자동)
 * @property {string} racketBrand  - 라켓 브랜드
 * @property {string} racketModel  - 라켓 모델명
 * @property {string} mainString   - 메인 스트링 이름
 * @property {string} crossString  - 크로스 스트링 이름 (하이브리드)
 * @property {string} mainTension  - 메인 텐션 (예: "50 lbs")
 * @property {string} crossTension - 크로스 텐션
 * @property {string} gauge        - 게이지 (예: "16L (1.25mm)")
 * @property {string} date         - 사용자가 입력한 줄 교체일 (YYYY-MM-DD)
 * @property {number} power        - 파워 점수 (1~10)
 * @property {number} spin         - 스핀 점수 (1~10)
 * @property {number} control      - 컨트롤 점수 (1~10)
 * @property {number} comfort      - 컴포트 점수 (1~10)
 * @property {number} durability   - 내구성 점수 (1~10)
 * @property {string} memo         - 자유 메모
 */

// ─── 스토리지 키 ────────────────────────────────────────────────────────────
export const LOG_STORAGE_KEY = 'string_logs_v1';

// ─── 점수 범위 ───────────────────────────────────────────────────────────────
export const SCORE_MIN = 1;
export const SCORE_MAX = 10;

// ─── 점수 필드 목록 (UI 렌더링용) ────────────────────────────────────────────
/** @type {{ key: keyof StringLog, label: string }[]} */
export const SCORE_FIELDS = [
  { key: 'power',      label: '파워' },
  { key: 'spin',       label: '스핀' },
  { key: 'control',    label: '컨트롤' },
  { key: 'comfort',    label: '컴포트' },
  { key: 'durability', label: '내구성' },
];

// ─── 기본값 (폼 초기 상태용, id/createdAt 제외) ──────────────────────────────
/** @type {Omit<StringLog, 'id' | 'createdAt'>} */
export const DEFAULT_LOG = {
  racketBrand:      '',
  racketModel:      '',
  headSize:         '',
  gripSize:         '',
  racketWeight:     '',
  mainStringBrand:  '',
  mainString:       '',
  mainStringType:   '',
  mainStringShape:  '',
  crossString:      '',
  mainTension:      '',
  crossTension:     '',
  gauge:            '',
  date:             '',
  power:            5,
  spin:             5,
  control:          5,
  comfort:          5,
  durability:       5,
  memo:             '',
};

// ─── 로그 생성 팩토리 ─────────────────────────────────────────────────────────
/**
 * 폼 데이터로부터 완전한 StringLog 객체를 생성합니다.
 * @param {Partial<StringLog>} partial
 * @returns {StringLog}
 */
export function createLog(partial) {
  return {
    ...DEFAULT_LOG,
    ...partial,
    id:        Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
}

// ─── Mock 데이터 (개발/테스트용) ──────────────────────────────────────────────
/** @type {StringLog[]} */
export const MOCK_LOGS = [
  {
    id:           'mock-1',
    createdAt:    '2025-03-10T09:00:00.000Z',
    racketBrand:  'Wilson',
    racketModel:  'Blade 98 v9',
    mainString:   'Solinco Hyper-G',
    crossString:  '',
    mainTension:  '50 lbs',
    crossTension: '',
    gauge:        '16L (1.25mm)',
    date:         '2025-03-10',
    power:        6,
    spin:         9,
    control:      8,
    comfort:      5,
    durability:   8,
    memo:         '스핀이 잘 걸림. 팔 부담은 조금 있음.',
  },
  {
    id:           'mock-2',
    createdAt:    '2025-02-01T12:00:00.000Z',
    racketBrand:  'Babolat',
    racketModel:  'Pure Aero 2023',
    mainString:   'Babolat RPM Blast',
    crossString:  'Wilson NXT',
    mainTension:  '52 lbs',
    crossTension: '48 lbs',
    gauge:        '17 (1.25mm)',
    date:         '2025-02-01',
    power:        7,
    spin:         8,
    control:      7,
    comfort:      6,
    durability:   6,
    memo:         '하이브리드 조합. 크로스 NXT가 컴포트를 올려줌.',
  },
  {
    id:           'mock-3',
    createdAt:    '2025-01-05T08:30:00.000Z',
    racketBrand:  'Yonex',
    racketModel:  'EZONE 98',
    mainString:   'Yonex Poly Tour Pro',
    crossString:  '',
    mainTension:  '48 lbs',
    crossTension: '',
    gauge:        '16 (1.30mm)',
    date:         '2025-01-05',
    power:        7,
    spin:         7,
    control:      8,
    comfort:      7,
    durability:   7,
    memo:         '전반적으로 안정적. 팔 친화적인 편.',
  },
];
