// src/pages/PerformancePage.jsx
import React, { useState, useEffect } from 'react';
import { getPerformance } from '../utils/api';
import { useAuth } from '../context/Authcontext.jsx';

export default function PerformancePage() {
  const { user } = useAuth();
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    getPerformance().then(res => setPerformance(res.data));
  }, []);

  const avg = performance?.average || 0;

  const getRecommendation = () => {
    if (!user?.level) return 'Complete quizzes to get recommendations.';
    if (user.level === 'Level 3') {
      return 'Focus on advanced courses in your speciality (e.g., Operating Systems, Databases) to strengthen expertise.';
    }
    return 'Strong performance! Consider specializing in Software Engineering or Networking.';
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-12">Your Academic Performance</h1>
      
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-3xl p-16 text-center mb-12">
        <div className="text-8xl font-bold text-indigo-600 mb-4">{avg}%</div>
        <p className="text-2xl text-gray-700">Overall Average Score</p>
      </div>

      <div className="bg-white border rounded-3xl p-10">
        <h2 className="text-2xl font-semibold mb-6">Recommendation</h2>
        <p className="text-xl leading-relaxed text-gray-700">{getRecommendation()}</p>
      </div>
    </div>
  );
}
