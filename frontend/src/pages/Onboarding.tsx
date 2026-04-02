import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    title: 'How do you like to travel?',
    subtitle: 'Select your travel style',
    type: 'single',
    options: [
      { label: 'Solo', emoji: '🧍', value: 'solo' },
      { label: 'Couple', emoji: '💑', value: 'couple' },
      { label: 'Family', emoji: '👨‍👩‍👧‍👦', value: 'family' },
      { label: 'Friends', emoji: '👫', value: 'friends' },
    ],
  },
  {
    title: "What's your budget range?",
    subtitle: 'Per day spending capacity',
    type: 'single',
    options: [
      { label: 'Budget', emoji: '💰', value: 'low', desc: 'Under ₹5,000/day' },
      { label: 'Medium', emoji: '💎', value: 'medium', desc: '₹5,000 – ₹15,000/day' },
      { label: 'Luxury', emoji: '👑', value: 'luxury', desc: '₹15,000+/day' },
    ],
  },
  {
    title: 'What are your interests?',
    subtitle: 'Select all that apply',
    type: 'multi',
    options: [
      { label: 'Beaches', emoji: '🏖️', value: 'beaches' },
      { label: 'Mountains', emoji: '🏔️', value: 'mountains' },
      { label: 'Historical', emoji: '🏛️', value: 'historical' },
      { label: 'Foodie', emoji: '🍜', value: 'foodie' },
      { label: 'Adventure', emoji: '🧗', value: 'adventure' },
      { label: 'Spiritual', emoji: '🕉️', value: 'spiritual' },
      { label: 'Wildlife', emoji: '🐅', value: 'wildlife' },
      { label: 'Nightlife', emoji: '🍸', value: 'nightlife' },
    ],
  },
  {
    title: 'Preferred season?',
    subtitle: 'When do you usually travel',
    type: 'multi',
    options: [
      { label: 'Winter', emoji: '❄️', value: 'winter' },
      { label: 'Summer', emoji: '☀️', value: 'summer' },
      { label: 'Monsoon', emoji: '🌧️', value: 'monsoon' },
      { label: 'Any', emoji: '🌈', value: 'any' },
    ],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<number, string | string[]>>({});

  const current = STEPS[step];

  const handleSelect = (value: string) => {
    if (current.type === 'single') {
      setSelections({ ...selections, [step]: value });
    } else {
      const prev = (selections[step] as string[]) || [];
      if (prev.includes(value)) {
        setSelections({ ...selections, [step]: prev.filter(v => v !== value) });
      } else {
        setSelections({ ...selections, [step]: [...prev, value] });
      }
    }
  };

  const isSelected = (value: string) => {
    const sel = selections[step];
    if (Array.isArray(sel)) return sel.includes(value);
    return sel === value;
  };

  const canProceed = () => {
    const sel = selections[step];
    if (!sel) return false;
    if (Array.isArray(sel)) return sel.length > 0;
    return true;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Save preferences and redirect
      console.log('Preferences:', selections);
      navigate('/');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-background">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-12">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-vercel-violet' : 'bg-secondary'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{current.title}</h1>
            <p className="text-muted-foreground mb-10">{current.subtitle}</p>

            <div className={`grid gap-4 ${current.options.length <= 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-4'}`}>
              {current.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.03] ${
                    isSelected(opt.value)
                      ? 'border-vercel-violet bg-vercel-violet/10 shadow-lg shadow-vercel-violet/20'
                      : 'border-border bg-card hover:border-vercel-violet/40'
                  }`}
                >
                  <span className="text-4xl">{opt.emoji}</span>
                  <span className="font-semibold text-sm">{opt.label}</span>
                  {'desc' in opt && <span className="text-xs text-muted-foreground">{(opt as any).desc}</span>}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex justify-between items-center mt-12">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 rounded-xl border border-border bg-secondary text-foreground font-medium hover:bg-secondary/60 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-vercel-violet to-vercel-violet text-white font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {step === STEPS.length - 1 ? 'Complete Profile' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
