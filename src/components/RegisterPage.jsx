// src/components/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext.jsx';
import { register } from '../utils/api';

const LEVELS = ['Level 1', 'Level 2', 'Level 3'];
const SPECIALITIES = [
  'Software Engineering', 'Networking', 'Cybersecurity',
  'Data Science', 'AI/ML', 'Database Systems',
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', level: '', speciality: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Please enter your full name.');
    if (!form.email.endsWith('@ictuniversity.edu.cm')) return setError('Please use your ICTU email (@ictuniversity.edu.cm).');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.level || !form.speciality) return setError('Please select your level and speciality.');
    setLoading(true);
    try {
      const res = await register(form);
      loginUser(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    border: '1.5px solid #ddd6fe', fontSize: 15, outline: 'none',
    background: '#fff', color: '#1f2937', boxSizing: 'border-box',
    transition: 'border 0.2s', marginBottom: 0,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8f7ff 0%, #e9e4ff 40%, #dbeafe 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif", padding: '40px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #4c1d95, #1e40af)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎓</div>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3b0764' }}>ICTU EduGuide</span>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: 24, padding: '40px 36px',
          boxShadow: '0 8px 40px rgba(76,29,149,0.12)',
          border: '1px solid #ede9fe',
        }}>
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
            {[1, 2].map((s, i) => (
              <React.Fragment key={s}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: step >= s ? 'linear-gradient(135deg, #4c1d95, #1e40af)' : '#e9e4ff',
                  color: step >= s ? '#fff' : '#9ca3af',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14, flexShrink: 0,
                  boxShadow: step === s ? '0 0 0 4px rgba(124,58,237,0.2)' : 'none',
                  transition: 'all 0.3s',
                }}>{s}</div>
                {i === 0 && (
                  <div style={{ flex: 1, height: 3, background: step >= 2 ? 'linear-gradient(90deg, #4c1d95, #1e40af)' : '#e9e4ff', margin: '0 8px', borderRadius: 2, transition: 'all 0.3s' }} />
                )}
              </React.Fragment>
            ))}
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e1b4b', marginBottom: 4 }}>
            {step === 1 ? 'Create Account' : 'Almost Done!'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
            {step === 1 ? 'Step 1 of 2 — Your basic info' : 'Step 2 of 2 — Your academic info'}
          </p>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              color: '#dc2626', padding: '11px 14px', borderRadius: 10,
              fontSize: 13, marginBottom: 18, display: 'flex', gap: 8,
            }}>⚠️ {error}</div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNext}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Full Name</label>
                <input style={inputStyle} type="text" name="name" value={form.name}
                  onChange={handleChange} placeholder="e.g. John Doe" required
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = '#ddd6fe'} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>University Email</label>
                <input style={inputStyle} type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="you@ictuniversity.edu.cm" required
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = '#ddd6fe'} />
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 5 }}>Must end with @ictuniversity.edu.cm</p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...inputStyle, paddingRight: 48 }}
                    type={showPassword ? 'text' : 'password'}
                    name="password" value={form.password}
                    onChange={handleChange} placeholder="Min. 6 characters" required
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = '#ddd6fe'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af',
                  }}>{showPassword ? '🙈' : '👁️'}</button>
                </div>
              </div>

              <button type="submit" style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg, #4c1d95, #1e40af)',
                border: 'none', borderRadius: 12, color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(76,29,149,0.3)',
              }}>Continue →</button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Level</label>
                <select style={{ ...inputStyle, background: '#fff' }} name="level" value={form.level}
                  onChange={handleChange} required
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = '#ddd6fe'}>
                  <option value="">Select your level</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Speciality</label>
                <select style={{ ...inputStyle, background: '#fff' }} name="speciality" value={form.speciality}
                  onChange={handleChange} required
                  onFocus={e => e.target.style.borderColor = '#7c3aed'}
                  onBlur={e => e.target.style.borderColor = '#ddd6fe'}>
                  <option value="">Select your speciality</option>
                  {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px',
                background: loading ? '#c4b5fd' : 'linear-gradient(135deg, #4c1d95, #1e40af)',
                border: 'none', borderRadius: 12, color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(76,29,149,0.3)',
              }}>
                {loading ? 'Creating Account...' : 'Create Account 🎓'}
              </button>

              <button type="button" onClick={() => { setStep(1); setError(''); }} style={{
                width: '100%', padding: '12px', marginTop: 10,
                background: '#f5f3ff', border: '1.5px solid #ddd6fe',
                borderRadius: 12, color: '#4c1d95', fontSize: 14,
                fontWeight: 600, cursor: 'pointer',
              }}>← Back</button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6b7280' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4c1d95', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#9ca3af' }}>
          © 2026 ICTU EduGuide · ICT University Learning Platform
        </div>
      </div>
    </div>
  );
}