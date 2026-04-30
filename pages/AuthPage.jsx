import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../lib/auth';

export default function AuthPage({ mode = 'login' }) {
  const isSignup = mode === 'signup';
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const title = useMemo(() => (isSignup ? '회원가입' : '로그인'), [isSignup]);
  const description = useMemo(() => (
    isSignup
      ? '이메일 가입 창에서 필수 정보를 입력하세요.'
      : '가입한 이메일과 비밀번호로 로그인하세요.'
  ), [isSignup]);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  }

  function submit(event) {
    event.preventDefault();
    const result = signIn(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate('/mypage');
  }

  function openEmailSignup() {
    navigate('/signup/email');
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <main className="mx-auto flex min-h-screen max-w-[1080px] items-center justify-center px-5 pt-16">
        <section className="w-full max-w-[440px] rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
            Tennis String Recommend
          </div>
          <h1 className="text-3xl font-black">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-white/50">{description}</p>

          {isSignup ? (
            <>
              <button
                type="button"
                onClick={openEmailSignup}
                className="mt-6 w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-400"
              >
                이메일로 회원가입
              </button>
            </>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm text-white/60">이메일</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => set('email', event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-emerald-400/70"
                  placeholder="you@example.com"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-white/60">비밀번호</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => set('password', event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-emerald-400/70"
                  placeholder="비밀번호"
                />
              </label>

              <button className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-400">
                이메일로 로그인
              </button>
            </form>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-5 text-center text-sm text-white/45">
            {isSignup ? (
              <>
                이미 계정이 있으신가요? <Link to="/login" className="text-emerald-400 hover:text-emerald-300">로그인</Link>
              </>
            ) : (
              <>
                아직 계정이 없으신가요? <Link to="/signup" className="text-emerald-400 hover:text-emerald-300">회원가입</Link>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
