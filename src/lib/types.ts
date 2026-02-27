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