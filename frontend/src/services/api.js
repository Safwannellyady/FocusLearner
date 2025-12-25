/**
 * FocusLearner Pro - API Service
 * Centralized API client for backend communication
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 errors (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Focus Session API
export const focusAPI = {
  lock: (subjectFocus) =>
    api.post('/focus/lock', { subject_focus: subjectFocus }),

  unlock: () =>
    api.post('/focus/unlock'),

  getCurrent: () =>
    api.get('/focus/current'),

  updateVideo: (videoId, timestamp) =>
    api.post('/focus/update-video', {
      video_id: videoId,
      timestamp,
    }),

  getContent: (query) =>
    api.get('/focus/content', { params: { query } }),

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

export const analyticsAPI = {
  getSummary: () => api.get('/focus/analytics/summary'),
};

// Game API
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

  getLeaderboard: (moduleId, limit = 10) =>
    api.get(`/game/leaderboard/${moduleId}`, { params: { limit } }),

  generateChallenge: (subject, level) =>
    api.post('/game/challenge/generate', { subject, level }),

  generateActivity: (subject, topic, type) =>
    api.post('/game/activity/generate', { subject, topic, type }),
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
};

// Preferences API
export const preferencesAPI = {
  get: () => api.get('/preferences/'),
  update: (preferences) => api.put('/preferences/', preferences),
};

// Lecture API
export const lectureAPI = {
  getAll: () => api.get('/lectures/'),
  create: (lecture) => api.post('/lectures/', lecture),
  getById: (id) => api.get(`/lectures/${id}`),
  update: (id, lecture) => api.put(`/lectures/${id}`, lecture),
  delete: (id) => api.delete(`/lectures/${id}`),
  generateQuiz: (subject, topic, count) =>
    api.post('/lectures/quiz/generate', { subject, topic, count }),
};

// Chat API
export const chatAPI = {
  send: (message, context) => api.post('/chat/send', { message, context }),
  getHistory: () => api.get('/chat/history'),
  clearHistory: () => api.post('/chat/clear'),
};

export default api;

