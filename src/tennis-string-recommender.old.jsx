import { useState } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`;

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .app { min-height: 100vh; background: #0b110c; color: #e8f0e9; font-family: 'DM Sans', sans-serif; }

  .hero {
    background: linear-gradient(135deg, #0b2e12 0%, #0b110c 60%);
    border-bottom: 1px solid #1e3a22;
    padding: 48px 24px 36px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% -20%, rgba(74,222,128,0.08), transparent);
    pointer-events: none;
  }
  .hero-eyebrow { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #4ade80; margin-bottom: 12px; }
  .hero-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px, 8vw, 88px); line-height: 0.92; color: #f0faf1; letter-spacing: 1px; margin-bottom: 16px; }
  .hero-title span { color: #4ade80; }
  .hero-sub { font-size: 14px; color: #6b8f72; max-width: 520px; margin: 0 auto; line-height: 1.6; }

  .container { max-width: 900px; margin: 0 auto; padding: 40px 20px 80px; }

  .section-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #4ade80;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid #1e3a22;
  }

  .form-card { background: #111a12; border: 1px solid #1e3a22; border-radius: 16px; padding: 32px; margin-bottom: 20px; }
  .form-title { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 1px; color: #4ade80; margin-bottom: 22px; display: flex; align-items: center; gap: 10px; }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  @media (max-width: 600px) { .form-grid, .form-grid-3 { grid-template-columns: 1fr; } }

  .field { display: flex; flex-direction: column; gap: 7px; }
  .field-label { font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #6b8f72; }
  .field-hint { font-size: 11px; color: #4a6050; margin-top: 3px; }
  .field select, .field input {
    background: #0b110c; border: 1px solid #2a4a2e; border-radius: 8px;
    color: #e8f0e9; font-family: 'DM Sans', sans-serif; font-size: 14px;
    padding: 10px 14px; outline: none; transition: border-color 0.2s; appearance: none; cursor: pointer;
  }
  .field select:focus, .field input:focus { border-color: #4ade80; }
  .field input::placeholder { color: #3a5a3e; }

  /* Current string block */
  .current-string-card {
    background: rgba(74,222,128,0.04);
    border: 1px solid rgba(74,222,128,0.2);
    border-radius: 12px;
    padding: 22px;
    margin-bottom: 20px;
  }
  .current-string-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    color: #4ade80;
    letter-spacing: 1px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .optional-badge {
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    letter-spacing: 1px;
    background: #1e3a22;
    color: #6b8f72;
    padding: 2px 8px;
    border-radius: 100px;
    font-weight: 400;
  }

  .priority-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  @media (max-width: 600px) { .priority-grid { grid-template-columns: 1fr; } }
  .priority-item { display: flex; flex-direction: column; gap: 6px; }
  .priority-header { display: flex; justify-content: space-between; align-items: center; }
  .priority-name { font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #9bb89f; }
  .priority-val { font-family: 'DM Mono', monospace; font-size: 12px; color: #4ade80; font-weight: 500; }
  input[type=range] { -webkit-appearance: none; width: 100%; height: 4px; border-radius: 2px; background: #1e3a22; outline: none; cursor: pointer; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #4ade80; cursor: pointer; box-shadow: 0 0 8px rgba(74,222,128,0.4); }

  .submit-btn {
    width: 100%; padding: 16px; background: #4ade80; color: #0a0f0a; border: none; border-radius: 10px;
    font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 2px; cursor: pointer;
    transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .submit-btn:hover { background: #86efac; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(74,222,128,0.2); }
  .submit-btn:disabled { background: #2a4a2e; color: #4a7050; cursor: not-allowed; transform: none; box-shadow: none; }

  .loading-box { text-align: center; padding: 60px 20px; border: 1px solid #1e3a22; border-radius: 16px; background: #111a12; }
  .spinner { width: 48px; height: 48px; border: 3px solid #1e3a22; border-top-color: #4ade80; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 2px; color: #4ade80; }

  /* Current string analysis */
  .analysis-card {
    background: #111a12;
    border: 1px solid #1e3a22;
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 28px;
    animation: fadeUp 0.4s ease both;
  }
  .analysis-header {
    background: linear-gradient(90deg, #0b2e12, #111a12);
    padding: 20px 28px;
    display: flex;
    align-items: center;
    gap: 14px;
    border-bottom: 1px solid #1e3a22;
  }
  .analysis-icon { font-size: 28px; }
  .analysis-header-text { flex: 1; }
  .analysis-eyebrow { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #4ade80; margin-bottom: 2px; }
  .analysis-string-name { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #f0faf1; letter-spacing: 0.5px; }
  .analysis-meta { font-size: 12px; color: #6b8f72; margin-top: 2px; }

  .fit-score-badge {
    text-align: center;
    min-width: 80px;
  }
  .fit-score-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 48px;
    line-height: 1;
  }
  .fit-score-num.high { color: #4ade80; }
  .fit-score-num.mid { color: #facc15; }
  .fit-score-num.low { color: #f87171; }
  .fit-score-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #6b8f72; }

  .analysis-body { padding: 24px 28px; }
  .verdict-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 10px;
    margin-bottom: 10px;
    font-size: 14px;
    line-height: 1.6;
  }
  .verdict-good { background: rgba(74,222,128,0.07); border: 1px solid rgba(74,222,128,0.15); color: #9bb89f; }
  .verdict-warn { background: rgba(250,204,21,0.07); border: 1px solid rgba(250,204,21,0.15); color: #a89f70; }
  .verdict-bad  { background: rgba(248,113,113,0.07); border: 1px solid rgba(248,113,113,0.15); color: #a87070; }
  .verdict-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
  .verdict-text { flex: 1; }

  .analysis-summary {
    margin-top: 18px;
    padding: 16px 18px;
    background: #0b110c;
    border: 1px solid #1e3a22;
    border-radius: 10px;
    font-size: 14px;
    line-height: 1.7;
    color: #9bb89f;
  }
  .analysis-summary strong { color: #4ade80; font-weight: 600; }

  /* Recommend section */
  .result-header { display: flex; align-items: center; gap: 12px; margin: 32px 0 20px; }
  .result-badge { background: #4ade80; color: #0a0f0a; font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: 1.5px; padding: 4px 10px; border-radius: 100px; }
  .result-label { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #6b8f72; letter-spacing: 1px; }

  .string-card { background: #111a12; border: 1px solid #1e3a22; border-radius: 16px; overflow: hidden; margin-bottom: 28px; animation: fadeUp 0.4s ease both; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .string-card:nth-child(2) { animation-delay: 0.1s; }
  .string-card:nth-child(3) { animation-delay: 0.2s; }
  .string-card:nth-child(4) { animation-delay: 0.3s; }
  .string-card:nth-child(5) { animation-delay: 0.4s; }

  .card-top { padding: 28px 28px 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .card-rank { font-family: 'Bebas Neue', sans-serif; font-size: 64px; line-height: 1; color: #1e3a22; min-width: 50px; }
  .card-rank.gold   { color: #b8860b; }
  .card-rank.silver { color: #4a6060; }
  .card-rank.bronze { color: #7a4a2e; }
  .card-rank.fourth { color: #3a4a6a; }
  .card-rank.fifth  { color: #2a4a3a; }

  .card-info { flex: 1; }
  .card-brand { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #4ade80; margin-bottom: 4px; }
  .card-name { font-family: 'Bebas Neue', sans-serif; font-size: 36px; line-height: 1; color: #f0faf1; letter-spacing: 0.5px; margin-bottom: 8px; }
  .card-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .tag { font-size: 11px; font-weight: 500; letter-spacing: 0.5px; padding: 3px 10px; border-radius: 100px; border: 1px solid #2a4a2e; color: #9bb89f; background: #0b110c; }
  .tag.highlight { border-color: #4ade80; color: #4ade80; }
  .tag.upgrade { border-color: #facc15; color: #facc15; background: rgba(250,204,21,0.05); }

  .match-score { text-align: right; min-width: 80px; }
  .match-num { font-family: 'Bebas Neue', sans-serif; font-size: 52px; line-height: 1; color: #4ade80; }
  .match-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #6b8f72; }

  .card-body { padding: 20px 28px 28px; }
  .card-desc { font-size: 14px; line-height: 1.7; color: #9bb89f; margin-bottom: 24px; }

  .spec-section-title { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: #4ade80; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #1e3a22; }
  .spec-bars { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
  .spec-row { display: flex; align-items: center; gap: 12px; }
  .spec-name { font-size: 12px; font-weight: 500; color: #9bb89f; width: 90px; flex-shrink: 0; }
  .spec-track { flex: 1; height: 6px; background: #1e3a22; border-radius: 3px; overflow: hidden; }
  .spec-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #16a34a, #4ade80); transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1); }
  .spec-val { font-family: 'DM Mono', monospace; font-size: 11px; color: #4ade80; width: 28px; text-align: right; }

  .data-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #1e3a22; border-radius: 10px; overflow: hidden; margin-bottom: 20px; }
  @media (max-width: 500px) { .data-grid { grid-template-columns: repeat(2,1fr); } }
  .data-cell { background: #0b110c; padding: 14px 16px; }
  .data-key { font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #4a7050; margin-bottom: 4px; }
  .data-value { font-family: 'DM Mono', monospace; font-size: 13px; color: #e8f0e9; font-weight: 500; }

  .why-box { background: rgba(74,222,128,0.05); border: 1px solid rgba(74,222,128,0.15); border-radius: 10px; padding: 16px 18px; }
  .why-title { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #4ade80; margin-bottom: 8px; }
  .why-text { font-size: 13px; line-height: 1.65; color: #9bb89f; }

  .upgrade-box { background: rgba(250,204,21,0.05); border: 1px solid rgba(250,204,21,0.2); border-radius: 10px; padding: 14px 18px; margin-top: 12px; }
  .upgrade-title { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #facc15; margin-bottom: 6px; }
  .upgrade-text { font-size: 13px; line-height: 1.65; color: #a89f70; }

  .hybrid-box { background: rgba(139,92,246,0.07); border: 1px solid rgba(139,92,246,0.25); border-radius: 10px; padding: 14px 18px; margin-top: 12px; }
  .hybrid-title { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #a78bfa; margin-bottom: 6px; }
  .hybrid-text { font-size: 13px; line-height: 1.65; color: #c4b5fd; }

  .error-box { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 20px 24px; margin-bottom: 20px; }
  .error-title { color: #fca5a5; font-weight: 600; font-size: 14px; margin-bottom: 8px; }
  .error-detail { color: #f87171; font-family: 'DM Mono', monospace; font-size: 12px; line-height: 1.6; word-break: break-all; white-space: pre-wrap; }

  /* Improvement request */
  .improve-card {
    background: rgba(250,204,21,0.04);
    border: 1px solid rgba(250,204,21,0.18);
    border-radius: 12px;
    padding: 22px;
    margin-bottom: 20px;
  }
  .improve-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    color: #facc15;
    letter-spacing: 1px;
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .improve-textarea {
    width: 100%;
    min-height: 90px;
    background: #0b110c;
    border: 1px solid #3a4a22;
    border-radius: 8px;
    color: #e8f0e9;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    padding: 12px 14px;
    outline: none;
    resize: vertical;
    transition: border-color 0.2s;
    line-height: 1.6;
  }
  .improve-textarea:focus { border-color: #facc15; }
  .improve-textarea::placeholder { color: #4a5a32; }

  .reset-btn { background: transparent; border: 1px solid #2a4a2e; color: #6b8f72; border-radius: 8px; padding: 10px 20px; font-family: 'DM Sans', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.2s; margin-top: 8px; }
  .reset-btn:hover { border-color: #4ade80; color: #4ade80; }
`;

const PRIORITIES = [
  { key: "spin", label: "스핀" },
  { key: "power", label: "파워" },
  { key: "control", label: "컨트롤" },
  { key: "comfort", label: "팔 편안함" },
];

const SPEC_LABELS = {
  power: "파워", spin: "스핀", control: "컨트롤",
  comfort: "편안함", durability: "내구성", tension_stability: "장력 유지",
};

function StatBar({ label, value }) {
  return (
    <div className="spec-row">
      <span className="spec-name">{label}</span>
      <div className="spec-track">
        <div className="spec-fill" style={{ width: `${value * 10}%` }} />
      </div>
      <span className="spec-val">{value}</span>
    </div>
  );
}

function CurrentStringAnalysis({ analysis }) {
  const score = analysis.fit_score;
  const scoreClass = score >= 75 ? "high" : score >= 50 ? "mid" : "low";

  return (
    <div className="analysis-card">
      <div className="analysis-header">
        <div className="analysis-icon">🔍</div>
        <div className="analysis-header-text">
          <div className="analysis-eyebrow">현재 스트링 분석</div>
          <div className="analysis-string-name">{analysis.string_name}</div>
          <div className="analysis-meta">
            {analysis.gauge && `게이지 ${analysis.gauge}`}
            {analysis.gauge && analysis.tension && " · "}
            {analysis.tension && `텐션 ${analysis.tension}`}
          </div>
        </div>
        <div className="fit-score-badge">
          <div className={`fit-score-num ${scoreClass}`}>{score}</div>
          <div className="fit-score-label">적합도</div>
        </div>
      </div>

      <div className="analysis-body">
        {(analysis.verdicts || []).map((v, i) => (
          <div key={i} className={`verdict-row verdict-${v.type}`}>
            <span className="verdict-icon">
              {v.type === "good" ? "✅" : v.type === "warn" ? "⚠️" : "❌"}
            </span>
            <span className="verdict-text">{v.text}</span>
          </div>
        ))}
        <div className="analysis-summary" dangerouslySetInnerHTML={{
          __html: analysis.summary.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        }} />
      </div>
    </div>
  );
}

function StringCard({ string, index }) {
  const rankClass = index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : index === 3 ? "fourth" : "fifth";
  return (
    <div className="string-card">
      <div className="card-top">
        <div className={`card-rank ${rankClass}`}>{String(index + 1).padStart(2, "0")}</div>
        <div className="card-info">
          <div className="card-brand">{string.brand}</div>
          <div className="card-name">{string.name}</div>
          <div className="card-tags">
            <span className="tag highlight">{string.type}</span>
            {(string.tags || []).map((t) => (
              <span key={t} className={`tag ${t.includes("업그레이드") || t.includes("개선") ? "upgrade" : ""}`}>{t}</span>
            ))}
          </div>
        </div>
        <div className="match-score">
          <div className="match-num">{string.match_score}</div>
          <div className="match-label">매칭 점수</div>
        </div>
      </div>
      <div className="card-body">
        <p className="card-desc">{string.description}</p>
        <div className="spec-section-title">── 성능 스펙</div>
        <div className="spec-bars">
          {Object.entries(string.specs || {}).map(([k, v]) => (
            <StatBar key={k} label={SPEC_LABELS[k] || k} value={v} />
          ))}
        </div>
        <div className="spec-section-title">── 제품 정보</div>
        <div className="data-grid">
          {(string.data || []).map((d) => (
            <div key={d.key} className="data-cell">
              <div className="data-key">{d.key}</div>
              <div className="data-value">{d.value}</div>
            </div>
          ))}
        </div>
        <div className="why-box">
          <div className="why-title">✦ 추천 이유</div>
          <p className="why-text">{string.reason}</p>
        </div>
        {string.vs_current && (
          <div className="upgrade-box">
            <div className="upgrade-title">⬆ 현재 스트링과 비교</div>
            <p className="upgrade-text">{string.vs_current}</p>
          </div>
        )}
        {string.hybrid_combo && (
          <div className="hybrid-box">
            <div className="hybrid-title">🔀 하이브리드 추천 조합</div>
            <p className="hybrid-text">{string.hybrid_combo}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState({
    level: "중급 (NTRP 3.0~4.0)",
    swing: "보통",
    play_style: "올라운더",
    arm: "민감하지 않음",
    racket_brand: "",
    racket_model: "",
    current_string: "",
    current_gauge: "",
    main_tension: "",
    cross_tension: "",
    cross_string: "",
    satisfaction: "보통 / 무난함",
    improvement_request: "",
    priorities: { spin: 3, power: 3, control: 4, comfort: 3 },
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const setPriority = (key, value) => setForm(f => ({ ...f, priorities: { ...f.priorities, [key]: Number(value) } }));

  const hasCurrentString = form.current_string.trim().length > 0;
  const isHybrid = form.cross_string.trim().length > 0;

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setResult(null);

    const tensionInfo = form.main_tension
      ? `메인 ${form.main_tension}${form.cross_tension ? ` / 크로스 ${form.cross_tension}` : ""}`
      : "";
    const currentStringInfo = hasCurrentString
      ? `- 현재 스트링: ${form.current_string}${form.cross_string ? ` (메인) + ${form.cross_string} (크로스)` : ""}${form.current_gauge ? ` / 게이지: ${form.current_gauge}` : ""}${tensionInfo ? ` / 텐션: ${tensionInfo}` : ""} / 만족도: ${form.satisfaction}`
      : "- 현재 스트링: 없음 또는 모름";

    const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!envApiKey || !envApiKey.trim()) {
      setError(".env 파일에 VITE_GEMINI_API_KEY가 설정되지 않았습니다.");
      setLoading(false);
      return;
    }
    const apiKey = envApiKey.trim();

    const profile = `Level: ${form.level} / Swing: ${form.swing} / Style: ${form.play_style} / Arm: ${form.arm}${form.racket_brand || form.racket_model ? ` / Racket: ${[form.racket_brand, form.racket_model].filter(Boolean).join(" ")}` : ""} / Priorities(1-5): Spin=${form.priorities.spin} Power=${form.priorities.power} Control=${form.priorities.control} Comfort=${form.priorities.comfort}${isHybrid ? " / Uses hybrid stringing" : ""}`;

    // API 호출 헬퍼 (강화된 자동 재시도 및 지수 백오프 포함)
    async function callAPI(prompt, maxTokens = 1200) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey.trim()}`;
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      };

      let lastError = null;
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          // 503 (High Demand) 또는 429 (Rate Limit) 시 재시도
          if (res.status === 503 || res.status === 429) {
            const delay = Math.pow(2, attempt) * 1000; // 지수 백오프 (2s, 4s, 8s, 16s...)
            console.warn(`Attempt ${attempt}: API ${res.status}. Retrying in ${delay}ms...`);
            if (attempt < 5) {
              await new Promise(r => setTimeout(r, delay));
              continue;
            }
          }

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(`API Error: ${res.status} ${errorData.error?.message || ''}`);
          }

          const data = await res.json();

          if (data.error) {
            throw new Error(`API Error: ${data.error.message || "Unknown error"}`);
          }

          if (!data.candidates || data.candidates.length === 0) {
            throw new Error("응답 결과가 없습니다.");
          }

          const candidate = data.candidates[0];

          if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
            const reason = candidate.finishReason || "UNKNOWN";
            throw new Error(`AI가 응답을 생성하지 못했습니다. (사유: ${reason})`);
          }

          return candidate.content.parts[0].text.trim();
        } catch (e) {
          lastError = e;
          if (attempt === 5) throw e;
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(r => setTimeout(r, delay));
        }
      }
      throw lastError;
    }

    // JSON 추출 헬퍼
    function extractJSON(raw, bracket) {
      const open = bracket === "{" ? "{" : "[";
      const close = bracket === "{" ? "}" : "]";
      const start = raw.indexOf(open);
      const end = raw.lastIndexOf(close);
      if (start === -1 || end === -1) throw new Error("JSON 파싱 실패.\n응답: " + raw.slice(0, 200));
      return JSON.parse(raw.slice(start, end + 1));
    }

    try {
      let current_analysis = null;

      // ── 1단계: 현재 스트링 분석 (입력한 경우에만)
      if (hasCurrentString) {
        const analysisPrompt = `Tennis string expert. Analyze if this string fits the player. Return ONLY raw JSON, no markdown.

Player: ${profile}
String: ${form.current_string}${form.cross_string ? ` (메인) + ${form.cross_string} (크로스)` : ""}${form.current_gauge ? ` / Gauge: ${form.current_gauge}` : ""}${tensionInfo ? ` / Tension: ${tensionInfo}` : ""}

JSON format (start with {, end with }):
{"string_name":"${form.current_string}${form.cross_string ? ` + ${form.cross_string}` : ""}","gauge":"${form.current_gauge || ""}","tension":"${tensionInfo || ""}","fit_score":72,"verdicts":[{"type":"good","text":"Korean"},{"type":"warn","text":"Korean"},{"type":"bad","text":"Korean"}],"summary":"Korean 2 sentences with **bold** key points."}

Player satisfaction with current string: ${form.satisfaction}

Rules: fit_score 0-100, verdicts 2-4 items (mix good/warn/bad), keep each text under 40 Korean chars.`;

        const raw1 = await callAPI(analysisPrompt, 2000);
        current_analysis = extractJSON(raw1, "{");
      }

      // ── 2단계: 스트링 추천 5개
      const hasImprovement = form.improvement_request.trim().length > 0;
      const recoPrompt = `You are a world-class tennis string expert. Recommend exactly 5 tennis strings tailored to this player. Return ONLY a raw JSON array.

Player: ${profile}${hasCurrentString ? `\nCurrent string: ${form.current_string}${form.cross_string ? ` (main) + ${form.cross_string} (cross)` : ""}${form.current_gauge ? ` gauge ${form.current_gauge}` : ""}${tensionInfo ? ` tension ${tensionInfo}` : ""} / satisfaction: ${form.satisfaction}` : ""}${hasImprovement ? `\nImprovement request (TOP PRIORITY — must be addressed first): ${form.improvement_request}` : ""}

IMPORTANT REQUIREMENTS:
1. Recommend exactly 5 DIFFERENT strings.
2. ALL 5 strings MUST be polyester or co-polyester (co-poly) strings ONLY. Do NOT recommend natural gut, multifilament, or synthetic gut strings.
3. For each string, choose the MOST appropriate gauge for this specific player:
   - Thinner gauge (17/1.20mm, 17L/1.15mm): better spin, feel, power — best for players prioritizing spin, comfort, or arm-friendliness
   - Standard gauge (16/1.30mm, 16L/1.25mm): balanced durability and performance — good all-round choice
   - Thicker gauge (15L/1.35mm, 15/1.40mm): more durability, control — best for string breakers or heavy hitters
   NEVER assign the same gauge to all 5 strings. Vary gauges based on each string's characteristics and the player profile.
4. Each string recommendation must be meaningfully different in character (e.g. different shapes, stiffness levels, spin vs control focus).

JSON array (exactly 5 objects):
[{"brand":"Babolat","name":"RPM Blast","type":"폴리에스터","tags":["스핀","컨트롤"],"match_score":91,"description":"Korean 2 sentences about the string.","specs":{"power":6,"spin":9,"control":9,"comfort":5,"durability":8,"tension_stability":7},"data":[{"key":"소재","value":"Co-Poly"},{"key":"게이지","value":"17 (1.20mm)"},{"key":"모양","value":"원형"},{"key":"추천 텐션","value":"50-56lbs"},{"key":"가격대","value":"$15/세트"}],"reason":"Korean 2-3 sentences explaining exactly why this string suits THIS player specifically — reference the player's level, swing speed, style, arm sensitivity, racket, and priorities.","vs_current":${hasCurrentString ? '"Korean 1 sentence comparing performance vs current string."' : 'null'},"hybrid_combo":${isHybrid ? '"Korean 1-2 sentences recommending the best main+cross pairing with this string."' : 'null'}}]

Rules: specs values 1-10, match_score 1-100, gauge MUST vary across the 5 strings and reflect each string type, reasons must be personalized and specific.`;

      const raw2 = await callAPI(recoPrompt, 7000);
      const recommendations = extractJSON(raw2, "[");

      if (!Array.isArray(recommendations) || recommendations.length === 0) {
        throw new Error("추천 결과가 올바르지 않습니다.");
      }

      setResult({ current_analysis, recommendations });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{FONTS + styles}</style>
      <div className="app">
        <div className="hero">
          <div className="hero-eyebrow">Tennis String Lab</div>
          <div className="hero-title">나에게 맞는<br /><span>스트링</span> 찾기</div>
          <p className="hero-sub">
            현재 스트링 분석부터 맞춤 추천까지 — 플레이 프로필을 입력하면 AI가 스트링 전문가처럼 분석해드립니다
          </p>
        </div>

        <div className="container">

          {/* 플레이 프로필 */}
          <div className="form-card">
            <div className="form-title"><span>⚙</span> 플레이 프로필</div>
            <div className="form-grid">
              <div className="field">
                <label className="field-label">실력 수준</label>
                <select value={form.level} onChange={e => setField("level", e.target.value)}>
                  <option>입문 (NTRP 2.0~2.5)</option>
                  <option>초급 (NTRP 2.5~3.0)</option>
                  <option>중급 (NTRP 3.0~4.0)</option>
                  <option>중상급 (NTRP 4.0~4.5)</option>
                  <option>상급 (NTRP 4.5+)</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">스윙 속도</label>
                <select value={form.swing} onChange={e => setField("swing", e.target.value)}>
                  <option>느림</option>
                  <option>보통</option>
                  <option>빠름</option>
                  <option>매우 빠름</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">플레이 스타일</label>
                <select value={form.play_style} onChange={e => setField("play_style", e.target.value)}>
                  <option>올라운더</option>
                  <option>베이스라이너 (랠리형)</option>
                  <option>공격형 베이스라이너</option>
                  <option>서브앤발리 / 네트플레이어</option>
                  <option>스핀 위주</option>
                  <option>플랫 위주</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">팔/어깨 민감도</label>
                <select value={form.arm} onChange={e => setField("arm", e.target.value)}>
                  <option>민감하지 않음</option>
                  <option>민감</option>
                  <option>약간 민감</option>
                  <option>테니스 엘보 있음</option>
                  <option>팔 부상 회복 중</option>
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
                  <input type="range" min={1} max={5} step={1}
                    value={form.priorities[key]}
                    onChange={e => setPriority(key, e.target.value)} />
                </div>
              ))}
            </div>

            <div className="section-label">── 사용 라켓 정보 <span style={{ color: '#4a6050', fontFamily: 'DM Sans', textTransform: 'none', letterSpacing: '0', fontSize: '11px', fontWeight: '400' }}>(선택 — 라켓 성향까지 반영한 최적 스트링 추천)</span></div>
            <div className="form-grid">
              <div className="field">
                <label className="field-label">라켓 브랜드</label>
                <input
                  list="racket-brands"
                  type="text"
                  placeholder="예: 윌슨, 바볼랏, 요넥스, 헤드..."
                  value={form.racket_brand}
                  onChange={e => setField("racket_brand", e.target.value)}
                />
                <datalist id="racket-brands">
                  <option value="윌슨" /><option value="바볼랏" /><option value="요넥스" />
                  <option value="헤드" /><option value="던롭" /><option value="테크니화이버" />
                  <option value="프린스" /><option value="슬레진저" />
                </datalist>
              </div>
              <div className="field">
                <label className="field-label">라켓 모델명</label>
                <input
                  type="text"
                  placeholder="예: Pro Staff 97, Pure Aero, VCORE 98..."
                  value={form.racket_model}
                  onChange={e => setField("racket_model", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 현재 스트링 */}
          <div className="current-string-card">
            <div className="current-string-title">
              🎾 현재 사용 중인 스트링
              <span className="optional-badge">선택 입력</span>
            </div>
            <div className="form-grid-3">
              <div className="field">
                <label className="field-label">스트링 이름 (메인)</label>
                <input
                  type="text"
                  placeholder="예: 룩시론 ALU파워, 소린코 투어바이트..."
                  value={form.current_string}
                  onChange={e => setField("current_string", e.target.value)}
                />
              </div>
              <div className="field">
                <label className="field-label">크로스 스트링 <span className="optional-badge">하이브리드</span></label>
                <input
                  type="text"
                  placeholder="예: 윌슨 NXT, 바볼랏 엑셀... (단일 스트링이면 비워두세요)"
                  value={form.cross_string}
                  onChange={e => setField("cross_string", e.target.value)}
                />
              </div>
              <div className="field">
                <label className="field-label">게이지 (굵기)</label>
                <input
                  list="gauge-list"
                  type="text"
                  placeholder="예: 16 (1.30mm) 또는 직접 입력 ex) 1.25"
                  value={form.current_gauge}
                  onChange={e => setField("current_gauge", e.target.value)}
                />
                <datalist id="gauge-list">
                  <option value="15 (1.40mm)" />
                  <option value="15L (1.35mm)" />
                  <option value="16 (1.30mm)" />
                  <option value="16L (1.25mm)" />
                  <option value="17 (1.20mm)" />
                  <option value="17L (1.15mm)" />
                  <option value="18 (1.10mm)" />
                </datalist>
                <span className="field-hint">얇을수록 스핀·감각↑ 내구성↓</span>
              </div>
              <div className="field">
                <label className="field-label">메인 텐션 (파운드)</label>
                <select
                  value={form.main_tension}
                  onChange={e => setField("main_tension", e.target.value)}
                >
                  <option value="">모름 / 미입력</option>
                  {Array.from({ length: 41 }, (_, i) => i + 30).map(t => (
                    <option key={t} value={`${t} lbs`}>{t} lbs</option>
                  ))}
                </select>
                <span className="field-hint">메인(세로) 스트링 텐션</span>
              </div>
              <div className="field">
                <label className="field-label">크로스 텐션 <span className="optional-badge">다른 경우만</span></label>
                <select
                  value={form.cross_tension}
                  onChange={e => setField("cross_tension", e.target.value)}
                >
                  <option value="">메인과 동일</option>
                  {Array.from({ length: 41 }, (_, i) => i + 30).map(t => (
                    <option key={t} value={`${t} lbs`}>{t} lbs</option>
                  ))}
                </select>
                <span className="field-hint">크로스(가로) 스트링 텐션</span>
              </div>
              <div className="field">
                <label className="field-label">사용 만족도</label>
                <select value={form.satisfaction} onChange={e => setField("satisfaction", e.target.value)}>
                  <option>보통 / 무난함</option>
                  <option>매우 만족</option>
                  <option>만족하지만 개선 원함</option>
                  <option>불만족 — 교체 원함</option>
                </select>
              </div>
            </div>
          </div>

          {/* 개선 요구사항 */}
          <div className="improve-card">
            <div className="improve-title">
              ✏️ 개선 요구사항
              <span className="optional-badge">선택 입력</span>
            </div>
            <textarea
              className="improve-textarea"
              placeholder="예: 스핀은 줄어도 되니 팔에 충격이 덜한 스트링을 원해요 / 내구성이 더 좋은 스트링으로 바꾸고 싶어요 / 컨트롤보다 파워가 더 중요해요 / 가격이 저렴한 스트링을 추천해 주세요..."
              value={form.improvement_request}
              onChange={e => setField("improvement_request", e.target.value)}
            />
          </div>

          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "분석 중..." : "🎾 AI 스트링 분석 & 추천 받기"}
          </button>

          {loading && (
            <div className="loading-box" style={{ marginTop: 24 }}>
              <div className="spinner" />
              <div className="loading-text">
                {hasCurrentString ? "현재 스트링 분석 + 최적 스트링 탐색 중..." : "최적 스트링 탐색 중..."}
              </div>
            </div>
          )}

          {error && (
            <div className="error-box" style={{ marginTop: 20 }}>
              <div className="error-title">⚠ 오류 발생</div>
              <div className="error-detail">{error}</div>
            </div>
          )}

          {result && (
            <>
              {result.current_analysis && (
                <CurrentStringAnalysis analysis={result.current_analysis} />
              )}

              <div className="result-header">
                <span className="result-badge">AI PICKS</span>
                <span className="result-label">맞춤 추천 스트링 TOP 3</span>
              </div>
              {result.recommendations.map((s, i) => (
                <StringCard key={i} string={s} index={i} />
              ))}

              <div style={{ textAlign: "center" }}>
                <button className="reset-btn" onClick={() => setResult(null)}>↩ 다시 입력하기</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
