import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Sparkles } from 'lucide-react';

export default function FloatingAI() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState(false);

  // Hide on the assistant page itself
  if (location.pathname === '/assistant') return null;

  return (
    <button
      onClick={() => navigate('/assistant')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-6 right-6 z-50 group"
      aria-label="Open AI Assistant"
    >
      {/* Pulse rings */}
      <span className="absolute inset-0 rounded-full bg-vercel-violet/30 animate-ping" />
      <span className="absolute -inset-1 rounded-full bg-vercel-violet/20 animate-pulse" />

      {/* Button */}
      <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-vercel-violet via-vercel-violet to-indigo-600 shadow-lg shadow-vercel-violet/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-vercel-violet/40">
        <Sparkles className="w-6 h-6 text-white" />
      </div>

      {/* Tooltip */}
      <span className={`absolute -top-10 right-0 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        AI Travel Planner ✨
      </span>
    </button>
  );
}
