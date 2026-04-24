import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import LogForm from '../components/LogForm';
import { BACK_LINK_CLS, CARD_CLS, CONTENT_WRAP, EYEBROW_CLS, PAGE_SHELL } from '../components/LogUI';
import { DEFAULT_LOG } from '../lib/logModel';
import { createNewLog, getLogById, updateLog } from '../lib/logStorage';

export default function LogNewPage() {
  const { id }       = useParams();
  const isEdit       = Boolean(id);
  const navigate     = useNavigate();
  const location     = useLocation();

  // 추천 페이지에서 넘어온 pre-fill 데이터 (신규 모드에서만 적용)
  const prefill = !isEdit ? (location.state?.prefill ?? {}) : {};

  const [initial, setInitial]   = useState({ ...DEFAULT_LOG, ...prefill });
  const [ready,   setReady]     = useState(!isEdit);   // 신규면 즉시 준비
  const [saving,  setSaving]    = useState(false);
  const [saved,   setSaved]     = useState(false);

  // 수정 모드: 기존 로그 로드
  useEffect(() => {
    if (!isEdit) return;
    const log = getLogById(id);
    if (!log) { navigate('/log', { replace: true }); return; }
    setInitial({ ...DEFAULT_LOG, ...log });
    setReady(true);
  }, [id, isEdit, navigate]);

  // 저장 핸들러
  function handleSave(formData) {
    setSaving(true);
    try {
      if (isEdit) {
        updateLog(id, formData);
      } else {
        createNewLog(formData);
      }
      setSaved(true);
      // 1.4초 후 이동 — 성공 메시지를 잠깐 보여줌
      setTimeout(() => {
        navigate(isEdit ? `/log/${id}` : '/log');
      }, 1400);
    } catch {
      setSaving(false);
    }
  }

  function handleCancel() {
    navigate(isEdit ? `/log/${id}` : '/log');
  }

  // 수정 모드에서 데이터 로드 전 빈 화면 방지
  if (!ready) return null;

  return (
    <div className={PAGE_SHELL}>
      <div className={CONTENT_WRAP}>

        {/* 헤더 */}
        <div className="mb-8">
          <Link
            to={isEdit ? `/log/${id}` : '/log'}
            className={`${BACK_LINK_CLS} inline-block mb-6`}
          >
            {isEdit ? '← 상세로 돌아가기' : '← 로그 목록으로'}
          </Link>
          <div className={EYEBROW_CLS}>
            String Logbook
          </div>
          <h1 className="text-2xl font-bold">
            {isEdit ? '기록 수정' : '새 스트링 기록'}
          </h1>
        </div>

        {/* 성공 배너 */}
        {saved && (
          <div className="mb-6 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-3 flex items-center gap-2 text-sm text-emerald-400">
            <span>✓</span>
            <span>{isEdit ? '수정됐어요.' : '저장됐어요!'} 잠시 후 이동합니다…</span>
          </div>
        )}

        {/* 폼 카드 */}
        <div className={`${CARD_CLS} px-6 py-5`}>
          <LogForm
            initialValues={initial}
            onSave={handleSave}
            onCancel={handleCancel}
            isEdit={isEdit}
            saving={saving}
          />
        </div>

      </div>
    </div>
  );
}
