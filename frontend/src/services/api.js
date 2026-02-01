/**
 * FocusLearner Pro - API Service
 * Centralized API client for backend communication with retry logic and error handling
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add token and handle cancellation
const requestInterceptor = api.interceptors.request.use(
  (config) => {
    // Add token from localStorage
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors, retries, and token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Log successful requests in development
    if (process.env.NODE_ENV === 'development') {
      const duration = new Date() - response.config.metadata?.startTime;
      console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your connection.',
      });
    }
    
    // Handle 401 - Unauthorized (token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        // No refresh token, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      try {
        // Try to refresh token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        });
        
        const { access_token, refresh_token } = response.data;
        
        localStorage.setItem('token', access_token);
        localStorage.setItem('access_token', access_token);
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }
        
        processQueue(null, access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         error.message || 
                         'An unexpected error occurred';
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: originalRequest.url,
        method: originalRequest.method,
        status: error.response?.status,
        message: errorMessage,
      });
    }
    
    return Promise.reject({
      ...error,
      message: errorMessage,
    });
  }
);

// Retry logic for failed requests
const retryRequest = async (config, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await api(config);
    } catch (error) {
      if (i === retries - 1 || (error.response && error.response.status < 500)) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

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

  generateChallenge: (subject, level) =>
    api.post('/game/challenge/generate', { subject, level }),

  generateActivity: (subject, topic, type) =>
    api.post('/game/activity/generate', { subject, topic, type }),

  submitActivity: (challengeId, answer, violationCount = 0) =>
    api.post('/game/activity/submit', { challenge_id: challengeId, answer, violation_count: violationCount }),

  getMastery: (subject, topic) =>
    api.get('/game/mastery', { params: { subject, topic } }),

  getStats: () => api.get('/game/stats'),
};

// Auth API
export const authAPI = {
  register: async (username, email, password, fullName) => {
    const response = await api.post('/auth/register', { 
      username, 
      email, 
      password, 
      full_name: fullName 
    });
    // Store tokens
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('access_token', response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
    }
    return response;
  },

  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    // Store tokens
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('access_token', response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
    }
    return response;
  },

  googleLogin: async (token) => {
    const response = await api.post('/auth/google', { token });
    // Store tokens
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('access_token', response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
    }
    return response;
  },

  refreshToken: () =>
    api.post('/auth/refresh'),

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      // Clear all tokens and user data
      localStorage.removeItem('token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

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

// Course API
export const courseAPI = {
  getAll: () => api.get('/lectures/courses'),
  create: (data) => api.post('/lectures/courses', data),
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

// Analytics API
export const analyticsAPI = {
  getSummary: () => api.get('/focus/analytics/summary'),
  getHealth: () => api.get('/analytics/health'),
};

// Taxonomy API
export const taxonomyAPI = {
  getSubjects: () => api.get('/taxonomy/subjects'),
  getTopics: (subject) => api.get('/taxonomy/topics', { params: { subject } }),
  getIntent: (id) => api.get(`/taxonomy/intent/${id}`),
  getLoopStatus: (intentId) => api.get('/taxonomy/loop/status', { params: { intent_id: intentId } }),
};

export default api;
