import { STRING_MODELS } from './stringBrands.js';

const EXTRA_STRINGS = {
  Wilson: ['Revolve Spin'],
  Volkl: ['Cyclone'],
  Kirschbaum: ['Pro Line II'],
  'Big Booster': ['Super Soft Rough'],
  ReString: ['Vivo', 'Sync', 'Zero'],
};

const TWU_SOURCE_URL = 'https://twu.tennis-warehouse.com/learning_center/reporter2.php';

// TWU String Performance Database values from the 51 lb / fast swing report.
// stiffness: lb/in, tensionLoss: %, spinPotential: TWU spin-potential value.
const TWU_MEASUREMENTS = {
  'babolat|hurricane': { stiffness: 204.0, tensionLoss: 39.6, spinPotential: null, ref: 'Babolat Pro Hurricane 16' },
  'babolat|rpm blast': { stiffness: 232.6, tensionLoss: 45.9, spinPotential: 4.5, ref: 'Babolat RPM Blast 16' },
  'babolat|rpm blast rough': { stiffness: 196.0, tensionLoss: 35.7, spinPotential: 9.9, ref: 'Babolat RPM Blast Rough 17' },
  'babolat|rpm team': { stiffness: 280.6, tensionLoss: 22.0, spinPotential: 3.9, ref: 'Babolat RPM Team 16 Black' },
  'diadem|elite xt': { stiffness: 189.2, tensionLoss: 31.7, spinPotential: 9.3, ref: 'Diadem Elite XT 17' },
  'diadem|solstice power': { stiffness: 196.6, tensionLoss: 28.5, spinPotential: 8.6, ref: 'Diadem Solstice Power 17' },
  'dunlop|black widow': { stiffness: 193.2, tensionLoss: 38.2, spinPotential: 5.2, ref: 'Dunlop Black Widow 16' },
  'dunlop|explosive': { stiffness: 192.0, tensionLoss: 32.4, spinPotential: 5.1, ref: 'Dunlop Explosive 17' },
  'dunlop|explosive tour': { stiffness: 200.6, tensionLoss: 48.2, spinPotential: null, ref: 'Dunlop Explosive Tour 16' },
  'grapplesnake|alpha': { stiffness: 218.3, tensionLoss: 29.4, spinPotential: 6.7, ref: 'Grapplesnake Alpha 17' },
  'grapplesnake|tour m8': { stiffness: 210.3, tensionLoss: 34.3, spinPotential: 8.2, ref: 'Grapplesnake Tour M8 17' },
  'grapplesnake|tour sniper': { stiffness: 206.3, tensionLoss: 32.0, spinPotential: 5.8, ref: 'Grapplesnake Tour Sniper 1.25' },
  'head|hawk': { stiffness: 204.6, tensionLoss: 32.9, spinPotential: 4.7, ref: 'Head Hawk 17' },
  'head|hawk power': { stiffness: 203.5, tensionLoss: 48.3, spinPotential: 7.5, ref: 'Head Hawk Power 17' },
  'head|hawk touch': { stiffness: 196.0, tensionLoss: 31.9, spinPotential: 5.2, ref: 'Head Hawk Touch 18' },
  'head|lynx': { stiffness: 179.5, tensionLoss: 47.0, spinPotential: 5.7, ref: 'Head Lynx 17' },
  'head|lynx tour': { stiffness: 217.7, tensionLoss: 24.6, spinPotential: 7.1, ref: 'Head Lynx Tour 17' },
  'head|lynx touch': { stiffness: 221.7, tensionLoss: 31.3, spinPotential: 6.2, ref: 'Head Lynx Touch 16g' },
  'head|sonic pro': { stiffness: 160.6, tensionLoss: 57.0, spinPotential: 4.2, ref: 'Head Sonic Pro 16' },
  'isospeed|black fire': { stiffness: 204.6, tensionLoss: 39.3, spinPotential: 5.6, ref: 'IsoSpeed Black Fire 17' },
  'isospeed|cream': { stiffness: 177.7, tensionLoss: 28.1, spinPotential: null, ref: 'IsoSpeed Cream 17' },
  'kirschbaum|pro line ii': { stiffness: 201.2, tensionLoss: 44.9, spinPotential: 4.7, ref: 'Kirschbaum Pro Line II 17' },
  'luxilon|4g': { stiffness: 258.9, tensionLoss: 21.3, spinPotential: 3.9, ref: 'Luxilon 4G 16L' },
  'luxilon|4g rough': { stiffness: 216.0, tensionLoss: 32.8, spinPotential: 4.2, ref: 'Luxilon 4G Rough 16L' },
  'luxilon|alu power': { stiffness: 209.2, tensionLoss: 46.6, spinPotential: 5.8, ref: 'Luxilon ALU Power 125/16L' },
  'luxilon|alu power rough': { stiffness: 209.2, tensionLoss: 39.6, spinPotential: 6.5, ref: 'Luxilon ALU Power Rough 16L' },
  'luxilon|alu power vibe': { stiffness: 208.0, tensionLoss: 34.3, spinPotential: 5.0, ref: 'Luxilon Alu Power Vibe 16' },
  'luxilon|element': { stiffness: 191.5, tensionLoss: 44.3, spinPotential: 6.6, ref: 'Luxilon Element 1.30' },
  'luxilon|lxn eco power': { stiffness: 194.9, tensionLoss: 34.5, spinPotential: 8.3, ref: 'Luxilon ECO Power 17' },
  'luxilon|lxn eco spin': { stiffness: 213.2, tensionLoss: 26.4, spinPotential: 5.3, ref: 'Luxilon ECO Spin 17' },
  'luxilon|lxn smart': { stiffness: 201.2, tensionLoss: 42.7, spinPotential: 6.8, ref: 'Luxilon LXN Smart 16L' },
  'msv|focus hex': { stiffness: 218.9, tensionLoss: 29.1, spinPotential: 7.5, ref: 'MSV Focus-Hex 16 (1.23)' },
  'msv|focus hex soft': { stiffness: 228.0, tensionLoss: 29.4, spinPotential: 6.3, ref: 'MSV Focus Hex Soft 17' },
  'signum pro|firestorm': { stiffness: 197.7, tensionLoss: 46.4, spinPotential: 4.8, ref: 'Signum Pro Firestorm 1.25' },
  'signum pro|hyperion': { stiffness: 220.0, tensionLoss: 40.9, spinPotential: 4.6, ref: 'Signum Pro Hyperion 16' },
  'signum pro|poly plasma': { stiffness: 198.3, tensionLoss: 26.0, spinPotential: 5.4, ref: 'Signum Pro Poly Plasma 17' },
  'signum pro|x-perience': { stiffness: 224.6, tensionLoss: 25.2, spinPotential: 6.2, ref: 'Signum Pro X-Perience 17' },
  'solinco|confidential': { stiffness: 222.3, tensionLoss: 22.2, spinPotential: 6.4, ref: 'Solinco Confidential 16' },
  'solinco|hyper-g': { stiffness: 219.5, tensionLoss: 26.3, spinPotential: 7.0, ref: 'Solinco Hyper-G 16' },
  'solinco|hyper-g soft': { stiffness: 172.0, tensionLoss: 28.7, spinPotential: 5.2, ref: 'Solinco Hyper-G-Soft 16L' },
  'solinco|mach-10': { stiffness: 222.3, tensionLoss: 26.3, spinPotential: 6.0, ref: 'Solinco Mach 10 16' },
  'solinco|tour bite': { stiffness: 202.9, tensionLoss: 47.1, spinPotential: 6.7, ref: 'Solinco Tour Bite 16' },
  'tecnifibre|black code': { stiffness: 249.7, tensionLoss: 37.3, spinPotential: null, ref: 'Tecnifibre Black Code 16' },
  'tecnifibre|black code 4s': { stiffness: 209.2, tensionLoss: 28.3, spinPotential: 9.8, ref: 'Tecnifibre Black Code 4S 17' },
  'tecnifibre|ice code': { stiffness: 221.2, tensionLoss: 35.0, spinPotential: 5.6, ref: 'Tecnifibre Ice Code 16' },
  'tecnifibre|pro red code wax': { stiffness: 235.5, tensionLoss: 28.8, spinPotential: 6.5, ref: 'Tecnifibre Pro Red Code Wax 17' },
  'tecnifibre|razor code': { stiffness: 229.2, tensionLoss: 29.6, spinPotential: 5.6, ref: 'Tecnifibre Razor Code 17' },
  'tecnifibre|razor soft': { stiffness: 212.0, tensionLoss: 33.3, spinPotential: 7.4, ref: 'Tecnifibre Razor Soft 17' },
  'top spin|cyber blue': { stiffness: 183.5, tensionLoss: 46.1, spinPotential: 5.1, ref: 'Topspin Cyber Blue 17' },
  'top spin|cyber flash': { stiffness: 185.2, tensionLoss: 46.5, spinPotential: 4.8, ref: 'Topspin Cyber Flash 16' },
  'toro line|o-toro spin': { stiffness: 173.2, tensionLoss: 38.3, spinPotential: 8.2, ref: 'Toroline O-Toro Spin 17' },
  'toro line|o-toro tour': { stiffness: 216.6, tensionLoss: 25.0, spinPotential: 7.7, ref: 'Toroline O-Toro Tour 17' },
  'tourna|big hitter black zone': { stiffness: 197.2, tensionLoss: 29.5, spinPotential: 5.6, ref: 'Tourna Black Zone 16' },
  'tourna|big hitter blue rough': { stiffness: 222.3, tensionLoss: 40.5, spinPotential: 3.4, ref: 'Tourna Big Hitter Blue Rough 16' },
  'tourna|premium poly': { stiffness: 225.7, tensionLoss: 39.8, spinPotential: null, ref: 'Tourna Big Hitter 16' },
  'volkl|cyclone': { stiffness: 188.0, tensionLoss: 29.4, spinPotential: 9.0, ref: 'Volkl Cyclone 18L' },
  'weiss cannon|mosquito bite': { stiffness: 182.3, tensionLoss: 35.4, spinPotential: 5.6, ref: 'Weiss Cannon Mosquito Bite 18' },
  'weiss cannon|red ghost': { stiffness: 189.7, tensionLoss: 34.0, spinPotential: 8.5, ref: 'Weiss Cannon Red Ghost 17L' },
  'weiss cannon|scorpion': { stiffness: 200.0, tensionLoss: 35.2, spinPotential: 4.9, ref: 'Weiss Cannon Scorpion 16L' },
  'weiss cannon|silverstring': { stiffness: 195.5, tensionLoss: 43.8, spinPotential: 3.8, ref: 'Weiss Cannon Silverstring 1.25' },
  'weiss cannon|turbo twist': { stiffness: 216.6, tensionLoss: 49.5, spinPotential: 4.2, ref: 'Weiss Cannon Turbotwist 17' },
  'weiss cannon|ultra cable': { stiffness: 174.9, tensionLoss: 47.7, spinPotential: 11.9, ref: 'Weiss Cannon Ultra Cable 17' },
  'wilson|revolve': { stiffness: 184.0, tensionLoss: 45.2, spinPotential: 7.2, ref: 'Wilson Revolve 16' },
  'wilson|revolve spin': { stiffness: 172.6, tensionLoss: 54.5, spinPotential: 5.0, ref: 'Wilson Revolve Spin 16' },
  'yonex|poly tour fire': { stiffness: 194.9, tensionLoss: 35.0, spinPotential: 5.8, ref: 'Yonex Poly Tour Fire 16L' },
  'yonex|poly tour pro': { stiffness: 188.6, tensionLoss: 33.3, spinPotential: 5.2, ref: 'Yonex Poly Tour Pro 17' },
  'yonex|poly tour rev': { stiffness: 193.2, tensionLoss: 34.4, spinPotential: 7.2, ref: 'Yonex Polytour Rev 16L' },
  'yonex|poly tour spin': { stiffness: 213.7, tensionLoss: 27.2, spinPotential: 6.3, ref: 'Yonex Poly Tour Spin 16L' },
  'yonex|poly tour strike': { stiffness: 199.5, tensionLoss: 27.9, spinPotential: 4.6, ref: 'Yonex Poly Tour Strike 16L' },
};

const OVERRIDES = {
  'solinco|hyper-g': {
    shape: 'square',
    specs: { power: 6, spin: 10, control: 8, comfort: 5, durability: 8, tension_stability: 7 },
    tags: ['spin', 'control'],
  },
  'solinco|hyper-g soft': {
    shape: 'square',
    arm_friendly: true,
    stiffness: 62,
    specs: { power: 7, spin: 9, control: 7, comfort: 8, durability: 6, tension_stability: 6 },
    tags: ['spin', 'comfort'],
  },
  'solinco|tour bite': {
    shape: 'square',
    specs: { power: 5, spin: 10, control: 9, comfort: 4, durability: 8, tension_stability: 7 },
    tags: ['spin', 'control'],
  },
  'solinco|confidential': {
    specs: { power: 7, spin: 8, control: 8, comfort: 7, durability: 8, tension_stability: 8 },
    tags: ['control', 'balance'],
  },
  'solinco|mach-10': {
    arm_friendly: true,
    stiffness: 61,
    specs: { power: 8, spin: 8, control: 7, comfort: 8, durability: 7, tension_stability: 7 },
    tags: ['power', 'comfort'],
  },
  'luxilon|alu power': {
    specs: { power: 8, spin: 8, control: 8, comfort: 5, durability: 7, tension_stability: 6 },
    tags: ['power', 'control'],
  },
  'luxilon|element': {
    family: 'multi-mono',
    arm_friendly: true,
    stiffness: 58,
    specs: { power: 7, spin: 7, control: 7, comfort: 9, durability: 7, tension_stability: 7 },
    tags: ['comfort', 'power'],
  },
  'babolat|rpm blast': {
    shape: 'octagon',
    specs: { power: 6, spin: 9, control: 8, comfort: 5, durability: 7, tension_stability: 6 },
    tags: ['spin', 'attack'],
  },
  'babolat|rpm soft': {
    family: 'polyamide blend',
    arm_friendly: true,
    stiffness: 55,
    specs: { power: 8, spin: 7, control: 6, comfort: 9, durability: 6, tension_stability: 6 },
    tags: ['comfort', 'power'],
  },
  'babolat|rpm team': {
    shape: 'octagon',
    arm_friendly: true,
    stiffness: 64,
    specs: { power: 7, spin: 8, control: 7, comfort: 7, durability: 7, tension_stability: 6 },
    tags: ['spin', 'comfort'],
  },
  'babolat|vs touch': {
    type: 'Natural Gut',
    family: 'natural gut',
    arm_friendly: true,
    stiffness: 41,
    gauge_mm: 1.30,
    gauge_label: '16 (1.30mm)',
    recommended_tension: '53-63lbs',
    price_band: '$55/set',
    specs: { power: 10, spin: 6, control: 7, comfort: 10, durability: 4, tension_stability: 10 },
    tags: ['comfort', 'power', 'hybrid'],
  },
  'babolat|addiction': {
    type: 'Multifilament',
    family: 'multifilament',
    arm_friendly: true,
    specs: { power: 9, spin: 5, control: 6, comfort: 9, durability: 5, tension_stability: 6 },
    tags: ['comfort', 'power'],
  },
  'wilson|nxt': {
    type: 'Multifilament',
    family: 'multifilament',
    arm_friendly: true,
    stiffness: 44,
    gauge_mm: 1.30,
    gauge_label: '16 (1.30mm)',
    recommended_tension: '50-60lbs',
    specs: { power: 9, spin: 5, control: 6, comfort: 10, durability: 5, tension_stability: 5 },
    tags: ['comfort', 'power'],
  },
  'wilson|revolve spin': {
    shape: 'pentagon',
    specs: { power: 6, spin: 9, control: 7, comfort: 6, durability: 7, tension_stability: 6 },
    tags: ['spin', 'access'],
  },
  'tecnifibre|x-one biphase': {
    type: 'Multifilament',
    family: 'multifilament',
    arm_friendly: true,
    stiffness: 46,
    gauge_mm: 1.24,
    gauge_label: '17 (1.24mm)',
    recommended_tension: '50-60lbs',
    specs: { power: 9, spin: 5, control: 7, comfort: 10, durability: 5, tension_stability: 6 },
    tags: ['comfort', 'power'],
  },
  'tecnifibre|black code 4s': {
    shape: 'square',
    specs: { power: 6, spin: 10, control: 8, comfort: 5, durability: 8, tension_stability: 7 },
    tags: ['spin', 'control'],
  },
  'tecnifibre|ice code': {
    arm_friendly: true,
    stiffness: 56,
    specs: { power: 8, spin: 6, control: 7, comfort: 9, durability: 7, tension_stability: 7 },
    tags: ['comfort', 'power'],
  },
  'tecnifibre|razor soft': {
    arm_friendly: true,
    stiffness: 60,
    specs: { power: 7, spin: 7, control: 8, comfort: 8, durability: 7, tension_stability: 8 },
    tags: ['control', 'comfort'],
  },
  'yonex|poly tour pro': {
    arm_friendly: true,
    stiffness: 60,
    specs: { power: 7, spin: 7, control: 7, comfort: 8, durability: 7, tension_stability: 8 },
    tags: ['balance', 'comfort'],
  },
  'yonex|poly tour rev': {
    shape: 'pentagon',
    specs: { power: 6, spin: 9, control: 8, comfort: 6, durability: 7, tension_stability: 7 },
    tags: ['spin', 'control'],
  },
  'yonex|poly tour force': {
    specs: { power: 7, spin: 7, control: 9, comfort: 5, durability: 8, tension_stability: 8 },
    tags: ['control', 'stability'],
  },
  'head|lynx tour': {
    shape: 'hexagon',
    specs: { power: 6, spin: 8, control: 9, comfort: 5, durability: 8, tension_stability: 7 },
    tags: ['control', 'spin'],
  },
  'head|hawk touch': {
    arm_friendly: true,
    stiffness: 63,
    specs: { power: 6, spin: 7, control: 9, comfort: 7, durability: 7, tension_stability: 8 },
    tags: ['control', 'feel'],
  },
  'head|hawk power': {
    specs: { power: 8, spin: 7, control: 8, comfort: 6, durability: 8, tension_stability: 7 },
    tags: ['power', 'control'],
  },
  'head|velocity mlt': {
    type: 'Multifilament',
    family: 'multifilament',
    arm_friendly: true,
    specs: { power: 8, spin: 5, control: 7, comfort: 9, durability: 6, tension_stability: 7 },
    tags: ['comfort', 'balance'],
  },
  'head|rip control': {
    type: 'Multifilament',
    family: 'multifilament',
    arm_friendly: true,
    specs: { power: 6, spin: 6, control: 8, comfort: 8, durability: 7, tension_stability: 8 },
    tags: ['control', 'comfort'],
  },
  'msv|focus hex': {
    shape: 'hexagon',
    gauge_mm: 1.18,
    gauge_label: '18 (1.18mm)',
    specs: { power: 7, spin: 9, control: 8, comfort: 6, durability: 6, tension_stability: 7 },
    tags: ['spin', 'value'],
  },
};

function keyFor(brand, name) {
  return `${brand}|${name}`.toLowerCase();
}

function idFor(brand, name) {
  return `${brand}-${name}`
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function inferBase(brand, name) {
  const text = `${brand} ${name}`.toLowerCase();
  const isMulti = /(nxt|sensation|silk|multi|x-one|biphase|hdx|triax|duramix|addiction|velocity|rip control|professional)/.test(text);
  const isGut = /(vs touch|natural gut)/.test(text);
  const isSoft = /(soft|cream|element|touch|vivo|zero|tempo|evo|comfort)/.test(text);
  const isShaped = /(blast|rough|spin|tour bite|hyper-g|confidential|black code|hex|hepta|widow|solstice|fire|rev|lynx tour|cyclone|wasabi|snapper|tour hex|ultra cable|scorpion|m8|sniper|alpha|changer|phantom|heptabolt|hexsplosion|rotation)/.test(text);
  const isControl = /(control|hawk|razor|tour|force|strike|prestige|confidential|4g|poly plasma|silverstring|original|sync)/.test(text);
  const isPower = /(power|alu|drive|flash|fire|explosive|big hitter|vivo|x-one|nxt|gut|element|mach)/.test(text);
  const isDurable = /(4g|force|strike|confidential|pro line|poly plasma|lynx tour|hawk|tour sniper|tour m8|rexxer|big hitter|focus hex|original|max rotation|ultra cable)/.test(text);

  const type = isGut ? 'Natural Gut' : isMulti ? 'Multifilament' : 'Polyester (Co-Poly)';
  const family = isGut ? 'natural gut' : isMulti ? 'multifilament' : 'co-poly';
  const shape = isMulti || isGut ? 'round' : isShaped ? 'shaped' : 'round';
  const armFriendly = isGut || isMulti || isSoft;

  const specs = {
    power: isGut ? 10 : isMulti ? 9 : isPower ? 8 : 7,
    spin: isShaped ? 9 : isMulti || isGut ? 5 : 7,
    control: isControl ? 9 : isShaped ? 8 : 7,
    comfort: isGut ? 10 : isMulti ? 9 : armFriendly ? 8 : 6,
    durability: isGut ? 4 : isMulti ? 5 : isDurable ? 9 : isShaped ? 8 : 7,
    tension_stability: isGut ? 10 : isDurable ? 9 : isControl ? 8 : 7,
  };

  return {
    type,
    family,
    shape,
    stiffness: isGut ? 41 : isMulti ? 46 : armFriendly ? 60 : 68,
    arm_friendly: armFriendly,
    gauge_mm: isMulti || isGut ? 1.30 : 1.25,
    gauge_label: isMulti || isGut ? '16 (1.30mm)' : '16L (1.25mm)',
    recommended_tension: isMulti || isGut ? '50-60lbs' : armFriendly ? '45-52lbs' : '46-54lbs',
    price_band: isGut ? '$55/set' : isMulti ? '$19/set' : '$16/set',
    specs,
    tags: [
      isShaped ? 'spin' : isPower ? 'power' : 'balance',
      isControl ? 'control' : armFriendly ? 'comfort' : 'stability',
    ],
  };
}

function clampScore(value) {
  return Math.max(1, Math.min(10, Math.round(value)));
}

function scale(value, min, max) {
  if (!Number.isFinite(value)) return 5;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function scoreFromTwu(metric, baseSpecs) {
  const stiffnessScore = scale(metric.stiffness, 150, 260);
  const softnessScore = 1 - stiffnessScore;
  const stabilityScore = 1 - scale(metric.tensionLoss, 20, 60);
  const spinValue = Number.isFinite(metric.spinPotential) ? metric.spinPotential : baseSpecs.spin;
  const spinScore = scale(spinValue, 3.5, 10);

  return {
    power: clampScore(3 + softnessScore * 7),
    spin: clampScore(3 + spinScore * 7),
    control: clampScore(3 + (stiffnessScore * 0.75 + stabilityScore * 0.25) * 7),
    comfort: clampScore(2 + softnessScore * 8),
    durability: baseSpecs.durability,
    tension_stability: clampScore(3 + stabilityScore * 7),
  };
}

const USER_FACING_SPEC_KEYS = ['power', 'spin', 'control', 'comfort', 'durability'];

function mergeSpecs(baseSpecs, overrideSpecs = {}, twuSpecs = {}) {
  const resolvedTwuSpecs = { ...twuSpecs };
  USER_FACING_SPEC_KEYS.forEach((key) => {
    if (Number.isFinite(overrideSpecs[key])) {
      delete resolvedTwuSpecs[key];
      return;
    }
    const floor = Number.isFinite(overrideSpecs[key]) ? overrideSpecs[key] : baseSpecs[key];
    if (floor >= 8 && Number.isFinite(resolvedTwuSpecs[key]) && resolvedTwuSpecs[key] < floor) {
      resolvedTwuSpecs[key] = floor;
    }
  });
  return { ...baseSpecs, ...overrideSpecs, ...resolvedTwuSpecs };
}

function twuDataFor(brand, name) {
  const metric = TWU_MEASUREMENTS[keyFor(brand, name)];
  if (!metric) return null;

  return {
    source: 'TWU String Performance Database',
    source_url: TWU_SOURCE_URL,
    reference: metric.ref,
    stiffness: metric.stiffness,
    tension_loss: metric.tensionLoss,
    spin_potential: metric.spinPotential,
  };
}

function descriptionFor(item) {
  const strengths = Object.entries(item.specs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => ({
      power: '파워',
      spin: '스핀',
      control: '컨트롤',
      comfort: '편안함',
      durability: '내구성',
      tension_stability: '텐션 유지력',
    })[key]);

  return `${item.brand} ${item.name}은 ${strengths.join('과 ')} 성향이 강한 ${item.type} 스트링입니다. 로그 기반 추천에서 현재 세팅의 부족한 체감을 보완할 후보로 사용할 수 있습니다.`;
}

function createString(brand, name) {
  const base = inferBase(brand, name);
  const override = OVERRIDES[keyFor(brand, name)] || {};
  const twuMetric = TWU_MEASUREMENTS[keyFor(brand, name)];
  const twuSpecs = twuMetric ? scoreFromTwu(twuMetric, { ...base.specs, ...(override.specs || {}) }) : {};
  const item = {
    id: idFor(brand, name),
    brand,
    name,
    ...base,
    ...override,
    ...(twuMetric ? { stiffness: twuMetric.stiffness, tension_loss: twuMetric.tensionLoss } : {}),
    specs: mergeSpecs(base.specs, override.specs, twuSpecs),
    tags: override.tags || base.tags,
    twu_data: twuDataFor(brand, name),
  };

  return {
    ...item,
    description: override.description || descriptionFor(item),
  };
}

const combinedModels = { ...STRING_MODELS };

Object.entries(EXTRA_STRINGS).forEach(([brand, models]) => {
  combinedModels[brand] = [...(combinedModels[brand] || []), ...models];
});

const allModels = Object.entries(combinedModels)
  .flatMap(([brand, models]) => models.map((name) => createString(brand, name)));

const unique = new Map();
allModels.forEach((item) => {
  const key = keyFor(item.brand, item.name);
  if (!unique.has(key)) unique.set(key, item);
});

export const STRING_DATABASE = Array.from(unique.values()).sort((a, b) => {
  const brandCompare = a.brand.localeCompare(b.brand);
  return brandCompare || a.name.localeCompare(b.name);
});
