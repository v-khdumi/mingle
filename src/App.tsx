import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { UserProfile, MatchProfile, CompatibilityResult } from './lib/types';
import { ProfileForm } from './components/ProfileForm';
import { MatchCard } from './components/MatchCard';
import { HoroscopeView } from './components/HoroscopeView';
import { calculateCompatibility, generateMatchProfiles } from './lib/ai';
import { useI18n, type Language } from './lib/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Skeleton } from './components/ui/skeleton';
import { Heart, Moon, User, PencilSimple, Sparkle, ShieldCheck, Camera, Envelope, Globe } from '@phosphor-icons/react';
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
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/25">
                <Heart size={24} weight="duotone" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {t.app.title}
                </h1>
                <p className="text-xs text-muted-foreground">{t.app.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center gap-1 glass rounded-full px-4"
              >
                <Globe size={16} />
                {lang === 'en' ? 'RO' : 'EN'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleEditProfile} className="glass">
                <PencilSimple className="mr-1" />
                {t.app.editProfile}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white">
              <User size={28} weight="duotone" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t.app.welcomeBack.replace('{name}', userProfile.name)}</h2>
              <p className="text-muted-foreground text-sm">
                {t.app.matchesFoundSimple(qualifiedMatches.length)}
              </p>
            </div>
          </motion.div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md glass-tab rounded-xl p-1">
            <TabsTrigger value="matches" className="flex items-center gap-2 data-[state=active]:bg-white/70 data-[state=active]:shadow-sm rounded-lg">
              <Heart size={16} />
              {t.tabs.matches}
            </TabsTrigger>
            <TabsTrigger
              value="horoscope"
              className="flex items-center gap-2 data-[state=active]:bg-white/70 data-[state=active]:shadow-sm rounded-lg"
              disabled={!userProfile.optInAstrology || !userProfile.birthDate}
            >
              <Moon size={16} />
              {t.tabs.horoscope}
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-white/70 data-[state=active]:shadow-sm rounded-lg">
              <User size={16} />
              {t.tabs.profile}
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
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Sparkle size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t.matchCard.noMatches}</h3>
                <p className="text-muted-foreground mb-4">
                  {t.matchCard.noMatchesDesc}
                </p>
                <Button onClick={handleEditProfile} variant="outline">
                  {t.matchCard.updateProfile}
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="horoscope">
            {userProfile.optInAstrology && userProfile.birthDate ? (
              <HoroscopeView birthDate={userProfile.birthDate} matches={qualifiedMatches.map(m => m.match)} />
            ) : (
              <Card className="p-12 text-center glass-card rounded-2xl">
                <Moon size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">{t.horoscope.notEnabled}</h3>
                <p className="text-muted-foreground mb-4">
                  {t.horoscope.notEnabledDesc}
                </p>
                <Button onClick={handleEditProfile}>{t.horoscope.updateProfile}</Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card className="p-6 glass-card rounded-2xl">
              <h3 className="text-xl font-bold mb-4">{t.profileDisplay.title}</h3>
              
              <div className="space-y-4">
                {(userProfile.livenessVerified || userProfile.photoUploaded || userProfile.consentGiven) && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">{t.profileDisplay.trustBadges}</h4>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.photoUploaded && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          <Camera size={12} /> {t.profileDisplay.photoVerified}
                        </span>
                      )}
                      {userProfile.livenessVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                          <ShieldCheck size={12} /> {t.profileDisplay.livenessVerified}
                        </span>
                      )}
                      {userProfile.consentGiven && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          <Envelope size={12} /> {t.profileDisplay.consentGiven}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {userProfile.authenticityScore !== undefined && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">{t.profileDisplay.authenticityScore}</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-muted rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            userProfile.authenticityScore >= 80 ? 'bg-green-500' :
                            userProfile.authenticityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${userProfile.authenticityScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold">{userProfile.authenticityScore}%</span>
                    </div>
                    {userProfile.consistencyFlags && userProfile.consistencyFlags.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {userProfile.consistencyFlags.map((flag, i) => (
                          <p key={i} className="text-xs text-amber-600">⚠️ {flag}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">{t.profileDisplay.name}</h4>
                  <p>{userProfile.name}</p>
                </div>

                {userProfile.bio && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">{t.profileDisplay.bio}</h4>
                    <p className="text-sm">{userProfile.bio}</p>
                  </div>
                )}

                {userProfile.lookingFor && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">{t.profileDisplay.relationshipGoal}</h4>
                    <p className="text-sm capitalize">{userProfile.lookingFor}</p>
                  </div>
                )}

                {userProfile.loveLanguage && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">{t.form.loveLanguage}</h4>
                    <p className="text-sm capitalize">{userProfile.loveLanguage}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">{t.profileDisplay.values}</h4>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.values.map((value) => (
                      <span key={value} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">{t.profileDisplay.interests}</h4>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.interests.map((interest) => (
                      <span key={interest} className="px-2 py-1 bg-secondary/40 text-secondary-foreground rounded text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">{t.profileDisplay.lifestyle}</h4>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.lifestyle.map((trait) => (
                      <span key={trait} className="px-2 py-1 bg-accent/20 text-accent-foreground rounded text-sm">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                {userProfile.languages.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">{t.profileDisplay.languages}</h4>
                    <p className="text-sm">{userProfile.languages.join(', ')}</p>
                  </div>
                )}

                {userProfile.industry && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">{t.profileDisplay.industry}</h4>
                    <p className="text-sm">{userProfile.industry}</p>
                  </div>
                )}

                {userProfile.workSchedule && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">{t.profileDisplay.workSchedule}</h4>
                    <p className="text-sm">{userProfile.workSchedule}</p>
                  </div>
                )}

                {userProfile.education && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">{t.profileDisplay.education}</h4>
                    <p className="text-sm">{userProfile.education}</p>
                  </div>
                )}

                <div className="pt-4 border-t flex gap-3">
                  <Button onClick={handleEditProfile} className="flex-1">
                    <PencilSimple className="mr-2" />
                    {t.app.editProfile}
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteProfile}>
                    {t.profileDisplay.deleteProfile}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
