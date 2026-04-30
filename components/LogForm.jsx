import { useId, useMemo, useState } from 'react';
import { RACKET_BRANDS, RACKET_MODELS, HEAD_SIZES, GRIP_SIZES, RACKET_WEIGHTS } from '../lib/racketDatabase';
import {
  GAUGE_OPTIONS,
  POLYGON_TYPES,
  PRIMARY_SHAPES,
  STRING_BRANDS,
  STRING_COLORS,
  STRING_MODELS,
  STRING_TYPES,
} from '../lib/stringBrands';
import { DEFAULT_LOG, SCORE_FIELDS, SCORE_MAX, SCORE_MIN } from '../lib/logModel';

function validate(form) {
  const errors = {};
  if (!form.mainString.trim()) errors.mainString = '메인 스트링 모델을 선택하거나 직접 입력해주세요.';
  return errors;
}

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
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

function inputCls(hasError = false) {
  return [
    'w-full rounded-lg bg-white/5 border px-3 py-2 text-sm text-white',
    'placeholder:text-white/25 outline-none transition-colors',
    hasError
      ? 'border-red-500/60 focus:border-red-400'
      : 'border-white/10 focus:border-emerald-500/50 focus:bg-white/8',
  ].join(' ');
}

function ComboInput({ value, onChange, options, placeholder, hasError = false, dataError = false }) {
  const id = useId();
  const uniqueOptions = useMemo(() => [...new Set(options.filter(Boolean))], [options]);

  return (
    <>
      <input
        data-error={dataError}
        className={inputCls(hasError)}
        list={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      <datalist id={id}>
        {uniqueOptions.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  );
}

const TENSION_OPTIONS = Array.from({ length: 41 }, (_, i) => `${i + 30} lbs`);
const HEAD_SIZE_OPTIONS = HEAD_SIZES.map((size) => `${size} sq in`);
const RACKET_WEIGHT_OPTIONS = RACKET_WEIGHTS.map((weight) => `${weight}g`);
const GRIP_SIZE_OPTIONS = GRIP_SIZES.map((grip) => grip.value);
const SHAPE_OPTIONS = [...PRIMARY_SHAPES, ...POLYGON_TYPES];
const GAUGE_VALUES = GAUGE_OPTIONS.map((gauge) => gauge.value);
const ALL_STRING_MODELS = Object.values(STRING_MODELS).flat().sort();
const PREFERENCE_TRAITS = [
  'spin',
  'power',
  'control',
  'comfort',
  'durability',
  'tension stability',
  'soft feel',
  'poly',
  'multifilament',
  'natural gut',
  'hybrid',
  'round',
  'shaped',
  '스핀',
  '파워',
  '컨트롤',
  '편안함',
  '내구성',
  '텐션 유지',
  '부드러운 타구감',
  '하이브리드',
];

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
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const setScore = (key, raw) => {
    const clamped = Math.min(SCORE_MAX, Math.max(SCORE_MIN, Number(raw)));
    set(key, clamped);
  };

  const setRacketBrand = (brand) => {
    setForm((prev) => ({
      ...prev,
      racketBrand: brand,
      racketModel: brand === prev.racketBrand ? prev.racketModel : '',
    }));
  };

  const setMainStringBrand = (brand) => {
    setForm((prev) => ({
      ...prev,
      mainStringBrand: brand,
      mainString: brand === prev.mainStringBrand ? prev.mainString : '',
    }));
    if (errors.mainString) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.mainString;
        return next;
      });
    }
  };

  const setCrossStringBrand = (brand) => {
    setForm((prev) => ({
      ...prev,
      crossStringBrand: brand,
      crossString: brand === prev.crossStringBrand ? prev.crossString : '',
    }));
  };

  const setPreferredStringBrand = (brand) => {
    setForm((prev) => ({
      ...prev,
      preferredStringBrand: brand,
      preferredStringModel: brand === prev.preferredStringBrand ? prev.preferredStringModel : '',
    }));
  };

  const racketModelOptions = form.racketBrand && RACKET_MODELS[form.racketBrand]
    ? [...RACKET_MODELS[form.racketBrand]].sort()
    : Object.values(RACKET_MODELS).flat().sort();

  const mainStringModelOptions = form.mainStringBrand && STRING_MODELS[form.mainStringBrand]
    ? [...STRING_MODELS[form.mainStringBrand]].sort()
    : ALL_STRING_MODELS;

  const crossStringModelOptions = form.crossStringBrand && STRING_MODELS[form.crossStringBrand]
    ? [...STRING_MODELS[form.crossStringBrand]].sort()
    : ALL_STRING_MODELS;

  const preferredStringModelOptions = form.preferredStringBrand && STRING_MODELS[form.preferredStringBrand]
    ? [...STRING_MODELS[form.preferredStringBrand]].sort()
    : ALL_STRING_MODELS;

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
      <SectionLabel>라켓 정보</SectionLabel>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="브랜드">
          <ComboInput value={form.racketBrand} onChange={setRacketBrand} options={RACKET_BRANDS} placeholder="예: Wilson" />
        </Field>
        <Field label="모델명">
          <ComboInput value={form.racketModel} onChange={(value) => set('racketModel', value)} options={racketModelOptions} placeholder="예: Blade" />
        </Field>
        <Field label="라켓 번호" hint="같은 모델 구분">
          <ComboInput value={form.racketNumber} onChange={(value) => set('racketNumber', value)} options={['1번', '2번', '3번', '4번', '5번', '#1', '#2', '#3']} placeholder="예: 1번" />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
        <Field label="헤드 사이즈">
          <ComboInput value={form.headSize} onChange={(value) => set('headSize', value)} options={HEAD_SIZE_OPTIONS} placeholder="예: 98 sq in" />
        </Field>
        <Field label="그립 사이즈">
          <ComboInput value={form.gripSize} onChange={(value) => set('gripSize', value)} options={GRIP_SIZE_OPTIONS} placeholder={'예: L3 (4 3/8")'} />
        </Field>
        <Field label="무게">
          <ComboInput value={form.racketWeight} onChange={(value) => set('racketWeight', value)} options={RACKET_WEIGHT_OPTIONS} placeholder="예: 305g" />
        </Field>
      </div>

      <SectionLabel>메인 스트링</SectionLabel>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="브랜드" required>
          <ComboInput value={form.mainStringBrand} onChange={setMainStringBrand} options={STRING_BRANDS} placeholder="예: Solinco" />
        </Field>
        <Field label="모델" required error={errors.mainString}>
          <ComboInput dataError={!!errors.mainString} hasError={!!errors.mainString} value={form.mainString} onChange={(value) => set('mainString', value)} options={mainStringModelOptions} placeholder="예: Hyper-G" />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-1">
        <Field label="타입">
          <ComboInput value={form.mainStringType} onChange={(value) => set('mainStringType', value)} options={STRING_TYPES} placeholder="예: Polyester (Co-Poly)" />
        </Field>
        <Field label="모양">
          <ComboInput value={form.mainStringShape} onChange={(value) => set('mainStringShape', value)} options={SHAPE_OPTIONS} placeholder="예: Round" />
        </Field>
        <Field label="색상">
          <ComboInput value={form.mainStringColor} onChange={(value) => set('mainStringColor', value)} options={STRING_COLORS} placeholder="예: Black" />
        </Field>
        <Field label="게이지">
          <ComboInput value={form.gauge} onChange={(value) => set('gauge', value)} options={GAUGE_VALUES} placeholder="예: 1.25mm (16L)" />
        </Field>
      </div>

      <SectionLabel>크로스 스트링</SectionLabel>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="브랜드" hint="하이브리드">
          <ComboInput value={form.crossStringBrand} onChange={setCrossStringBrand} options={STRING_BRANDS} placeholder="사용 안 함이면 비워두세요" />
        </Field>
        <Field label="모델">
          <ComboInput value={form.crossString} onChange={(value) => set('crossString', value)} options={crossStringModelOptions} placeholder="예: NXT" />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-1">
        <Field label="타입">
          <ComboInput value={form.crossStringType} onChange={(value) => set('crossStringType', value)} options={STRING_TYPES} placeholder="예: Multifilament" />
        </Field>
        <Field label="모양">
          <ComboInput value={form.crossStringShape} onChange={(value) => set('crossStringShape', value)} options={SHAPE_OPTIONS} placeholder="예: Round" />
        </Field>
        <Field label="색상">
          <ComboInput value={form.crossStringColor} onChange={(value) => set('crossStringColor', value)} options={STRING_COLORS} placeholder="예: Natural" />
        </Field>
        <Field label="게이지">
          <ComboInput value={form.crossGauge} onChange={(value) => set('crossGauge', value)} options={GAUGE_VALUES} placeholder="예: 1.30mm (16)" />
        </Field>
      </div>

      <SectionLabel>텐션</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="메인 텐션">
          <ComboInput value={form.mainTension} onChange={(value) => set('mainTension', value)} options={TENSION_OPTIONS} placeholder="예: 50 lbs" />
        </Field>
        <Field label="크로스 텐션">
          <ComboInput value={form.crossTension} onChange={(value) => set('crossTension', value)} options={TENSION_OPTIONS} placeholder="메인과 같으면 비워두세요" />
        </Field>
      </div>

      <SectionLabel>교체일</SectionLabel>
      <Field label="줄 교체 날짜">
        <input type="date" className={inputCls()} value={form.date} onChange={(event) => set('date', event.target.value)} />
      </Field>

      <SectionLabel>선호하는 스트링</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="선호 브랜드" hint="추천에 우선 반영">
          <ComboInput value={form.preferredStringBrand} onChange={setPreferredStringBrand} options={STRING_BRANDS} placeholder="예: Solinco" />
        </Field>
        <Field label="선호 모델">
          <ComboInput value={form.preferredStringModel} onChange={(value) => set('preferredStringModel', value)} options={preferredStringModelOptions} placeholder="예: Hyper-G" />
        </Field>
      </div>
      <div className="mt-1">
        <Field label="선호 성향" hint="직접 입력 가능">
          <ComboInput
            value={form.preferredStringTraits}
            onChange={(value) => set('preferredStringTraits', value)}
            options={PREFERENCE_TRAITS}
            placeholder="예: 스핀, 컨트롤, 부드러운 타구감"
          />
        </Field>
      </div>

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
              onChange={(event) => setScore(key, event.target.value)}
              className="flex-1 accent-emerald-400 cursor-pointer"
            />
            <span className="w-8 text-right text-sm font-semibold text-emerald-400">{form[key]}</span>
          </div>
        ))}
      </div>

      <SectionLabel>메모</SectionLabel>
      <textarea
        className={`${inputCls()} resize-none h-24 leading-relaxed`}
        placeholder="타구감, 특이사항, 교체 주기 등을 자유롭게 입력하세요."
        value={form.memo}
        onChange={(event) => set('memo', event.target.value)}
      />

      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-white/10 py-3 text-sm text-white/40 hover:text-white/60 hover:border-white/20 transition-colors">
          취소
        </button>
        <button type="button" onClick={handleSubmit} disabled={saving} className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {saving ? '저장 중...' : isEdit ? '수정 완료' : '저장하기'}
        </button>
      </div>
    </div>
  );
}
