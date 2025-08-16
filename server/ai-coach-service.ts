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
    
    const systemPrompt = `You are a specialized AI coach for hardgainers (people who struggle to gain weight). You have access to the user's tracking data and should provide personalized, actionable advice.

User Context:
- Days tracking: ${totalDays}
- Current TDEE: ${currentTdee} calories
- Target calories: ${targetCalories} calories (aggressive +1100 surplus for hardgainers)
- Average daily calories: ${Math.round(avgDailyCalories)}
- Recent weight trend: ${recentWeightTrend > 0 ? `+${recentWeightTrend.toFixed(1)}kg` : `${recentWeightTrend.toFixed(1)}kg`} (last 7 days)

Guidelines:
1. Always be encouraging and motivational
2. Focus on practical, actionable advice
3. Emphasize liquid calories, calorie-dense foods, and frequent meals for hardgainers
4. Use Norwegian phrases where appropriate (e.g., "Bra jobbet!", "Fortsett sånn!")
5. Be specific with calorie numbers and meal suggestions
6. Reference their actual tracking data when giving advice
7. Keep responses concise but informative (2-3 sentences max)
8. Focus on hardgainer-specific challenges (fast metabolism, low appetite, etc.)

Respond in a friendly, knowledgeable tone as if you're a personal trainer who specializes in weight gain.`;

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
        max_tokens: 200,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || "I'm here to help with your weight gain journey. What specific questions do you have?";
    } catch (error) {
      console.error('AI Coach service error:', error);
      return "I'm having trouble processing your request right now. Please try asking again in a moment.";
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