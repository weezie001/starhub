const BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  try {
    const raw = localStorage.getItem('sb_user');
    return raw ? JSON.parse(raw).token : null;
  } catch { return null; }
}

async function req(path, opts = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
    ...opts,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function mapBooking(b) {
  return { ...b, celeb: b.celebData, type: b.bookingType, form: b.formData };
}

export const api = {
  // Auth
  register: (name, email, password) =>
    req('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  login: (email, password) =>
    req('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Celebrities
  getCelebrities: () => req('/celebrities'),
  updateCelebAvailability: (id, avail) =>
    req(`/celebrities/${id}/availability`, { method: 'PATCH', body: JSON.stringify({ avail }) }),

  // Bookings
  createBooking: (celeb, type, form, payment, donateAmt) =>
    req('/bookings', { method: 'POST', body: JSON.stringify({ celeb, type, form, payment, donateAmt }) }),
  getUserBookings: () => req('/user/bookings').then(rows => rows.map(mapBooking)),

  // Chat
  getChatHistory: (sessionId) => req(`/chat/${sessionId}/history`),

  // Waitlist
  joinWaitlist: (data) => req('/waitlist', { method: 'POST', body: JSON.stringify(data) }),
  getWaitlistPosition: (id) => req(`/waitlist/${id}/position`),

  // Admin
  getAdminBookings: () => req('/admin/bookings').then(rows => rows.map(mapBooking)),
  updateBookingStatus: (id, status) =>
    req(`/admin/bookings/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getAdminUsers: () => req('/admin/users'),
  getAdminChatSessions: () => req('/admin/chat/sessions'),
  getAdminWaitlist: () => req('/admin/waitlist'),
  updateWaitlistStatus: (id, status) =>
    req(`/admin/waitlist/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
