// client/src/api.js
const token = () => localStorage.getItem('token');

export async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token() && { Authorization: `Bearer ${token()}` }),
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
  return res.json();
}