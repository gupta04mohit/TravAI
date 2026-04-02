import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Navigation, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { fetchApi } from '../lib/api';

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAppStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabels = ['', 'Weak', 'Medium', 'Strong'];
  const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('Please fill all required fields'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const data = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: form.name, email: form.email, mobile: form.phone, password: form.password }),
      });
      login(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full flex-row-reverse">
      {/* Right illustration */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-neon-cyan/10 via-background to-vercel-violet/20 relative items-center justify-center">
        <div className="text-center px-12 space-y-6">
          <div className="inline-flex p-4 rounded-2xl bg-vercel-violet/10 border border-vercel-violet/20">
            <Navigation className="w-16 h-16 text-vercel-violet" />
          </div>
          <h1 className="text-5xl font-bold text-foreground">Start Your Journey</h1>
          <p className="text-lg text-muted-foreground max-w-sm">Join our intelligent travel ecosystem. Plan, explore, and earn rewards.</p>
          <div className="flex justify-center gap-6 pt-4">
            {['🎯 AI Planning', '🪙 Earn Coins', '🗺️ 523 Destinations'].map(f => (
              <span key={f} className="text-sm text-foreground bg-secondary border border-border px-3 py-2 rounded-lg">{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Left form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 py-8 bg-background">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-foreground">Create an Account</h2>
            <p className="mt-2 text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-vercel-violet font-medium hover:underline">Sign in here</Link></p>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm px-4 py-3 rounded-xl">{error}</div>}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className="w-full bg-secondary border border-border text-foreground rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-vercel-violet placeholder-muted-foreground" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email Address *</label>
              <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="w-full bg-secondary border border-border text-foreground rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-vercel-violet placeholder-muted-foreground" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Mobile (Optional)</label>
              <div className="flex gap-2">
                <select className="bg-secondary border border-border text-foreground rounded-xl px-3 outline-none"><option>+91</option></select>
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className="flex-1 bg-secondary border border-border text-foreground rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-vercel-violet placeholder-muted-foreground" placeholder="9876543210" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password *</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} className="w-full bg-secondary border border-border text-foreground rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-vercel-violet placeholder-muted-foreground" placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColors[strength] : 'bg-secondary'}`} />)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-right">{strengthLabels[strength]}</p>
                </>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full mt-2 bg-gradient-to-r from-vercel-violet to-vercel-violet text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-background text-muted-foreground">Or</span></div>
            </div>

            <button type="button" className="w-full flex items-center justify-center gap-2 bg-secondary border border-border text-foreground font-medium py-3 px-4 rounded-xl hover:bg-secondary/70 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 24c2.87 0 5.28-.95 7.04-2.58l-3.57-2.77c-.95.64-2.17 1.02-3.47 1.02-2.68 0-4.96-1.81-5.77-4.25H2.49v2.86C4.25 21.78 7.82 24 12 24z" /><path fill="#FBBC05" d="M6.23 15.42c-.2-.61-.32-1.26-.32-1.92s.12-1.31.32-1.92V8.72H2.49A11.996 11.996 0 0 0 0 12c0 1.93.46 3.75 1.28 5.38l3.74-2.86z" /><path fill="#EA4335" d="M12 4.67c1.56 0 2.96.54 4.07 1.6l3.05-3.04C17.27 1.41 14.86 0 12 0 7.82 0 4.25 2.22 2.49 5.62l3.74 2.87c.81-2.43 3.09-4.24 5.77-4.24z" /></svg>
              Sign up with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
