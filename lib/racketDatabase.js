export const RACKET_BRANDS = [
  'Wilson',
  'Babolat',
  'Head',
  'Yonex',
  'Tecnifibre',
  'Prince',
];

export const RACKET_MODELS = {
  Wilson: [
    'RF',
    'Shift',
    'Blade',
    'Pro Staff',
    'Ultra',
    'Clash',
  ],
  Babolat: [
    'Pure Aero',
    'Pure Strike',
    'Pure Drive',
    'Evo Drive',
  ],
  Head: [
    'Extreme',
    'Speed',
    'Boom',
    'Prestige',
    'Gravity',
    'Radical',
  ],
  Yonex: [
    'Percept',
    'VCORE',
    'EZONE',
    'Muse',
    'Astrel',
  ],
  Tecnifibre: [
    'T-Fight',
    'TF',
    'Tempo',
    'Fire',
  ],
  Prince: [
    'Tour',
    'Phantom',
    'Warrior',
    'Synergy',
  ],
};

export const HEAD_SIZES = [
  85, 90, 93, 95, 97, 98, 99, 100, 102, 104, 105, 107, 108, 110, 115,
];

export const GRIP_SIZES = [
  { value: 'L0 (4")', label: 'L0 (4")' },
  { value: 'L1 (4 1/8")', label: 'L1 (4 1/8")' },
  { value: 'L2 (4 1/4")', label: 'L2 (4 1/4")' },
  { value: 'L3 (4 3/8")', label: 'L3 (4 3/8")' },
  { value: 'L4 (4 1/2")', label: 'L4 (4 1/2")' },
  { value: 'L5 (4 5/8")', label: 'L5 (4 5/8")' },
];

export const RACKET_WEIGHTS = Array.from({ length: 25 }, (_, i) => 240 + i * 5);
