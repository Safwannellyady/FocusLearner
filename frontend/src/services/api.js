/**
 * FocusLearner Pro - API Service
 * Centralized API client with silent JWT refresh (access token: 15 min,
 * refresh token: 30 days).
 *
 * Flow:
 *   1. Every outgoing request receives the stored access token in the
 *      Authorization header.
 *   2. If the server returns HTTP 401, the interceptor pauses ALL pending
 *      requests and hits POST /api/auth/refresh exactly once.
 *   3. On success the new access token is stored and every queued request is
 *      automatically retried with the new token.
 *   4. If the refresh itself fails (30-day token expired / revoked) the user
 *      is cleared from storage and redirected to /login.
 */

import axios from 'axios';

const rawBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const API_BASE_URL = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Token helpers ────────────────────────────────────────────────────────────

const getAccessToken  = () => localStorage.getItem('token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

const saveTokens = ({ access_token, token }) => {
  const newToken = access_token || token;
  if (newToken) localStorage.setItem('token', newToken);
};

const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('activeSession');
};

// ── Request interceptor — attach current access token ───────────────────────

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — silent token refresh on 401 ──────────────────────

let isRefreshing   = false;       // true while a refresh call is in-flight
let pendingQueue   = [];          // requests waiting for the new token

/**
 * Flush the queue: call each pending resolver with the new token (or reject
 * them all if the refresh failed).
 */
const flushQueue = (error, newToken = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else       resolve(newToken);
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  // Happy path — pass through unchanged
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only act on 401s that haven't already been retried
    const is401         = error.response?.status === 401;
    const alreadyRetried = originalRequest._retry;
    // Skip the refresh endpoint itself to avoid infinite loops
    const isRefreshCall = originalRequest.url?.includes('/auth/refresh');

    if (!is401 || alreadyRetried || isRefreshCall) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another 401 fired while a refresh is already in-flight — queue it
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      });
    }

    // Mark this request so we don't retry it again if it 401s a second time
    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      // No refresh token stored — send straight to login
      clearAuth();
      isRefreshing = false;
      flushQueue(new Error('No refresh token'));
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      // Call refresh endpoint directly with axios (not the intercepted instance)
      // to avoid triggering our own interceptor recursively.
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { headers: { Authorization: `Bearer ${refreshToken}` } }
      );

      const newAccessToken = data.access_token || data.token;
      saveTokens({ token: newAccessToken });

      // Retry the original failed request with the fresh token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // Unblock all queued requests
      flushQueue(null, newAccessToken);
      isRefreshing = false;

      return api(originalRequest);

    } catch (refreshError) {
      // Refresh itself failed — session is dead, redirect to login
      flushQueue(refreshError);
      isRefreshing = false;
      clearAuth();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);

// ── Focus Session API ─────────────────────────────────────────────────────────
export const focusAPI = {
  lock: (data) =>
    api.post('/focus/lock', typeof data === 'string' ? { subject_focus: data } : data),

  autosave: (data) =>
    api.post('/focus/autosave', data),

  getSessions: () =>
    api.get('/focus/sessions'),

  updateSession: (id, data) =>
    api.put(`/focus/${id}`, data),

  deleteSession: (id) =>
    api.delete(`/focus/${id}`),

  unlock: () =>
    api.post('/focus/unlock'),

  getCurrent: () =>
    api.get('/focus/current'),

  updateVideo: (videoId, timestamp) =>
    api.post('/focus/update-video', {
      video_id: videoId,
      timestamp,
    }),

  getContent: (query, subjectFocus) =>
    api.get('/focus/content', { params: { query, subject_focus: subjectFocus } }),

  logDistraction: (duration, reason, timestamp) =>
    api.post('/focus/distraction/log', { duration, reason, timestamp }),
};


// Content API
export const contentAPI = {
  search: (query, subjectFocus, source = 'youtube') =>
    api.get('/content/search', {
      params: { query, subject_focus: subjectFocus, source },
    }),

  filter: (title, description, tags) =>
    api.post('/content/filter', { title, description, tags }),

  getTranscript: (videoId) =>
    api.get(`/content/transcript/${videoId}`),
};

// ── Game API ──────────────────────────────────────────────────────────────────
export const gameAPI = {
  getModules: () => api.get('/game/modules'),

  getModule: (moduleId) => api.get(`/game/modules/${moduleId}`),

  submitResult: (moduleId, score, level, subjectFocus) =>
    api.post('/game/submit', {
      module_id: moduleId,
      score,
      level,
      subject_focus: subjectFocus,
    }),

  getProgress: (moduleId) =>
    api.get('/game/progress', {
      params: { module_id: moduleId },
    }),

  getLeaderboard: (moduleId, filters = {}) =>
    api.get(`/game/leaderboard/${moduleId}`, {
      params: {
        limit: 10,
        ...filters
      }
    }),

  generateChallenge: (subject, level, topic, videoContext) =>
    api.post('/game/challenge/generate', { subject, level, topic, video_context: videoContext }),

  generateActivity: (subject, topic, type, videoContext) =>
    api.post('/game/activity/generate', { subject, topic, type, video_context: videoContext }),

  submitActivity: (challengeId, answer, violationCount = 0) =>
    api.post('/game/activity/submit', { challenge_id: challengeId, answer, violation_count: violationCount }),

  getMastery: (subject, topic) =>
    api.get('/game/mastery', { params: { subject, topic } }),

  getStats: () => api.get('/game/stats'),
};

// Auth API
export const authAPI = {
  register: (username, email, password, fullName) =>
    api.post('/auth/register', { username, email, password, full_name: fullName }),

  login: (username, password) =>
    api.post('/auth/login', { username, password }),

  googleLogin: (token) =>
    api.post('/auth/google', { token }),

  getCurrentUser: () =>
    api.get('/auth/me'),

  updateProfile: (data) =>
    api.put('/auth/update-profile', data),

  changePassword: (oldPassword, newPassword) =>
    api.post('/auth/change-password', { old_password: oldPassword, new_password: newPassword }),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (data) =>
    api.post('/auth/reset-password', data),

  checkUsername: (username) =>
    api.get('/auth/check-username', { params: { username } }),
};


// Preferences API
export const preferencesAPI = {
  get: () => api.get('/preferences/'),
  update: (preferences) => api.put('/preferences/', preferences),
};

// Course API
export const courseAPI = {
  getAll: () => api.get('/lectures/courses'),
  create: (data) => api.post('/lectures/courses', data),
  update: (id, data) => api.put(`/lectures/courses/${id}`, data),
  delete: (id) => api.delete(`/lectures/courses/${id}`),
};

// Lecture API
export const lectureAPI = {
  getAll: () => api.get('/lectures/'),
  create: (lecture) => api.post('/lectures/', lecture),
  getById: (id) => api.get(`/lectures/${id}`),
  update: (id, lecture) => api.put(`/lectures/${id}`, lecture),
  delete: (id) => api.delete(`/lectures/${id}`),
  complete: (id, payload) => api.post(`/lectures/${id}/complete`, payload),
  generateQuiz: (subject, topic, count, videoContext) =>
    api.post('/lectures/quiz/generate', { subject, topic, count, video_context: videoContext }),
};

// Chat API
export const chatAPI = {
  send: (message, context, videoId) => api.post('/chat/send', { message, context, videoId }),
  getHistory: () => api.get('/chat/history'),
  clearHistory: () => api.post('/chat/clear'),
};

// Analytics API
export const analyticsAPI = {
  getSummary: () => api.get('/focus/analytics/summary'),
  getStats: () => api.get('/focus/analytics/summary'),
  getHealth: () => api.get('/analytics/health'),
};

// Taxonomy API
export const taxonomyAPI = {
  getSubjects: () => api.get('/taxonomy/subjects'),
  getTopics: (subject) => api.get('/taxonomy/topics', { params: { subject } }),
  getIntent: (id) => api.get(`/taxonomy/intent/${id}`),
  getLoopStatus: (intentId) => api.get('/taxonomy/loop/status', { params: { intent_id: intentId } }),
};

// Material API
export const materialAPI = {
  getMaterials: (subjectFocus, search) => 
    api.get('/materials', { params: { subject_focus: subjectFocus, search } }),
  addMaterial: (formData) => 
    api.post('/materials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
  deleteMaterial: (id) => api.delete(`/materials/${id}`),
  searchWeb: (search) => api.get('/materials/search_web', { params: { search } }),
};

export const badgesAPI = {
  getBadges: () => api.get('/badges'),
};

// Support API
export const supportAPI = {
  submitTicket: (data) => api.post('/support/ticket', data),
  getFaqs: () => api.get('/support/faqs'),
};

export default api;
