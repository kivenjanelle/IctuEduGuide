// src/components/QuizPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getCourses, getQuizzesByCourse, getQuiz, submitQuiz } from '../utils/api';

const courseIcons = ['💻','📐','🗄️','🌐','🔒','🤖','⚙️','📡','📊','🔬','📘','🧮','🖥️','📱','🔧','📝','🧠','🌍','☕','🐍'];

const THEME = {
  primary: 'linear-gradient(135deg, #3b0764, #4c1d95, #1e40af)',
  accent: '#4c1d95',
  bg: '#f8f7ff',
  white: '#fff',
  text: '#1e1b4b',
  muted: '#6b7280',
  lavender: '#ede9fe',
  lavenderBorder: '#ddd6fe',
};

// ── Normalise quiz list — handles { quizzes:[] }, { data:[] }, or plain array ──
function normaliseQuizList(data) {
  return data.quizzes || data.data || (Array.isArray(data) ? data : []);
}

// ── Normalise single quiz detail — handles nested or flat question arrays ──
function normaliseQuizDetail(data) {
  const quiz = data.quiz || data;
  const questions = quiz.questions || data.questions || [];
  return { quiz, questions };
}

// ── Quiz Taker ─────────────────────────────────────────────
function QuizTaker({ quiz, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setFetchError(false);
    getQuiz(quiz.id)
      .then(res => { const { questions: qs } = normaliseQuizDetail(res.data);
        return qs; })
      .then(qs => {
        setQuestions(qs);
        setLoading(false);
      })
      .catch(() => {
        setFetchError(true);
        setLoading(false);
      });
  }, [quiz.id]);

  const handleMCQAnswer = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleTextAnswer = (questionId, text) => {
    setAnswers(prev => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answersArray = questions.map(q => answers[q.id] ?? null);

      const res = await submitQuiz(quiz.id, answersArray);
      const data = res.data;

      if (data.result) {
        const enriched = (data.result.detailedResults || []).map((r, i) => ({
          ...r,
          ...questions[i],
          userAnswer: answers[questions[i]?.id] ?? null,
        }));
        setResults({ ...data.result, detailedResults: enriched });
      } else {
        scoreLocally();
      }
      setSubmitted(true);
    } catch {
      scoreLocally();
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  const scoreLocally = () => {
    let score = 0;
    const detailedResults = questions.map(q => {
      const userAns = answers[q.id] ?? null;
      const isMCQ = q.question_type === 'mcq';
      const isCorrect = isMCQ ? userAns?.toUpperCase() === q.correct_option?.toUpperCase() : null;
      if (isCorrect) score++;
      return { ...q, userAnswer: userAns, correctOption: q.correct_option, isCorrect, model_answer: q.model_answer };
    });
    const mcqCount = questions.filter(q => q.question_type === 'mcq').length;
    const pct = mcqCount > 0 ? Math.round((score / mcqCount) * 100) : null;
    setResults({ score, total: mcqCount, percentage: pct, detailedResults });
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 16 }}>
      <div style={{ width: 48, height: 48, border: '4px solid #ddd6fe', borderTop: '4px solid #4c1d95', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: THEME.muted }}>Loading quiz...</p>
    </div>
  );

  if (fetchError) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>⚠️</div>
      <h3 style={{ color: THEME.text, fontWeight: 700, marginBottom: 8 }}>Could Not Load Quiz</h3>
      <p style={{ color: THEME.muted, marginBottom: 28 }}>There was a network error. Please try again.</p>
      <button onClick={onBack} style={{ padding: '11px 28px', background: THEME.primary, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700 }}>← Back</button>
    </div>
  );

  if (questions.length === 0) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>📭</div>
      <h3 style={{ color: THEME.text, fontWeight: 700, marginBottom: 8 }}>{quiz.title}</h3>
      <p style={{ color: THEME.muted, marginBottom: 6 }}>No questions have been added to this quiz yet.</p>
      <p style={{ color: '#a78bfa', fontSize: 13, marginBottom: 28 }}>Check back soon — the admin will add questions.</p>
      <button onClick={onBack} style={{ padding: '11px 28px', background: THEME.primary, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700 }}>← Back</button>
    </div>
  );

  // ── Results Screen ──
  if (submitted && results) {
    const hasMCQ = results.detailedResults?.some(r => r.question_type === 'mcq');
    const pct = results.percentage;

    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ background: THEME.primary, borderRadius: 24, padding: '40px 32px', textAlign: 'center', marginBottom: 32, color: '#fff' }}>
          <div style={{ fontSize: 56, marginBottom: 10 }}>
            {pct === null ? '📝' : pct >= 70 ? '🏆' : pct >= 50 ? '👍' : '📚'}
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px' }}>Quiz Complete!</h2>
          <p style={{ opacity: 0.7, margin: '0 0 16px' }}>{quiz.title}</p>
          {pct !== null && (
            <>
              <div style={{ fontSize: 52, fontWeight: 800 }}>{pct}%</div>
              <div style={{ opacity: 0.8, marginTop: 4 }}>{results.score} / {results.total} marks</div>
              <div style={{ marginTop: 10, fontSize: 14, opacity: 0.7 }}>
                {pct >= 70 ? '🎉 Well done! You passed.' : pct >= 50 ? 'Good effort — keep practising!' : '📖 Review the material and try again.'}
              </div>
            </>
          )}
        </div>

        <h3 style={{ fontWeight: 700, color: THEME.text, marginBottom: 16 }}>Review Answers</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(results.detailedResults || []).map((r, i) => {
            const isMCQ = r.question_type === 'mcq';
            const isCorrect = r.isCorrect;
            const userAns = r.userAnswer;
            const earnedMarks = r.earnedMarks ?? (isCorrect ? (r.marks || 1) : 0);
            const totalQuestionMarks = r.marks || 1;
            return (
              <div key={i} style={{
                background: THEME.white, borderRadius: 16, padding: '20px 24px',
                border: `1.5px solid ${isMCQ ? (isCorrect ? '#bbf7d0' : '#fecaca') : '#fde68a'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: THEME.muted }}>Q{i + 1}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      background: isMCQ ? '#eff6ff' : '#fef3c7',
                      color: isMCQ ? '#1e40af' : '#92400e',
                    }}>{isMCQ ? 'MCQ' : 'Structural'}</span>
                  </div>
                  <span style={{
                    background: isCorrect ? '#f0fdf4' : '#fef2f2',
                    color: isCorrect ? '#15803d' : '#dc2626',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 8,
                  }}>
                    {earnedMarks} / {totalQuestionMarks} marks
                  </span>
                </div>

                <p style={{ fontWeight: 600, color: THEME.text, margin: '0 0 12px', lineHeight: 1.5 }}>{r.question_text}</p>

                {isMCQ && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {['a','b','c','d'].map(opt => {
                      const optText = r[`option_${opt}`];
                      if (!optText) return null;
                      const optLetter = opt.toUpperCase();
                      const isUserAnswer = userAns?.toUpperCase() === optLetter;
                      const isCorrectAnswer = r.correct_option?.toUpperCase() === optLetter || r.correctOption?.toUpperCase() === optLetter;
                      return (
                        <div key={opt} style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 10,
                          border: `1.5px solid ${isCorrectAnswer ? '#bbf7d0' : isUserAnswer ? '#fecaca' : '#f3f4f6'}`,
                          background: isCorrectAnswer ? '#f0fdf4' : isUserAnswer ? '#fef2f2' : '#fafafa',
                        }}>
                          <span style={{ fontWeight: 800, fontSize: 13, color: isCorrectAnswer ? '#16a34a' : isUserAnswer ? '#dc2626' : '#9ca3af', width: 16 }}>{optLetter}</span>
                          <span style={{ fontSize: 14, color: THEME.text, flex: 1 }}>{optText}</span>
                          {isCorrectAnswer && <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>✓ Correct</span>}
                          {isUserAnswer && !isCorrectAnswer && <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 700 }}>✗ Your answer</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {!isMCQ && (
                  <>
                    <div style={{ fontSize: 13, color: THEME.muted, marginBottom: 8 }}>
                      <strong>Your answer:</strong> {userAns || <em>No answer given</em>}
                    </div>
                    {(r.model_answer || r.modelAnswer) && (
                      <div style={{ background: THEME.lavender, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#4c1d95' }}>
                        <strong>Model answer:</strong> {r.model_answer || r.modelAnswer}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={onBack} style={{ marginTop: 28, width: '100%', padding: '14px', background: THEME.primary, border: 'none', borderRadius: 14, color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
          ← Back to Quizzes
        </button>
      </div>
    );
  }

  // ── Active Quiz ──
  const q = questions[current];
  const totalAnswered = Object.keys(answers).length;
  const progress = ((current + 1) / questions.length) * 100;
  const userAnswer = answers[q.id];

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#4c1d95', fontWeight: 700, cursor: 'pointer', fontSize: 14, padding: 0, marginBottom: 14 }}>← Back to Quizzes</button>
        <h2 style={{ fontWeight: 800, color: THEME.text, fontSize: 20, margin: '0 0 4px' }}>{quiz.title}</h2>
        <div style={{ display: 'flex', gap: 16, fontSize: 13, color: THEME.muted }}>
          <span>Question {current + 1} of {questions.length}</span>
          <span>{totalAnswered} answered</span>
        </div>
        <div style={{ height: 6, background: '#e0e7ff', borderRadius: 10, marginTop: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #4c1d95, #1e40af)', borderRadius: 10, transition: 'width 0.3s' }} />
        </div>
      </div>

      <div style={{ background: THEME.white, borderRadius: 20, padding: '28px', border: `1.5px solid ${THEME.lavenderBorder}`, boxShadow: '0 4px 24px rgba(76,29,149,0.08)', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{ background: THEME.lavender, color: '#4c1d95', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>Q{current + 1}</span>
          <span style={{
            padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: q.question_type === 'mcq' ? '#eff6ff' : '#fef3c7',
            color: q.question_type === 'mcq' ? '#1e40af' : '#92400e',
          }}>
            {q.question_type === 'mcq' ? '🔘 Multiple Choice' : '✍️ Structural'}
          </span>
          <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
            {q.marks || 1} mark{(q.marks || 1) !== 1 ? 's' : ''}
          </span>
        </div>

        <p style={{ fontWeight: 600, color: THEME.text, fontSize: 17, lineHeight: 1.6, margin: '0 0 22px' }}>{q.question_text}</p>

        {q.question_type === 'mcq' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['a','b','c','d'].map(opt => {
              const optText = q[`option_${opt}`];
              if (!optText) return null;
              const optLetter = opt.toUpperCase();
              const selected = userAnswer === optLetter;
              return (
                <button key={opt} onClick={() => handleMCQAnswer(q.id, optLetter)} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12,
                  border: `2px solid ${selected ? '#4c1d95' : THEME.lavenderBorder}`,
                  background: selected ? THEME.lavender : THEME.white,
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: selected ? '#4c1d95' : '#f3f4f6',
                    color: selected ? '#fff' : '#6b7280',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14,
                  }}>{optLetter}</div>
                  <span style={{ color: THEME.text, fontWeight: selected ? 600 : 400, fontSize: 15 }}>{optText}</span>
                </button>
              );
            })}
          </div>
        )}

        {q.question_type === 'structural' && (
          <>
            <p style={{ fontSize: 13, color: THEME.muted, marginBottom: 10 }}>Write your answer below. Model answer will be shown after you submit.</p>
            <textarea
              value={userAnswer || ''}
              onChange={e => handleTextAnswer(q.id, e.target.value)}
              placeholder="Write your answer here..."
              style={{
                width: '100%', minHeight: 160, padding: '14px 16px', borderRadius: 12,
                border: `1.5px solid ${THEME.lavenderBorder}`, fontSize: 14,
                fontFamily: 'inherit', color: THEME.text, outline: 'none',
                resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6,
              }}
              onFocus={e => e.target.style.borderColor = '#4c1d95'}
              onBlur={e => e.target.style.borderColor = THEME.lavenderBorder}
            />
          </>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} style={{
          padding: '12px 24px', borderRadius: 12, border: `1.5px solid ${THEME.lavenderBorder}`,
          background: current === 0 ? '#f3f4f6' : THEME.white, color: current === 0 ? '#9ca3af' : THEME.text,
          fontWeight: 700, cursor: current === 0 ? 'not-allowed' : 'pointer', fontSize: 14,
        }}>← Previous</button>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', flex: 1 }}>
          {questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} title={`Q${i + 1}`} style={{
              width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
              background: i === current ? '#4c1d95' : answers[questions[i]?.id] ? '#a78bfa' : '#ddd6fe',
            }} />
          ))}
        </div>

        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} style={{
            padding: '12px 24px', borderRadius: 12,
            background: 'linear-gradient(135deg, #4c1d95, #1e40af)',
            border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14,
          }}>Next →</button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting} style={{
            padding: '12px 24px', borderRadius: 12,
            background: submitting ? '#e5e7eb' : 'linear-gradient(135deg, #16a34a, #15803d)',
            border: 'none', color: submitting ? '#9ca3af' : '#fff',
            fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 14,
          }}>{submitting ? 'Submitting...' : 'Submit Quiz ✓'}</button>
        )}
      </div>
    </div>
  );
}

// ── Main Quiz List Page ────────────────────────────────────
export default function QuizzesPage() {
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [searchParams] = useSearchParams();
  const selectedCourseId = searchParams.get('course');
  const navigate = useNavigate();

  // Load courses once
  useEffect(() => {
    getCourses()
      .then(res => setCourses(res.data.courses || res.data || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  // Load quizzes whenever the selected course changes
  // Uses api.js → GET /quizzes/course/:courseId
  useEffect(() => {
    if (!selectedCourseId) {
      setQuizzes([]);
      return;
    }
    setQuizzesLoading(true);
    getQuizzesByCourse(selectedCourseId)
      .then(res => setQuizzes(normaliseQuizList(res.data)))
      .catch(() => setQuizzes([]))
      .finally(() => setQuizzesLoading(false));
  }, [selectedCourseId]);

  const selectedCourse = courses.find(c => String(c.id) === String(selectedCourseId));

  if (activeQuiz) {
    return (
      <div style={{ minHeight: '100vh', background: THEME.bg, fontFamily: "'Segoe UI', sans-serif" }}>
        <QuizTaker quiz={activeQuiz} onBack={() => setActiveQuiz(null)} />
      </div>
    );
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ width: 48, height: 48, border: '4px solid #ddd6fe', borderTop: '4px solid #4c1d95', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: THEME.bg, fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: THEME.primary, padding: '48px 32px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(167,139,250,0.1)', top: -80, left: -60, filter: 'blur(40px)' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {selectedCourseId && (
            <button onClick={() => navigate('/quizzes')} style={{
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', borderRadius: 10, padding: '8px 18px', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>← All Courses</button>
          )}
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            📝 {selectedCourse ? selectedCourse.title : 'Available Quizzes'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem' }}>
            {selectedCourseId
              ? quizzesLoading
                ? 'Loading quizzes…'
                : `${quizzes.length} quiz${quizzes.length !== 1 ? 'zes' : ''} available · Select one and click Start Quiz`
              : 'Choose a course to see its quizzes'}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '-24px auto 0', padding: '0 24px 60px', position: 'relative', zIndex: 2 }}>

        {/* Course selection */}
        {!selectedCourseId && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 8px 32px rgba(76,29,149,0.1)', border: '1.5px solid #ede9fe' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: THEME.text, marginBottom: 20 }}>Select a Course</h2>
            {courses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p>No courses available yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {courses.map((course, index) => (
                  <div key={course.id} onClick={() => navigate(`/quizzes?course=${course.id}`)} style={{
                    background: '#f8f7ff', border: '1.5px solid #ede9fe', borderRadius: 14,
                    padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#4c1d95'; e.currentTarget.style.background = '#ede9fe'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#ede9fe'; e.currentTarget.style.background = '#f8f7ff'; }}>
                    <div style={{ width: 42, height: 42, flexShrink: 0, background: 'linear-gradient(135deg, #ede9fe, #dbeafe)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {courseIcons[index % courseIcons.length]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: THEME.text, fontSize: 15 }}>{course.title}</div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{course.code}{course.level ? ` · ${course.level}` : ''}</div>
                    </div>
                    <div style={{ color: '#4c1d95', fontSize: 18, fontWeight: 700 }}>→</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quiz list */}
        {selectedCourseId && (
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 8px 32px rgba(76,29,149,0.1)', border: '1.5px solid #ede9fe' }}>
            {quizzesLoading ? (
              /* FIX: Show a loading spinner while quizzes are being fetched, not "no quizzes" */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: 16 }}>
                <div style={{ width: 40, height: 40, border: '4px solid #ddd6fe', borderTop: '4px solid #4c1d95', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <p style={{ color: THEME.muted }}>Loading quizzes…</p>
              </div>
            ) : quizzes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <p style={{ color: '#9ca3af', fontSize: 18, margin: 0 }}>No quizzes available yet for this course.</p>
                <p style={{ color: '#a78bfa', fontSize: 14, marginTop: 8 }}>Check back later!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {quizzes.map(quiz => (
                  <div key={quiz.id} style={{
                    background: '#f8f7ff', border: '1.5px solid #ede9fe', borderRadius: 16,
                    padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#4c1d95'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(76,29,149,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#ede9fe'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <div style={{ width: 52, height: 52, flexShrink: 0, background: THEME.primary, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📝</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: 700, color: THEME.text, fontSize: 17, margin: '0 0 4px' }}>{quiz.title}</h3>
                      {quiz.description && <p style={{ color: THEME.muted, fontSize: 13, margin: '0 0 6px' }}>{quiz.description}</p>}
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, background: THEME.lavender, color: '#4c1d95', padding: '2px 10px', borderRadius: 6, fontWeight: 600 }}>
                          📋 {quiz.question_count ?? '?'} question{quiz.question_count !== 1 ? 's' : ''}
                        </span>
                        <span style={{ fontSize: 12, background: '#f0fdf4', color: '#16a34a', padding: '2px 10px', borderRadius: 6, fontWeight: 600 }}>✅ Available</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveQuiz(quiz)}
                      style={{
                        background: THEME.primary, color: '#fff', border: 'none',
                        borderRadius: 12, padding: '13px 26px', fontWeight: 700, fontSize: 15,
                        cursor: 'pointer', flexShrink: 0,
                        boxShadow: '0 4px 14px rgba(76,29,149,0.4)',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(76,29,149,0.55)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(76,29,149,0.4)'; }}
                    >Start Quiz →</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
