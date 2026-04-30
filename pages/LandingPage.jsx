import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <main className="mx-auto flex min-h-screen max-w-[1080px] items-center px-5 pt-12">
        <section className="max-w-[680px] pb-10">
          <div className="mb-6 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
            Tennis String Recommend
          </div>
          <h1 className="max-w-[580px] text-[44px] font-black leading-[1.18] tracking-normal text-white sm:text-[56px]">
            내 플레이에 맞는
            <br />
            테니스 스트링 추천
          </h1>
          <p className="mt-8 max-w-[660px] text-lg leading-8 text-slate-300">
            스트링을 추천받고, 내 세팅을 기록하고, 로그를 바탕으로 나에게 맞는
            <br className="hidden sm:block" />
            스트링까지 분석하세요.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/recommend" className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-400">
              추천 시작하기
            </Link>
            <Link to="/log" className="rounded-lg border border-white/15 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-white/30 hover:bg-white/5">
              서비스 둘러보기
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
