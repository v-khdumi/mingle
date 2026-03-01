import { useState, useEffect, useMemo } from 'react';
import { useKV } from '@github/spark/hooks';
import { UserProfile, MatchProfile, CompatibilityResult } from './lib/types';
import { ProfileForm } from './components/ProfileForm';
import { MatchCard } from './components/MatchCard';
import { HoroscopeView } from './components/HoroscopeView';
import { InsightsView } from './components/InsightsView';
import { ExploreView } from './components/ExploreView';
import { calculateCompatibility, generateMatchProfiles } from './lib/ai';
import { useI18n, type Language } from './lib/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Skeleton } from './components/ui/skeleton';
import { Badge } from './components/ui/badge';
import { Heart, Moon, User, PencilSimple, Sparkle, ShieldCheck, Camera, Envelope, Globe, Compass, Lightbulb, ArrowsClockwise, ChartBar, Star, Briefcase, GraduationCap, Translate, Calendar, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { motion } from 'framer-motion';

function App() {
  const { t, lang, setLang } = useI18n();
  const [userProfile, setUserProfile, deleteUserProfile] = useKV<UserProfile | null>('user-profile', null);
  const [generatedMatches, setGeneratedMatches] = useState<MatchProfile[]>([]);
  const [compatibilityResults, setCompatibilityResults] = useState<CompatibilityResult[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [activeTab, setActiveTab] = useState('matches');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [exploreDetailId, setExploreDetailId] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile && compatibilityResults.length === 0) {
      loadMatches();
    }
  }, [userProfile]);

  const loadMatches = async () => {
    if (!userProfile) return;

    setIsLoadingMatches(true);
    try {
      const aiMatches = await generateMatchProfiles(userProfile);
      setGeneratedMatches(aiMatches);

      const results = await calculateCompatibility(userProfile, aiMatches);
      const filteredResults = results.filter((r) => r.score >= 0.70);
      const sortedResults = filteredResults.sort((a, b) => b.score - a.score);
      setCompatibilityResults(sortedResults);
      
      if (filteredResults.length === 0) {
        toast.info(t.app.noMatchesThreshold);
      } else {
        toast.success(t.app.foundMatches(filteredResults.length));
      }
    } catch (error) {
      toast.error(t.app.failedLoadMatches);
      console.error(error);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsEditingProfile(false);
    loadMatches();
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setActiveTab('profile');
  };

  const handleDeleteProfile = () => {
    if (confirm(t.app.deleteConfirm)) {
      deleteUserProfile();
      setGeneratedMatches([]);
      setCompatibilityResults([]);
      setIsEditingProfile(false);
      toast.success(t.app.profileDeleted);
    }
  };

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'ro' : 'en');
  };

  const handleExploreViewDetails = (matchId: string) => {
    setExploreDetailId(matchId);
    setActiveTab('matches');
  };

  // Calculate profile completeness
  const profileCompleteness = useMemo(() => {
    if (!userProfile) return 0;
    const fields = [
      userProfile.name, userProfile.bio, userProfile.birthDate,
      userProfile.friendsDescribe, userProfile.proudestAchievement,
      userProfile.plannerOrSpontaneous, userProfile.stressReaction,
      userProfile.whatMakesYouLaugh, userProfile.coreValue,
      userProfile.introExtrovert, userProfile.biggestFlaw,
      userProfile.perfectDay, userProfile.morningOrNight,
      userProfile.exerciseHabit, userProfile.weekendActivity,
      userProfile.pets, userProfile.cookOrEatOut,
      userProfile.smokingDrinking, userProfile.spirituality,
      userProfile.industry, userProfile.workSchedule, userProfile.education,
      userProfile.passionateAboutWork, userProfile.biggestDream,
      userProfile.lookingFor, userProfile.healthyRelationship,
      userProfile.partnerQuality, userProfile.conflictStyle,
      userProfile.loveLanguage, userProfile.wantChildren,
      userProfile.attractiveQuality, userProfile.dealBreaker,
      userProfile.lifeAsMovie, userProfile.surprisingFact,
      userProfile.ifCouldntFail,
    ];
    const filled = fields.filter(Boolean).length;
    const arraysScore = Math.min(
      (userProfile.values.length / 3) + (userProfile.interests.length / 3) + (userProfile.lifestyle.length / 3) + (userProfile.languages.length > 0 ? 1 : 0),
      4
    );
    return Math.min(100, Math.round(((filled + arraysScore) / (fields.length + 4)) * 100));
  }, [userProfile]);

  // Calculate average compatibility score
  const avgCompatibility = useMemo(() => {
    if (compatibilityResults.length === 0) return 0;
    const sum = compatibilityResults.reduce((acc, r) => acc + r.score, 0);
    return Math.round((sum / compatibilityResults.length) * 100);
  }, [compatibilityResults]);

  const qualifiedMatches = compatibilityResults
    .map((result) => {
      const match = generatedMatches.find((m) => m.id === result.matchId);
      return match ? { match, compatibility: result } : null;
    })
    .filter((item): item is { match: MatchProfile; compatibility: CompatibilityResult } => item !== null);

  if (!userProfile || isEditingProfile) {
    return (
      <div className="min-h-screen gradient-mesh p-4 md:p-8">
        <Toaster position="top-center" />
        <div className="max-w-4xl mx-auto py-8">
          <div className="flex items-center justify-between mb-4">
            {userProfile && isEditingProfile && (
              <Button
                variant="outline"
                onClick={() => setIsEditingProfile(false)}
                className="glass"
              >
                {t.app.cancel}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="ml-auto flex items-center gap-1 glass rounded-full px-4"
            >
              <Globe size={16} />
              {lang === 'en' ? 'RO' : 'EN'}
            </Button>
          </div>
          <ProfileForm initialProfile={userProfile || undefined} onComplete={handleProfileComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <Toaster position="top-center" />
      
      <header className="glass-header sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/25">
                <Heart size={22} weight="duotone" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {t.app.title}
                </h1>
                <p className="text-[10px] text-muted-foreground leading-tight">{t.app.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center gap-1 glass rounded-full px-3 h-8 text-xs"
              >
                <Globe size={14} />
                {lang === 'en' ? 'RO' : 'EN'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleEditProfile} className="glass h-8 text-xs">
                <PencilSimple size={14} className="mr-1" />
                {t.app.editProfile}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Welcome section with stats */}
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white shadow-lg">
                <User size={28} weight="duotone" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{t.app.welcomeBack.replace('{name}', userProfile.name)}</h2>
                <p className="text-muted-foreground text-sm">
                  {t.app.matchesFoundSimple(qualifiedMatches.length)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMatches}
                disabled={isLoadingMatches}
                className="glass text-xs h-8"
              >
                <ArrowsClockwise size={14} className={`mr-1 ${isLoadingMatches ? 'animate-spin' : ''}`} />
                {isLoadingMatches ? t.profileDisplay.refreshing : t.profileDisplay.refreshMatches}
              </Button>
            </div>
          </motion.div>

          {/* Quick stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            <Card className="p-3 glass-card rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Heart size={16} className="text-accent" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight">{qualifiedMatches.length}</p>
                  <p className="text-[10px] text-muted-foreground">{t.profileDisplay.totalMatches}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3 glass-card rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <ChartBar size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight">{avgCompatibility}%</p>
                  <p className="text-[10px] text-muted-foreground">{t.profileDisplay.avgCompatibility}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3 glass-card rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/30 flex items-center justify-center">
                  <Star size={16} className="text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight">{userProfile.authenticityScore ?? '—'}%</p>
                  <p className="text-[10px] text-muted-foreground">{t.profileDisplay.profileViews}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3 glass-card rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Sparkle size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight">{profileCompleteness}%</p>
                  <p className="text-[10px] text-muted-foreground">{t.profileDisplay.profileCompleteness}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl glass-tab rounded-xl p-1">
            <TabsTrigger value="matches" className="flex items-center gap-1.5 data-[state=active]:bg-white/70 data-[state=active]:shadow-sm rounded-lg text-xs sm:text-sm">
              <Heart size={16} />
              <span className="hidden sm:inline">{t.tabs.matches}</span>
            </TabsTrigger>
            <TabsTrigger value="explore" className="flex items-center gap-1.5 data-[state=active]:bg-white/70 data-[state=active]:shadow-sm rounded-lg text-xs sm:text-sm">
              <Compass size={16} />
              <span className="hidden sm:inline">{t.tabs.explore}</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1.5 data-[state=active]:bg-white/70 data-[state=active]:shadow-sm rounded-lg text-xs sm:text-sm">
              <Lightbulb size={16} />
              <span className="hidden sm:inline">{t.tabs.insights}</span>
            </TabsTrigger>
            <TabsTrigger
              value="horoscope"
              className="flex items-center gap-1.5 data-[state=active]:bg-white/70 data-[state=active]:shadow-sm rounded-lg text-xs sm:text-sm"
              disabled={!userProfile.optInAstrology || !userProfile.birthDate}
            >
              <Moon size={16} />
              <span className="hidden sm:inline">{t.tabs.horoscope}</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-1.5 data-[state=active]:bg-white/70 data-[state=active]:shadow-sm rounded-lg text-xs sm:text-sm">
              <User size={16} />
              <span className="hidden sm:inline">{t.tabs.profile}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="space-y-4">
            {isLoadingMatches ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6 glass-card rounded-2xl">
                    <div className="flex gap-6">
                      <Skeleton className="w-20 h-20 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : qualifiedMatches.length > 0 ? (
              <motion.div
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                {qualifiedMatches.map(({ match, compatibility }) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    compatibility={compatibility}
                    userProfile={userProfile}
                  />
                ))}
              </motion.div>
            ) : (
              <Card className="p-12 text-center glass-card rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-4 flex items-center justify-center">
                  <Sparkle size={32} className="text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t.matchCard.noMatches}</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {t.matchCard.noMatchesDesc}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={handleEditProfile} variant="outline" className="glass">
                    <PencilSimple className="mr-2" size={16} />
                    {t.matchCard.updateProfile}
                  </Button>
                  <Button onClick={loadMatches} disabled={isLoadingMatches} className="bg-gradient-to-r from-primary to-accent text-white">
                    <ArrowsClockwise size={16} className={`mr-2 ${isLoadingMatches ? 'animate-spin' : ''}`} />
                    {t.profileDisplay.refreshMatches}
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="explore">
            <ExploreView
              matches={qualifiedMatches}
              onViewDetails={handleExploreViewDetails}
            />
          </TabsContent>

          <TabsContent value="insights">
            <InsightsView userProfile={userProfile} />
          </TabsContent>

          <TabsContent value="horoscope">
            {userProfile.optInAstrology && userProfile.birthDate ? (
              <HoroscopeView birthDate={userProfile.birthDate} matches={qualifiedMatches.map(m => m.match)} />
            ) : (
              <Card className="p-12 text-center glass-card rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-4 flex items-center justify-center">
                  <Moon size={32} className="text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t.horoscope.notEnabled}</h3>
                <p className="text-muted-foreground mb-4">
                  {t.horoscope.notEnabledDesc}
                </p>
                <Button onClick={handleEditProfile} className="bg-gradient-to-r from-primary to-accent text-white">
                  {t.horoscope.updateProfile}
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <div className="space-y-6">
              {/* Profile Header Card */}
              <Card className="glass-accent rounded-2xl overflow-hidden">
                <div className="h-24 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 relative">
                  <div className="absolute inset-0 glass-subtle" />
                </div>
                <div className="px-6 pb-6 -mt-10 relative">
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-xl shadow-primary/20 border-4 border-white/50">
                      <User size={40} weight="duotone" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-2xl font-bold">{userProfile.name}</h3>
                        {userProfile.livenessVerified && (
                          <Badge variant="secondary" className="gap-1 text-green-700 bg-green-100 border-green-200">
                            <ShieldCheck size={12} weight="fill" /> Verified
                          </Badge>
                        )}
                      </div>
                      {userProfile.bio && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{userProfile.bio}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {userProfile.industry && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Briefcase size={12} /> {userProfile.industry}
                          </span>
                        )}
                        {userProfile.education && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <GraduationCap size={12} /> {userProfile.education}
                          </span>
                        )}
                        {userProfile.languages.length > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Translate size={12} /> {userProfile.languages.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" onClick={handleEditProfile} className="glass text-xs shrink-0">
                      <PencilSimple size={14} className="mr-1" />
                      {t.app.editProfile}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Profile Completeness + Trust badges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Completeness */}
                <Card className="p-5 glass-card rounded-2xl">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <ChartBar size={16} className="text-primary" />
                    {t.profileDisplay.profileCompleteness}
                  </h4>
                  <div className="relative mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="h-3 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              profileCompleteness >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                              profileCompleteness >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                              'bg-gradient-to-r from-red-500 to-pink-400'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${profileCompleteness}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-bold w-12 text-right">{profileCompleteness}%</span>
                    </div>
                  </div>
                  {profileCompleteness < 100 && (
                    <p className="text-xs text-muted-foreground">{t.profileDisplay.completeProfile}</p>
                  )}
                </Card>

                {/* Trust Badges */}
                <Card className="p-5 glass-card rounded-2xl">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-green-600" />
                    {t.profileDisplay.trustBadges}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.photoUploaded && (
                      <Badge variant="outline" className="gap-1 text-green-700 bg-green-50 border-green-200">
                        <Camera size={12} /> {t.profileDisplay.photoVerified}
                      </Badge>
                    )}
                    {userProfile.livenessVerified && (
                      <Badge variant="outline" className="gap-1 text-green-700 bg-green-50 border-green-200">
                        <ShieldCheck size={12} /> {t.profileDisplay.livenessVerified}
                      </Badge>
                    )}
                    {userProfile.consentGiven && (
                      <Badge variant="outline" className="gap-1 text-blue-700 bg-blue-50 border-blue-200">
                        <Envelope size={12} /> {t.profileDisplay.consentGiven}
                      </Badge>
                    )}
                  </div>
                  {userProfile.authenticityScore !== undefined && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{t.profileDisplay.authenticityScore}</span>
                        <span className="font-bold">{userProfile.authenticityScore}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            userProfile.authenticityScore >= 80 ? 'bg-green-500' :
                            userProfile.authenticityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${userProfile.authenticityScore}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* About & Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* About Me */}
                <Card className="p-5 glass-card rounded-2xl">
                  <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <User size={16} className="text-primary" />
                    {t.profileDisplay.aboutMe}
                  </h4>
                  <div className="space-y-3">
                    {userProfile.lookingFor && (
                      <div className="flex items-start gap-3">
                        <Heart size={14} className="text-accent mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t.profileDisplay.relationshipGoal}</p>
                          <p className="text-sm font-medium capitalize">{userProfile.lookingFor}</p>
                        </div>
                      </div>
                    )}
                    {userProfile.loveLanguage && (
                      <div className="flex items-start gap-3">
                        <Sparkle size={14} className="text-accent mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t.form.loveLanguage}</p>
                          <p className="text-sm font-medium capitalize">{userProfile.loveLanguage}</p>
                        </div>
                      </div>
                    )}
                    {userProfile.workSchedule && (
                      <div className="flex items-start gap-3">
                        <Calendar size={14} className="text-accent mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t.profileDisplay.workSchedule}</p>
                          <p className="text-sm font-medium">{userProfile.workSchedule}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Preferences & Tags */}
                <Card className="p-5 glass-card rounded-2xl">
                  <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                    <Star size={16} className="text-primary" />
                    {t.profileDisplay.preferencesTitle}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">{t.profileDisplay.values}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {userProfile.values.map((value) => (
                          <Badge key={value} variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">{t.profileDisplay.interests}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {userProfile.interests.map((interest) => (
                          <Badge key={interest} variant="outline" className="text-xs bg-secondary/10 border-secondary/30">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">{t.profileDisplay.lifestyle}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {userProfile.lifestyle.map((trait) => (
                          <Badge key={trait} variant="outline" className="text-xs bg-accent/5 border-accent/20 text-accent">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Consistency Flags */}
              {userProfile.consistencyFlags && userProfile.consistencyFlags.length > 0 && (
                <Card className="p-4 glass-card rounded-2xl border-amber-200/50">
                  <div className="space-y-1.5">
                    {userProfile.consistencyFlags.map((flag, i) => (
                      <p key={i} className="text-xs text-amber-600 flex items-start gap-1.5">
                        <span className="mt-0.5">⚠️</span> {flag}
                      </p>
                    ))}
                  </div>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleEditProfile} className="flex-1 bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20">
                  <PencilSimple size={16} className="mr-2" />
                  {t.app.editProfile}
                </Button>
                <Button variant="outline" onClick={handleDeleteProfile} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash size={16} className="mr-2" />
                  {t.profileDisplay.deleteProfile}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
