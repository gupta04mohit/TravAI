import Footer from '../components/layout/Footer';
import { HelpCircle, Mail, Users, FileText, Shield } from 'lucide-react';

export default function Info() {
  return (
    <div className="w-full flex-1 flex flex-col">
      {/* About */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold">About TravAI</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          TravAI is India's first AI-powered travel decision system. We use Google Gemini 2.0 Flash and custom ML models trained on Indian travel data to give you hyper-personalized recommendations, itineraries, and real-time cost predictions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="p-6 rounded-2xl bg-card border border-border text-center"><span className="text-3xl block mb-3">🧠</span><h3 className="font-bold">AI-First</h3><p className="text-sm text-muted-foreground mt-2">Not just filters — real intelligence that understands your travel style</p></div>
          <div className="p-6 rounded-2xl bg-card border border-border text-center"><span className="text-3xl block mb-3">🇮🇳</span><h3 className="font-bold">India Focused</h3><p className="text-sm text-muted-foreground mt-2">28 states, 500+ places, curated data by experts + AI</p></div>
          <div className="p-6 rounded-2xl bg-card border border-border text-center"><span className="text-3xl block mb-3">💰</span><h3 className="font-bold">Budget Smart</h3><p className="text-sm text-muted-foreground mt-2">Cost predictions, affiliate deals, and savings optimization</p></div>
        </div>
      </section>

      {/* Help & Support */}
      <section className="max-w-4xl mx-auto px-4 py-12 w-full">
        <h2 className="text-3xl font-bold mb-8 text-center">Help & Support</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: <HelpCircle className="w-5 h-5" />, title: 'FAQ', desc: 'Find answers to common questions' },
            { icon: <Mail className="w-5 h-5" />, title: 'Contact Us', desc: 'support@travai.in' },
            { icon: <Users className="w-5 h-5" />, title: 'Community', desc: 'Join 50,000+ travellers on Discord' },
            { icon: <Shield className="w-5 h-5" />, title: 'Privacy & Security', desc: 'Your data is encrypted and safe' },
          ].map(item => (
            <div key={item.title} className="flex gap-4 p-5 rounded-xl bg-card border border-border hover:border-vercel-violet/30 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-vercel-violet/10 flex items-center justify-center text-vercel-violet shrink-0">{item.icon}</div>
              <div><h4 className="font-bold text-sm">{item.title}</h4><p className="text-xs text-muted-foreground">{item.desc}</p></div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
