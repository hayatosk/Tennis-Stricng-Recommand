import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BACK_LINK_CLS, CARD_CLS, CONTENT_WRAP, EYEBROW_CLS, PAGE_SHELL } from '../components/LogUI';
import { deleteLog, getAllLogs } from '../lib/logStorage';

// ─── 카드 내 요약 점수 (파워·스핀·컨트롤 3개만) ──────────────────────────────

const SUMMARY_SCORES = [
  { key: 'power',   label: 'P' },
  { key: 'spin',    label: 'S' },
  { key: 'control', label: 'C' },
];

function ScorePill({ label, value }) {
  return (
    <span className="flex items-center gap-1 text-xs text-white/40">
      <span className="text-white/25">{label}</span>
      <span className="font-semibold text-white/70">{value}</span>
    </span>
  );
}

// ─── 로그 카드 ────────────────────────────────────────────────────────────────

function LogCard({ log, onDelete }) {
  const navigate = useNavigate();

  const displayDate = log.date
    ? new Date(log.date + 'T00:00:00').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date(log.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  const hasSummaryScore = SUMMARY_SCORES.some(({ key }) => log[key]);

  return (
    <div
      className={`${CARD_CLS} p-5 flex flex-col gap-3 hover:bg-white/[0.07] active:scale-[0.99] transition-all cursor-pointer`}
      onClick={() => navigate(`/log/${log.id}`)}
    >
      {/* 날짜 + 삭제 */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-white/35">{displayDate}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(log.id); }}
          className="text-white/20 hover:text-red-400 transition-colors text-base leading-none flex-shrink-0 -mt-0.5"
          aria-label="삭제"
        >
          ×
        </button>
      </div>

      {/* 라켓 + 스트링 */}
      <div>
        <div className="text-base font-semibold text-white leading-snug">
          {[log.racketBrand, log.racketModel].filter(Boolean).join(' ') || '라켓 미입력'}
        </div>
        <div className="text-sm text-emerald-400 mt-0.5">
          {[log.mainStringBrand, log.mainString].filter(Boolean).join(' ') || '스트링 미입력'}
          {log.crossString && log.crossString !== log.mainString && (
            <span className="text-white/35"> × {log.crossString}</span>
          )}
        </div>
      </div>

      {/* 텐션·게이지 뱃지 */}
      {(log.mainTension || log.crossTension || log.gauge) && (
        <div className="flex flex-wrap gap-1.5">
          {log.mainTension && (
            <span className="bg-white/5 border border-white/8 rounded-full px-2.5 py-0.5 text-xs text-white/45">
              메인 {log.mainTension}
            </span>
          )}
          {log.crossTension && (
            <span className="bg-white/5 border border-white/8 rounded-full px-2.5 py-0.5 text-xs text-white/45">
              크로스 {log.crossTension}
            </span>
          )}
          {log.gauge && (
            <span className="bg-white/5 border border-white/8 rounded-full px-2.5 py-0.5 text-xs text-white/45">
              {log.gauge}
            </span>
          )}
        </div>
      )}

      {/* 요약 점수 + 상세 버튼 */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="flex gap-3">
          {hasSummaryScore
            ? SUMMARY_SCORES.map(({ key, label }) =>
                log[key] ? <ScorePill key={key} label={label} value={log[key]} /> : null
              )
            : <span className="text-xs text-white/20">점수 없음</span>
          }
        </div>
        <span className="text-xs text-white/30 hover:text-white/60 transition-colors">
          상세 →
        </span>
      </div>
    </div>
  );
}

// ─── 빈 상태 ─────────────────────────────────────────────────────────────────

function EmptyState({ isFiltered }) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="text-4xl opacity-20">🔍</div>
        <p className="text-sm text-white/30">검색 결과가 없어요.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="text-5xl opacity-25">🎾</div>
      <p className="text-white/35 text-sm leading-relaxed">
        아직 기록된 스트링 로그가 없어요.<br />
        스트링을 교체할 때마다 기록해보세요.
      </p>
      <Link
        to="/log/new"
        className="mt-1 text-sm text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors"
      >
        첫 기록 남기기
      </Link>
    </div>
  );
}

// ─── 라켓 모델 필터 pills ─────────────────────────────────────────────────────

function RacketFilter({ models, active, onChange }) {
  if (models.length < 2) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        onClick={() => onChange('')}
        className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          active === ''
            ? 'bg-emerald-500 text-white'
            : 'bg-white/5 text-white/40 hover:text-white/60'
        }`}
      >
        전체
      </button>
      {models.map((model) => (
        <button
          key={model}
          onClick={() => onChange(model === active ? '' : model)}
          className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            active === model
              ? 'bg-emerald-500 text-white'
              : 'bg-white/5 text-white/40 hover:text-white/60'
          }`}
        >
          {model}
        </button>
      ))}
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────────────

export default function LogPage() {
  const [logs,         setLogs]         = useState([]);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [racketFilter, setRacketFilter] = useState('');

  useEffect(() => {
    setLogs(getAllLogs());
  }, []);

  // 전체 로그에서 고유 racketModel 목록 추출 (필터 pills용)
  const uniqueRacketModels = useMemo(
    () => [...new Set(logs.map((l) => l.racketModel).filter(Boolean))],
    [logs]
  );

  // 검색 + 라켓 필터 동시 적용
  const filtered = useMemo(() => {
    let result = logs;

    if (racketFilter) {
      result = result.filter((l) =>
        l.racketModel.toLowerCase().includes(racketFilter.toLowerCase())
      );
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (l) =>
          (l.mainStringBrand || '').toLowerCase().includes(q) ||
          l.mainString.toLowerCase().includes(q) ||
          l.crossString.toLowerCase().includes(q)
      );
    }

    return result;
  }, [logs, racketFilter, searchQuery]);

  const isFiltered = Boolean(searchQuery.trim() || racketFilter);

  function handleDelete(id) {
    if (!window.confirm('이 로그를 삭제할까요?\n삭제하면 복구할 수 없어요.')) return;
    deleteLog(id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div className={PAGE_SHELL}>
      <div className={CONTENT_WRAP}>

        {/* 헤더 */}
        <div className="mb-6">
          <Link
            to="/"
            className={`${BACK_LINK_CLS} mb-6 inline-block`}
          >
            ← 추천으로 돌아가기
          </Link>
          <div className="flex items-end justify-between">
            <div>
              <div className={EYEBROW_CLS}>
                String Logbook
              </div>
              <h1 className="text-2xl font-bold">스트링 기록</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* 필터 중이면 "N / 전체 M개", 아니면 "N개" */}
              <span className="text-sm text-white/30">
                {isFiltered
                  ? `${filtered.length} / 전체 ${logs.length}개`
                  : `${logs.length}개`}
              </span>
              <Link
                to="/log/new"
                className="rounded-lg bg-emerald-500 hover:bg-emerald-400 transition-colors px-3 py-1.5 text-xs font-semibold text-white"
              >
                + 새 기록
              </Link>
            </div>
          </div>
        </div>

        {/* 검색 + 필터 (데이터 있을 때만) */}
        {logs.length > 0 && (
          <div className="flex flex-col gap-3 mb-6">
            {/* 검색 입력 */}
            <input
              type="search"
              placeholder="스트링 이름으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 transition-colors"
            />

            {/* 라켓 모델 필터 */}
            <RacketFilter
              models={uniqueRacketModels}
              active={racketFilter}
              onChange={setRacketFilter}
            />
          </div>
        )}

        {/* 리스트 or 빈 상태 */}
        {filtered.length === 0 ? (
          <EmptyState isFiltered={isFiltered} />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((log) => (
              <LogCard key={log.id} log={log} onDelete={handleDelete} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
