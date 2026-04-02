// import { useState, useEffect, useMemo } from 'react';
// import { Link } from 'react-router';
// import { Clock, Search, SlidersHorizontal, ArrowUpDown, Eye, Heart, Calendar, User, TrendingUp } from 'lucide-react';
// import { useAppStore } from '../store/useAppStore';
// import { fetchApi } from '../lib/api';
// import Footer from '../components/layout/Footer';

import { useState, useEffect, useMemo } from 'react';
import { Clock, Search, ArrowUpDown, Eye, Calendar, TrendingUp } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { fetchApi } from '../lib/api';
import Footer from '../components/layout/Footer';

interface BlogData {
  _id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  img: string;
  author: string;
  views: number;
  tags?: string[];
  createdAt: string;
}

const CATEGORIES = ['All', 'Budget', 'Couples', 'Culture', 'Food', 'Adventure', 'Seasonal', 'Spiritual', 'Guides', 'Solo'];

export default function Blog() {
  const { t } = useAppStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [blogs, setBlogs] = useState<BlogData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogs();
  }, [activeCategory, sortBy, search]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (activeCategory !== 'All') params.set('category', activeCategory);
      if (sortBy === 'popular') params.set('sort', 'popular');
      const qs = params.toString();
      const data = await fetchApi(`/blogs${qs ? '?' + qs : ''}`);
      if (Array.isArray(data)) setBlogs(data);
    } catch (err) {
      console.error('Failed to load blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const topBlogs = useMemo(() => {
    return [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  }, [blogs]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return dateStr; }
  };

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-vercel-violet/10 to-transparent py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground">{t('blog.title')}</h1>
          <p className="text-muted-foreground text-lg">AI-curated content to inspire your next journey across India</p>
          <div className="relative max-w-lg mx-auto mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('blog.search')} className="w-full pl-12 pr-4 py-3 bg-card border border-border text-foreground placeholder-muted-foreground rounded-full outline-none focus:ring-2 focus:ring-vercel-violet" />
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-vercel-violet text-white border-vercel-violet' : 'border-border bg-card text-foreground hover:bg-vercel-violet/10 hover:border-vercel-violet/40'}`}>{cat}</button>
          ))}
        </div>
        <button onClick={() => setSortBy(sortBy === 'latest' ? 'popular' : 'latest')} className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-foreground text-sm font-medium hover:border-vercel-violet/40 transition-colors">
          <ArrowUpDown className="w-4 h-4" /> {sortBy === 'latest' ? 'Latest' : 'Popular'}
        </button>
      </div>

      {/* Main Content: Blog Cards + Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-8 flex-1">
        {/* Blog Grid — Left */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-4">{blogs.length} articles found</p>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="rounded-2xl bg-card border border-border overflow-hidden animate-pulse">
                  <div className="h-52 bg-secondary" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-secondary rounded w-1/3" />
                    <div className="h-5 bg-secondary rounded w-4/5" />
                    <div className="h-4 bg-secondary rounded w-full" />
                    <div className="h-4 bg-secondary rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                {search ? 'Try a different search term.' : 'No blogs published yet. Check back soon!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {blogs.map(blog => (
                <article key={blog._id || blog.slug} className="group rounded-2xl bg-card border border-border overflow-hidden hover:border-vercel-violet/40 hover:shadow-lg transition-all cursor-pointer">
                  <div className="h-52 overflow-hidden relative">
                    {blog.img ? (
                      <img src={blog.img} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-vercel-violet/20 to-neon-cyan/10 flex items-center justify-center">
                        <span className="text-4xl">📝</span>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full bg-vercel-violet text-white">{blog.category}</span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(blog.createdAt)}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {(blog.views || 0).toLocaleString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-vercel-violet transition-colors">{blog.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">{blog.excerpt}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-vercel-violet/20 flex items-center justify-center text-vercel-violet text-xs font-bold">{(blog.author || 'T')[0]}</div>
                        <span className="text-xs text-muted-foreground">{blog.author || 'TravAI Team'}</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" /> {blog.readTime || '5 min'}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar — Right (Top Blogs) */}
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-2xl bg-card border border-border p-5">
              <h3 className="font-bold text-foreground flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-vercel-violet" /> Top Blogs</h3>
              <div className="space-y-4">
                {topBlogs.length > 0 ? topBlogs.map((b, i) => (
                  <div key={b._id || b.slug} className="flex gap-3 cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-vercel-violet/10 flex items-center justify-center text-vercel-violet font-bold text-sm shrink-0">{i + 1}</div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">{formatDate(b.createdAt)}</p>
                      <h4 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-vercel-violet transition-colors">{b.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{b.excerpt}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No blogs yet.</p>
                )}
              </div>
            </div>

            {/* Newsletter */}
            <div className="rounded-2xl bg-gradient-to-br from-vercel-violet/10 to-neon-cyan/5 border border-vercel-violet/20 p-5 text-center space-y-3">
              <h3 className="font-bold text-foreground">📬 Travel Newsletter</h3>
              <p className="text-xs text-muted-foreground">Get weekly travel stories & AI tips in your inbox</p>
              <input placeholder="Email address" className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground outline-none focus:ring-2 focus:ring-vercel-violet" />
              <button className="w-full bg-vercel-violet text-white text-sm font-bold py-2 rounded-lg hover:opacity-90 transition-opacity">Subscribe</button>
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}
