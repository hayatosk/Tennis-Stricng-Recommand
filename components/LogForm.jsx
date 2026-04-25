import { useState } from 'react';
import { RACKET_BRANDS, RACKET_MODELS, HEAD_SIZES, GRIP_SIZES, RACKET_WEIGHTS } from '../lib/racketDatabase';
import { STRING_BRANDS, STRING_MODELS, STRING_TYPES, GAUGE_OPTIONS, POLYGON_TYPES } from '../lib/stringBrands';
import { DEFAULT_LOG, SCORE_FIELDS, SCORE_MAX, SCORE_MIN } from '../lib/logModel';

// ─── 유효성 검사 ──────────────────────────────────────────────────────────────

function validate(form) {
  const errors = {};
  if (!form.mainString.trim()) errors.mainString = '메인 스트링을 입력해주세요.';
  return errors;
}

// ─── 내부 UI 컴포넌트 ─────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div className="text-xs text-white/30 tracking-widest uppercase mt-5 mb-2 first:mt-0">
      {children}
    </div>
  );
}

function Field({ label, hint, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-white/50">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
        {hint && <span className="ml-1.5 text-white/25">{hint}</span>}
      </label>
      {children}
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  );
}

function inputCls(hasError = false) {
  return [
    'w-full rounded-lg bg-white/5 border px-3 py-2 text-sm text-white',
    'placeholder:text-white/20 outline-none transition-colors',
    hasError
      ? 'border-red-500/60 focus:border-red-400'
      : 'border-white/10 focus:border-emerald-500/50 focus:bg-white/8',
  ].join(' ');
}

const TENSION_OPTIONS = Array.from({ length: 41 }, (_, i) => i + 30);

// ─── LogForm ──────────────────────────────────────────────────────────────────

/**
 * @param {{
 *   initialValues?: Partial<import('../lib/logModel').StringLog>,
 *   onSave: (formData: object) => void,
 *   onCancel: () => void,
 *   isEdit?: boolean,
 *   saving?: boolean,
 * }} props
 */
export default function LogForm({
  initialValues = {},
  onSave,
  onCancel,
  isEdit = false,
  saving = false,
}) {
  const [form, setForm] = useState({ ...DEFAULT_LOG, ...initialValues });
  const [errors, setErrors] = useState({});

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
  };

  const setScore = (key, raw) => {
    const clamped = Math.min(SCORE_MAX, Math.max(SCORE_MIN, Number(raw)));
    set(key, clamped);
  };

  // 라켓 브랜드 변경 시 모델 초기화
  const handleRacketBrandChange = (brand) => {
    set('racketBrand', brand);
    set('racketModel', '');
  };

  // 스트링 브랜드 변경 시 모델 초기화
  const handleStringBrandChange = (brand) => {
    set('mainStringBrand', brand);
    set('mainString', '');
  };

  // 각줄 primary 카테고리
  const primaryShape = POLYGON_TYPES.includes(form.mainStringShape)
    ? '각줄'
    : (form.mainStringShape || '');

  const handlePrimaryShapeChange = (val) => {
    if (val === '원형' || val === '기타' || val === '') {
      set('mainStringShape', val);
    } else if (val === '각줄') {
      set('mainStringShape', '4각형');
    }
  };

  // 현재 브랜드에 맞는 라켓 모델 목록 (A-Z 정렬)
  const racketModels = form.racketBrand && RACKET_MODELS[form.racketBrand]
    ? [...RACKET_MODELS[form.racketBrand]].sort()
    : [];

  // 현재 스트링 브랜드에 맞는 모델 목록 (A-Z 정렬)
  const stringModels = form.mainStringBrand && STRING_MODELS[form.mainStringBrand]
    ? [...STRING_MODELS[form.mainStringBrand]].sort()
    : [];

  function handleSubmit() {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const el = document.querySelector('[data-error="true"]');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onSave(form);
  }

  return (
    <div className="flex flex-col gap-1">

      {/* ── 라켓 정보 ─────────────────────────────────────────── */}
      <SectionLabel>라켓 정보</SectionLabel>

      {/* 브랜드 + 모델명 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="브랜드">
          <select
            className={inputCls()}
            value={form.racketBrand}
            onChange={(e) => handleRacketBrandChange(e.target.value)}
          >
            <option value="">브랜드 선택</option>
            {RACKET_BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </Field>

        <Field label="모델명">
          <select
            className={inputCls()}
            value={form.racketModel}
            onChange={(e) => set('racketModel', e.target.value)}
            disabled={!form.racketBrand}
          >
            <option value="">
              {form.racketBrand ? '모델 선택' : '브랜드를 먼저 선택하세요'}
            </option>
            {racketModels.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* 헤드사이즈 + 그립사이즈 + 무게 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
        <Field label="헤드사이즈 (sq in)">
          <select
            className={inputCls()}
            value={form.headSize}
            onChange={(e) => set('headSize', e.target.value)}
          >
            <option value="">선택</option>
            {HEAD_SIZES.map((s) => (
              <option key={s} value={`${s} sq in`}>{s} sq in</option>
            ))}
          </select>
        </Field>

        <Field label="그립사이즈">
          <select
            className={inputCls()}
            value={form.gripSize}
            onChange={(e) => set('gripSize', e.target.value)}
          >
            <option value="">선택</option>
            {GRIP_SIZES.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </Field>

        <Field label="무게 (g)">
          <select
            className={inputCls()}
            value={form.racketWeight}
            onChange={(e) => set('racketWeight', e.target.value)}
          >
            <option value="">선택</option>
            {RACKET_WEIGHTS.map((w) => (
              <option key={w} value={`${w}g`}>{w}g</option>
            ))}
          </select>
        </Field>
      </div>

      {/* ── 스트링 정보 ───────────────────────────────────────── */}
      <SectionLabel>스트링 정보</SectionLabel>

      {/* 메인 스트링 브랜드 + 모델 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="메인 스트링 브랜드" required>
          <select
            className={inputCls()}
            value={form.mainStringBrand}
            onChange={(e) => handleStringBrandChange(e.target.value)}
          >
            <option value="">브랜드 선택</option>
            {STRING_BRANDS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </Field>

        <Field label="메인 스트링 모델" required error={errors.mainString}>
          <select
            data-error={!!errors.mainString}
            className={inputCls(!!errors.mainString)}
            value={form.mainString}
            onChange={(e) => set('mainString', e.target.value)}
            disabled={!form.mainStringBrand}
          >
            <option value="">
              {form.mainStringBrand ? '모델 선택' : '브랜드를 먼저 선택하세요'}
            </option>
            {stringModels.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* 크로스 스트링 */}
      <Field label="크로스 스트링" hint="하이브리드">
        <input
          className={inputCls()}
          placeholder="예: NXT"
          value={form.crossString}
          onChange={(e) => set('crossString', e.target.value)}
        />
      </Field>

      {/* 타입 + 모양 + 게이지 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
        <Field label="타입">
          <select
            className={inputCls()}
            value={form.mainStringType}
            onChange={(e) => set('mainStringType', e.target.value)}
          >
            <option value="">선택</option>
            {STRING_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>

        <Field label="모양">
          <div className="flex flex-col gap-2">
            <select
              className={inputCls()}
              value={primaryShape}
              onChange={(e) => handlePrimaryShapeChange(e.target.value)}
            >
              <option value="">선택</option>
              <option value="원형">원형</option>
              <option value="각줄">각줄</option>
              <option value="기타">기타</option>
            </select>
            {primaryShape === '각줄' && (
              <select
                className={inputCls()}
                value={form.mainStringShape}
                onChange={(e) => set('mainStringShape', e.target.value)}
              >
                {POLYGON_TYPES.map((pt) => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </select>
            )}
          </div>
        </Field>

        <Field label="게이지">
          <select
            className={inputCls()}
            value={form.gauge}
            onChange={(e) => set('gauge', e.target.value)}
          >
            <option value="">선택</option>
            {GAUGE_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* ── 텐션 ─────────────────────────────────────────────── */}
      <SectionLabel>텐션</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="메인 텐션">
          <select
            className={inputCls()}
            value={form.mainTension}
            onChange={(e) => set('mainTension', e.target.value)}
          >
            <option value="">모름 / 미입력</option>
            {TENSION_OPTIONS.map((t) => (
              <option key={t} value={`${t} lbs`}>{t} lbs</option>
            ))}
          </select>
        </Field>
        <Field label="크로스 텐션">
          <select
            className={inputCls()}
            value={form.crossTension}
            onChange={(e) => set('crossTension', e.target.value)}
          >
            <option value="">메인과 동일</option>
            {TENSION_OPTIONS.map((t) => (
              <option key={t} value={`${t} lbs`}>{t} lbs</option>
            ))}
          </select>
        </Field>
      </div>

      {/* ── 교체일 ────────────────────────────────────────────── */}
      <SectionLabel>교체일</SectionLabel>
      <Field label="줄 교체 날짜">
        <input
          type="date"
          className={inputCls()}
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
        />
      </Field>

      {/* ── 체감 피드백 ──────────────────────────────────────── */}
      <SectionLabel>체감 피드백</SectionLabel>
      <div className="flex flex-col gap-3">
        {SCORE_FIELDS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-4">
            <span className="w-14 text-sm text-white/50 flex-shrink-0">{label}</span>
            <input
              type="range"
              min={SCORE_MIN}
              max={SCORE_MAX}
              step={1}
              value={form[key]}
              onChange={(e) => setScore(key, e.target.value)}
              className="flex-1 accent-emerald-400 cursor-pointer"
            />
            <span className="w-8 text-right text-sm font-semibold text-emerald-400">
              {form[key]}
            </span>
          </div>
        ))}
      </div>

      {/* ── 메모 ─────────────────────────────────────────────── */}
      <SectionLabel>메모</SectionLabel>
      <textarea
        className={`${inputCls()} resize-none h-24 leading-relaxed`}
        placeholder="느낌, 특이사항, 교체 주기 등 자유롭게 입력하세요"
        value={form.memo}
        onChange={(e) => set('memo', e.target.value)}
      />

      {/* ── 버튼 ─────────────────────────────────────────────── */}
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-white/10 py-3 text-sm text-white/40 hover:text-white/60 hover:border-white/20 transition-colors"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? '저장 중...' : isEdit ? '수정 완료' : '저장하기'}
        </button>
      </div>
    </div>
  );
}
