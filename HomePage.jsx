import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../utils/api';

const LEVELS = ['Level 1', 'Level 2', 'Level 3'];
const SPECIALITIES = ['General', 'Software Engineering', 'Networks', 'AI & Data Science', 'Cybersecurity', 'Database Administration'];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', level: '', speciality: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.level || !form.speciality) { setError('Please select your level and speciality.'); return; }
    setLoading(true);
    try {
      const res = await register(form);
      loginUser(res.data.token, res.data.user);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-logo">
          <div className="auth-left-logo-icon">🎓</div>
          <span className="auth-left-logo-text">ICTU EduGuide</span>
        </div>
        <h1 className="auth-left-title">Join <span>ICT University</span><br />Students</h1>
        <p className="auth-left-subtitle">Create your free account and get access to all course materials, past questions, quizzes and personalised performance tracking.</p>
        <div className="auth-features">
          {[
            { icon: '🆓', text: 'Free access to all course resources' },
            { icon: '🧠', text: 'AI-powered study recommendations' },
            { icon: '📈', text: 'Progress tracking per course' },
            { icon: '🏆', text: 'Grade reports and speciality advice' },
          ].map((f, i) => (
            <div key={i} className="auth-feature">
              <div className="auth-feature-icon">{f.icon}</div>
              <span className="auth-feature-text">{f.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="auth-right">
        <h2 className="auth-form-title">Create Account ✨</h2>
        <p className="auth-form-sub">Fill in your details to get started</p>
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" name="name" placeholder="e.g. John Doe" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" name="email" placeholder="student@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" name="password" placeholder="At least 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Level</label>
              <select className="form-select" name="level" value={form.level} onChange={handleChange} required>
                <option value="">Select level</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Speciality</label>
              <select className="form-select" name="speciality" value={form.speciality} onChange={handleChange} required>
                <option value="">Select speciality</option>
                {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? '⏳ Creating account...' : '🎓 Create Account'}
          </button>
        </form>
        <div className="auth-toggle">Already have an account? <Link to="/login">Sign In</Link></div>
      </div>
    </div>
  );
}