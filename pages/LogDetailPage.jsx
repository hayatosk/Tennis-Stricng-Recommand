import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BACK_LINK_CLS, CARD_CLS, CONTENT_WRAP, EYEBROW_CLS, InfoRow, PAGE_SHELL, SectionCard } from '../components/LogUI';
import { SCORE_FIELDS } from '../lib/logModel';
import { deleteLog, getLogById } from '../lib/logStorage';
import { loadSavedForm, saveForm } from '../lib/storage';

const SCORE_COLORS = {
  power:      'bg-sky-400',
  spin:       'bg-emerald-400',
  control:    'bg-violet-400',
  comfort:    'bg-amber-400',
  durability: 'bg-rose-400',
};

function ScoreBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 text-xs text-white/40 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${(value / 10) * 100}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs font-semibold text-white/60">{value}</span>
    </div>
  );
}

// ─── 날짜 포맷 헬퍼 ──────────────────────────────────────────────────────────

/** YYYY-MM-DD를 로컬 타임존 기준 Date로 파싱 */
function parseLocalDate(dateStr) {
  // 'YYYY-MM-DD'만 있으면 UTC로 파싱돼 하루 어긋남 → T00:00:00 추가
  return new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
}

function formatDisplayDate(log) {
  const d = log.date
    ? parseLocalDate(log.date)
    : new Date(log.createdAt);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ─── 상세 페이지 ──────────────────────────────────────────────────────────────

export default function LogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // 마운트·id 변경 시 로그 로드 (수정 후 돌아올 때도 재조회)
  useEffect(() => {
    const found = getLogById(id);
    if (!found) {
      setNotFound(true);
    } else {
      setLog(found);
      setNotFound(false);
    }
  }, [id]);

  // ── 존재하지 않는 id 접근 처리 ───────────────────────────────────────────
  if (notFound) {
    return (
      <div className={`${PAGE_SHELL} flex flex-col items-center justify-center gap-4 px-4`}>
        <div className="text-4xl opacity-30">🎾</div>
        <p className="text-white/40 text-sm">해당 로그를 찾을 수 없어요.</p>
        <Link
          to="/log"
          className="text-sm text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!log) return null;

  // ── 이벤트 핸들러 ─────────────────────────────────────────────────────────

  function handleDelete() {
    if (!window.confirm('이 로그를 삭제할까요?\n삭제하면 복구할 수 없어요.')) return;
    deleteLog(id);
    navigate('/log', { replace: true });
  }

  function handleRecommend() {
    const current = loadSavedForm({});
    saveForm({
      ...current,
      racket_brand:   log.racketBrand  || '',
      racket_model:   log.racketModel  || '',
      current_string: log.mainString   || '',
      cross_string:   log.crossString  || '',
      current_gauge:  log.gauge        || '',
      main_tension:   log.mainTension  || '',
      cross_tension:  log.crossTension || '',
    });
    navigate('/', { state: { autoSubmit: true } });
  }

  const hasScores = SCORE_FIELDS.some(({ key }) => log[key]);
  const displayDate = formatDisplayDate(log);

  // ── 렌더 ─────────────────────────────────────────────────────────────────

  return (
    <div className={PAGE_SHELL}>
      <div className={CONTENT_WRAP}>

        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/log"
              className={BACK_LINK_CLS}
            >
              ← 로그 목록으로
            </Link>
            {/* 상단 삭제 버튼 (작게) */}
            <button
              onClick={handleDelete}
              className="text-xs text-white/25 hover:text-red-400 transition-colors"
            >
              삭제
            </button>
          </div>

          <div className="text-xs text-white/30 mb-1">{displayDate}</div>
          <h1 className="text-2xl font-bold">
            {log.racketBrand || '라켓 미입력'}{' '}
            <span className="text-white/50 font-normal">{log.racketModel}</span>
          </h1>
          <div className="text-base text-emerald-400 mt-1">
            {log.mainString || '스트링 미입력'}
            {log.crossString && log.crossString !== log.mainString && (
              <span className="text-white/30"> × {log.crossString}</span>
            )}
          </div>
        </div>

        {/* 라켓 & 스트링 */}
        <SectionCard title="라켓 & 스트링">
          <InfoRow label="라켓 브랜드"   value={log.racketBrand} />
          <InfoRow label="라켓 모델"     value={log.racketModel} />
          <InfoRow label="메인 스트링"   value={log.mainString} />
          <InfoRow label="크로스 스트링" value={log.crossString} />
          <InfoRow label="게이지"        value={log.gauge} />
        </SectionCard>

        {/* 텐션 */}
        {(log.mainTension || log.crossTension) && (
          <SectionCard title="텐션">
            <InfoRow label="메인 텐션"   value={log.mainTension} />
            <InfoRow label="크로스 텐션" value={log.crossTension || '메인과 동일'} />
          </SectionCard>
        )}

        {/* 체감 점수 */}
        {hasScores && (
          <SectionCard title="체감 점수">
            <div className="flex flex-col gap-3">
              {SCORE_FIELDS.map(({ key, label }) => (
                <ScoreBar
                  key={key}
                  label={label}
                  value={log[key] ?? 0}
                  color={SCORE_COLORS[key]}
                />
              ))}
            </div>
          </SectionCard>
        )}

        {/* 메모 */}
        {log.memo && (
          <SectionCard title="메모">
            <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
              {log.memo}
            </p>
          </SectionCard>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col gap-3 mt-2">
          <button
            onClick={handleRecommend}
            className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 transition-colors py-3.5 text-sm font-semibold text-white"
          >
            이 세팅으로 추천받기
          </button>
          <Link
            to={`/log/${id}/edit`}
            className="w-full rounded-xl border border-white/15 hover:border-white/30 transition-colors py-3.5 text-sm font-semibold text-white/60 hover:text-white text-center block"
          >
            수정하기
          </Link>
        </div>

      </div>
    </div>
  );
}
