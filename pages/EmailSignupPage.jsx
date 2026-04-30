import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../lib/auth';

const initialForm = {
  name: '',
  nickname: '',
  phone: '',
  email: '',
  password: '',
  passwordConfirm: '',
  privacyAgreement: '',
};

function PrivacyText({ onRead }) {
  function handleScroll(event) {
    const element = event.currentTarget;
    const reachedBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 8;
    if (reachedBottom) onRead();
  }

  return (
    <div
      onScroll={handleScroll}
      className="h-44 overflow-y-auto rounded-xl border border-white/10 bg-black p-4 text-sm leading-7 text-white/55"
    >
      <p className="font-semibold text-white">개인정보 수집 및 이용 동의서</p>
      <p className="mt-3">
        Tennis String Recommend는 회원가입, 로그인, 개인화된 스트링 로그 관리, 추천 결과 제공을 위해
        이름, 닉네임, 전화번호, 이메일, 비밀번호를 수집합니다.
      </p>
      <p className="mt-3">
        수집된 정보는 본인 식별, 계정 관리, 서비스 이용 기록 확인, 고객 문의 대응, 부정 이용 방지,
        개인별 라켓 및 스트링 기록 관리 목적으로 사용됩니다.
      </p>
      <p className="mt-3">
        개인정보는 회원 탈퇴 또는 서비스 이용 목적 달성 시까지 보관되며, 관계 법령에 따라 보관이 필요한 경우
        해당 기간 동안 별도 보관 후 파기됩니다.
      </p>
      <p className="mt-3">
        사용자는 개인정보 수집 및 이용에 동의하지 않을 권리가 있습니다. 다만 필수 정보 수집에 동의하지 않을 경우
        회원가입과 로그인 기반 서비스 이용이 제한됩니다.
      </p>
      <p className="mt-3">
        현재 개발 버전에서는 입력 정보가 브라우저 localStorage에 저장됩니다. 정식 배포 시에는 서버 인증 및
        데이터베이스 보안 정책에 따라 저장 방식이 변경될 수 있습니다.
      </p>
      <p className="mt-3">
        위 내용을 모두 확인한 뒤 동의 여부를 선택해주세요.
      </p>
    </div>
  );
}

export default function EmailSignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [privacyRead, setPrivacyRead] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  }

  function submit(event) {
    event.preventDefault();
    if (!privacyRead) {
      setError('개인정보 수집 동의서를 끝까지 확인해주세요.');
      return;
    }

    const result = signUp(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess(true);
    window.setTimeout(() => {
      navigate('/login');
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] px-5 py-8 text-white">
      <main className="mx-auto max-w-[520px]">
        <div className="mb-6">
          <div className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">Email Signup</div>
          <h1 className="mt-3 text-3xl font-black">이메일 회원가입</h1>
          <p className="mt-3 text-sm text-white/50">필수 정보를 입력하고 개인정보 수집 동의 후 가입을 진행하세요.</p>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <div className="grid gap-4">
            {[
              ['name', '이름', '홍길동', 'text'],
              ['nickname', '닉네임', '나의 테니스 닉네임', 'text'],
              ['phone', '전화번호', '010-0000-0000', 'tel'],
              ['email', '이메일', 'you@example.com', 'email'],
              ['password', '비밀번호', '6자 이상', 'password'],
              ['passwordConfirm', '비밀번호 확인', '비밀번호 재입력', 'password'],
            ].map(([key, label, placeholder, type]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-sm text-white/60">{label}</span>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(event) => set(key, event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-emerald-400/70"
                  placeholder={placeholder}
                />
              </label>
            ))}
          </div>

          <div className="mt-5">
            <div className="mb-2 text-sm text-white/60">개인정보 수집 및 이용 동의</div>
            <PrivacyText onRead={() => setPrivacyRead(true)} />
            <div className="mt-3 flex gap-3">
              <label className={`flex flex-1 items-center gap-2 rounded-xl border px-4 py-3 text-sm ${privacyRead ? 'border-white/10 bg-black' : 'border-white/5 bg-white/[0.03] text-white/30'}`}>
                <input
                  type="radio"
                  name="privacyAgreement"
                  value="agree"
                  disabled={!privacyRead}
                  checked={form.privacyAgreement === 'agree'}
                  onChange={(event) => set('privacyAgreement', event.target.value)}
                />
                동의
              </label>
              <label className={`flex flex-1 items-center gap-2 rounded-xl border px-4 py-3 text-sm ${privacyRead ? 'border-white/10 bg-black' : 'border-white/5 bg-white/[0.03] text-white/30'}`}>
                <input
                  type="radio"
                  name="privacyAgreement"
                  value="disagree"
                  disabled={!privacyRead}
                  checked={form.privacyAgreement === 'disagree'}
                  onChange={(event) => set('privacyAgreement', event.target.value)}
                />
                동의하지 않음
              </label>
            </div>
            {!privacyRead && <p className="mt-2 text-xs text-white/35">동의서를 끝까지 스크롤하면 선택할 수 있습니다.</p>}
          </div>

          {error && <div className="mt-4 rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-300">{error}</div>}
          {success && <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">회원가입이 완료되었습니다. 로그인 화면으로 이동합니다.</div>}

          <button className="mt-5 w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-400">
            회원가입
          </button>
        </form>
      </main>
    </div>
  );
}
