// src/components/TakeQuizPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function TakeQuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.get(`/quizzes/${id}`)
      .then(res => {
        setQuiz(res.data.quiz);
        setQuestions(res.data.questions || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleAnswer = (questionIndex, answer) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answersArray = questions.map((_, i) => answers[i] || '');
      const res = await api.post(`/quizzes/${id}/submit`, { answers: answersArray });
      setResult(res.data.result);
      setSubmitted(true);
      setCurrent(0);
    } catch {
      alert('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #ddd6fe', borderTop: '4px solid #4c1d95', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!quiz) return (
    <div style={{ textAlign: 'center', padding: '80px 20px', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
      <p style={{ color: '#6b7280', fontSize: 18 }}>Quiz not found.</p>
      <button onClick={() => navigate('/quizzes')} style={{ marginTop: 16, padding: '10px 24px', background: '#4c1d95', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700 }}>
        Back to Quizzes
      </button>
    </div>
  );

  // ── No questions ──
  if (questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: "'Segoe UI', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', background: '#fff', borderRadius: 20, padding: '60px 40px', boxShadow: '0 8px 40px rgba(76,29,149,0.1)', border: '1.5px solid #ede9fe', maxWidth: 480 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1e1b4b', marginBottom: 8 }}>{quiz.title}</h2>
          <p style={{ color: '#9ca3af', marginBottom: 24 }}>No questions have been added to this quiz yet.</p>
          <button onClick={() => navigate('/quizzes')} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #4c1d95, #1e40af)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // ── Results Screen (shown AFTER submission) ──
  if (submitted && result) {
    const perc = result.percentage;
    const getPerf = () => {
      if (perc >= 85) return { label: 'Excellent! 🏆', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
      if (perc >= 70) return { label: 'Good Job! 👍', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
      if (perc >= 50) return { label: 'Average 📚', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
      return { label: 'Needs Improvement 💪', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
    };
    const perf = getPerf();

    return (
      <div style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: "'Segoe UI', sans-serif", padding: '40px 24px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* Score card */}
          <div style={{ background: '#fff', borderRadius: 24, padding: '48px 40px', textAlign: 'center', boxShadow: '0 8px 40px rgba(76,29,149,0.12)', border: '1.5px solid #ede9fe', marginBottom: 24 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>{perc >= 70 ? '🎉' : perc >= 50 ? '📚' : '💪'}</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e1b4b', marginBottom: 6 }}>Quiz Complete!</h1>
            <p style={{ color: '#6b7280', marginBottom: 28, fontSize: 15 }}>{quiz.title}</p>
            <div style={{ fontSize: 72, fontWeight: 800, color: '#4c1d95', marginBottom: 8 }}>{perc}%</div>
            <p style={{ color: '#6b7280', fontSize: 16, marginBottom: 20 }}>{result.score} out of {result.total} correct</p>
            <div style={{ display: 'inline-block', background: perf.bg, color: perf.color, border: `1px solid ${perf.border}`, padding: '8px 24px', borderRadius: 20, fontWeight: 700, fontSize: 15 }}>
              {perf.label}
            </div>
          </div>

          {/* Question Review — NOW showing correct answers since quiz is done */}
          {result.detailedResults && result.detailedResults.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(76,29,149,0.08)', border: '1.5px solid #ede9fe', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e1b4b', marginBottom: 20 }}>
                📋 Question Review
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {result.detailedResults.map((item, i) => (
                  <div key={i} style={{
                    background: item.isCorrect ? '#f0fdf4' : item.type === 'structural' ? '#f8f7ff' : '#fef2f2',
                    border: `1px solid ${item.isCorrect ? '#bbf7d0' : item.type === 'structural' ? '#ede9fe' : '#fecaca'}`,
                    borderRadius: 12, padding: '16px 18px',
                  }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>
                        {item.type === 'structural' ? '📝' : item.isCorrect ? '✅' : '❌'}
                      </span>
                      <p style={{ fontWeight: 600, color: '#1e1b4b', margin: 0, fontSize: 14 }}>
                        Q{i + 1}: {item.question}
                      </p>
                    </div>

                    {item.type === 'mcq' && (
                      <div style={{ paddingLeft: 28 }}>
                        <p style={{ margin: '0 0 4px', fontSize: 13, color: '#6b7280' }}>
                          Your answer: <strong style={{ color: item.isCorrect ? '#16a34a' : '#dc2626' }}>{item.userAnswer || 'Not answered'}</strong>
                        </p>
                        {!item.isCorrect && (
                          <p style={{ margin: 0, fontSize: 13, color: '#16a34a' }}>
                            ✅ Correct answer: <strong>{item.correctAnswer}</strong>
                          </p>
                        )}
                      </div>
                    )}

                    {item.type === 'structural' && (
                      <div style={{ paddingLeft: 28 }}>
                        <p style={{ margin: '0 0 4px', fontSize: 13, color: '#374151', fontStyle: 'italic' }}>
                          Your answer: {item.userAnswer || 'Not answered'}
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>
                          Structural answers are reviewed manually by the admin.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => navigate('/quizzes')} style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #4c1d95, #1e40af)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 16px rgba(76,29,149,0.3)' }}>
              Try Another Quiz
            </button>
            <button onClick={() => navigate('/performance')} style={{ padding: '12px 28px', background: '#f5f3ff', color: '#4c1d95', border: '1.5px solid #ddd6fe', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              View Performance
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz Taking Screen ──
  const q = questions[current];
  const answered = Object.keys(answers).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7ff', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #3b0764, #4c1d95, #1e40af)', padding: '24px 32px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>{quiz.title}</h1>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: '4px 0 0' }}>
                Question {current + 1} of {questions.length}
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 600 }}>
              {answered}/{questions.length} answered
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, height: 6 }}>
            <div style={{ height: 6, background: '#c4b5fd', borderRadius: 8, width: `${((current + 1) / questions.length) * 100}%`, transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Question */}
      <div style={{ maxWidth: 760, margin: '32px auto', padding: '0 24px 80px' }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '32px 36px', boxShadow: '0 8px 32px rgba(76,29,149,0.1)', border: '1.5px solid #ede9fe', marginBottom: 20 }}>

          {/* Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #4c1d95, #1e40af)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
              {current + 1}
            </div>
            <span style={{ fontSize: 12, color: q.question_type === 'structural' ? '#1e40af' : '#7c3aed', fontWeight: 700, background: q.question_type === 'structural' ? '#eff6ff' : '#ede9fe', padding: '3px 10px', borderRadius: 20 }}>
              {q.question_type === 'structural' ? '📝 Structural Question' : '🔘 Multiple Choice'}
            </span>
          </div>

          <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#1e1b4b', marginBottom: 28, fontWeight: 500 }}>
            {q.question_text}
          </p>

          {/* MCQ Options — no correct answer shown during quiz */}
          {q.question_type === 'mcq' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['A', 'B', 'C', 'D'].map(opt => {
                const optText = q[`option_${opt.toLowerCase()}`];
                if (!optText) return null;
                const isSelected = answers[current] === opt;
                return (
                  <button key={opt} onClick={() => handleAnswer(current, opt)} style={{
                    padding: '14px 20px', borderRadius: 12, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                    background: isSelected ? 'linear-gradient(135deg, #ede9fe, #dbeafe)' : '#f8f7ff',
                    border: isSelected ? '2px solid #4c1d95' : '1.5px solid #ede9fe',
                    transition: 'all 0.2s', fontFamily: 'inherit', width: '100%',
                    boxShadow: isSelected ? '0 4px 16px rgba(76,29,149,0.15)' : 'none',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#a78bfa'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = '#ede9fe'; }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: isSelected ? 'linear-gradient(135deg, #4c1d95, #1e40af)' : '#ede9fe', color: isSelected ? '#fff' : '#4c1d95', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                      {opt}
                    </div>
                    <span style={{ fontSize: 15, color: '#1e1b4b', fontWeight: isSelected ? 600 : 400 }}>{optText}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Structural */}
          {q.question_type === 'structural' && (
            <textarea
              placeholder="Type your answer here..."
              value={answers[current] || ''}
              onChange={e => handleAnswer(current, e.target.value)}
              style={{ width: '100%', minHeight: 160, padding: '14px 16px', borderRadius: 12, border: '1.5px solid #ddd6fe', fontSize: 15, outline: 'none', resize: 'vertical', fontFamily: 'inherit', color: '#1e1b4b', background: '#faf9ff', boxSizing: 'border-box', lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = '#4c1d95'}
              onBlur={e => e.target.style.borderColor = '#ddd6fe'}
            />
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0} style={{ padding: '12px 24px', borderRadius: 12, border: '1.5px solid #ddd6fe', background: '#fff', color: current === 0 ? '#d1d5db' : '#4c1d95', fontWeight: 700, fontSize: 14, cursor: current === 0 ? 'not-allowed' : 'pointer' }}>
            ← Previous
          </button>

          {/* Question dots */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {questions.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', background: i === current ? '#4c1d95' : answers[i] ? '#a78bfa' : '#ede9fe', color: i === current || answers[i] ? '#fff' : '#6b7280', fontWeight: 700, fontSize: 12, transition: 'all 0.2s' }}>
                {i + 1}
              </button>
            ))}
          </div>

          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent(current + 1)} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #4c1d95, #1e40af)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(76,29,149,0.3)' }}>
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: submitting ? '#c4b5fd' : 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
              {submitting ? 'Submitting...' : '✅ Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}