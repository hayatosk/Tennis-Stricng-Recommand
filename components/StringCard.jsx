import StatBar from './StatBar';
import { SPEC_LABELS } from '../lib/constants';

function ComparisonBlock({ comparison }) {
  if (!comparison) return null;
  if (typeof comparison === 'string') {
    return <p className="upgrade-text">{comparison}</p>;
  }

  return (
    <div className="upgrade-text flex flex-col gap-2">
      {comparison.summary && <p>{comparison.summary}</p>}
      {comparison.advantages?.length > 0 && (
        <div>
          <div className="why-title text-emerald-400">장점</div>
          <ul className="list-disc pl-5">
            {comparison.advantages.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}
      {comparison.cautions?.length > 0 && (
        <div>
          <div className="upgrade-title">주의할 점</div>
          <ul className="list-disc pl-5">
            {comparison.cautions.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function HybridBlock({ hybrid }) {
  if (!hybrid) return null;
  if (typeof hybrid === 'string') {
    return <p className="hybrid-text">{hybrid}</p>;
  }

  return (
    <div className="hybrid-text flex flex-col gap-3">
      {hybrid.position && (
        <div className="inline-flex w-fit rounded-full border border-violet-300/30 bg-violet-300/10 px-3 py-1 text-xs font-semibold text-violet-200">
          {hybrid.position}
        </div>
      )}
      {hybrid.full_bed && (
        <div>
          <div className="hybrid-title">풀잡으로 사용 시</div>
          <p>{hybrid.full_bed}</p>
        </div>
      )}
      {hybrid.as_main && (
        <div>
          <div className="hybrid-title">메인으로 하이브리드 시</div>
          <p>{hybrid.as_main}</p>
        </div>
      )}
      {hybrid.as_cross && (
        <div>
          <div className="hybrid-title">크로스로 하이브리드 시</div>
          <p>{hybrid.as_cross}</p>
        </div>
      )}
    </div>
  );
}

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
            <ComparisonBlock comparison={string.vs_current} />
          </div>
        )}
        {string.hybrid_combo && (
          <div className="hybrid-box">
            <div className="hybrid-title">🔀 추천 사용 방식과 하이브리드 조합</div>
            <HybridBlock hybrid={string.hybrid_combo} />
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
