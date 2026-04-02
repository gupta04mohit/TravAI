import { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, Globe, MapPin, FileText, Users, BarChart3, DollarSign, Search, Plus, X, Pencil, Trash2, Shield, UserCog } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { fetchApi } from '../lib/api';

type Tab = 'dashboard' | 'states' | 'places' | 'blogs' | 'users' | 'analytics' | 'monetization';

/* ─── Type Defs ─── */
interface Blog { _id?: string; title: string; slug: string; excerpt: string; content: string; category: string; author: string; img: string; readTime: string; status: string; seoDescription: string; views: number; }
interface State { _id?: string; name: string; slug: string; tagline: string; img: string; category: string; places: number; status: string; }
interface Place { _id?: string; name: string; state: string; slug: string; rating: number; budget: string; tagline: string; images: string[]; hotels: any[]; foods: any[]; transport: any[]; status: string; }
interface User { _id?: string; name: string; email: string; isAdmin: boolean; isPremium: boolean; coins: number; status: string; createdAt: string; }
interface Stats { users: number; blogs: number; states: number; places: number; publishedBlogs: number; publishedStates: number; publishedPlaces: number; premiumUsers: number; totalCoins: number; }

const BLOG_CATS = ['Budget', 'Couples', 'Culture', 'Food', 'Adventure', 'Seasonal', 'Spiritual', 'Guides', 'Solo'];

export default function Admin() {
  const { user } = useAppStore();
  const [tab, setTab] = useState<Tab>('dashboard');
  
  // ─── ACCESS CONTROL: Only admins can see this page ───
  if (!user || !user.isAdmin) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">You don't have admin privileges. Contact the administrator to get access.</p>
          <a href="/" className="inline-block bg-gradient-to-r from-vercel-violet to-vercel-violet text-white font-bold py-3 px-8 rounded-xl hover:opacity-90">Go Home</a>
        </div>
      </div>
    );
  }

  // Data
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Blog filters
  const [blogSearch, setBlogSearch] = useState('');
  const [blogCategory, setBlogCategory] = useState('All');
  const [blogStatus, setBlogStatus] = useState('All');
  const [blogSort, setBlogSort] = useState<'latest' | 'popular' | 'title'>('latest');

  // Modals
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [showStateModal, setShowStateModal] = useState(false);
  const [editingState, setEditingState] = useState<State | null>(null);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);

  // Load from API
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, sRes, pRes, uRes, stRes] = await Promise.all([
        fetchApi('/admin/blogs'),
        fetchApi('/admin/states'),
        fetchApi('/admin/places'),
        fetchApi('/admin/users'),
        fetchApi('/admin/stats')
      ]);
      if (Array.isArray(bRes)) setBlogs(bRes);
      if (Array.isArray(sRes)) setStates(sRes);
      if (Array.isArray(pRes)) setPlaces(pRes);
      if (Array.isArray(uRes)) setUsersList(uRes);
      if (stRes) setStats(stRes);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = useMemo(() => {
    let list = [...blogs];
    if (blogSearch) list = list.filter(b => b.title.toLowerCase().includes(blogSearch.toLowerCase()) || b.excerpt.toLowerCase().includes(blogSearch.toLowerCase()));
    if (blogCategory !== 'All') list = list.filter(b => b.category === blogCategory);
    if (blogStatus !== 'All') list = list.filter(b => b.status === blogStatus);
    if (blogSort === 'popular') list.sort((a, b) => (b.views || 0) - (a.views || 0));
    else if (blogSort === 'title') list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [blogs, blogSearch, blogCategory, blogStatus, blogSort]);

  // Blogs CRUD
  const saveBlog = async (blog: Blog) => {
    try {
      if (blog._id) {
        const res = await fetchApi(`/admin/blogs/${blog._id}`, { method: 'PUT', body: JSON.stringify(blog) });
        setBlogs(prev => prev.map(b => b._id === res._id ? res : b));
      } else {
        const res = await fetchApi('/admin/blogs', { method: 'POST', body: JSON.stringify(blog) });
        setBlogs(prev => [res, ...prev]);
      }
      setShowBlogModal(false);
      setEditingBlog(null);
      fetchData(); // Refresh stats
    } catch (err: any) { alert(err.message); }
  };

  const deleteBlog = async (blog: Blog) => {
    if (confirm(`Delete "${blog.title}"?`)) {
      try {
        await fetchApi(`/admin/blogs/${blog._id}`, { method: 'DELETE' });
        setBlogs(prev => prev.filter(b => b._id !== blog._id));
        fetchData();
      } catch (err: any) { alert(err.message); }
    }
  };

  // States CRUD
  const saveState = async (state: State) => {
    try {
      if (state._id) {
        const res = await fetchApi(`/admin/states/${state._id}`, { method: 'PUT', body: JSON.stringify(state) });
        setStates(prev => prev.map(s => s._id === res._id ? res : s));
      } else {
        const res = await fetchApi('/admin/states', { method: 'POST', body: JSON.stringify(state) });
        setStates(prev => [res, ...prev]);
      }
      setShowStateModal(false);
      setEditingState(null);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const deleteState = async (state: State) => {
    if (confirm(`Delete "${state.name}"? This will delete associated places.`)) {
      try {
        await fetchApi(`/admin/states/${state._id}`, { method: 'DELETE' });
        setStates(prev => prev.filter(s => s._id !== state._id));
        fetchData(); // places count changes
      } catch (err: any) { alert(err.message); }
    }
  };

  // Places CRUD
  const savePlace = async (place: Place) => {
    try {
      if (place._id) {
        const res = await fetchApi(`/admin/places/${place._id}`, { method: 'PUT', body: JSON.stringify(place) });
        setPlaces(prev => prev.map(p => p._id === res._id ? res : p));
      } else {
        const res = await fetchApi('/admin/places', { method: 'POST', body: JSON.stringify(place) });
        setPlaces(prev => [res, ...prev]);
      }
      setShowPlaceModal(false);
      setEditingPlace(null);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const deletePlace = async (place: Place) => {
    if (confirm(`Delete "${place.name}"?`)) {
      try {
        await fetchApi(`/admin/places/${place._id}`, { method: 'DELETE' });
        setPlaces(prev => prev.filter(p => p._id !== place._id));
        fetchData();
      } catch (err: any) { alert(err.message); }
    }
  };

  // Users Management
  const toggleUserRole = async (usr: User) => {
    if (confirm(`Change admin status for "${usr.name}"?`)) {
      try {
        const res = await fetchApi(`/admin/users/${usr._id}/role`, { method: 'PUT' });
        setUsersList(prev => prev.map(u => u._id === res._id ? res : u));
      } catch (err: any) { alert(err.message); }
    }
  };

  const deleteUser = async (usr: User) => {
    if (confirm(`Delete user "${usr.name}"?`)) {
      try {
        await fetchApi(`/admin/users/${usr._id}`, { method: 'DELETE' });
        setUsersList(prev => prev.filter(u => u._id !== usr._id));
        fetchData();
      } catch (err: any) { alert(err.message); }
    }
  };

  const sidebar = [
    { id: 'dashboard' as Tab, icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { id: 'states' as Tab, icon: <Globe className="w-5 h-5" />, label: 'States' },
    { id: 'places' as Tab, icon: <MapPin className="w-5 h-5" />, label: 'Places' },
    { id: 'blogs' as Tab, icon: <FileText className="w-5 h-5" />, label: 'Blogs' },
    { id: 'users' as Tab, icon: <Users className="w-5 h-5" />, label: 'Users' },
    { id: 'analytics' as Tab, icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' },
    { id: 'monetization' as Tab, icon: <DollarSign className="w-5 h-5" />, label: 'Monetization' },
  ];

  if (loading && !stats) return <div className="p-10 text-center flex-1">Loading admin data...</div>;

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-56 bg-card border-r border-border p-4 space-y-1 shrink-0">
        <div className="px-3 py-2 mb-4">
          <h2 className="font-bold text-lg text-foreground">⚙️ Admin Panel</h2>
          <p className="text-xs text-muted-foreground">Manage all content</p>
        </div>
        {sidebar.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === item.id ? 'bg-vercel-violet text-white' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
            {item.icon} {item.label}
          </button>
        ))}
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto bg-background">
        {errorMsg && <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-500 text-sm px-4 py-3 rounded-xl">{errorMsg}</div>}

        {/* ─── DASHBOARD ─── */}
        {tab === 'dashboard' && stats && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total States', value: stats.states, icon: '🌍', color: 'purple' },
                { label: 'Total Places', value: stats.places, icon: '📍', color: 'blue' },
                { label: 'Total Blogs', value: stats.blogs, icon: '📝', color: 'pink' },
                { label: 'Published Blogs', value: stats.publishedBlogs, icon: '✅', color: 'green' },
              ].map(s => (
                <div key={s.label} className="p-5 rounded-xl bg-card border border-border space-y-2">
                  <span className="text-2xl">{s.icon}</span>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl bg-card border border-border p-5">
                <h3 className="font-bold text-foreground mb-3">Recent Blogs</h3>
                {blogs.slice(0, 4).map(b => (
                  <div key={b.slug} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div><p className="text-sm font-medium text-foreground">{b.title}</p><p className="text-xs text-muted-foreground">{b.author} · {b.category}</p></div>
                    <span className={`text-xs px-2 py-1 rounded-full ${b.status === 'Published' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{b.status}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-card border border-border p-5">
                <h3 className="font-bold text-foreground mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: '+ Add Blog', action: () => { setTab('blogs'); setEditingBlog(null); setShowBlogModal(true); } },
                    { label: '+ Add State', action: () => { setTab('states'); setEditingState(null); setShowStateModal(true); } },
                    { label: '+ Add Place', action: () => { setTab('places'); setEditingPlace(null); setShowPlaceModal(true); } },
                    { label: '📊 View Analytics', action: () => setTab('analytics') },
                  ].map(a => (
                    <button key={a.label} onClick={a.action} className="p-3 rounded-lg bg-secondary border border-border text-foreground text-sm font-medium hover:bg-vercel-violet/10 hover:border-vercel-violet/30 transition-colors">{a.label}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── BLOGS ─── */}
        {tab === 'blogs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Blogs</h1>
              <button onClick={() => { setEditingBlog(null); setShowBlogModal(true); }} className="flex items-center gap-2 bg-vercel-violet text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"><Plus className="w-4 h-4" /> Write Blog</button>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={blogSearch} onChange={e => setBlogSearch(e.target.value)} placeholder="Search blogs..." className="w-full pl-10 pr-4 py-2.5 bg-card border border-border text-foreground placeholder-muted-foreground rounded-lg text-sm outline-none focus:ring-2 focus:ring-vercel-violet" />
              </div>
              <select value={blogCategory} onChange={e => setBlogCategory(e.target.value)} className="bg-card border border-border text-foreground rounded-lg px-3 py-2.5 text-sm outline-none">
                <option value="All">All Categories</option>
                {BLOG_CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={blogStatus} onChange={e => setBlogStatus(e.target.value)} className="bg-card border border-border text-foreground rounded-lg px-3 py-2.5 text-sm outline-none">
                <option value="All">All Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
              <select value={blogSort} onChange={e => setBlogSort(e.target.value as any)} className="bg-card border border-border text-foreground rounded-lg px-3 py-2.5 text-sm outline-none">
                <option value="latest">Sort: Latest</option>
                <option value="popular">Sort: Popular</option>
                <option value="title">Sort: A–Z</option>
              </select>
              <span className="text-sm text-muted-foreground">{filteredBlogs.length} results</span>
            </div>

            {/* Blog Table */}
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-secondary">
                  <th className="text-left p-3 font-semibold text-muted-foreground">TITLE</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground">AUTHOR</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground">CATEGORY</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground">VIEWS</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground">STATUS</th>
                  <th className="text-right p-3 font-semibold text-muted-foreground">ACTIONS</th>
                </tr></thead>
                <tbody>
                  {filteredBlogs.map(blog => (
                    <tr key={blog.slug} className="border-t border-border hover:bg-secondary/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {blog.img && <img src={blog.img} className="w-12 h-9 rounded object-cover" />}
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">{blog.title}</p>
                            <p className="text-xs text-muted-foreground">{blog.readTime}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{blog.author}</td>
                      <td className="p-3"><span className="text-xs px-2 py-1 rounded-full bg-vercel-violet/10 text-vercel-violet">{blog.category}</span></td>
                      <td className="p-3 text-muted-foreground">{(blog.views || 0).toLocaleString()}</td>
                      <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${blog.status === 'Published' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{blog.status}</span></td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditingBlog(blog); setShowBlogModal(true); }} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => deleteBlog(blog)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredBlogs.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No blogs found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── STATES ─── */}
        {tab === 'states' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">States</h1>
              <button onClick={() => { setEditingState(null); setShowStateModal(true); }} className="flex items-center gap-2 bg-vercel-violet text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90"><Plus className="w-4 h-4" /> Add State</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {states.map(state => (
                <div key={state.slug} className="rounded-xl bg-card border border-border overflow-hidden">
                  <div className="h-32 overflow-hidden relative"><img src={state.img} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" /><div className="absolute bottom-2 left-3 text-white"><h3 className="font-bold">{state.name}</h3><p className="text-xs text-white/70">{state.tagline}</p></div></div>
                  <div className="p-3 flex items-center justify-between">
                    <div><span className="text-xs text-muted-foreground">{state.places || 0} places</span><span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${state.status === 'Published' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{state.status}</span></div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingState(state); setShowStateModal(true); }} className="p-1.5 rounded hover:bg-secondary text-muted-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteState(state)} className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {states.length === 0 && <div className="col-span-3 p-6 text-center text-muted-foreground border border-border rounded-xl">No states found.</div>}
            </div>
          </div>
        )}

        {/* ─── PLACES ─── */}
        {tab === 'places' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Places</h1>
              <button onClick={() => { setEditingPlace(null); setShowPlaceModal(true); }} className="flex items-center gap-2 bg-vercel-violet text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90"><Plus className="w-4 h-4" /> Add Place</button>
            </div>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-secondary">
                  <th className="text-left p-3 text-muted-foreground font-semibold">PLACE</th>
                  <th className="text-left p-3 text-muted-foreground font-semibold">STATE</th>
                  <th className="text-left p-3 text-muted-foreground font-semibold">RATING</th>
                  <th className="text-left p-3 text-muted-foreground font-semibold">BUDGET</th>
                  <th className="text-left p-3 text-muted-foreground font-semibold">STATUS</th>
                  <th className="text-right p-3 text-muted-foreground font-semibold">ACTIONS</th>
                </tr></thead>
                <tbody>
                  {places.map(place => (
                    <tr key={place.slug} className="border-t border-border hover:bg-secondary/50">
                      <td className="p-3 font-medium text-foreground">{place.name}</td>
                      <td className="p-3 text-muted-foreground">{place.state}</td>
                      <td className="p-3 text-foreground">⭐ {place.rating}</td>
                      <td className="p-3 text-muted-foreground">{place.budget}</td>
                      <td className="p-3"><span className={`text-xs px-2 py-1 rounded-full ${place.status === 'Published' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{place.status}</span></td>
                      <td className="p-3 text-right flex justify-end gap-2">
                        <button onClick={() => { setEditingPlace(place); setShowPlaceModal(true); }} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => deletePlace(place)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {places.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No places found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── USERS ─── */}
        {tab === 'users' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Users Management</h1>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-secondary">
                  <th className="text-left p-3 font-semibold text-muted-foreground">NAME</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground">EMAIL</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground">ROLE</th>
                  <th className="text-left p-3 font-semibold text-muted-foreground">COINS</th>
                  <th className="text-right p-3 font-semibold text-muted-foreground">ACTIONS</th>
                </tr></thead>
                <tbody>
                  {usersList.map((usr: any) => (
                    <tr key={usr._id} className="border-t border-border hover:bg-secondary/50">
                      <td className="p-3 font-medium text-foreground">{usr.name}</td>
                      <td className="p-3 text-muted-foreground">{usr.email}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${usr.isAdmin ? 'bg-vercel-violet/10 text-vercel-violet' : 'bg-secondary text-muted-foreground'}`}>{usr.isAdmin ? 'Admin' : 'User'}</span>
                        {usr.isPremium && <span className="ml-2 text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500">Premium</span>}
                      </td>
                      <td className="p-3 font-semibold text-yellow-500">🪙 {usr.coins || 0}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-2">
                          {usr._id !== user.id && (
                            <>
                              <button onClick={() => toggleUserRole(usr)} title="Toggle Admin Role" className="p-2 rounded-lg hover:bg-secondary text-muted-foreground"><UserCog className="w-4 h-4" /></button>
                              <button onClick={() => deleteUser(usr)} title="Delete User" className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {usersList.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No users found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── ANALYTICS ─── */}
        {tab === 'analytics' && stats && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[{ label: 'Total Users', value: stats.users }, { label: 'Published Blogs', value: stats.publishedBlogs }, { label: 'Active Places', value: stats.publishedPlaces }, { label: 'Total States', value: stats.publishedStates }].map(s => (
                <div key={s.label} className="p-5 rounded-xl bg-card border border-border"><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>
              ))}
            </div>
          </div>
        )}

        {/* ─── MONETIZATION ─── */}
        {tab === 'monetization' && stats && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-foreground">Monetization</h1>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[{ label: 'Premium Users', value: stats.premiumUsers }, { label: 'Coins Distributed', value: stats.totalCoins }].map(s => (
                <div key={s.label} className="p-5 rounded-xl bg-card border border-border"><p className="text-2xl font-bold text-foreground">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ═══ BLOG MODAL ═══ */}
      {showBlogModal && <BlogModal blog={editingBlog} onSave={saveBlog} onClose={() => { setShowBlogModal(false); setEditingBlog(null); }} />}
      {showStateModal && <StateModal state={editingState} onSave={saveState} onClose={() => { setShowStateModal(false); setEditingState(null); }} />}
      {showPlaceModal && <PlaceModal place={editingPlace} states={states} onSave={savePlace} onClose={() => { setShowPlaceModal(false); setEditingPlace(null); }} />}
    </div>
  );
}

/* ═══ Blog Editor Modal ═══ */
function BlogModal({ blog, onSave, onClose }: { blog: Blog | null; onSave: (b: Blog) => void; onClose: () => void }) {
  const [form, setForm] = useState<Blog>(blog || { title: '', slug: '', excerpt: '', content: '', category: 'Budget', author: 'TravAI Team', img: '', readTime: '5 min', status: 'Draft', seoDescription: '', views: 0 });
  const u = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-foreground">{blog ? 'Edit Blog' : 'Write New Blog'}</h2><button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-foreground">Title *</label><input value={form.title} onChange={e => u('title', e.target.value)} className="w-full mt-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none" placeholder="Blog title..." /></div>
          <div><label className="text-sm font-medium text-foreground">Author</label><input value={form.author} onChange={e => u('author', e.target.value)} className="w-full mt-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none" /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="text-sm font-medium text-foreground">Category</label><select value={form.category} onChange={e => u('category', e.target.value)} className="w-full mt-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none">{BLOG_CATS.map(c => <option key={c}>{c}</option>)}</select></div>
          <div><label className="text-sm font-medium text-foreground">Status</label><select value={form.status} onChange={e => u('status', e.target.value)} className="w-full mt-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none"><option>Draft</option><option>Published</option></select></div>
          <div><label className="text-sm font-medium text-foreground">Read Time</label><input value={form.readTime} onChange={e => u('readTime', e.target.value)} className="w-full mt-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none" /></div>
        </div>
        <div><label className="text-sm font-medium text-foreground">Excerpt</label><textarea value={form.excerpt} onChange={e => u('excerpt', e.target.value)} rows={2} className="w-full mt-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none resize-none" placeholder="Short summary..." /></div>
        <div><label className="text-sm font-medium text-foreground">Featured Image URL</label><input value={form.img} onChange={e => u('img', e.target.value)} className="w-full mt-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none" placeholder="https://..." /></div>
        {form.img && <img src={form.img} className="w-full h-32 object-cover rounded-lg" />}
        <div><label className="text-sm font-medium text-foreground">Content (Markdown)</label><textarea value={form.content} onChange={e => u('content', e.target.value)} rows={8} className="w-full mt-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none resize-none font-mono" placeholder="Write your blog content here using Markdown..." /></div>
        <div><label className="text-sm font-medium text-foreground">SEO Meta Description</label><input value={form.seoDescription} onChange={e => u('seoDescription', e.target.value)} className="w-full mt-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none" placeholder="Concise description for search engines" /></div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-foreground text-sm hover:bg-secondary">Cancel</button>
          <button onClick={() => onSave(form)} className="px-6 py-2 rounded-lg bg-vercel-violet text-white text-sm font-bold hover:opacity-90">{blog ? 'Save Changes' : 'Publish Blog'}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══ State Editor Modal ═══ */
function StateModal({ state, onSave, onClose }: { state: State | null; onSave: (s: State) => void; onClose: () => void }) {
  const [form, setForm] = useState<State>(state || { name: '', slug: '', tagline: '', img: '', category: '', places: 0, status: 'Draft' });
  const u = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-foreground">{state ? 'Edit State' : 'Add State'}</h2><button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button></div>
        <div><label className="text-sm font-medium text-foreground">State Name *</label><input value={form.name} onChange={e => u('name', e.target.value)} className="w-full mt-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none" /></div>
        <div><label className="text-sm font-medium text-foreground">Tagline</label><input value={form.tagline} onChange={e => u('tagline', e.target.value)} className="w-full mt-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-foreground">Category</label><input value={form.category} onChange={e => u('category', e.target.value)} className="w-full mt-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none" placeholder="Nature, Historical..." /></div>
          <div><label className="text-sm font-medium text-foreground">Status</label><select value={form.status} onChange={e => u('status', e.target.value)} className="w-full mt-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none"><option>Draft</option><option>Published</option></select></div>
        </div>
        <div><label className="text-sm font-medium text-foreground">Image URL</label><input value={form.img} onChange={e => u('img', e.target.value)} className="w-full mt-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none" placeholder="https://..." /></div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-foreground text-sm hover:bg-secondary">Cancel</button>
          <button onClick={() => onSave(form)} className="px-6 py-2 rounded-lg bg-vercel-violet text-white text-sm font-bold hover:opacity-90">{state ? 'Update' : 'Add State'}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══ Place Editor Modal ═══ */
function PlaceModal({ place, states, onSave, onClose }: { place: Place | null; states: State[]; onSave: (p: Place) => void; onClose: () => void }) {
  const [form, setForm] = useState<Place>(place || { name: '', state: '', slug: '', rating: 4.0, budget: 'Medium', tagline: '', images: [], hotels: [], foods: [], transport: [], status: 'Draft' });
  const u = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const addHotel = () => setForm(f => ({ ...f, hotels: [...f.hotels, { name: '', price: '', rating: 4.0, tier: 'Budget' }] }));
  const addFood = () => setForm(f => ({ ...f, foods: [...f.foods, { name: '', price: '', veg: true }] }));
  const addTransport = () => setForm(f => ({ ...f, transport: [...f.transport, { type: 'Flight', from: '', cost: '' }] }));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-foreground">{place ? 'Edit Place' : 'Add New Place'}</h2><button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button></div>

        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">BASIC INFO</p>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-foreground">Place Name</label><input value={form.name} onChange={e => u('name', e.target.value)} className="w-full mt-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none" /></div>
          <div><label className="text-sm font-medium text-foreground">State</label><select value={form.state} onChange={e => u('state', e.target.value)} className="w-full mt-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none"><option value="">Select</option>{states.map(s => <option key={s.slug} value={s.name}>{s.name}</option>)}</select></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium text-foreground">Budget Tier</label><select value={form.budget} onChange={e => u('budget', e.target.value)} className="w-full mt-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none"><option>Budget</option><option>Medium</option><option>Luxury</option></select></div>
          <div><label className="text-sm font-medium text-foreground">Status</label><select value={form.status} onChange={e => u('status', e.target.value)} className="w-full mt-1 bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none"><option>Draft</option><option>Published</option></select></div>
        </div>

        {/* Hotels */}
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider pt-2">🏨 HOTELS & ACCOMMODATION</p>
        {form.hotels.map((h: any, i: number) => (
          <div key={i} className="grid grid-cols-4 gap-2">
            <input value={h.name} onChange={e => { const arr = [...form.hotels]; arr[i].name = e.target.value; u('hotels', arr); }} placeholder="Hotel Name" className="bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none" />
            <input value={h.price} onChange={e => { const arr = [...form.hotels]; arr[i].price = e.target.value; u('hotels', arr); }} placeholder="Price (₹)" className="bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none" />
            <input type="number" step="0.1" value={h.rating} onChange={e => { const arr = [...form.hotels]; arr[i].rating = +e.target.value; u('hotels', arr); }} placeholder="Rating" className="bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none" />
            <button onClick={() => u('hotels', form.hotels.filter((_: any, j: number) => j !== i))} className="text-red-500 text-xs">Remove</button>
          </div>
        ))}
        <button onClick={addHotel} className="text-sm text-vercel-violet font-semibold">+ Add Hotel</button>

        {/* Food */}
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider pt-2">🍜 FOOD & DINING</p>
        {form.foods.map((f: any, i: number) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <input value={f.name} onChange={e => { const arr = [...form.foods]; arr[i].name = e.target.value; u('foods', arr); }} placeholder="Dish Name" className="bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none" />
            <input value={f.price} onChange={e => { const arr = [...form.foods]; arr[i].price = e.target.value; u('foods', arr); }} placeholder="Price (₹)" className="bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none" />
            <button onClick={() => u('foods', form.foods.filter((_: any, j: number) => j !== i))} className="text-red-500 text-xs">Remove</button>
          </div>
        ))}
        <button onClick={addFood} className="text-sm text-vercel-violet font-semibold">+ Add Food</button>

        {/* Transport */}
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider pt-2">🚌 TRANSPORT</p>
        {form.transport.map((t: any, i: number) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <select value={t.type} onChange={e => { const arr = [...form.transport]; arr[i].type = e.target.value; u('transport', arr); }} className="bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none"><option>Flight</option><option>Train</option><option>Bus</option><option>Local</option></select>
            <input value={t.from} onChange={e => { const arr = [...form.transport]; arr[i].from = e.target.value; u('transport', arr); }} placeholder="From" className="bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none" />
            <input value={t.cost} onChange={e => { const arr = [...form.transport]; arr[i].cost = e.target.value; u('transport', arr); }} placeholder="Cost (₹)" className="bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm outline-none" />
          </div>
        ))}
        <button onClick={addTransport} className="text-sm text-vercel-violet font-semibold">+ Add Transport</button>

        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-foreground text-sm hover:bg-secondary">Cancel</button>
          <button onClick={() => onSave(form)} className="px-6 py-2 rounded-lg bg-vercel-violet text-white text-sm font-bold hover:opacity-90">{place ? 'Save Changes' : 'Add Place'}</button>
        </div>
      </div>
    </div>
  );
}
