import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { STRING_DATABASE } from '../lib/stringDatabase';
import { getAllLogs } from '../lib/logStorage';
import { getUsers, isAdminSignedIn, signInAdmin, signOutAdmin } from '../lib/auth';

const menuItems = [
  { id: 'dashboard', label: '대시보드', icon: '◆' },
  { id: 'users', label: '사용자 관리', icon: '✦' },
  { id: 'logs', label: '로그 관리', icon: '≡' },
  { id: 'strings', label: '스트링 DB', icon: '◎' },
  { id: 'recommendations', label: '추천 기록', icon: '◆' },
];

function safeSection(section) {
  return menuItems.some((item) => item.id === section) ? section : 'dashboard';
}

function AdminShell({ active, setActive, onLogout, children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <aside className="fixed inset-y-0 left-0 w-[214px] border-r border-white/10 bg-[#08090b]">
        <div className="border-b border-white/10 px-3 py-4">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Admin</div>
          <div className="mt-1 text-sm font-bold">String Logbook</div>
        </div>
        <nav className="mt-3 space-y-1 px-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${active === item.id ? 'border border-white/70 bg-emerald-500/20 text-emerald-300' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
            >
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={onLogout}
          className="absolute bottom-4 left-2 right-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/60 hover:text-white"
        >
          로그아웃
        </button>
      </aside>
      <main className="ml-[214px] min-h-screen px-6 py-5">{children}</main>
    </div>
  );
}

function ErrorBanner({ children }) {
  return (
    <div className="mb-6 rounded-xl border border-red-500/50 bg-red-950/35 px-4 py-4 text-sm text-red-300">
      {children}
    </div>
  );
}

function EmptyBox({ children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-10 text-center text-sm text-white/45">
      {children}
    </div>
  );
}

function Dashboard({ logs, users }) {
  return (
    <>
      <h1 className="mb-8 text-2xl font-bold">admin 대시보드</h1>
      <ErrorBanner>Supabase 연결 전 임시 admin 화면입니다. 현재 데이터는 브라우저 localStorage와 로컬 스트링 DB를 기준으로 표시됩니다.</ErrorBanner>
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        {[
          ['총 회원 수', users.length],
          ['총 로그 수', logs.length],
          ['추천 실행 수', '-'],
          ['스트링 DB', STRING_DATABASE.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
            <div className="text-xs text-slate-400">{label}</div>
            <div className="mt-6 text-xl font-bold">{value}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm text-slate-400">최근 가입 사용자</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.04]">
            <div className="grid grid-cols-3 border-b border-white/10 px-4 py-3 text-xs text-slate-400">
              <span>이메일</span><span>이름</span><span className="text-right">가입일</span>
            </div>
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="grid grid-cols-3 px-4 py-3 text-sm">
                <span>{user.email}</span><span>{user.name}</span><span className="text-right text-white/45">{new Date(user.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-sm text-slate-400">최근 저장 로그</h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.04]">
            <div className="grid grid-cols-3 border-b border-white/10 px-4 py-3 text-xs text-slate-400">
              <span>라켓</span><span>스트링</span><span className="text-right">날짜</span>
            </div>
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="grid grid-cols-3 px-4 py-3 text-sm">
                <span>{[log.racketBrand, log.racketModel].filter(Boolean).join(' ') || '-'}</span>
                <span>{[log.mainStringBrand, log.mainString].filter(Boolean).join(' ') || '-'}</span>
                <span className="text-right text-white/45">{log.date || '-'}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function Users({ users }) {
  const [query, setQuery] = useState('');
  const rows = users.filter((user) => `${user.email} ${user.name}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <h1 className="mb-8 text-2xl font-bold">사용자 관리</h1>
      <ErrorBanner>정식 DB 연결 전에는 이 브라우저에서 가입한 사용자만 표시됩니다.</ErrorBanner>
      <input value={query} onChange={(event) => setQuery(event.target.value)} className="mb-4 w-96 rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none" placeholder="검색" />
      {rows.length ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.04]">
          <div className="grid grid-cols-3 border-b border-white/10 px-4 py-3 text-xs text-slate-400">
            <span>이메일</span><span>이름</span><span className="text-right">가입일</span>
          </div>
          {rows.map((user) => (
            <div key={user.id} className="grid grid-cols-3 border-b border-white/5 px-4 py-3 text-sm last:border-0">
              <span>{user.email}</span><span>{user.name}</span><span className="text-right text-white/45">{new Date(user.createdAt).toLocaleDateString('ko-KR')}</span>
            </div>
          ))}
        </div>
      ) : <EmptyBox>검색 결과가 없습니다.</EmptyBox>}
    </>
  );
}

function Logs({ logs }) {
  return (
    <>
      <h1 className="mb-8 text-2xl font-bold">로그 관리</h1>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <input className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none" placeholder="검색" />
        <select className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none"><option>라켓 필터: 전체</option></select>
        <select className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none"><option>세팅 타입: 전체</option></select>
      </div>
      {logs.length ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.04]">
          {logs.slice(0, 12).map((log) => (
            <div key={log.id} className="grid grid-cols-4 border-b border-white/5 px-4 py-3 text-sm last:border-0">
              <span>{[log.racketBrand, log.racketModel].filter(Boolean).join(' ') || '-'}</span>
              <span>{[log.mainStringBrand, log.mainString].filter(Boolean).join(' ') || '-'}</span>
              <span>{log.date || '-'}</span>
              <span className="text-right text-white/45">보기</span>
            </div>
          ))}
        </div>
      ) : <EmptyBox>로그가 없습니다.</EmptyBox>}
    </>
  );
}

function Strings() {
  const [query, setQuery] = useState('');
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STRING_DATABASE;
    return STRING_DATABASE.filter((item) => `${item.brand} ${item.name} ${item.family} ${item.shape}`.toLowerCase().includes(q));
  }, [query]);

  return (
    <>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">스트링 DB 관리</h1>
          <p className="mt-2 text-sm text-slate-400">로컬 데이터베이스 {STRING_DATABASE.length}종</p>
        </div>
        <button className="rounded-lg border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-300">새 스트링 추가</button>
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="mb-4 w-96 rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none"
        placeholder="브랜드, 모델, 타입 검색..."
      />
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
        <div className="grid grid-cols-[1.2fr_1.4fr_1fr_1fr_repeat(5,0.55fr)_0.7fr] border-b border-white/10 px-4 py-3 text-xs text-slate-400">
          <span>브랜드</span><span>모델</span><span>타입</span><span>모양</span><span>파워</span><span>스핀</span><span>컨트롤</span><span>편안함</span><span>활성</span><span>액션</span>
        </div>
        {rows.map((item) => (
          <div key={item.id} className="grid grid-cols-[1.2fr_1.4fr_1fr_1fr_repeat(5,0.55fr)_0.7fr] border-b border-white/5 px-4 py-3 text-sm last:border-0">
            <span>{item.brand}</span><span>{item.name}</span><span>{item.family}</span><span>{item.shape}</span>
            <span>{item.specs.power}</span><span>{item.specs.spin}</span><span>{item.specs.control}</span><span>{item.specs.comfort}</span>
            <span className="text-emerald-400">true</span><button className="rounded-lg border border-white/10 px-2 py-1 text-xs">수정</button>
          </div>
        ))}
      </div>
    </>
  );
}

function Recommendations() {
  return (
    <>
      <h1 className="mb-8 text-2xl font-bold">추천 기록</h1>
      <ErrorBanner>추천 기록 저장 테이블은 아직 연결되지 않았습니다.</ErrorBanner>
      <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-slate-400">
        사용자 <span className="ml-40">입력 요약</span> <span className="ml-48">추천 결과</span> <span className="float-right">액션</span>
      </div>
    </>
  );
}

function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  }

  function submit(event) {
    event.preventDefault();
    const result = signInAdmin(form);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onLogin();
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#0b0b0b] px-4 text-white">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <div className="mb-2 font-mono text-xs uppercase tracking-[0.22em] text-yellow-300">admin</div>
        <h1 className="text-2xl font-bold">admin 로그인</h1>
        <p className="mt-3 text-sm leading-6 text-white/45">admin ID와 비밀번호로 로그인하세요.</p>
        <input
          value={form.username}
          onChange={(event) => set('username', event.target.value)}
          className="mt-6 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-yellow-300/60"
          placeholder="admin ID"
        />
        <input
          type="password"
          value={form.password}
          onChange={(event) => set('password', event.target.value)}
          className="mt-3 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-yellow-300/60"
          placeholder="admin 비밀번호"
        />
        {error && <div className="mt-3 text-xs text-red-300">{error}</div>}
        <button className="mt-5 w-full rounded-xl bg-yellow-300 px-4 py-3 text-sm font-bold text-black">로그인</button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(() => isAdminSignedIn());
  const [logs] = useState(() => getAllLogs());
  const [users] = useState(() => getUsers());
  const active = safeSection(params.section);

  function setActive(next) {
    navigate(next === 'dashboard' ? '/admin' : `/admin/${next}`);
  }

  function logout() {
    signOutAdmin();
    setAuthed(false);
  }

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return (
    <AdminShell active={active} setActive={setActive} onLogout={logout}>
      {active === 'dashboard' && <Dashboard logs={logs} users={users} />}
      {active === 'users' && <Users users={users} />}
      {active === 'logs' && <Logs logs={logs} />}
      {active === 'strings' && <Strings />}
      {active === 'recommendations' && <Recommendations />}
    </AdminShell>
  );
}
