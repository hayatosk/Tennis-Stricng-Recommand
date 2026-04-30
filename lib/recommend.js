import { STRING_DATABASE } from './stringDatabase.js';

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function normalizePriority(value) {
  return clamp(Number(value || 3), 1, 5) / 5;
}

function getStyleBoost(style = '') {
  if (style.includes('스핀')) return { spin: 1.2, control: 1.0, power: 0.9 };
  if (style.includes('공격형')) return { power: 1.1, spin: 1.1, control: 1.0 };
  if (style.includes('서브앤발리')) return { control: 1.2, comfort: 1.0, power: 1.0 };
  if (style.includes('플랫')) return { control: 1.2, power: 1.1, spin: 0.8 };
  return { power: 1.0, spin: 1.0, control: 1.0, comfort: 1.0 };
}

function getSwingProfile(form = {}) {
  const swing = form.swing || '';
  const analysis = form.swing_analysis || {};
  const profile = {
    targetDelta: { power: 0, spin: 0, control: 0, comfort: 0 },
    weights: { power: 1, spin: 1, control: 1, comfort: 1 },
  };

  if (swing.includes('매우 빠름')) {
    profile.targetDelta.spin += 1;
    profile.targetDelta.control += 1;
    profile.weights.spin += 0.12;
    profile.weights.control += 0.12;
  } else if (swing.includes('빠름')) {
    profile.targetDelta.spin += 0.5;
    profile.targetDelta.control += 0.5;
    profile.weights.spin += 0.08;
  } else if (swing.includes('느림')) {
    profile.targetDelta.power += 1;
    profile.targetDelta.comfort += 0.5;
    profile.weights.power += 0.12;
  }

  if (analysis.spin_profile === 'heavy' || analysis.swing_path === 'low-to-high') {
    profile.targetDelta.spin += 1;
    profile.weights.spin += 0.14;
  }
  if (analysis.spin_profile === 'flat' || analysis.swing_path === 'flat') {
    profile.targetDelta.control += 0.8;
    profile.targetDelta.power += 0.4;
    profile.weights.control += 0.12;
  }
  if (analysis.contact_timing === 'late') {
    profile.targetDelta.power += 0.6;
    profile.targetDelta.comfort += 0.4;
  }

  return profile;
}

function getArmPenalty(arm = '', string) {
  if (arm.includes('현재 통증') || arm.includes('회복')) {
    return string.stiffness > 64 ? 18 : 0;
  }
  if (arm.includes('엘보')) {
    return string.stiffness > 62 ? 14 : 0;
  }
  if (arm.includes('약간')) {
    return string.stiffness > 66 ? 7 : 0;
  }
  return 0;
}

function normalizeSearchText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^a-z0-9가-힣]+/g, '');
}

const STRING_ALIASES = {
  'solinco|hyper-g': ['hyperg', 'hyper-g', '하이퍼g', '하이퍼지'],
  'solinco|hyper-g soft': ['hypergsoft', 'hyper-gsoft', '하이퍼g소프트', '하이퍼지소프트'],
  'solinco|tour bite': ['tourbite', '투어바이트'],
  'solinco|confidential': ['confidential', '컨피덴셜'],
  'luxilon|alu power': ['alupower', '알루파워'],
  'luxilon|alu power rough': ['alupowerrough', '알루파워러프'],
  'babolat|rpm blast': ['rpmblast', '알피엠블라스트'],
  'babolat|rpm blast rough': ['rpmblastrough', '알피엠블라스트러프'],
  'babolat|rpm soft': ['rpmsoft', '알피엠소프트'],
  'babolat|rpm team': ['rpmteam', '알피엠팀'],
  'yonex|poly tour pro': ['polytourpro', 'poly tour pro', '폴리투어프로'],
  'yonex|poly tour rev': ['polytourrev', 'poly tour rev', '폴리투어레브', '폴리투어rev'],
  'yonex|poly tour strike': ['polytourstrike', 'poly tour strike', '폴리투어스트라이크'],
  'yonex|poly tour spin': ['polytourspin', 'poly tour spin', '폴리투어스핀'],
  'yonex|poly tour fire': ['polytourfire', 'poly tour fire', '폴리투어파이어'],
  'head|lynx': ['lynx', '링스'],
  'head|lynx tour': ['lynxtour', '링스투어'],
  'head|hawk': ['hawk', '호크'],
  'head|hawk touch': ['hawktouch', '호크터치'],
  'head|hawk power': ['hawkpower', '호크파워'],
  'tecnifibre|black code 4s': ['blackcode4s', '블랙코드4s'],
  'tecnifibre|x-one biphase': ['xonebiphase', 'x-onebiphase', 'xone', '엑스원바이페이즈'],
  'wilson|nxt': ['nxt', '엔엑스티'],
  'wilson|revolve': ['revolve', '리볼브'],
};

function getRequestedStringPreference(form, string) {
  const request = normalizeSearchText(form.improvement_request || '');
  if (!request) return { bonus: 0, narrative: '' };

  const brand = normalizeSearchText(string.brand);
  const name = normalizeSearchText(string.name);
  const fullName = normalizeSearchText(`${string.brand} ${string.name}`);
  const compactBrandName = normalizeSearchText(`${string.brand}${string.name}`);
  const key = `${string.brand}|${string.name}`.toLowerCase();
  const aliases = (STRING_ALIASES[key] || []).map(normalizeSearchText);

  let bonus = 0;
  if (brand.length >= 4 && request.includes(brand)) bonus += 10;
  if (name.length >= 4 && request.includes(name)) bonus += 28;
  if (request.includes(fullName) || request.includes(compactBrandName)) bonus += 12;
  if (aliases.some((alias) => alias.length >= 3 && request.includes(alias))) bonus += 30;

  if (!bonus) return { bonus: 0, narrative: '' };

  return {
    bonus: Math.min(42, bonus),
    narrative: `${string.brand} ${string.name}은 개선사항에 입력한 브랜드/라인업과 직접 연관되어 우선 검토했습니다.`,
  };
}

function parseCurrentStringInfluence(form, string) {
  const current = `${form.current_string || ''} ${form.cross_string || ''}`.toLowerCase();
  let bonus = 0;
  let narrative = '';

  if (!current.trim()) return { bonus, narrative };

  if (current.includes('hyper-g') && string.name.includes('Hyper-G Soft')) {
    bonus += 8;
    narrative = '현재 Hyper-G 계열에서 더 부드러운 방향으로 이동하는 업그레이드형 선택입니다.';
  } else if (current.includes('alu') && string.name.includes('ALU Power')) {
    bonus += 5;
    narrative = '현재 사용 감각을 크게 해치지 않으면서 익숙한 타구감을 유지하기 쉽습니다.';
  } else if (current.includes('lynx') && string.name.includes('Lynx Tour')) {
    bonus += 5;
    narrative = '현재 헤드 계열 스트링 감각과의 연속성이 있습니다.';
  }

  if ((form.satisfaction || '').includes('불만족')) bonus -= narrative ? 2 : 0;
  return { bonus, narrative };
}

function toDataCells(string) {
  return [
    { key: '소재', value: string.family },
    { key: '게이지', value: string.gauge_label },
    { key: '형상', value: string.shape },
    { key: '추천 텐션', value: string.recommended_tension },
    { key: '가격대', value: string.price_band },
    { key: '강성', value: `${string.stiffness}` },
  ];
}

function buildReason(form, string, gaps, requestedPreference) {
  const priorities = [];
  if (form.priorities.spin >= 4) priorities.push('스핀');
  if (form.priorities.power >= 4) priorities.push('파워');
  if (form.priorities.control >= 4) priorities.push('컨트롤');
  if (form.priorities.comfort >= 4) priorities.push('컴포트');

  const strongest = Object.entries(gaps).sort((a, b) => a[1] - b[1])[0]?.[0];
  const map = { power: '반발력', spin: '회전량', control: '안정감', comfort: '팔 편안함' };

  const shapeNote = {
    square: '사각형 단면으로 강한 볼 바이트',
    pentagon: '오각형 단면으로 스핀·컨트롤 균형',
    hexagon: '육각형 단면으로 명확한 타구 응답',
    octagon: '팔각형 단면으로 강렬한 스핀',
    star: '별 모양 단면으로 최대 스핀 효과',
    round: '원형 단면으로 부드럽고 균일한 반발',
  }[string.shape] || '';

  const armNote = string.arm_friendly ? '팔 부담이 적고' : '하드 히터에 최적화된';
  const priorityStr = priorities.join('·') || '밸런스';

  const requestedNote = requestedPreference?.narrative ? `${requestedPreference.narrative} ` : '';
  return `${requestedNote}${shapeNote ? shapeNote + ', ' : ''}${armNote} ${priorityStr} 중심 선택입니다. 특히 ${map[strongest] || '전체 밸런스'} 면에서 입력 성향과 높은 매칭을 보입니다.`;
}

function getTargetPlayer(string) {
  if (string.family === 'natural gut') return '타구감과 장력 유지를 최우선으로 하는 모든 레벨 플레이어.';
  if (string.family === 'multifilament') return '팔 보호가 최우선이며 부드러운 타구감을 원하는 플레이어.';
  const parts = [];
  if (string.arm_friendly && string.specs.comfort >= 8) parts.push('팔 부담에 민감한');
  else if (!string.arm_friendly && string.stiffness >= 70) parts.push('딱딱한 폴리에 익숙한 하드 히터');
  if (string.specs.spin >= 9) parts.push('강한 스핀을 원하는');
  else if (string.specs.control >= 9) parts.push('정밀한 컨트롤 위주의');
  else if (string.specs.power >= 9) parts.push('높은 반발력을 중시하는');
  else if (string.specs.durability >= 9) parts.push('내구성을 우선시하는');
  if (!parts.length) parts.push('밸런스형 플레이를 원하는');
  return parts.slice(0, 2).join(' ') + ' 플레이어.';
}

function getVsCurrentScores(form, string) {
  if (!form.current_string?.trim()) return null;
  const name = form.current_string.toLowerCase();
  const current = STRING_DATABASE.find(
    (item) => name.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(name),
  );
  if (!current) return null;
  const LABELS = { power: '파워', spin: '스핀', control: '컨트롤', comfort: '편안함', durability: '내구성' };
  return Object.entries(LABELS)
    .map(([key, label]) => ({ label, diff: string.specs[key] - current.specs[key] }))
    .filter(({ diff }) => Math.abs(diff) >= 1);
}

function findCurrentString(form) {
  if (!form.current_string?.trim()) return null;
  const name = form.current_string.toLowerCase();
  return STRING_DATABASE.find(
    (item) => name.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(name),
  ) || null;
}

function hasFinalConsonant(text = '') {
  const char = String(text).trim().slice(-1);
  const code = char.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
}

function subjectParticle(text) {
  return hasFinalConsonant(text) ? '이' : '가';
}

function objectParticle(text) {
  return hasFinalConsonant(text) ? '을' : '를';
}

function comparisonText(form, string, currentInfluence, requestedPreference, shapePreference) {
  const current = findCurrentString(form);
  const fallback = currentInfluence.narrative || requestedPreference.narrative || shapePreference.narrative || '';
  if (!form.current_string?.trim()) return fallback || null;

  if (!current) {
    return {
      summary: fallback || `현재 입력한 ${form.current_string}은 DB에서 정확히 특정하지 못해, 입력한 우선순위와 형상을 기준으로 비교했습니다.`,
      advantages: [`${string.brand} ${string.name}의 강점인 ${topSpecLabels(string.specs).join(', ')} 성향을 기준으로 현재 세팅의 부족한 체감을 보완합니다.`],
      cautions: ['현재 스트링의 실제 스펙을 특정하지 못했으므로 첫 세팅은 기존 텐션보다 1-2lbs 낮게 테스트하는 편이 안전합니다.'],
    };
  }

  const labels = { power: '파워', spin: '스핀', control: '컨트롤', comfort: '편안함', durability: '내구성', tension_stability: '장력 유지' };
  const diffs = Object.keys(labels)
    .map((key) => ({ key, label: labels[key], diff: (string.specs[key] || 5) - (current.specs[key] || 5) }))
    .filter(({ diff }) => Math.abs(diff) >= 1)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  const advantages = diffs
    .filter(({ diff }) => diff > 0)
    .slice(0, 3)
    .map(({ label, diff }) => `${label}${subjectParticle(label)} 현재 ${current.name}보다 +${diff} 높아 해당 체감이 좋아질 가능성이 큽니다.`);

  const cautions = diffs
    .filter(({ diff }) => diff < 0)
    .slice(0, 3)
    .map(({ label, diff }) => `${label}${hasFinalConsonant(label) ? '은' : '는'} 현재 ${current.name}보다 ${diff} 낮아 풀잡에서는 이 부분이 아쉬울 수 있습니다.`);

  return {
    summary: fallback || `현재 ${current.name} 대비 ${diffs.slice(0, 3).map(({ label, diff }) => `${label} ${diff > 0 ? '+' : ''}${diff}`).join(', ')} 차이가 있습니다.`,
    advantages: advantages.length ? advantages : ['현재 스트링과 큰 방향성은 비슷하지만 목표 우선순위와 더 안정적으로 맞습니다.'],
    cautions: cautions.length ? cautions : ['뚜렷한 약점 하락은 크지 않아 전환 부담이 비교적 낮습니다.'],
  };
}

function topSpecLabels(specs) {
  return Object.entries(specs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => ({
      power: '파워',
      spin: '스핀',
      control: '컨트롤',
      comfort: '편안함',
      durability: '내구성',
      tension_stability: '장력 유지',
    })[key] || key);
}

function isPolyString(string) {
  return /poly|co-poly|mono/i.test(`${string.family || ''} ${string.type || ''}`);
}

function isComfortString(string) {
  return /multi|gut|nylon|synthetic/i.test(`${string.family || ''} ${string.type || ''}`) || string.specs.comfort >= 8;
}

function recommendedCrossOptions(string, form) {
  if (form.cross_string?.trim()) return form.cross_string.trim();
  if (string.specs.comfort <= 6) return 'Wilson NXT, Tecnifibre X-One Biphase, Head Velocity MLT';
  if (string.specs.power >= 8) return 'Head Hawk Touch, Yonex Poly Tour Pro, Wilson Revolve';
  return 'Wilson NXT 또는 부드러운 라운드 폴리';
}

function recommendedMainOptions(string, form) {
  if (form.current_string?.trim()) return form.current_string.trim();
  if (string.specs.comfort >= 8) return 'Solinco Hyper-G, Head Lynx Tour, Yonex Poly Tour Rev';
  return `${string.brand} ${string.name}`;
}

function getHybridRole(form, string) {
  const bestAsMain = isPolyString(string) && (string.specs.spin >= 8 || string.specs.control >= 8 || string.specs.durability >= 8);
  const bestAsCross = isComfortString(string) && string.specs.spin <= 7;
  const position = bestAsMain || !bestAsCross ? '메인 추천' : '크로스 추천';
  const crossOptions = recommendedCrossOptions(string, form);
  const mainOptions = recommendedMainOptions(string, form);
  const fullBed =
    string.specs.comfort >= 8
      ? `${string.brand} ${string.name}${objectParticle(string.name)} 풀잡으로 쓰면 편안함과 반발이 잘 살아나고 세팅이 단순합니다. 다만 메인 폴리 하이브리드보다 스핀 bite와 내구성은 덜할 수 있습니다.`
      : `${string.brand} ${string.name}${objectParticle(string.name)} 풀잡으로 쓰면 ${topSpecLabels(string.specs).join('/')} 성향이 가장 선명하게 나옵니다. 대신 장시간 플레이에서는 충격과 피로감이 커질 수 있어 편안함 보완이 필요할 수 있습니다.`;

  const asMain = `${string.name}${objectParticle(string.name)} 메인에 쓰면 스윙 때 공을 물고 나가는 역할을 맡아 ${topSpecLabels(string.specs).join('/')} 성향이 가장 크게 체감됩니다. 하이브리드 크로스는 ${crossOptions} 조합을 추천합니다. 이렇게 쓰면 풀잡보다 충격이 줄고, 크로스의 반발/포켓감이 더해져 랠리 지속성이 좋아집니다.`;
  const asCross = `${string.name}${objectParticle(string.name)} 크로스에 쓰면 메인 스트링의 스핀과 방향성은 유지하면서 충격 완화, 반발 보정, 포켓감을 담당합니다. 메인은 ${mainOptions}처럼 스핀/컨트롤을 잡아주는 스트링이 좋습니다. 이 방식은 풀잡보다 성향은 덜 선명하지만 팔 부담과 타구감 안정성이 좋아집니다.`;

  return {
    position,
    full_bed: fullBed,
    as_main: asMain,
    as_cross: asCross,
    recommendation: position === '메인 추천' ? asMain : asCross,
  };
}

function normalizeShape(value = '') {
  const text = String(value).toLowerCase();
  if (!text) return '';
  if (/round|원형/.test(text)) return 'round';
  if (/rough|러프/.test(text)) return 'rough';
  if (/4|5|6|7|8|side|sided|shaped|square|pentagon|hexagon|octagon|star|각|사각|오각|육각|칠각|팔각|별/.test(text)) return 'shaped';
  return text;
}

function specsFromShape(shapeValue = '') {
  const shape = normalizeShape(shapeValue);
  if (shape === 'shaped' || shape === 'rough') {
    return { power: 6, spin: 8, control: 8, comfort: 5 };
  }
  if (shape === 'round') {
    return { power: 7, spin: 6, control: 7, comfort: 7 };
  }
  return null;
}

function mergeCurrentSpecs(baseSpecs, form) {
  const shapeSpecs = specsFromShape(form.current_shape);
  if (!shapeSpecs) return baseSpecs;
  return {
    power: Math.round((baseSpecs.power + shapeSpecs.power) / 2),
    spin: Math.max(baseSpecs.spin, shapeSpecs.spin),
    control: Math.max(baseSpecs.control, shapeSpecs.control),
    comfort: Math.min(baseSpecs.comfort, shapeSpecs.comfort),
  };
}

function getShapePreference(form, string) {
  const currentShape = normalizeShape(form.current_shape);
  if (!currentShape || (form.satisfaction || '').includes('불만족')) return { bonus: 0, narrative: '' };
  const candidateShape = normalizeShape(string.shape);

  if ((currentShape === 'shaped' || currentShape === 'rough') && candidateShape !== 'round') {
    return {
      bonus: form.priorities.spin >= 4 || form.priorities.control >= 4 ? 5 : 3,
      narrative: '현재 사용 중인 각형/러프 계열 형상을 반영해 스핀과 컨트롤 연결성이 있는 후보를 우선했습니다.',
    };
  }

  if (currentShape === 'round' && candidateShape === 'round') {
    return {
      bonus: form.priorities.comfort >= 4 || form.priorities.power >= 4 ? 4 : 2,
      narrative: '현재 사용 중인 원형 스트링의 부드럽고 예측 가능한 타구감을 고려했습니다.',
    };
  }

  return { bonus: 0, narrative: '' };
}

export function analyzeCurrentString(form) {
  if (!form.current_string?.trim()) return null;
  const target = {
    power: form.priorities.power * 2,
    spin: form.priorities.spin * 2,
    control: form.priorities.control * 2,
    comfort: form.priorities.comfort * 2,
  };

  const name = form.current_string.toLowerCase();
  const similar = STRING_DATABASE.find(item => name.includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(name));
  const specs = mergeCurrentSpecs(similar?.specs || { power: 6, spin: 6, control: 6, comfort: 6 }, form);
  const fitScore = clamp(
    100 - (
      Math.abs(specs.power - target.power) * 4 +
      Math.abs(specs.spin - target.spin) * 4 +
      Math.abs(specs.control - target.control) * 4 +
      Math.abs(specs.comfort - target.comfort) * 4
    ),
    35,
    94,
  );

  const verdicts = [];
  if (form.priorities.comfort >= 4 && specs.comfort <= 6) verdicts.push({ type: 'warn', text: '원하는 편안함보다 다소 딱딱할 수 있어요.' });
  if (form.priorities.spin >= 4 && specs.spin >= 8) verdicts.push({ type: 'good', text: '스핀 성향과는 잘 맞는 편입니다.' });
  if ((form.satisfaction || '').includes('불만족')) verdicts.push({ type: 'bad', text: '현재 만족도가 낮아 교체 효과가 클 수 있어요.' });
  if (!verdicts.length) verdicts.push({ type: 'good', text: '전체적으로 무난한 매칭입니다.' });

  return {
    string_name: form.current_string + (form.cross_string ? ` + ${form.cross_string}` : ''),
    shape: [form.current_shape, form.cross_shape].filter(Boolean).join(' / '),
    gauge: [form.current_gauge, form.cross_gauge].filter(Boolean).join(' / '),
    tension: form.main_tension ? `메인 ${form.main_tension}${form.cross_tension ? ` / 크로스 ${form.cross_tension}` : ''}` : '',
    fit_score: fitScore,
    verdicts,
    summary: `현재 스트링은 입력된 우선순위와 ${fitScore >= 75 ? '상당히 잘 맞는 편' : fitScore >= 55 ? '부분적으로 맞는 편' : '아쉬움이 있는 편'}입니다. 특히 ${form.priorities.comfort >= 4 ? '컴포트' : form.priorities.control >= 4 ? '컨트롤' : '주요 성능'} 관점에서 비교 추천을 보는 가치가 있습니다.`,
  };
}

export function getRuleBasedRecommendations(form) {
  const weights = {
    power: normalizePriority(form.priorities.power),
    spin: normalizePriority(form.priorities.spin),
    control: normalizePriority(form.priorities.control),
    comfort: normalizePriority(form.priorities.comfort),
    durability: /내구/.test(form.improvement_request || '') ? 1.0 : 0.45,
    tension_stability: /장력|텐션/.test(form.improvement_request || '') ? 0.9 : 0.4,
  };
  const targets = {
    power: clamp(form.priorities.power * 2, 1, 10),
    spin: clamp(form.priorities.spin * 2, 1, 10),
    control: clamp(form.priorities.control * 2, 1, 10),
    comfort: clamp(form.priorities.comfort * 2, 1, 10),
  };
  const styleBoost = getStyleBoost(form.play_style);
  const swingProfile = getSwingProfile(form);
  Object.keys(targets).forEach((key) => {
    targets[key] = clamp(targets[key] + (swingProfile.targetDelta[key] || 0), 1, 10);
  });

  return STRING_DATABASE.map((string) => {
    const gaps = {
      power: Math.abs(targets.power - string.specs.power),
      spin: Math.abs(targets.spin - string.specs.spin),
      control: Math.abs(targets.control - string.specs.control),
      comfort: Math.abs(targets.comfort - string.specs.comfort),
    };

    let base = 100;
    base -= gaps.power * 8 * (weights.power * (styleBoost.power || 1) * (swingProfile.weights.power || 1));
    base -= gaps.spin * 8 * (weights.spin * (styleBoost.spin || 1) * (swingProfile.weights.spin || 1));
    base -= gaps.control * 8 * (weights.control * (styleBoost.control || 1) * (swingProfile.weights.control || 1));
    base -= gaps.comfort * 8 * (weights.comfort * (styleBoost.comfort || 1) * (swingProfile.weights.comfort || 1));
    base -= Math.abs((weights.durability * 10) - string.specs.durability) * 1.5;
    base -= Math.abs((weights.tension_stability * 10) - string.specs.tension_stability) * 1.5;

    if (form.priorities.comfort >= 4 && !string.arm_friendly) base -= 6;
    base -= getArmPenalty(form.arm, string);

    const currentInfluence = parseCurrentStringInfluence(form, string);
    base += currentInfluence.bonus;
    const requestedPreference = getRequestedStringPreference(form, string);
    base += requestedPreference.bonus;
    const shapePreference = getShapePreference(form, string);
    base += shapePreference.bonus;

    const match_score = clamp(Math.round(base), 45, 98);
    return {
      ...string,
      match_score,
      data: toDataCells(string),
      reason: buildReason(form, string, gaps, requestedPreference),
      target_player: getTargetPlayer(string),
      vs_current: comparisonText(form, string, currentInfluence, requestedPreference, shapePreference),
      vs_current_scores: getVsCurrentScores(form, string),
      hybrid_combo: getHybridRole(form, string),
    };
  })
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 5);
}
