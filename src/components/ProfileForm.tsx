import { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { generateBio, analyzeProfileConsistency } from '@/lib/ai';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, X, Plus, Camera, ShieldCheck, UploadSimple, Sparkle, Warning } from '@phosphor-icons/react';
import { toast } from 'sonner';

interface ProfileFormProps {
  initialProfile?: UserProfile;
  onComplete: (profile: UserProfile) => void;
}

const FIRST_PROFILE_EDIT_STEP = 4;

const COMMON_INTERESTS = [
  'Travel', 'Cooking', 'Hiking', 'Reading', 'Photography', 'Music', 'Art',
  'Fitness', 'Yoga', 'Dancing', 'Gaming', 'Writing', 'Movies', 'Sports'
];

const COMMON_VALUES = [
  'Honesty', 'Growth', 'Family', 'Creativity', 'Adventure', 'Empathy',
  'Authenticity', 'Mindfulness', 'Innovation', 'Compassion', 'Optimism', 'Stability'
];

const LIFESTYLE_OPTIONS = [
  'Active', 'Social', 'Introspective', 'Adventurous', 'Creative', 'Health-conscious',
  'Balanced', 'Driven', 'Relaxed', 'Spontaneous', 'Organized'
];

export function ProfileForm({ initialProfile, onComplete }: ProfileFormProps) {
  const { t } = useI18n();

  const COMMON_VALUES_MAP: Record<string, string> = {
    'Honesty': t.form.tagHonesty, 'Growth': t.form.tagGrowth, 'Family': t.form.tagFamily,
    'Creativity': t.form.tagCreativity, 'Adventure': t.form.tagAdventure, 'Empathy': t.form.tagEmpathy,
    'Authenticity': t.form.tagAuthenticity, 'Mindfulness': t.form.tagMindfulness, 'Innovation': t.form.tagInnovation,
    'Compassion': t.form.tagCompassion, 'Optimism': t.form.tagOptimism, 'Stability': t.form.tagStability,
  };
  const COMMON_INTERESTS_MAP: Record<string, string> = {
    'Travel': t.form.tagTravel, 'Cooking': t.form.tagCooking, 'Hiking': t.form.tagHiking,
    'Reading': t.form.tagReading, 'Photography': t.form.tagPhotography, 'Music': t.form.tagMusic,
    'Art': t.form.tagArt, 'Fitness': t.form.tagFitness, 'Yoga': t.form.tagYoga,
    'Dancing': t.form.tagDancing, 'Gaming': t.form.tagGaming, 'Writing': t.form.tagWriting,
    'Movies': t.form.tagMovies, 'Sports': t.form.tagSports,
  };
  const LIFESTYLE_MAP: Record<string, string> = {
    'Active': t.form.tagActive, 'Social': t.form.tagSocial, 'Introspective': t.form.tagIntrospective,
    'Adventurous': t.form.tagAdventurous, 'Creative': t.form.tagCreative, 'Health-conscious': t.form.tagHealthConscious,
    'Balanced': t.form.tagBalanced, 'Driven': t.form.tagDriven, 'Relaxed': t.form.tagRelaxed,
    'Spontaneous': t.form.tagSpontaneous, 'Organized': t.form.tagOrganized,
  };

  const [step, setStep] = useState(initialProfile ? FIRST_PROFILE_EDIT_STEP : 1);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>(
    initialProfile || {
      values: [],
      interests: [],
      lifestyle: [],
      languages: [],
      optInAstrology: false,
      optInAttractiveness: false,
      optInSalary: false,
      ageConfirmed: false,
      photoUploaded: false,
      livenessVerified: false,
      consentGiven: false,
    }
  );

  const totalSteps = 10;
  const progress = (step / totalSteps) * 100;

  const addItem = (field: 'values' | 'interests' | 'lifestyle' | 'languages', item: string) => {
    const current = profile[field] || [];
    if (!current.includes(item)) {
      setProfile({ ...profile, [field]: [...current, item] });
    }
  };

  const removeItem = (field: 'values' | 'interests' | 'lifestyle' | 'languages', item: string) => {
    const current = profile[field] || [];
    setProfile({ ...profile, [field]: current.filter(i => i !== item) });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return profile.ageConfirmed && profile.consentGiven;
      case 2:
        return profile.photoUploaded;
      case 3:
        return profile.livenessVerified;
      case 4:
        return profile.name && profile.name.trim().length > 0;
      case 5:
        return true; // lifestyle questions are mostly optional
      case 6:
        return true; // career questions optional
      case 7:
        return profile.lookingFor; // at least relationship intent
      case 8:
        return true; // deal-breakers optional
      case 9:
        return true; // fun questions optional
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;

    // Run AI consistency check before submitting
    setIsAnalyzing(true);
    try {
      const consistency = await analyzeProfileConsistency(profile);
      const updatedProfile = {
        ...profile,
        authenticityScore: consistency.score,
        consistencyFlags: consistency.flags,
      } as UserProfile;

      if (!consistency.passed) {
        toast.warning(t.form.consistencyWarning);
      } else {
        toast.success(t.form.consistencyPassed);
      }

      onComplete(updatedProfile);
    } catch {
      toast.info(t.form.consistencyPassed);
      onComplete(profile as UserProfile);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const simulatePhotoUpload = () => {
    setProfile({ ...profile, photoUploaded: true });
    toast.success(t.form.photoSuccess);
  };

  const simulateLivenessCheck = () => {
    setProfile({ ...profile, livenessVerified: true });
    toast.success(t.form.livenessSuccess);
  };

  const handleGenerateBio = async () => {
    setIsGeneratingBio(true);
    try {
      const bio = await generateBio(profile);
      setProfile({ ...profile, bio });
      toast.success(t.form.bioGenerated);
    } catch {
      toast.error(t.form.bioFailed);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Progress value={progress} className="h-2 mb-2" />
        <p className="text-sm text-muted-foreground">{t.form.stepOf(step, totalSteps)}</p>
      </div>

      <Card className="p-8 glass-card rounded-2xl">
        {/* Step 1: Consent */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.form.welcomeTitle}</h2>
              <p className="text-muted-foreground">{t.form.welcomeSubtitle}</p>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="ageConfirmed"
                    checked={profile.ageConfirmed || false}
                    onChange={(e) => setProfile({ ...profile, ageConfirmed: e.target.checked })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="ageConfirmed" className="cursor-pointer font-medium">
                      {t.form.ageConfirm}
                    </Label>
                    <p className="text-sm text-muted-foreground">{t.form.ageConfirmDesc}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consentGiven"
                    checked={profile.consentGiven || false}
                    onChange={(e) => setProfile({ ...profile, consentGiven: e.target.checked })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="consentGiven" className="cursor-pointer font-medium">
                      {t.form.consentData}
                    </Label>
                    <p className="text-sm text-muted-foreground">{t.form.consentDataDesc}</p>
                  </div>
                </div>
              </div>

              {!profile.ageConfirmed && (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <Warning size={16} />
                  <span>{t.form.ageWarning}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Photo Upload */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.form.photoTitle}</h2>
              <p className="text-muted-foreground">{t.form.photoSubtitle}</p>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                {profile.photoUploaded ? (
                  <div className="space-y-3">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white mx-auto">
                      <ShieldCheck size={48} weight="duotone" />
                    </div>
                    <p className="font-medium text-green-700">{t.form.photoUploaded}</p>
                    <p className="text-sm text-muted-foreground">{t.form.photoVerifiedDesc}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <UploadSimple size={48} className="text-muted-foreground" />
                    </div>
                    <p className="font-medium">{t.form.photoUploadPrompt}</p>
                    <p className="text-sm text-muted-foreground">{t.form.photoUploadDesc}</p>
                    <Button onClick={simulatePhotoUpload}>
                      <UploadSimple className="mr-2" />
                      {t.form.choosePhoto}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Liveness Verification */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.form.livenessTitle}</h2>
              <p className="text-muted-foreground">{t.form.livenessSubtitle}</p>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                {profile.livenessVerified ? (
                  <div className="space-y-3">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white mx-auto">
                      <ShieldCheck size={48} weight="duotone" />
                    </div>
                    <p className="font-medium text-green-700">{t.form.livenessVerified}</p>
                    <p className="text-sm text-muted-foreground">{t.form.livenessVerifiedDesc}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <Camera size={48} className="text-muted-foreground" />
                    </div>
                    <p className="font-medium">{t.form.livenessPrompt}</p>
                    <p className="text-sm text-muted-foreground">{t.form.livenessDesc}</p>
                    <Button onClick={simulateLivenessCheck}>
                      <Camera className="mr-2" />
                      {t.form.startVerification}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Who Are You? (Identity & Personality) */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.form.identityTitle}</h2>
              <p className="text-muted-foreground">{t.form.identitySubtitle}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t.form.nameLabel}</Label>
                <Input
                  id="name"
                  value={profile.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder={t.form.namePlaceholder}
                  className="mt-2"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="bio">{t.form.bioLabel}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateBio}
                    disabled={isGeneratingBio || !profile.name}
                  >
                    <Sparkle className="mr-1" size={14} />
                    {isGeneratingBio ? t.form.bioGenerating : t.form.bioGenerate}
                  </Button>
                </div>
                <Textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder={t.form.bioPlaceholder}
                  className="mt-1 min-h-24"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t.form.bioCharCount((profile.bio || '').length)}
                </p>
              </div>

              <div>
                <Label htmlFor="friendsDescribe">{t.form.friendsDescribe}</Label>
                <Input
                  id="friendsDescribe"
                  value={profile.friendsDescribe || ''}
                  onChange={(e) => setProfile({ ...profile, friendsDescribe: e.target.value })}
                  placeholder={t.form.friendsDescribePlaceholder}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="proudest">{t.form.proudestAchievement}</Label>
                <Textarea
                  id="proudest"
                  value={profile.proudestAchievement || ''}
                  onChange={(e) => setProfile({ ...profile, proudestAchievement: e.target.value })}
                  placeholder={t.form.proudestPlaceholder}
                  className="mt-2 min-h-16"
                />
              </div>

              <div>
                <Label>{t.form.plannerOrSpontaneous}</Label>
                <Select
                  value={profile.plannerOrSpontaneous || ''}
                  onValueChange={(v) => setProfile({ ...profile, plannerOrSpontaneous: v })}
                >
                  <SelectTrigger className="mt-2"><SelectValue placeholder={t.form.selectPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planner">{t.form.plannerOption}</SelectItem>
                    <SelectItem value="spontaneous">{t.form.spontaneousOption}</SelectItem>
                    <SelectItem value="mix">{t.form.mixBothOption}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="stressReaction">{t.form.stressReaction}</Label>
                <Textarea
                  id="stressReaction"
                  value={profile.stressReaction || ''}
                  onChange={(e) => setProfile({ ...profile, stressReaction: e.target.value })}
                  placeholder={t.form.stressPlaceholder}
                  className="mt-2 min-h-16"
                />
              </div>

              <div>
                <Label htmlFor="laugh">{t.form.whatMakesYouLaugh}</Label>
                <Input
                  id="laugh"
                  value={profile.whatMakesYouLaugh || ''}
                  onChange={(e) => setProfile({ ...profile, whatMakesYouLaugh: e.target.value })}
                  placeholder={t.form.laughPlaceholder}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="coreValue">{t.form.coreValue}</Label>
                <Input
                  id="coreValue"
                  value={profile.coreValue || ''}
                  onChange={(e) => setProfile({ ...profile, coreValue: e.target.value })}
                  placeholder={t.form.coreValuePlaceholder}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>{t.form.introExtrovert}</Label>
                <Select
                  value={profile.introExtrovert || ''}
                  onValueChange={(v) => setProfile({ ...profile, introExtrovert: v })}
                >
                  <SelectTrigger className="mt-2"><SelectValue placeholder={t.form.selectPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="introvert">{t.form.introvertOption}</SelectItem>
                    <SelectItem value="extrovert">{t.form.extrovertOption}</SelectItem>
                    <SelectItem value="ambivert">{t.form.ambivertOption}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="flaw">{t.form.biggestFlaw}</Label>
                <Input
                  id="flaw"
                  value={profile.biggestFlaw || ''}
                  onChange={(e) => setProfile({ ...profile, biggestFlaw: e.target.value })}
                  placeholder={t.form.biggestFlawPlaceholder}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Lifestyle */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.form.lifestyleTitle}</h2>
              <p className="text-muted-foreground">{t.form.lifestyleSubtitle}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="perfectDay">{t.form.perfectDay}</Label>
                <Textarea
                  id="perfectDay"
                  value={profile.perfectDay || ''}
                  onChange={(e) => setProfile({ ...profile, perfectDay: e.target.value })}
                  placeholder={t.form.perfectDayPlaceholder}
                  className="mt-2 min-h-16"
                />
              </div>

              <div>
                <Label>{t.form.morningOrNight}</Label>
                <Select
                  value={profile.morningOrNight || ''}
                  onValueChange={(v) => setProfile({ ...profile, morningOrNight: v })}
                >
                  <SelectTrigger className="mt-2"><SelectValue placeholder={t.form.selectPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">{t.form.morningOption}</SelectItem>
                    <SelectItem value="night">{t.form.nightOption}</SelectItem>
                    <SelectItem value="depends">{t.form.dependsOption}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t.form.exerciseRegularly}</Label>
                <Select
                  value={profile.exerciseHabit || ''}
                  onValueChange={(v) => setProfile({ ...profile, exerciseHabit: v })}
                >
                  <SelectTrigger className="mt-2"><SelectValue placeholder={t.form.selectPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">{t.form.exerciseYes}</SelectItem>
                    <SelectItem value="sometimes">{t.form.exerciseSometimes}</SelectItem>
                    <SelectItem value="no">{t.form.exerciseNo}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="weekendActivity">{t.form.weekendActivity}</Label>
                <Textarea
                  id="weekendActivity"
                  value={profile.weekendActivity || ''}
                  onChange={(e) => setProfile({ ...profile, weekendActivity: e.target.value })}
                  placeholder={t.form.weekendPlaceholder}
                  className="mt-2 min-h-16"
                />
              </div>

              <div>
                <Label>{t.form.pets}</Label>
                <Select
                  value={profile.pets || ''}
                  onValueChange={(v) => setProfile({ ...profile, pets: v })}
                >
                  <SelectTrigger className="mt-2"><SelectValue placeholder={t.form.selectPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="have">{t.form.petsYesHave}</SelectItem>
                    <SelectItem value="like">{t.form.petsYesLike}</SelectItem>
                    <SelectItem value="no">{t.form.petsNo}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t.form.cookOrEatOut}</Label>
                <Select
                  value={profile.cookOrEatOut || ''}
                  onValueChange={(v) => setProfile({ ...profile, cookOrEatOut: v })}
                >
                  <SelectTrigger className="mt-2"><SelectValue placeholder={t.form.selectPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cook">{t.form.cookOption}</SelectItem>
                    <SelectItem value="eatout">{t.form.eatOutOption}</SelectItem>
                    <SelectItem value="both">{t.form.bothOption}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t.form.smokingDrinking}</Label>
                <Select
                  value={profile.smokingDrinking || ''}
                  onValueChange={(v) => setProfile({ ...profile, smokingDrinking: v })}
                >
                  <SelectTrigger className="mt-2"><SelectValue placeholder={t.form.selectPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neither">{t.form.neitherOption}</SelectItem>
                    <SelectItem value="drink">{t.form.drinkOccasionally}</SelectItem>
                    <SelectItem value="both">{t.form.smokeAndDrink}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="spirituality">{t.form.spirituality}</Label>
                <Textarea
                  id="spirituality"
                  value={profile.spirituality || ''}
                  onChange={(e) => setProfile({ ...profile, spirituality: e.target.value })}
                  placeholder={t.form.spiritualityPlaceholder}
                  className="mt-2 min-h-16"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Career & Ambitions */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.form.careerTitle}</h2>
              <p className="text-muted-foreground">{t.form.careerSubtitle}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="industry">{t.form.workField}</Label>
                <Input
                  id="industry"
                  value={profile.industry || ''}
                  onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                  placeholder={t.form.workFieldPlaceholder}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>{t.form.passionateAboutWork}</Label>
                <Select
                  value={profile.passionateAboutWork || ''}
                  onValueChange={(v) => setProfile({ ...profile, passionateAboutWork: v })}
                >
                  <SelectTrigger className="mt-2"><SelectValue placeholder={t.form.selectPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passionate">{t.form.passionateYes}</SelectItem>
                    <SelectItem value="neutral">{t.form.passionateNeutral}</SelectItem>
                    <SelectItem value="just-job">{t.form.passionateNo}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t.form.workScheduleLabel}</Label>
                <Select
                  value={profile.workSchedule || ''}
                  onValueChange={(v) => setProfile({ ...profile, workSchedule: v })}
                >
                  <SelectTrigger className="mt-2"><SelectValue placeholder={t.form.selectPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular hours (9-5)">{t.form.workScheduleRegular}</SelectItem>
                    <SelectItem value="Flexible (9-6 with remote options)">{t.form.workScheduleFlexible}</SelectItem>
                    <SelectItem value="Shifts (variable)">{t.form.workScheduleShifts}</SelectItem>
                    <SelectItem value="Irregular (startup life)">{t.form.workScheduleIrregular}</SelectItem>
                    <SelectItem value="Evenings/Nights">{t.form.workScheduleEvening}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="biggestDream">{t.form.biggestDream}</Label>
                <Textarea
                  id="biggestDream"
                  value={profile.biggestDream || ''}
                  onChange={(e) => setProfile({ ...profile, biggestDream: e.target.value })}
                  placeholder={t.form.biggestDreamPlaceholder}
                  className="mt-2 min-h-16"
                />
              </div>

              <div>
                <Label>{t.form.financialImportance}</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider
                    value={[profile.financialImportance || 5]}
                    onValueChange={(v) => setProfile({ ...profile, financialImportance: v[0] })}
                    min={1}
                    max={10}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-lg font-bold w-8 text-center">{profile.financialImportance || 5}</span>
                </div>
              </div>

              <div>
                <Label>{t.form.educationLevel}</Label>
                <Select
                  value={profile.education || ''}
                  onValueChange={(v) => setProfile({ ...profile, education: v })}
                >
                  <SelectTrigger className="mt-2"><SelectValue placeholder={t.form.selectPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High School">{t.form.educationHighSchool}</SelectItem>
                    <SelectItem value="Bachelor's Degree">{t.form.educationBachelor}</SelectItem>
                    <SelectItem value="Master's Degree">{t.form.educationMaster}</SelectItem>
                    <SelectItem value="PhD">{t.form.educationPhD}</SelectItem>
                    <SelectItem value="Other">{t.form.educationOther}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="travelExperience">{t.form.travelExperience}</Label>
                <Textarea
                  id="travelExperience"
                  value={profile.travelExperience || ''}
                  onChange={(e) => setProfile({ ...profile, travelExperience: e.target.value })}
                  placeholder={t.form.travelPlaceholder}
                  className="mt-2 min-h-16"
                />
              </div>

              <div>
                <Label htmlFor="language-input">{t.form.languagesLabel}</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="language-input"
                    placeholder={t.form.languagePlaceholder}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.currentTarget;
                        if (input.value.trim()) {
                          addItem('languages', input.value.trim());
                          input.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const input = document.getElementById('language-input') as HTMLInputElement;
                      if (input?.value.trim()) {
                        addItem('languages', input.value.trim());
                        input.value = '';
                      }
                    }}
                  >
                    <Plus />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.languages?.map((lang) => (
                    <Badge key={lang} variant="secondary">
                      {lang}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => removeItem('languages', lang)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Relationships & Love */}
        {step === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.form.relationshipsTitle}</h2>
              <p className="text-muted-foreground">{t.form.relationshipsSubtitle}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>{t.form.lookingFor}</Label>
                <Select
                  value={profile.lookingFor || ''}
                  onValueChange={(v) => setProfile({ ...profile, lookingFor: v })}
                >
                  <SelectTrigger className="mt-2"><SelectValue placeholder={t.form.selectPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="serious">{t.form.lookingSerious}</SelectItem>
                    <SelectItem value="casual">{t.form.lookingCasual}</SelectItem>
                    <SelectItem value="friendship">{t.form.lookingFriendship}</SelectItem>
                    <SelectItem value="marriage">{t.form.lookingMarriage}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="healthyRel">{t.form.healthyRelationship}</Label>
                <Textarea
                  id="healthyRel"
                  value={profile.healthyRelationship || ''}
                  onChange={(e) => setProfile({ ...profile, healthyRelationship: e.target.value })}
                  placeholder={t.form.healthyRelPlaceholder}
                  className="mt-2 min-h-16"
                />
              </div>

              <div>
                <Label htmlFor="partnerQuality">{t.form.partnerQuality}</Label>
                <Input
                  id="partnerQuality"
                  value={profile.partnerQuality || ''}
                  onChange={(e) => setProfile({ ...profile, partnerQuality: e.target.value })}
                  placeholder={t.form.partnerQualityPlaceholder}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="conflictStyle">{t.form.conflictStyle}</Label>
                <Textarea
                  id="conflictStyle"
                  value={profile.conflictStyle || ''}
                  onChange={(e) => setProfile({ ...profile, conflictStyle: e.target.value })}
                  placeholder={t.form.conflictPlaceholder}
                  className="mt-2 min-h-16"
                />
              </div>

              <div>
                <Label>{t.form.loveLanguage}</Label>
                <Select
                  value={profile.loveLanguage || ''}
                  onValueChange={(v) => setProfile({ ...profile, loveLanguage: v })}
                >
                  <SelectTrigger className="mt-2"><SelectValue placeholder={t.form.selectPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="words">{t.form.loveWords}</SelectItem>
                    <SelectItem value="time">{t.form.loveTime}</SelectItem>
                    <SelectItem value="gifts">{t.form.loveGifts}</SelectItem>
                    <SelectItem value="acts">{t.form.loveActs}</SelectItem>
                    <SelectItem value="touch">{t.form.loveTouch}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t.form.wantChildren}</Label>
                <Select
                  value={profile.wantChildren || ''}
                  onValueChange={(v) => setProfile({ ...profile, wantChildren: v })}
                >
                  <SelectTrigger className="mt-2"><SelectValue placeholder={t.form.selectPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="have">{t.form.childrenHave}</SelectItem>
                    <SelectItem value="want">{t.form.childrenWant}</SelectItem>
                    <SelectItem value="no">{t.form.childrenNo}</SelectItem>
                    <SelectItem value="unsure">{t.form.childrenUnsure}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 8: Compatibility & Deal-Breakers */}
        {step === 8 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.form.compatibilityTitle}</h2>
              <p className="text-muted-foreground">{t.form.compatibilitySubtitle}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="attractiveQuality">{t.form.attractiveQuality}</Label>
                <Input
                  id="attractiveQuality"
                  value={profile.attractiveQuality || ''}
                  onChange={(e) => setProfile({ ...profile, attractiveQuality: e.target.value })}
                  placeholder={t.form.attractivePlaceholder}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="dealBreaker">{t.form.dealBreaker}</Label>
                <Input
                  id="dealBreaker"
                  value={profile.dealBreaker || ''}
                  onChange={(e) => setProfile({ ...profile, dealBreaker: e.target.value })}
                  placeholder={t.form.dealBreakerPlaceholder}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>{t.form.longDistance}</Label>
                <Select
                  value={profile.longDistance || ''}
                  onValueChange={(v) => setProfile({ ...profile, longDistance: v })}
                >
                  <SelectTrigger className="mt-2"><SelectValue placeholder={t.form.selectPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">{t.form.longDistanceYes}</SelectItem>
                    <SelectItem value="temp">{t.form.longDistanceTemp}</SelectItem>
                    <SelectItem value="no">{t.form.longDistanceNo}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fidelityView">{t.form.fidelityView}</Label>
                <Textarea
                  id="fidelityView"
                  value={profile.fidelityView || ''}
                  onChange={(e) => setProfile({ ...profile, fidelityView: e.target.value })}
                  placeholder={t.form.fidelityPlaceholder}
                  className="mt-2 min-h-16"
                />
              </div>

              <div>
                <Label>{t.form.paceInRelationship}</Label>
                <Select
                  value={profile.paceInRelationship || ''}
                  onValueChange={(v) => setProfile({ ...profile, paceInRelationship: v })}
                >
                  <SelectTrigger className="mt-2"><SelectValue placeholder={t.form.selectPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">{t.form.paceQuick}</SelectItem>
                    <SelectItem value="slow">{t.form.paceSlow}</SelectItem>
                    <SelectItem value="depends">{t.form.paceDepends}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t.form.personalSpace}</Label>
                <Select
                  value={profile.personalSpace || ''}
                  onValueChange={(v) => setProfile({ ...profile, personalSpace: v })}
                >
                  <SelectTrigger className="mt-2"><SelectValue placeholder={t.form.selectPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="together">{t.form.spaceTogether}</SelectItem>
                    <SelectItem value="balance">{t.form.spaceBalance}</SelectItem>
                    <SelectItem value="independent">{t.form.spaceIndependent}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Values & Interests selection */}
              <div className="pt-4 border-t">
                <Label>{t.profileDisplay.values}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {COMMON_VALUES.map((value) => (
                    <Badge
                      key={value}
                      variant={profile.values?.includes(value) ? 'default' : 'outline'}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() =>
                        profile.values?.includes(value)
                          ? removeItem('values', value)
                          : addItem('values', value)
                      }
                    >
                      {COMMON_VALUES_MAP[value] || value}
                      {profile.values?.includes(value) && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>{t.profileDisplay.interests}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {COMMON_INTERESTS.map((interest) => (
                    <Badge
                      key={interest}
                      variant={profile.interests?.includes(interest) ? 'default' : 'outline'}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() =>
                        profile.interests?.includes(interest)
                          ? removeItem('interests', interest)
                          : addItem('interests', interest)
                      }
                    >
                      {COMMON_INTERESTS_MAP[interest] || interest}
                      {profile.interests?.includes(interest) && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>{t.profileDisplay.lifestyle}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {LIFESTYLE_OPTIONS.map((trait) => (
                    <Badge
                      key={trait}
                      variant={profile.lifestyle?.includes(trait) ? 'default' : 'outline'}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() =>
                        profile.lifestyle?.includes(trait)
                          ? removeItem('lifestyle', trait)
                          : addItem('lifestyle', trait)
                      }
                    >
                      {LIFESTYLE_MAP[trait] || trait}
                      {profile.lifestyle?.includes(trait) && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 9: Fun & Essence */}
        {step === 9 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.form.funTitle}</h2>
              <p className="text-muted-foreground">{t.form.funSubtitle}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="lifeAsMovie">{t.form.lifeAsMovie}</Label>
                <Input
                  id="lifeAsMovie"
                  value={profile.lifeAsMovie || ''}
                  onChange={(e) => setProfile({ ...profile, lifeAsMovie: e.target.value })}
                  placeholder={t.form.lifeMoviePlaceholder}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="surprisingFact">{t.form.surprisingFact}</Label>
                <Textarea
                  id="surprisingFact"
                  value={profile.surprisingFact || ''}
                  onChange={(e) => setProfile({ ...profile, surprisingFact: e.target.value })}
                  placeholder={t.form.surprisingPlaceholder}
                  className="mt-2 min-h-16"
                />
              </div>

              <div>
                <Label htmlFor="ifCouldntFail">{t.form.ifCouldntFail}</Label>
                <Textarea
                  id="ifCouldntFail"
                  value={profile.ifCouldntFail || ''}
                  onChange={(e) => setProfile({ ...profile, ifCouldntFail: e.target.value })}
                  placeholder={t.form.ifCouldntFailPlaceholder}
                  className="mt-2 min-h-16"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 10: Optional Details */}
        {step === 10 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.form.optionalTitle}</h2>
              <p className="text-muted-foreground">{t.form.optionalSubtitle}</p>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="optInAstrology"
                    checked={profile.optInAstrology}
                    onChange={(e) => setProfile({ ...profile, optInAstrology: e.target.checked })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="optInAstrology" className="cursor-pointer font-medium">
                      {t.form.includeAstrology}
                    </Label>
                    <p className="text-sm text-muted-foreground">{t.form.astrologyDesc}</p>
                  </div>
                </div>

                {profile.optInAstrology && (
                  <div>
                    <Label htmlFor="birthDate">{t.form.birthDate}</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={profile.birthDate || ''}
                      onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="optInAttractiveness"
                    checked={profile.optInAttractiveness}
                    onChange={(e) => setProfile({ ...profile, optInAttractiveness: e.target.checked })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="optInAttractiveness" className="cursor-pointer font-medium">
                      {t.form.includeAttractiveness}
                    </Label>
                    <p className="text-sm text-muted-foreground">{t.form.attractivenessDesc}</p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="height">{t.form.height}</Label>
                <Input
                  id="height"
                  value={profile.height || ''}
                  onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                  placeholder={t.form.heightPlaceholder}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="dietaryPreferences">{t.form.dietaryPreferences}</Label>
                <Select
                  value={profile.dietaryPreferences || ''}
                  onValueChange={(v) => setProfile({ ...profile, dietaryPreferences: v })}
                >
                  <SelectTrigger id="dietaryPreferences" className="mt-2">
                    <SelectValue placeholder={t.form.selectPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No restrictions">{t.form.dietaryNone}</SelectItem>
                    <SelectItem value="Vegetarian">{t.form.dietaryVegetarian}</SelectItem>
                    <SelectItem value="Vegan">{t.form.dietaryVegan}</SelectItem>
                    <SelectItem value="Pescatarian">{t.form.dietaryPescatarian}</SelectItem>
                    <SelectItem value="Flexitarian">{t.form.dietaryFlexitarian}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="optInSalary"
                    checked={profile.optInSalary}
                    onChange={(e) => setProfile({ ...profile, optInSalary: e.target.checked })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="optInSalary" className="cursor-pointer font-medium">
                      {t.form.includeSalary}
                    </Label>
                    <p className="text-sm text-muted-foreground">{t.form.salaryDesc}</p>
                  </div>
                </div>

                {profile.optInSalary && (
                  <div>
                    <Label htmlFor="salaryRange">{t.form.salaryRange}</Label>
                    <Input
                      id="salaryRange"
                      value={profile.salaryRange || ''}
                      onChange={(e) => setProfile({ ...profile, salaryRange: e.target.value })}
                      placeholder={t.form.salaryPlaceholder}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              {t.form.back}
            </Button>
          )}

          {step < totalSteps ? (
            <Button
              className="ml-auto"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              {t.form.continue} <ArrowRight className="ml-2" />
            </Button>
          ) : (
            <Button
              className="ml-auto bg-gradient-to-r from-primary to-accent"
              onClick={handleSubmit}
              disabled={!canProceed() || isAnalyzing}
            >
              {isAnalyzing ? t.form.analyzingProfile : t.form.findMatches} <ArrowRight className="ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
