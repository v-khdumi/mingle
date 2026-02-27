import { UserProfile, MatchProfile, CompatibilityResult, HoroscopeReading, SynastryReading } from './types';
import { getZodiacSign } from './sampleData';

export async function calculateCompatibility(
  userProfile: UserProfile,
  matches: MatchProfile[]
): Promise<CompatibilityResult[]> {
  const prompt = spark.llmPrompt`You are an expert dating compatibility analyst. Analyze the user's profile against potential matches and calculate compatibility scores.

User Profile:
${JSON.stringify(userProfile, null, 2)}

Potential Matches:
${JSON.stringify(matches, null, 2)}

For each match, calculate a compatibility score from 0 to 1 based on:
- Shared values and interests (weighted high)
- Compatible work schedules and industries
- Language compatibility
- Lifestyle alignment
- Educational background compatibility
${userProfile.optInAstrology && userProfile.birthDate ? `- Astrological compatibility (user is ${getZodiacSign(userProfile.birthDate)})` : ''}
${userProfile.optInSalary && userProfile.salaryRange ? '- Salary range alignment (if both provided)' : ''}
- Overall personality and communication style fit

Provide a detailed explanation for each match score, highlighting 2-4 key compatibility factors.

Return ONLY valid JSON in this exact format (no other text):
{
  "results": [
    {
      "matchId": "string",
      "score": number (0-1),
      "explanation": "string - 2-3 sentences explaining why this score",
      "keyFactors": ["factor 1", "factor 2", "factor 3"]
    }
  ]
}`;

  const response = await spark.llm(prompt, 'gpt-4o', true);
  const parsed = JSON.parse(response);
  return parsed.results;
}

export async function generateDailyHoroscope(birthDate: string): Promise<HoroscopeReading> {
  const sign = getZodiacSign(birthDate);
  const today = new Date().toISOString().split('T')[0];
  
  const prompt = spark.llmPrompt`Generate a personalized daily horoscope for someone born on ${birthDate} (${sign}).

Make it:
- Specific and actionable (not generic)
- Positive and encouraging
- Related to love, career, or personal growth
- 3-4 sentences long

Return ONLY valid JSON in this exact format:
{
  "reading": "string - the horoscope text"
}`;

  const response = await spark.llm(prompt, 'gpt-4o-mini', true);
  const parsed = JSON.parse(response);
  
  return {
    date: today,
    sign,
    reading: parsed.reading,
  };
}

export async function generateSynastry(
  userBirthDate: string,
  matchBirthDate: string
): Promise<SynastryReading> {
  const userSign = getZodiacSign(userBirthDate);
  const matchSign = getZodiacSign(matchBirthDate);
  
  const prompt = spark.llmPrompt`Analyze the astrological compatibility (synastry) between:
- Person 1: ${userSign} (born ${userBirthDate})
- Person 2: ${matchSign} (born ${matchBirthDate})

Provide:
1. Overall compatibility rating (Excellent/Good/Moderate/Challenging)
2. A 3-4 sentence explanation of their romantic compatibility based on sun signs

Return ONLY valid JSON in this exact format:
{
  "compatibility": "string - Excellent/Good/Moderate/Challenging",
  "explanation": "string - the explanation"
}`;

  const response = await spark.llm(prompt, 'gpt-4o-mini', true);
  const parsed = JSON.parse(response);
  
  return {
    userSign,
    matchSign,
    compatibility: parsed.compatibility,
    explanation: parsed.explanation,
  };
}

export async function generateIcebreaker(
  userProfile: UserProfile,
  matchProfile: MatchProfile
): Promise<string> {
  const prompt = spark.llmPrompt`Generate a personalized icebreaker message for starting a conversation.

Your profile: ${JSON.stringify({ name: userProfile.name, interests: userProfile.interests, values: userProfile.values })}
Their profile: ${JSON.stringify({ name: matchProfile.name, interests: matchProfile.interests, bio: matchProfile.bio })}

Create a friendly, natural opening message (1-2 sentences) that references a shared interest or asks about something from their profile. Make it warm and genuine, not cheesy.

Return ONLY valid JSON in this exact format:
{
  "message": "string - the icebreaker message"
}`;

  const response = await spark.llm(prompt, 'gpt-4o-mini', true);
  const parsed = JSON.parse(response);
  return parsed.message;
}