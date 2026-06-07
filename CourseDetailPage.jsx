// src/components/CourseDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourse, getCourseQuestions } from '../utils/api';

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState('All');

  useEffect(() => {
    Promise.all([getCourse(id), getCourseQuestions(id)])
      .then(([courseRes, questionsRes]) => {
        setCourse(courseRes.data.course || courseRes.data);
        setQuestions(questionsRes.data.questions || questionsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const years = ['All', ...new Set(questions.map(q => q.year).filter(Boolean))].sort().reverse();
  const filteredQuestions = filterYear === 'All'
    ? questions
    : questions.filter(q => String(q.year) === String(filterYear));

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{
          width: 48, height: 48,
          border: '4px solid #e0e7ff',
          borderTop: '4px solid #6366f1',
          borderRadius: '50%',
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
        background: 'linear-gradient(135deg, #1e1b4b, #4c1d95)',
        padding: '48px 32px',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <button
            onClick={() => navigate('/courses')}
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', borderRadius: 10,
              padding: '8px 18px', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, marginBottom: 28,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            ← Back to Courses
          </button>

          {course && (
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                {course.code && (
                  <span style={{
                    background: 'rgba(255,255,255,0.15)', color: '#fff',
                    padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  }}>{course.code}</span>
                )}
                {course.level && (
                  <span style={{
                    background: 'rgba(255,255,255,0.15)', color: '#fff',
                    padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                  }}>{course.level}</span>
                )}
              </div>
              <h1 style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                fontWeight: 800, color: '#fff', marginBottom: 10,
              }}>
                {course.title}
              </h1>
              {course.description && (
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', lineHeight: 1.6 }}>
                  {course.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 60px' }}>

        {/* Top bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12,
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
            Past Questions ({filteredQuestions.length})
          </h2>
          <Link
            to={`/quizzes?course=${id}`}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', padding: '10px 22px',
              borderRadius: 12, fontWeight: 700,
              fontSize: 14, textDecoration: 'none',
            }}
          >
            📝 Take Quiz
          </Link>
        </div>

        {/* Year filter */}
        {years.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
            {years.map(year => (
              <button
                key={year}
                onClick={() => setFilterYear(year)}
                style={{
                  padding: '7px 18px', borderRadius: 10, border: 'none',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  background: filterYear === year ? '#6366f1' : '#fff',
                  color: filterYear === year ? '#fff' : '#6b7280',
                  border: filterYear === year ? 'none' : '1px solid #e5e7eb',
                  transition: 'all 0.2s',
                }}
              >
                {year}
              </button>
            ))}
          </div>
        )}

        {/* Questions */}
        {filteredQuestions.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            background: '#fff', borderRadius: 20,
            border: '1.5px dashed #e5e7eb',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <p style={{ color: '#9ca3af', fontSize: 18, margin: 0 }}>
              No past questions available yet for this course.
            </p>
            <p style={{ color: '#c4b5fd', fontSize: 14, marginTop: 8 }}>
              Check back later — the admin will add questions soon.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredQuestions.map((q, index) => (
              <QuestionItem key={q.id} question={q} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Question Item ──────────────────────────────────────────
function QuestionItem({ question, index }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid #e5e7eb',
      borderRadius: 18,
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Question body */}
      <div style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

          {/* Number badge */}
          <div style={{
            width: 40, height: 40, flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 15,
          }}>
            {index + 1}
          </div>

          <div style={{ flex: 1 }}>
            {/* Year badge */}
            {question.year && (
              <span style={{
                display: 'inline-block',
                background: '#fef3c7', color: '#92400e',
                padding: '3px 12px', borderRadius: 20,
                fontSize: 12, fontWeight: 600, marginBottom: 10,
              }}>
                📅 {question.year}
              </span>
            )}

            {/* Question text */}
            <p style={{
              fontSize: '1rem', lineHeight: 1.7,
              color: '#1f2937', margin: 0,
            }}>
              {question.question_text}
            </p>
          </div>
        </div>
      </div>

      {/* Click to see answer box */}
      <div
        onClick={() => question.answer_text && setShowAnswer(!showAnswer)}
        style={{
          borderTop: '1.5px solid #f3f4f6',
          padding: '14px 28px',
          background: showAnswer ? '#f0fdf4' : '#fafafa',
          cursor: question.answer_text ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'background 0.2s',
          userSelect: 'none',
        }}
        onMouseEnter={e => { if (question.answer_text) e.currentTarget.style.background = showAnswer ? '#dcfce7' : '#f3f4f6'; }}
        onMouseLeave={e => { e.currentTarget.style.background = showAnswer ? '#f0fdf4' : '#fafafa'; }}
      >
        {question.answer_text ? (
          <>
            <span style={{
              fontSize: 13, fontWeight: 700,
              color: showAnswer ? '#16a34a' : '#6366f1',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              {showAnswer ? '🙈 Hide Answer' : '💡 Click to see answer'}
            </span>
            <span style={{
              fontSize: 18,
              color: showAnswer ? '#16a34a' : '#6366f1',
              transition: 'transform 0.2s',
              transform: showAnswer ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▾
            </span>
          </>
        ) : (
          <span style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>
            Answer will be added soon by admin.
          </span>
        )}
      </div>

      {/* Answer revealed */}
      {showAnswer && question.answer_text && (
        <div style={{
          padding: '20px 28px 24px',
          background: '#f0fdf4',
          borderTop: '1px solid #bbf7d0',
          animation: 'fadeIn 0.2s ease',
        }}>
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>

          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>✅</span>
            <div>
              <div style={{ fontWeight: 700, color: '#15803d', marginBottom: 6, fontSize: 14 }}>
                Correct Answer
              </div>
              <p style={{ color: '#1f2937', lineHeight: 1.7, margin: 0, fontSize: '0.97rem' }}>
                {question.answer_text}
              </p>

              {question.explanation && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #bbf7d0' }}>
                  <div style={{ fontWeight: 700, color: '#15803d', marginBottom: 6, fontSize: 14 }}>
                    📖 Explanation
                  </div>
                  <p style={{ color: '#374151', lineHeight: 1.7, margin: 0, fontSize: '0.93rem' }}>
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}