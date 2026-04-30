import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  changeCurrentUserPassword,
  deleteCurrentUser,
  getCurrentUser,
  signOut,
  updateCurrentUser,
  updateCurrentUserNotifications,
} from '../lib/auth';
import { getAllLogs } from '../lib/logStorage';

const cardClass = 'rounded-2xl border border-white/10 bg-white/[0.04]';
const inputClass = 'w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-emerald-400/70';
const subtleButtonClass = 'rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white/75 transition-colors hover:border-white/25 hover:text-white';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('ko-KR');
}

function stringName(log) {
  const main = [log.mainStringBrand, log.mainString].filter(Boolean).join(' ');
  const cross = [log.crossStringBrand, log.crossString].filter(Boolean).join(' ');
  return [main, cross && `x ${cross}`].filter(Boolean).join(' ');
}

function ActionCard({ eyebrow, title, to, accent = 'text-emerald-400' }) {
  return (
    <Link
      to={to}
      className="flex min-h-[72px] items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
    >
      <span>
        <span className={`block text-xs font-bold ${accent}`}>{eyebrow}</span>
        <span className="mt-1 block text-base font-bold text-white">{title}</span>
      </span>
      <span className="text-sm text-white/50">→</span>
    </Link>
  );
}

function ToggleRow({ title, description, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
      <span>
        <span className="block text-sm font-semibold text-white/85">{title}</span>
        <span className="mt-1 block text-xs text-white/40">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-emerald-400"
      />
    </label>
  );
}

export default function MyPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getCurrentUser());
  const [logs] = useState(() => (getCurrentUser() ? getAllLogs() : []));
  const [profile, setProfile] = useState(() => {
    const current = getCurrentUser();
    return {
      name: current?.name || '',
      nickname: current?.nickname || '',
      phone: current?.phone || '',
    };
  });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
  const [notifications, setNotifications] = useState(() => {
    const current = getCurrentUser();
    return {
      recommendation: current?.notificationSettings?.recommendation ?? true,
      analysis: current?.notificationSettings?.analysis ?? true,
      marketing: current?.notificationSettings?.marketing ?? false,
    };
  });
  const [message, setMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [navigate, user]);

  const latest = useMemo(() => logs[0], [logs]);

  function flash(setter, text) {
    setter(text);
    window.setTimeout(() => setter(''), 1800);
  }

  function saveProfile(event) {
    event.preventDefault();
    const updated = updateCurrentUser(profile);
    if (updated) {
      setUser(updated);
      flash(setMessage, '프로필이 수정되었습니다.');
    }
  }

  function saveNotifications(nextSettings) {
    setNotifications(nextSettings);
    const updated = updateCurrentUserNotifications(nextSettings);
    if (updated) {
      setUser(updated);
      flash(setMessage, '알림 설정이 저장되었습니다.');
    }
  }

  function submitPassword(event) {
    event.preventDefault();
    const result = changeCurrentUserPassword(password);
    flash(setPasswordMessage, result.message);
    if (result.ok) {
      setPassword({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
    }
  }

  function logout() {
    signOut();
    navigate('/');
  }

  function withdraw() {
    if (!window.confirm('정말 탈퇴하시겠습니까?\n계정 정보는 삭제되며 복구할 수 없습니다.')) return;
    const result = deleteCurrentUser();
    if (result.ok) navigate('/');
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white" />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <main className="mx-auto max-w-[1080px] px-5 pb-16 pt-24">
        <div className="mb-8">
          <div className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">My Page</div>
          <h1 className="mt-3 text-4xl font-black">마이페이지</h1>
          <p className="mt-3 text-sm text-white/50">내 계정 정보와 스트링 로그 요약을 확인합니다.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className={`${cardClass} p-5`}>
            <h2 className="text-xl font-bold">프로필</h2>
            <form onSubmit={saveProfile} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-white/60">이름</span>
                <input
                  value={profile.name}
                  onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-white/60">닉네임</span>
                <input
                  value={profile.nickname}
                  onChange={(event) => setProfile((prev) => ({ ...prev, nickname: event.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-white/60">전화번호</span>
                <input
                  value={profile.phone}
                  onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-white/60">이메일</span>
                <input
                  value={user.email}
                  disabled
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white/40 outline-none"
                />
              </label>
              <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                <div className="text-xs text-white/40">가입 방식</div>
                <div className="mt-1 text-sm font-semibold text-white/80">{user.providerName || '이메일'}</div>
              </div>
              <div className="flex items-center gap-3">
                <button className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-400">
                  수정
                </button>
                {message && <span className="text-sm text-emerald-400">{message}</span>}
              </div>
            </form>
          </section>

          <section className={`${cardClass} p-5`}>
            <h2 className="text-xl font-bold">활동 요약</h2>
            <div className="mt-7 divide-y divide-white/10">
              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-white/45">총 로그 수</span>
                <span className="text-sm font-semibold text-white">{logs.length}개</span>
              </div>
              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-white/45">최근 추천 수</span>
                <span className="text-sm font-semibold text-white">0개</span>
              </div>
              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-white/45">최근 분석일</span>
                <span className="text-sm font-semibold text-white">{formatDate(latest?.createdAt || latest?.date)}</span>
              </div>
            </div>
            {latest && (
              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-white/40">최근 세팅</div>
                <div className="mt-2 font-semibold">{[latest.racketBrand, latest.racketModel, latest.racketNumber].filter(Boolean).join(' ') || '라켓 미입력'}</div>
                <div className="mt-1 text-sm text-emerald-400">{stringName(latest) || '스트링 미입력'}</div>
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 grid gap-3 md:grid-cols-2">
          <ActionCard eyebrow="로그" title="내 스트링 기록" to="/log" />
          <ActionCard eyebrow="분석" title="내 성향 분석" to="/analysis" accent="text-sky-400" />
          <ActionCard eyebrow="추천" title="스트링 추천받기" to="/recommend" accent="text-violet-400" />
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section className={`${cardClass} p-5`}>
            <h2 className="text-xl font-bold">비밀번호 변경</h2>
            <form onSubmit={submitPassword} className="mt-5 space-y-4">
              <input
                type="password"
                value={password.currentPassword}
                onChange={(event) => setPassword((prev) => ({ ...prev, currentPassword: event.target.value }))}
                placeholder="현재 비밀번호"
                className={inputClass}
              />
              <input
                type="password"
                value={password.newPassword}
                onChange={(event) => setPassword((prev) => ({ ...prev, newPassword: event.target.value }))}
                placeholder="새 비밀번호"
                className={inputClass}
              />
              <input
                type="password"
                value={password.newPasswordConfirm}
                onChange={(event) => setPassword((prev) => ({ ...prev, newPasswordConfirm: event.target.value }))}
                placeholder="새 비밀번호 확인"
                className={inputClass}
              />
              <div className="flex items-center gap-3">
                <button className={subtleButtonClass}>비밀번호 변경</button>
                {passwordMessage && <span className="text-sm text-white/55">{passwordMessage}</span>}
              </div>
            </form>
          </section>

          <section className={`${cardClass} p-5`}>
            <h2 className="text-xl font-bold">알림 설정</h2>
            <div className="mt-5 space-y-3">
              <ToggleRow
                title="추천 알림"
                description="새 추천 결과와 추천 관련 안내를 받습니다."
                checked={notifications.recommendation}
                onChange={(value) => saveNotifications({ ...notifications, recommendation: value })}
              />
              <ToggleRow
                title="분석 알림"
                description="내 로그 분석과 성향 변화 알림을 받습니다."
                checked={notifications.analysis}
                onChange={(value) => saveNotifications({ ...notifications, analysis: value })}
              />
              <ToggleRow
                title="마케팅 알림"
                description="이벤트와 서비스 소식을 받습니다."
                checked={notifications.marketing}
                onChange={(value) => saveNotifications({ ...notifications, marketing: value })}
              />
            </div>
          </section>
        </div>

        <section className={`${cardClass} mt-5 p-5`}>
          <h2 className="text-xl font-bold">계정 관리</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={withdraw}
              className="rounded-xl border border-red-400/25 px-4 py-3 text-sm font-bold text-red-300 transition-colors hover:bg-red-500/10"
            >
              회원 탈퇴
            </button>
          </div>
        </section>

        <button
          type="button"
          onClick={logout}
          className="mt-6 w-full rounded-xl border border-red-500/40 bg-red-950/20 px-4 py-3 text-sm font-bold text-red-300 transition-colors hover:border-red-400/70 hover:bg-red-950/35"
        >
          로그아웃
        </button>
      </main>
    </div>
  );
}
