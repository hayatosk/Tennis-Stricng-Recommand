const USERS_KEY = 'tennis_string_users';
const USER_SESSION_KEY = 'tennis_string_user_session';
const OAUTH_STATE_KEY = 'tennis_string_oauth_state';
export const ADMIN_SESSION_KEY = 'tennis_string_admin_session';

export const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME || 'admin',
  password: import.meta.env.VITE_ADMIN_PASSWORD || 'stringadmin1234',
};

export const SOCIAL_PROVIDERS = {
  naver: {
    label: '네이버',
    envKey: 'VITE_NAVER_CLIENT_ID',
    authUrl: 'https://nid.naver.com/oauth2.0/authorize',
    scope: '',
  },
  kakao: {
    label: '카카오톡',
    envKey: 'VITE_KAKAO_REST_API_KEY',
    authUrl: 'https://kauth.kakao.com/oauth/authorize',
    scope: 'profile_nickname account_email phone_number',
  },
  google: {
    label: 'Gmail',
    envKey: 'VITE_GOOGLE_CLIENT_ID',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'openid email profile',
  },
  apple: {
    label: 'Apple',
    envKey: 'VITE_APPLE_CLIENT_ID',
    authUrl: 'https://appleid.apple.com/auth/authorize',
    scope: 'name email',
  },
};

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function createId() {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createState() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function withoutPassword(user) {
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
}

function getProviderClientId(providerId) {
  const provider = SOCIAL_PROVIDERS[providerId];
  return provider ? import.meta.env[provider.envKey] : '';
}

function getCurrentUserWithPassword() {
  const session = readJson(USER_SESSION_KEY, null);
  if (!session?.userId) return null;
  return getUsers().find((item) => item.id === session.userId) || null;
}

export function getUsers() {
  return readJson(USERS_KEY, []);
}

export function signUp({ email, password, passwordConfirm, name, nickname, phone, privacyAgreement }) {
  const normalizedEmail = normalizeEmail(email);
  if (!name?.trim() || !nickname?.trim() || !phone?.trim() || !normalizedEmail || !password || !passwordConfirm) {
    return { ok: false, message: '이름, 닉네임, 전화번호, 이메일, 비밀번호를 모두 입력해주세요.' };
  }
  if (password.length < 6) {
    return { ok: false, message: '비밀번호는 6자 이상 입력해주세요.' };
  }
  if (password !== passwordConfirm) {
    return { ok: false, message: '비밀번호와 확인용 비밀번호가 일치하지 않습니다.' };
  }
  if (privacyAgreement !== 'agree') {
    return { ok: false, message: '개인정보 수집 및 이용에 동의해야 회원가입이 가능합니다.' };
  }

  const users = getUsers();
  if (users.some((user) => user.email === normalizedEmail)) {
    return { ok: false, message: '이미 가입된 이메일입니다.' };
  }

  const user = {
    id: createId(),
    email: normalizedEmail,
    name: name.trim(),
    nickname: nickname.trim(),
    phone: phone.trim(),
    password,
    provider: 'email',
    providerName: '이메일',
    notificationSettings: {
      recommendation: true,
      analysis: true,
      marketing: false,
    },
    privacyAgreedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  writeJson(USERS_KEY, [user, ...users]);
  return { ok: true, user: withoutPassword(user) };
}

export function signIn({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const user = getUsers().find((item) => (
    item.email === normalizedEmail && item.password === password && (!item.provider || item.provider === 'email')
  ));

  if (!user) {
    return { ok: false, message: '이메일 또는 비밀번호를 확인해주세요.' };
  }

  writeJson(USER_SESSION_KEY, { userId: user.id });
  return { ok: true, user: withoutPassword(user) };
}

export function startOAuth(providerId) {
  const provider = SOCIAL_PROVIDERS[providerId];
  if (!provider) {
    return { ok: false, message: '지원하지 않는 소셜 가입 방식입니다.' };
  }

  const clientId = getProviderClientId(providerId);
  if (!clientId) {
    return { ok: false, message: `${provider.label} 연동을 위한 ${provider.envKey} 환경변수가 필요합니다.` };
  }

  const redirectUri = `${window.location.origin}/auth/callback/${providerId}`;
  const state = createState();
  window.sessionStorage.setItem(OAUTH_STATE_KEY, JSON.stringify({ providerId, state }));

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  });

  if (provider.scope) params.set('scope', provider.scope);
  if (providerId === 'google') params.set('access_type', 'offline');
  if (providerId === 'apple') params.set('response_mode', 'query');

  window.location.href = `${provider.authUrl}?${params.toString()}`;
  return { ok: true };
}

export function verifyOAuthState(providerId, state) {
  try {
    const stored = JSON.parse(window.sessionStorage.getItem(OAUTH_STATE_KEY) || '{}');
    return stored.providerId === providerId && stored.state === state;
  } catch {
    return false;
  }
}

export function completeOAuthSignIn(profile) {
  const provider = profile.provider;
  const providerId = String(profile.providerId || profile.sub || profile.id || profile.email);
  const email = normalizeEmail(profile.email || `${providerId}@${provider}.oauth`);
  const users = getUsers();
  const existing = users.find((user) => (
    (user.provider === provider && user.providerId === providerId) || user.email === email
  ));

  if (existing) {
    writeJson(USER_SESSION_KEY, { userId: existing.id });
    return { ok: true, user: withoutPassword(existing) };
  }

  const providerName = SOCIAL_PROVIDERS[provider]?.label || provider;
  const user = {
    id: createId(),
    email,
    name: profile.name || profile.nickname || `${providerName} 사용자`,
    nickname: profile.nickname || profile.name || providerName,
    phone: profile.phone || '',
    password: '',
    provider,
    providerId,
    providerName,
    notificationSettings: {
      recommendation: true,
      analysis: true,
      marketing: false,
    },
    createdAt: new Date().toISOString(),
  };

  writeJson(USERS_KEY, [user, ...users]);
  writeJson(USER_SESSION_KEY, { userId: user.id });
  return { ok: true, user: withoutPassword(user) };
}

export function signOut() {
  window.localStorage.removeItem(USER_SESSION_KEY);
}

export function getCurrentUser() {
  const user = getCurrentUserWithPassword();
  return user ? withoutPassword(user) : null;
}

export function updateCurrentUser(data) {
  const current = getCurrentUser();
  if (!current) return null;

  const users = getUsers().map((user) => (
    user.id === current.id
      ? {
          ...user,
          name: data.name?.trim() || user.name,
          nickname: data.nickname?.trim() || user.nickname,
          phone: data.phone?.trim() || user.phone,
        }
      : user
  ));
  writeJson(USERS_KEY, users);
  return getCurrentUser();
}

export function changeCurrentUserPassword({ currentPassword, newPassword, newPasswordConfirm }) {
  const current = getCurrentUserWithPassword();
  if (!current) return { ok: false, message: '로그인이 필요합니다.' };
  if (current.provider && current.provider !== 'email') {
    return { ok: false, message: '소셜 로그인 계정은 해당 서비스에서 비밀번호를 변경해주세요.' };
  }
  if (current.password !== currentPassword) {
    return { ok: false, message: '현재 비밀번호가 올바르지 않습니다.' };
  }
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, message: '새 비밀번호는 6자 이상 입력해주세요.' };
  }
  if (newPassword !== newPasswordConfirm) {
    return { ok: false, message: '새 비밀번호와 확인용 비밀번호가 일치하지 않습니다.' };
  }

  const users = getUsers().map((user) => (
    user.id === current.id ? { ...user, password: newPassword } : user
  ));
  writeJson(USERS_KEY, users);
  return { ok: true, message: '비밀번호가 변경되었습니다.' };
}

export function updateCurrentUserNotifications(settings) {
  const current = getCurrentUser();
  if (!current) return null;

  const users = getUsers().map((user) => (
    user.id === current.id
      ? {
          ...user,
          notificationSettings: {
            recommendation: Boolean(settings.recommendation),
            analysis: Boolean(settings.analysis),
            marketing: Boolean(settings.marketing),
          },
        }
      : user
  ));
  writeJson(USERS_KEY, users);
  return getCurrentUser();
}

export function deleteCurrentUser() {
  const current = getCurrentUser();
  if (!current) return { ok: false, message: '로그인이 필요합니다.' };

  writeJson(USERS_KEY, getUsers().filter((user) => user.id !== current.id));
  signOut();
  return { ok: true };
}

export function signInAdmin({ username, password }) {
  if (!ADMIN_CREDENTIALS.username || !ADMIN_CREDENTIALS.password) {
    return { ok: false, message: 'admin 계정 환경변수가 설정되지 않았습니다.' };
  }

  const isValid = username.trim() === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
  if (!isValid) {
    return { ok: false, message: 'admin ID 또는 비밀번호가 올바르지 않습니다.' };
  }

  window.localStorage.setItem(ADMIN_SESSION_KEY, 'true');
  return { ok: true };
}

export function signOutAdmin() {
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function isAdminSignedIn() {
  return window.localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}
