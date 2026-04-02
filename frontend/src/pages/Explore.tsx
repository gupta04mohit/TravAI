import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { Search, SlidersHorizontal, MapPin, Star, ChevronRight, ArrowLeft, Hotel, UtensilsCrossed, Compass, ShoppingBag, Gem, Grid3X3, List, Heart, Share2, X, Image as ImageIcon, Video, ChevronLeft, Filter, Clock, IndianRupee, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { fetchApi } from '../lib/api';
import Footer from '../components/layout/Footer';

/* ════════════════════════════════════════════════════════════════════════════ */
/*                               TYPES                                        */
/* ════════════════════════════════════════════════════════════════════════════ */ 

interface StateData {
  _id: string;
  slug: string;
  name: string;
  tagline?: string;
  img?: string;
  places?: number;
  category?: string;
  bestSeason?: string;
  famous?: string;
  status?: string;
}

interface PlaceData {
  _id: string;
  name: string;
  slug: string;
  img?: string;
  images?: string[];
  gallery?: string[];
  rating: number;
  budget?: string;
  budgetTier?: string;
  category?: string;
  tags?: string[];
  description?: string;
  tagline?: string;
  youtube?: string;
  hotels?: { name: string; price: string; rating: number; tier: string }[];
  foods?: { name: string; price: string; veg: boolean; famous?: string }[];
  transport?: { type: string; from: string; cost: string; time?: string }[];
  bestTime?: string;
  safetyRating?: string;
  avgCost?: string;
  culture?: string[];
  tips?: string[];
  state?: string;
}

const PLACE_CATEGORIES = [
  { id: 'All', label: 'All', icon: <Compass className="w-4 h-4" /> },
  { id: 'Place', label: 'Places', icon: <MapPin className="w-4 h-4" /> },
  { id: 'Accommodation', label: 'Stay', icon: <Hotel className="w-4 h-4" /> },
  { id: 'Activity', label: 'Activities', icon: <Compass className="w-4 h-4" /> },
  { id: 'Food', label: 'Food', icon: <UtensilsCrossed className="w-4 h-4" /> },
  { id: 'Shop', label: 'Shopping', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'Hidden Gem', label: 'Hidden Gems', icon: <Gem className="w-4 h-4" /> },
];

const FILTERS = {
  budget: ['Budget', 'Medium', 'Luxury'],
  category: ['Beaches', 'Mountains', 'Historical', 'Nature', 'Spiritual', 'Adventure'],
  season: ['Winter', 'Summer', 'Monsoon', 'Any'],
};

const SORT_OPTIONS = [
  { id: 'rating-desc', label: '⭐ Rating (High → Low)' },
  { id: 'rating-asc', label: '⭐ Rating (Low → High)' },
  { id: 'name-asc', label: '🔤 Name (A → Z)' },
  { id: 'name-desc', label: '🔤 Name (Z → A)' },
  { id: 'places-desc', label: '📍 Most Places' },
  { id: 'places-asc', label: '📍 Fewest Places' },
];

const getPlaceImage = (place: PlaceData) => {
  if (place.gallery && place.gallery.length > 0) return place.gallery[0];
  if (place.images && place.images.length > 0) return place.images[0];
  if (place.img) return place.img;
  return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
};

/* ════════════════════════════════════════════════════════════════════════════ */
/*                           CITY / PLACE DETAIL                              */
/* ════════════════════════════════════════════════════════════════════════════ */

function PlaceDetail({ stateSlug, placeSlug }: { stateSlug: string; placeSlug: string }) {
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState<'overview' | 'hotels' | 'food' | 'transport' | 'tips'>('overview');
  const [place, setPlace] = useState<PlaceData | null>(null);
  const [stateInfo, setStateInfo] = useState<StateData | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [placeRes, stateRes] = await Promise.all([
          fetchApi(`/places/${placeSlug}`),
          fetchApi(`/states/${stateSlug}`),
        ]);
        if (placeRes) setPlace(placeRes);
        if (stateRes?.state) {
          setStateInfo(stateRes.state);
          setNearbyPlaces((stateRes.places || []).filter((p: PlaceData) => p.slug !== placeSlug).slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load place:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [stateSlug, placeSlug]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-vercel-violet border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading place details...</p>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <p className="text-6xl">🔍</p>
          <h2 className="text-2xl font-bold text-foreground">Place not found</h2>
          <Link to={`/explore/${stateSlug}`} className="text-vercel-violet hover:underline">← Back to {stateInfo?.name || 'explore'}</Link>
        </div>
      </div>
    );
  }

  const gallery = place.gallery || place.images || (place.img ? [place.img] : [getPlaceImage(place)]);
  const placeBudget = place.budget || place.budgetTier || 'Medium';
  const placeTags = place.tags || [];

  return (
    <div className="w-full flex-1 flex flex-col bg-background">
      {/* ── Hero with Image Gallery ── */}
      <section className="relative w-full h-[60vh] md:h-[70vh]">
        <img src={gallery[activeGalleryIdx]} alt={place.name} className="w-full h-full object-cover transition-all duration-700 ease-in-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30" />

        {/* Nav & Breadcrumbs */}
        <div className="absolute top-6 left-6 z-10">
          <Link to={`/explore/${stateSlug}`} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white text-sm font-bold hover:bg-black/50 transition-colors shadow-lg">
            <ArrowLeft className="w-4 h-4" /> Back to {stateInfo?.name || 'State'}
          </Link>
        </div>

        {/* Gallery Controls */}
        {gallery.length > 1 && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
            {gallery.map((_: string, i: number) => (
              <button key={i} onClick={() => setActiveGalleryIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === activeGalleryIdx ? 'w-6 bg-white' : 'bg-white/50 hover:bg-white/80'}`} />
            ))}
          </div>
        )}

        {gallery.length > 1 && (
          <>
            <button onClick={() => setActiveGalleryIdx(i => (i - 1 + gallery.length) % gallery.length)} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-vercel-violet transition-colors z-10">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={() => setActiveGalleryIdx(i => (i + 1) % gallery.length)} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-vercel-violet transition-colors z-10">
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {gallery.length > 1 && (
          <button onClick={() => setShowFullGallery(true)} className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/30 backdrop-blur-md border border-white/10 text-white text-sm font-bold hover:bg-black/50 transition-colors z-10 shadow-lg">
            <ImageIcon className="w-4 h-4" /> View Gallery ({gallery.length})
          </button>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {placeTags.map(tag => <span key={tag} className="text-[11px] px-3 py-1.5 rounded-lg bg-vercel-violet border border-vercel-violet/50 text-white font-black uppercase tracking-wider shadow-sm">{tag}</span>)}
              </div>
              <h1 className="text-4xl md:text-7xl font-black text-white drop-shadow-2xl tracking-tight leading-tight">{place.name}</h1>
              <p className="text-white/90 text-lg flex items-center gap-2 mt-2 font-medium drop-shadow-md"><MapPin className="w-5 h-5 text-vercel-violet" /> {stateInfo?.name || place.state || 'India'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl text-white shadow-xl">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 drop-shadow-sm" />
                <span className="font-bold text-lg">{place.rating || 4.5}</span>
              </div>
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl text-white shadow-xl flex items-center gap-2 font-bold">
                <IndianRupee className="w-5 h-5 text-green-400" /> {placeBudget}
              </div>
              <button className="p-3.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-red-500 hover:border-red-500 transition-all shadow-xl group"><Heart className="w-5 h-5 group-hover:fill-white" /></button>
              <button className="p-3.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-vercel-violet hover:border-vercel-violet transition-all shadow-xl"><Share2 className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Full Gallery Modal ── */}
      {showFullGallery && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 transition-opacity" onClick={() => setShowFullGallery(false)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors bg-black/50"><X className="w-8 h-8" /></button>
          <div className="w-full max-w-6xl max-h-full overflow-y-auto scrollbar-hide" onClick={e => e.stopPropagation()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((img: string, i: number) => (
                <div key={i} className="relative group rounded-2xl overflow-hidden cursor-pointer aspect-video md:aspect-square" onClick={() => { setActiveGalleryIdx(i); setShowFullGallery(false); }}>
                   <img src={img} alt={`${place.name} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute inset-0 bg-vercel-violet/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <ImageIcon className="w-8 h-8 text-white drop-shadow-lg" />
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Info Cards ── */}
      <section className="max-w-7xl mx-auto w-full px-4 -mt-6 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Best Time to Visit', value: place.bestTime || 'Any Season', icon: Clock, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
            { label: 'Safety Rating', value: place.safetyRating || 'Safe', icon: Compass, color: 'text-green-500 bg-green-500/10 border-green-500/20' },
            { label: 'Average Cost', value: place.avgCost || '₹2,000/day', icon: IndianRupee, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
            { label: 'Category', value: place.category || 'Place', icon: MapPin, color: 'text-vercel-violet bg-vercel-violet/10 border-vercel-violet/20' },
          ].map(info => (
            <div key={info.label} className={`px-5 py-4 rounded-2xl bg-card border shadow-lg flex flex-col md:flex-row items-start md:items-center gap-4 hover:-translate-y-1 transition-transform ${info.color.split(' ')[2]}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${info.color.split(' ').slice(0, 2).join(' ')}`}>
                <info.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{info.label}</p>
                <p className="text-base font-black text-foreground">{info.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tabs Content Area ── */}
      <section className="max-w-7xl mx-auto w-full px-4 mt-12 mb-20">
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide border-b border-border/50">
          {(['overview', 'hotels', 'food', 'transport', 'tips'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveInfoTab(tab)}
              className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm flex items-center gap-2 border ${activeInfoTab === tab ? 'bg-foreground text-background border-foreground' : 'bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground'}`}
            >
              {tab === 'overview' && '📋 Overview'}
              {tab === 'hotels' && `🏨 Accommodations (${place.hotels?.length || 0})`}
              {tab === 'food' && `🍛 Local Food (${place.foods?.length || 0})`}
              {tab === 'transport' && `🚌 Transport (${place.transport?.length || 0})`}
              {tab === 'tips' && `💡 Tips (${place.tips?.length || 0})`}
            </button>
          ))}
        </div>

        <div className="py-8">
          {/* Overview */}
          {activeInfoTab === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-2xl font-black text-foreground mb-3">About {place.name}</h2>
                  <p className="text-muted-foreground leading-relaxed">{place.description || place.tagline || 'A popular destination worth exploring.'}</p>
                </div>

                {place.youtube && (
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                      <Video className="w-5 h-5 text-red-500" /> Video Guide
                    </h3>
                    <div className="rounded-2xl overflow-hidden border border-border aspect-video">
                      <iframe src={place.youtube} title={`${place.name} video`} className="w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                    </div>
                  </div>
                )}

                {place.culture && place.culture.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-3">🎭 Local Culture</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {place.culture.map(c => (
                        <div key={c} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                          <span className="text-lg">✨</span>
                          <span className="text-sm text-foreground">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-vercel-violet/10 to-neon-cyan/5 border border-vercel-violet/20">
                  <h4 className="font-bold text-foreground mb-3">🤖 AI Travel Plan</h4>
                  <p className="text-sm text-muted-foreground mb-4">Get a complete AI-generated itinerary including this place.</p>
                  <Link to={`/assistant?q=${encodeURIComponent(`Plan a trip to ${place.name}, ${stateInfo?.name || place.state || ''}`)}`} className="block w-full text-center bg-gradient-to-r from-vercel-violet to-vercel-violet text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm">
                    <Sparkles className="w-4 h-4 inline mr-1" /> Generate Itinerary
                  </Link>
                </div>

                {nearbyPlaces.length > 0 && (
                  <div className="p-5 rounded-2xl bg-card border border-border">
                    <h4 className="font-bold text-foreground mb-3">📍 Nearby Places</h4>
                    <div className="space-y-2">
                      {nearbyPlaces.map(p => (
                        <Link key={p._id || p.slug} to={`/explore/${stateSlug}/${p.slug}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary transition-colors">
                          <img src={getPlaceImage(p)} className="w-10 h-10 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground">⭐ {p.rating || 4.0}</p>
                          </div>
                          <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hotels */}
          {activeInfoTab === 'hotels' && (
            <div className="space-y-4">
              {(place.hotels && place.hotels.length > 0) ? place.hotels.map((h, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-vercel-violet/30 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0"><Hotel className="w-6 h-6 text-blue-500" /></div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{h.name}</p>
                    <p className="text-xs text-muted-foreground">{h.tier}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{h.price}</p>
                    <p className="text-xs text-yellow-500">⭐ {h.rating}</p>
                  </div>
                </div>
              )) : <p className="text-muted-foreground text-center py-8">No hotel data available yet.</p>}
            </div>
          )}

          {/* Food */}
          {activeInfoTab === 'food' && (
            <div className="grid md:grid-cols-2 gap-4">
              {(place.foods && place.foods.length > 0) ? place.foods.map((f, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
                  <span className="text-3xl">{f.veg ? '🥬' : '🍗'}</span>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.famous || ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{f.price}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${f.veg ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{f.veg ? 'Veg' : 'Non-Veg'}</span>
                  </div>
                </div>
              )) : <p className="text-muted-foreground text-center py-8 col-span-2">No food data available yet.</p>}
            </div>
          )}

          {/* Transport */}
          {activeInfoTab === 'transport' && (
            <div className="space-y-4">
              {(place.transport && place.transport.length > 0) ? place.transport.map((t, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    {t.type === 'Flight' ? '✈️' : t.type === 'Train' ? '🚂' : t.type === 'Bus' ? '🚌' : '🚗'}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{t.type}</p>
                    <p className="text-xs text-muted-foreground">From {t.from}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{t.cost}</p>
                    <p className="text-xs text-muted-foreground">{t.time || ''}</p>
                  </div>
                </div>
              )) : <p className="text-muted-foreground text-center py-8">No transport data available yet.</p>}
            </div>
          )}

          {/* Tips */}
          {activeInfoTab === 'tips' && (
            <div className="grid md:grid-cols-2 gap-3">
              {(place.tips && place.tips.length > 0) ? place.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border">
                  <span className="text-lg shrink-0">💡</span>
                  <p className="text-sm text-foreground leading-relaxed">{tip}</p>
                </div>
              )) : <p className="text-muted-foreground text-center py-8 col-span-2">No tips available yet.</p>}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════ */
/*                           STATE DETAIL                                     */
/* ════════════════════════════════════════════════════════════════════════════ */

function StateDetail({ stateSlug }: { stateSlug: string }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('rating-desc');
  const [budgetFilter, setBudgetFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [stateInfo, setStateInfo] = useState<StateData | null>(null);
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchApi(`/states/${stateSlug}`);
        if (data?.state) setStateInfo(data.state);
        if (data?.places) setPlaces(data.places);
      } catch (err) {
        console.error('Failed to load state:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [stateSlug]);

  const filtered = useMemo(() => {
    let list = [...places];
    if (activeCategory !== 'All') list = list.filter(p => p.category === activeCategory);
    if (budgetFilter !== 'All') list = list.filter(p => (p.budget || p.budgetTier) === budgetFilter);
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase())));

    const [field, dir] = sortBy.split('-');
    list.sort((a, b) => {
      if (field === 'rating') return dir === 'desc' ? (b.rating || 0) - (a.rating || 0) : (a.rating || 0) - (b.rating || 0);
      if (field === 'name') return dir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      return 0;
    });
    return list;
  }, [search, activeCategory, sortBy, budgetFilter, places]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-vercel-violet border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading state...</p>
        </div>
      </div>
    );
  }

  if (!stateInfo) return <div className="p-12 text-center text-foreground font-bold text-xl">State not found</div>;

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Hero */}
      <section className="relative w-full h-[45vh] md:h-[55vh] overflow-hidden">
        <img src={stateInfo.img || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'} alt={stateInfo.name} className="w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent" />
        <div className="absolute top-6 left-6 z-10">
          <Link to="/explore" className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-md text-white text-sm font-bold hover:bg-black/60 transition-colors shadow-sm">
            <ArrowLeft className="w-4 h-4" /> All States
          </Link>
        </div>
        <div className="absolute bottom-10 left-0 right-0 px-6">
          <div className="max-w-7xl mx-auto text-center md:text-left transition-all">
            <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-xl tracking-tight mb-2">{stateInfo.name}</h1>
            <p className="text-white/80 text-lg md:text-xl mt-2 max-w-2xl font-medium drop-shadow-md">{stateInfo.tagline || ''}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
              <span className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md text-white text-sm font-bold shadow-sm">📍 {places.length} places</span>
              {stateInfo.bestSeason && <span className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md text-white text-sm font-bold shadow-sm">🌤️ Best: {stateInfo.bestSeason}</span>}
              {stateInfo.category && <span className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-vercel-violet/80 backdrop-blur-md text-white text-sm font-bold shadow-sm">🏷️ {stateInfo.category}</span>}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full flex flex-col md:flex-row gap-8">
        
        <button onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)} className="md:hidden flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-card border border-border shadow-sm font-bold text-foreground active:scale-[0.98] transition-all">
          <Filter className="w-5 h-5" /> Filter & Sorting
        </button>

        {/* Left Sidebar */}
        <aside className={`w-full md:w-72 shrink-0 transition-all duration-300 ease-in-out ${isMobileFilterOpen ? 'block' : 'hidden md:block'}`}>
          <div className="sticky top-24 space-y-6">
            <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg">
              <h3 className="font-bold text-xl text-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
                <SlidersHorizontal className="w-5 h-5 text-vercel-violet"/> Filters & Sorting
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-foreground mb-2 block">Search {stateInfo.name}</label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Places, activities..." className="w-full pl-10 pr-4 py-2.5 bg-background border border-border text-foreground rounded-xl text-sm outline-none focus:ring-2 focus:ring-vercel-violet transition-shadow" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-foreground mb-2 block">Budget Tier</label>
                  <select value={budgetFilter} onChange={e => setBudgetFilter(e.target.value)} className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-vercel-violet transition-shadow cursor-pointer appearance-none">
                    <option value="All">💰 All Budgets</option>
                    {FILTERS.budget.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                   <label className="text-sm font-bold text-foreground mb-2 block">Sort By</label>
                   <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-vercel-violet transition-shadow cursor-pointer appearance-none">
                     {SORT_OPTIONS.filter(s => s.id.startsWith('rating') || s.id.startsWith('name')).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                   </select>
                </div>
                <button onClick={() => { setSearch(''); setActiveCategory('All'); setBudgetFilter('All'); setSortBy('rating-desc'); }} className="w-full py-3 mt-4 text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-bold transition-colors">
                   Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-8">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide flex-1">
              {PLACE_CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-5 py-2.5 rounded-[2rem] text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${activeCategory === cat.id ? 'bg-vercel-violet text-white border-vercel-violet shadow-md' : 'bg-card border-border text-foreground hover:bg-vercel-violet/10 hover:border-vercel-violet/30'}`}>
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-semibold text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg border border-border">{filtered.length} results</span>
              <div className="flex gap-1 bg-secondary rounded-xl border border-border p-1">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}><Grid3X3 className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="flex flex-wrap gap-5">
              {filtered.map(place => (
                <Link to={`/explore/${stateSlug}/${place.slug}`} key={place._id || place.slug} className="group flex-grow basis-[300px] min-w-[280px] max-w-full rounded-2xl bg-card border border-border overflow-hidden hover:border-vercel-violet/40 hover:shadow-2xl transition-all duration-300">
                  <div className="h-52 relative overflow-hidden">
                    <img src={getPlaceImage(place)} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4 flex gap-1.5 flex-wrap">
                      {(place.tags || []).slice(0, 2).map(tag => <span key={tag} className="text-[10px] px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-bold shadow-sm">{tag}</span>)}
                    </div>
                    <span className="absolute top-4 right-4 text-xs px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white font-bold shadow-sm">{place.budget || place.budgetTier || 'Medium'}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-vercel-violet transition-colors mb-1 truncate">{place.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{place.description || place.tagline || 'Explore this amazing destination.'}</p>
                    <div className="flex items-center justify-between mt-4 border-t border-border pt-3">
                      <span className="flex items-center gap-1 text-sm font-bold text-foreground"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {place.rating || 4.0}</span>
                      <span className="text-sm text-vercel-violet font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">Details <ChevronRight className="w-4 h-4" /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {filtered.map(place => (
                <Link to={`/explore/${stateSlug}/${place.slug}`} key={place._id || place.slug} className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-card border border-border hover:border-vercel-violet/40 hover:shadow-xl transition-all duration-300 group">
                  <div className="w-full sm:w-40 h-40 sm:h-28 rounded-xl overflow-hidden shrink-0 relative">
                    <img src={getPlaceImage(place)} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-vercel-violet transition-colors truncate">{place.name}</h3>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-secondary text-foreground font-bold shrink-0">{place.budget || place.budgetTier || 'Medium'}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{place.description || place.tagline || 'Explore this destination.'}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(place.tags || []).slice(0, 3).map(tag => <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-vercel-violet/10 text-vercel-violet font-bold">{tag}</span>)}
                      <div className="flex items-center gap-1 text-sm font-bold text-foreground ml-auto"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {place.rating || 4.0}</div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-secondary group-hover:bg-vercel-violet/10 shrink-0 transition-colors">
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-vercel-violet transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-32 bg-card rounded-3xl border border-border border-dashed mt-4">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                 <MapPin className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-3">No places found</h3>
              <p className="text-muted-foreground text-lg mb-6">
                {places.length === 0
                  ? `No places published for ${stateInfo.name} yet. Add some via the Admin panel!`
                  : `No destinations matching your criteria in ${stateInfo.name}.`}
              </p>
              <button onClick={() => { setSearch(''); setActiveCategory('All'); setBudgetFilter('All'); }} className="px-6 py-3 bg-vercel-violet text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity">
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════ */
/*                         MAIN EXPLORE PAGE                                  */
/* ════════════════════════════════════════════════════════════════════════════ */

export default function Explore() {
  const { stateSlug, placeSlug } = useParams();

  if (stateSlug && placeSlug) return <PlaceDetail stateSlug={stateSlug} placeSlug={placeSlug} />;
  if (stateSlug) return <StateDetail stateSlug={stateSlug} />;

  return <ExploreMain />;
}

function ExploreMain() {
  useAppStore();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('places-desc');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [seasonFilter, setSeasonFilter] = useState('All');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [states, setStates] = useState<StateData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (categoryFilter !== 'All') params.set('category', categoryFilter);
        if (seasonFilter !== 'All') params.set('season', seasonFilter);
        const qs = params.toString();
        const data = await fetchApi(`/states${qs ? '?' + qs : ''}`);
        if (Array.isArray(data)) setStates(data);
      } catch (err) {
        console.error('Failed to load states:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search, categoryFilter, seasonFilter]);

  const filteredStates = useMemo(() => {
    let list = [...states];
    const [field, dir] = sortBy.split('-');
    list.sort((a, b) => {
      if (field === 'name') return dir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if (field === 'places') return dir === 'desc' ? (b.places || 0) - (a.places || 0) : (a.places || 0) - (b.places || 0);
      return 0;
    });
    return list;
  }, [states, sortBy]);

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-vercel-violet/5 via-background to-neon-cyan/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3 tracking-tight">Explore India <br className="md:hidden" /><span className="text-vercel-violet">By State & Cities</span></h1>
          <p className="text-muted-foreground text-lg max-w-2xl">Discover 28 states, 8 union territories, and thousands of incredible destinations curated just for you.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full flex flex-col md:flex-row gap-8">
        
        <button onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)} className="md:hidden flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-card border border-border shadow-sm font-bold text-foreground active:scale-[0.98] transition-all">
          <Filter className="w-5 h-5" /> Filter & Sorting
        </button>

        {/* Left Sidebar */}
        <aside className={`w-full md:w-72 shrink-0 transition-all duration-300 ease-in-out ${isMobileFilterOpen ? 'block' : 'hidden md:block'}`}>
          <div className="sticky top-24 space-y-6">
            <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg">
              <h3 className="font-bold text-xl text-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
                <SlidersHorizontal className="w-5 h-5 text-vercel-violet"/> Filters & Sorting
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-foreground mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="States, places..." className="w-full pl-10 pr-4 py-2.5 bg-background border border-border text-foreground rounded-xl text-sm outline-none focus:ring-2 focus:ring-vercel-violet transition-shadow" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-foreground mb-2 block">Best Season</label>
                  <select value={seasonFilter} onChange={e => setSeasonFilter(e.target.value)} className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-vercel-violet transition-shadow cursor-pointer appearance-none">
                    <option value="All">🌤️ All Seasons</option>
                    {FILTERS.season.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                   <label className="text-sm font-bold text-foreground mb-2 block">Sort By</label>
                   <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full bg-background border border-border text-foreground rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-vercel-violet transition-shadow cursor-pointer appearance-none">
                     {SORT_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                   </select>
                </div>
                <button onClick={() => { setSearch(''); setCategoryFilter('All'); setSeasonFilter('All'); setSortBy('places-desc'); }} className="w-full py-3 mt-4 text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-bold transition-colors">
                   Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">          
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {['All', ...FILTERS.category].map(c => (
              <button key={c} onClick={() => setCategoryFilter(c)} className={`px-6 py-2.5 rounded-[2rem] text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${categoryFilter === c ? 'bg-vercel-violet text-white border-vercel-violet shadow-md' : 'bg-card border-border text-foreground hover:bg-vercel-violet/10 hover:border-vercel-violet/30'}`}>
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6">
             <span className="text-sm font-semibold text-muted-foreground bg-secondary px-3 py-1.5 rounded-lg border border-border">
               {loading ? 'Loading...' : `Showing ${filteredStates.length} amazing states`}
             </span>
          </div>

          {loading ? (
            <div className="flex flex-wrap gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex-grow basis-[300px] min-w-[280px] rounded-2xl bg-card border border-border overflow-hidden animate-pulse">
                  <div className="h-56 bg-secondary" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-secondary rounded w-2/3" />
                    <div className="h-4 bg-secondary rounded w-full" />
                    <div className="h-4 bg-secondary rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredStates.length > 0 ? (
            <div className="flex flex-wrap gap-5">
              {filteredStates.map(state => (
                <Link to={`/explore/${state.slug}`} key={state._id || state.slug} className="group flex-grow basis-[300px] min-w-[280px] max-w-full rounded-2xl bg-card border border-border overflow-hidden hover:border-vercel-violet/40 hover:shadow-2xl transition-all duration-300">
                  <div className="h-56 relative overflow-hidden">
                    {state.img ? (
                      <img src={state.img} alt={state.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-vercel-violet/20 to-neon-cyan/10 flex items-center justify-center text-6xl font-bold text-vercel-violet/30">{state.name[0]}</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    {state.category && (
                      <div className="absolute top-4 left-4">
                        <span className="text-xs px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-bold shadow-sm">{state.category}</span>
                      </div>
                    )}
                    {state.bestSeason && (
                      <div className="absolute top-4 right-4">
                        <span className="text-xs px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white font-bold shadow-sm">🌤️ {state.bestSeason}</span>
                      </div>
                    )}
                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <h3 className="text-2xl font-black drop-shadow-md">{state.name}</h3>
                      <p className="text-sm text-white/80 line-clamp-1 mt-1 font-medium">{state.tagline || ''}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4 text-vercel-violet" /> {state.places || 0} popular places</span>
                      <span className="text-sm font-bold text-vercel-violet flex items-center gap-1 group-hover:translate-x-1 transition-transform">Explore <ChevronRight className="w-4 h-4" /></span>
                    </div>
                    {state.famous && (
                      <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                         <p className="text-xs text-foreground/80 font-medium">Famous for: <span className="font-bold text-foreground">{state.famous}</span></p>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-card rounded-3xl border border-border border-dashed mt-4">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                 <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-3">No states found</h3>
              <p className="text-muted-foreground text-lg mb-6">
                {states.length === 0 ? 'No states published yet. Add states via the Admin panel!' : 'No destinations matching your criteria.'}
              </p>
              <button onClick={() => { setSearch(''); setCategoryFilter('All'); setSeasonFilter('All'); }} className="px-6 py-3 bg-vercel-violet text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-opacity">
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
