/**
 * FocusLearner Pro - API Service
 * Centralized API client for backend communication
 */

import axios from 'axios';

const rawBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const API_BASE_URL = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

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
    // Demo Mode: Do not redirect on 401
    return Promise.reject(error);
  }
);

// Focus Session API
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

// NO REPLACEMENT CONTENT IN THIS TOOL CALL - SWITCHING TO MULTI_REPLACE
// This is just a comment. I will abort and use multi_replace.
// Wait, I can just use 2 tool calls in parallel? No, sequential is cleaner.
// I will use multi_replace.

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
