/**
 * @typedef {Object} StringLog
 * @property {string} id
 * @property {string} createdAt
 * @property {string} racketBrand
 * @property {string} racketModel
 * @property {string} racketNumber
 * @property {string} headSize
 * @property {string} gripSize
 * @property {string} racketWeight
 * @property {string} mainStringBrand
 * @property {string} mainString
 * @property {string} mainStringType
 * @property {string} mainStringShape
 * @property {string} mainStringColor
 * @property {string} crossStringBrand
 * @property {string} crossString
 * @property {string} crossStringType
 * @property {string} crossStringShape
 * @property {string} crossStringColor
 * @property {string} preferredStringBrand
 * @property {string} preferredStringModel
 * @property {string} preferredStringTraits
 * @property {string} mainTension
 * @property {string} crossTension
 * @property {string} gauge
 * @property {string} crossGauge
 * @property {string} date
 * @property {number} power
 * @property {number} spin
 * @property {number} control
 * @property {number} comfort
 * @property {number} durability
 * @property {string} memo
 */

export const LOG_STORAGE_KEY = 'string_logs_v1';

export const SCORE_MIN = 1;
export const SCORE_MAX = 10;

/** @type {{ key: keyof StringLog, label: string }[]} */
export const SCORE_FIELDS = [
  { key: 'power', label: '파워' },
  { key: 'spin', label: '스핀' },
  { key: 'control', label: '컨트롤' },
  { key: 'comfort', label: '편안함' },
  { key: 'durability', label: '내구성' },
];

/** @type {Omit<StringLog, 'id' | 'createdAt'>} */
export const DEFAULT_LOG = {
  racketBrand: '',
  racketModel: '',
  racketNumber: '',
  headSize: '',
  gripSize: '',
  racketWeight: '',
  mainStringBrand: '',
  mainString: '',
  mainStringType: '',
  mainStringShape: '',
  mainStringColor: '',
  crossStringBrand: '',
  crossString: '',
  crossStringType: '',
  crossStringShape: '',
  crossStringColor: '',
  preferredStringBrand: '',
  preferredStringModel: '',
  preferredStringTraits: '',
  mainTension: '',
  crossTension: '',
  gauge: '',
  crossGauge: '',
  date: '',
  power: 5,
  spin: 5,
  control: 5,
  comfort: 5,
  durability: 5,
  memo: '',
};

/**
 * 폼 데이터로부터 완전한 스트링 로그 객체를 생성합니다.
 * @param {Partial<StringLog>} partial
 * @returns {StringLog}
 */
export function createLog(partial) {
  return {
    ...DEFAULT_LOG,
    ...partial,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
}

/** @type {StringLog[]} */
export const MOCK_LOGS = [
  {
    id: 'mock-1',
    createdAt: '2025-03-10T09:00:00.000Z',
    racketBrand: 'Wilson',
    racketModel: 'Blade',
    racketNumber: '1번',
    headSize: '98 sq in',
    gripSize: 'L3 (4 3/8")',
    racketWeight: '305g',
    mainStringBrand: 'Solinco',
    mainString: 'Hyper-G',
    mainStringType: 'Polyester (Co-Poly)',
    mainStringShape: '4-sided',
    mainStringColor: 'Green',
    crossStringBrand: '',
    crossString: '',
    crossStringType: '',
    crossStringShape: '',
    crossStringColor: '',
    preferredStringBrand: 'Solinco',
    preferredStringModel: 'Hyper-G',
    preferredStringTraits: 'spin, control, shaped',
    mainTension: '50 lbs',
    crossTension: '',
    gauge: '1.25mm (16L)',
    crossGauge: '',
    date: '2025-03-10',
    power: 6,
    spin: 9,
    control: 8,
    comfort: 5,
    durability: 8,
    memo: '스핀이 잘 걸림. 후반부에는 조금 딱딱함.',
  },
  {
    id: 'mock-2',
    createdAt: '2025-02-01T12:00:00.000Z',
    racketBrand: 'Babolat',
    racketModel: 'Pure Aero',
    racketNumber: '2번',
    headSize: '100 sq in',
    gripSize: 'L2 (4 1/4")',
    racketWeight: '300g',
    mainStringBrand: 'Babolat',
    mainString: 'RPM Blast',
    mainStringType: 'Polyester (Co-Poly)',
    mainStringShape: '8-sided',
    mainStringColor: 'Black',
    crossStringBrand: 'Wilson',
    crossString: 'NXT',
    crossStringType: 'Multifilament',
    crossStringShape: 'Round',
    crossStringColor: 'Natural',
    preferredStringBrand: 'Babolat',
    preferredStringModel: 'RPM Blast',
    preferredStringTraits: 'spin, hybrid, comfort',
    mainTension: '52 lbs',
    crossTension: '48 lbs',
    gauge: '1.25mm (16L)',
    crossGauge: '1.30mm (16)',
    date: '2025-02-01',
    power: 7,
    spin: 8,
    control: 7,
    comfort: 6,
    durability: 6,
    memo: '하이브리드 조합. 크로스 NXT가 편안함을 올려줌.',
  },
];
