import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generatePersonalizedRewards(
  goalWeight: number,
  userPreferences: string,
  currentReward: string
): Promise<string[]> {
  try {
    const prompt = `Du er en motivasjonsekspert som hjelper hardgainere med å nå vektmål. 

Brukeren har et mål om å nå ${goalWeight}kg og har disse interessene/ønskene:
"${userPreferences}"

Nåværende belønning: "${currentReward}"

Lag 4 personlige og motiverende belønninger på norsk basert på brukerens interesser. 
Belønningene skal:
- Være realistiske og oppnåelige
- Matche brukerens interesser og ønsker
- Være passende for denne vektmilepælen
- Være motiverende og personlige
- Være kortfattede (maks 8 ord)

Returner som JSON array med kun belønningene:
{"rewards": ["belønning 1", "belønning 2", "belønning 3", "belønning 4"]}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "Du er en motivasjonsekspert som lager personlige belønninger for folk som vil gå opp i vekt. Du svarer alltid på norsk og i JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
      temperature: 0.8
    });

    const result = JSON.parse(response.choices[0].message.content || '{"rewards": []}');
    return result.rewards || [];
    
  } catch (error) {
    // Error generating personalized rewards, falling back to default options
    
    // Fallback rewards based on common interests
    const fallbackRewards = [
      "Noe du har ønsket deg lenge",
      "Spesiell opplevelse med venner", 
      "Wellness-dag eller massage",
      "Ny klær som passer din kropp",
      "Teknologi-gadget du har sett på",
      "Helgetur til et sted du liker"
    ];
    
    return fallbackRewards.slice(0, 4);
  }
}