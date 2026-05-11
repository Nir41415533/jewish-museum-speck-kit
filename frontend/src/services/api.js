const BASE = (import.meta.env.VITE_API_BASE_URL ?? '') + '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body?.error?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.code = body?.error?.code;
    throw err;
  }
  return res.json();
}

export const countriesApi = {
  list: () => request('/countries'),
  getById: (id) => request(`/countries/${id}`),
  getSoldiers: (id, { limit = 20, after } = {}) => {
    const params = new URLSearchParams({ limit });
    if (after != null) params.set('after', after);
    return request(`/countries/${id}/soldiers?${params}`);
  },
  getEvents: (id) => request(`/countries/${id}/events`),
};
