import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { Heart, Share2, Star, MapPin, Clock, IndianRupee, Sparkles, ChevronDown, ChevronUp, MessageCircle, Download, Shield, Route, Utensils, Hotel, ArrowLeft, Check, AlertTriangle, Landmark, Camera } from 'lucide-react';
import { fetchApi } from '../lib/api';
import Footer from '../components/layout/Footer';

export default function PlaceDetail() {
  const { slug } = useParams();
  const [place, setPlace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'budget' | 'mid' | 'luxury'>('budget');
  const [expandedAttr, setExpandedAttr] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchApi(`/places/${slug}`);
        if (data) {
          // Normalize data from backend to match the expected shape
          setPlace({
            name: data.name || slug?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Place',
            state: data.state || 'India',
            rating: data.rating || 4.5,
            reviewCount: data.reviews?.length || 0,
            images: data.gallery || data.images || ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
            aiSummary: data.description || data.tagline || 'A beautiful destination in India worth exploring.',
            safetyLevel: data.safetyRating || 'Safe',
            safetyNote: data.safetyNote || 'Generally safe for tourists.',
            costTiers: data.costTiers || { budget: data.avgCost || '₹2,000/day', mid: '₹5,000–10,000/day', luxury: '₹12,000+/day' },
            bestTime: data.bestTime || 'October – March',
            duration: data.duration || '2–3 Days',
            howToReach: data.howToReach || { flight: 'Nearest Airport', train: 'Nearest Station', bus: 'State Bus', road: 'National Highway' },
            famousPlaces: data.famousPlaces || [],
            culture: data.culture || [],
            foods: data.foods || [],
            stays: data.stays || { budget: data.hotels?.filter((h: any) => h.tier === 'Budget') || [], mid: data.hotels?.filter((h: any) => h.tier === 'Mid-range') || [], luxury: data.hotels?.filter((h: any) => h.tier === 'Luxury') || [] },
            transport: data.transport || [],
          });
        }
      } catch (err) {
        console.error('Failed to load place:', err);
        // Set a basic fallback
        setPlace({
          name: slug?.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Place',
          state: 'India', rating: 4.5, reviewCount: 0,
          images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
          aiSummary: 'Place details are currently unavailable. Please try again later.',
          safetyLevel: 'Safe', safetyNote: '',
          costTiers: { budget: 'N/A', mid: 'N/A', luxury: 'N/A' },
          bestTime: 'Any', duration: '', howToReach: {},
          famousPlaces: [], culture: [], foods: [],
          stays: { budget: [], mid: [], luxury: [] }, transport: [],
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

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

  if (!place) return null;

  const sections = [
    { id: 'overview', label: '📍 Overview', icon: <MapPin className="w-4 h-4" /> },
    { id: 'places', label: '🏛️ Famous Places', icon: <Landmark className="w-4 h-4" /> },
    { id: 'safety', label: '🛡️ Safety', icon: <Shield className="w-4 h-4" /> },
    { id: 'routes', label: '🚌 Routes & Transport', icon: <Route className="w-4 h-4" /> },
    { id: 'hotels', label: '🏨 Hotels', icon: <Hotel className="w-4 h-4" /> },
    { id: 'food', label: '🍜 Food', icon: <Utensils className="w-4 h-4" /> },
    { id: 'culture', label: '🎭 Culture', icon: <Camera className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Hero Gallery */}
      <section className="relative w-full h-[50vh] md:h-[55vh]">
        <div className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide">
          {place.images.map((img: string, i: number) => (
            <div key={i} className="min-w-full snap-center relative">
              <img src={img} alt={`${place.name} ${i}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-4 left-4">
          <button onClick={() => window.history.back()} className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm text-white text-sm hover:bg-black/60 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">{place.name}</h1>
            <p className="text-white/80 flex items-center gap-2 mt-2"><MapPin className="w-4 h-4" /> {place.state} · <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {place.rating} ({place.reviewCount.toLocaleString()} reviews)</p>
          </div>
          <div className="flex gap-2">
            <button className="p-3 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-red-500/80 transition-colors"><Heart className="w-5 h-5" /></button>
            <button className="p-3 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"><Share2 className="w-5 h-5" /></button>
          </div>
        </div>
      </section>

      {/* Section Tabs */}
      <div className="sticky top-16 z-20 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeSection === s.id ? 'bg-vercel-violet text-white' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 w-full space-y-12">

        {/* AI Summary */}
        {(activeSection === 'overview' || activeSection === 'all') && (
          <>
            <section className="relative rounded-2xl p-6 md:p-8 bg-gradient-to-r from-vercel-violet/10 to-vercel-violet/5 border-2 border-vercel-violet/30">
              <div className="flex items-center gap-2 mb-4"><Sparkles className="w-6 h-6 text-vercel-violet" /><h2 className="text-xl font-bold text-foreground">AI Summary — Personalized for You</h2></div>
              <p className="text-muted-foreground leading-relaxed">{place.aiSummary}</p>
            </section>

            {/* Travel Info Grid */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <IndianRupee className="w-5 h-5" />, label: 'Budget', value: place.costTiers.budget },
                { icon: <Clock className="w-5 h-5" />, label: 'Best Time', value: place.bestTime },
                { icon: <MapPin className="w-5 h-5" />, label: 'Duration', value: place.duration },
                { icon: <Shield className="w-5 h-5" />, label: 'Safety', value: place.safetyLevel },
              ].map(info => (
                <div key={info.label} className="p-5 rounded-xl bg-card border border-border space-y-2">
                  <div className="flex items-center gap-2 text-vercel-violet">{info.icon}<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{info.label}</span></div>
                  <p className="text-sm font-medium text-foreground">{info.value}</p>
                </div>
              ))}
            </section>
          </>
        )}

        {/* Famous Places */}
        {(activeSection === 'overview' || activeSection === 'places') && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">🏛️ Famous Places & Attractions</h2>
            <div className="space-y-3">
              {place.famousPlaces.map((attr: any, i: number) => (
                <button key={i} onClick={() => setExpandedAttr(expandedAttr === i ? null : i)} className="w-full text-left p-4 rounded-xl bg-card border border-border hover:border-vercel-violet/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-foreground">{attr.name}</span>
                      {attr.mustDo && <span className="text-[10px] px-2 py-0.5 rounded-full bg-vercel-violet/10 text-vercel-violet font-bold">Must-Visit</span>}
                    </div>
                    {expandedAttr === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  {expandedAttr === i && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm text-muted-foreground">{attr.desc}</p>
                      <div className="flex gap-6 text-sm text-muted-foreground">
                        <span>🎟️ Entry: {attr.fee}</span>
                        <span>🕐 Timing: {attr.timing}</span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Safety */}
        {(activeSection === 'overview' || activeSection === 'safety') && (
          <section className="rounded-2xl p-6 bg-card border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">🛡️ Safety Information</h2>
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${place.safetyLevel === 'Safe' ? 'bg-green-500/10 text-green-500' : place.safetyLevel === 'Moderate' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
                {place.safetyLevel === 'Safe' ? <Check className="w-4 h-4 inline mr-1" /> : <AlertTriangle className="w-4 h-4 inline mr-1" />}{place.safetyLevel}
              </span>
            </div>
            <p className="text-muted-foreground">{place.safetyNote}</p>
          </section>
        )}

        {/* Routes & Transport */}
        {(activeSection === 'overview' || activeSection === 'routes') && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">🚌 How to Reach & Transport</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {place.transport.map((t: any, i: number) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-card border border-border">
                  <div className="w-12 h-12 shrink-0 rounded-lg bg-vercel-violet/10 flex items-center justify-center text-vercel-violet text-lg">
                    {t.type === 'Flight' ? '✈️' : t.type === 'Train' ? '🚂' : t.type === 'Bus' ? '🚌' : '🛵'}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">{t.type}</h4>
                    <p className="text-xs text-muted-foreground">{t.from}</p>
                    <p className="text-xs text-foreground"><span className="text-vercel-violet font-semibold">{t.cost}</span> · {t.duration} · {t.operator}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Hotels */}
        {(activeSection === 'overview' || activeSection === 'hotels') && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">🏨 Where to Stay</h2>
            <div className="flex gap-2 mb-4">
              {(['budget', 'mid', 'luxury'] as const).map(tier => (
                <button key={tier} onClick={() => setActiveTab(tier)} className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${activeTab === tier ? 'bg-vercel-violet text-white border-vercel-violet' : 'border-border bg-card text-foreground hover:border-vercel-violet/40'}`}>
                  {tier === 'budget' ? '💰 Budget' : tier === 'mid' ? '💎 Mid-Range' : '👑 Luxury'}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {place.stays[activeTab].map((stay: any) => (
                <div key={stay.name} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                  <div>
                    <h4 className="font-semibold text-foreground">{stay.name}</h4>
                    <p className="text-sm text-muted-foreground">{stay.price} · ⭐ {stay.rating}</p>
                  </div>
                  <button className="bg-vercel-violet text-white text-sm font-bold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity">Book Now</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Food */}
        {(activeSection === 'overview' || activeSection === 'food') && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-2">🍜 What You Should Eat Here</h2>
            <p className="text-sm text-muted-foreground mb-6">AI-curated based on local favourites and traveller reviews</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {place.foods.map((food: any) => (
                <div key={food.name} className="flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-vercel-violet/30 transition-all">
                  <div className="w-14 h-14 shrink-0 rounded-lg bg-vercel-violet/10 flex items-center justify-center text-2xl">{food.veg ? '🥬' : '🍗'}</div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-foreground">{food.name} · <span className="text-vercel-violet">{food.price}</span></h4>
                    <p className="text-xs text-muted-foreground">{food.reason}</p>
                    {food.where && <p className="text-[11px] text-vercel-violet font-semibold">📍 {food.where}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Culture */}
        {(activeSection === 'overview' || activeSection === 'culture') && (
          <section className="rounded-2xl p-6 bg-card border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">🎭 Local Culture & Traditions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {place.culture.map((c: string) => (
                <div key={c} className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                  <span className="text-vercel-violet">✦</span>
                  <span className="text-sm text-foreground">{c}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI CTA */}
        <section className="rounded-2xl bg-gradient-to-r from-vercel-violet/20 to-vercel-violet/5 border border-vercel-violet/30 p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">🤖 Plan Your Full Trip to {place.state}</h2>
          <p className="text-muted-foreground">Tell us your dates & budget — AI creates a full day-by-day itinerary</p>
          <Link to="/assistant" className="inline-block bg-gradient-to-r from-vercel-violet to-vercel-violet text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-opacity">Open AI Trip Planner</Link>
        </section>
      </div>

      {/* Mobile FAB */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden flex gap-2 bg-card/90 backdrop-blur-md border border-border rounded-full px-4 py-2 shadow-xl">
        <button className="p-2 rounded-full hover:bg-secondary"><Heart className="w-5 h-5 text-foreground" /></button>
        <button className="p-2 rounded-full hover:bg-secondary"><Share2 className="w-5 h-5 text-foreground" /></button>
        <button className="p-2 rounded-full hover:bg-secondary"><Download className="w-5 h-5 text-foreground" /></button>
        <Link to="/assistant" className="p-2 rounded-full hover:bg-secondary"><MessageCircle className="w-5 h-5 text-vercel-violet" /></Link>
      </div>

      <Footer />
    </div>
  );
}
