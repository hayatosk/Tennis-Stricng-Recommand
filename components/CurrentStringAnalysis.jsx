import SafeFormattedText from './SafeFormattedText';

export default function CurrentStringAnalysis({ analysis }) {
  const score = analysis.fit_score;
  const scoreClass = score >= 75 ? 'high' : score >= 50 ? 'mid' : 'low';

  return (
    <div className="analysis-card">
      <div className="analysis-header">
        <div className="analysis-icon">🔍</div>
        <div className="analysis-header-text">
          <div className="analysis-eyebrow">현재 스트링 분석</div>
          <div className="analysis-string-name">{analysis.string_name}</div>
          <div className="analysis-meta">
            {analysis.gauge && `게이지 ${analysis.gauge}`}
            {analysis.gauge && analysis.tension && ' · '}
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
            <span className="verdict-icon">{v.type === 'good' ? '✅' : v.type === 'warn' ? '⚠️' : '❌'}</span>
            <span className="verdict-text">{v.text}</span>
          </div>
        ))}
        <div className="analysis-summary">
          <SafeFormattedText text={analysis.summary} />
        </div>
      </div>
    </div>
  );
}
