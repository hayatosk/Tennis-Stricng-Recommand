import { useEffect, useMemo, useState } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import CurrentStringAnalysis from './components/CurrentStringAnalysis';
import StringCard from './components/StringCard';
import { FONTS, PRIORITIES, styles } from './lib/constants';
import { sanitizeForm } from './lib/sanitize';
import { loadSavedForm, saveForm } from './lib/storage';

const defaultForm = {
  level: '중급 (NTRP 3.0~4.0)',
  swing: '보통',
  play_style: '올라운더',
  arm: '문제 없음',
  racket_brand: '',
  racket_model: '',
  current_string: '',
  current_gauge: '',
  main_tension: '',
  cross_tension: '',
  cross_string: '',
  satisfaction: '보통 / 무난함',
  improvement_request: '',
  priorities: { spin: 3, power: 3, control: 4, comfort: 3 },
};

export default function App() {
  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setForm(loadSavedForm(defaultForm));
  }, []);

  useEffect(() => {
    saveForm(form);
  }, [form]);

  const hasCurrentString = useMemo(() => form.current_string.trim().length > 0, [form.current_string]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setPriority = (key, value) => setForm((prev) => ({ ...prev, priorities: { ...prev.priorities, [key]: Number(value) } }));

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = sanitizeForm(form);
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '추천 처리 중 오류가 발생했습니다.');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SpeedInsights />
      <style>{FONTS + styles}</style>
      <div className="app">
        <div className="hero">
          <div className="hero-eyebrow">Tennis String Lab</div>
          <div className="hero-title">나에게 맞는<br /><span>스트링</span> 찾기</div>
          <p className="hero-sub">
            현재 스트링 분석부터 맞춤 추천까지 — 룰베이스 추천으로 핵심을 잡고, AI는 설명만 보강하는 더 안정적인 구조로 개선했습니다.
          </p>
        </div>

        <div className="container">
          <div className="form-card">
            <div className="form-title"><span>⚙</span> 플레이 프로필</div>
            <div className="form-grid">
              <div className="field">
                <label className="field-label">실력 수준</label>
                <select value={form.level} onChange={(e) => setField('level', e.target.value)}>
                  <option>입문 (NTRP 2.0~2.5)</option>
                  <option>초급 (NTRP 2.5~3.0)</option>
                  <option>중급 (NTRP 3.0~4.0)</option>
                  <option>중상급 (NTRP 4.0~4.5)</option>
                  <option>상급 (NTRP 4.5+)</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">스윙 속도</label>
                <select value={form.swing} onChange={(e) => setField('swing', e.target.value)}>
                  <option>느림</option>
                  <option>보통</option>
                  <option>빠름</option>
                  <option>매우 빠름</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">플레이 스타일</label>
                <select value={form.play_style} onChange={(e) => setField('play_style', e.target.value)}>
                  <option>올라운더</option>
                  <option>베이스라이너 (랠리형)</option>
                  <option>공격형 베이스라이너</option>
                  <option>서브앤발리 / 네트플레이어</option>
                  <option>스핀 위주</option>
                  <option>플랫 위주</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">팔/어깨 상태</label>
                <select value={form.arm} onChange={(e) => setField('arm', e.target.value)}>
                  <option>문제 없음</option>
                  <option>약간 민감</option>
                  <option>자주 불편함</option>
                  <option>테니스 엘보 경험 있음</option>
                  <option>현재 통증/회복 중</option>
                </select>
              </div>
            </div>

            <div className="section-label">── 중요도 설정 (1 낮음 → 5 매우 중요)</div>
            <div className="priority-grid">
              {PRIORITIES.map(({ key, label }) => (
                <div className="priority-item" key={key}>
                  <div className="priority-header">
                    <span className="priority-name">{label}</span>
                    <span className="priority-val">{form.priorities[key]}/5</span>
                  </div>
                  <input type="range" min={1} max={5} step={1} value={form.priorities[key]} onChange={(e) => setPriority(key, e.target.value)} />
                </div>
              ))}
            </div>

            <div className="section-label">── 사용 라켓 정보</div>
            <div className="form-grid">
              <div className="field">
                <label className="field-label">라켓 브랜드</label>
                <input type="text" placeholder="예: 윌슨, 바볼랏, 요넥스" value={form.racket_brand} onChange={(e) => setField('racket_brand', e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">라켓 모델명</label>
                <input type="text" placeholder="예: Blade 98, Pure Aero" value={form.racket_model} onChange={(e) => setField('racket_model', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="current-string-card">
            <div className="current-string-title">🎾 현재 사용 중인 스트링 <span className="optional-badge">선택 입력</span></div>
            <div className="form-grid-3">
              <div className="field">
                <label className="field-label">스트링 이름 (메인)</label>
                <input type="text" placeholder="예: Hyper-G, ALU Power" value={form.current_string} onChange={(e) => setField('current_string', e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">크로스 스트링 <span className="optional-badge">하이브리드</span></label>
                <input type="text" placeholder="예: NXT, X-One Biphase" value={form.cross_string} onChange={(e) => setField('cross_string', e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">게이지</label>
                <input type="text" placeholder="예: 16L (1.25mm)" value={form.current_gauge} onChange={(e) => setField('current_gauge', e.target.value)} />
                <span className="field-hint">얇을수록 스핀·감각↑, 내구성↓</span>
              </div>
              <div className="field">
                <label className="field-label">메인 텐션</label>
                <select value={form.main_tension} onChange={(e) => setField('main_tension', e.target.value)}>
                  <option value="">모름 / 미입력</option>
                  {Array.from({ length: 41 }, (_, i) => i + 30).map((t) => <option key={t} value={`${t} lbs`}>{t} lbs</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">크로스 텐션</label>
                <select value={form.cross_tension} onChange={(e) => setField('cross_tension', e.target.value)}>
                  <option value="">메인과 동일</option>
                  {Array.from({ length: 41 }, (_, i) => i + 30).map((t) => <option key={t} value={`${t} lbs`}>{t} lbs</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">현재 만족도</label>
                <select value={form.satisfaction} onChange={(e) => setField('satisfaction', e.target.value)}>
                  <option>보통 / 무난함</option>
                  <option>매우 만족</option>
                  <option>만족하지만 개선 원함</option>
                  <option>불만족 — 교체 원함</option>
                </select>
              </div>
            </div>
          </div>

          <div className="improve-card">
            <div className="improve-title">✏️ 개선 요구사항 <span className="optional-badge">선택 입력</span></div>
            <textarea
              className="improve-textarea"
              placeholder="예: 스핀은 유지하고 팔 충격은 줄이고 싶어요 / 내구성과 장력 유지가 더 중요해요"
              value={form.improvement_request}
              onChange={(e) => setField('improvement_request', e.target.value)}
            />
          </div>

          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? '분석 중...' : '🎾 스트링 분석 & 추천 받기'}
          </button>

          {loading && (
            <div className="loading-box">
              <div className="spinner" />
              <div className="loading-text">{hasCurrentString ? '현재 스트링 분석 + TOP 5 추천 계산 중...' : 'TOP 5 추천 계산 중...'}</div>
            </div>
          )}

          {error && (
            <div className="error-box">
              <div className="error-title">⚠ 오류 발생</div>
              <div className="error-detail">{error}</div>
            </div>
          )}

          {result && (
            <>
              {result.current_analysis && <CurrentStringAnalysis analysis={result.current_analysis} />}
              <div className="result-header">
                <span className="result-badge">RULE + AI</span>
                <span className="result-label">맞춤 추천 스트링 TOP 5</span>
              </div>
              {result.recommendations.map((s, i) => (
                <StringCard key={s.id || i} string={s} index={i} />
              ))}
              <div style={{ textAlign: 'center' }}>
                <button className="reset-btn" onClick={() => setResult(null)}>↩ 결과 숨기기</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
