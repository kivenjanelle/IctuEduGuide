import React from 'react';

export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-6 animate-bounce">🎓</div>
        <h1 className="text-4xl font-bold text-indigo-700">ICTU EduGuide</h1>
        <p className="text-gray-600 mt-2">ICT University Learning System</p>
        <div className="mt-8 w-64 h-1.5 bg-violet-100 mx-auto rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-indigo-600 animate-pulse rounded-full"></div>
        </div>
      </div>
    </div>
  );
}