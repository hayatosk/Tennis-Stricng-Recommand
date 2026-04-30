import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllLogs } from '../lib/logStorage';

const tabs = [
  { id: 'recent', label: '최근 로그 분석' },
  { id: 'video', label: '영상 기반 추천' },
  { id: 'compare', label: '세팅 비교' },
];

const scoreLabels = {
  power: '파워',
  spin: '스핀',
  control: '컨트롤',
  comfort: '편안함',
  durability: '내구성',
};

function stringName(log) {
  const main = [log.mainStringBrand, log.mainString].filter(Boolean).join(' ');
  const cross = [log.crossStringBrand, log.crossString].filter(Boolean).join(' ');
  return [main, cross && `x ${cross}`].filter(Boolean).join(' ');
}

function racketKey(log) {
  return [log.racketBrand, log.racketModel, log.racketNumber].filter(Boolean).join(' | ') || '라켓 미입력';
}

function formatLogDate(log) {
  const value = log.date || log.createdAt;
  if (!value) return '날짜 미입력';
  const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '날짜 미입력';
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}

function logTitle(log) {
  return stringName(log) || [log.racketBrand, log.racketModel, log.racketNumber].filter(Boolean).join(' ') || '로그 미입력';
}

function logOptionLabel(log, index) {
  return `${index + 1}. ${formatLogDate(log)} · ${logTitle(log)}`;
}

function logScoreAverage(log) {
  const values = Object.keys(scoreLabels).map((key) => Number(log[key])).filter(Number.isFinite);
  if (!values.length) return '-';
  return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
}

function groupByRacket(logs) {
  const map = new Map();
  logs.forEach((log) => {
    const key = racketKey(log);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(log);
  });
  return [...map.entries()].map(([key, items]) => ({ key, logs: items }));
}

function RecentAnalysis({ logs }) {
  const latest = logs[0];
  const recentLogs = logs.slice(0, 5);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="text-xl font-bold">최근 로그 요약</h2>
        {latest ? (
          <div className="mt-5 space-y-3">
            {recentLogs.map((log, index) => (
              <div key={log.id || `${log.createdAt}-${index}`} className={`${index >= 3 ? 'hidden lg:block' : ''} rounded-xl bg-white/5 p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-white/35">{formatLogDate(log)}</div>
                    <div className="mt-1 font-semibold">{[log.racketBrand, log.racketModel, log.racketNumber].filter(Boolean).join(' ') || '라켓 미입력'}</div>
                  </div>
                  <div className="shrink-0 rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-300">#{index + 1}</div>
                </div>
                <div className="mt-3 text-sm text-emerald-400">{stringName(log) || '스트링 미입력'}</div>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  다음 추천에서는 {Number(log.comfort) < 6 ? '편안함과 팔 부담 완화' : '현재 세팅의 장점 유지'}를 우선해 볼 수 있습니다.
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-white/45">아직 기록된 로그가 없습니다.</p>
        )}
      </section>
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
        <h2 className="text-xl font-bold">평균 체감 점수</h2>
        <div className="mt-5 space-y-3">
          {recentLogs.length ? recentLogs.map((log, index) => (
            <div key={log.id || `${log.createdAt}-${index}`} className={`${index >= 3 ? 'hidden lg:block' : ''} rounded-xl bg-white/5 px-4 py-3`}>
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm text-white/55">{logTitle(log)}</span>
                <span className="shrink-0 font-semibold text-emerald-400">{logScoreAverage(log)}</span>
              </div>
              <div className="mt-1 text-xs text-white/35">{formatLogDate(log)}</div>
            </div>
          )) : (
            <p className="text-sm text-white/45">아직 기록된 로그가 없습니다.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function VideoRecommendation({ groups }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <h2 className="text-xl font-bold">영상 기반 추천 시작</h2>
      <p className="mt-3 text-sm leading-7 text-white/55">
        라켓을 선택하면 해당 라켓의 누적 로그와 스윙 영상을 함께 분석해 추천 결과를 만들 수 있습니다.
      </p>
      <div className="mt-5 space-y-3">
        {groups.length ? groups.map((group) => {
          const latest = group.logs[0];
          return (
            <div key={group.key} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold">{[latest.racketBrand, latest.racketModel, latest.racketNumber].filter(Boolean).join(' ')}</div>
                <div className="mt-1 text-xs text-white/40">누적 로그 {group.logs.length}개</div>
              </div>
              <Link to={`/log/recommend?racket=${encodeURIComponent(group.key)}`} className="rounded-lg bg-emerald-500 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-emerald-400">
                영상 분석 추천
              </Link>
            </div>
          );
        }) : (
          <p className="text-sm text-white/45">추천을 시작하려면 먼저 로그북에 라켓과 스트링 기록을 추가하세요.</p>
        )}
      </div>
    </section>
  );
}

function SettingComparison({ logs }) {
  const [firstId, setFirstId] = useState(logs[0]?.id || '');
  const [secondId, setSecondId] = useState(logs[1]?.id || logs[0]?.id || '');
  const first = logs.find((log) => log.id === firstId);
  const second = logs.find((log) => log.id === secondId);
  const canCompare = logs.length >= 2 && first && second;
  const diffs = canCompare ? Object.keys(scoreLabels).map((key) => ({
    key,
    label: scoreLabels[key],
    diff: Number(first[key] || 0) - Number(second[key] || 0),
  })) : [];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <h2 className="text-xl font-bold">세팅 비교</h2>
      {canCompare ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-emerald-400">비교 기준 로그</span>
              <select
                value={firstId}
                onChange={(event) => setFirstId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-400"
              >
                {logs.map((log, index) => (
                  <option key={log.id || index} value={log.id}>{logOptionLabel(log, index)}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-white/45">비교 대상 로그</span>
              <select
                value={secondId}
                onChange={(event) => setSecondId(event.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-400"
              >
                {logs.map((log, index) => (
                  <option key={log.id || index} value={log.id}>{logOptionLabel(log, index)}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-white/5 p-4">
              <div className="text-xs text-emerald-400">비교 기준</div>
              <div className="mt-2 font-semibold">{stringName(first) || '스트링 미입력'}</div>
              <div className="mt-1 text-xs text-white/35">{formatLogDate(first)}</div>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <div className="text-xs text-white/35">비교 대상</div>
              <div className="mt-2 font-semibold">{stringName(second) || '스트링 미입력'}</div>
              <div className="mt-1 text-xs text-white/35">{formatLogDate(second)}</div>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {diffs.map((item) => (
              <div key={item.key} className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-sm text-white/55">{item.label}</span>
                <span className={item.diff >= 0 ? 'text-emerald-400' : 'text-rose-300'}>
                  {item.diff > 0 ? '+' : ''}{item.diff}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-5 text-sm text-white/45">비교하려면 최소 2개 이상의 스트링 로그가 필요합니다.</p>
      )}
    </section>
  );
}

export default function AnalysisPage() {
  const [active, setActive] = useState('recent');
  const [logs] = useState(() => getAllLogs());

  const groups = useMemo(() => groupByRacket(logs), [logs]);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <main className="mx-auto max-w-[1080px] px-5 pt-28">
        <div className="mb-8">
          <div className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">My Analysis</div>
          <h1 className="text-4xl font-black leading-tight">내 플레이 분석</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
            로그북 기록을 바탕으로 최근 상태, 영상 추천 진입, 세팅 변화를 각각 확인합니다.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${active === tab.id ? 'bg-emerald-500 text-white' : 'border border-white/10 text-white/55 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {active === 'recent' && <RecentAnalysis logs={logs} />}
        {active === 'video' && <VideoRecommendation groups={groups} />}
        {active === 'compare' && <SettingComparison logs={logs} />}
      </main>
    </div>
  );
}
