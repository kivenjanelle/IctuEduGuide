// src/components/CoursesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../utils/api';

const courseIcons = ['💻', '📐', '🗄️', '🌐', '🔒', '🤖', '⚙️', '📡', '📊', '🔬', '📘', '🧮', '🖥️', '📱', '🔧', '📝', '🧠', '🌍', '☕', '🐍'];

const LEVEL_COLORS = {
  'Level 1': { bg: '#d1fae5', color: '#065f46' },
  'Level 2': { bg: '#ede9fe', color: '#5b21b6' },
  'Level 3': { bg: '#fef3c7', color: '#92400e' },
};

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');

  useEffect(() => {
    getCourses()
      .then(res => {
        const fetched = res.data.courses || res.data;
        setCourses(fetched || []);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c => {
    const matchSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.code && c.code.toLowerCase().includes(search.toLowerCase()));
    const matchLevel = levelFilter === 'All' || c.level === levelFilter;
    return matchSearch && matchLevel;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #ddd6fe', borderTop: '4px solid #4c1d95', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #3b0764, #4c1d95, #1e40af)',
        padding: '48px 32px 64px',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(167,139,250,0.1)', top: -80, left: -60, filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', width: 250, height: 250, borderRadius: '50%', background: 'rgba(96,165,250,0.1)', bottom: -60, right: -40, filter: 'blur(40px)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', marginBottom: 10 }}>
            📚 ICT Courses
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', marginBottom: 28 }}>
            Browse all courses and access past questions with solutions
          </p>

          {/* Search bar */}
          <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
            <input
              type="text"
              placeholder="Search by course title or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '14px 18px 14px 50px',
                borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.2)',
                fontSize: '1rem', outline: 'none',
                background: 'rgba(255,255,255,0.15)',
                color: '#fff', boxSizing: 'border-box',
                backdropFilter: 'blur(10px)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ maxWidth: 1000, margin: '-24px auto 0', padding: '0 24px', position: 'relative', zIndex: 2 }}>
        <div style={{
          background: '#fff', borderRadius: 20, padding: '14px 20px',
          boxShadow: '0 8px 32px rgba(76,29,149,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12, border: '1.5px solid #ede9fe',
        }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['All', 'Level 1', 'Level 2', 'Level 3'].map(level => (
              <button key={level} onClick={() => setLevelFilter(level)} style={{
                padding: '8px 18px', borderRadius: 10, border: 'none',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
                background: levelFilter === level ? 'linear-gradient(135deg, #4c1d95, #1e40af)' : '#f5f3ff',
                color: levelFilter === level ? '#fff' : '#6b7280',
                boxShadow: levelFilter === level ? '0 4px 12px rgba(76,29,149,0.3)' : 'none',
                transition: 'all 0.2s',
              }}>{level}</button>
            ))}
          </div>
          <span style={{ color: '#9ca3af', fontSize: 13 }}>
            Showing <strong style={{ color: '#4c1d95' }}>{filtered.length}</strong> of {courses.length} courses
          </span>
        </div>
      </div>

      {/* Course List */}
      <div style={{ maxWidth: 1000, margin: '24px auto 60px', padding: '0 24px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: 20, border: '1.5px solid #ede9fe' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <p style={{ fontSize: 18, color: '#6b7280', margin: 0 }}>
              {search ? `No courses found for "${search}"` : 'No courses available yet.'}
            </p>
            {!search && <p style={{ fontSize: 14, marginTop: 8, color: '#a78bfa' }}>The admin will add courses soon.</p>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((course, index) => {
              const levelStyle = LEVEL_COLORS[course.level] || { bg: '#f3f4f6', color: '#6b7280' };
              return (
                <Link key={course.id} to={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#fff', border: '1.5px solid #ede9fe',
                    borderRadius: 18, padding: '18px 22px',
                    display: 'flex', alignItems: 'center', gap: 18,
                    transition: 'all 0.2s', cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(76,29,149,0.05)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#4c1d95'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(76,29,149,0.15)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#ede9fe'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(76,29,149,0.05)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 50, height: 50, flexShrink: 0,
                      background: 'linear-gradient(135deg, #ede9fe, #dbeafe)',
                      borderRadius: 14, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 22,
                    }}>
                      {courseIcons[index % courseIcons.length]}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4c1d95', fontSize: 12, background: '#ede9fe', padding: '2px 8px', borderRadius: 6 }}>
                          {course.code}
                        </span>
                        {course.level && (
                          <span style={{ fontSize: 11, fontWeight: 700, background: levelStyle.bg, color: levelStyle.color, padding: '2px 10px', borderRadius: 20 }}>
                            {course.level}
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '0.97rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {course.title}
                      </h3>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 16, flexShrink: 0, fontSize: 13, color: '#9ca3af' }}>
                      <span>❓ {course.question_count || 0}</span>
                      <span>📝 {course.quiz_count || 0}</span>
                    </div>

                    {/* Arrow */}
                    <div style={{ width: 32, height: 32, flexShrink: 0, background: '#ede9fe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4c1d95', fontSize: 16, fontWeight: 700 }}>
                      →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}