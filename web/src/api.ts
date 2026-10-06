export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Empty = same origin (Vite proxy / Cloudflare Tunnel). Set VITE_API_URL to override.
const BASE = import.meta.env.VITE_API_URL ?? '';

export function api<T>(path: string, options: RequestInit = {}, _auth = false): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  }).then(async (res) => {
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string | string[] };
      const raw = body.message;
      const message = Array.isArray(raw) ? raw.join(', ') : raw || 'Có lỗi xảy ra';
      throw new ApiError(res.status, message);
    }
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  });
}

export async function logoutAdmin() {
  try {
    await api('/api/admin/auth/logout', { method: 'POST' }, true);
  } catch {
    // Cookie may already be gone; still treat as logged out on the client.
  }
}
