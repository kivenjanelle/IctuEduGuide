// src/components/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext.jsx';

const CARDS = [
  {
    icon: '📚',
    title: 'Courses',
    desc: 'Browse all ICT courses and access past questions with solutions.',
    path: '/courses',
    gradient: 'linear-gradient(135deg, #4c1d95, #6d28d9)',
    light: '#f5f3ff',
    border: '#ddd6fe',
    text: '#4c1d95',
  },
  {
    icon: '📝',
    title: 'Quizzes',
    desc: 'Test your knowledge with quizzes designed for each course.',
    path: '/quizzes',
    gradient: 'linear-gradient(135deg, #1e40af, #2563eb)',
    light: '#eff6ff',
    border: '#bfdbfe',
    text: '#1e40af',
  },
  {
    icon: '📊',
    title: 'Performance',
    desc: 'Track your quiz scores and get personalised recommendations.',
    path: '/performance',
    gradient: 'linear-gradient(135deg, #6d28d9, #1e40af)',
    light: '#faf5ff',
    border: '#e9d5ff',
    text: '#6d28d9',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #3b0764 0%, #4c1d95 45%, #1e40af 100%)',
        padding: '60px 32px 90px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'rgba(167,139,250,0.15)', top: -100, left: -80, filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'rgba(96,165,250,0.15)', bottom: -80, right: -60, filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(196,181,253,0.1)', top: '30%', left: '50%', filter: 'blur(40px)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🎓</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', marginBottom: 12, letterSpacing: -0.5 }}>
            {greeting()}, {user?.name?.split(' ')[0] || 'Student'}!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', maxWidth: 480, margin: '0 auto 24px' }}>
            Welcome to ICTU EduGuide — your study platform.
          </p>

          {/* Info badges */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {user?.level && (
              <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                📘 {user.level}
              </span>
            )}
            {user?.speciality && (
              <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                🔬 {user.speciality}
              </span>
            )}
            {user?.email && (
              <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                ✉️ {user.email}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ maxWidth: 1100, margin: '-48px auto 0', padding: '0 24px 60px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {CARDS.map(card => (
            <button key={card.path} onClick={() => navigate(card.path)} style={{
              background: '#fff',
              border: `1.5px solid ${card.border}`,
              borderRadius: 24, padding: '32px 28px',
              cursor: 'pointer', textAlign: 'left',
              boxShadow: '0 4px 24px rgba(76,29,149,0.08)',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 16px 48px rgba(76,29,149,0.18)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(76,29,149,0.08)';
              e.currentTarget.style.borderColor = card.border;
            }}
            >
              <div style={{
                width: 60, height: 60, background: card.gradient,
                borderRadius: 16, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 26, marginBottom: 20,
                boxShadow: '0 6px 20px rgba(76,29,149,0.25)',
              }}>
                {card.icon}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e1b4b', marginBottom: 8 }}>
                {card.title}
              </h2>
              <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                {card.desc}
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: card.light, color: card.text,
                padding: '8px 16px', borderRadius: 10,
                fontSize: 13, fontWeight: 700,
                border: `1px solid ${card.border}`,
              }}>
                Go to {card.title} →
              </div>
            </button>
          ))}
        </div>

        {/* Quick tip */}
        <div style={{
          marginTop: 36,
          background: 'linear-gradient(135deg, #4c1d95, #1e40af)',
          borderRadius: 20, padding: '24px 28px',
          display: 'flex', alignItems: 'flex-start', gap: 16,
        }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>💡</span>
          <div>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: 6 }}>Quick Tip</div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Start with <strong style={{ color: '#fff' }}>Courses</strong> to browse past questions.
              Then take a <strong style={{ color: '#fff' }}>Quiz</strong> and check your <strong style={{ color: '#fff' }}>Performance</strong> to see how you're improving!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}