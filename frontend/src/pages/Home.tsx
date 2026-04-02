import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Sparkles, SearchIcon, Heart, Share2, MapPin, TrendingUp, Map,
  ChevronRight, Play, ArrowRight, Star, Sun, MessageCircle, BookOpen, Quote, Video
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { fetchApi } from '../lib/api';
import Footer from '../components/layout/Footer';

// Fallback data if backend returns empty
const CATEGORIES = [
  { name: 'Beaches', emoji: '🏖️', count: 0 },
  { name: 'Mountains', emoji: '🏔️', count: 0 },
  { name: 'Historical', emoji: '🏛️', count: 0 },
  { name: 'Food Trails', emoji: '🍜', count: 0 },
  { name: 'Wildlife', emoji: '🐅', count: 0 },
  { name: 'Spiritual', emoji: '🕉️', count: 0 },
];

const REVIEWS = [
  { name: "Aarav K.", role: "Solo Traveler", text: "The AI planned my entire 7-day Ladakh trip perfectly. Saved me hours of research!", rating: 5 },
  { name: "Priya S.", role: "Couple", text: "Found the most romantic hidden gems in Kerala through the blogs and explore section.", rating: 5 },
  { name: "Rohan M.", role: "Backpacker", text: "Budget estimations are incredibly accurate. The UI is just gorgeous and easy to use.", rating: 4.5 },
];

const STATS = [
  { num: '1.2L+', label: 'Happy Travellers' },
  { num: '523', label: 'Destinations' },
  { num: '50k+', label: 'AI Plans Generated' },
];

interface StateData {
  _id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  img?: string;
  category?: string;
  bestSeason?: string;
  famous?: string;
  places?: number;
}

interface PlaceData {
  _id: string;
  name: string;
  slug?: string;
  state: string;
  gallery?: string[];
  images?: string[];
  rating?: number;
  budgetTier?: string;
  estimatedCost?: string;
  categories?: string[];
  tags?: string[];
}

interface BlogData {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  readTime?: string;
  img?: string;
  author?: string;
  createdAt?: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useAppStore();
  const [states, setStates] = useState<StateData[]>([]);
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [blogs, setBlogs] = useState<BlogData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statesRes, placesRes, blogsRes] = await Promise.allSettled([
          fetchApi('/states'),
          fetchApi('/places'),
          fetchApi('/blogs'),
        ]);
        if (statesRes.status === 'fulfilled' && Array.isArray(statesRes.value)) setStates(statesRes.value);
        if (placesRes.status === 'fulfilled' && Array.isArray(placesRes.value)) setPlaces(placesRes.value);
        if (blogsRes.status === 'fulfilled' && Array.isArray(blogsRes.value)) setBlogs(blogsRes.value);
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const trendingPlaces = places.slice(0, 3);
  const trendingStates = states.slice(0, 3);
  const latestBlogs = blogs.slice(0, 3);

  const getPlaceImage = (place: PlaceData) => {
    if (place.gallery && place.gallery.length > 0) return place.gallery[0];
    if (place.images && place.images.length > 0) return place.images[0];
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600';
  };

  return (
    <div className="w-full flex-1 flex flex-col">

      {/* ═══════════ 1. HERO WITH DYNAMIC COLLAGE ═══════════ */}
      <section className="relative w-full overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-vercel-violet/5 via-background to-neon-cyan/5" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-vercel-violet/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Search & Copy */}
            <div className="space-y-8 z-10">
              <div className="inline-flex items-center gap-2 bg-vercel-violet/10 border border-vercel-violet/20 text-vercel-violet text-sm font-semibold px-4 py-2 rounded-full animate-fade-in">
                <Sparkles className="w-4 h-4" /> Meet your new AI Travel Agent
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                {t('home.hero.title') || 'Plan Your Dream'}{' '}
                <span className="bg-gradient-to-r from-vercel-violet to-neon-cyan bg-clip-text text-transparent">
                  {t('home.hero.subtitle') || 'Trip in Seconds'}
                </span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Tell us where you want to go, and our AI will create a personalized itinerary with budgets, activities, and local insights.
              </p>

              {/* Search Bar */}
              <div className="relative group max-w-xl">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-vercel-violet to-neon-cyan rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-500" />
                <div className="relative flex items-center bg-card border border-border rounded-2xl p-1.5 shadow-lg">
                  <div className="pl-3 pr-2"><SearchIcon className="w-5 h-5 text-muted-foreground" /></div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="E.g., A 5-day budget trip to Goa..."
                    className="flex-1 bg-transparent text-foreground text-sm py-3 px-2 outline-none placeholder-muted-foreground"
                  />
                  <Link to="/assistant" className="bg-vercel-violet text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 hover:bg-vercel-violet/90 transition-all text-sm shadow-md">
                    <Sparkles className="w-4 h-4" /><span className="hidden sm:inline">Generate Plan</span>
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap gap-8 pt-4 border-t border-border/50">
                {STATS.map(s => (
                  <div key={s.label}>
                    <p className="text-2xl font-black text-foreground">{s.num}</p>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Dynamic Visual Collage */}
            <div className="hidden lg:block relative z-10 w-full h-[550px]">
              <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl group border border-border/50 bg-background">
                <img
                  src={trendingPlaces[0] ? getPlaceImage(trendingPlaces[0]) : "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=80"}
                  alt="Travel Background"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-vercel-violet/20 mix-blend-overlay" />

                {/* Floating Media Elements */}
                {trendingPlaces[1] && (
                  <div className="absolute top-[10%] left-[8%] w-32 h-24 rounded-xl overflow-hidden shadow-xl border-2 border-white/20 -rotate-12 hover:rotate-0 hover:scale-125 transition-all duration-300 z-10 cursor-pointer backdrop-blur-sm">
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10"><Play className="w-6 h-6 text-white/80 fill-white/80" /></div>
                    <img src={getPlaceImage(trendingPlaces[1])} className="w-full h-full object-cover" />
                  </div>
                )}

                {trendingStates[0] && (
                  <div className="absolute top-[5%] right-[15%] w-24 h-24 rounded-2xl overflow-hidden shadow-xl border-2 border-white/30 rotate-6 hover:-rotate-3 hover:scale-110 transition-all duration-300 z-20">
                    <img src={trendingStates[0].img || 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400'} className="w-full h-full object-cover" />
                  </div>
                )}

                {trendingPlaces[2] && (
                  <div className="absolute top-[40%] left-[5%] w-28 h-40 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 -rotate-6 hover:rotate-3 hover:scale-110 transition-all duration-300 z-30">
                    <img src={getPlaceImage(trendingPlaces[2])} className="w-full h-full object-cover" />
                  </div>
                )}

                {trendingStates[1] && (
                  <div className="absolute top-[30%] left-[35%] w-48 h-56 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/40 rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-500 z-40 bg-black/50 backdrop-blur-md">
                    <img src={trendingStates[1].img || 'https://images.unsplash.com/photo-1626014903698-c9233f2694ce?w=600'} className="absolute inset-0 w-full h-full object-cover opacity-90" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center animate-pulse">
                        <Play className="w-5 h-5 text-white fill-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-white">
                      <span className="text-xs font-bold bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">{trendingStates[1].name}</span>
                      <Video className="w-4 h-4 text-white/80" />
                    </div>
                  </div>
                )}

                {trendingStates[2] && (
                  <div className="absolute top-[45%] right-[8%] w-24 h-24 rounded-full overflow-hidden shadow-xl border-4 border-vercel-violet/30 rotate-12 hover:rotate-0 hover:scale-125 transition-all duration-300 z-20">
                    <img src={trendingStates[2].img || 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400'} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Decorative floating blurred orbs */}
                <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-vercel-violet/30 rounded-full mix-blend-screen blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-neon-cyan/20 rounded-full mix-blend-screen blur-3xl animate-pulse delay-700" />
              </div>

              {/* Floating Live Badge */}
              <div className="absolute -bottom-6 -right-6 bg-card border border-border p-4 rounded-xl shadow-xl flex items-center gap-4 z-50">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Trending Live</p>
                  <p className="text-sm font-bold text-foreground">{places.length > 0 ? `${places.length}+ destinations` : '500+ exploring Goa'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 2. SIDE-BY-SIDE: SEASONAL & AI RECS ═══════════ */}
      {(trendingPlaces.length > 0 || trendingStates.length > 0) && (
        <section className="w-full max-w-7xl mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-8">

            {/* Left Column: Top Destinations */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Sun className="w-7 h-7 text-yellow-500" />
                <h2 className="text-2xl font-bold text-foreground">Top Destinations</h2>
              </div>
              {trendingPlaces.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {trendingPlaces.slice(0, 2).map(place => (
                    <Link to={`/place/${place.slug || place._id}`} key={place._id} className="group relative rounded-2xl overflow-hidden border border-border aspect-square">
                      <img src={getPlaceImage(place)} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md rounded text-xs text-white mb-2 font-medium">
                          ⭐ {place.rating || 4.5} • {place.budgetTier || 'Medium'}
                        </span>
                        <h3 className="text-lg font-bold text-white leading-tight mb-1">{place.name}</h3>
                        <p className="text-xs text-white/80">{place.state}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-2xl border border-border border-dashed">
                  <p className="text-muted-foreground">No destinations added yet. Add some via the Admin panel!</p>
                </div>
              )}
            </div>

            {/* Right Column: AI Quick Actions */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-vercel-violet" />
                <h2 className="text-2xl font-bold text-foreground">Quick AI Plans</h2>
              </div>
              <div className="flex flex-col gap-4">
                {trendingStates.slice(0, 2).map(state => (
                  <Link to="/assistant" key={state._id} className="group flex items-center gap-4 p-3 rounded-2xl bg-card border border-border hover:border-vercel-violet/50 hover:shadow-md transition-all cursor-pointer">
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative">
                      {state.img ? <img src={state.img} alt={state.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-vercel-violet/10 flex items-center justify-center text-2xl">{state.name[0]}</div>}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-2 py-0.5 rounded-sm">
                          {state.category || 'Popular'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-vercel-violet transition-colors">{state.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{state.tagline || `Explore ${state.name}`}</p>
                    </div>
                    <div className="pr-4 text-muted-foreground group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </Link>
                ))}
                <Link to="/assistant" className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-vercel-violet/50 text-center text-sm font-semibold text-muted-foreground hover:text-vercel-violet transition-colors">
                  + Generate a new custom itinerary
                </Link>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ═══════════ 3. TRENDING HUB (3 Columns) ═══════════ */}
      <section className="w-full bg-secondary/30 py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
              <TrendingUp className="w-8 h-8 text-vercel-violet" />
              The Trending Hub
            </h2>
            <p className="text-muted-foreground mt-2">Discover what everyone is exploring, booking, and reading right now.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* Column 1: Trending States */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="font-bold text-lg flex items-center gap-2"><MapPin className="w-5 h-5" /> Top States</h3>
                <Link to="/explore" className="text-xs font-semibold text-vercel-violet hover:underline">View All</Link>
              </div>
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-16 h-16 rounded-xl bg-secondary" />
                    <div className="flex-1 space-y-2"><div className="h-4 bg-secondary rounded w-3/4" /><div className="h-3 bg-secondary rounded w-1/2" /></div>
                  </div>
                ))
              ) : states.length > 0 ? states.slice(0, 3).map(state => (
                <Link to={`/explore/${state.slug}`} key={state._id} className="flex items-center gap-4 group">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    {state.img ? <img src={state.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <div className="w-full h-full bg-vercel-violet/10 flex items-center justify-center text-lg font-bold">{state.name[0]}</div>}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground group-hover:text-vercel-violet transition-colors">{state.name}</h4>
                    <p className="text-xs text-muted-foreground">{state.tagline || state.category || ''}</p>
                    <p className="text-[10px] font-medium text-vercel-violet mt-1">{state.places || 0} popular places</p>
                  </div>
                </Link>
              )) : (
                <p className="text-sm text-muted-foreground py-4">No states published yet.</p>
              )}
            </div>

            {/* Column 2: Trending Places */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="font-bold text-lg flex items-center gap-2"><Map className="w-5 h-5" /> Hot Destinations</h3>
              </div>
              <div className="grid gap-4">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />
                  ))
                ) : places.length > 0 ? places.slice(0, 3).map(place => (
                  <Link to={`/place/${place.slug || place._id}`} key={place._id} className="relative h-24 rounded-xl overflow-hidden group border border-border">
                    <img src={getPlaceImage(place)} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                    <div className="absolute inset-0 p-4 flex flex-col justify-center">
                      <h4 className="font-bold text-white text-lg">{place.name}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded">{place.state}</span>
                        <span className="text-[10px] bg-vercel-violet/80 text-white px-2 py-0.5 rounded">{place.budgetTier || 'Medium'}</span>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <p className="text-sm text-muted-foreground py-4">No places published yet.</p>
                )}
              </div>
            </div>

            {/* Column 3: Latest Blogs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="font-bold text-lg flex items-center gap-2"><BookOpen className="w-5 h-5" /> Travel Guides</h3>
                <Link to="/blog" className="text-xs font-semibold text-vercel-violet hover:underline">Read All</Link>
              </div>
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-20 h-20 rounded-xl bg-secondary" />
                    <div className="flex-1 space-y-2 py-1"><div className="h-3 bg-secondary rounded w-1/3" /><div className="h-4 bg-secondary rounded w-full" /><div className="h-3 bg-secondary rounded w-1/2" /></div>
                  </div>
                ))
              ) : blogs.length > 0 ? blogs.slice(0, 3).map(blog => (
                <Link to="/blog" key={blog._id} className="flex gap-4 group">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    {blog.img ? <img src={blog.img} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" /> : <div className="w-full h-full bg-vercel-violet/10 flex items-center justify-center text-xl">📝</div>}
                  </div>
                  <div className="py-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-vercel-violet bg-vercel-violet/10 px-2 py-0.5 rounded-full inline-block mb-1">
                        {blog.category || 'Guide'}
                      </span>
                      <h4 className="font-bold text-sm text-foreground leading-tight group-hover:text-vercel-violet transition-colors line-clamp-2">
                        {blog.title}
                      </h4>
                    </div>
                    <span className="text-xs text-muted-foreground">{blog.readTime || '5 min'} read</span>
                  </div>
                </Link>
              )) : (
                <p className="text-sm text-muted-foreground py-4">No blogs published yet.</p>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════ 4. EXPLORE CATEGORIES ═══════════ */}
      <section className="w-full max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground mb-8">What's your vibe?</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(cat => (
            <Link key={cat.name} to="/explore" className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card border border-border hover:border-vercel-violet/50 hover:-translate-y-1 hover:shadow-lg transition-all group cursor-pointer">
              <span className="text-4xl group-hover:scale-110 group-hover:rotate-6 transition-transform">{cat.emoji}</span>
              <span className="font-semibold text-sm text-foreground">{cat.name}</span>
              <span className="text-xs text-muted-foreground">{cat.count || ''} places</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ 5. TESTIMONIALS / REVIEWS ═══════════ */}
      <section className="w-full max-w-7xl mx-auto px-4 py-8 mb-16">
        <div className="bg-vercel-violet/5 rounded-3xl p-8 md:p-12 border border-vercel-violet/10">
          <div className="flex items-center gap-3 mb-8">
            <MessageCircle className="w-7 h-7 text-vercel-violet" />
            <h2 className="text-2xl font-bold text-foreground">What Explorers Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map((review, idx) => (
              <div key={idx} className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <Quote className="w-8 h-8 text-vercel-violet/20 mb-4" />
                <p className="text-sm text-foreground mb-6 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <p className="font-bold text-sm text-foreground">{review.name}</p>
                    <p className="text-xs text-muted-foreground">{review.role}</p>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm font-bold ml-1">{review.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 6. MAP PLANNER CTA ═══════════ */}
      <section className="w-full max-w-7xl mx-auto px-4 pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-vercel-violet to-neon-cyan p-[1px] shadow-2xl overflow-hidden group">
          <div className="bg-background/95 backdrop-blur-xl rounded-3xl p-8 md:p-12 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none group-hover:scale-105 transition-transform duration-1000">
              <Map className="w-[400px] h-[400px] -translate-y-1/4 translate-x-1/4" />
            </div>

            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl font-extrabold text-foreground mb-4">Ready to ditch the spreadsheets?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Let our AI build a day-by-day itinerary tailored to your vibe, budget, and timeline.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input placeholder="Leaving from..." className="flex-1 bg-card border border-border rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-vercel-violet text-foreground placeholder-muted-foreground shadow-inner" />
                <input placeholder="Going to..." className="flex-1 bg-card border border-border rounded-xl px-4 py-4 outline-none focus:ring-2 focus:ring-vercel-violet text-foreground placeholder-muted-foreground shadow-inner" />
                <Link to="/assistant" className="bg-foreground text-background font-bold py-4 px-8 rounded-xl hover:scale-[1.02] transition-transform whitespace-nowrap shadow-lg text-center">
                  Plan It Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}