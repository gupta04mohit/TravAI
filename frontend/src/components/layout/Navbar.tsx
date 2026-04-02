import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Search, Globe, Moon, Sun, MoreVertical, Navigation, Menu, X, ChevronDown, User, MapPin, Heart, LayoutDashboard, LogOut, Settings, HelpCircle, Gift, Coins, Crown } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { Lang } from '../../store/useAppStore';

const Navbar = () => {
  const { theme, toggleTheme, lang, setLang, t, user, logout } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showDotMenu, setShowDotMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setShowLangMenu(false);
      if (dotRef.current && !dotRef.current.contains(e.target as Node)) setShowDotMenu(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setShowMobileMenu(false);
    navigate('/');
  };

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.explore'), path: '/explore' },
    { name: t('nav.blog'), path: '/blog' },
    { name: t('nav.info'), path: '/info' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const coinBalance = user?.coins ?? 0;
  const hasPass = user?.activePass && new Date(user.activePass.expiresAt) > new Date();

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white dark:bg-[#0f0f13] border-b border-gray-200 dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="bg-vercel-violet/10 p-2 rounded-lg">
                <Navigation className="w-7 h-7 text-vercel-violet" />
              </div>
              <span className="text-[26px] font-bold tracking-[-1px] text-gray-900 dark:text-white">TravAI</span>
            </Link>

            {/* Center Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(item => (
                <Link key={item.path} to={item.path} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.03] ${isActive(item.path) ? 'text-vercel-violet bg-vercel-violet/10' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="hidden md:flex relative w-[280px] lg:w-[320px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
                <input type="text" placeholder={t('nav.search')} className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-white/15 rounded-full bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vercel-violet text-sm" />
              </div>

              {/* Language */}
              <div ref={langRef} className="relative">
                <button onClick={() => setShowLangMenu(!showLangMenu)} className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                  <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 hidden sm:inline">{lang === 'en' ? 'EN' : 'हि'}</span>
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/15 rounded-xl shadow-lg overflow-hidden z-50">
                    {([['en', 'English', '🇬🇧'], ['hi', 'हिंदी', '🇮🇳']] as [Lang, string, string][]).map(([code, label, flag]) => (
                      <button key={code} onClick={() => { setLang(code); setShowLangMenu(false); }} className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${lang === code ? 'text-vercel-violet bg-vercel-violet/5 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>
                        <span>{flag}</span> {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme */}
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
              </button>

              {/* 3-dot menu — ONLY non-user items (Help, Refer) */}
              <div ref={dotRef} className="relative">
                <button onClick={() => setShowDotMenu(!showDotMenu)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
                {showDotMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/15 rounded-xl shadow-lg overflow-hidden z-50">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <HelpCircle className="w-4 h-4" /> {lang === 'en' ? 'Help & Support' : 'सहायता'}
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <Gift className="w-4 h-4" /> {lang === 'en' ? 'Refer & Earn' : 'रेफर करें'}
                    </button>
                  </div>
                )}
              </div>

              {/* Auth Area */}
              <div className="hidden sm:flex items-center gap-2 ml-1">
                {user ? (
                  <div ref={userRef} className="relative">
                    <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-vercel-violet to-vercel-violet flex items-center justify-center text-white text-sm font-bold shadow-md">
                          {userInitials}
                        </div>
                        {hasPass && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                            <Crown className="w-2.5 h-2.5 text-yellow-900" />
                          </div>
                        )}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/15 rounded-xl shadow-xl overflow-hidden z-50">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">🪙 {coinBalance} coins</span>
                            {hasPass && <span className="text-xs font-bold text-vercel-violet">👑 {user.activePass?.type} pass</span>}
                          </div>
                        </div>
                        {/* Menu */}
                        <div className="py-1">
                          <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                            <User className="w-4 h-4" /> {t('nav.profile')}
                          </Link>
                          <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                            <MapPin className="w-4 h-4" /> {t('nav.myTrips')}
                          </Link>
                          <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                            <Heart className="w-4 h-4" /> {t('nav.wishlist')}
                          </Link>
                          <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                            <Coins className="w-4 h-4" /> {t('nav.coins')}
                          </Link>
                          <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                            <Settings className="w-4 h-4" /> {t('nav.settings')}
                          </Link>
                          {user.isAdmin && (
                            <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-vercel-violet hover:bg-vercel-violet/5">
                              <LayoutDashboard className="w-4 h-4" /> Admin Panel
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-gray-100 dark:border-white/10">
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                            <LogOut className="w-4 h-4" /> {t('nav.logout')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link to="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-vercel-violet transition-colors px-3 py-2">{t('nav.login')}</Link>
                    <Link to="/signup" className="bg-gradient-to-r from-vercel-violet to-vercel-violet text-white text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity shadow-sm">{t('nav.signup')}</Link>
                  </>
                )}
              </div>

              {/* Mobile */}
              <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10">
                {showMobileMenu ? <X className="w-5 h-5 text-gray-700 dark:text-white" /> : <Menu className="w-5 h-5 text-gray-700 dark:text-white" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-[#0f0f13] pt-20 px-6 lg:hidden overflow-y-auto">
          <div className="space-y-2">
            {navLinks.map(item => (
              <Link key={item.path} to={item.path} onClick={() => setShowMobileMenu(false)} className={`block px-4 py-4 rounded-xl text-lg font-medium ${isActive(item.path) ? 'text-vercel-violet bg-vercel-violet/10' : 'text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                {item.name}
              </Link>
            ))}
            <div className="border-t border-gray-200 dark:border-white/10 pt-4 mt-4">
              {user ? (
                <div className="space-y-2">
                  <div className="px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vercel-violet to-vercel-violet flex items-center justify-center text-white font-bold">{userInitials}</div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500">🪙 {coinBalance} coins</p>
                    </div>
                  </div>
                  <Link to="/dashboard" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10">{t('nav.profile')}</Link>
                  <Link to="/dashboard" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10">{t('nav.coins')}</Link>
                  {user.isAdmin && <Link to="/admin" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 rounded-xl text-vercel-violet hover:bg-vercel-violet/10">Admin Panel</Link>}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">{t('nav.logout')}</button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login" onClick={() => setShowMobileMenu(false)} className="flex-1 text-center py-3 rounded-xl border border-gray-200 dark:border-white/15 text-gray-700 dark:text-white font-medium">{t('nav.login')}</Link>
                  <Link to="/signup" onClick={() => setShowMobileMenu(false)} className="flex-1 text-center py-3 rounded-xl bg-vercel-violet text-white font-medium">{t('nav.signup')}</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
