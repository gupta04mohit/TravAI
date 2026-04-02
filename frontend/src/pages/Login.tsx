import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Navigation, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { fetchApi } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill all fields'); return; }

    setLoading(true);
    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full">
      {/* Left illustration */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-vercel-violet/20 via-background to-neon-cyan/10 relative items-center justify-center">
        <div className="text-center px-12 space-y-6">
          <div className="inline-flex p-4 rounded-2xl bg-vercel-violet/10 border border-vercel-violet/20">
            <Navigation className="w-16 h-16 text-vercel-violet" />
          </div>
          <h1 className="text-5xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-lg text-muted-foreground max-w-sm">Your intelligent travel companion awaits. Plan smarter, travel better.</p>
          <div className="flex justify-center gap-8 pt-4">
            <div><p className="text-2xl font-bold text-foreground">523</p><p className="text-xs text-muted-foreground">Destinations</p></div>
            <div><p className="text-2xl font-bold text-foreground">1.24L+</p><p className="text-xs text-muted-foreground">Travellers</p></div>
            <div><p className="text-2xl font-bold text-foreground">4.8★</p><p className="text-xs text-muted-foreground">Rating</p></div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 bg-background">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-foreground">Sign in to TravAI</h2>
            <p className="mt-2 text-sm text-muted-foreground">Or <Link to="/signup" className="text-vercel-violet font-medium hover:underline">create a new account</Link></p>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm px-4 py-3 rounded-xl">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-secondary border border-border text-foreground rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-vercel-violet placeholder-muted-foreground" placeholder="you@example.com" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-medium text-foreground">Password</label>
                <a href="#" className="text-sm text-vercel-violet hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-secondary border border-border text-foreground rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-vercel-violet placeholder-muted-foreground" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-vercel-violet to-vercel-violet text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-background text-muted-foreground">Or continue with</span></div>
            </div>

            <button type="button" className="w-full flex items-center justify-center gap-2 bg-secondary border border-border text-foreground font-medium py-3 px-4 rounded-xl hover:bg-secondary/70 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 24c2.87 0 5.28-.95 7.04-2.58l-3.57-2.77c-.95.64-2.17 1.02-3.47 1.02-2.68 0-4.96-1.81-5.77-4.25H2.49v2.86C4.25 21.78 7.82 24 12 24z" /><path fill="#FBBC05" d="M6.23 15.42c-.2-.61-.32-1.26-.32-1.92s.12-1.31.32-1.92V8.72H2.49A11.996 11.996 0 0 0 0 12c0 1.93.46 3.75 1.28 5.38l3.74-2.86z" /><path fill="#EA4335" d="M12 4.67c1.56 0 2.96.54 4.07 1.6l3.05-3.04C17.27 1.41 14.86 0 12 0 7.82 0 4.25 2.22 2.49 5.62l3.74 2.87c.81-2.43 3.09-4.24 5.77-4.24z" /></svg>
              Google Sign-in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
