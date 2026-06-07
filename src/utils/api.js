// src/utils/api.js
import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);

// Courses
export const getCourses = () => api.get('/courses');
export const getCourse = (id) => api.get(`/courses/${id}`);

// Questions (Past Questions)
export const getCourseQuestions = (courseId) => api.get(`/questions/course/${courseId}`);

// Quizzes
export const getQuizzesByCourse = (courseId) => api.get(`/quizzes/course/${courseId}`);
export const getAllQuizzes = () => api.get('/quizzes');
export const getQuiz = (quizId) => api.get(`/quizzes/${quizId}`);
export const createQuiz = (payload) => api.post('/quizzes', payload);
export const updateQuiz = (quizId, payload) => api.put(`/quizzes/${quizId}`, payload);
export const deleteQuiz = (quizId) => api.delete(`/quizzes/${quizId}`);
export const submitQuiz = (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, { answers });

// Performance
export const getPerformance = () => api.get('/performance');

export default api;