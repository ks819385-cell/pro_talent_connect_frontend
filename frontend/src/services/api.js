/**
 * Centralized API Configuration
 * Single source of truth for all API calls
 * Includes response caching and request deduplication
 */

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// ─── In-Memory Response Cache ────────────────────────────
class ApiCache {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  set(key, data, ttlMs = 30000) {
    this.cache.set(key, { data, expiry: Date.now() + ttlMs });
  }

  invalidate(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) this.cache.delete(key);
    }
  }

  flush() {
    this.cache.clear();
  }
}

const apiCache = new ApiCache();

// ─── Request Deduplication ───────────────────────────────
const pendingRequests = new Map();

function deduplicateRequest(key, requestFn) {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });
  pendingRequests.set(key, promise);
  return promise;
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - add auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      // Ignore canceled requests to avoid noisy logs in React strict mode/navigation.
      if (error.code !== 'ERR_CANCELED') {
        error.message = 'Network error. Please check your connection.';
      }
    }
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      error.message = 'Too many requests. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

// ─── Cached GET helper ─────────────────────────────────
function cachedGet(url, options = {}, ttlMs = 30000) {
  const { signal, ...params } = options;
  const cacheKey = `${url}:${JSON.stringify(params)}`;

  const cached = apiCache.get(cacheKey);
  if (cached) return Promise.resolve(cached);

  // Never deduplicate when a signal is present.
  // If the original in-flight request was aborted (e.g. React strict-mode
  // double-invocation), the shared promise would reject with AbortError and
  // every subsequent caller would incorrectly see a "Failed to load" error.
  if (signal) {
    return apiClient.get(url, { params, signal }).then((res) => {
      apiCache.set(cacheKey, res, ttlMs);
      return res;
    });
  }

  return deduplicateRequest(cacheKey, () =>
    apiClient.get(url, { params }).then((res) => {
      apiCache.set(cacheKey, res, ttlMs);
      return res;
    })
  );
}

// ─── Write helper with cache invalidation ─────────────
function mutate(method, url, data, invalidatePrefixes = []) {
  return apiClient[method](url, data).then((res) => {
    invalidatePrefixes.forEach((p) => apiCache.invalidate(p));
    return res;
  });
}

// API methods
export const api = {
  // ─── Auth ───
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => { apiCache.flush(); return apiClient.post('/auth/logout'); },
  getProfile: () => cachedGet('/auth/profile', {}, 60000),
  changePassword: (data) => apiClient.put('/auth/change-password', data),
  changeAdminRole: (id, role) => apiClient.put(`/auth/admin/${id}/role`, { role }),
  refreshToken: () => apiClient.post('/auth/refresh'),
  registerAdmin: (data) => apiClient.post('/auth/register', data),

  // ─── OTP ───
  sendPlayerOtp: (email) => apiClient.post('/otp/send-player-otp', { email }),
  verifyPlayerOtp: (email, otp) => apiClient.post('/otp/verify-player-otp', { email, otp }),
  sendPasswordOtp: () => apiClient.post('/otp/send-password-otp'),
  verifyPasswordOtp: (otp) => apiClient.post('/otp/verify-password-otp', { otp }),

  // ─── Players (cached 30s) ───
  getPlayers: (options = {}) => cachedGet('/players', options, 30000),
  getPlayer: (id) => cachedGet(`/players/${id}`, {}, 60000),
  createPlayer: (data) => mutate('post', '/players', data, ['/players']),
  updatePlayer: (id, data) => mutate('put', `/players/${id}`, data, ['/players']),
  deletePlayer: (id) => { apiCache.invalidate('/players'); return apiClient.delete(`/players/${id}`); },
  searchPlayers: (params) => cachedGet('/players/search', params, 30000),

  // ─── Blogs (cached 60s) ───
  getBlogs: (params) => cachedGet('/blogs', params, 60000),
  getBlog: (id) => cachedGet(`/blogs/${id}`, {}, 120000),
  createBlog: (data) => mutate('post', '/blogs', data, ['/blogs']),
  updateBlog: (id, data) => mutate('put', `/blogs/${id}`, data, ['/blogs']),
  deleteBlog: (id) => { apiCache.invalidate('/blogs'); return apiClient.delete(`/blogs/${id}`); },
  getAllBlogs: (params) => cachedGet('/blogs/all', params, 30000),
  publishBlog: (id) => { apiCache.invalidate('/blogs'); return apiClient.patch(`/blogs/${id}/publish`); },

  // ─── About (cached 5 min) ───
  getAbout: () => cachedGet('/about', {}, 0),
  updateAbout: (data) => mutate('put', '/about', data, ['/about']).then((res) => {
    window.dispatchEvent(new CustomEvent('about:updated'));
    return res;
  }),
  addAboutImages: (images) => mutate('post', '/about/images', { images }, ['/about']),

  // ─── Services (cached 5 min) ───
  getServices: (options = {}) => cachedGet('/services', options, 300000),
  getService: (id) => cachedGet(`/services/${id}`, {}, 300000),
  createService: (data) => mutate('post', '/services', data, ['/services']),
  updateService: (id, data) => mutate('put', `/services/${id}`, data, ['/services']),
  deleteService: (id) => { apiCache.invalidate('/services'); return apiClient.delete(`/services/${id}`); },

  // ─── How It Works (cached 5 min) ───
  getHowItWorks: () => cachedGet('/how-it-works', {}, 300000),
  createHowItWork: (data) => mutate('post', '/how-it-works', data, ['/how-it-works']),
  updateHowItWork: (id, data) => mutate('put', `/how-it-works/${id}`, data, ['/how-it-works']),
  deleteHowItWork: (id) => { apiCache.invalidate('/how-it-works'); return apiClient.delete(`/how-it-works/${id}`); },

  // ─── Contact / Enquiries ───
  submitEnquiry: (data) => apiClient.post('/contact/enquiry', data),
  submitProfileRequest: (data) => apiClient.post('/contact/profile-request', data),
  getEnquiries: (options = {}) => cachedGet('/contact/enquiries', options, 15000),
  getProfileRequests: (options = {}) => cachedGet('/contact/profile-requests', options, 15000),
  updateEnquiryStatus: (id, status) => mutate('put', `/contact/enquiries/${id}`, { status }, ['/contact']),
  updateProfileStatus: (id, status, adminNotes) => mutate('put', `/contact/profile-requests/${id}`, { status, adminNotes }, ['/contact', '/players']),

  // ─── Dashboard (cached 15s) ───
  getDashboardStats: (options = {}) => cachedGet('/dashboard/stats', options, 15000),

  // ─── Admin Management (Super Admin) ───
  getAdmins: (params) => cachedGet('/admins', params, 30000),
  getAdmin: (id) => cachedGet(`/admins/${id}`, {}, 30000),
  createAdmin: (data) => mutate('post', '/admins', data, ['/admins']),
  updateAdmin: (id, data) => mutate('put', `/admins/${id}`, data, ['/admins']),
  demoteAdmin: (id) => { apiCache.invalidate('/admins'); return apiClient.patch(`/admins/${id}/demote`); },
  deleteAdmin: (id) => { apiCache.invalidate('/admins'); return apiClient.delete(`/admins/${id}`); },

  // ─── Audit Logs (Super Admin) ───
  getAuditLogs: (params) => cachedGet('/audit-logs', params, 10000),

  // ─── Leagues ───
  getLeagues: () => cachedGet('/leagues', {}, 120000),
  createLeague: (data) => mutate('post', '/leagues', data, ['/leagues']),
  updateLeague: (id, data) => mutate('put', `/leagues/${id}`, data, ['/leagues']),
  deleteLeague: (id) => { apiCache.invalidate('/leagues'); return apiClient.delete(`/leagues/${id}`); },

  // ─── Cache Control ───
  clearCache: () => apiCache.flush(),
  invalidateCache: (prefix) => apiCache.invalidate(prefix),
};

export default apiClient;
