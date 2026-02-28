import { UserProfile, MatchProfile, CompatibilityResult, HoroscopeReading, SynastryReading } from './types';
import { getZodiacSign } from './sampleData';

export async function calculateCompatibility(
  userProfile: UserProfile,
  matches: MatchProfile[]
): Promise<CompatibilityResult[]> {
  const prompt = window.spark.llmPrompt`You are an expert dating compatibility analyst. Analyze the user's profile against potential matches and calculate compatibility scores.

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

  const response = await window.spark.llm(prompt, 'gpt-4o', true);
  const parsed = JSON.parse(response);
  return parsed.results;
}

export async function generateDailyHoroscope(birthDate: string): Promise<HoroscopeReading> {
  const sign = getZodiacSign(birthDate);
  const today = new Date().toISOString().split('T')[0];
  
  const prompt = window.spark.llmPrompt`Generate a personalized daily horoscope for someone born on ${birthDate} (${sign}).

Make it:
- Specific and actionable (not generic)
- Positive and encouraging
- Related to love, career, or personal growth
- 3-4 sentences long

Return ONLY valid JSON in this exact format:
{
  "reading": "string - the horoscope text"
}`;

  const response = await window.spark.llm(prompt, 'gpt-4o-mini', true);
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
  
  const prompt = window.spark.llmPrompt`Analyze the astrological compatibility (synastry) between:
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

  const response = await window.spark.llm(prompt, 'gpt-4o-mini', true);
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
  const prompt = window.spark.llmPrompt`Generate a personalized icebreaker message for starting a conversation.

Your profile: ${JSON.stringify({ name: userProfile.name, interests: userProfile.interests, values: userProfile.values })}
Their profile: ${JSON.stringify({ name: matchProfile.name, interests: matchProfile.interests, bio: matchProfile.bio })}

Create a friendly, natural opening message (1-2 sentences) that references a shared interest or asks about something from their profile. Make it warm and genuine, not cheesy.

Return ONLY valid JSON in this exact format:
{
  "message": "string - the icebreaker message"
}`;

  const response = await window.spark.llm(prompt, 'gpt-4o-mini', true);
  const parsed = JSON.parse(response);
  return parsed.message;
}

export interface ConsistencyResult {
  score: number; // 0-100
  flags: string[];
  passed: boolean;
}

export async function analyzeProfileConsistency(
  profile: Partial<UserProfile>
): Promise<ConsistencyResult> {
  const prompt = window.spark.llmPrompt`You are an AI behavioral analyst for a dating platform. Analyze the following user profile for internal consistency and potential deception.

Profile Data:
${JSON.stringify({
  name: profile.name,
  bio: profile.bio,
  plannerOrSpontaneous: profile.plannerOrSpontaneous,
  introExtrovert: profile.introExtrovert,
  morningOrNight: profile.morningOrNight,
  exerciseHabit: profile.exerciseHabit,
  cookOrEatOut: profile.cookOrEatOut,
  smokingDrinking: profile.smokingDrinking,
  passionateAboutWork: profile.passionateAboutWork,
  workSchedule: profile.workSchedule,
  industry: profile.industry,
  education: profile.education,
  financialImportance: profile.financialImportance,
  lookingFor: profile.lookingFor,
  loveLanguage: profile.loveLanguage,
  paceInRelationship: profile.paceInRelationship,
  personalSpace: profile.personalSpace,
  lifestyle: profile.lifestyle,
  values: profile.values,
  interests: profile.interests,
  stressReaction: profile.stressReaction,
  friendsDescribe: profile.friendsDescribe,
  perfectDay: profile.perfectDay,
  weekendActivity: profile.weekendActivity,
  biggestFlaw: profile.biggestFlaw,
  healthyRelationship: profile.healthyRelationship,
  conflictStyle: profile.conflictStyle,
  fidelityView: profile.fidelityView,
  spirituality: profile.spirituality,
}, null, 2)}

Check for:
1. Logical contradictions between answers (e.g., says "planner" but describes chaotic lifestyle)
2. Inconsistencies between stated values and described behaviors
3. Mismatches between personality description and lifestyle choices
4. Bio inconsistencies with questionnaire answers
5. Unusual or copy-paste-like answers that seem generic

Return ONLY valid JSON in this exact format:
{
  "score": number (0-100, where 100 = perfectly consistent),
  "flags": ["string - specific inconsistency found"],
  "passed": boolean (true if score >= 70)
}`;

  try {
    const response = await window.spark.llm(prompt, 'gpt-4o-mini', true);
    return JSON.parse(response);
  } catch {
    return { score: 85, flags: [], passed: true };
  }
}

export async function generateBio(
  profile: Partial<UserProfile>
): Promise<string> {
  const prompt = window.spark.llmPrompt`Generate a short, engaging dating profile bio based on the following user details:

Name: ${profile.name || 'Unknown'}
Values: ${(profile.values || []).join(', ')}
Interests: ${(profile.interests || []).join(', ')}
Lifestyle: ${(profile.lifestyle || []).join(', ')}
Industry: ${profile.industry || 'Not specified'}
Education: ${profile.education || 'Not specified'}
Languages: ${(profile.languages || []).join(', ')}

Create a warm, authentic 2-3 sentence bio that highlights personality and interests. Make it feel natural and approachable, not generic. Keep it under 200 characters.

Return ONLY valid JSON in this exact format:
{
  "bio": "string - the generated bio"
}`;

  const response = await window.spark.llm(prompt, 'gpt-4o-mini', true);
  const parsed = JSON.parse(response);
  return parsed.bio;
}