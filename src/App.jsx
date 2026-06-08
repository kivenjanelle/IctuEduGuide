import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/Authcontext.jsx';

import LoadingPage from './components/LoadingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import CoursesPage from './components/CoursesPage';
import CourseDetailPage from './components/CourseDetailPage';
import QuizPage from './components/QuizPage';
import TakeQuizPage from './components/TakequizPage';
import QuizResultPage from './components/QuizResultPage';
import PerformancePage from './components/PerformancePage';
import AdminPage from './components/AdminPage';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';

// Protects routes that require login
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  return user ? children : <Navigate to="/login" />;
}

// Protects routes that require admin role
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/courses" />;
  return children;
}

// Layout with Navbar
function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
      <Route path="/login" element={user ? <Navigate to="/courses" /> : <LoginPage />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <AppLayout><Dashboard user={user} /></AppLayout>
        </PrivateRoute>
      } />

      <Route path="/courses" element={
        <PrivateRoute>
          <AppLayout><CoursesPage /></AppLayout>
        </PrivateRoute>
      } />

      <Route path="/courses/:id" element={
        <PrivateRoute>
          <AppLayout><CourseDetailPage /></AppLayout>
        </PrivateRoute>
      } />

      <Route path="/quizzes" element={
        <PrivateRoute>
          <AppLayout><QuizPage /></AppLayout>
        </PrivateRoute>
      } />

      <Route path="/take-quiz/:id" element={
        <PrivateRoute>
          <AppLayout><TakeQuizPage /></AppLayout>
        </PrivateRoute>
      } />

      <Route path="/quiz-result" element={
        <PrivateRoute>
          <AppLayout><QuizResultPage /></AppLayout>
        </PrivateRoute>
      } />

      <Route path="/performance" element={
        <PrivateRoute>
          <AppLayout><PerformancePage /></AppLayout>
        </PrivateRoute>
      } />

      {/* Admin only */}
      <Route path="/admin" element={
        <AdminRoute>
          <AppLayout><AdminPage /></AppLayout>
        </AdminRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={user ? "/courses" : "/login"} />} />
      <Route path="*" element={<Navigate to={user ? "/courses" : "/login"} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
