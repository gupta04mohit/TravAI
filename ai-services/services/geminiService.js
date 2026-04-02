/**
 * Gemini AI Service Wrapper
 * Replace mock responses with actual Google Gemini 2.0 Flash API calls
 * 
 * Setup:
 * npm install @google/generative-ai
 * Set GEMINI_API_KEY in .env
 */

// const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    // this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('GeminiService initialized (mock mode)');
  }

  async generateItinerary(params) {
    const { destination, days, budget, travelType, interests } = params;
    
    // In production, use:
    // const prompt = buildItineraryPrompt(params);
    // const result = await this.model.generateContent(prompt);
    // return JSON.parse(result.response.text());
    
    return {
      destination,
      totalDays: days,
      plan: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        title: `Day ${i + 1} — Explore ${destination}`,
        morning: { activity: 'Morning sightseeing', cost: '₹500' },
        afternoon: { activity: 'Local food experience', cost: '₹800' },
        evening: { activity: 'Sunset & leisure', cost: '₹300' },
      })),
    };
  }

  async detectSearchIntent(query) {
    // In production, use Gemini to parse natural language
    return {
      intent: 'place_search',
      extractedFilters: {},
      suggestions: [],
    };
  }

  async getFoodRecommendations(place, userPrefs) {
    // In production, use Gemini with food prompt template
    return [];
  }

  async generateAISummary(placeData, userPrefs) {
    // Personalized AI summary for Place Detail page
    return `This destination is perfect for ${userPrefs.travelType} travellers with a ${userPrefs.budget} budget.`;
  }
}

module.exports = new GeminiService();
