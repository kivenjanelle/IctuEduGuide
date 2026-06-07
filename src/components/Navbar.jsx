// src/components/Navbar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/Authcontext.jsx';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const linkStyle = ({ isActive }) => ({
    fontWeight: 600,
    fontSize: '0.95rem',
    color: isActive ? '#8417c4' : '#8417c4',
    textDecoration: 'none',
    padding: '6px 2px',
    borderBottom: isActive ? '2px solid #f163b104' : '2px solid transparent',
    transition: 'all 0.2s',
  });

  const studentLinks = [
    { to: '/dashboard',   label: '🏠 Home' },
    { to: '/courses',     label: '📚 Courses' },
    { to: '/quizzes',     label: '📝 Quizzes' },
    { to: '/performance', label: '📊 Performance' },
  ];

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      position: 'sticky', top: 0, zIndex: 100,
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <div
          onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🎓</div>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4c065e', letterSpacing: -0.3 }}>
            ICTU EduGuide
          </span>
        </div>

        {/* Desktop Nav Links — students only */}
        {user?.role !== 'admin' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="desktop-nav">
            {studentLinks.map(link => (
              <NavLink key={link.to} to={link.to} style={linkStyle}>
                {link.label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Admin label */}
        {user?.role === 'admin' && (
          <div style={{
            background: '#eef2ff', color: '#6366f1',
            padding: '4px 14px', borderRadius: 20,
            fontSize: 13, fontWeight: 700,
          }}>
            🛡️ Admin Panel
          </div>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* User info */}
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 14,
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', lineHeight: 1.2 }}>
                {user?.name?.split(' ')[0] || 'User'}
              </span>
              <span style={{ fontSize: 11, color: '#a59caf', lineHeight: 1.2 }}>
                {user?.level || user?.role}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              background: '#fee2e2', color: '#dc2626',
              border: 'none', borderRadius: 10,
              padding: '8px 16px', fontWeight: 600,
              fontSize: 13, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}