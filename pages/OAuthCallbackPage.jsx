import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { completeOAuthSignIn, verifyOAuthState } from '../lib/auth';

export default function OAuthCallbackPage() {
  const { provider } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('소셜 계정 정보를 확인하는 중입니다.');

  useEffect(() => {
    async function exchange() {
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');

      if (error) {
        setMessage(`소셜 인증이 취소되었거나 실패했습니다: ${error}`);
        return;
      }
      if (!code || !state || !verifyOAuthState(provider, state)) {
        setMessage('소셜 인증 정보가 올바르지 않습니다. 다시 시도해주세요.');
        return;
      }

      try {
        const response = await fetch('/api/oauth-exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider,
            code,
            redirectUri: `${window.location.origin}/auth/callback/${provider}`,
          }),
        });
        const payload = await response.json();

        if (!response.ok || !payload.profile) {
          throw new Error(payload.error || '소셜 계정 정보를 가져오지 못했습니다.');
        }

        const result = completeOAuthSignIn(payload.profile);
        if (!result.ok) throw new Error(result.message || '가입 처리에 실패했습니다.');

        setMessage('가입 및 로그인이 완료되었습니다. 마이페이지로 이동합니다.');
        window.setTimeout(() => navigate('/mypage'), 800);
      } catch (err) {
        setMessage(err.message);
      }
    }

    exchange();
  }, [navigate, params, provider]);

  return (
    <div className="grid min-h-screen place-items-center bg-[#0b0b0b] px-5 text-white">
      <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
        <div className="font-mono text-xs uppercase tracking-[0.22em] text-emerald-400">OAuth</div>
        <h1 className="mt-3 text-2xl font-black">소셜 가입 처리</h1>
        <p className="mt-4 text-sm leading-7 text-white/55">{message}</p>
      </div>
    </div>
  );
}
