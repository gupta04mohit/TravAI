import { Link } from 'react-router';
import { Navigation } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-zinc-950 text-white py-16 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-vercel-violet/10 p-2 rounded-lg">
                <Navigation className="w-7 h-7 text-vercel-violet" />
              </div>
              <span className="text-2xl font-bold tracking-tight">TravAI</span>
            </Link>
            <p className="text-sm text-zinc-400">Your AI Travel Decision System</p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-zinc-400 hover:text-white transition-colors text-xl">𝕏</a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors text-xl">📷</a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors text-xl">▶️</a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-zinc-300 mb-4">Product</h4>
            <ul className="space-y-3">
              {[
                { name: 'Home', path: '/' },
                { name: 'Explore', path: '/explore' },
                { name: 'AI Planner', path: '/assistant' },
                { name: 'Blog', path: '/blog' },
                { name: 'Pricing', path: '#' }
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-zinc-400 hover:text-white transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-zinc-300 mb-4">Company</h4>
            <ul className="space-y-3">
              {['About', 'Careers', 'Contact', 'Press', 'For Partners'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-zinc-300 mb-4">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookies'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
            <p className="text-sm text-zinc-500 mt-6">Made with ❤️ in India</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500">© 2026 TravAI. All rights reserved.</p>
          <p className="text-sm text-zinc-500">Version 1.2.0 – March 2026 · <a href="#" className="text-vercel-violet hover:underline">Roadmap</a></p>
        </div>
      </div>
    </footer>
  );
}
