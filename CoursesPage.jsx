// src/components/CoursesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../utils/api';


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
        <div style={{
          width: 48, height: 48, border: '4px solid #e0e7ff',
          borderTop: '4px solid #6366f1', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        padding: '48px 32px 56px',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, color: '#fff', marginBottom: 10 }}>
          📚 ICT Courses
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.05rem' }}>
          Browse all courses and access past questions with solutions
        </p>

        {/* Search */}
        <div style={{ maxWidth: 500, margin: '28px auto 0', position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 18, top: '50%',
            transform: 'translateY(-50%)', fontSize: 18,
          }}>🔍</span>
          <input
            type="text"
            placeholder="Search by title or code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '14px 18px 14px 50px',
              borderRadius: 16, border: 'none',
              fontSize: '1rem', outline: 'none',
              background: 'rgba(255,255,255,0.12)',
              color: '#fff', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Filter + Stats */}
      <div style={{
        maxWidth: 1000, margin: '-20px auto 0',
        padding: '0 24px', position: 'relative', zIndex: 2,
      }}>
        <div style={{
          background: '#fff', borderRadius: 20,
          padding: '16px 20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['All', 'Level 1', 'Level 2', 'Level 3'].map(level => (
              <button
                key={level}
                onClick={() => setLevelFilter(level)}
                style={{
                  padding: '8px 18px', borderRadius: 12, border: 'none',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  background: levelFilter === level ? '#6366f1' : '#f3f4f6',
                  color: levelFilter === level ? '#fff' : '#6b7280',
                  transition: 'all 0.2s',
                }}
              >
                {level}
              </button>
            ))}
          </div>
          <span style={{ color: '#9ca3af', fontSize: 13 }}>
            Showing <strong style={{ color: '#6366f1' }}>{filtered.length}</strong> of {courses.length} courses
          </span>
        </div>
      </div>

      {/* Course List — Horizontal */}
      <div style={{ maxWidth: 1000, margin: '28px auto 60px', padding: '0 24px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <p style={{ fontSize: 18, margin: 0 }}>No courses available yet.</p>
            <p style={{ fontSize: 14, marginTop: 8, color: '#c4b5fd' }}>The admin will add courses soon.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((course, index) => {
              const levelStyle = LEVEL_COLORS[course.level] || { bg: '#f3f4f6', color: '#6b7280' };
              return (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    style={{
                      background: '#fff',
                      border: '1.5px solid #e5e7eb',
                      borderRadius: 18,
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 20,
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#6366f1';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.12)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 52, height: 52, flexShrink: 0,
                      background: 'linear-gradient(135deg, #eef2ff, #ede9fe)',
                      borderRadius: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24,
                    }}>
                      {courseIcons[index % courseIcons.length]}
                    </div>

                    {/* Course info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{
                          fontFamily: 'monospace', fontWeight: 700,
                          color: '#6366f1', fontSize: 13,
                          background: '#eef2ff', padding: '2px 8px', borderRadius: 6,
                        }}>
                          {course.code}
                        </span>
                        {course.level && (
                          <span style={{
                            fontSize: 11, fontWeight: 700,
                            background: levelStyle.bg, color: levelStyle.color,
                            padding: '2px 10px', borderRadius: 20,
                          }}>
                            {course.level}
                          </span>
                        )}
                      </div>
                      <h3 style={{
                        fontWeight: 700, color: '#1f2937',
                        fontSize: '1rem', margin: 0,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {course.title}
                      </h3>
                    </div>

                    {/* Stats */}
                    <div style={{
                      display: 'flex', gap: 20, flexShrink: 0,
                      fontSize: 13, color: '#9ca3af',
                    }}>
                      <span>❓ {course.question_count || 0}</span>
                      <span>📝 {course.quiz_count || 0}</span>
                    </div>

                    {/* Arrow */}
                    <div style={{
                      width: 32, height: 32, flexShrink: 0,
                      background: '#f3f4f6', borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#6366f1', fontSize: 16, fontWeight: 700,
                    }}>
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