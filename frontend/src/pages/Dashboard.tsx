// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router';
// import { User, Heart, MapPin, Coins, Settings, LogOut, Sparkles, Download, ChevronRight, Crown, Zap, Shield, Clock, Check, Star } from 'lucide-react';
// import { useAppStore } from '../store/useAppStore';
// import { fetchApi } from '../lib/api';
// import Footer from '../components/layout/Footer';


import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { User, Heart, MapPin, Coins, Settings, LogOut, Sparkles, Crown, Zap, Clock, Check } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { fetchApi } from '../lib/api';
import Footer from '../components/layout/Footer';


const COIN_PACKAGES = [
  { id: 'small', coins: 100, price: 99, popular: false },
  { id: 'medium', coins: 300, price: 249, popular: true },
  { id: 'large', coins: 700, price: 499, popular: false },
];

const PASS_PLANS = [
  { id: 'daily', label: 'Daily Pass', price: 49, duration: '24 hours', icon: <Clock className="w-5 h-5" /> },
  { id: 'weekly', label: 'Weekly Pass', price: 149, duration: '7 days', icon: <Zap className="w-5 h-5" /> },
  { id: 'monthly', label: 'Monthly Pass', price: 199, duration: '30 days', icon: <Crown className="w-5 h-5" />, best: true },
];

const FEATURE_COSTS = [
  { name: 'AI Itinerary', cost: 10, icon: '🗺️' },
  { name: 'Smart Planner', cost: 5, icon: '🧠' },
  { name: 'Budget Optimizer', cost: 8, icon: '💰' },
  { name: 'Hidden Gems', cost: 3, icon: '💎' },
  { name: 'Export Plan', cost: 5, icon: '📥' },
  { name: 'Voice AI', cost: 7, icon: '🎙️' },
];

const TABS = [
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 'trips', label: 'My Trips', icon: <MapPin className="w-4 h-4" /> },
  { id: 'wishlist', label: 'Wishlist', icon: <Heart className="w-4 h-4" /> },
  { id: 'coins', label: 'Coins & Premium', icon: <Coins className="w-4 h-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
];

export default function Dashboard() {
  const { user, token, logout, updateUser, setCoins, theme, toggleTheme, lang, setLang, t } = useAppStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [buying, setBuying] = useState('');
  const [msg, setMsg] = useState('');
  const [coinHistory, setCoinHistory] = useState<any[]>([]);

  // Form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileMobile, setProfileMobile] = useState(user?.mobile || '');

  // Fetch profile on mount if logged in
  useEffect(() => {
    if (user && token) {
      fetchApi('/auth/profile').then(data => {
        if (data?.user) updateUser(data.user);
      }).catch(() => {});
    }
  }, []);

  // Redirect if not logged in
  if (!user || !token) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Please log in first</h2>
          <Link to="/login" className="inline-block bg-gradient-to-r from-vercel-violet to-vercel-violet text-white font-bold py-3 px-8 rounded-xl">Log in</Link>
        </div>
      </div>
    );
  }

  const userInitials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const hasPass = user.activePass && new Date(user.activePass.expiresAt) > new Date();

  const saveProfile = async () => {
    setSaving(true);
    try {
      const data = await fetchApi('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: profileName, mobile: profileMobile }),
      });
      if (data?.user) { updateUser(data.user); setMsg('Profile saved!'); }
    } catch { setMsg('Save failed'); }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const buyCoins = async (pkgId: string) => {
    setBuying(pkgId);
    try {
      const data = await fetchApi('/auth/coins/purchase', {
        method: 'POST',
        body: JSON.stringify({ packageId: pkgId }),
      });
      if (data?.user) { updateUser(data.user); setMsg(`+${data.purchased.coins} coins added!`); }
    } catch { setMsg('Purchase failed'); }
    setBuying('');
    setTimeout(() => setMsg(''), 3000);
  };

  const buyPass = async (passType: string) => {
    setBuying(passType);
    try {
      const data = await fetchApi('/auth/pass/purchase', {
        method: 'POST',
        body: JSON.stringify({ passType }),
      });
      if (data?.user) { updateUser(data.user); setMsg(`${passType} pass activated!`); }
    } catch { setMsg('Purchase failed'); }
    setBuying('');
    setTimeout(() => setMsg(''), 3000);
  };

  const saveSettings = async (key: string, value: any) => {
    try {
      const data = await fetchApi('/auth/settings', {
        method: 'PUT',
        body: JSON.stringify({ [key]: value }),
      });
      if (data?.user) updateUser(data.user);
    } catch { /* silent */ }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Toast */}
      {msg && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg font-medium animate-pulse">{msg}</div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 flex-1 w-full">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 space-y-1">
            <div className="p-4 rounded-xl bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 mb-4 text-center">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-vercel-violet to-vercel-violet mx-auto flex items-center justify-center text-white text-3xl font-bold mb-3">{userInitials}</div>
                {hasPass && (
                  <div className="absolute top-0 right-0 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow">
                    <Crown className="w-3.5 h-3.5 text-yellow-900" />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">{user.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              <div className="mt-2 text-xs font-bold text-yellow-600 dark:text-yellow-400">🪙 {user.coins ?? 0} coins</div>
            </div>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${tab === t.id ? 'bg-vercel-violet/10 text-vercel-violet border border-vercel-violet/30' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                {t.icon} {t.label}
              </button>
            ))}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors mt-4">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* ─── PROFILE ─── */}
          {tab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">Full Name</label>
                  <input value={profileName} onChange={e => setProfileName(e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-vercel-violet" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">Email</label>
                  <input value={user.email} disabled className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 rounded-xl px-4 py-3 cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">Mobile</label>
                  <input value={profileMobile} onChange={e => setProfileMobile(e.target.value)} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-vercel-violet" placeholder="+91 9876543210" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1 text-gray-700 dark:text-gray-300">Referral Code</label>
                  <input value={user.referralCode || ''} disabled className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 rounded-xl px-4 py-3 cursor-not-allowed" />
                </div>
              </div>
              <div className="mt-6">
                <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Travel Preferences</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: user.preferences?.travelType || 'Solo', emoji: '🧍' },
                    { label: user.preferences?.budget || 'Budget', emoji: '💰' },
                    { label: (user.preferences?.interests || ['Mountains'])[0], emoji: '🏔️' },
                    { label: (user.preferences?.season || ['Winter'])[0], emoji: '❄️' },
                  ].map(p => (
                    <div key={p.label} className="p-4 rounded-xl bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 text-center">
                      <span className="text-2xl">{p.emoji}</span>
                      <p className="text-xs mt-2 font-medium text-gray-700 dark:text-gray-300 capitalize">{p.label}</p>
                    </div>
                  ))}
                </div>
                <Link to="/onboarding" className="inline-block mt-4 text-sm text-vercel-violet font-medium hover:underline">Edit Preferences →</Link>
              </div>
              <button onClick={saveProfile} disabled={saving} className="bg-gradient-to-r from-vercel-violet to-vercel-violet text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* ─── MY TRIPS ─── */}
          {tab === 'trips' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Trips</h2>
              <div className="text-center py-16 bg-card rounded-2xl border border-border border-dashed">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No trips yet</h3>
                <p className="text-muted-foreground mb-6">Plan your first trip with our AI assistant!</p>
                <Link to="/assistant" className="inline-block bg-vercel-violet text-white font-bold py-3 px-8 rounded-xl hover:opacity-90">
                  <Sparkles className="w-4 h-4 inline mr-2" />Plan a Trip
                </Link>
              </div>
            </div>
          )}

          {/* ─── WISHLIST ─── */}
          {tab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wishlist</h2>
              <div className="text-center py-16 bg-card rounded-2xl border border-border border-dashed">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Your wishlist is empty</h3>
                <p className="text-muted-foreground mb-6">Explore destinations and save your favorites!</p>
                <Link to="/explore" className="inline-block bg-vercel-violet text-white font-bold py-3 px-8 rounded-xl hover:opacity-90">
                  Explore Destinations
                </Link>
              </div>
            </div>
          )}

          {/* ─── COINS & PREMIUM ─── */}
          {tab === 'coins' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Coins & Premium</h2>

              {/* Balance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/30">
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">🪙 Your Coins</h3>
                  <p className="text-5xl font-extrabold text-yellow-500">{user.coins ?? 0}</p>
                  <p className="text-sm text-gray-500 mt-2">Earn by referring friends, daily login & reviews</p>
                </div>
                <div className={`p-6 rounded-2xl border ${hasPass ? 'bg-gradient-to-br from-vercel-violet/15 to-vercel-violet/5 border-vercel-violet/30' : 'bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/5 dark:to-white/[0.02] border-gray-200 dark:border-white/10'}`}>
                  <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">👑 Active Pass</h3>
                  {hasPass ? (
                    <div>
                      <p className="text-2xl font-extrabold text-vercel-violet capitalize">{user.activePass?.type} Pass</p>
                      <p className="text-sm text-gray-500 mt-1">Expires: {new Date(user.activePass!.expiresAt).toLocaleDateString()}</p>
                      <p className="text-xs text-green-500 font-bold mt-2">✅ Unlimited AI access active</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No active pass. Buy one below for unlimited AI!</p>
                  )}
                </div>
              </div>

              {/* Feature Costs */}
              <div>
                <h3 className="font-bold mb-3 text-gray-900 dark:text-white">What costs coins?</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {FEATURE_COSTS.map(f => (
                    <div key={f.name} className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10">
                      <span className="text-xl">{f.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{f.name}</p>
                        <p className="text-xs text-yellow-600 font-bold">{f.cost} coins</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buy Coins */}
              <div>
                <h3 className="font-bold mb-3 text-gray-900 dark:text-white">💰 Buy Coins</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {COIN_PACKAGES.map(pkg => (
                    <div key={pkg.id} className={`relative p-6 rounded-2xl border text-center ${pkg.popular ? 'border-vercel-violet bg-vercel-violet/5 ring-2 ring-vercel-violet/30' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a24]'}`}>
                      {pkg.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-vercel-violet text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>}
                      <p className="text-3xl font-extrabold text-yellow-500 mb-1">🪙 {pkg.coins}</p>
                      <p className="text-sm text-gray-500 mb-4">coins</p>
                      <button onClick={() => buyCoins(pkg.id)} disabled={buying === pkg.id} className="w-full bg-gradient-to-r from-vercel-violet to-vercel-violet text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50">
                        {buying === pkg.id ? 'Processing...' : `₹${pkg.price}`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buy Passes */}
              <div>
                <h3 className="font-bold mb-3 text-gray-900 dark:text-white">🎫 Buy Pass — Unlimited AI Access</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PASS_PLANS.map(plan => (
                    <div key={plan.id} className={`relative p-6 rounded-2xl border ${plan.best ? 'border-yellow-500 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 ring-2 ring-yellow-500/30' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a24]'}`}>
                      {plan.best && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">BEST VALUE</span>}
                      <div className="flex items-center gap-2 mb-3 justify-center text-gray-700 dark:text-gray-300">
                        {plan.icon} <span className="font-bold">{plan.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{plan.duration}</p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-4 text-left">
                        <li className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Unlimited AI features</li>
                        <li className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> No coin deduction</li>
                        <li className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" /> Priority generation</li>
                      </ul>
                      <button onClick={() => buyPass(plan.id)} disabled={buying === plan.id} className={`w-full font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 ${plan.best ? 'bg-yellow-500 text-black' : 'bg-gradient-to-r from-vercel-violet to-vercel-violet text-white'}`}>
                        {buying === plan.id ? 'Activating...' : `₹${plan.price}`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Earn Coins */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/30">
                <h3 className="font-bold mb-3 text-gray-900 dark:text-white">🎁 Earn Free Coins</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-3"><span className="text-xl">📅</span><div><p className="font-medium text-gray-800 dark:text-gray-200">Daily Login</p><p className="text-xs text-green-500 font-bold">+5 coins/day</p></div></div>
                  <div className="flex items-center gap-3"><span className="text-xl">👥</span><div><p className="font-medium text-gray-800 dark:text-gray-200">Refer a Friend</p><p className="text-xs text-green-500 font-bold">+25 coins</p></div></div>
                  <div className="flex items-center gap-3"><span className="text-xl">⭐</span><div><p className="font-medium text-gray-800 dark:text-gray-200">Write a Review</p><p className="text-xs text-green-500 font-bold">+10 coins</p></div></div>
                </div>
              </div>
            </div>
          )}

          {/* ─── SETTINGS ─── */}
          {tab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
              <div className="space-y-4">
                {/* Language */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 flex items-center justify-between">
                  <div><p className="font-medium text-gray-900 dark:text-white">Language</p><p className="text-sm text-gray-500">{lang === 'en' ? 'English' : 'हिंदी'}</p></div>
                  <select value={lang} onChange={e => { setLang(e.target.value as 'en' | 'hi'); saveSettings('language', e.target.value); }} className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white outline-none">
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                  </select>
                </div>
                {/* Theme */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 flex items-center justify-between">
                  <div><p className="font-medium text-gray-900 dark:text-white">Theme</p><p className="text-sm text-gray-500">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p></div>
                  <button onClick={toggleTheme} className="bg-vercel-violet/10 text-vercel-violet font-medium px-4 py-2 rounded-lg text-sm hover:bg-vercel-violet/20 transition-colors">
                    Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                  </button>
                </div>
                {/* Notifications */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 flex items-center justify-between">
                  <div><p className="font-medium text-gray-900 dark:text-white">Notifications</p><p className="text-sm text-gray-500">{user.settings?.notifications !== false ? 'Enabled' : 'Disabled'}</p></div>
                  <button onClick={() => { const val = !(user.settings?.notifications !== false); updateUser({ settings: { ...user.settings, notifications: val } }); saveSettings('notifications', val); }} className="text-sm text-vercel-violet font-medium px-4 py-2 rounded-lg border border-vercel-violet/30 hover:bg-vercel-violet/5">
                    {user.settings?.notifications !== false ? 'Disable' : 'Enable'}
                  </button>
                </div>
                {/* Email Updates */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 flex items-center justify-between">
                  <div><p className="font-medium text-gray-900 dark:text-white">Email Updates</p><p className="text-sm text-gray-500">{user.settings?.emailUpdates !== false ? 'Enabled' : 'Disabled'}</p></div>
                  <button onClick={() => { const val = !(user.settings?.emailUpdates !== false); updateUser({ settings: { ...user.settings, emailUpdates: val } }); saveSettings('emailUpdates', val); }} className="text-sm text-vercel-violet font-medium px-4 py-2 rounded-lg border border-vercel-violet/30 hover:bg-vercel-violet/5">
                    {user.settings?.emailUpdates !== false ? 'Disable' : 'Enable'}
                  </button>
                </div>
                {/* Delete Account */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#1a1a24] border border-gray-200 dark:border-white/10 flex items-center justify-between">
                  <div><p className="font-medium text-red-500">Delete Account</p><p className="text-sm text-gray-500">This action is irreversible</p></div>
                  <button className="text-sm text-red-500 font-medium border border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-500/10">Delete</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
