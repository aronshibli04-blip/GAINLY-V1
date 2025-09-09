import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface UserData {
  totalDays: number;
  weightEntries: Array<{ weight: number; date: string }>;
  calorieEntries: Array<{ calories: number; date: string }>;
  currentTdee?: number;
  targetCalories?: number;
}

export class AICoachService {
  static async getPersonalizedResponse(
    userMessage: string,
    userData: UserData
  ): Promise<string> {
    const { totalDays, weightEntries, calorieEntries, currentTdee = 2000 } = userData;
    
    // Calculate user context
    const recentWeightTrend = weightEntries.length >= 7 ? 
      (weightEntries.slice(-1)[0]?.weight || 0) - (weightEntries.slice(-7)[0]?.weight || 0) : 0;
    
    const avgDailyCalories = calorieEntries.length > 0 ?
      calorieEntries.reduce((sum, entry) => sum + entry.calories, 0) / calorieEntries.length : 0;

    const targetCalories = currentTdee + 1100; // Aggressive surplus for hardgainers
    
    const systemPrompt = `Du er en spesialisert AI-coach for hardgainers (folk som sliter med å gå opp i vekt). Du har tilgang til brukerens tracking-data og skal gi personlig, praktisk råd på norsk.

Brukerkontext:
- Dager med tracking: ${totalDays}
- Nåværende TDEE: ${currentTdee} kalorier
- Målkalorier: ${targetCalories} kalorier (aggressivt +1100 overskudd for hardgainers)
- Gjennomsnittlig daglige kalorier: ${Math.round(avgDailyCalories)}
- Siste vekttrend: ${recentWeightTrend > 0 ? `+${recentWeightTrend.toFixed(1)}kg` : `${recentWeightTrend.toFixed(1)}kg`} (siste 7 dager)

KRITISKE HARDGAINER-RETNINGSLINJER:
1. Ved appetittproblemer: Fokuser på SMÅ, hyppige måltider (hver 2-3 timer)
2. Prioriter flytende kalorier: Proteinshake, melk, juice - lettere å få i seg enn fast mat
3. Kaloritette matvarer: Nøtter, olivenolje, avokado, peanøttsmør (mye kalorier i små mengder)
4. ALDRI foreslå store smoothier eller måltider når brukeren sier de har dårlig appetitt
5. Gi konkrete, små tiltak som faktisk kan gjennomføres
6. Bruk tracking-dataene deres til å gi spesifikk feedback

HARDGAINER-SPESIFIKKE LØSNINGER:
- Ved lav appetitt: "Start med 1 glass helmelk (150 kal) mellom måltidene"
- Ved for lite kalorier: "Tilsett 1 ss olivenolje i maten (+120 kal)"
- Ved langsom vektøkning: "Spis en håndfull nøtter hver dag (+200 kal)"

Hold svarene korte (1-2 setninger) og fokuser på ÉN praktisk endring om gangen. Bruk norsk og vær oppmuntrende uten å være overveldende.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 150,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || "Jeg er her for å hjelpe deg med vektøkning! Hva lurer du på?";
    } catch (error) {
      return "Jeg har litt problemer akkurat nå. Prøv igjen om et øyeblikk!";
    }
  }

  static async generateWeightGainTips(userData: UserData): Promise<string[]> {
    const { totalDays, weightEntries, calorieEntries, currentTdee = 2000 } = userData;
    const avgDailyCalories = calorieEntries.length > 0 ?
      calorieEntries.reduce((sum, entry) => sum + entry.calories, 0) / calorieEntries.length : 0;
    const targetCalories = currentTdee + 1100;

    const tips = [];

    // Calorie-based tips
    if (avgDailyCalories < targetCalories) {
      const deficit = targetCalories - avgDailyCalories;
      tips.push(`Add ${Math.round(deficit)} more calories daily. Try liquid calories like smoothies or whole milk.`);
    }

    // Progress-based tips
    if (weightEntries.length >= 7) {
      const recentTrend = (weightEntries.slice(-1)[0]?.weight || 0) - (weightEntries.slice(-7)[0]?.weight || 0);
      if (recentTrend < 0.2) {
        tips.push("Weight gain is slow. Focus on calorie-dense foods: nuts, oils, protein shakes.");
      }
    }

    // General hardgainer tips
    if (totalDays >= 7) {
      tips.push("Eat every 2-3 hours to maintain steady calorie intake throughout the day.");
      tips.push("Add healthy fats: olive oil, avocado, nuts - they pack 9 calories per gram.");
    }

    return tips;
  }
}