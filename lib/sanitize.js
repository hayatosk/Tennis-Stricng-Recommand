export function sanitizeText(value = '', max = 120) {
  return String(value)
    .replace(/[{}<>`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function sanitizeNullableText(value = '', max = 120) {
  const cleaned = sanitizeText(value, max);
  return cleaned.length ? cleaned : '';
}

function sanitizePriorities(priorities = {}) {
  return {
    spin: Math.min(5, Math.max(1, Number(priorities.spin) || 3)),
    power: Math.min(5, Math.max(1, Number(priorities.power) || 3)),
    control: Math.min(5, Math.max(1, Number(priorities.control) || 4)),
    comfort: Math.min(5, Math.max(1, Number(priorities.comfort) || 3)),
  };
}

function sanitizeSwingAnalysis(analysis) {
  if (!analysis || typeof analysis !== 'object') return null;
  return {
    swing: sanitizeNullableText(analysis.swing, 20),
    play_style: sanitizeNullableText(analysis.play_style, 40),
    confidence: sanitizeNullableText(analysis.confidence, 20),
    summary: sanitizeNullableText(analysis.summary, 220),
    recommendation_note: sanitizeNullableText(analysis.recommendation_note, 180),
    observations: Array.isArray(analysis.observations)
      ? analysis.observations.map((item) => sanitizeNullableText(item, 100)).filter(Boolean).slice(0, 4)
      : [],
    priorities: sanitizePriorities(analysis.priorities),
    swing_path: sanitizeNullableText(analysis.swing_path, 30),
    contact_timing: sanitizeNullableText(analysis.contact_timing, 30),
    spin_profile: sanitizeNullableText(analysis.spin_profile, 30),
  };
}

export function sanitizeForm(rawForm) {
  return {
    ...rawForm,
    racket_brand: sanitizeNullableText(rawForm.racket_brand, 40),
    racket_model: sanitizeNullableText(rawForm.racket_model, 80),
    current_string: sanitizeNullableText(rawForm.current_string, 80),
    current_gauge: sanitizeNullableText(rawForm.current_gauge, 30),
    cross_string: sanitizeNullableText(rawForm.cross_string, 80),
    improvement_request: sanitizeNullableText(rawForm.improvement_request, 300),
    priorities: sanitizePriorities(rawForm.priorities),
    swing_analysis: sanitizeSwingAnalysis(rawForm.swing_analysis),
  };
}
