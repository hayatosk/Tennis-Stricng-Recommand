import { STRING_DATABASE } from './stringDatabase';

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

function buildReason(form, string, gaps) {
  const priorities = [];
  if (form.priorities.spin >= 4) priorities.push('스핀');
  if (form.priorities.power >= 4) priorities.push('파워');
  if (form.priorities.control >= 4) priorities.push('컨트롤');
  if (form.priorities.comfort >= 4) priorities.push('컴포트');

  const strongest = Object.entries(gaps).sort((a, b) => a[1] - b[1])[0]?.[0];
  const map = { power: '반발력', spin: '회전량', control: '안정감', comfort: '팔 편안함' };

  return `${form.level} 수준의 ${form.play_style} 플레이어에게 맞는 조합입니다. 현재 우선순위인 ${priorities.join(', ') || '밸런스'}를 반영했고, 특히 ${map[strongest] || '전체 밸런스'} 쪽에서 입력 성향과 잘 맞습니다.`;
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
  const specs = similar?.specs || { power: 6, spin: 6, control: 6, comfort: 6 };
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
    gauge: form.current_gauge || '',
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

  return STRING_DATABASE.map((string) => {
    const gaps = {
      power: Math.abs(targets.power - string.specs.power),
      spin: Math.abs(targets.spin - string.specs.spin),
      control: Math.abs(targets.control - string.specs.control),
      comfort: Math.abs(targets.comfort - string.specs.comfort),
    };

    let base = 100;
    base -= gaps.power * 8 * (weights.power * (styleBoost.power || 1));
    base -= gaps.spin * 8 * (weights.spin * (styleBoost.spin || 1));
    base -= gaps.control * 8 * (weights.control * (styleBoost.control || 1));
    base -= gaps.comfort * 8 * (weights.comfort * (styleBoost.comfort || 1));
    base -= Math.abs((weights.durability * 10) - string.specs.durability) * 1.5;
    base -= Math.abs((weights.tension_stability * 10) - string.specs.tension_stability) * 1.5;

    if (form.priorities.comfort >= 4 && !string.arm_friendly) base -= 6;
    base -= getArmPenalty(form.arm, string);

    const currentInfluence = parseCurrentStringInfluence(form, string);
    base += currentInfluence.bonus;

    const match_score = clamp(Math.round(base), 45, 98);
    return {
      ...string,
      match_score,
      data: toDataCells(string),
      reason: buildReason(form, string, gaps),
      vs_current: currentInfluence.narrative || null,
      hybrid_combo: form.cross_string ? `${string.name}를 메인으로 두고 현재 크로스 세팅과 비교 테스트해보면 차이를 느끼기 좋습니다.` : null,
    };
  })
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 5);
}
