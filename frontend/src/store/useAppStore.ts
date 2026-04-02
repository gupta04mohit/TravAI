import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ──────── Language ──────── */
export type Lang = 'en' | 'hi';

export interface ActivePass {
  type: 'daily' | 'weekly' | 'monthly';
  expiresAt: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  isAdmin?: boolean;
  coins?: number;
  isPremium?: boolean;
  referralCode?: string;
  preferences?: {
    travelType?: string;
    budget?: string;
    interests?: string[];
    season?: string[];
  };
  settings?: {
    language?: string;
    notifications?: boolean;
    emailUpdates?: boolean;
  };
  activePass?: ActivePass | null;
}

const translations: Record<string, Record<Lang, string>> = {
  // Navbar
  'nav.home': { en: 'Home', hi: 'होम' },
  'nav.explore': { en: 'Explore', hi: 'खोजें' },
  'nav.blog': { en: 'Blog', hi: 'ब्लॉग' },
  'nav.info': { en: 'Info', hi: 'जानकारी' },
  'nav.login': { en: 'Log in', hi: 'लॉग इन' },
  'nav.signup': { en: 'Sign up', hi: 'साइन अप' },
  'nav.search': { en: 'Search Goa, Himachal, budget trip under 5000...', hi: 'गोवा, हिमाचल, 5000 से कम बजट ट्रिप खोजें...' },
  'nav.myTrips': { en: 'My Trips', hi: 'मेरी यात्राएं' },
  'nav.wishlist': { en: 'Wishlist', hi: 'विशलिस्ट' },
  'nav.profile': { en: 'Profile', hi: 'प्रोफाइल' },
  'nav.logout': { en: 'Log out', hi: 'लॉग आउट' },
  'nav.settings': { en: 'Settings', hi: 'सेटिंग्स' },
  'nav.coins': { en: 'Coins & Premium', hi: 'कॉइन्स और प्रीमियम' },

  // Home
  'home.hero.title': { en: 'Discover India', hi: 'भारत खोजें' },
  'home.hero.subtitle': { en: 'with AI Intelligence', hi: 'AI बुद्धिमत्ता के साथ' },
  'home.hero.desc': { en: 'Plan your perfect journey — smarter, faster, personalized.', hi: 'अपनी परफेक्ट यात्रा की योजना बनाएं — स्मार्ट, तेज़, व्यक्तिगत।' },
  'home.hero.cta': { en: 'Start Planning', hi: 'प्लानिंग शुरू करें' },
  'home.hero.demo': { en: 'Watch Demo', hi: 'डेमो देखें' },
  'home.recommended': { en: 'Recommended for YOU', hi: 'आपके लिए अनुशंसित' },
  'home.trending': { en: 'Trending Now', hi: 'अभी ट्रेंडिंग' },
  'home.categories': { en: 'Explore by Category', hi: 'श्रेणी के अनुसार खोजें' },
  'home.states': { en: 'Know Your State', hi: 'अपना राज्य जानें' },
  'home.mapPlanner': { en: 'Quick Map Planner', hi: 'क्विक मैप प्लानर' },
  'home.trust': { en: 'Used by 1,24,000+ travellers • Trusted by IRCTC partners', hi: '1,24,000+ यात्रियों द्वारा उपयोग • IRCTC पार्टनर्स द्वारा विश्वसनीय' },

  // Explore
  'explore.title': { en: 'Explore India', hi: 'भारत का अन्वेषण करें' },
  'explore.filter': { en: 'Filters', hi: 'फ़िल्टर' },
  'explore.budget': { en: 'Budget', hi: 'बजट' },
  'explore.season': { en: 'Season', hi: 'मौसम' },

  // Blog
  'blog.title': { en: 'Travel Stories & Guides', hi: 'यात्रा कहानियाँ और गाइड' },
  'blog.search': { en: 'Search articles...', hi: 'लेख खोजें...' },

  // Info
  'info.title': { en: 'About TravAI', hi: 'TravAI के बारे में' },
  'info.help': { en: 'Help & Support', hi: 'सहायता और समर्थन' },

  // Dashboard
  'dash.profile': { en: 'Profile', hi: 'प्रोफाइल' },
  'dash.trips': { en: 'My Trips', hi: 'मेरी यात्राएं' },
  'dash.wishlist': { en: 'Wishlist', hi: 'विशलिस्ट' },
  'dash.coins': { en: 'Coins & Premium', hi: 'कॉइन्स और प्रीमियम' },
  'dash.settings': { en: 'Settings', hi: 'सेटिंग्स' },

  // Common
  'common.places': { en: 'places', hi: 'जगहें' },
  'common.explore': { en: 'Explore', hi: 'खोजें' },
  'common.bookNow': { en: 'Book Now', hi: 'अभी बुक करें' },
  'common.readMore': { en: 'Read More', hi: 'और पढ़ें' },
  'common.from': { en: 'From (Your City)', hi: 'कहाँ से (आपका शहर)' },
  'common.to': { en: 'To (Destination)', hi: 'कहाँ तक (गंतव्य)' },
  'common.planRoute': { en: 'Plan Route', hi: 'रूट प्लान करें' },
  'common.aiItinerary': { en: '🤖 AI Itinerary', hi: '🤖 AI यात्रा कार्यक्रम' },
};

/* ──────── Store ──────── */
interface AppState {
  theme: 'light' | 'dark';
  lang: Lang;
  user: UserData | null;
  token: string | null;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  login: (user: UserData, token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<UserData>) => void;
  setCoins: (coins: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      lang: 'en',
      user: null,
      token: null,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setLang: (lang) => set({ lang }),
      t: (key: string) => {
        const lang = get().lang;
        return translations[key]?.[lang] || key;
      },
      login: (user, token) => {
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('travai_token');
        localStorage.removeItem('travai_user');
        set({ user: null, token: null });
      },
      updateUser: (data) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, ...data } });
        }
      },
      setCoins: (coins) => {
        const current = get().user;
        if (current) {
          set({ user: { ...current, coins } });
        }
      },
    }),
    {
      name: 'travai-store',
      partialize: (state) => ({ theme: state.theme, lang: state.lang, user: state.user, token: state.token }),
    }
  )
);
