import StatBar from './StatBar';
import { SPEC_LABELS } from '../lib/constants';

export default function StringCard({ string, index, onSaveToLog }) {
  const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : index === 3 ? 'fourth' : 'fifth';
  return (
    <div className="string-card">
      <div className="card-top">
        <div className={`card-rank ${rankClass}`}>{String(index + 1).padStart(2, '0')}</div>
        <div className="card-info">
          <div className="card-brand">{string.brand}</div>
          <div className="card-name">{string.name}</div>
          <div className="card-tags">
            <span className="tag highlight">{string.type}</span>
            {(string.tags || []).map((t) => (
              <span key={t} className={`tag ${t.includes('업그레이드') || t.includes('개선') ? 'upgrade' : ''}`}>{t}</span>
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
        {onSaveToLog && (
          <button
            onClick={() => onSaveToLog(string)}
            className="block w-full mt-4 px-4 py-2.5 bg-emerald-400/8 hover:bg-emerald-400/15 border border-emerald-400/22 rounded-xl text-emerald-400 text-[13px] font-medium tracking-wide cursor-pointer transition-colors"
          >
            이 세팅 로그북에 저장 →
          </button>
        )}
      </div>
    </div>
  );
}
