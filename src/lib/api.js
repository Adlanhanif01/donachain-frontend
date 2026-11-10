const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem('donachain_token');
  const headers = new Headers(options.headers || {});

  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!(options.body instanceof FormData) && options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json() : null;

  if (!response.ok || body?.status === false) {
    const validationErrors = body?.data?.errors;
    const firstValidationMessage = validationErrors
      ? Object.values(validationErrors).flat()[0]
      : null;
    throw new ApiError(
      firstValidationMessage || body?.message || 'Permintaan gagal diproses.',
      response.status,
      body?.data ?? null,
    );
  }

  return body?.data ?? null;
}

export function apiFileUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function downloadApiFile(path, filename) {
  const token = sessionStorage.getItem('donachain_token');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: '*/*' },
  });

  if (!response.ok) {
    throw new ApiError('Berkas tidak dapat diunduh.', response.status, null);
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
