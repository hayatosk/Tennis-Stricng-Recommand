import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BACK_LINK_CLS, CARD_CLS, CONTENT_WRAP, EYEBROW_CLS, PAGE_SHELL } from '../components/LogUI';
import { deleteLog, getAllLogs } from '../lib/logStorage';

const SUMMARY_SCORES = [
  { key: 'power', label: 'P' },
  { key: 'spin', label: 'S' },
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

function stringName(brand, model) {
  return [brand, model].filter(Boolean).join(' ');
}

function getRacketKey(log) {
  return [log.racketBrand, log.racketModel, log.racketNumber].filter(Boolean).join(' | ') || '라켓 미입력';
}

function groupLogsByRacket(logs) {
  const groups = new Map();
  logs.forEach((log) => {
    const key = getRacketKey(log);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(log);
  });
  return [...groups.entries()].map(([key, items]) => ({ key, logs: items }));
}

function LogCard({ log, onDelete }) {
  const navigate = useNavigate();
  const displayDate = log.date
    ? new Date(`${log.date}T00:00:00`).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date(log.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const hasSummaryScore = SUMMARY_SCORES.some(({ key }) => log[key]);
  const mainString = stringName(log.mainStringBrand, log.mainString);
  const crossString = stringName(log.crossStringBrand, log.crossString);
  const detailTags = [
    log.mainTension && `메인 ${log.mainTension}`,
    log.crossTension && `크로스 ${log.crossTension}`,
    log.gauge && `메인 ${log.gauge}`,
    log.crossGauge && `크로스 ${log.crossGauge}`,
    log.mainStringColor && `메인 ${log.mainStringColor}`,
    log.crossStringColor && `크로스 ${log.crossStringColor}`,
  ].filter(Boolean);

  return (
    <div
      className={`${CARD_CLS} p-5 flex flex-col gap-3 hover:bg-white/[0.07] active:scale-[0.99] transition-all cursor-pointer`}
      onClick={() => navigate(`/log/${log.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-white/35">{displayDate}</span>
        <button
          onClick={(event) => { event.stopPropagation(); onDelete(log.id); }}
          className="text-white/20 hover:text-red-400 transition-colors text-base leading-none flex-shrink-0 -mt-0.5"
          aria-label="삭제"
        >
          ×
        </button>
      </div>

      <div>
        <div className="text-base font-semibold text-white leading-snug">
          {[log.racketBrand, log.racketModel].filter(Boolean).join(' ') || '라켓 미입력'}
          {log.racketNumber && <span className="ml-2 text-xs text-emerald-400">{log.racketNumber}</span>}
        </div>
        <div className="text-sm text-emerald-400 mt-0.5">
          {mainString || '스트링 미입력'}
          {crossString && <span className="text-white/35"> × {crossString}</span>}
        </div>
      </div>

      {detailTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {detailTags.map((tag) => (
            <span key={tag} className="bg-white/5 border border-white/8 rounded-full px-2.5 py-0.5 text-xs text-white/45">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="flex gap-3">
          {hasSummaryScore
            ? SUMMARY_SCORES.map(({ key, label }) => (
                log[key] ? <ScorePill key={key} label={label} value={log[key]} /> : null
              ))
            : <span className="text-xs text-white/20">점수 없음</span>}
        </div>
        <span className="text-xs text-white/30 hover:text-white/60 transition-colors">상세 →</span>
      </div>
    </div>
  );
}

function RacketLogGroup({ group, onDelete }) {
  const navigate = useNavigate();
  const latest = group.logs[0];
  const racketName = [latest.racketBrand, latest.racketModel].filter(Boolean).join(' ') || '라켓 미입력';

  function handleAddLog() {
    navigate('/log/new', {
      state: {
        prefill: {
          racketBrand: latest.racketBrand || '',
          racketModel: latest.racketModel || '',
          racketNumber: latest.racketNumber || '',
          headSize: latest.headSize || '',
          gripSize: latest.gripSize || '',
          racketWeight: latest.racketWeight || '',
        },
      },
    });
  }

  return (
    <section className="flex flex-col gap-3">
      <div className={`${CARD_CLS} px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
        <div>
          <div className="text-base font-semibold text-white">
            {racketName}
            {latest.racketNumber && <span className="ml-2 text-xs text-emerald-400">{latest.racketNumber}</span>}
          </div>
          <div className="text-xs text-white/35 mt-1">
            기록 {group.logs.length}개가 이 라켓 아래에 누적되어 있어요.
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handleAddLog}
            className="rounded-lg border border-emerald-400/35 bg-emerald-400/10 hover:bg-emerald-400/15 transition-colors px-3 py-2 text-xs font-semibold text-emerald-300"
          >
            스트링 로그 추가
          </button>
          <button
            type="button"
            onClick={() => navigate(`/log/recommend?racket=${encodeURIComponent(group.key)}`)}
            className="rounded-lg bg-emerald-500 hover:bg-emerald-400 transition-colors px-3 py-2 text-xs font-semibold text-white"
          >
            이 라켓 로그로 추천
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2 pl-0 sm:pl-4">
        {group.logs.map((log) => (
          <LogCard key={log.id} log={log} onDelete={onDelete} />
        ))}
      </div>
    </section>
  );
}

function EmptyState({ isFiltered }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-white/35 text-sm leading-relaxed">
        {isFiltered ? '검색 결과가 없어요.' : '아직 기록된 스트링 로그가 없어요.'}
      </p>
      {!isFiltered && (
        <Link to="/log/new" className="mt-1 text-sm text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors">
          첫 기록 남기기
        </Link>
      )}
    </div>
  );
}

function RacketFilter({ models, active, onChange }) {
  if (models.length < 2) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        onClick={() => onChange('')}
        className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          active === '' ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/40 hover:text-white/60'
        }`}
      >
        전체
      </button>
      {models.map((model) => (
        <button
          key={model}
          onClick={() => onChange(model === active ? '' : model)}
          className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            active === model ? 'bg-emerald-500 text-white' : 'bg-white/5 text-white/40 hover:text-white/60'
          }`}
        >
          {model}
        </button>
      ))}
    </div>
  );
}

export default function LogPage() {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [racketFilter, setRacketFilter] = useState('');

  useEffect(() => {
    setLogs(getAllLogs());
  }, []);

  const uniqueRacketModels = useMemo(
    () => [...new Set(logs.map((log) => log.racketModel).filter(Boolean))],
    [logs],
  );

  const filtered = useMemo(() => {
    let result = logs;

    if (racketFilter) {
      result = result.filter((log) => (log.racketModel || '').toLowerCase().includes(racketFilter.toLowerCase()));
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((log) => [
        log.mainStringBrand,
        log.mainString,
        log.crossStringBrand,
        log.crossString,
        log.mainStringColor,
        log.crossStringColor,
      ].some((value) => (value || '').toLowerCase().includes(q)));
    }

    return result;
  }, [logs, racketFilter, searchQuery]);

  const isFiltered = Boolean(searchQuery.trim() || racketFilter);
  const grouped = useMemo(() => groupLogsByRacket(filtered), [filtered]);

  function handleDelete(id) {
    if (!window.confirm('이 로그를 삭제할까요?\n삭제하면 복구할 수 없어요.')) return;
    deleteLog(id);
    setLogs((prev) => prev.filter((log) => log.id !== id));
  }

  return (
    <div className={PAGE_SHELL}>
      <div className={CONTENT_WRAP}>
        <div className="mb-6">
          <Link to="/" className={`${BACK_LINK_CLS} mb-6 inline-block`}>← 추천으로 돌아가기</Link>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className={EYEBROW_CLS}>String Logbook</div>
              <h1 className="text-2xl font-bold">스트링 기록</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/30">
                {isFiltered ? `${filtered.length} / 전체 ${logs.length}개` : `${logs.length}개`}
              </span>
              <Link to="/log/new" className="rounded-lg bg-emerald-500 hover:bg-emerald-400 transition-colors px-3 py-1.5 text-xs font-semibold text-white">
                + 새 기록
              </Link>
            </div>
          </div>
        </div>

        {logs.length > 0 && (
          <div className="flex flex-col gap-3 mb-6">
            <input
              type="search"
              placeholder="스트링, 색상, 브랜드로 검색..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-emerald-500/40 transition-colors"
            />
            <RacketFilter models={uniqueRacketModels} active={racketFilter} onChange={setRacketFilter} />
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState isFiltered={isFiltered} />
        ) : (
          <div className="flex flex-col gap-6">
            {grouped.map((group) => (
              <RacketLogGroup key={group.key} group={group} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
