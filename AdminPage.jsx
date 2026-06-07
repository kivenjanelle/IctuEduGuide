// src/components/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { getCourses } from '../utils/api';

const TABS = [
  { key: 'overview',    label: 'Overview',      icon: '🏠' },
  { key: 'addCourse',   label: 'Add Course',    icon: '📚' },
  { key: 'viewCourses', label: 'View Courses',  icon: '🗂️' },
  { key: 'bulk',        label: 'Bulk Upload',   icon: '📂' },
  { key: 'quiz',        label: 'Add Quiz',      icon: '📝' },
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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [courseForm, setCourseForm] = useState({ title: '', code: '', level: '', credits: 3 });
  const [quizForm, setQuizForm] = useState({ title: '', course_id: '', description: '' });

  const loadCourses = () => {
    getCourses()
      .then(res => setCourses(res.data.courses || res.data || []))
      .catch(() => setCourses([]));
  };

  useEffect(() => { loadCourses(); }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

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

  const handleQuizSubmit = async () => {
    if (!quizForm.title || !quizForm.course_id) return showMessage('Title and Course are required.', 'error');
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(quizForm),
      });
      if (res.ok) {
        showMessage('✅ Quiz created successfully!');
        setQuizForm({ title: '', course_id: '', description: '' });
      } else showMessage('❌ Failed to create quiz', 'error');
    } catch { showMessage('❌ Failed to create quiz', 'error'); }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: `1.5px solid ${THEME.lavenderBorder}`, fontSize: 14,
    outline: 'none', background: THEME.white, color: THEME.text,
    boxSizing: 'border-box', transition: 'border 0.2s', fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: '#374151', marginBottom: 7,
  };

  const cardStyle = {
    background: THEME.white, borderRadius: 20, padding: 28,
    border: `1.5px solid ${THEME.lavenderBorder}`,
    boxShadow: '0 4px 24px rgba(76,29,149,0.08)',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: THEME.bg, fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── Sidebar ── */}
      <div style={{
        width: sidebarOpen ? 256 : 68,
        background: THEME.sidebar,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        padding: sidebarOpen ? '36px 16px' : '36px 8px',
        transition: 'width 0.3s ease, padding 0.3s ease',
        position: 'relative', flexShrink: 0,
        boxShadow: '4px 0 24px rgba(76,29,149,0.2)',
      }}>
        {/* Toggle button */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
          position: 'absolute', top: 24, right: -14,
          width: 28, height: 28,
          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
          border: 'none', borderRadius: '50%', color: '#fff',
          cursor: 'pointer', fontSize: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(124,58,237,0.5)', zIndex: 10,
        }}>
          {sidebarOpen ? '←' : '→'}
        </button>

        {/* Brand */}
        {sidebarOpen && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎓</div>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Admin Panel</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', paddingLeft: 46 }}>ICTU EduGuide</div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 12, border: 'none',
              background: activeTab === tab.key ? 'rgba(255,255,255,0.18)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'rgba(255,255,255,0.55)',
              cursor: 'pointer', fontSize: 14, fontWeight: 600,
              transition: 'all 0.2s', textAlign: 'left',
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

        {/* Bottom info */}
        {sidebarOpen && (
          <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(255,255,255,0.08)', borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Logged in as</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#c4b5fd' }}>🛡️ Administrator</div>
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto', maxWidth: 'calc(100vw - 256px)' }}>

        {/* Toast */}
        {message.text && (
          <div style={{
            marginBottom: 24, padding: '14px 20px', borderRadius: 12,
            fontSize: 14, fontWeight: 500,
            background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
            color: message.type === 'error' ? '#dc2626' : '#16a34a',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {message.text}
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div>
            {/* Header */}
            <div style={{ marginBottom: 36 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: THEME.text, marginBottom: 6 }}>
                Welcome, Admin 👋
              </h1>
              <p style={{ color: THEME.muted, fontSize: 15 }}>Manage courses, questions and quizzes from here.</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 40 }}>
              {[
                { icon: '📚', label: 'Total Courses', value: courses.length, color: '#4c1d95', bg: '#f5f3ff', tab: 'viewCourses' },
                { icon: '❓', label: 'Past Questions', value: courses.reduce((a, c) => a + (parseInt(c.question_count) || 0), 0), color: '#1e40af', bg: '#eff6ff', tab: 'bulk' },
                { icon: '📝', label: 'Total Quizzes', value: courses.reduce((a, c) => a + (parseInt(c.quiz_count) || 0), 0), color: '#6d28d9', bg: '#faf5ff', tab: 'quiz' },
              ].map(stat => (
                <button key={stat.label} onClick={() => setActiveTab(stat.tab)} style={{
                  background: stat.bg, borderRadius: 20, padding: '24px 20px',
                  border: `1.5px solid ${THEME.lavenderBorder}`,
                  boxShadow: '0 4px 16px rgba(76,29,149,0.08)',
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

            {/* Quick actions */}
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#374151', marginBottom: 16 }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { key: 'addCourse',   icon: '📚', label: 'Add New Course',   desc: 'Create a new course', color: '#4c1d95' },
                { key: 'viewCourses', icon: '🗂️', label: 'View All Courses', desc: 'Browse existing courses', color: '#1e40af' },
                { key: 'bulk',        icon: '📂', label: 'Bulk Upload',       desc: 'Upload questions via CSV', color: '#6d28d9' },
                { key: 'quiz',        icon: '📝', label: 'Create Quiz',       desc: 'Build a quiz for students', color: '#2563eb' },
              ].map(action => (
                <button key={action.key} onClick={() => setActiveTab(action.key)} style={{
                  background: THEME.white, border: `1.5px solid ${THEME.lavenderBorder}`,
                  borderRadius: 18, padding: '20px', cursor: 'pointer',
                  textAlign: 'left', boxShadow: '0 4px 16px rgba(76,29,149,0.06)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.boxShadow = '0 8px 28px rgba(76,29,149,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
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
                    onChange={e => setCourseForm({ ...courseForm, level: e.target.value })}
                    onFocus={e => e.target.style.borderColor = THEME.accent}
                    onBlur={e => e.target.style.borderColor = THEME.lavenderBorder}>
                    <option value="">Select Level</option>
                    <option>Level 1</option><option>Level 2</option><option>Level 3</option>
                  </select>
                </div>
              </div>
              <button onClick={handleCourseSubmit} style={{
                width: '100%', padding: '14px',
                background: THEME.primary, border: 'none', borderRadius: 12,
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(76,29,149,0.3)', transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Create Course →
              </button>
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
                <button onClick={() => setActiveTab('addCourse')} style={{
                  padding: '10px 24px', background: THEME.primary,
                  border: 'none', borderRadius: 12, color: '#fff', fontWeight: 600, cursor: 'pointer',
                }}>Add First Course</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {courses.map(course => (
                  <div key={course.id} onClick={() => window.open(`/courses/${course.id}`, '_blank')} style={{
                    ...cardStyle, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = THEME.accent; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(76,29,149,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = THEME.lavenderBorder; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(76,29,149,0.08)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <span style={{ background: THEME.lavender, color: '#4c1d95', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                        {course.code}
                      </span>
                      {course.level && (
                        <span style={{ background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600 }}>
                          {course.level}
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontWeight: 700, color: THEME.text, fontSize: 16, marginBottom: 8 }}>{course.title}</h3>
                    <p style={{ color: THEME.muted, fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
                      {course.description || 'No description.'}
                    </p>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: THEME.muted }}>
                      <span>❓ {course.question_count || 0} Questions</span>
                      <span>📝 {course.quiz_count || 0} Quizzes</span>
                    </div>
                    <div style={{ marginTop: 12, fontSize: 12, color: THEME.accent, fontWeight: 600 }}>
                      Click to view course →
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
          <div>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: THEME.text, marginBottom: 6 }}>📝 Create Quiz</h1>
              <p style={{ color: THEME.muted }}>Set up a new quiz for students to take.</p>
            </div>
            <div style={{ ...cardStyle, maxWidth: 680 }}>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Quiz Title *</label>
                <input style={inputStyle} placeholder="e.g. Midterm Practice Quiz"
                  value={quizForm.title} onChange={e => setQuizForm({ ...quizForm, title: e.target.value })}
                  onFocus={e => e.target.style.borderColor = THEME.accent}
                  onBlur={e => e.target.style.borderColor = THEME.lavenderBorder} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Select Course *</label>
                <select style={{ ...inputStyle, background: THEME.white }} value={quizForm.course_id}
                  onChange={e => setQuizForm({ ...quizForm, course_id: e.target.value })}
                  onFocus={e => e.target.style.borderColor = THEME.accent}
                  onBlur={e => e.target.style.borderColor = THEME.lavenderBorder}>
                  <option value="">Select a course...</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.code})</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Description <span style={{ color: THEME.muted, fontWeight: 400 }}>(optional)</span></label>
                <textarea style={{ ...inputStyle, height: 100, resize: 'vertical' }}
                  placeholder="Describe what this quiz covers..."
                  value={quizForm.description} onChange={e => setQuizForm({ ...quizForm, description: e.target.value })}
                  onFocus={e => e.target.style.borderColor = THEME.accent}
                  onBlur={e => e.target.style.borderColor = THEME.lavenderBorder} />
              </div>
              <button onClick={handleQuizSubmit} style={{
                width: '100%', padding: '14px',
                background: THEME.primary, border: 'none', borderRadius: 12,
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(76,29,149,0.3)',
              }}>Create Quiz →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bulk Upload Component ──────────────────────────────────
function BulkUpload({ courses, showMessage, inputStyle, labelStyle, cardStyle, THEME }) {
  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState([]);

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    return lines.slice(1).map(line => {
      const cols = [];
      let current = '';
      let inQuotes = false;
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
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      setCsvData(parsed);
      setPreview(parsed.slice(0, 3));
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (csvData.length === 0) return showMessage('No data to upload', 'error');
    setUploading(true);
    let success = 0, failed = 0;
    for (const row of csvData) {
      const course = courses.find(c => c.code?.toLowerCase() === row.course_code?.toLowerCase());
      if (!course) { failed++; continue; }
      try {
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({
            course_id: course.id, question_text: row.question_text,
            year: row.year || null, marks: row.marks || 10,
            answer_text: row.answer_text, explanation: row.explanation || '',
          }),
        });
        if (res.ok) success++; else failed++;
      } catch { failed++; }
    }
    setUploading(false);
    showMessage(`✅ Uploaded ${success} questions${failed > 0 ? ` (${failed} failed — check course codes)` : ''}!`);
    setCsvData([]); setFileName(''); setPreview([]);
  };

  const downloadTemplate = () => {
    const csv = `course_code,question_text,year,marks,answer_text,explanation\nCS101,"What does RAM stand for?",2023,10,"Random Access Memory","RAM is volatile memory used by the CPU"`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'questions_template.csv'; a.click();
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: THEME.text, marginBottom: 6 }}>📂 Bulk Upload Questions</h1>
        <p style={{ color: THEME.muted }}>Upload a CSV file to add multiple questions at once.</p>
      </div>

      {/* Download template */}
      <div style={{
        background: THEME.lavender, border: `1px solid ${THEME.lavenderBorder}`,
        borderRadius: 16, padding: '20px 24px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontWeight: 700, color: '#4c1d95', marginBottom: 4 }}>📋 Download CSV Template</div>
          <div style={{ fontSize: 13, color: '#6d28d9' }}>Use this template to format your questions correctly.</div>
        </div>
        <button onClick={downloadTemplate} style={{
          background: THEME.primary, color: '#fff', border: 'none',
          borderRadius: 12, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(76,29,149,0.3)',
        }}>⬇️ Download Template</button>
      </div>

      {/* Column guide */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ fontWeight: 700, color: THEME.text, marginBottom: 12 }}>Required CSV Columns:</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['course_code', 'question_text', 'year', 'marks', 'answer_text', 'explanation'].map(col => (
            <span key={col} style={{
              background: THEME.lavender, color: '#4c1d95',
              padding: '4px 12px', borderRadius: 8, fontSize: 13, fontFamily: 'monospace', fontWeight: 600,
            }}>{col}</span>
          ))}
        </div>
        <p style={{ fontSize: 12, color: THEME.muted, marginTop: 10, marginBottom: 0 }}>
          * <strong>course_code</strong> must exactly match an existing course code. <strong>explanation</strong> is optional.
        </p>
      </div>

      <div style={{ ...cardStyle, maxWidth: 680 }}>
        {/* File upload area */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Select CSV File *</label>
          <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 8,
            border: `2px dashed ${THEME.lavenderBorder}`, borderRadius: 16,
            padding: '40px 20px', cursor: 'pointer',
            background: THEME.lavender, transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = THEME.accent; e.currentTarget.style.background = '#ede9fe'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = THEME.lavenderBorder; e.currentTarget.style.background = THEME.lavender; }}
          >
            <span style={{ fontSize: 40 }}>📂</span>
            <span style={{ fontWeight: 700, color: '#4c1d95' }}>{fileName || 'Click to select CSV file'}</span>
            <span style={{ fontSize: 12, color: THEME.muted }}>Only .csv files accepted</span>
            <input type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
          </label>
        </div>

        {/* Preview */}
        {preview.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 700, color: THEME.text, marginBottom: 12 }}>
              Preview — {csvData.length} questions found:
            </div>
            {preview.map((row, i) => (
              <div key={i} style={{
                background: THEME.lavender, borderRadius: 12,
                padding: '12px 16px', marginBottom: 8,
                border: `1px solid ${THEME.lavenderBorder}`,
              }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ background: '#fff', color: '#4c1d95', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{row.course_code}</span>
                  {row.year && <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{row.year}</span>}
                </div>
                <div style={{ fontSize: 13, color: THEME.text, marginBottom: 4 }}><strong>Q:</strong> {row.question_text}</div>
                <div style={{ fontSize: 13, color: '#16a34a' }}><strong>A:</strong> {row.answer_text}</div>
              </div>
            ))}
            {csvData.length > 3 && (
              <p style={{ fontSize: 13, color: THEME.muted, textAlign: 'center', margin: 0 }}>
                ...and {csvData.length - 3} more questions
              </p>
            )}
          </div>
        )}

        <button onClick={handleUpload} disabled={csvData.length === 0 || uploading} style={{
          width: '100%', padding: '14px',
          background: csvData.length === 0 ? '#e5e7eb' : THEME.primary,
          border: 'none', borderRadius: 12,
          color: csvData.length === 0 ? '#9ca3af' : '#fff',
          fontSize: 15, fontWeight: 700,
          cursor: csvData.length === 0 ? 'not-allowed' : 'pointer',
          boxShadow: csvData.length > 0 ? '0 4px 16px rgba(76,29,149,0.3)' : 'none',
        }}>
          {uploading ? '⏳ Uploading...' : `📤 Upload ${csvData.length > 0 ? csvData.length + ' Questions' : 'Questions'}`}
        </button>
      </div>
    </div>
  );
}