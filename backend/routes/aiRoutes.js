const express = require('express');
const router = express.Router();

// Placeholder for Gemini AI integration
// In production: import { GoogleGenerativeAI } from '@google/generative-ai';

router.post('/generate-itinerary', async (req, res) => {
  try {
    const { destination, days, budget, travelType, interests } = req.body;

    const systemPrompt = `You are travAI, an Indian trip planning assistant.
Generate a strictly formatted JSON response for a trip to ${destination} for ${days} days, budget of ₹${budget}, style: ${travelType}, companion: ${interests}.
The output must be pure JSON with NO markdown and NO conversational text.
Use this EXACT JSON structure:
{
  "destination": "${destination}",
  "days": ${days},
  "budget": ${budget},
  "style": "${travelType}",
  "companion": "${interests}",
  "plan": [
    {
      "day": 1,
      "title": "Explore ${destination}",
      "morning": {"activity": "Specific activity", "cost": "₹999", "icon": "🌅"},
      "localExp": {"activity": "Specific activity", "cost": "₹999", "icon": "🎭"},
      "evening": {"activity": "Specific activity", "cost": "₹999", "icon": "🌆"},
      "food": {"activity": "Specific restaurant/dish", "cost": "₹999", "icon": "🍽️"},
      "dayCost": "₹3996"
    }
  ],
  "flights": [
    {"airline": "IndiGo", "time": "10:00 - 12:00", "price": "₹4500", "stops": "Non-stop", "logo": "6E"}
  ],
  "hotels": [
    {"name": "Local Stay", "rating": 4.5, "price": "₹2000/night", "img": "🏨", "tag": "Best Value"}
  ],
  "foods": [
    {"name": "Local Dish", "price": "₹150", "reason": "Famous here", "veg": true}
  ],
  "tips": ["Tip 1", "Tip 2"],
  "packing": ["Item 1", "Item 2"],
  "budgetBreakdown": [
    {"category": "Accommodation", "percent": 40, "amount": "₹${Math.round(budget * 0.4)}", "color": "bg-purple-500"},
    {"category": "Food", "percent": 30, "amount": "₹${Math.round(budget * 0.3)}", "color": "bg-neon-cyan"},
    {"category": "Transport", "percent": 20, "amount": "₹${Math.round(budget * 0.2)}", "color": "bg-blue-500"},
    {"category": "Activities", "percent": 10, "amount": "₹${Math.round(budget * 0.1)}", "color": "bg-green-500"}
  ]
}`;

    const ollamaPayload = {
      model: 'llama3.2:1b',
      messages: [{ role: 'user', content: systemPrompt }],
      stream: false
    };

    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ollamaPayload)
    });

    if (!response.ok) {
      throw new Error(`Ollama Error: ${response.statusText}`);
    }

    const data = await response.json();
    const itinerary = JSON.parse(data.message.content);

    res.json({ success: true, itinerary });
  } catch (err) {
    console.error("Ollama AI Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ═══════════ STRICT STEP-BY-STEP AI CHAT ═══════════
router.post('/chat', async (req, res) => {
  try {
    const { messages, extracted = {} } = req.body;
    const lastUserMessage = messages.length > 0 ? messages[messages.length - 1].content.trim().toLowerCase() : "";

    // ─── DEFINITIVE NODE.JS STATE MACHINE ───
    // We handle the extraction natively first to avoid LLM hallucinations, then use the LLM just for personality.
    const mergedExt = { ...extracted };

    // Valid Companions & Transports
    const validCompanions = ['solo', 'couple', 'family', 'friends', 'relatives'];
    const validTransports = ['train', 'plane', 'flight', 'bus', 'car', 'drive'];

    // STATE 1: DESTINATION
    if (!mergedExt.destination) {
       if (lastUserMessage && lastUserMessage.length > 2 && !lastUserMessage.includes('hello') && !lastUserMessage.includes('hi')) {
           // Basic validation for destination (must be text, >2 chars, reasonable length)
           const cleanDest = lastUserMessage.replace(/[^\w\s-]/gi, '').trim();
           if (cleanDest.length > 2 && cleanDest.length < 30) {
              mergedExt.destination = cleanDest.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
           }
       }
    }
    
    // STATE 2: DAYS
    else if (!mergedExt.days) {
       const dayMatch = lastUserMessage.match(/(\d+)\s*(day|dys|days)?/);
       if (dayMatch) mergedExt.days = parseInt(dayMatch[1], 10);
    }

    // STATE 3: TRANSPORT
    else if (!mergedExt.transport) {
       const foundTransport = validTransports.find(t => lastUserMessage.includes(t));
       if (foundTransport) {
           mergedExt.transport = foundTransport === 'flight' ? 'Plane' : foundTransport === 'drive' ? 'Car' : foundTransport.charAt(0).toUpperCase() + foundTransport.slice(1);
       }
    }

    // STATE 4: ORIGIN
    else if (!mergedExt.origin) {
       if (lastUserMessage.length > 2) {
           const cleanOrigin = lastUserMessage.replace(/from\s+/g, '').replace(/[^\w\s-]/gi, '').trim();
           if (cleanOrigin.length > 2 && cleanOrigin.length < 30) {
              mergedExt.origin = cleanOrigin.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
           }
       }
    }

    // STATE 5: COMPANION
    else if (!mergedExt.companion) {
       const foundComp = validCompanions.find(c => lastUserMessage.includes(c));
       if (foundComp) mergedExt.companion = foundComp.charAt(0).toUpperCase() + foundComp.slice(1);
    }

    // STATE 6: BUDGET
    else if (!mergedExt.budget) {
       const budgetMatch = lastUserMessage.replace(/,/g, '').match(/(?:budget|rs|inr|₹)\s*(\d+)/) || lastUserMessage.replace(/,/g, '').match(/(\d+)\s*(?:budget|rs|inr|₹|k)?/);
       let potentialBudget = budgetMatch ? parseInt(budgetMatch[1], 10) : null;
       // Handle 'k' notation (e.g. 50k)
       if (budgetMatch && lastUserMessage.includes(budgetMatch[1] + 'k')) {
           potentialBudget = potentialBudget * 1000;
       }
       if (potentialBudget && potentialBudget > 100) {
           mergedExt.budget = potentialBudget;
       }
    }

    // Determine target question based on current state
    let targetQuestion = "";
    let exactFallback = "";
    if (!mergedExt.destination) {
      if (messages.length > 2) {
         targetQuestion = `TASK: Politely tell the user that you didn't catch a valid place name, and ask them to type a valid Indian city or state name. [STRICT: DO NOT ask anything else].`;
         exactFallback = "Please type a valid Indian city or state name.";
      } else {
         targetQuestion = `TASK: Greet the user warmly and ask exactly "Where in India would you like to go?". [STRICT: Do NOT ask anything else].`;
         exactFallback = "Where in India would you like to go?";
      }
    } else if (!mergedExt.days) {
      targetQuestion = `TASK: Compliment their choice of ${mergedExt.destination} and ask EXACTLY "How many days are you planning your trip?" [STRICT: DO NOT ask about transport or budget. ONLY ask about number of days].`;
      exactFallback = `Awesome choice! How many days are you planning your trip to ${mergedExt.destination}?`;
    } else if (!mergedExt.transport) {
      targetQuestion = `TASK: Ask "How are you planning to travel?" and present these options: Train, Plane, Bus, or Car. [STRICT: DO NOT ask about origins or budget yet. ONLY ask about transport mode].`;
      exactFallback = "Got it! How are you planning to travel? (Train, Plane, Bus, or Car)";
    } else if (!mergedExt.origin) {
      targetQuestion = `TASK: Ask EXACTLY "What is your starting point? (Where will you be traveling from?)" [STRICT: DO NOT ask anything else].`;
      exactFallback = "What is your starting point? (Where will you be traveling from?)";
    } else if (!mergedExt.companion) {
      targetQuestion = `TASK: Ask "Who are you traveling with?" and present these options: Solo, Couple, Family, Friends, or Relatives. [STRICT: DO NOT ask about budget yet].`;
      exactFallback = "Who are you traveling with? (Solo, Couple, Family, Friends, or Relatives)";
    } else if (!mergedExt.budget) {
      targetQuestion = `TASK: Ask what their total budget for the trip is in INR. [STRICT: DO NOT ask anything else].`;
      exactFallback = "Finally, what is your total budget for the trip in rupees (INR)?";
    } else {
      // All states complete
      mergedExt.isComplete = true;
      const minRequired = (mergedExt.days || 3) * 1500;
      if (mergedExt.budget >= minRequired) {
        mergedExt.budgetSufficient = true;
        targetQuestion = `TASK: Say "Yes, your trip is possible! ✅" and confirm you are generating a detailed plan for ${mergedExt.days} days in ${mergedExt.destination} traveling from ${mergedExt.origin} via ${mergedExt.transport}. Be enthusiastic! [STRICT: Do NOT ask any more questions].`;
      } else {
        mergedExt.budgetSufficient = false;
        targetQuestion = `TASK: Say "Sorry, this budget might be tight 😔" because ₹${mergedExt.budget.toLocaleString('en-IN')} is a bit low for a ${mergedExt.days}-day trip to ${mergedExt.destination} via ${mergedExt.transport}. Suggest a minimum budget of ₹${minRequired.toLocaleString('en-IN')}. [STRICT: Do NOT ask any more questions].`;
      }
    }

    if (!mergedExt.isComplete) {
       mergedExt.budgetSufficient = null;
    }

    // Make it instantaneous & beautiful: Fast native path for mandatory questions!
    if (!extracted.isComplete) {
      let replyText = exactFallback;
      if (mergedExt.isComplete) {
         if (mergedExt.budgetSufficient) {
             replyText = `Yes, your trip is possible! ✅ ₹${mergedExt.budget.toLocaleString('en-IN')} is a great budget for ${mergedExt.days} days in ${mergedExt.destination}. Generating your detailed plan now...`;
         } else {
             const minRequired = (mergedExt.days || 3) * 1500;
             replyText = `Sorry, this budget might be tight 😔. ₹${mergedExt.budget.toLocaleString('en-IN')} is a bit low for a ${mergedExt.days}-day trip to ${mergedExt.destination}. Please enter a minimum budget of ₹${minRequired.toLocaleString('en-IN')}.`;
             mergedExt.isComplete = false;
             mergedExt.budget = null;
         }
      }
      return res.json({ success: true, reply: replyText, extracted: mergedExt });
    }

    // --- FREESTYLE CHAT (Using Ollama) ---
    // User already completed the form, now they can freely ask about their trip!
    const systemMessage = {
      role: 'system',
      content: `You are travAI, a friendly Indian travel assistant. 
The user's trip is already planned fully. They might ask questions about flights, hotels, or recommendations for ${mergedExt.destination}.
Respond casually, strictly keeping answers short, engaging, and directly helpful. Do not output JSON anymore, just return conversational text.`
    };

    const recentMessages = messages.slice(-5);
    const ollamaMessages = [systemMessage, ...recentMessages.map(m => ({
      role: m.role,
      content: m.content
    }))];

    const ollamaPayload = {
      model: 'llama3.2:1b',
      messages: ollamaMessages,
      stream: false
    };

    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ollamaPayload)
    });

    if (!response.ok) {
      throw new Error(`Ollama Error: ${response.statusText}`);
    }

    const data = await response.json();
    let replyText = data.message.content.trim();

    res.json({ success: true, reply: replyText, extracted: mergedExt });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ═══════════ DESTINATION INFO (TOP PLACES BEYOND BUDGET) ═══════════
router.post('/destination-info', async (req, res) => {
  try {
    const { destination, budget } = req.body;
    if (!destination) {
      return res.status(400).json({ success: false, message: "Missing destination" });
    }

    const prompt = `Return a bare-bones PURE JSON array of the top 3 best places to visit in exactly "${destination}", India. 
Do NOT return Solang Valley unless the destination is Manali. Return places ONLY found in "${destination}".
These places should realistically fit an overall estimated trip budget of ₹${budget || '15000'}.
Include a short description, realistic budget/entry fee in INR, a rating out of 5, a descriptive one-word keyword for an image search, and a 'mapLink' representing a Google Maps search URL.
The output MUST be exactly JSON. NO markdown.
Format EXACTLY like this example but replace values with real places for ${destination}:
[
  {"name": "Famous Landmark in ${destination}", "description": "A beautiful spot...", "budget": "₹500", "rating": 4.8, "keyword": "landmark", "mapLink": "https://www.google.com/maps/search/?api=1&query=Famous+Landmark+${destination}"},
  {"name": "Popular Beach in ${destination}", "description": "Stunning views.", "budget": "Free", "rating": 4.9, "keyword": "scenic", "mapLink": "https://www.google.com/maps/search/?api=1&query=Popular+Beach+${destination}"}
]`;

    const ollamaPayload = {
      model: 'llama3.2:1b',
      messages: [{ role: 'user', content: prompt }],
      stream: false
    };

    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ollamaPayload)
    });

    if (!response.ok) throw new Error(`Ollama Error: ${response.statusText}`);

    const data = await response.json();
    let places = JSON.parse(data.message.content);
    
    // Fallback if LLM misses rating or formats weirdly
    places = places.map((p, i) => ({
      name: p.name || `Place ${i+1}`,
      description: p.description || 'A beautiful place to visit.',
      budget: p.budget || 'Free',
      rating: p.rating || 4.5,
      mapLink: p.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ' ' + destination)}`,
      image: `https://picsum.photos/seed/${encodeURIComponent(destination + (p.name || i))}/400/300`
    }));

    res.json({ success: true, topPlaces: places });
  } catch (err) {
    console.error("Destination Info Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════ PARTIAL DAY-WISE PLAN ═══════════
router.post('/partial-plan', async (req, res) => {
  try {
    const { destination, days } = req.body;
    
    if (!destination || !days) {
      return res.status(400).json({ success: false, message: "Missing destination or days" });
    }

    const partialPrompt = `Return a bare-bones JSON array for a day-wise travel plan to ${destination} for ${days} days.
The output MUST be PURE JSON format. NO markdown, NO conversational text.
Format EXACTLY like this example:
[
  {"day": 1, "title": "Arrive in Location", "activity": "Settle in and explore locally"},
  {"day": 2, "title": "Sightseeing", "activity": "Visit major landmarks"}
]`;

    const ollamaPayload = {
      model: 'llama3.2:1b',
      messages: [{ role: 'user', content: partialPrompt }],
      stream: false
    };

    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ollamaPayload)
    });

    if (!response.ok) throw new Error(`Ollama Error: ${response.statusText}`);

    const data = await response.json();
    const partialPlan = JSON.parse(data.message.content);

    res.json({ success: true, plan: partialPlan });
  } catch (err) {
    console.error("Partial Plan Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════ EXTRACT TRIP DETAILS FROM CONVERSATION & GENERATE ITINERARY ═══════════
router.post('/extract-and-generate', async (req, res) => {
  try {
    const { messages, extractedData } = req.body;

    let tripDetails;

    // FAST PATH: If frontend already extracted the data via step-by-step chat, use it directly
    if (extractedData && extractedData.destination && extractedData.days && extractedData.budget) {
      tripDetails = {
        destination: extractedData.destination,
        days: extractedData.days,
        budget: extractedData.budget,
        style: extractedData.style || 'Culture',
        companion: extractedData.companion || 'Solo'
      };
      console.log('⚡ Using pre-extracted data (skipping extraction LLM call):', tripDetails);
    } else {
      // SLOW PATH: Fall back to LLM extraction if data not available
      const extractPrompt = {
        model: 'llama3.2:1b',
        messages: [
          {
            role: 'system',
            content: `Analyze the conversation and extract travel planning details. Return ONLY a JSON object with these fields:
{
  "destination": "the destination mentioned (default: 'India')",
  "days": number of days mentioned (default: 3),
  "budget": total budget in INR as a number (default: 15000),
  "style": "one of: Adventure, Relax, Culture, Food, Romantic, Spiritual (default: Culture)",
  "companion": "one of: Solo, Couple, Family, Friends (default: Solo)"
}
Return ONLY the JSON, no other text.`
          },
          {
            role: 'user',
            content: `Here is the conversation:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nExtract the trip details as JSON:`
          }
        ],
        stream: false
      };

      const extractResponse = await fetch('http://127.0.0.1:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extractPrompt)
      });

      if (!extractResponse.ok) {
        throw new Error(`Ollama Extract Error: ${extractResponse.statusText}`);
      }

      const extractData = await extractResponse.json();
      try {
        tripDetails = JSON.parse(extractData.message.content);
      } catch (e) {
        tripDetails = { destination: 'India', days: 3, budget: 15000, style: 'Culture', companion: 'Solo' };
      }
    }

    const { destination, days, budget, style, companion } = tripDetails;

    // ⚡ FAST TEMPLATE-BASED ITINERARY GENERATOR (no LLM needed!)
    const itinerary = generateInstantItinerary(destination, days, budget, style, companion);

    res.json({ success: true, tripDetails, itinerary });
  } catch (err) {
    console.error("Extract & Generate Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ═══════════ INSTANT ITINERARY GENERATOR ═══════════
function generateInstantItinerary(destination, days, budget, style, companion) {
  const dest = destination.toLowerCase();

  // Real destination-specific activities database
  const DEST_DATA = {
    goa: {
      activities: [
        { morning: 'Visit Baga Beach & water sports', localExp: 'Explore Old Goa churches (Se Cathedral, Basilica of Bom Jesus)', evening: 'Sunset at Chapora Fort viewpoint', food: 'Seafood thali at Britto\'s, Baga' },
        { morning: 'Dudhsagar Waterfalls trek', localExp: 'Spice plantation tour in Ponda', evening: 'Cruise on Mandovi River', food: 'Fish curry rice at Ritz Classic, Panjim' },
        { morning: 'Palolem Beach & kayaking', localExp: 'Visit Cabo de Rama Fort', evening: 'Night market at Arpora', food: 'Goan prawn curry at Martin\'s Corner, Betalbatim' },
        { morning: 'Anjuna Beach & flea market', localExp: 'Latin Quarter walk in Fontainhas', evening: 'Tito\'s Lane nightlife, Baga', food: 'Bebinca dessert at Mum\'s Kitchen' },
        { morning: 'Butterfly Beach boat trip', localExp: 'Divar Island cycling tour', evening: 'Casino Deltin Royale', food: 'Xacuti chicken at Vinayak Family Restaurant' },
      ],
      titles: ['Beach Vibes & Heritage', 'Waterfalls & Spices', 'South Goa Explorer', 'Markets & Nightlife', 'Hidden Gems'],
      flights: [{ airline: 'IndiGo', time: '06:00 - 08:30', price: '₹3,500', stops: 'Non-stop', logo: '6E' }, { airline: 'SpiceJet', time: '10:15 - 12:45', price: '₹3,200', stops: 'Non-stop', logo: 'SG' }, { airline: 'Air India', time: '14:30 - 17:00', price: '₹4,800', stops: 'Non-stop', logo: 'AI' }],
      hotels: [{ name: 'OYO Goa Beach Resort', rating: 3.8, price: '₹1,200/night', img: '🏨', tag: 'Budget' }, { name: 'Treebo Jesant Valley', rating: 4.2, price: '₹2,500/night', img: '🏖️', tag: 'Best Value' }, { name: 'Taj Fort Aguada', rating: 4.8, price: '₹8,000/night', img: '🌴', tag: 'Luxury' }],
      foods: [{ name: 'Fish Curry Rice', price: '₹250', reason: 'Goa\'s signature dish, a must-try!', veg: false }, { name: 'Bebinca', price: '₹150', reason: 'Traditional Goan layered dessert', veg: true }, { name: 'Prawn Balchão', price: '₹350', reason: 'Spicy pickled prawns, iconic Goan flavor', veg: false }, { name: 'Sannas', price: '₹80', reason: 'Steamed rice cakes with coconut toddy', veg: true }],
      tips: ['Rent a scooty (₹300-400/day) for easy exploration', 'Visit North Goa for parties, South Goa for peace', 'Bargain at flea markets — start at 50% of asking price', 'Carry sunscreen and stay hydrated', 'Pre-book Dudhsagar permits in monsoon season'],
      packing: ['Swimwear', 'Sunscreen SPF 50+', 'Light cotton clothes', 'Flip-flops', 'Waterproof phone pouch', 'Hat/Cap'],
    },
    manali: {
      activities: [
        { morning: 'Visit Hadimba Devi Temple', localExp: 'Walk through Old Manali cafes', evening: 'Mall Road shopping & stroll', food: 'Sidu & Trout fish at Johnson\'s Cafe' },
        { morning: 'Solang Valley adventure sports', localExp: 'Paragliding at Solang', evening: 'Hot springs at Vashisht', food: 'Momos at Lazy Dog Lounge' },
        { morning: 'Rohtang Pass excursion', localExp: 'Snow activities at Rohtang', evening: 'Bonfire at campsite', food: 'Thukpa at Chopsticks, Mall Road' },
        { morning: 'Jogini Waterfall trek', localExp: 'Visit Manu Temple', evening: 'Riverside camping at Beas', food: 'Rajma Chawal at Drifters\' Cafe' },
        { morning: 'Great Himalayan National Park', localExp: 'Tirthan Valley day trip', evening: 'Stargazing at Hampta', food: 'Apple pie at Renaissance Cafe' },
      ],
      titles: ['Temple & Heritage Walk', 'Adventure Valley', 'Rohtang Snow Day', 'Trek & Waterfalls', 'Himalayan Explorer'],
      flights: [{ airline: 'IndiGo', time: '07:00 - 08:30 (to Kullu)', price: '₹4,500', stops: 'Non-stop', logo: '6E' }, { airline: 'SpiceJet', time: '09:00 - 10:30', price: '₹4,200', stops: 'Non-stop', logo: 'SG' }, { airline: 'Air India', time: '13:00 - 14:30', price: '₹5,500', stops: 'Non-stop', logo: 'AI' }],
      hotels: [{ name: 'Hotel Ibex', rating: 3.9, price: '₹1,500/night', img: '🏔️', tag: 'Budget' }, { name: 'Snow Valley Resorts', rating: 4.3, price: '₹3,000/night', img: '❄️', tag: 'Best Value' }, { name: 'The Himalayan', rating: 4.7, price: '₹7,500/night', img: '🏨', tag: 'Luxury' }],
      foods: [{ name: 'Sidu', price: '₹100', reason: 'Traditional Kullu bread with poppy seeds', veg: true }, { name: 'Trout Fish', price: '₹400', reason: 'Fresh river trout, Manali specialty', veg: false }, { name: 'Tibetan Momos', price: '₹120', reason: 'Steamed dumplings from Old Manali', veg: true }, { name: 'Thukpa', price: '₹150', reason: 'Warm Tibetan noodle soup', veg: true }],
      tips: ['Book Rohtang Pass permits online in advance', 'Carry warm layers even in summer', 'Use local HRTC buses for budget travel', 'ATMs are scarce beyond Manali, carry cash', 'Best time: March-June & October-December'],
      packing: ['Warm jacket', 'Thermal innerwear', 'Trekking shoes', 'Sunglasses', 'Moisturizer', 'Power bank'],
    },
    kerala: {
      activities: [
        { morning: 'Houseboat cruise in Alleppey backwaters', localExp: 'Visit coir-making village', evening: 'Sunset from houseboat deck', food: 'Kerala Sadhya (banana leaf meal)' },
        { morning: 'Munnar tea plantation tour', localExp: 'Visit Tea Museum & Eravikulam National Park', evening: 'Sunset at Top Station viewpoint', food: 'Appam with stew at Rapsy Restaurant' },
        { morning: 'Fort Kochi heritage walk', localExp: 'Chinese fishing nets & St. Francis Church', evening: 'Kathakali dance performance', food: 'Kerala fish curry at Fort House Restaurant' },
        { morning: 'Periyar Wildlife Sanctuary', localExp: 'Bamboo rafting in Periyar Lake', evening: 'Spice market in Kumily', food: 'Puttu & Kadala Curry' },
        { morning: 'Varkala cliff beach & surfing', localExp: 'Ayurvedic spa treatment', evening: 'Cliff-top restaurant dining', food: 'Karimeen Pollichathu (pearl spot fish)' },
      ],
      titles: ['Backwater Bliss', 'Tea Gardens of Munnar', 'Fort Kochi Heritage', 'Wildlife & Spices', 'Beach & Ayurveda'],
      flights: [{ airline: 'IndiGo', time: '06:30 - 09:00 (to Kochi)', price: '₹3,800', stops: 'Non-stop', logo: '6E' }, { airline: 'Air India', time: '11:00 - 13:30', price: '₹5,200', stops: 'Non-stop', logo: 'AI' }, { airline: 'Vistara', time: '15:00 - 17:30', price: '₹4,500', stops: 'Non-stop', logo: 'UK' }],
      hotels: [{ name: 'Zostel Alleppey', rating: 4.0, price: '₹800/night', img: '🛖', tag: 'Budget' }, { name: 'Fragrant Nature Munnar', rating: 4.4, price: '₹3,500/night', img: '🌿', tag: 'Best Value' }, { name: 'Kumarakom Lake Resort', rating: 4.9, price: '₹12,000/night', img: '🏨', tag: 'Luxury' }],
      foods: [{ name: 'Kerala Sadhya', price: '₹200', reason: 'Grand vegetarian feast on banana leaf', veg: true }, { name: 'Karimeen Pollichathu', price: '₹450', reason: 'Pearl spot fish in banana leaf', veg: false }, { name: 'Appam with Stew', price: '₹120', reason: 'Lacy rice pancake with coconut curry', veg: true }, { name: 'Malabar Biryani', price: '₹250', reason: 'Fragrant rice dish with unique Kerala spices', veg: false }],
      tips: ['September-March is the best season to visit', 'Book houseboats directly for better prices', 'Carry mosquito repellent for backwaters', 'Try an Ayurvedic massage — it\'s authentic here', 'Use KSRTC buses for affordable inter-city travel'],
      packing: ['Light cotton clothes', 'Rain jacket', 'Mosquito repellent', 'Comfortable walking shoes', 'Sunscreen', 'Umbrella'],
    },
    default: {
      activities: [
        { morning: 'Visit the main historical monument', localExp: 'Explore the local bazaar & street food', evening: 'Sunset viewpoint tour', food: 'Local specialty thali at top-rated restaurant' },
        { morning: 'Heritage walking tour', localExp: 'Visit local museum or art gallery', evening: 'Cultural performance / folk show', food: 'Street food trail — chaat, samosa, lassi' },
        { morning: 'Nature excursion — park or lake', localExp: 'Handicraft shopping & workshop', evening: 'Riverside or rooftop dining', food: 'Regional biryani or curry at famous eatery' },
        { morning: 'Temple or monument visit', localExp: 'Cooking class or farm visit', evening: 'Night market or light show', food: 'Traditional sweets & chai experience' },
        { morning: 'Day trip to nearby attraction', localExp: 'Photography walk in old town', evening: 'Farewell dinner at panoramic restaurant', food: 'Grand regional meal at heritage hotel' },
      ],
      titles: ['Arrival & Exploration', 'Heritage & Culture', 'Nature & Local Life', 'Spirituality & Craft', 'Hidden Gems & Farewell'],
      flights: [{ airline: 'IndiGo', time: '08:00 - 10:00', price: '₹4,000', stops: 'Non-stop', logo: '6E' }, { airline: 'SpiceJet', time: '11:30 - 13:30', price: '₹3,500', stops: 'Non-stop', logo: 'SG' }, { airline: 'Air India', time: '16:00 - 18:00', price: '₹5,000', stops: '1 Stop', logo: 'AI' }],
      hotels: [{ name: 'OYO Rooms', rating: 3.5, price: '₹1,000/night', img: '🏨', tag: 'Budget' }, { name: 'Treebo Hotels', rating: 4.1, price: '₹2,200/night', img: '🏨', tag: 'Best Value' }, { name: 'Taj / ITC Hotel', rating: 4.7, price: '₹6,500/night', img: '🏨', tag: 'Luxury' }],
      foods: [{ name: 'Local Thali', price: '₹200', reason: 'Complete regional meal, authentic flavors', veg: true }, { name: 'Street Chaat', price: '₹80', reason: 'Iconic Indian street food experience', veg: true }, { name: 'Biryani', price: '₹250', reason: 'Fragrant rice dish, a must-try anywhere in India', veg: false }, { name: 'Lassi / Chai', price: '₹50', reason: 'Refreshing traditional beverages', veg: true }],
      tips: ['Always carry a reusable water bottle', 'Use Google Maps offline for navigation', 'Bargain politely at local markets', 'Respect local customs and dress codes at temples', 'Keep emergency contacts and hotel address handy'],
      packing: ['Comfortable walking shoes', 'Day backpack', 'Power bank', 'Reusable water bottle', 'First-aid kit', 'Light jacket'],
    },
  };

  // Add more destination data aliases
  DEST_DATA['delhi'] = { ...DEST_DATA.default, 
    activities: [
      { morning: 'Visit Red Fort & Chandni Chowk', localExp: 'Street food walk in Paranthe Wali Gali', evening: 'Light show at Akshardham Temple', food: 'Butter chicken at Moti Mahal, Daryaganj' },
      { morning: 'Qutub Minar & Mehrauli', localExp: 'Hauz Khas Village art galleries', evening: 'Connaught Place shopping', food: 'Chole Bhature at Sita Ram Diwan Chand' },
      { morning: 'India Gate & Rashtrapati Bhavan', localExp: 'National Museum tour', evening: 'Dilli Haat handicraft market', food: 'Kebabs at Karim\'s, Jama Masjid' },
      { morning: 'Humayun\'s Tomb & Lodhi Gardens', localExp: 'Khan Market shopping', evening: 'Cyber Hub Gurugram nightlife', food: 'Rajma Chawal at Rajinder da Dhaba' },
      { morning: 'Jama Masjid & Old Delhi walk', localExp: 'Spice market Khari Baoli', evening: 'Kingdom of Dreams show', food: 'Nihari at Al Jawahar' },
    ],
    titles: ['Old Delhi Heritage', 'South Delhi Culture', 'New Delhi Landmarks', 'Mughal History', 'Street Food Capital'],
    tips: ['Metro is the fastest way to travel in Delhi', 'Avoid autos without meters — use Uber/Ola', 'Carry a scarf for temple visits', 'Best season: October-March', 'Try the Delhi Metro Yellow Line for major attractions'],
  };

  DEST_DATA['jaipur'] = { ...DEST_DATA.default,
    activities: [
      { morning: 'Amber Fort & elephant ride', localExp: 'Block printing workshop in Sanganer', evening: 'Light show at Amber Fort', food: 'Dal Baati Churma at Chokhi Dhani' },
      { morning: 'City Palace & Jantar Mantar', localExp: 'Johari Bazaar jewelry shopping', evening: 'Nahargarh Fort sunset', food: 'Laal Maas at Handi Restaurant' },
      { morning: 'Hawa Mahal & Albert Hall Museum', localExp: 'Blue pottery workshop', evening: 'Bapu Bazaar textile shopping', food: 'Pyaaz Kachori at Rawat Mishthan Bhandar' },
      { morning: 'Jal Mahal & Sisodia Rani Garden', localExp: 'Elephant Village visit', evening: 'Chokhi Dhani cultural village dinner', food: 'Ghewar sweet at LMB' },
      { morning: 'Jaigarh Fort & cannon tour', localExp: 'Miniature painting class', evening: 'Raja Park market', food: 'Gatte ki Sabzi at Spice Court' },
    ],
    titles: ['Golden Fort Trail', 'Royal City Explorer', 'Pink City Heritage', 'Art & Craft Day', 'Hidden Forts & Flavors'],
    tips: ['Buy a composite ticket for all major monuments', 'Best time: October-March (avoid summer heat)', 'Hire a local guide at Amber Fort — worth it', 'Try tie-dye (Bandhani) shopping at Johari Bazaar', 'Jaipur→Pushkar is an easy day trip'],
  };

  DEST_DATA['varanasi'] = { ...DEST_DATA.default,
    activities: [
      { morning: 'Sunrise boat ride on Ganges', localExp: 'Walk through ghats — Dashashwamedh to Manikarnika', evening: 'Ganga Aarti at Dashashwamedh Ghat', food: 'Kachori Sabzi at Kashi Chat Bhandar' },
      { morning: 'Sarnath Buddhist ruins tour', localExp: 'Silk weaving workshop in Varanasi', evening: 'Subah-e-Banaras cultural show', food: 'Banarasi Paan & Thandai at Blue Lassi' },
      { morning: 'Ramnagar Fort across Ganges', localExp: 'BHU campus & Vishwanath Temple', evening: 'Classical music at Sankat Mochan Temple', food: 'Tamatar Chaat at Deena Chat Bhandar' },
    ],
    titles: ['Spiritual Ganges', 'Buddhist Heritage', 'Royal Varanasi'],
    tips: ['Wear modest clothing near ghats and temples', 'Morning boat ride is more peaceful than evening', 'Don\'t photograph cremation ghats out of respect', 'Best time: November-February', 'Walk the ghats — it\'s the best way to experience Varanasi'],
  };

  DEST_DATA['ladakh'] = DEST_DATA.default;
  DEST_DATA['rajasthan'] = DEST_DATA.jaipur;
  DEST_DATA['udaipur'] = DEST_DATA.default;
  DEST_DATA['rishikesh'] = DEST_DATA.default;
  DEST_DATA['shimla'] = DEST_DATA.manali;
  DEST_DATA['mumbai'] = DEST_DATA.default;
  DEST_DATA['agra'] = DEST_DATA.default;
  DEST_DATA['bangalore'] = DEST_DATA.default;

  const data = DEST_DATA[dest] || DEST_DATA.default;
  const dailyBudget = Math.round(budget / days);
  const icons = ['🌅', '🎭', '🌆', '🍽️'];

  const plan = [];
  for (let d = 1; d <= days; d++) {
    const idx = (d - 1) % data.activities.length;
    const act = data.activities[idx];
    const mCost = Math.round(dailyBudget * 0.25);
    const lCost = Math.round(dailyBudget * 0.20);
    const eCost = Math.round(dailyBudget * 0.25);
    const fCost = Math.round(dailyBudget * 0.30);
    plan.push({
      day: d,
      title: data.titles[idx] || `Day ${d} in ${destination}`,
      morning: { activity: act.morning, cost: `₹${mCost}`, icon: '🌅' },
      localExp: { activity: act.localExp, cost: `₹${lCost}`, icon: '🎭' },
      evening: { activity: act.evening, cost: `₹${eCost}`, icon: '🌆' },
      food: { activity: act.food, cost: `₹${fCost}`, icon: '🍽️' },
      dayCost: `₹${dailyBudget}`,
    });
  }

  return {
    destination,
    days,
    budget,
    style,
    companion,
    plan,
    flights: data.flights,
    hotels: data.hotels,
    foods: data.foods,
    tips: data.tips,
    packing: data.packing,
    budgetBreakdown: [
      { category: 'Accommodation', percent: 35, amount: `₹${Math.round(budget * 0.35)}`, color: 'bg-purple-500' },
      { category: 'Food & Dining', percent: 25, amount: `₹${Math.round(budget * 0.25)}`, color: 'bg-neon-cyan' },
      { category: 'Transport', percent: 22, amount: `₹${Math.round(budget * 0.22)}`, color: 'bg-blue-500' },
      { category: 'Activities', percent: 13, amount: `₹${Math.round(budget * 0.13)}`, color: 'bg-green-500' },
      { category: 'Miscellaneous', percent: 5, amount: `₹${Math.round(budget * 0.05)}`, color: 'bg-yellow-500' },
    ],
  };
}

module.exports = router;
