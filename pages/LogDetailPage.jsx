import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BACK_LINK_CLS, CONTENT_WRAP, InfoRow, PAGE_SHELL, SectionCard } from '../components/LogUI';
import { SCORE_FIELDS } from '../lib/logModel';
import { deleteLog, getLogById } from '../lib/logStorage';
import { loadSavedForm, saveForm } from '../lib/storage';

const SCORE_COLORS = {
  power: 'bg-sky-400',
  spin: 'bg-emerald-400',
  control: 'bg-violet-400',
  comfort: 'bg-amber-400',
  durability: 'bg-rose-400',
};

function ScoreBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 text-xs text-white/40 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${(value / 10) * 100}%` }} />
      </div>
      <span className="w-6 text-right text-xs font-semibold text-white/60">{value}</span>
    </div>
  );
}

function parseLocalDate(dateStr) {
  return new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
}

function formatDisplayDate(log) {
  const d = log.date ? parseLocalDate(log.date) : new Date(log.createdAt);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function stringName(brand, model) {
  return [brand, model].filter(Boolean).join(' ');
}

export default function LogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const found = getLogById(id);
    if (!found) {
      setNotFound(true);
      return;
    }
    setLog(found);
    setNotFound(false);
  }, [id]);

  if (notFound) {
    return (
      <div className={`${PAGE_SHELL} flex flex-col items-center justify-center gap-4 px-4`}>
        <p className="text-white/40 text-sm">해당 로그를 찾을 수 없어요.</p>
        <Link to="/log" className="text-sm text-emerald-400 hover:text-emerald-300 underline underline-offset-4">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!log) return null;

  function handleDelete() {
    if (!window.confirm('이 로그를 삭제할까요?\n삭제하면 복구할 수 없어요.')) return;
    deleteLog(id);
    navigate('/log', { replace: true });
  }

  function handleRecommend() {
    const current = loadSavedForm({});
    saveForm({
      ...current,
      racket_brand: log.racketBrand || '',
      racket_model: log.racketModel || '',
      current_string: stringName(log.mainStringBrand, log.mainString),
      cross_string: stringName(log.crossStringBrand, log.crossString),
      current_shape: log.mainStringShape || '',
      cross_shape: log.crossStringShape || '',
      current_gauge: log.gauge || '',
      cross_gauge: log.crossGauge || '',
      main_tension: log.mainTension || '',
      cross_tension: log.crossTension || '',
    });
    navigate('/', { state: { autoSubmit: true } });
  }

  const hasScores = SCORE_FIELDS.some(({ key }) => log[key]);
  const displayDate = formatDisplayDate(log);
  const mainString = stringName(log.mainStringBrand, log.mainString);
  const crossString = stringName(log.crossStringBrand, log.crossString);

  return (
    <div className={PAGE_SHELL}>
      <div className={CONTENT_WRAP}>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link to="/log" className={BACK_LINK_CLS}>← 로그 목록으로</Link>
            <button onClick={handleDelete} className="text-xs text-white/25 hover:text-red-400 transition-colors">삭제</button>
          </div>

          <div className="text-xs text-white/30 mb-1">{displayDate}</div>
          <h1 className="text-2xl font-bold">
            {log.racketBrand || '라켓 미입력'}{' '}
            <span className="text-white/50 font-normal">{log.racketModel}</span>
            {log.racketNumber && <span className="ml-2 text-sm text-emerald-400 font-semibold">{log.racketNumber}</span>}
          </h1>
          <div className="text-base text-emerald-400 mt-1">
            {mainString || '스트링 미입력'}
            {crossString && <span className="text-white/30"> × {crossString}</span>}
          </div>
        </div>

        <SectionCard title="라켓 정보">
          <InfoRow label="브랜드" value={log.racketBrand} />
          <InfoRow label="모델" value={log.racketModel} />
          <InfoRow label="라켓 번호" value={log.racketNumber} />
          <InfoRow label="헤드 사이즈" value={log.headSize} />
          <InfoRow label="그립 사이즈" value={log.gripSize} />
          <InfoRow label="무게" value={log.racketWeight} />
        </SectionCard>

        <SectionCard title="메인 스트링">
          <InfoRow label="브랜드" value={log.mainStringBrand} />
          <InfoRow label="모델" value={log.mainString} />
          <InfoRow label="타입" value={log.mainStringType} />
          <InfoRow label="모양" value={log.mainStringShape} />
          <InfoRow label="색상" value={log.mainStringColor} />
          <InfoRow label="게이지" value={log.gauge} />
          <InfoRow label="텐션" value={log.mainTension} />
        </SectionCard>

        {(log.crossStringBrand || log.crossString || log.crossStringType || log.crossStringShape || log.crossStringColor || log.crossGauge || log.crossTension) && (
          <SectionCard title="크로스 스트링">
            <InfoRow label="브랜드" value={log.crossStringBrand} />
            <InfoRow label="모델" value={log.crossString} />
            <InfoRow label="타입" value={log.crossStringType} />
            <InfoRow label="모양" value={log.crossStringShape} />
            <InfoRow label="색상" value={log.crossStringColor} />
            <InfoRow label="게이지" value={log.crossGauge} />
            <InfoRow label="텐션" value={log.crossTension || (log.crossString ? '메인과 동일' : '')} />
          </SectionCard>
        )}

        {hasScores && (
          <SectionCard title="체감 점수">
            <div className="flex flex-col gap-3">
              {SCORE_FIELDS.map(({ key, label }) => (
                <ScoreBar key={key} label={label} value={log[key] ?? 0} color={SCORE_COLORS[key]} />
              ))}
            </div>
          </SectionCard>
        )}

        {log.memo && (
          <SectionCard title="메모">
            <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{log.memo}</p>
          </SectionCard>
        )}

        <div className="flex flex-col gap-3 mt-2">
          <button onClick={handleRecommend} className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-colors py-3.5 text-sm font-semibold text-white">
            이 세팅으로 추천받기
          </button>
          <Link to={`/log/${id}/edit`} className="w-full rounded-xl border border-white/15 hover:border-white/30 transition-colors py-3.5 text-sm font-semibold text-white/60 hover:text-white text-center block">
            수정하기
          </Link>
        </div>
      </div>
    </div>
  );
}
