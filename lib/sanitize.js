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

export function sanitizeForm(rawForm) {
  return {
    ...rawForm,
    racket_brand: sanitizeNullableText(rawForm.racket_brand, 40),
    racket_model: sanitizeNullableText(rawForm.racket_model, 80),
    current_string: sanitizeNullableText(rawForm.current_string, 80),
    current_gauge: sanitizeNullableText(rawForm.current_gauge, 30),
    cross_string: sanitizeNullableText(rawForm.cross_string, 80),
    improvement_request: sanitizeNullableText(rawForm.improvement_request, 300),
  };
}
