const BASE = import.meta.env.VITE_API_URL ||
  `http://${window.location.hostname}:3000/api`;

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
  return { ...b, celeb: b.celebData, type: b.bookingType, form: b.formData, payment: b.paymentMethod };
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
  getMe: () => req('/me'),
  updateMe: (data) => req('/me', { method: 'PATCH', body: JSON.stringify(data) }),
  getFavorites: () => req('/me/favorites'),
  saveFavorites: (ids) => req('/me/favorites', { method: 'PUT', body: JSON.stringify({ ids }) }),
  getUserMemberships: () => req('/me/memberships'),

  // Chat
  getChatHistory: (sessionId) => req(`/chat/${sessionId}/history`),

  // Waitlist
  joinWaitlist: (data) => req('/waitlist', { method: 'POST', body: JSON.stringify(data) }),
  getWaitlistPosition: (id) => req(`/waitlist/${id}/position`),

  // Blogs
  getBlogs: () => req('/blogs'),
  getBlog: (id) => req(`/blogs/${id}`),

  // Admin
  getAdminBookings: () => req('/admin/bookings').then(rows => rows.map(mapBooking)),
  updateBookingStatus: (id, status) =>
    req(`/admin/bookings/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getAdminUsers: () => req('/admin/users'),
  getAdminChatSessions: () => req('/admin/chat/sessions'),
  deleteAdminChatSession: (id) => req(`/admin/chat/sessions/${id}`, { method: 'DELETE' }),
  getAdminWaitlist: () => req('/admin/waitlist'),
  updateWaitlistStatus: (id, status) =>
    req(`/admin/waitlist/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  // Upload
  uploadPhoto: (data) => req('/upload', { method: 'POST', body: JSON.stringify({ data }) }),

  // Admin celebrities
  addCelebrity: (data) => req('/admin/celebrities', { method: 'POST', body: JSON.stringify(data) }),
  updateCelebrity: (id, data) => req(`/admin/celebrities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCelebrity: (id) => req(`/admin/celebrities/${id}`, { method: 'DELETE' }),
  createUser: (data) => req('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  deleteUser: (id) => req(`/admin/users/${id}`, { method: 'DELETE' }),
  getAdminUserDetail: (id) => req(`/admin/users/${id}/detail`),
  upgradeUserMembership: (id, data) => req(`/admin/users/${id}/membership`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateAdminUser: (id, data) => req(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Admin blogs
  addBlog: (data) => req('/admin/blogs', { method: 'POST', body: JSON.stringify(data) }),
  updateBlog: (id, data) => req(`/admin/blogs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBlog: (id) => req(`/admin/blogs/${id}`, { method: 'DELETE' }),
  sendBlogEmail: (id) => req(`/admin/blogs/${id}/send-email`, { method: 'POST' }),

  // Admin transactions
  getAdminTransactions: () => req('/admin/transactions').then(rows => rows.map(mapBooking)),

  // Plans
  getPlans: () => req('/plans'),
  updatePlan: (tier, data) => req(`/admin/plans/${tier}`, { method: 'PUT', body: JSON.stringify(data) }),
  setUserPlan: (userId, plan) => req(`/admin/users/${userId}/plan`, { method: 'PATCH', body: JSON.stringify({ plan }) }),
};
