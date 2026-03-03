export interface UserProfile {
  name: string;
  bio?: string;
  birthDate?: string;
  
  values: string[];
  interests: string[];
  lifestyle: string[];
  
  workSchedule?: string;
  industry?: string;
  education?: string;
  languages: string[];
  
  salaryRange?: string;
  height?: string;
  dietaryPreferences?: string;
  
  optInAstrology: boolean;
  optInAttractiveness: boolean;
  optInSalary: boolean;

  ageConfirmed: boolean;
  photoUploaded: boolean;
  livenessVerified: boolean;
  consentGiven: boolean;

  // Personality (Step 4 extended)
  friendsDescribe?: string;
  proudestAchievement?: string;
  plannerOrSpontaneous?: string;
  stressReaction?: string;
  whatMakesYouLaugh?: string;
  coreValue?: string;
  introExtrovert?: string;
  biggestFlaw?: string;

  // Lifestyle extended (Step 5)
  perfectDay?: string;
  morningOrNight?: string;
  exerciseHabit?: string;
  weekendActivity?: string;
  pets?: string;
  cookOrEatOut?: string;
  smokingDrinking?: string;
  spirituality?: string;

  // Career extended (Step 6)
  passionateAboutWork?: string;
  biggestDream?: string;
  financialImportance?: number;
  travelExperience?: string;

  // Relationships (Step 7)
  lookingFor?: string;
  healthyRelationship?: string;
  partnerQuality?: string;
  conflictStyle?: string;
  loveLanguage?: string;
  wantChildren?: string;

  // Compatibility & Deal-Breakers (Step 8)
  attractiveQuality?: string;
  dealBreaker?: string;
  longDistance?: string;
  fidelityView?: string;
  paceInRelationship?: string;
  personalSpace?: string;

  // Fun & Essence (Step 9)
  lifeAsMovie?: string;
  surprisingFact?: string;
  ifCouldntFail?: string;

  // AI-generated scores
  authenticityScore?: number;
  consistencyFlags?: string[];
}

export interface MatchProfile extends UserProfile {
  id: string;
  imageUrl?: string;
}

export interface CompatibilityResult {
  matchId: string;
  score: number;
  explanation: string;
  keyFactors: string[];
}

export interface HoroscopeReading {
  date: string;
  sign: string;
  reading: string;
}

export interface SynastryReading {
  userSign: string;
  matchSign: string;
  compatibility: string;
  explanation: string;
}

export interface DatingTip {
  id: string;
  category: 'conversation' | 'firstDate' | 'relationship' | 'selfGrowth';
  title: string;
  content: string;
  emoji: string;
}

export interface RelationshipInsight {
  title: string;
  description: string;
  strengths: string[];
  growthAreas: string[];
  weeklyChallenge: string;
}