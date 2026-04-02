import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { useAppStore } from './store/useAppStore';

import Navbar from './components/layout/Navbar';
import FloatingAI from './components/FloatingAI';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Blog from './pages/Blog';
import Info from './pages/Info';
import AIAssistant from './pages/AIAssistant';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import PlaceDetail from './pages/PlaceDetail';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

function App() {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-vercel-violet selection:text-white flex flex-col">
        <Navbar />
        <FloatingAI />
        <main className="flex-1 flex flex-col relative w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore/:stateSlug" element={<Explore />} />
            <Route path="/explore/:stateSlug/:placeSlug" element={<Explore />} />
            <Route path="/place/:slug" element={<PlaceDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/info" element={<Info />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
