import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, signOut } from '../lib/auth';

const navItems = [
  { label: '추천받기', to: '/recommend' },
  { label: '내 로그북', to: '/log' },
  { label: '내 분석', to: '/analysis' },
];

function isActive(pathname, to) {
  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function MainNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getCurrentUser());
  const isHome = pathname === '/';

  function logout() {
    signOut();
    setUser(null);
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/85 text-white backdrop-blur">
      <div className="relative flex min-h-14 flex-col items-center justify-center gap-2 px-5 py-2 md:flex-row">
        <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-7 gap-y-2 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
          <Link to="/" className="flex shrink-0 items-center gap-2 text-sm font-semibold text-white">
            <span className="grid h-4 w-4 place-items-center" aria-hidden="true">
              <span className="h-3 w-3 rotate-45 rounded-[2px] border border-emerald-300 bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
            </span>
            <span>Tennis String Recommend</span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 text-sm">
            {navItems.map((item) => {
              const active = isActive(pathname, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={[
                    'rounded-lg px-3 py-1.5 font-semibold transition-colors',
                    active
                      ? 'bg-white text-black'
                      : 'text-white/65 hover:bg-white/10 hover:text-white',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center justify-center gap-3 text-sm md:absolute md:right-5 md:top-1/2 md:-translate-y-1/2">
          <Link
            to="/admin"
            className="rounded-lg border border-yellow-300/25 px-3 py-1.5 text-xs font-semibold text-yellow-200/80 transition-colors hover:border-yellow-300/45 hover:text-yellow-100"
          >
            admin
          </Link>

          {isHome && (
            user ? (
              <>
                <Link to="/mypage" className="max-w-32 truncate text-white/80 transition-colors hover:text-white">
                  {user.name}
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/55 transition-colors hover:border-white/30 hover:text-white"
                >
                  로그아웃
                </button>
              </>
            ) : null
          )}
        </div>
      </div>
    </header>
  );
}
