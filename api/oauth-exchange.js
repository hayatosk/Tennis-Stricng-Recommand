function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function env(name) {
  return process.env[name] || '';
}

function decodeJwt(token) {
  const payload = token.split('.')[1];
  if (!payload) return {};
  const jsonText = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
  return JSON.parse(jsonText);
}

async function postForm(url, body) {
  const params = new URLSearchParams();
  Object.entries(body).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, value);
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body: params,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.error || 'OAuth token exchange failed');
  return data;
}

async function fetchJson(url, token) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || data.error || 'OAuth user info failed');
  return data;
}

async function googleProfile(code, redirectUri) {
  const token = await postForm('https://oauth2.googleapis.com/token', {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: env('VITE_GOOGLE_CLIENT_ID'),
    client_secret: env('GOOGLE_CLIENT_SECRET'),
  });
  const user = await fetchJson('https://openidconnect.googleapis.com/v1/userinfo', token.access_token);
  return {
    provider: 'google',
    providerId: user.sub,
    email: user.email,
    name: user.name,
    nickname: user.given_name || user.name,
  };
}

async function naverProfile(code, redirectUri) {
  const token = await postForm('https://nid.naver.com/oauth2.0/token', {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: env('VITE_NAVER_CLIENT_ID'),
    client_secret: env('NAVER_CLIENT_SECRET'),
  });
  const user = await fetchJson('https://openapi.naver.com/v1/nid/me', token.access_token);
  const profile = user.response || {};
  return {
    provider: 'naver',
    providerId: profile.id,
    email: profile.email,
    name: profile.name || profile.nickname,
    nickname: profile.nickname || profile.name,
    phone: profile.mobile || '',
  };
}

async function kakaoProfile(code, redirectUri) {
  const token = await postForm('https://kauth.kakao.com/oauth/token', {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: env('VITE_KAKAO_REST_API_KEY'),
    client_secret: env('KAKAO_CLIENT_SECRET'),
  });
  const user = await fetchJson('https://kapi.kakao.com/v2/user/me', token.access_token);
  const account = user.kakao_account || {};
  const profile = account.profile || {};
  return {
    provider: 'kakao',
    providerId: String(user.id),
    email: account.email,
    name: profile.nickname,
    nickname: profile.nickname,
    phone: account.phone_number || '',
  };
}

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function appleClientSecret() {
  const { createSign } = await import('node:crypto');
  const teamId = env('APPLE_TEAM_ID');
  const clientId = env('VITE_APPLE_CLIENT_ID');
  const keyId = env('APPLE_KEY_ID');
  const privateKey = env('APPLE_PRIVATE_KEY').replace(/\\n/g, '\n');
  if (!teamId || !clientId || !keyId || !privateKey) throw new Error('Apple OAuth 환경변수가 부족합니다.');

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'ES256', kid: keyId }));
  const payload = base64url(JSON.stringify({
    iss: teamId,
    iat: now,
    exp: now + 60 * 60 * 24 * 30,
    aud: 'https://appleid.apple.com',
    sub: clientId,
  }));
  const sign = createSign('SHA256');
  sign.update(`${header}.${payload}`);
  sign.end();
  const signature = sign
    .sign({ key: privateKey, dsaEncoding: 'ieee-p1363' })
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${header}.${payload}.${signature}`;
}

async function appleProfile(code, redirectUri) {
  const token = await postForm('https://appleid.apple.com/auth/token', {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: env('VITE_APPLE_CLIENT_ID'),
    client_secret: await appleClientSecret(),
  });
  const claims = decodeJwt(token.id_token);
  return {
    provider: 'apple',
    providerId: claims.sub,
    email: claims.email,
    name: claims.email?.split('@')[0] || 'Apple 사용자',
    nickname: claims.email?.split('@')[0] || 'Apple',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { provider, code, redirectUri } = body || {};
    if (!provider || !code || !redirectUri) {
      json(res, 400, { error: 'provider, code, redirectUri가 필요합니다.' });
      return;
    }

    const profile = await ({
      google: googleProfile,
      naver: naverProfile,
      kakao: kakaoProfile,
      apple: appleProfile,
    }[provider]?.(code, redirectUri));

    if (!profile) {
      json(res, 400, { error: '지원하지 않는 provider입니다.' });
      return;
    }

    json(res, 200, { profile });
  } catch (error) {
    json(res, 500, { error: error.message || 'OAuth 처리 중 오류가 발생했습니다.' });
  }
}
