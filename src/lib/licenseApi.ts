/**
 * Browser client for the license server (auth + portal).
 *
 * Security model (bead #13): NO secret in the browser. Only the public API base
 * URL is used. The session (access + refresh token) lives **in memory only** —
 * it is intentionally lost on reload/tab close, so a stolen-storage attack can't
 * lift a token. The short-lived access token is transparently refreshed during
 * an active session via the refresh token.
 */
const API_BASE: string | undefined = import.meta.env.PUBLIC_LICENSE_API_BASE;

export interface AuthUser {
  email: string;
}

interface Session {
  accessToken: string;
  refreshToken: string;
  /** Unix seconds when the access token expires. */
  expiresAt: number;
  email: string;
}

let session: Session | null = null;
const listeners = new Set<() => void>();

/** True when the API base is configured (the site knows where to talk to). */
export function isConfigured(): boolean {
  return typeof API_BASE === 'string' && API_BASE.length > 0;
}

/** The signed-in user, or null. */
export function currentUser(): AuthUser | null {
  return session ? {email: session.email} : null;
}

/** Subscribe to sign-in/out changes; returns an unsubscribe function. */
export function onAuthChange(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function emit(): void {
  for (const l of listeners) l();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  if (!isConfigured()) {
    throw new ApiError(0, 'license API not configured');
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {'content-type': 'application/json', ...(init.headers ?? {})},
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof body?.error === 'string' ? body.error : `request failed (${res.status})`;
    throw new ApiError(res.status, msg);
  }
  return body as T;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/** Registers a new account. May require email confirmation before login. */
export async function register(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<{verificationSent: boolean}> {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/** Signs in and starts an in-memory session. */
export async function login(email: string, password: string): Promise<void> {
  const t = await request<TokenPair>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({email, password}),
  });
  session = {...t, email};
  emit();
}

/** Requests a password-reset email (always resolves, to avoid user enumeration). */
export async function requestPasswordReset(email: string): Promise<void> {
  await request('/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({email}),
  });
}

/** Signs out: best-effort server logout, then clears the in-memory session. */
export async function logout(): Promise<void> {
  const token = session?.accessToken;
  session = null;
  emit();
  if (token) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {authorization: `Bearer ${token}`},
    }).catch(() => undefined);
  }
}

/** Refreshes the access token if it is missing or within 60s of expiry. */
async function ensureFreshToken(): Promise<void> {
  if (!session) throw new ApiError(401, 'not signed in');
  const now = Math.floor(Date.now() / 1000);
  if (session.expiresAt - now > 60) return;
  try {
    const t = await request<TokenPair>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({refreshToken: session.refreshToken}),
    });
    session = {...t, email: session.email};
  } catch (e) {
    session = null;
    emit();
    throw e;
  }
}

/** Authenticated fetch against a portal endpoint; auto-refreshes the token. */
export async function authed<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  await ensureFreshToken();
  return request<T>(path, {
    ...init,
    headers: {
      authorization: `Bearer ${session!.accessToken}`,
      ...(init.headers ?? {}),
    },
  });
}
