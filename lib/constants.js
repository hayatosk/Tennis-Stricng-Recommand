export const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');`;

export const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .app { min-height: 100vh; background: #0b110c; color: #e8f0e9; font-family: 'DM Sans', sans-serif; }
  .hero { background: linear-gradient(135deg, #0b2e12 0%, #0b110c 60%); border-bottom: 1px solid #1e3a22; padding: 48px 24px 36px; text-align: center; position: relative; overflow: hidden; }
  .hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% -20%, rgba(74,222,128,0.08), transparent); pointer-events: none; }
  .hero-eyebrow { font-family: 'DM Mono', monospace; font-size: 15px; letter-spacing: 3px; text-transform: uppercase; color: #4ade80; margin-bottom: 12px; font-weight: 500; }
  .hero-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(42px, 7vw, 72px); line-height: 0.95; color: #f0faf1; letter-spacing: 1px; margin-bottom: 16px; }
  .hero-title span { color: #4ade80; }
  .hero-sub { font-size: 14px; color: #6b8f72; max-width: 580px; margin: 0 auto; line-height: 1.6; }
  .container { max-width: 900px; margin: 0 auto; padding: 40px 20px 80px; }
  .section-label { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #4ade80; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #1e3a22; }
  .form-card, .analysis-card, .string-card, .loading-box { background: #111a12; border: 1px solid #1e3a22; border-radius: 16px; }
  .form-card { padding: 32px; margin-bottom: 20px; }
  .form-title { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 1px; color: #4ade80; margin-bottom: 22px; display: flex; align-items: center; gap: 10px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  @media (max-width: 600px) { .form-grid, .form-grid-3, .priority-grid, .data-grid, .result-grid { grid-template-columns: 1fr !important; } }
  .field { display: flex; flex-direction: column; gap: 7px; }
  .field-label { font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #6b8f72; }
  .field-hint { font-size: 11px; color: #4a6050; margin-top: 3px; }
  .field select, .field input, .improve-textarea { background: #0b110c; border: 1px solid #2a4a2e; border-radius: 8px; color: #e8f0e9; font-family: 'DM Sans', sans-serif; font-size: 14px; padding: 10px 14px; outline: none; transition: border-color 0.2s; }
  .field select:focus, .field input:focus, .improve-textarea:focus { border-color: #4ade80; }
  .field input::placeholder, .improve-textarea::placeholder { color: #3a5a3e; }
  .current-string-card, .improve-card, .swing-video-card { border-radius: 12px; padding: 22px; margin-bottom: 20px; }
  .current-string-card { background: rgba(74,222,128,0.04); border: 1px solid rgba(74,222,128,0.2); }
  .improve-card { background: rgba(250,204,21,0.04); border: 1px solid rgba(250,204,21,0.18); }
  .swing-video-card { background: rgba(56,189,248,0.045); border: 1px solid rgba(56,189,248,0.2); }
  .current-string-title, .improve-title, .swing-video-title { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 1px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .current-string-title { color: #4ade80; }
  .improve-title { color: #facc15; }
  .swing-video-title { color: #38bdf8; }
  .swing-video-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: stretch; }
  @media (max-width: 760px) { .swing-video-layout { grid-template-columns: 1fr; } }
  .swing-video-panel, .swing-analysis-panel { background: #0b110c; border: 1px solid rgba(56,189,248,0.16); border-radius: 10px; padding: 14px; min-height: 186px; }
  .video-input { width: 100%; color: #9bb89f; font-size: 12px; margin-bottom: 12px; }
  .video-input::file-selector-button { background: #123042; border: 1px solid rgba(56,189,248,0.35); border-radius: 8px; color: #7dd3fc; padding: 8px 12px; margin-right: 12px; cursor: pointer; }
  .swing-preview { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 8px; border: 1px solid #1e3a22; background: #050805; margin-bottom: 12px; }
  .swing-analyze-btn { width: 100%; padding: 11px 14px; background: #38bdf8; color: #06111a; border: none; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .swing-analyze-btn:hover { background: #7dd3fc; transform: translateY(-1px); }
  .swing-analyze-btn:disabled { background: #1d3b4a; color: #527487; cursor: not-allowed; transform: none; }
  .swing-error { color: #fca5a5; font-size: 12px; line-height: 1.5; margin-top: 10px; }
  .swing-empty, .swing-summary { color: #9bb89f; font-size: 13px; line-height: 1.7; }
  .swing-pill-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .swing-observations { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
  .swing-observation { color: #7dd3fc; font-size: 12px; line-height: 1.5; padding: 9px 10px; border-radius: 8px; background: rgba(56,189,248,0.06); border: 1px solid rgba(56,189,248,0.12); }
  .optional-badge { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 1px; background: #1e3a22; color: #6b8f72; padding: 2px 8px; border-radius: 100px; font-weight: 400; }
  .priority-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .priority-item { display: flex; flex-direction: column; gap: 6px; }
  .priority-header { display: flex; justify-content: space-between; align-items: center; }
  .priority-name { font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #9bb89f; }
  .priority-val { font-family: 'DM Mono', monospace; font-size: 12px; color: #4ade80; font-weight: 500; }
  input[type=range] { -webkit-appearance: none; width: 100%; height: 4px; border-radius: 2px; background: #1e3a22; outline: none; cursor: pointer; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #4ade80; cursor: pointer; box-shadow: 0 0 8px rgba(74,222,128,0.4); }
  .submit-btn { width: 100%; padding: 16px; background: #4ade80; color: #0a0f0a; border: none; border-radius: 10px; font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 2px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; }
  .submit-btn:hover { background: #86efac; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(74,222,128,0.2); }
  .submit-btn:disabled { background: #2a4a2e; color: #4a7050; cursor: not-allowed; transform: none; box-shadow: none; }
  .spinner { width: 48px; height: 48px; border: 3px solid #1e3a22; border-top-color: #4ade80; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 20px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-box { text-align: center; padding: 60px 20px; margin-top: 24px; }
  .loading-text { font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 2px; color: #4ade80; }
  .error-box { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 20px 24px; margin-top: 20px; }
  .error-title { color: #fca5a5; font-weight: 600; font-size: 14px; margin-bottom: 8px; }
  .error-detail { color: #f87171; font-family: 'DM Mono', monospace; font-size: 12px; line-height: 1.6; word-break: break-all; white-space: pre-wrap; }
  .analysis-header { background: linear-gradient(90deg, #0b2e12, #111a12); padding: 20px 28px; display: flex; align-items: center; gap: 14px; border-bottom: 1px solid #1e3a22; }
  .analysis-icon { font-size: 28px; }
  .analysis-header-text { flex: 1; }
  .analysis-eyebrow, .spec-section-title { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #4ade80; }
  .analysis-string-name { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #f0faf1; letter-spacing: 0.5px; }
  .analysis-meta { font-size: 12px; color: #6b8f72; margin-top: 2px; }
  .fit-score-badge, .match-score { text-align: center; min-width: 80px; }
  .fit-score-num, .match-num { font-family: 'Bebas Neue', sans-serif; font-size: 48px; line-height: 1; }
  .fit-score-num.high, .match-num { color: #4ade80; }
  .fit-score-num.mid { color: #facc15; }
  .fit-score-num.low { color: #f87171; }
  .fit-score-label, .match-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #6b8f72; }
  .analysis-body, .card-body { padding: 24px 28px; }
  .verdict-row { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border-radius: 10px; margin-bottom: 10px; font-size: 14px; line-height: 1.6; }
  .verdict-good { background: rgba(74,222,128,0.07); border: 1px solid rgba(74,222,128,0.15); color: #9bb89f; }
  .verdict-warn { background: rgba(250,204,21,0.07); border: 1px solid rgba(250,204,21,0.15); color: #a89f70; }
  .verdict-bad { background: rgba(248,113,113,0.07); border: 1px solid rgba(248,113,113,0.15); color: #a87070; }
  .analysis-summary { margin-top: 18px; padding: 16px 18px; background: #0b110c; border: 1px solid #1e3a22; border-radius: 10px; font-size: 14px; line-height: 1.7; color: #9bb89f; }
  .analysis-summary strong { color: #4ade80; }
  .result-header { display: flex; align-items: center; gap: 12px; margin: 32px 0 20px; }
  .result-badge { background: #4ade80; color: #0a0f0a; font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: 1.5px; padding: 4px 10px; border-radius: 100px; }
  .result-label { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #6b8f72; letter-spacing: 1px; }
  .string-card { overflow: hidden; margin-bottom: 28px; }
  .card-top { padding: 28px 28px 0; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .card-rank { font-family: 'Bebas Neue', sans-serif; font-size: 64px; line-height: 1; color: #1e3a22; min-width: 50px; }
  .card-rank.gold { color: #b8860b; } .card-rank.silver { color: #4a6060; } .card-rank.bronze { color: #7a4a2e; } .card-rank.fourth { color: #3a4a6a; } .card-rank.fifth { color: #2a4a3a; }
  .card-info { flex: 1; }
  .card-brand { font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #4ade80; margin-bottom: 4px; }
  .card-name { font-family: 'Bebas Neue', sans-serif; font-size: 36px; line-height: 1; color: #f0faf1; letter-spacing: 0.5px; margin-bottom: 8px; }
  .card-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .tag { font-size: 11px; font-weight: 500; letter-spacing: 0.5px; padding: 3px 10px; border-radius: 100px; border: 1px solid #2a4a2e; color: #9bb89f; background: #0b110c; }
  .tag.highlight { border-color: #4ade80; color: #4ade80; }
  .tag.upgrade { border-color: #facc15; color: #facc15; background: rgba(250,204,21,0.05); }
  .card-desc, .why-text, .upgrade-text, .hybrid-text { font-size: 13px; line-height: 1.65; }
  .card-desc { font-size: 14px; color: #9bb89f; margin-bottom: 24px; }
  .spec-section-title { margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #1e3a22; }
  .spec-bars { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
  .spec-row { display: flex; align-items: center; gap: 12px; }
  .spec-name { font-size: 12px; font-weight: 500; color: #9bb89f; width: 90px; flex-shrink: 0; }
  .spec-track { flex: 1; height: 6px; background: #1e3a22; border-radius: 3px; overflow: hidden; }
  .spec-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #16a34a, #4ade80); }
  .spec-val { font-family: 'DM Mono', monospace; font-size: 11px; color: #4ade80; width: 28px; text-align: right; }
  .data-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #1e3a22; border-radius: 10px; overflow: hidden; margin-bottom: 20px; }
  .data-cell { background: #0b110c; padding: 14px 16px; }
  .data-key { font-size: 10px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #4a7050; margin-bottom: 4px; }
  .data-value { font-family: 'DM Mono', monospace; font-size: 13px; color: #e8f0e9; font-weight: 500; }
  .why-box, .upgrade-box, .hybrid-box { border-radius: 10px; padding: 16px 18px; }
  .why-box { background: rgba(74,222,128,0.05); border: 1px solid rgba(74,222,128,0.15); }
  .upgrade-box { background: rgba(250,204,21,0.05); border: 1px solid rgba(250,204,21,0.2); margin-top: 12px; }
  .hybrid-box { background: rgba(139,92,246,0.07); border: 1px solid rgba(139,92,246,0.25); margin-top: 12px; }
  .why-title, .upgrade-title, .hybrid-title { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px; }
  .why-title { color: #4ade80; } .upgrade-title { color: #facc15; } .hybrid-title { color: #a78bfa; }
  .reset-btn { background: transparent; border: 1px solid #2a4a2e; color: #6b8f72; border-radius: 8px; padding: 10px 20px; font-family: 'DM Sans', sans-serif; font-size: 13px; cursor: pointer; transition: all 0.2s; margin-top: 8px; }
  .reset-btn:hover { border-color: #4ade80; color: #4ade80; }
`;

export const PRIORITIES = [
  { key: 'spin', label: '스핀' },
  { key: 'power', label: '파워' },
  { key: 'control', label: '컨트롤' },
  { key: 'comfort', label: '팔 편안함' },
];

export const SPEC_LABELS = {
  power: '파워',
  spin: '스핀',
  control: '컨트롤',
  comfort: '편안함',
  durability: '내구성',
  tension_stability: '장력 유지',
};

export const STORAGE_KEY = 'tennis-string-lab-form-v2';
