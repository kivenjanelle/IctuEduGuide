// src/components/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { getCourses, getAllQuizzes, getQuiz, createQuiz, deleteQuiz, updateQuiz } from '../utils/api';

const TABS = [
  { key: 'overview',    label: 'Overview',     icon: '🏠' },
  { key: 'addCourse',   label: 'Add Course',   icon: '📚' },
  { key: 'viewCourses', label: 'View Courses', icon: '🗂️' },
  { key: 'bulk',        label: 'Bulk Upload',  icon: '📂' },
  { key: 'quiz',        label: 'Add Quiz',     icon: '📝' },
  { key: 'viewQuizzes', label: 'View Quizzes', icon: '🎯' },
];

const THEME = {
  sidebar: 'linear-gradient(160deg, #3b0764 0%, #4c1d95 60%, #1e40af 100%)',
  primary: 'linear-gradient(135deg, #4c1d95, #1e40af)',
  accent: '#7c3aed',
  lavender: '#ede9fe',
  lavenderBorder: '#ddd6fe',
  white: '#fff',
  bg: '#f8f7ff',
  text: '#1e1b4b',
  muted: '#6b7280',
};

const blankMCQ = () => ({
  question_type: 'mcq',
  question_text: '',
  option_a: '', option_b: '', option_c: '', option_d: '',
  correct_option: 'A',
  marks: 1,
});

const blankStructural = () => ({
  question_type: 'structural',
  question_text: '',
  model_answer: '',
  marks: 5,
});

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courseForm, setCourseForm] = useState({ title: '', code: '', level: '', credits: 3 });
  const [allQuizzes, setAllQuizzes] = useState([]);

  // Quiz builder state
  const [quizCourse, setQuizCourse] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Edit quiz modal state
  const [editingQuiz, setEditingQuiz] = useState(null); // { id, title, description, course_id, questions }
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadCourses = () => {
    getCourses()
      .then(res => setCourses(res.data.courses || res.data || []))
      .catch(() => setCourses([]));
  };

  const loadQuizzes = () => {
    getAllQuizzes()
      .then(res => {
        const data = res.data;
        const list = data.quizzes || data.data || (Array.isArray(data) ? data : []);
        setAllQuizzes(list);
      })
      .catch(() => setAllQuizzes([]));
  };

  useEffect(() => { loadCourses(); loadQuizzes(); }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // ── Course submit ──
  const handleCourseSubmit = async () => {
    if (!courseForm.title || !courseForm.code) return showMessage('Title and Code are required.', 'error');
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(courseForm),
      });
      if (res.ok) {
        showMessage('✅ Course created successfully!');
        setCourseForm({ title: '', code: '', level: '', credits: 3 });
        loadCourses();
        setActiveTab('viewCourses');
      } else {
        const data = await res.json();
        showMessage(`❌ ${data.error || 'Failed to create course'}`, 'error');
      }
    } catch { showMessage('❌ Failed to create course', 'error'); }
  };

  // ── Add question ──
  const addQuestion = (type) => {
    setQuestions(prev => [...prev, type === 'mcq' ? blankMCQ() : blankStructural()]);
  };

  const removeQuestion = (i) => setQuestions(prev => prev.filter((_, idx) => idx !== i));

  const updateQuestion = (i, field, value) => {
    setQuestions(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  };

  // ── Quiz submit ──
  const handleQuizSubmit = async () => {
    if (!quizCourse) return showMessage('Please select a course.', 'error');
    if (!quizTitle.trim()) return showMessage('Please enter a quiz title.', 'error');
    if (questions.length === 0) return showMessage('Please add at least one question.', 'error');
    const invalid = questions.find(q => !q.question_text.trim());
    if (invalid) return showMessage('All questions must have question text.', 'error');
    const badMCQ = questions.find(q => q.question_type === 'mcq' && (!q.option_a.trim() || !q.option_b.trim()));
    if (badMCQ) return showMessage('MCQ questions need at least options A and B.', 'error');

    setSubmitting(true);
    try {
      const payload = {
        title: quizTitle.trim(),
        course_id: quizCourse,
        description: quizDescription.trim() || null,
        questions: questions.map(q => ({
          question_type: q.question_type,
          question_text: q.question_text,
          marks: q.marks,
          option_a: q.option_a || null,
          option_b: q.option_b || null,
          option_c: q.option_c || null,
          option_d: q.option_d || null,
          correct_option: q.correct_option || null,
          model_answer: q.model_answer || null,
        })),
      };
      await createQuiz(payload);
      showMessage(`✅ Quiz "${quizTitle.trim()}" created with ${questions.length} question(s)! Students can now take it.`);
      setQuizCourse(''); setQuizTitle(''); setQuizDescription(''); setQuestions([]);
      loadQuizzes();
      setActiveTab('viewQuizzes');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to create quiz — check your backend/database.';
      showMessage(`❌ ${msg}`, 'error');
    }
    setSubmitting(false);
  };

  // ── Delete quiz ──
  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz? This cannot be undone.')) return;
    setDeletingId(quizId);
    try {
      await deleteQuiz(quizId);
      showMessage('🗑️ Quiz deleted successfully.');
      loadQuizzes();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to delete quiz.';
      showMessage(`❌ ${msg}`, 'error');
    }
    setDeletingId(null);
  };

  // ── Open edit modal ──
  const handleOpenEdit = async (quiz) => {
    // Fetch full quiz details (including questions) for editing
    try {
      const res = await getQuiz(quiz.id);
      const data = res.data;
      const full = data.quiz || data;
      setEditingQuiz({
        id: full.id,
        title: full.title || '',
        description: full.description || '',
        course_id: String(full.course_id || ''),
        questions: (full.questions || []).map(q => ({ ...q })),
      });
    } catch {
      // Fallback: open with what we already have, no questions pre-loaded
      setEditingQuiz({
        id: quiz.id,
        title: quiz.title || '',
        description: quiz.description || '',
        course_id: String(quiz.course_id || ''),
        questions: [],
      });
    }
  };

  // ── Save edited quiz ──
  const handleEditSave = async () => {
    if (!editingQuiz.title.trim()) return showMessage('Quiz title is required.', 'error');
    if (!editingQuiz.course_id) return showMessage('Please select a course.', 'error');
    setEditSubmitting(true);
    try {
      const payload = {
        title: editingQuiz.title.trim(),
        description: editingQuiz.description.trim() || null,
        course_id: editingQuiz.course_id,
        questions: editingQuiz.questions.map(q => ({
          id: q.id,
          question_type: q.question_type,
          question_text: q.question_text,
          marks: q.marks,
          option_a: q.option_a || null,
          option_b: q.option_b || null,
          option_c: q.option_c || null,
          option_d: q.option_d || null,
          correct_option: q.correct_option || null,
          model_answer: q.model_answer || null,
        })),
      };
      await updateQuiz(editingQuiz.id, payload);
      showMessage('✅ Quiz updated successfully!');
      setEditingQuiz(null);
      loadQuizzes();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to update quiz.';
      showMessage(`❌ ${msg}`, 'error');
    }
    setEditSubmitting(false);
  };

  const updateEditQuestion = (i, field, value) => {
    setEditingQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, idx) => idx === i ? { ...q, [field]: value } : q),
    }));
  };

  const removeEditQuestion = (i) => {
    setEditingQuiz(prev => ({ ...prev, questions: prev.questions.filter((_, idx) => idx !== i) }));
  };

  const addEditQuestion = (type) => {
    setEditingQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, type === 'mcq' ? blankMCQ() : blankStructural()],
    }));
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: `1.5px solid ${THEME.lavenderBorder}`, fontSize: 14,
    outline: 'none', background: THEME.white, color: THEME.text,
    boxSizing: 'border-box', transition: 'border 0.2s', fontFamily: 'inherit',
  };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 };
  const cardStyle = {
    background: THEME.white, borderRadius: 20, padding: 28,
    border: `1.5px solid ${THEME.lavenderBorder}`,
    boxShadow: '0 4px 24px rgba(76,29,149,0.08)',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: THEME.bg, fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── Sidebar ── */}
      <div style={{
        width: sidebarOpen ? 256 : 68, background: THEME.sidebar, minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        padding: sidebarOpen ? '36px 16px' : '36px 8px',
        transition: 'width 0.3s ease, padding 0.3s ease',
        position: 'relative', flexShrink: 0,
        boxShadow: '4px 0 24px rgba(76,29,149,0.2)',
      }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
          position: 'absolute', top: 24, right: -14, width: 28, height: 28,
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', fontSize: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(124,58,237,0.5)', zIndex: 10,
        }}>{sidebarOpen ? '←' : '→'}</button>

        {sidebarOpen && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎓</div>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Admin Panel</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', paddingLeft: 46 }}>ICTU EduGuide</div>
          </div>
        )}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 12, border: 'none',
              background: activeTab === tab.key ? 'rgba(255,255,255,0.18)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'rgba(255,255,255,0.55)',
              cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s', textAlign: 'left',
              borderLeft: activeTab === tab.key ? '3px solid #c4b5fd' : '3px solid transparent',
            }}
            onMouseEnter={e => { if (activeTab !== tab.key) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}}
            onMouseLeave={e => { if (activeTab !== tab.key) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{tab.icon}</span>
              {sidebarOpen && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(255,255,255,0.08)', borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Logged in as</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#c4b5fd' }}>🛡️ Administrator</div>
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>

        {/* FIX: Global message banner — was missing from quiz tab context */}
        {message.text && (
          <div style={{
            marginBottom: 24, padding: '14px 20px', borderRadius: 12, fontSize: 14, fontWeight: 500,
            background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
            color: message.type === 'error' ? '#dc2626' : '#16a34a',
          }}>{message.text}</div>
        )}

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ marginBottom: 36 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: THEME.text, marginBottom: 6 }}>Welcome, Admin 👋</h1>
              <p style={{ color: THEME.muted, fontSize: 15 }}>Manage courses, questions and quizzes from here.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 40 }}>
              {[
                { icon: '📚', label: 'Total Courses', value: courses.length, color: '#4c1d95', bg: '#f5f3ff', tab: 'viewCourses' },
                { icon: '📝', label: 'Total Quizzes', value: allQuizzes.length, color: '#6d28d9', bg: '#faf5ff', tab: 'viewQuizzes' },
              ].map(stat => (
                <button key={stat.label} onClick={() => setActiveTab(stat.tab)} style={{
                  background: stat.bg, borderRadius: 20, padding: '24px 20px',
                  border: `1.5px solid ${THEME.lavenderBorder}`, boxShadow: '0 4px 16px rgba(76,29,149,0.08)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(76,29,149,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(76,29,149,0.08)'; }}
                >
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{stat.icon}</div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                  <div style={{ fontSize: 13, color: THEME.muted }}>{stat.label}</div>
                </button>
              ))}
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#374151', marginBottom: 16 }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { key: 'addCourse',   icon: '📚', label: 'Add New Course',   desc: 'Create a new course' },
                { key: 'viewCourses', icon: '🗂️', label: 'View All Courses', desc: 'Browse existing courses' },
                { key: 'bulk',        icon: '📂', label: 'Bulk Upload',       desc: 'Upload questions via CSV' },
                { key: 'quiz',        icon: '📝', label: 'Add Quiz',          desc: 'Build a quiz for students' },
                { key: 'viewQuizzes', icon: '🎯', label: 'View Quizzes',      desc: 'See all quizzes' },
              ].map(action => (
                <button key={action.key} onClick={() => setActiveTab(action.key)} style={{
                  background: THEME.white, border: `1.5px solid ${THEME.lavenderBorder}`,
                  borderRadius: 18, padding: '20px', cursor: 'pointer',
                  textAlign: 'left', boxShadow: '0 4px 16px rgba(76,29,149,0.06)', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = THEME.accent; e.currentTarget.style.boxShadow = '0 8px 28px rgba(76,29,149,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = THEME.lavenderBorder; e.currentTarget.style.boxShadow = '0 4px 16px rgba(76,29,149,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{action.icon}</div>
                  <div style={{ fontWeight: 700, color: THEME.text, fontSize: 14, marginBottom: 4 }}>{action.label}</div>
                  <div style={{ fontSize: 12, color: THEME.muted }}>{action.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── ADD COURSE ── */}
        {activeTab === 'addCourse' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: THEME.text, marginBottom: 6 }}>📚 Add New Course</h1>
              <p style={{ color: THEME.muted }}>Fill in the details to create a new course.</p>
            </div>
            <div style={{ ...cardStyle, maxWidth: 680 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Course Title *</label>
                  <input style={inputStyle} placeholder="e.g. Introduction to Programming"
                    value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                    onFocus={e => e.target.style.borderColor = THEME.accent}
                    onBlur={e => e.target.style.borderColor = THEME.lavenderBorder} />
                </div>
                <div>
                  <label style={labelStyle}>Course Code *</label>
                  <input style={inputStyle} placeholder="e.g. CS101"
                    value={courseForm.code} onChange={e => setCourseForm({ ...courseForm, code: e.target.value })}
                    onFocus={e => e.target.style.borderColor = THEME.accent}
                    onBlur={e => e.target.style.borderColor = THEME.lavenderBorder} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Level</label>
                  <select style={{ ...inputStyle, background: THEME.white }} value={courseForm.level}
                    onChange={e => setCourseForm({ ...courseForm, level: e.target.value })}>
                    <option value="">Select Level</option>
                    <option>Level 1</option><option>Level 2</option><option>Level 3</option>
                  </select>
                </div>
              </div>
              <button onClick={handleCourseSubmit} style={{
                width: '100%', padding: '14px', background: THEME.primary, border: 'none',
                borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(76,29,149,0.3)',
              }}>Create Course →</button>
            </div>
          </div>
        )}

        {/* ── VIEW COURSES ── */}
        {activeTab === 'viewCourses' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: THEME.text, marginBottom: 6 }}>🗂️ All Courses</h1>
              <p style={{ color: THEME.muted }}>{courses.length} course{courses.length !== 1 ? 's' : ''} in the system.</p>
            </div>
            {courses.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <p style={{ color: THEME.muted, fontSize: 18, margin: '0 0 16px' }}>No courses yet.</p>
                <button onClick={() => setActiveTab('addCourse')} style={{ padding: '10px 24px', background: THEME.primary, border: 'none', borderRadius: 12, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Add First Course</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {courses.map(course => (
                  <div key={course.id} style={{ ...cardStyle, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = THEME.accent; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = THEME.lavenderBorder; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ background: THEME.lavender, color: '#4c1d95', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{course.code}</span>
                      {course.level && <span style={{ background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600 }}>{course.level}</span>}
                    </div>
                    <h3 style={{ fontWeight: 700, color: THEME.text, fontSize: 16, marginBottom: 8 }}>{course.title}</h3>
                    <p style={{ color: THEME.muted, fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>{course.description || 'No description.'}</p>
                    <div style={{ fontSize: 12, color: THEME.muted }}>📝 {course.quiz_count || 0} Quizzes</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── VIEW QUIZZES (with Delete & Edit) ── */}
        {activeTab === 'viewQuizzes' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: THEME.text, marginBottom: 6 }}>🎯 All Quizzes</h1>
                <p style={{ color: THEME.muted }}>{allQuizzes.length} quiz{allQuizzes.length !== 1 ? 'zes' : ''} in the system.</p>
              </div>
              <button onClick={() => setActiveTab('quiz')} style={{
                padding: '10px 20px', background: THEME.primary, border: 'none',
                borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}>+ Add New Quiz</button>
            </div>

            {allQuizzes.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <p style={{ color: THEME.muted, fontSize: 18, margin: '0 0 16px' }}>No quizzes yet.</p>
                <button onClick={() => setActiveTab('quiz')} style={{ padding: '10px 24px', background: THEME.primary, border: 'none', borderRadius: 12, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Create First Quiz</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {allQuizzes.map(quiz => (
                  <div key={quiz.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ width: 52, height: 52, flexShrink: 0, background: THEME.primary, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📝</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontWeight: 700, color: THEME.text, fontSize: 16, margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{quiz.title}</h3>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12 }}>
                        <span style={{ background: THEME.lavender, color: '#4c1d95', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                          {quiz.course_code || quiz.course_title || `Course #${quiz.course_id}`}
                        </span>
                        <span style={{ color: THEME.muted }}>📋 {quiz.question_count ?? 0} Questions</span>
                        {quiz.description && <span style={{ color: THEME.muted }}>· {quiz.description}</span>}
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={() => handleOpenEdit(quiz)}
                        style={{
                          background: '#eff6ff', border: '1px solid #bfdbfe',
                          borderRadius: 10, padding: '8px 14px', color: '#1e40af',
                          fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        }}
                      >✏️ Edit</button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        disabled={deletingId === quiz.id}
                        style={{
                          background: deletingId === quiz.id ? '#f3f4f6' : '#fef2f2',
                          border: `1px solid ${deletingId === quiz.id ? '#e5e7eb' : '#fecaca'}`,
                          borderRadius: 10, padding: '8px 14px',
                          color: deletingId === quiz.id ? '#9ca3af' : '#dc2626',
                          fontWeight: 700, fontSize: 13,
                          cursor: deletingId === quiz.id ? 'not-allowed' : 'pointer',
                        }}
                      >{deletingId === quiz.id ? '⏳' : '🗑️ Delete'}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BULK UPLOAD ── */}
        {activeTab === 'bulk' && (
          <BulkUpload courses={courses} showMessage={showMessage} inputStyle={inputStyle} labelStyle={labelStyle} cardStyle={cardStyle} THEME={THEME} />
        )}

        {/* ── ADD QUIZ ── */}
        {activeTab === 'quiz' && (
          <div style={{ maxWidth: 780 }}>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: THEME.text, marginBottom: 6 }}>📝 Add Quiz</h1>
              <p style={{ color: THEME.muted }}>Select a course, set the exam title, then add MCQ or Structural questions.</p>
            </div>

            {/* ── Step 1: Course + Title ── */}
            <div style={{ ...cardStyle, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 30, height: 30, background: THEME.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>1</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: THEME.text, margin: 0 }}>Quiz Details</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>Select Course *</label>
                  <select style={{ ...inputStyle, background: THEME.white }} value={quizCourse}
                    onChange={e => setQuizCourse(e.target.value)}
                    onFocus={e => e.target.style.borderColor = THEME.accent}
                    onBlur={e => e.target.style.borderColor = THEME.lavenderBorder}>
                    <option value="">Choose a course...</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.code})</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Exam / Quiz Title *</label>
                  <input style={inputStyle} placeholder="e.g. Midterm Practice Quiz"
                    value={quizTitle} onChange={e => setQuizTitle(e.target.value)}
                    onFocus={e => e.target.style.borderColor = THEME.accent}
                    onBlur={e => e.target.style.borderColor = THEME.lavenderBorder} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description <span style={{ color: THEME.muted, fontWeight: 400 }}>(optional)</span></label>
                <input style={inputStyle} placeholder="e.g. Covers chapters 1–4"
                  value={quizDescription} onChange={e => setQuizDescription(e.target.value)}
                  onFocus={e => e.target.style.borderColor = THEME.accent}
                  onBlur={e => e.target.style.borderColor = THEME.lavenderBorder} />
              </div>
            </div>

            {/* ── Step 2: Questions ── */}
            <div style={{ ...cardStyle, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 30, height: 30, background: THEME.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>2</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: THEME.text, margin: 0 }}>
                  Add Questions <span style={{ color: THEME.muted, fontWeight: 400, fontSize: 13 }}>({questions.length} added)</span>
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: questions.length > 0 ? 24 : 0 }}>
                <button onClick={() => addQuestion('mcq')} style={{
                  padding: '18px', borderRadius: 16, border: `2px dashed ${THEME.lavenderBorder}`,
                  background: THEME.lavender, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#4c1d95'; e.currentTarget.style.background = '#ddd6fe'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = THEME.lavenderBorder; e.currentTarget.style.background = THEME.lavender; }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🔘</div>
                  <div style={{ fontWeight: 700, color: '#4c1d95', fontSize: 14 }}>+ MCQ Question</div>
                  <div style={{ fontSize: 12, color: THEME.muted, marginTop: 3 }}>Multiple choice with A, B, C, D</div>
                </button>

                <button onClick={() => addQuestion('structural')} style={{
                  padding: '18px', borderRadius: 16, border: `2px dashed #fde68a`,
                  background: '#fef9ee', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#d97706'; e.currentTarget.style.background = '#fef3c7'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#fde68a'; e.currentTarget.style.background = '#fef9ee'; }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>✍️</div>
                  <div style={{ fontWeight: 700, color: '#92400e', fontSize: 14 }}>+ Structural Question</div>
                  <div style={{ fontSize: 12, color: THEME.muted, marginTop: 3 }}>Short answer or essay</div>
                </button>
              </div>

              {questions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {questions.map((q, i) => (
                    <QuestionCard
                      key={i} index={i} q={q}
                      onUpdate={(field, value) => updateQuestion(i, field, value)}
                      onRemove={() => removeQuestion(i)}
                      inputStyle={inputStyle} labelStyle={labelStyle} THEME={THEME}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Submit ── */}
            <button onClick={handleQuizSubmit} disabled={submitting} style={{
              width: '100%', padding: '16px', background: submitting ? '#e5e7eb' : THEME.primary,
              border: 'none', borderRadius: 14, color: submitting ? '#9ca3af' : '#fff',
              fontSize: 16, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: submitting ? 'none' : '0 4px 16px rgba(76,29,149,0.3)',
            }}>
              {submitting ? '⏳ Creating Quiz...' : `🚀 Create Quiz with ${questions.length} Question${questions.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        )}
      </div>

      {/* ── Edit Quiz Modal ── */}
      {editingQuiz && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(30,27,74,0.55)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          zIndex: 1000, padding: '40px 16px', overflowY: 'auto',
          backdropFilter: 'blur(4px)',
        }}
          onClick={e => { if (e.target === e.currentTarget) setEditingQuiz(null); }}
        >
          <div style={{
            background: THEME.white, borderRadius: 24, padding: 32, width: '100%', maxWidth: 740,
            boxShadow: '0 24px 80px rgba(30,27,74,0.25)', border: `1.5px solid ${THEME.lavenderBorder}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: THEME.text, margin: 0 }}>✏️ Edit Quiz</h2>
              <button onClick={() => setEditingQuiz(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, width: 32, height: 32, fontSize: 16, cursor: 'pointer', color: THEME.muted }}>✕</button>
            </div>

            {/* Title & Course */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Quiz Title *</label>
                <input style={inputStyle} value={editingQuiz.title}
                  onChange={e => setEditingQuiz(p => ({ ...p, title: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = THEME.accent}
                  onBlur={e => e.target.style.borderColor = THEME.lavenderBorder} />
              </div>
              <div>
                <label style={labelStyle}>Course *</label>
                <select style={{ ...inputStyle, background: THEME.white }}
                  value={editingQuiz.course_id}
                  onChange={e => setEditingQuiz(p => ({ ...p, course_id: e.target.value }))}>
                  <option value="">Choose a course...</option>
                  {courses.map(c => <option key={c.id} value={String(c.id)}>{c.title} ({c.code})</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Description <span style={{ color: THEME.muted, fontWeight: 400 }}>(optional)</span></label>
              <input style={inputStyle} value={editingQuiz.description}
                onChange={e => setEditingQuiz(p => ({ ...p, description: e.target.value }))}
                onFocus={e => e.target.style.borderColor = THEME.accent}
                onBlur={e => e.target.style.borderColor = THEME.lavenderBorder} />
            </div>

            {/* Questions */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: THEME.text, margin: 0 }}>Questions ({editingQuiz.questions.length})</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => addEditQuestion('mcq')} style={{ background: THEME.lavender, border: `1px solid ${THEME.lavenderBorder}`, borderRadius: 8, padding: '6px 14px', color: '#4c1d95', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>+ MCQ</button>
                  <button onClick={() => addEditQuestion('structural')} style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '6px 14px', color: '#92400e', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>+ Structural</button>
                </div>
              </div>

              {editingQuiz.questions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: THEME.muted, background: THEME.lavender, borderRadius: 12, fontSize: 14 }}>
                  No questions yet. Add some above.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}>
                  {editingQuiz.questions.map((q, i) => (
                    <QuestionCard
                      key={i} index={i} q={q}
                      onUpdate={(field, value) => updateEditQuestion(i, field, value)}
                      onRemove={() => removeEditQuestion(i)}
                      inputStyle={inputStyle} labelStyle={labelStyle} THEME={THEME}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Modal actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setEditingQuiz(null)} style={{
                flex: 1, padding: '13px', borderRadius: 12, border: `1.5px solid ${THEME.lavenderBorder}`,
                background: THEME.white, color: THEME.muted, fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleEditSave} disabled={editSubmitting} style={{
                flex: 2, padding: '13px', borderRadius: 12, border: 'none',
                background: editSubmitting ? '#e5e7eb' : THEME.primary,
                color: editSubmitting ? '#9ca3af' : '#fff', fontWeight: 700, fontSize: 14,
                cursor: editSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: editSubmitting ? 'none' : '0 4px 16px rgba(76,29,149,0.3)',
              }}>{editSubmitting ? '⏳ Saving...' : '💾 Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Individual Question Card ───────────────────────────────
function QuestionCard({ index, q, onUpdate, onRemove, inputStyle, labelStyle, THEME }) {
  const isMCQ = q.question_type === 'mcq';

  return (
    <div style={{
      borderRadius: 16, padding: '22px 24px', position: 'relative',
      border: `2px solid ${isMCQ ? THEME.lavenderBorder : '#fde68a'}`,
      background: isMCQ ? '#fafaff' : '#fffdf0',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            padding: '4px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: isMCQ ? THEME.lavender : '#fef3c7',
            color: isMCQ ? '#4c1d95' : '#92400e',
          }}>
            {isMCQ ? '🔘 MCQ' : '✍️ Structural'} · Q{index + 1}
          </div>
          <div style={{ fontSize: 13, color: THEME.muted }}>
            <input type="number" min={1} max={100} value={q.marks}
              onChange={e => onUpdate('marks', Number(e.target.value))}
              style={{ width: 48, padding: '3px 6px', borderRadius: 6, border: `1px solid ${THEME.lavenderBorder}`, fontSize: 13, textAlign: 'center', fontFamily: 'inherit' }} /> mark{q.marks !== 1 ? 's' : ''}
          </div>
        </div>
        <button onClick={onRemove} style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 8, padding: '5px 12px', color: '#dc2626',
          fontWeight: 700, fontSize: 12, cursor: 'pointer',
        }}>✕ Remove</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Question Text *</label>
        <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }}
          placeholder="Type your question here..."
          value={q.question_text}
          onChange={e => onUpdate('question_text', e.target.value)}
          onFocus={e => e.target.style.borderColor = THEME.accent}
          onBlur={e => e.target.style.borderColor = THEME.lavenderBorder} />
      </div>

      {isMCQ && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {['a', 'b', 'c', 'd'].map(opt => (
              <div key={opt}>
                <label style={{ ...labelStyle, color: '#4c1d95' }}>
                  Option {opt.toUpperCase()} {opt === 'a' || opt === 'b' ? '*' : ''}
                </label>
                <input style={inputStyle} placeholder={`Option ${opt.toUpperCase()}`}
                  value={q[`option_${opt}`]}
                  onChange={e => onUpdate(`option_${opt}`, e.target.value)}
                  onFocus={e => e.target.style.borderColor = THEME.accent}
                  onBlur={e => e.target.style.borderColor = THEME.lavenderBorder} />
              </div>
            ))}
          </div>

          <div>
            <label style={labelStyle}>✅ Correct Answer *</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['A', 'B', 'C', 'D'].map(opt => {
                const isSelected = q.correct_option === opt;
                const optText = q[`option_${opt.toLowerCase()}`];
                return (
                  <button key={opt} onClick={() => onUpdate('correct_option', opt)} style={{
                    flex: 1, padding: '10px 8px', borderRadius: 10,
                    border: `2px solid ${isSelected ? '#16a34a' : THEME.lavenderBorder}`,
                    background: isSelected ? '#f0fdf4' : THEME.white,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: isSelected ? '#16a34a' : '#9ca3af' }}>{opt}</span>
                    <span style={{ fontSize: 10, color: isSelected ? '#16a34a' : THEME.muted, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {optText || `Option ${opt}`}
                    </span>
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 12, color: THEME.muted, marginTop: 6, marginBottom: 0 }}>Click the letter of the correct answer above.</p>
          </div>
        </>
      )}

      {!isMCQ && (
        <div>
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
            <p style={{ fontSize: 13, color: '#92400e', margin: 0, fontWeight: 600 }}>✍️ Structural / Essay Question</p>
            <p style={{ fontSize: 12, color: THEME.muted, margin: '4px 0 0' }}>Students will type a written answer. Provide a model answer to show them after submission.</p>
          </div>
          <label style={labelStyle}>Model Answer <span style={{ color: THEME.muted, fontWeight: 400 }}>(shown to students after they submit)</span></label>
          <textarea style={{ ...inputStyle, height: 100, resize: 'vertical' }}
            placeholder="Enter a model answer or key points..."
            value={q.model_answer || ''}
            onChange={e => onUpdate('model_answer', e.target.value)}
            onFocus={e => e.target.style.borderColor = '#d97706'}
            onBlur={e => e.target.style.borderColor = THEME.lavenderBorder} />
        </div>
      )}
    </div>
  );
}

// ── Bulk Upload ────────────────────────────────────────────
function BulkUpload({ courses, showMessage, inputStyle, labelStyle, cardStyle, THEME }) {
  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadCourse, setUploadCourse] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState([]);
  const hasCsv = selectedFiles.some(file => file.name.toLowerCase().endsWith('.csv'));
  const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));

  const parseCSV = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    return lines.slice(1).map(line => {
      const cols = [];
      let current = '', inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') { inQuotes = !inQuotes; }
        else if (line[i] === ',' && !inQuotes) { cols.push(current.trim()); current = ''; }
        else { current += line[i]; }
      }
      cols.push(current.trim());
      const row = {};
      headers.forEach((h, i) => row[h] = cols[i] || '');
      return row;
    }).filter(row => row.question_text);
  };

  const handleFile = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles(files);
    setFileName(files.map(file => file.name).join(', '));
    setCsvData([]);
    setPreview([]);

    const csvFile = files.find(file => file.name.toLowerCase().endsWith('.csv'));
    if (!csvFile) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      setCsvData(parsed);
      setPreview(parsed.slice(0, 3));
      if (parsed.length === 0) showMessage('CSV selected, but no rows with question_text were found. Use the template format.', 'error');
    };
    reader.readAsText(csvFile);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return showMessage('Please select a CSV or PDF file.', 'error');
    if (pdfFiles.length > 0 && !uploadCourse) return showMessage('Please select a course before uploading PDF files.', 'error');
    setUploading(true);
    let success = 0, failed = 0;
    for (const row of csvData) {
      const course = row.course_code
        ? courses.find(c => c.code?.toLowerCase() === row.course_code?.toLowerCase())
        : courses.find(c => String(c.id) === String(uploadCourse));
      if (!course) { failed++; continue; }
      try {
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ course_id: course.id, question_text: row.question_text, year: row.year || null, marks: row.marks || 10, answer_text: row.answer_text || 'No answer provided', explanation: row.explanation || '' }),
        });
        if (res.ok) success++; else failed++;
      } catch { failed++; }
    }

    if (pdfFiles.length > 0) {
      try {
        const formData = new FormData();
        formData.append('course_id', uploadCourse);
        pdfFiles.forEach(file => formData.append('files', file));

        const res = await fetch('/api/questions/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: formData,
        });
        if (res.ok) success += pdfFiles.length;
        else failed += pdfFiles.length;
      } catch {
        failed += pdfFiles.length;
      }
    }

    setUploading(false);
    showMessage(`✅ Uploaded ${success} questions${failed > 0 ? ` (${failed} failed)` : ''}!`);
    setCsvData([]); setFileName(''); setPreview([]); setSelectedFiles([]);
  };

  const downloadTemplate = () => {
    const csv = `course_code,question_text,year,marks,answer_text,explanation\nCS101,"What does RAM stand for?",2023,10,"Random Access Memory","RAM is volatile memory"`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'questions_template.csv'; a.click();
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: THEME.text, marginBottom: 6 }}>📂 Bulk Upload Questions</h1>
        <p style={{ color: THEME.muted }}>Upload a CSV file to add multiple past questions at once.</p>
      </div>
      <div style={{ background: THEME.lavender, border: `1px solid ${THEME.lavenderBorder}`, borderRadius: 16, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, color: '#4c1d95', marginBottom: 4 }}>📋 Download CSV Template</div>
          <div style={{ fontSize: 13, color: '#6d28d9' }}>Use this template to format your questions correctly.</div>
        </div>
        <button onClick={downloadTemplate} style={{ background: THEME.primary, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>⬇️ Download Template</button>
      </div>
      <div style={{ ...cardStyle, maxWidth: 680 }}>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Course for PDF uploads</label>
          <select style={{ ...inputStyle, background: THEME.white }} value={uploadCourse}
            onChange={e => setUploadCourse(e.target.value)}>
            <option value="">Choose a course...</option>
            {courses.map(course => <option key={course.id} value={course.id}>{course.title} ({course.code})</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Select CSV or PDF File *</label>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, border: `2px dashed ${THEME.lavenderBorder}`, borderRadius: 16, padding: '40px 20px', cursor: 'pointer', background: THEME.lavender }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = THEME.accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = THEME.lavenderBorder; }}>
            <span style={{ fontSize: 40 }}>📂</span>
            <span style={{ fontWeight: 700, color: '#4c1d95' }}>{fileName || 'Click to select CSV or PDF file'}</span>
            <span style={{ fontSize: 12, color: THEME.muted }}>.csv and .pdf files accepted</span>
            <input type="file" accept=".csv,.pdf,application/pdf" multiple onChange={handleFile} style={{ display: 'none' }} />
          </label>
        </div>
        {preview.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 700, color: THEME.text, marginBottom: 12 }}>Preview — {csvData.length} questions found:</div>
            {preview.map((row, i) => (
              <div key={i} style={{ background: THEME.lavender, borderRadius: 12, padding: '12px 16px', marginBottom: 8 }}>
                <div style={{ fontSize: 13, color: THEME.text, marginBottom: 4 }}><strong>Q:</strong> {row.question_text}</div>
                <div style={{ fontSize: 13, color: '#16a34a' }}><strong>A:</strong> {row.answer_text}</div>
              </div>
            ))}
          </div>
        )}
        <button onClick={handleUpload} disabled={selectedFiles.length === 0 || uploading} style={{
          width: '100%', padding: '14px', background: selectedFiles.length === 0 ? '#e5e7eb' : THEME.primary,
          border: 'none', borderRadius: 12, color: selectedFiles.length === 0 ? '#9ca3af' : '#fff',
          fontSize: 15, fontWeight: 700, cursor: selectedFiles.length === 0 ? 'not-allowed' : 'pointer',
        }}>
          {uploading ? '⏳ Uploading...' : `📤 Upload ${csvData.length > 0 ? csvData.length + ' Questions' : 'Questions'}`}
        </button>
      </div>
    </div>
  );
}
