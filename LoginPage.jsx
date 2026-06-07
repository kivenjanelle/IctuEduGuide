// src/components/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext.jsx';
import { login } from '../utils/api';

export default function LoginPage() {
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      const user = res.data.user;
      if (role === 'admin' && user.role !== 'admin') {
        setError('You are not authorized as an admin.');
        setLoading(false);
        return;
      }
      loginUser(res.data.token, user);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f7ff 0%, #e9e4ff 40%, #dbeafe 100%)',
      display: 'flex',
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      {/* Left decorative panel */}
      <div style={{
        display: 'none',
        width: '45%',
        background: 'linear-gradient(160deg, #3b0764 0%, #4c1d95 40%, #1e40af 100%)',
        padding: '60px 48px',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }} className="left-panel">
        {/* Decorative circles */}
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(167,139,250,0.15)', top: -80, right: -80 }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(96,165,250,0.15)', bottom: 100, left: -60 }} />
        <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', background: 'rgba(196,181,253,0.1)', bottom: -40, right: 60 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 60 }}>
            <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎓</div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>ICTU EduGuide</span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 20 }}>
            Your Academic<br /><span style={{ color: '#c4b5fd' }}>Journey</span><br />Starts Here
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Access past questions, take quizzes, track your performance and excel in your studies.
          </p>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, position: 'relative', zIndex: 1 }}>
          © 2026 ICTU EduGuide · ICT University Learning Platform
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Mobile brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
            <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg, #4c1d95, #1e40af)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🎓</div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3b0764' }}>ICTU EduGuide</span>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e1b4b', marginBottom: 6 }}>Welcome back!</h2>
          <p style={{ color: '#6b7280', marginBottom: 28, fontSize: '0.95rem' }}>Sign in to continue your learning journey</p>

          {/* Role tabs */}
          <div style={{
            display: 'flex', gap: 8, marginBottom: 28,
            background: '#ede9fe', borderRadius: 14, padding: 5,
          }}>
            {[
              { key: 'student', label: '🎓 Student' },
              { key: 'admin', label: '🛡️ Admin' },
            ].map(r => (
              <button key={r.key} onClick={() => { setRole(r.key); setError(''); }} style={{
                flex: 1, padding: '10px', borderRadius: 10, border: 'none',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                background: role === r.key ? 'linear-gradient(135deg, #4c1d95, #1e40af)' : 'transparent',
                color: role === r.key ? '#fff' : '#6b7280',
                boxShadow: role === r.key ? '0 4px 12px rgba(76,29,149,0.3)' : 'none',
                transition: 'all 0.2s',
              }}>{r.label}</button>
            ))}
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              color: '#dc2626', padding: '12px 16px', borderRadius: 12,
              fontSize: 14, marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center',
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Email Address
              </label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} required
                placeholder={role === 'admin' ? 'admin@ictuniversity.edu.cm' : 'you@ictuniversity.edu.cm'}
                style={{
                  width: '100%', padding: '13px 16px', borderRadius: 12,
                  border: '1.5px solid #ddd6fe', fontSize: 15, outline: 'none',
                  background: '#fff', color: '#1f2937', boxSizing: 'border-box',
                  transition: 'border 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#ddd6fe'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" value={form.password}
                  onChange={handleChange} required
                  placeholder="Enter your password"
                  style={{
                    width: '100%', padding: '13px 48px 13px 16px', borderRadius: 12,
                    border: '1.5px solid #ddd6fe', fontSize: 15, outline: 'none',
                    background: '#fff', color: '#1f2937', boxSizing: 'border-box',
                    transition: 'border 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = '#ddd6fe'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af',
                }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading ? '#c4b5fd' : 'linear-gradient(135deg, #4c1d95, #1e40af)',
              border: 'none', borderRadius: 12, color: '#fff',
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(76,29,149,0.35)',
              transition: 'all 0.2s',
            }}>
              {loading ? 'Signing in...' : `Continue as ${role === 'admin' ? 'Admin' : 'Student'} →`}
            </button>
          </form>

          {role === 'student' && (
            <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6b7280' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#4c1d95', fontWeight: 700, textDecoration: 'none' }}>
                Create one for free
              </Link>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: '#9ca3af' }}>
            © 2026 ICTU EduGuide · ICT University Learning Platform
          </div>
        </div>
      </div>
    </div>
  );
}