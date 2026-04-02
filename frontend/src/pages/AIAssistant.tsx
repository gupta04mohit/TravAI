import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Download, Globe, Hotel, Lightbulb, MapPin, Plane, Plus, RefreshCw, Send, Sparkles, Star, User, UtensilsCrossed, Wand2, MicOff, Mic, ExternalLink, Shirt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../lib/api';
/* ──────────────── TYPES ──────────────── */
type MsgType = 'ai' | 'user' | 'system' | 'chips' | 'style-chips' | 'companion-chips' | 'generating';

interface ChatMessage {
  id: number;
  type: MsgType;
  text: string;
  chips?: string[];
  selectedChip?: string;
}

interface DayPlan {
  day: number;
  title: string;
  morning: { activity: string; cost: string; icon: string };
  localExp: { activity: string; cost: string; icon: string };
  evening: { activity: string; cost: string; icon: string };
  food: { activity: string; cost: string; icon: string };
  dayCost: string;
}

interface Itinerary {
  destination: string;
  days: number;
  budget: number;
  style: string;
  companion: string;
  plan: DayPlan[];
  flights: { airline: string; time: string; price: string; stops: string; logo: string }[];
  hotels: { name: string; rating: number; price: string; img: string; tag: string }[];
  foods: { name: string; price: string; reason: string; veg: boolean }[];
  tips: string[];
  packing: string[];
  budgetBreakdown: { category: string; percent: number; amount: string; color: string }[];
}

interface ExtractedState {
  destination?: string | null;
  days?: number | null;
  companion?: string | null;
  budget?: number | null;
  transport?: string | null;
  origin?: string | null;
  isComplete?: boolean;
  budgetSufficient?: boolean | null;
}

interface PartialPlanDay {
  day: number;
  title: string;
  activity: string;
}

interface TopPlace {
  name: string;
  description: string;
  budget: string;
  rating: number;
  image: string;
  mapLink: string;
}

interface SavedTrip {
  id: number;
  destination: string;
  days: number;
  budget: number;
  companion: string;
  transport: string;
  origin: string;
  itinerary: Itinerary;
  createdAt: Date;
}


/* ──────────────── CONSTANTS ──────────────── */
const QUICK_CHIPS = ['Goa', 'Manali', 'Kerala', 'Ladakh', 'Jaipur', 'Delhi', 'Rajasthan', 'Varanasi', 'Udaipur', 'Rishikesh'];

const DESTINATION_IMAGES: Record<string, string> = {
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop',
  manali: 'https://images.unsplash.com/photo-1626014903698-c9233f2694ce?q=80&w=800&auto=format&fit=crop',
  kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0f9942?q=80&w=800&auto=format&fit=crop',
  ladakh: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop',
  jaipur: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop',
  delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=800&auto=format&fit=crop',
  rajasthan: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop',
  varanasi: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=800&auto=format&fit=crop',
  udaipur: 'https://images.unsplash.com/photo-1602508640891-129f02e0c4a6?q=80&w=800&auto=format&fit=crop',
  rishikesh: 'https://images.unsplash.com/photo-1588878594721-ce1a8f430630?q=80&w=800&auto=format&fit=crop',
  shimla: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?q=80&w=800&auto=format&fit=crop',
  agra: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800&auto=format&fit=crop',
  mumbai: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=800&auto=format&fit=crop',
  bangalore: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop',
  mysore: 'https://images.unsplash.com/photo-1600100945498-77e41e209d1b?q=80&w=800&auto=format&fit=crop',
  ooty: 'https://images.unsplash.com/photo-1574870111867-089730e5a72b?q=80&w=800&auto=format&fit=crop',
  darjeeling: 'https://images.unsplash.com/photo-1622308644420-17dd91be0bab?q=80&w=800&auto=format&fit=crop',
};

const getDestinationImage = (destination: string): string => {
  const key = destination.toLowerCase().trim();
  // We use stable unspash image IDs from our dictionary, or a reliable static placeholder to avoid deprecation errors.
  return DESTINATION_IMAGES[key] || `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=800&auto=format&fit=crop`;
};



const TRENDING = [
  { id: 1, name: 'Himachal Backpacking', days: '5-7 Days', vibe: '🏔️ Adventure', budget: '₹15k-25k', image: 'https://images.unsplash.com/photo-1626014903698-c9233f2694ce?q=80&w=600&auto=format&fit=crop', trend: '+38%' },
  { id: 2, name: 'Goa Coastal Escape', days: '4 Days', vibe: '🏖️ Relax', budget: '₹20k-35k', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=600&auto=format&fit=crop', trend: '+24%' },
  { id: 3, name: 'Kerala Backwaters', days: '6 Days', vibe: '🌿 Nature', budget: '₹25k-40k', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0f9942?q=80&w=600&auto=format&fit=crop', trend: '+18%' },
  { id: 4, name: 'Royal Rajasthan', days: '7 Days', vibe: '🏰 Culture', budget: '₹30k-50k', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=600&auto=format&fit=crop', trend: '+15%' },
  { id: 5, name: 'Varanasi Spiritual', days: '3 Days', vibe: '🕉️ Spiritual', budget: '₹10k-18k', image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?q=80&w=600&auto=format&fit=crop', trend: '+42%' },
  { id: 6, name: 'Ladakh Road Trip', days: '8-10 Days', vibe: '🛣️ Adventure', budget: '₹35k-60k', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=600&auto=format&fit=crop', trend: '+31%' },
];

/* ──────────────── API HELPERS ──────────────── */
interface ChatEntry { role: 'user' | 'assistant'; content: string; }

/* ──────────────── COMPONENT ──────────────── */
export default function AIAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, type: 'ai', text: "Hello! 👋 I'm your travAI assistant powered by Llama 3.\n\nLet me help you plan the perfect trip! 🗺️\n\n📍 First, tell me — where would you like to go?" },
  ]);
  const [destinationImage, setDestinationImage] = useState<string | null>(null);
  const [budgetVerdict, setBudgetVerdict] = useState<{sufficient: boolean; message: string} | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedState>({});
  const [rightTab, setRightTab] = useState<'itinerary' | 'flights' | 'hotels' | 'food' | 'tips'>('itinerary');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [isListening, setIsListening] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [partialPlan, setPartialPlan] = useState<PartialPlanDay[] | null>(null);
  const [destinationInfo, setDestinationInfo] = useState<TopPlace[] | null>(null);
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [activeTripIndex, setActiveTripIndex] = useState<number | null>(null);
  const isFetchingPartial = useRef(false);
  const isFetchingDestInfo = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const addMsg = useCallback((msg: Omit<ChatMessage, 'id'>) => {
    setMessages(prev => [...prev, { ...msg, id: Date.now() + Math.random() }]);
  }, []);

  /* ── REAL AI CHAT ── */
  const handleSend = async (overrideText?: string) => {
    const text = overrideText || input.trim();
    if (!text || isThinking) return;

    // Add user message to UI
    addMsg({ type: 'user', text });
    setInput('');

    // Add to chat history for API
    const newHistory: ChatEntry[] = [...chatHistory, { role: 'user', content: text }];
    setChatHistory(newHistory);

    // Show thinking indicator
    setIsThinking(true);
    addMsg({ type: 'generating', text: '🤔 Thinking...' });

    try {
      const result = await fetchApi('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: newHistory, extracted: extractedData }),
      });

      // Remove thinking indicator
      setMessages(prev => prev.filter(m => m.type !== 'generating'));

      // Add AI response
      const aiReply = result.reply;
      const extracted = result.extracted;
      
      addMsg({ type: 'ai', text: aiReply });

      // Add to chat history
      const updatedHistory: ChatEntry[] = [...newHistory, { role: 'assistant', content: aiReply }];
      setChatHistory(updatedHistory);
      
      if (extracted) {
        setExtractedData(prev => {
           // Only keep truthy values so we don't overwrite with nulls if LLM forgets something
           const cleanedExtracted = Object.fromEntries(Object.entries(extracted).filter(([_, v]) => v != null));
           const newData = { ...prev, ...cleanedExtracted };
           
           // Show destination image IMMEDIATELY when destination is detected
           if (newData.destination && !destinationImage) {
             setDestinationImage(getDestinationImage(newData.destination));
           }

           if (newData.destination && newData.isComplete && newData.budgetSufficient && !destinationInfo && !isFetchingDestInfo.current) {
             isFetchingDestInfo.current = true;
             fetchDestinationInfo(newData.destination, String(newData.budget));
           }

           if (newData.destination && newData.days && !partialPlan && !isFetchingPartial.current) {
             isFetchingPartial.current = true;
             fetchPartialPlan(newData.destination, newData.days);
           }
           
           return newData;
        });
        
        if (extracted.destination && extracted.days && !extracted.transport) {
          addMsg({ type: 'companion-chips', text: '', chips: ['✈️ Plane', '🚂 Train', '🚌 Bus', '🚗 Car'] });
        } else if (extracted.destination && extracted.days && extracted.transport && extracted.origin && !extracted.companion) {
          addMsg({ type: 'companion-chips', text: '', chips: ['Solo', 'Couple', 'Family', 'Friends', 'Relatives'] });
        }
        
        if (extracted.isComplete) {
          if (extracted.budgetSufficient === false) {
             // Budget not enough — show verdict
             setBudgetVerdict({
               sufficient: false,
               message: `Sorry, ₹${extracted.budget?.toLocaleString('en-IN')} is not enough for a ${extracted.days}-day trip to ${extracted.destination}. We recommend at least ₹${((extracted.days || 3) * 1500).toLocaleString('en-IN')}.`
             });
          } else {
             // Budget sufficient — show verdict and generate
             setBudgetVerdict({
               sufficient: true,
               message: `Yes, your trip is possible! ✅ ₹${extracted.budget?.toLocaleString('en-IN')} is a great budget for ${extracted.days} days in ${extracted.destination}.`
             });
             handleGeneratePlan(updatedHistory, extracted);
          }
        }
      }
    } catch (err: any) {
      setMessages(prev => prev.filter(m => m.type !== 'generating'));
      addMsg({ type: 'ai', text: `❌ Error: ${err.message}. Make sure Ollama is running (ollama serve) and the model is pulled (ollama pull llama3.2:1b).` });
    } finally {
      setIsThinking(false);
    }
  };

  // Helper for partial plan
  const fetchPartialPlan = async (dest: string, dys: number) => {
    try {
      const res = await fetchApi('/ai/partial-plan', {
        method: 'POST', body: JSON.stringify({ destination: dest, days: dys })
      });
      if (res.plan) setPartialPlan(res.plan);
    } catch (e) { console.error('Partial plan error:', e); }
  };

  // Helper for destination info waiting for budget
  const fetchDestinationInfo = async (dest: string, budget: string) => {
    try {
      const res = await fetchApi('/ai/destination-info', {
        method: 'POST', body: JSON.stringify({ destination: dest, budget: budget })
      });
      if (res.topPlaces) setDestinationInfo(res.topPlaces);
    } catch (e) { console.error('Dest info error:', e); }
  };

  /* ── GENERATE PLAN FROM CONVERSATION ── */
  const handleGeneratePlan = async (externalHistory?: ChatEntry[], externalExtracted?: Partial<ExtractedState>) => {
    const historyToUse = externalHistory || chatHistory;
    const dataToUse = externalExtracted ? { ...extractedData, ...externalExtracted } : extractedData;

    setIsThinking(true);
    setItinerary(null);
    setRightTab('itinerary');
    addMsg({ type: 'generating', text: '✨ Generating your itinerary...' });

    try {
      const result = await fetchApi('/ai/extract-and-generate', {
        method: 'POST',
        body: JSON.stringify({ messages: historyToUse, extractedData: dataToUse }),
      });

      setMessages(prev => prev.filter(m => m.type !== 'generating'));
      setItinerary(result.itinerary);
      setShowMobilePanel(true);

      const td = result.tripDetails;

      // Save trip to dashboard
      const newTrip: SavedTrip = {
        id: Date.now(),
        destination: td.destination,
        days: td.days,
        budget: td.budget,
        companion: td.companion,
        transport: td.transport || 'Plane',
        origin: td.origin || 'your city',
        itinerary: result.itinerary,
        createdAt: new Date(),
      };
      setSavedTrips(prev => [...prev, newTrip]);
      setActiveTripIndex(null); // Show current trip

      addMsg({
        type: 'ai',
        text: `🎉 Your plan is ready!\n\n📍 ${td.destination} · 📅 ${td.days} days · 💰 ₹${td.budget?.toLocaleString('en-IN')} · ${td.companion}\n\n🔍 Check the right panel for your complete itinerary!\n\n🌟 Would you like to plan another trip?`,
      });

      // Show "Plan another trip?" chips
      addMsg({ type: 'companion-chips', text: '', chips: ['🗺️ Yes, plan another trip!'] });

      // Add to chat history
      setChatHistory(prev => [...prev, { role: 'assistant', content: `I generated a ${td.days}-day plan for ${td.destination} with ₹${td.budget} budget.` }]);
    } catch (err: any) {
      setMessages(prev => prev.filter(m => m.type !== 'generating'));
      addMsg({ type: 'ai', text: `❌ Plan generation failed: ${err.message}. Make sure Ollama is running.` });
    } finally {
      setIsThinking(false);
    }
  };

  const handleChipClick = (dest: string) => {
    handleSend(`I want to visit ${dest}`);
  };

  const handleNewChat = () => {
    setMessages([{ id: 1, type: 'ai', text: "Hello! 👋 I'm your travAI assistant powered by Llama 3.\n\nLet me help you plan the perfect trip! 🗺️\n\n📍 First, tell me — where would you like to go?" }]);
    setChatHistory([]);
    setItinerary(null);
    setExtractedData({});
    setPartialPlan(null);
    setDestinationInfo(null);
    setDestinationImage(null);
    setBudgetVerdict(null);
    setActiveTripIndex(null);
    isFetchingPartial.current = false;
    isFetchingDestInfo.current = false;
    setRightTab('itinerary');
    setShowMobilePanel(false);
  };

  const handleViewSavedTrip = (index: number) => {
    const trip = savedTrips[index];
    if (trip) {
      setActiveTripIndex(index);
      setItinerary(trip.itinerary);
      setShowMobilePanel(true);
      setRightTab('itinerary');
      setExpandedDay(1);
    }
  };

  const handleSendOverride = (text: string) => {
    if (text.includes('plan another trip')) {
      handleNewChat();
      return;
    }
    handleSend(text);
  };

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) { return; }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  };

  const handleRegenerate = () => {
    handleGeneratePlan();
  };

  /* ──────────── RENDER ──────────── */
  const isSavedTrip = activeTripIndex !== null;
  const displayOrigin = isSavedTrip ? savedTrips[activeTripIndex!].origin : extractedData.origin || 'Your City';
  const displayTransport = isSavedTrip ? savedTrips[activeTripIndex!].transport : extractedData.transport || 'Plane';

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border overflow-hidden">

        {/* ═══════════ LEFT PANEL — CHAT ═══════════ */}
        <div className="w-full lg:w-[55%] h-full flex flex-col bg-background relative z-10">

          {/* Header */}
          <div className="px-5 py-3 border-b border-border flex justify-between items-center bg-background/80 backdrop-blur-sm">
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vercel-violet opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-vercel-violet" />
                </span>
                travAI Assistant
              </h1>
              <p className="text-xs text-muted-foreground ml-5">AI-powered trip planner · Llama 3 via Ollama</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleNewChat} className="p-2 hover:bg-secondary rounded-full transition-colors" title="New Chat"><Plus className="w-5 h-5" /></button>
              {itinerary && <button onClick={() => setShowMobilePanel(!showMobilePanel)} className="p-2 hover:bg-secondary rounded-full transition-colors lg:hidden" title="Toggle Plan"><Globe className="w-5 h-5" /></button>}
            </div>
          </div>

          {/* Quick Chips */}
          <div className="flex gap-2 px-4 py-2.5 overflow-x-auto border-b border-border/50 scrollbar-hide bg-secondary/10">
            {QUICK_CHIPS.map(chip => (
              <button key={chip} onClick={() => !isThinking && handleChipClick(chip)} className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border border-border transition-all ${!isThinking ? 'bg-secondary hover:bg-vercel-violet hover:text-white hover:border-vercel-violet cursor-pointer' : 'bg-secondary/50 text-muted-foreground cursor-default opacity-60'}`}>
                {chip}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <AnimatePresence>
              {messages.map(msg => (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  {msg.type === 'user' && (
                    <div className="flex justify-end">
                      <div className="bg-vercel-violet text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-sm shadow-md">{msg.text}</div>
                    </div>
                  )}
                  {msg.type === 'ai' && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-zinc-900 border border-vercel-violet/30 flex items-center justify-center text-sm">🤖</div>
                      <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm leading-relaxed whitespace-pre-line shadow-sm">{msg.text}</div>
                    </div>
                  )}
                  {msg.type === 'system' && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-zinc-900 border border-vercel-violet/30 flex items-center justify-center text-sm">
                        <span className="animate-spin text-xs">⚙️</span>
                      </div>
                      <div className="bg-vercel-violet/10 border border-vercel-violet/20 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm text-vercel-violet font-medium">{msg.text}</div>
                    </div>
                  )}
                  {msg.type === 'generating' && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-zinc-900 border border-vercel-violet/30 flex items-center justify-center">
                        <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-sm">🧠</motion.span>
                      </div>
                      <div className="bg-gradient-to-r from-vercel-violet/10 to-neon-cyan/10 border border-vercel-violet/20 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm font-medium">
                        <span className="animate-pulse">{msg.text}</span>
                      </div>
                    </div>
                  )}
                  {msg.type === 'companion-chips' && (
                    <div className="flex gap-2 px-12 py-1 flex-wrap">
                      {msg.chips?.map(chip => (
                        <button key={chip} onClick={() => !isThinking && handleSendOverride(chip)} className="px-3 py-1.5 rounded-full text-xs font-medium border border-vercel-violet/30 bg-vercel-violet/10 hover:bg-vercel-violet hover:text-white transition-colors text-vercel-violet">
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}

                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="px-4 py-3 bg-background border-t border-border">
            <div className="relative flex items-center rounded-full bg-secondary border border-border hover:border-vercel-violet/50 focus-within:border-vercel-violet transition-colors shadow-sm">
              <button onClick={() => handleGeneratePlan()} disabled={isThinking || chatHistory.length === 0} className="p-3 text-vercel-violet hover:text-white hover:bg-vercel-violet rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed" title="Generate Plan from conversation">
                <Wand2 className="w-4 h-4" />
              </button>
              <input type="text" autoFocus value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder={isThinking ? 'AI is thinking...' : 'Chat naturally — say hi, ask about Goa, share your budget...'} disabled={isThinking} className="flex-1 bg-transparent text-foreground py-3.5 focus:outline-none placeholder-muted-foreground text-sm disabled:opacity-50" />
              <button onClick={handleVoice} className={`p-3 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground hover:text-foreground'}`}>
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button onClick={() => handleSend()} disabled={!input.trim() || isThinking} className="mr-2 w-9 h-9 rounded-full bg-vercel-violet text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-1.5">Powered by Llama 3 via Ollama · Chat naturally, then hit ✨ to generate a plan</p>
          </div>
        </div>

        {/* ═══════════ RIGHT PANEL — PLANNING CANVAS ═══════════ */}
        <div className={`w-full lg:w-[45%] h-full bg-secondary/20 overflow-hidden flex flex-col ${showMobilePanel ? 'block' : 'hidden lg:flex'}`}>

          {itinerary ? (
            /* ─── ITINERARY VIEW ─── */
            <>
              {/* Saved Trips Tabs */}
              {savedTrips.length > 0 && (
                <div className="flex gap-1.5 px-4 py-2 border-b border-border bg-background/80 overflow-x-auto scrollbar-hide">
                  {savedTrips.map((trip, idx) => (
                    <button key={trip.id} onClick={() => handleViewSavedTrip(idx)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${activeTripIndex === idx ? 'bg-vercel-violet text-white' : 'bg-card border border-border hover:border-vercel-violet/40'}`}>
                      <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                      <span className="capitalize">{trip.destination}</span>
                      <span className="text-[10px] opacity-70">{trip.days}D</span>
                    </button>
                  ))}
                  {activeTripIndex !== null && (
                    <button onClick={() => { setActiveTripIndex(null); if (extractedData.isComplete) { /* keep current */ } }} className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20">
                      ← Current
                    </button>
                  )}
                </div>
              )}
              {/* Itinerary Header */}
              <div className="p-5 border-b border-border bg-background/60 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-black capitalize bg-clip-text text-transparent bg-gradient-to-r from-vercel-violet to-neon-cyan">{itinerary.destination} Itinerary</h2>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">{itinerary.days} Days • {itinerary.companion} Trip</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={handleRegenerate} className="p-2 border border-border/50 bg-secondary/50 rounded-xl hover:bg-secondary hover:border-vercel-violet/50 transition-all" title="Regenerate Options"><RefreshCw className="w-4 h-4" /></button>
                    <button className="p-2 border border-border/50 bg-secondary/50 rounded-xl hover:bg-secondary hover:border-vercel-violet/50 transition-all" title="Download PDF"><Download className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Explicit Selection Summary */}
                <div className="bg-card border border-border/60 rounded-xl p-3 mb-4 shadow-sm text-[11px] font-medium grid grid-cols-2 lg:grid-cols-4 gap-2">
                   <div className="flex flex-col gap-0.5 px-2">
                     <span className="text-muted-foreground uppercase text-[9px] tracking-wider">From</span>
                     <span className="text-foreground capitalize flex items-center gap-1.5"><MapPin className="w-3 h-3 text-vercel-violet" /> {displayOrigin}</span>
                   </div>
                   <div className="flex flex-col gap-0.5 px-2 border-l border-border/40">
                     <span className="text-muted-foreground uppercase text-[9px] tracking-wider">To</span>
                     <span className="text-foreground capitalize flex items-center gap-1.5"><Plane className="w-3 h-3 text-vercel-violet" /> {itinerary.destination}</span>
                   </div>
                   <div className="flex flex-col gap-0.5 px-2 border-l border-border/40">
                     <span className="text-muted-foreground uppercase text-[9px] tracking-wider">Via</span>
                     <span className="text-foreground capitalize flex items-center gap-1.5">
                       <span className="w-3 h-3 text-vercel-violet flex items-center justify-center">⚡</span> {displayTransport}
                     </span>
                   </div>
                   <div className="flex flex-col gap-0.5 px-2 border-l border-border/40">
                     <span className="text-muted-foreground uppercase text-[9px] tracking-wider">With</span>
                     <span className="text-foreground capitalize flex items-center gap-1.5"><User className="w-3 h-3 text-vercel-violet" /> {itinerary.companion}</span>
                   </div>
                </div>

                {/* Budget Progress */}
                <div className="mb-3">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Est. Total Expense</h4>
                      <p className="text-2xl font-black mt-0.5 tracking-tight flex items-baseline gap-1">
                        <span className="text-lg">₹</span>{itinerary.budgetBreakdown.reduce((sum, b) => sum + parseInt(b.amount.replace(/[^0-9]/g, '')), 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[10px] text-muted-foreground font-medium bg-secondary/50 px-2 py-0.5 rounded border border-border/50">Budget: ₹{itinerary.budget.toLocaleString('en-IN')}</span>
                      {itinerary.budgetBreakdown.reduce((sum, b) => sum + parseInt(b.amount.replace(/[^0-9]/g, '')), 0) <= itinerary.budget ? (
                        <span className="text-[10px] text-green-500 font-bold mt-1">✓ Under Budget</span>
                      ) : (
                        <span className="text-[10px] text-red-400 font-bold mt-1">⚠️ Over Budget</span>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden flex">
                    {itinerary.budgetBreakdown.map((b, i) => <div key={i} className={`h-full ${b.color}`} style={{ width: `${b.percent}%` }} />)}
                  </div>
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {itinerary.budgetBreakdown.map((b, i) => (
                      <span key={i} className="text-[10px] flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${b.color}`} />{b.category} {b.percent}%</span>
                    ))}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                  {([
                    { id: 'itinerary' as const, icon: <MapPin className="w-3.5 h-3.5" />, label: 'Itinerary' },
                    { id: 'flights' as const, icon: <Plane className="w-3.5 h-3.5" />, label: 'Flights' },
                    { id: 'hotels' as const, icon: <Hotel className="w-3.5 h-3.5" />, label: 'Hotels' },
                    { id: 'food' as const, icon: <UtensilsCrossed className="w-3.5 h-3.5" />, label: 'Food' },
                    { id: 'tips' as const, icon: <Lightbulb className="w-3.5 h-3.5" />, label: 'Tips' },
                  ]).map(t => (
                    <button key={t.id} onClick={() => setRightTab(t.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${rightTab === t.id ? 'bg-vercel-violet text-white' : 'bg-card border border-border hover:border-vercel-violet/40'}`}>
                      {t.icon}{t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">

                {rightTab === 'itinerary' && itinerary.plan.map(day => (
                  <div key={day.day} className="rounded-xl border border-border bg-card overflow-hidden">
                    <button onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)} className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-vercel-violet/10 flex items-center justify-center text-vercel-violet text-xs font-bold">D{day.day}</span>
                        <div className="text-left">
                          <h4 className="text-sm font-bold">{day.title}</h4>
                          <p className="text-[11px] text-muted-foreground">Est. {day.dayCost}</p>
                        </div>
                      </div>
                      {expandedDay === day.day ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <AnimatePresence>
                      {expandedDay === day.day && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border overflow-hidden">
                          <div className="p-4 space-y-3">
                            {[day.morning, day.localExp, day.evening, day.food].map((slot, i) => (
                              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                                <span className="text-lg">{slot.icon}</span>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{slot.activity}</p>
                                  <p className="text-xs text-muted-foreground">Est. {slot.cost}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {rightTab === 'flights' && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground mb-2">✈️ Top 3 cheapest flights to {itinerary.destination}</p>
                    {itinerary.flights.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-vercel-violet/30 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-vercel-violet/10 flex items-center justify-center text-xs font-bold text-vercel-violet">{f.logo}</div>
                          <div>
                            <p className="text-sm font-bold">{f.airline}</p>
                            <p className="text-xs text-muted-foreground">{f.time} · {f.stops}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-vercel-violet">{f.price}</p>
                          <button className="text-[10px] text-vercel-violet font-semibold hover:underline flex items-center gap-0.5">Book <ExternalLink className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ))}
                    <p className="text-[10px] text-muted-foreground text-center mt-3">Prices via Google Flights · Affiliate links earn you ₹42 cashback</p>
                  </div>
                )}

                {rightTab === 'hotels' && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground mb-2">🏨 Stay options in {itinerary.destination}</p>
                    {itinerary.hotels.map((h, i) => (
                      <div key={i} className="p-4 rounded-xl bg-card border border-border hover:border-vercel-violet/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{h.img}</span>
                            <div>
                              <p className="text-sm font-bold">{h.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{h.rating}</p>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-vercel-violet/10 text-vercel-violet font-bold">{h.tag}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-sm font-bold">{h.price}</p>
                          <button className="text-xs font-bold px-4 py-2 rounded-lg bg-vercel-violet text-white hover:opacity-90 transition-opacity">Book Now</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {rightTab === 'food' && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground mb-2">🍜 AI-curated food recommendations</p>
                    {itinerary.foods.map((f, i) => (
                      <div key={i} className="flex gap-3 p-4 rounded-xl bg-card border border-border hover:border-vercel-violet/30 transition-all">
                        <span className="text-2xl">{f.veg ? '🥬' : '🍗'}</span>
                        <div>
                          <p className="text-sm font-bold">{f.name} · <span className="text-vercel-violet">{f.price}</span></p>
                          <p className="text-xs text-muted-foreground">{f.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {rightTab === 'tips' && (
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5" /> Travel Tips</p>
                      <div className="space-y-2">
                        {itinerary.tips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-card border border-border text-sm">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1"><Shirt className="w-3.5 h-3.5" /> Packing List</p>
                      <div className="grid grid-cols-2 gap-2">
                        {itinerary.packing.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border text-xs">
                            <input type="checkbox" className="rounded accent-vercel-violet" />{item}
                          </div>
                        ))}
                      </div>
                      <button className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-vercel-violet/30 bg-vercel-violet/5 text-sm font-medium text-vercel-violet hover:bg-vercel-violet/10 transition-colors">
                        <Download className="w-4 h-4" /> Download Packing List PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Premium Upgrade Banner */}
              <div className="p-3 border-t border-border bg-gradient-to-r from-vercel-violet/10 to-neon-cyan/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-vercel-violet" />
                  <span className="text-xs font-medium">Unlock unlimited plans + flight alerts</span>
                </div>
                <button className="text-[10px] font-bold bg-vercel-violet text-white px-3 py-1 rounded-full hover:opacity-90">Premium ₹99/mo</button>
              </div>
            </>

          ) : (extractedData.destination || destinationImage) ? (
            /* ─── DYNAMIC BUILDING VIEW ─── */
            <div className="p-5 h-full overflow-y-auto">
              <div className="max-w-lg mx-auto space-y-6">
                
                {/* ── Destination Image Card ── */}
                {destinationImage && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden shadow-2xl border border-border bg-secondary animate-pulse">
                    <img src={destinationImage} alt={extractedData.destination || 'Destination'} className="object-cover w-full h-full opacity-0 transition-opacity duration-700 ease-in-out" onLoad={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.parentElement?.classList.remove('animate-pulse'); }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-6 right-6">
                      <h2 className="text-3xl font-black text-white capitalize mb-1">{extractedData.destination}</h2>
                      <p className="text-vercel-violet font-semibold text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Destination selected ✓
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ── Step Progress Tracker ── */}
                <div className="bg-secondary/30 backdrop-blur-sm rounded-2xl p-5 border border-border shadow-sm">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-vercel-violet" />
                    Building your trip...
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Step 1: Destination */}
                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${extractedData.destination ? 'bg-green-500 text-white' : 'bg-vercel-violet/20 text-vercel-violet'}`}>{extractedData.destination ? '✓' : '1'}</span>
                        Destination
                      </span>
                      <span className="font-semibold capitalize">{extractedData.destination || <span className="animate-pulse text-vercel-violet/70">Waiting...</span>}</span>
                    </div>
                    
                    {/* Step 2: Days */}
                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${extractedData.days ? 'bg-green-500 text-white' : extractedData.destination ? 'bg-vercel-violet/20 text-vercel-violet animate-pulse' : 'bg-secondary text-muted-foreground'}`}>{extractedData.days ? '✓' : '2'}</span>
                        Days
                      </span>
                      <span className="font-semibold">{extractedData.days ? `${extractedData.days} Days` : <span className="text-muted-foreground text-xs">{extractedData.destination ? 'Tell me how many days...' : '—'}</span>}</span>
                    </div>
                    
                    {/* Step 3: Transport */}
                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${extractedData.transport ? 'bg-green-500 text-white' : extractedData.days ? 'bg-vercel-violet/20 text-vercel-violet animate-pulse' : 'bg-secondary text-muted-foreground'}`}>{extractedData.transport ? '✓' : '3'}</span>
                        Transport Mode
                      </span>
                      <span className="font-semibold capitalize">{extractedData.transport || <span className="text-muted-foreground text-xs">{extractedData.days ? 'Train, Plane...' : '—'}</span>}</span>
                    </div>

                    {/* Step 4: Origin */}
                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${extractedData.origin ? 'bg-green-500 text-white' : extractedData.transport ? 'bg-vercel-violet/20 text-vercel-violet animate-pulse' : 'bg-secondary text-muted-foreground'}`}>{extractedData.origin ? '✓' : '4'}</span>
                        Starting Point
                      </span>
                      <span className="font-semibold capitalize">{extractedData.origin || <span className="text-muted-foreground text-xs">{extractedData.transport ? 'Enter origin city...' : '—'}</span>}</span>
                    </div>
                    
                    {/* Step 5: Companion */}
                    <div className="flex items-center justify-between pb-3 border-b border-border/50">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${extractedData.companion ? 'bg-green-500 text-white' : extractedData.origin ? 'bg-vercel-violet/20 text-vercel-violet animate-pulse' : 'bg-secondary text-muted-foreground'}`}>{extractedData.companion ? '✓' : '5'}</span>
                        Traveling with
                      </span>
                      <span className="font-semibold capitalize">{extractedData.companion || <span className="text-muted-foreground text-xs">{extractedData.origin ? 'Solo, Family, Friends...' : '—'}</span>}</span>
                    </div>
                    
                    {/* Step 6: Budget */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${extractedData.budget ? 'bg-green-500 text-white' : extractedData.companion ? 'bg-vercel-violet/20 text-vercel-violet animate-pulse' : 'bg-secondary text-muted-foreground'}`}>{extractedData.budget ? '✓' : '6'}</span>
                        Budget
                      </span>
                      <span className="font-semibold">{extractedData.budget ? `₹${extractedData.budget.toLocaleString('en-IN')}` : <span className="text-muted-foreground text-xs">{extractedData.companion ? 'Enter your budget...' : '—'}</span>}</span>
                    </div>
                  </div>
                </div>

                {/* ── Day-wise Plan Preview (appears after days are entered) ── */}
                {partialPlan && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                    <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-vercel-violet" />
                      Day-wise Itinerary Preview
                    </h3>
                    <div className="space-y-3">
                      {partialPlan.map((p, idx) => (
                        <motion.div key={p.day} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1, duration: 0.3 }} className="flex gap-3 items-start p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border/30">
                          <span className="w-10 h-10 rounded-xl bg-vercel-violet/15 flex items-center justify-center text-vercel-violet text-sm font-black shrink-0">D{p.day}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm leading-tight">{p.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{p.activity}</p>
                          </div>
                          <span className="text-lg">{'🏛️🌄🌊🎭🛕🏖️🌿🏔️'.charAt(idx % 8) || '📍'}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ── Budget Verdict ── */}
                {budgetVerdict && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className={`rounded-2xl p-5 border shadow-sm ${
                    budgetVerdict.sufficient 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                        budgetVerdict.sufficient ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {budgetVerdict.sufficient ? '✅' : '❌'}
                      </span>
                      <h3 className={`font-bold text-lg ${
                        budgetVerdict.sufficient ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {budgetVerdict.sufficient ? 'Yes, your trip is possible!' : 'Budget Not Sufficient'}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground ml-[52px]">{budgetVerdict.message}</p>
                    {budgetVerdict.sufficient && (
                      <p className="text-xs text-green-400/70 mt-2 ml-[52px] animate-pulse">🔄 Generating your detailed plan...</p>
                    )}
                  </motion.div>
                )}

                {/* ── Top Places (after budget approval) ── */}
                {destinationInfo && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pb-8">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Star className="w-5 h-5 text-vercel-violet fill-vercel-violet/20" />
                      Must Visit in <span className="capitalize">{extractedData.destination}</span>
                    </h3>
                    {destinationInfo.map((p, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-4 p-3 rounded-2xl bg-card border border-border shadow-sm hover:border-vercel-violet/50 transition-all">
                        <div className="w-24 h-24 rounded-xl shrink-0 bg-secondary animate-pulse overflow-hidden">
                          <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover opacity-0 transition-opacity duration-700 ease-in-out" onLoad={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.parentElement?.classList.remove('animate-pulse'); }} />
                        </div>
                        <div className="flex-1 py-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm leading-tight">{p.name}</h4>
                            <span className="text-[10px] font-bold bg-vercel-violet/10 text-vercel-violet px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3 fill-vercel-violet" /> {p.rating}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-[11px] font-semibold text-vercel-violet">Entry/Budget: {p.budget}</p>
                            <a href={p.mapLink} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> View Map
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          ) : (
            /* ─── DEFAULT TRENDING VIEW ─── */
            <div className="p-5 h-full overflow-y-auto">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🌍</span>
                  <h2 className="text-xl font-bold">Plan Your Dream Trip</h2>
                </div>
                <p className="text-sm text-muted-foreground">Tell me where you want to go, and I'll create a personalized itinerary with budget, activities, and local insights.</p>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" /></span>
                <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Live Trending</h3>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {TRENDING.map(dest => (
                  <div key={dest.id} onClick={() => !isThinking && handleChipClick(dest.name.split(' ')[0])} className="group relative overflow-hidden rounded-xl bg-card border border-border shadow-sm hover:shadow-md hover:border-vercel-violet/50 transition-all cursor-pointer">
                    <div className="h-28 w-full relative overflow-hidden">
                      <img src={dest.image} alt={dest.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-2 right-2 bg-green-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{dest.trend}</div>
                      <div className="absolute bottom-2 left-3 text-white">
                        <h4 className="font-bold text-sm">{dest.name}</h4>
                        <p className="text-[10px] text-white/80">{dest.days} • {dest.vibe}</p>
                      </div>
                    </div>
                    <div className="p-2.5 flex justify-between items-center">
                      <span className="font-medium text-xs">{dest.budget}</span>
                      <span className="text-[10px] font-semibold text-vercel-violet">Start Planning →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
