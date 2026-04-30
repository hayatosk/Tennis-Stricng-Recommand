import { useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BACK_LINK_CLS, CARD_CLS, CONTENT_WRAP, EYEBROW_CLS, PAGE_SHELL } from '../components/LogUI';
import { getAllLogs } from '../lib/logStorage';
import { STRING_DATABASE } from '../lib/stringDatabase';

const EMPTY_ANALYSIS = {
  stroke_label: '',
  stroke_confidence: '',
  handedness: '',
  swing: '',
  play_style: '',
  summary: '',
  observations: [],
  spin_profile: '',
  swing_path: '',
  contact_timing: '',
};

const SPEC_LABELS = {
  power: '파워',
  spin: '스핀',
  control: '컨트롤',
  comfort: '편안함',
  durability: '내구성',
  tension_stability: '텐션 유지력',
};

const SCORE_KEYS = ['power', 'spin', 'control', 'comfort', 'durability', 'tension_stability'];

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function getRacketKey(log) {
  return [log.racketBrand, log.racketModel, log.racketNumber].filter(Boolean).join(' | ') || '라켓 미입력';
}

function stringName(brand, model) {
  return [brand, model].filter(Boolean).join(' ');
}

function average(logs, key, fallback = 5) {
  const values = logs.map((log) => Number(log[key])).filter(Number.isFinite);
  if (!values.length) return fallback;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function findDbString(name = '') {
  const lowered = name.toLowerCase();
  if (!lowered.trim()) return null;
  return STRING_DATABASE.find((item) => {
    const dbName = `${item.brand} ${item.name}`.toLowerCase();
    return lowered.includes(item.name.toLowerCase()) || dbName.includes(lowered) || lowered.includes(dbName);
  }) || null;
}

function topSpecLabels(specs) {
  return Object.entries(specs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => SPEC_LABELS[key] || key);
}

function matchedSpecLabels(item, targets) {
  return SCORE_KEYS
    .map((key) => ({
      key,
      label: SPEC_LABELS[key] || key,
      diff: Math.abs((item.specs[key] || 5) - (targets[key] || 5)),
      value: item.specs[key] || 5,
    }))
    .sort((a, b) => a.diff - b.diff || b.value - a.value)
    .slice(0, 3)
    .map(({ label, value }) => `${label} ${value}/10`);
}

function normalizeSearchText(value = '') {
  return String(value)
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^a-z0-9가-힣]+/g, '');
}

const REQUEST_ALIASES = {
  'solinco|hyper-g': ['hyperg', 'hyper-g', '하이퍼g', '하이퍼지'],
  'solinco|hyper-g soft': ['hypergsoft', 'hyper-gsoft', '하이퍼g소프트', '하이퍼지소프트'],
  'solinco|tour bite': ['tourbite', '투어바이트'],
  'solinco|confidential': ['confidential', '컨피덴셜'],
  'luxilon|alu power': ['alupower', '알루파워'],
  'babolat|rpm blast': ['rpmblast', '알피엠블라스트'],
  'babolat|rpm blast rough': ['rpmblastrough', '알피엠블라스트러프'],
  'tecnifibre|black code 4s': ['blackcode4s', '블랙코드4s'],
  'yonex|poly tour rev': ['polytourrev', '폴리투어레브', '폴리투어rev'],
  'head|lynx tour': ['lynxtour', '링스투어'],
  'wilson|revolve spin': ['revolvespin', '리볼브스핀'],
  'volkl|cyclone': ['cyclone', '사이클론'],
  'msv|focus hex': ['focushex', '포커스헥스'],
};

function getImprovementProfile(request = '') {
  const text = request.toLowerCase();
  const profile = {
    labels: [],
    boosts: {
      power: 0,
      spin: 0,
      control: 0,
      comfort: 0,
      durability: 0,
      tension_stability: 0,
    },
  };

  const add = (key, label, amount) => {
    profile.boosts[key] += amount;
    if (!profile.labels.includes(label)) profile.labels.push(label);
  };

  if (/스핀|spin|회전/.test(text)) add('spin', '스핀 향상', 1.2);
  if (/파워|power|반발|힘/.test(text)) add('power', '파워/반발 향상', 1.2);
  if (/컨트롤|control|안정|방향/.test(text)) add('control', '컨트롤 안정', 1.2);
  if (/편안|comfort|팔|엘보|충격|부드/.test(text)) add('comfort', '팔 부담 완화', 1.5);
  if (/내구|durability|오래|끊|수명/.test(text)) add('durability', '내구성 강화', 1.4);
  if (/텐션|장력|유지/.test(text)) add('tension_stability', '텐션 유지력', 1.2);

  return profile;
}

function getRequestMatch(item, request = '') {
  const normalizedRequest = normalizeSearchText(request);
  if (!normalizedRequest) return { bonus: 0, note: '' };

  const key = `${item.brand}|${item.name}`.toLowerCase();
  const brand = normalizeSearchText(item.brand);
  const name = normalizeSearchText(item.name);
  const fullName = normalizeSearchText(`${item.brand} ${item.name}`);
  const aliases = (REQUEST_ALIASES[key] || []).map(normalizeSearchText);
  const requestedReferences = STRING_DATABASE
    .filter((candidate) => {
      const candidateKey = `${candidate.brand}|${candidate.name}`.toLowerCase();
      const candidateName = normalizeSearchText(candidate.name);
      const candidateFull = normalizeSearchText(`${candidate.brand} ${candidate.name}`);
      const candidateAliases = (REQUEST_ALIASES[candidateKey] || []).map(normalizeSearchText);
      return (
        normalizedRequest.includes(candidateFull) ||
        (candidateName.length >= 4 && normalizedRequest.includes(candidateName)) ||
        candidateAliases.some((alias) => alias.length >= 3 && normalizedRequest.includes(alias))
      );
    });

  let bonus = 0;
  const direct =
    normalizedRequest.includes(fullName) ||
    (name.length >= 4 && normalizedRequest.includes(name)) ||
    aliases.some((alias) => alias.length >= 3 && normalizedRequest.includes(alias));

  if (direct) bonus += 80;
  else if (brand.length >= 4 && normalizedRequest.includes(brand)) bonus += 24;

  const reference = requestedReferences[0];
  if (reference && reference.id !== item.id && /처럼|같은|비슷|유사/.test(request)) {
    const specSimilarity =
      (10 - Math.abs(item.specs.spin - reference.specs.spin)) * 1.8 +
      (10 - Math.abs(item.specs.control - reference.specs.control)) * 1.2 +
      (10 - Math.abs(item.specs.power - reference.specs.power)) * 0.8 +
      (10 - Math.abs(item.specs.comfort - reference.specs.comfort)) * 0.7;
    bonus += Math.max(0, specSimilarity - 20);
  }

  if (/스핀|spin|회전/.test(request) && item.specs.spin >= 9) bonus += 18;
  if (/컨트롤|control|안정/.test(request) && item.specs.control >= 8) bonus += 10;
  if (/팔|편안|부드|comfort|soft/.test(request) && item.specs.comfort >= 8) bonus += 12;
  if (/내구|오래|durability/.test(request) && item.specs.durability >= 8) bonus += 10;

  if (!bonus) return { bonus: 0, note: '' };

  const note = direct
    ? `개선/요구사항에 ${item.brand} ${item.name}이 직접 언급되어 최우선 후보로 반영했습니다.`
    : reference
      ? `개선/요구사항의 ${reference.brand} ${reference.name} 유사 성향 요청을 반영했습니다.`
      : '개선/요구사항에 입력한 성향을 강하게 반영했습니다.';

  return { bonus, note };
}

function buildTargets(logs, swingAnalysis, improvementProfile) {
  const targets = {
    power: average(logs, 'power'),
    spin: average(logs, 'spin'),
    control: average(logs, 'control'),
    comfort: average(logs, 'comfort'),
    durability: average(logs, 'durability'),
    tension_stability: 7,
  };

  if (swingAnalysis?.spin_profile === 'heavy' || swingAnalysis?.swing_path === 'low-to-high') {
    targets.spin += 1;
    targets.control += 0.4;
  }
  if (swingAnalysis?.spin_profile === 'flat' || swingAnalysis?.swing_path === 'flat') {
    targets.control += 0.9;
    targets.power += 0.4;
  }
  if (swingAnalysis?.contact_timing === 'late') {
    targets.power += 0.7;
    targets.comfort += 0.3;
  }

  Object.entries(improvementProfile.boosts).forEach(([key, boost]) => {
    targets[key] += boost;
  });

  Object.keys(targets).forEach((key) => {
    targets[key] = clamp(targets[key], 1, 10);
  });
  return targets;
}

function buildCombinedAnalysis(logs, swingAnalysis, improvementProfile, preferenceProfile = getPreferenceProfile(logs)) {
  const latest = logs[0];
  const base = `최근 세팅은 ${stringName(latest.mainStringBrand, latest.mainString) || '메인 미입력'}${stringName(latest.crossStringBrand, latest.crossString) ? ` x ${stringName(latest.crossStringBrand, latest.crossString)}` : ''}이고, 누적 로그 평균은 파워 ${average(logs, 'power').toFixed(1)}, 스핀 ${average(logs, 'spin').toFixed(1)}, 컨트롤 ${average(logs, 'control').toFixed(1)}, 편안함 ${average(logs, 'comfort').toFixed(1)}입니다.`;
  const video = swingAnalysis?.summary
    ? `영상 분석은 ${swingAnalysis.stroke_label || '스트로크'} / ${swingAnalysis.swing || '스윙'} / ${swingAnalysis.play_style || '플레이 스타일'} 경향으로 반영했습니다.`
    : '영상 분석은 추가되지 않아 로그 기록 중심으로 판단했습니다.';
  const improvement = improvementProfile.labels.length
    ? `개선 의도는 ${improvementProfile.labels.join(', ')}로 해석했습니다.`
    : '별도 개선/요구사항은 없어 기존 로그 성향을 우선했습니다.';

  const preference = preferenceSummary(preferenceProfile)
    ? `선호 정보는 ${preferenceSummary(preferenceProfile)}를 추천 점수에 반영했습니다.`
    : '별도 선호 스트링 정보는 없어 로그 체감 점수를 중심으로 계산했습니다.';

  return `${base} ${video} ${improvement} ${preference}`;
}

function getPreferenceProfile(logs) {
  const brands = [...new Set(logs.map((log) => log.preferredStringBrand).filter(Boolean))];
  const models = [...new Set(logs.map((log) => log.preferredStringModel).filter(Boolean))];
  const text = logs
    .map((log) => [log.preferredStringBrand, log.preferredStringModel, log.preferredStringTraits].filter(Boolean).join(' '))
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return { brands, models, text };
}

function preferenceSummary(profile) {
  const parts = [];
  if (profile.brands.length) parts.push(`선호 브랜드 ${profile.brands.slice(0, 3).join(', ')}`);
  if (profile.models.length) parts.push(`선호 모델 ${profile.models.slice(0, 3).join(', ')}`);
  if (profile.text) parts.push('입력한 선호 성향');
  return parts.join(', ');
}

function getPreferenceBonus(item, profile) {
  if (!profile.brands.length && !profile.models.length && !profile.text) return 0;

  let bonus = 0;
  const itemBrand = item.brand.toLowerCase();
  const itemName = item.name.toLowerCase();
  const text = profile.text;

  if (profile.brands.some((brand) => brand.toLowerCase() === itemBrand)) bonus += 8;
  if (profile.models.some((model) => {
    const normalized = model.toLowerCase();
    return itemName.includes(normalized) || normalized.includes(itemName);
  })) bonus += 6;

  if (/spin|스핀|회전/.test(text)) bonus += item.specs.spin * 0.55;
  if (/power|파워|반발/.test(text)) bonus += item.specs.power * 0.55;
  if (/control|컨트롤|안정/.test(text)) bonus += item.specs.control * 0.55;
  if (/comfort|편안|부드|팔|soft/.test(text)) bonus += item.specs.comfort * 0.65;
  if (/durability|내구|오래/.test(text)) bonus += item.specs.durability * 0.5;
  if (/tension|텐션|유지|장력/.test(text)) bonus += item.specs.tension_stability * 0.5;
  if (/poly|폴리/.test(text) && item.family?.includes('poly')) bonus += 4;
  if (/multi|멀티/.test(text) && item.family?.includes('multifilament')) bonus += 5;
  if (/gut|거트/.test(text) && item.family?.includes('gut')) bonus += 5;
  if (/round|원형/.test(text) && item.shape === 'round') bonus += 3;
  if (/shaped|각형|모양|스핀형/.test(text) && item.shape !== 'round') bonus += 3;

  return bonus;
}

function getScoreWeights(logs, improvementProfile, swingAnalysis) {
  const weights = {
    power: 5.5,
    spin: 6,
    control: 6,
    comfort: 6,
    durability: 3.5,
    tension_stability: 2.4,
  };

  if (improvementProfile.labels.includes('스핀 향상')) weights.spin += 2.2;
  if (improvementProfile.labels.includes('파워/반발 향상')) weights.power += 2;
  if (improvementProfile.labels.includes('컨트롤 안정')) weights.control += 2;
  if (improvementProfile.labels.includes('팔 부담 완화')) weights.comfort += 2.4;
  if (improvementProfile.labels.includes('내구성 강화')) weights.durability += 2.2;
  if (improvementProfile.labels.includes('텐션 유지력')) weights.tension_stability += 2;

  if (average(logs, 'comfort') <= 5.5) weights.comfort += 1.4;
  if (average(logs, 'durability') <= 5.5) weights.durability += 1.3;
  if (swingAnalysis?.spin_profile === 'heavy' || swingAnalysis?.swing_path === 'low-to-high') weights.spin += 1.2;
  if (swingAnalysis?.spin_profile === 'flat' || swingAnalysis?.swing_path === 'flat') weights.control += 1.1;

  return weights;
}

function getSpecFitScore(item, targets, weights) {
  return SCORE_KEYS.reduce((score, key) => {
    const target = targets[key] || 5;
    const value = item.specs[key] || 5;
    return score - Math.abs(target - value) * (weights[key] || 1);
  }, 100);
}

function getFineGrainScore(item, targets, weights) {
  const weightedValue = SCORE_KEYS.reduce((sum, key) => sum + (item.specs[key] || 5) * (weights[key] || 1), 0);
  const targetValue = SCORE_KEYS.reduce((sum, key) => sum + (targets[key] || 5) * (weights[key] || 1), 0);
  const shapeSignal = item.shape === 'round' ? 0.11 : item.shape === 'shaped' ? 0.23 : 0.17;
  const gaugeSignal = Number.isFinite(item.gauge_mm) ? (1.35 - item.gauge_mm) * 0.35 : 0;
  return (weightedValue - targetValue) * 0.025 + shapeSignal + gaugeSignal;
}

function spreadMatchScores(scoredItems) {
  const topItems = scoredItems.slice(0, 5);
  if (!topItems.length) return [];

  const topRaw = topItems[0].raw_score;
  return topItems.map((item, index) => {
    const rawGap = Math.max(0, topRaw - item.raw_score);
    const spreadPenalty = index * 2.4 + rawGap * 0.28;
    return {
      ...item,
      match_score: clamp(Math.round(98 - spreadPenalty), 72, 98),
    };
  });
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

function differenceText(recommendation, currentString) {
  if (!currentString) {
    return {
      summary: '기존 스트링 스펙을 데이터베이스에서 특정하지 못해, 최근 로그 점수 평균과 비교해 추천했습니다.',
      advantages: [`${recommendation.brand} ${recommendation.name}의 ${topSpecLabels(recommendation.specs).join(', ')} 성향으로 로그의 부족한 체감을 보완합니다.`],
      cautions: ['현재 스트링의 실제 스펙을 특정하지 못했으므로 첫 테스트는 기존 텐션보다 1-2lbs 낮게 시작하는 편이 안전합니다.'],
    };
  }

  const diffs = ['power', 'spin', 'control', 'comfort', 'durability', 'tension_stability']
    .map((key) => ({ label: SPEC_LABELS[key], diff: recommendation.specs[key] - currentString.specs[key] }))
    .filter((item) => Math.abs(item.diff) >= 1)
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  if (!diffs.length) {
    return {
      summary: `${currentString.name}와 성향은 비슷하지만, 로그에서 요구된 체감 균형과 더 안정적으로 맞는 대안입니다.`,
      advantages: ['큰 성향 변화 없이 현재 세팅의 익숙함을 유지하기 쉽습니다.'],
      cautions: ['체감 변화가 크지 않을 수 있어 명확한 변화를 원한다면 텐션이나 하이브리드 조합을 함께 조정하세요.'],
    };
  }

  const advantages = diffs
    .filter(({ diff }) => diff > 0)
    .slice(0, 3)
    .map(({ label, diff }) => `${label}${subjectParticle(label)} 최근 ${currentString.name}보다 +${diff} 높아 해당 체감이 좋아질 가능성이 큽니다.`);
  const cautions = diffs
    .filter(({ diff }) => diff < 0)
    .slice(0, 3)
    .map(({ label, diff }) => `${label}${hasFinalConsonant(label) ? '은' : '는'} 최근 ${currentString.name}보다 ${diff} 낮아 풀잡에서는 이 부분이 아쉬울 수 있습니다.`);
  const parts = diffs.slice(0, 3).map(({ label, diff }) => `${label} ${diff > 0 ? '+' : ''}${diff}`);

  return {
    summary: `최근 사용한 ${currentString.name} 대비 ${parts.join(', ')} 차이가 있어 체감 변화가 분명합니다.`,
    advantages: advantages.length ? advantages : ['현재 스트링보다 명확히 올라가는 스펙은 적지만, 목표 성향과의 균형이 더 좋습니다.'],
    cautions: cautions.length ? cautions : ['뚜렷하게 낮아지는 핵심 스펙은 적어 전환 부담이 비교적 낮습니다.'],
  };
}

function isPoly(item) {
  return /poly|co-poly|mono/i.test(`${item.family || ''} ${item.type || ''}`);
}

function isMultiOrGut(item) {
  return /multi|gut|nylon|synthetic/i.test(`${item.family || ''} ${item.type || ''}`);
}

function resolveHybridPosition(item, latestLog) {
  const lowComfort = average([latestLog], 'comfort') <= 6;
  const lowDurability = average([latestLog], 'durability') <= 6;
  const spinControlMain = item.specs.spin >= 8 || item.specs.control >= 8 || item.specs.durability >= 8;
  const comfortPowerCross = item.specs.comfort >= 8 || item.specs.power >= 8 || isMultiOrGut(item);

  if (spinControlMain && !comfortPowerCross) return 'main';
  if (comfortPowerCross && (lowComfort || !lowDurability) && item.specs.spin <= 6) return 'cross';
  if (isPoly(item)) return 'main';
  if (isMultiOrGut(item)) return 'cross';
  return spinControlMain ? 'main' : 'cross';
}

function fallbackCrossFor(item, latestLog) {
  const crossName = stringName(latestLog.crossStringBrand, latestLog.crossString);
  if (crossName) return crossName;
  if (item.specs.comfort <= 6) return 'Wilson NXT, Tecnifibre X-One Biphase 같은 부드러운 멀티필라멘트';
  return '현재 선호하는 부드러운 멀티필라멘트 또는 라운드 폴리';
}

function fallbackMainFor(item, latestLog) {
  const mainName = stringName(latestLog.mainStringBrand, latestLog.mainString);
  if (mainName) return mainName;
  if (item.specs.control >= 8) return '컨트롤형 라운드/각형 폴리';
  return '스핀과 방향성을 잡아줄 폴리 메인';
}

function hybridText(item, latestLog) {
  const position = resolveHybridPosition(item, latestLog);
  const fullBed =
    item.specs.comfort >= 8
      ? `${item.brand} ${item.name}${objectParticle(item.name)} 풀잡으로 쓰면 타구감과 반발이 편하고 세팅이 단순합니다. 다만 스핀 bite나 내구성은 폴리 메인 하이브리드보다 덜할 수 있습니다.`
      : `${item.brand} ${item.name}${objectParticle(item.name)} 풀잡으로 쓰면 ${topSpecLabels(item.specs).join('/')} 성향이 가장 선명하게 나옵니다. 대신 장시간 플레이에서는 충격과 피로감이 커질 수 있습니다.`;

  const cross = fallbackCrossFor(item, latestLog);
  const main = fallbackMainFor(item, latestLog);
  const asMain = `${item.name}${objectParticle(item.name)} 메인에 넣으면 스윙 때 공을 물고 나가는 역할을 맡아 ${topSpecLabels(item.specs).join('/')} 성향이 가장 크게 체감됩니다. 크로스에는 ${cross} 조합을 추천합니다. 이렇게 쓰면 풀잡보다 충격이 줄고, 크로스의 반발감과 포켓감이 더해져 랠리 지속성이 좋아집니다.`;
  const asCross = `${item.name}${objectParticle(item.name)} 크로스에 넣으면 메인 스트링의 스핀과 방향성은 유지하면서 충격 완화, 반발 보정, 포켓감을 담당합니다. 메인에는 ${main}처럼 스핀/컨트롤을 잡아주는 스트링이 좋습니다. 이 방식은 풀잡보다 성향은 덜 선명하지만 팔 부담과 타구감 안정성이 좋아집니다.`;

  if (position === 'main') {
    return {
      position: '메인 추천',
      full_bed: fullBed,
      as_main: asMain,
      as_cross: asCross,
      recommendation: asMain,
    };
  }

  return {
    position: '크로스 추천',
    full_bed: fullBed,
    as_main: asMain,
    as_cross: asCross,
    recommendation: asCross,
  };
}

function buildReason(item, logs, targets, swingAnalysis, improvementProfile, requestMatch) {
  const strengths = topSpecLabels(item.specs);
  const matched = matchedSpecLabels(item, targets);
  const lowComfort = average(logs, 'comfort') <= 5.5;
  const lowDurability = average(logs, 'durability') <= 5.5;
  const videoNote = swingAnalysis?.summary
    ? ` 영상 분석에서 확인된 ${swingAnalysis.stroke_label || '스트로크'}와 ${swingAnalysis.swing || '스윙'} 템포를 반영했습니다.`
    : '';
  const improvementNote = improvementProfile.labels.length
    ? ` 개선 방향은 ${improvementProfile.labels.join(', ')}로 해석해 점수에 반영했습니다.`
    : '';
  const concern = lowComfort
    ? '기존 로그에서 편안함 점수가 낮아 팔 부담을 줄이는 방향을 함께 고려했습니다.'
    : lowDurability
      ? '기존 로그에서 내구성 점수가 낮아 유지력과 수명을 함께 고려했습니다.'
      : '기존 로그의 평균 체감 점수와 가장 가까운 성능 균형을 우선했습니다.';

  const requestNote = requestMatch?.note ? `${requestMatch.note} ` : '';
  return `${requestNote}${item.brand} ${item.name}은 ${strengths.join(', ')} 성향이 강하고, 목표 성향과 가까운 항목은 ${matched.join(', ')}입니다. ${concern}${videoNote}${improvementNote} 목표 점수 기준으로 파워 ${Math.round(targets.power)}, 스핀 ${Math.round(targets.spin)}, 컨트롤 ${Math.round(targets.control)}, 편안함 ${Math.round(targets.comfort)}에 맞춰 계산했습니다.`;
}

export function recommendFromLogs(logs, swingAnalysis = EMPTY_ANALYSIS, improvementRequest = '') {
  const latestLog = logs[0];
  const improvementProfile = getImprovementProfile(improvementRequest);
  const preferenceProfile = getPreferenceProfile(logs);
  const preference = preferenceSummary(preferenceProfile);
  const targets = buildTargets(logs, swingAnalysis, improvementProfile);
  const currentString = findDbString(stringName(latestLog.mainStringBrand, latestLog.mainString));
  const weights = getScoreWeights(logs, improvementProfile, swingAnalysis);

  const scoredItems = STRING_DATABASE.map((item) => {
    let score = getSpecFitScore(item, targets, weights);
    if (average(logs, 'comfort') <= 5.5 && item.arm_friendly) score += 6;
    if (improvementProfile.labels.includes('팔 부담 완화') && item.arm_friendly) score += 7;
    if (improvementProfile.labels.includes('내구성 강화')) score += item.specs.durability * 0.8;
    if (improvementProfile.labels.includes('텐션 유지력')) score += item.specs.tension_stability * 0.7;
    score += getPreferenceBonus(item, preferenceProfile);
    const requestMatch = getRequestMatch(item, improvementRequest);
    score += requestMatch.bonus;
    if (currentString?.id === item.id) score -= 7;
    score += getFineGrainScore(item, targets, weights);

    return {
      ...item,
      raw_score: score,
      reason: `${buildReason(item, logs, targets, swingAnalysis, improvementProfile, requestMatch)}${preference ? ` 입력한 ${preference}도 추천 점수에 반영했습니다.` : ''}`,
      vs_current: differenceText(item, currentString),
      hybrid_combo: hybridText(item, latestLog),
    };
  }).sort((a, b) => b.raw_score - a.raw_score || b.specs.control - a.specs.control || b.specs.spin - a.specs.spin);

  return spreadMatchScores(scoredItems);
}

function waitForMediaEvent(target, eventName) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      target.removeEventListener(eventName, handleSuccess);
      target.removeEventListener('error', handleError);
    };
    const handleSuccess = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error('영상을 읽는 중 문제가 발생했습니다.'));
    };
    target.addEventListener(eventName, handleSuccess, { once: true });
    target.addEventListener('error', handleError, { once: true });
  });
}

async function captureSwingFrames(file) {
  const video = document.createElement('video');
  const objectUrl = URL.createObjectURL(file);
  video.src = objectUrl;
  video.muted = true;
  video.playsInline = true;
  video.preload = 'metadata';

  try {
    await waitForMediaEvent(video, 'loadedmetadata');
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 6;
    const times = [0.08, 0.18, 0.3, 0.42, 0.55, 0.68, 0.8, 0.92].map((ratio) => Math.min(duration - 0.05, duration * ratio));
    const canvas = document.createElement('canvas');
    const width = Math.min(video.videoWidth || 720, 720);
    const height = Math.max(1, Math.round(width * ((video.videoHeight || 405) / (video.videoWidth || 720))));
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const frames = [];

    for (const time of times) {
      video.currentTime = Math.max(0, time);
      await waitForMediaEvent(video, 'seeked');
      context.drawImage(video, 0, 0, width, height);
      frames.push(canvas.toDataURL('image/jpeg', 0.78).split(',')[1]);
    }
    return frames;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function RecommendationCard({ item, index }) {
  return (
    <div className={`${CARD_CLS} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-emerald-400 tracking-widest">#{index + 1}</div>
          <h3 className="text-xl font-bold mt-1">{item.brand} {item.name}</h3>
          <div className="text-xs text-white/40 mt-1">{item.family} · {item.gauge_label} · 추천 텐션 {item.recommended_tension}</div>
        </div>
        <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/25 px-3 py-2 text-center">
          <div className="text-xl font-bold text-emerald-400">{item.match_score}</div>
          <div className="text-[10px] text-white/35">MATCH</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
        {['power', 'spin', 'control', 'comfort', 'durability'].map((key) => (
          <div key={key} className="rounded-lg bg-white/5 border border-white/8 px-3 py-2">
            <div className="text-[10px] text-white/35 uppercase">{key}</div>
            <div className="text-sm font-semibold text-white">{item.specs[key]}/10</div>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3 text-sm leading-relaxed">
        <div>
          <div className="text-xs text-white/35 mb-1">추천 이유</div>
          <p className="text-white/70">{item.reason}</p>
        </div>
        <div>
          <div className="text-xs text-white/35 mb-1">기존 스트링과의 차이점</div>
          {typeof item.vs_current === 'string' ? (
            <p className="text-white/70">{item.vs_current}</p>
          ) : (
            <div className="text-white/70 space-y-2">
              {item.vs_current.summary && <p>{item.vs_current.summary}</p>}
              {item.vs_current.advantages?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-emerald-300 mb-1">장점</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {item.vs_current.advantages.map((text) => <li key={text}>{text}</li>)}
                  </ul>
                </div>
              )}
              {item.vs_current.cautions?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-amber-300 mb-1">주의할 점</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {item.vs_current.cautions.map((text) => <li key={text}>{text}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        {typeof item.hybrid_combo === 'string' && (
          <div>
            <div className="text-xs text-white/35 mb-1">하이브리드 조합 이유</div>
            <p className="text-white/70">{item.hybrid_combo}</p>
          </div>
        )}
        {typeof item.hybrid_combo !== 'string' && (
          <>
            <div>
              <div className="text-xs text-white/35 mb-1">추천 사용 방식</div>
              <div className="inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                {item.hybrid_combo.position}
              </div>
            </div>
            <div>
              <div className="text-xs text-white/35 mb-1">풀잡으로 사용 시</div>
              <p className="text-white/70">{item.hybrid_combo.full_bed}</p>
            </div>
            <div>
              <div className="text-xs text-white/35 mb-1">하이브리드로 좋아지는 점</div>
              <p className="text-white/70">{item.hybrid_combo.recommendation || item.hybrid_combo.hybrid}</p>
            </div>
            {item.hybrid_combo.as_main && (
              <div>
                <div className="text-xs text-white/35 mb-1">메인으로 하이브리드 시</div>
                <p className="text-white/70">{item.hybrid_combo.as_main}</p>
              </div>
            )}
            {item.hybrid_combo.as_cross && (
              <div>
                <div className="text-xs text-white/35 mb-1">크로스로 하이브리드 시</div>
                <p className="text-white/70">{item.hybrid_combo.as_cross}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function LogRecommendPage() {
  const [params] = useSearchParams();
  const racketKey = params.get('racket') || '';
  const allLogs = useMemo(() => getAllLogs(), []);
  const logs = useMemo(() => allLogs.filter((log) => getRacketKey(log) === racketKey), [allLogs, racketKey]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [swingAnalysis, setSwingAnalysis] = useState(null);
  const [resultSwingAnalysis, setResultSwingAnalysis] = useState(null);
  const [swingError, setSwingError] = useState('');
  const [improvementRequest, setImprovementRequest] = useState('');
  const [combinedSummary, setCombinedSummary] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [recommending, setRecommending] = useState(false);
  const [hasRecommended, setHasRecommended] = useState(false);
  const videoInputRef = useRef(null);

  function handleVideoChange(event) {
    const file = event.target.files?.[0] || null;
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(file);
    setVideoPreview(file ? URL.createObjectURL(file) : '');
    setSwingAnalysis(null);
    setResultSwingAnalysis(null);
    setCombinedSummary('');
    setRecommendations([]);
    setSwingError('');
  }

  function resetAnalysisInputs() {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(null);
    setVideoPreview('');
    setSwingAnalysis(null);
    setImprovementRequest('');
    if (videoInputRef.current) videoInputRef.current.value = '';
  }

  async function analyzeVideoIfNeeded() {
    if (!videoFile) return swingAnalysis || EMPTY_ANALYSIS;
    if (swingAnalysis) return swingAnalysis;

    const frames = await captureSwingFrames(videoFile);
    const response = await fetch('/api/analyze-swing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frames }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || '스윙 분석에 실패했습니다.');
    setSwingAnalysis(data.analysis);
    return data.analysis;
  }

  async function handleRecommend() {
    setRecommending(true);
    setSwingError('');
    try {
      const analysis = await analyzeVideoIfNeeded();
      const profile = getImprovementProfile(improvementRequest);
      setCombinedSummary(buildCombinedAnalysis(logs, analysis, profile));
      setRecommendations(recommendFromLogs(logs, analysis, improvementRequest));
      setResultSwingAnalysis(analysis?.summary ? analysis : null);
      setHasRecommended(true);
      resetAnalysisInputs();
    } catch (error) {
      setSwingError(error.message || '종합 분석 중 오류가 발생했습니다.');
    } finally {
      setRecommending(false);
    }
  }

  if (!logs.length) {
    return (
      <div className={PAGE_SHELL}>
        <div className={CONTENT_WRAP}>
          <Link to="/log" className={BACK_LINK_CLS}>← 로그 목록으로</Link>
          <div className={`${CARD_CLS} p-6 mt-8 text-sm text-white/50`}>선택한 라켓 로그를 찾을 수 없어요.</div>
        </div>
      </div>
    );
  }

  const latest = logs[0];
  const avgScores = ['power', 'spin', 'control', 'comfort', 'durability'].map((key) => ({ key, value: average(logs, key).toFixed(1) }));

  return (
    <div className={PAGE_SHELL}>
      <div className={CONTENT_WRAP}>
        <Link to="/log" className={BACK_LINK_CLS}>← 로그 목록으로</Link>

        <div className="mt-8 mb-6">
          <div className={EYEBROW_CLS}>Log Based Recommendation</div>
          <h1 className="text-2xl font-bold">
            {[latest.racketBrand, latest.racketModel].filter(Boolean).join(' ') || '라켓 미입력'}
            {latest.racketNumber && <span className="ml-2 text-base text-emerald-400">{latest.racketNumber}</span>}
          </h1>
          <p className="text-sm text-white/45 mt-2">
            로그 기록, 선택한 영상 분석, 개선/요구사항을 먼저 종합한 뒤 추천 결과를 보여줍니다.
          </p>
        </div>

        <div className={`${CARD_CLS} p-5 mb-4`}>
          <div className="text-xs text-white/30 tracking-widest uppercase mb-3">누적 로그 요약</div>
          <div className="grid grid-cols-5 gap-2">
            {avgScores.map(({ key, value }) => (
              <div key={key} className="rounded-lg bg-white/5 px-2 py-2 text-center">
                <div className="text-[10px] text-white/35 uppercase">{key}</div>
                <div className="text-sm font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-white/45 mt-4">
            최근 세팅: {stringName(latest.mainStringBrand, latest.mainString) || '메인 미입력'}
            {stringName(latest.crossStringBrand, latest.crossString) && ` × ${stringName(latest.crossStringBrand, latest.crossString)}`}
          </div>
        </div>

        <div className={`${CARD_CLS} p-5 mb-6`}>
          <div className="text-xs text-white/30 tracking-widest uppercase mb-3">종합 분석 입력</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-semibold text-white/70 mb-2">스윙 영상 분석(선택)</div>
              <input ref={videoInputRef} className="hidden" type="file" accept="video/*" onChange={handleVideoChange} />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="w-full rounded-lg border border-sky-300/30 bg-sky-400/10 px-3 py-2 text-sm font-semibold text-sky-200 hover:bg-sky-400/15 transition-colors"
              >
                영상 업로드
              </button>
              {videoFile && <div className="mt-2 truncate text-xs text-white/45">선택된 영상: {videoFile.name}</div>}
              {videoPreview && <video className="w-full mt-3 rounded-xl border border-white/10" src={videoPreview} controls muted playsInline />}
            </div>

            <div>
              <div className="text-sm font-semibold text-white/70 mb-2">개선/요구사항(선택)</div>
              <textarea
                className="w-full min-h-32 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-emerald-500/50"
                placeholder="예: 스핀은 유지하면서 팔 부담을 줄이고 싶어요. 텐션 유지력과 내구성이 더 좋으면 좋겠어요."
                value={improvementRequest}
                onChange={(event) => {
                  setImprovementRequest(event.target.value);
                  setCombinedSummary('');
                  setRecommendations([]);
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleRecommend}
            disabled={recommending}
            className="w-full mt-4 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"
          >
            {recommending ? '종합 분석 중...' : hasRecommended ? '추천 받기' : '종합 분석 후 추천받기'}
          </button>
          {swingError && <div className="text-xs text-red-300 mt-2">{swingError}</div>}
        </div>

        {combinedSummary && (
          <div className={`${CARD_CLS} p-5 mb-4 text-sm text-white/65 leading-relaxed`}>
            <div className="text-xs text-white/30 tracking-widest uppercase mb-2">종합 분석 결과</div>
            {combinedSummary}
          </div>
        )}

        {resultSwingAnalysis && (
          <div className={`${CARD_CLS} p-5 mb-4 text-sm text-white/65 leading-relaxed`}>
            <div className="text-xs text-white/30 tracking-widest uppercase mb-2">영상 분석 결과</div>
            <div className="text-emerald-400 font-semibold mb-1">
              {resultSwingAnalysis.stroke_label || '스트로크 판단 불가'} · {resultSwingAnalysis.swing} · {resultSwingAnalysis.play_style}
            </div>
            <p>{resultSwingAnalysis.summary}</p>
          </div>
        )}

        {recommendations.length > 0 ? (
          <div className="flex flex-col gap-4">
            {recommendations.map((item, index) => <RecommendationCard key={item.id} item={item} index={index} />)}
          </div>
        ) : (
          <div className={`${CARD_CLS} p-5 text-sm text-white/55`}>
            영상과 개선/요구사항이 없더라도 `종합 분석 후 추천받기`를 누르면 로그 기록만 기준으로 추천합니다.
          </div>
        )}
      </div>
    </div>
  );
}
