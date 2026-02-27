import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { UserProfile, MatchProfile, CompatibilityResult } from './lib/types';
import { ProfileForm } from './components/ProfileForm';
import { MatchCard } from './components/MatchCard';
import { HoroscopeView } from './components/HoroscopeView';
import { sampleMatches } from './lib/sampleData';
import { calculateCompatibility } from './lib/ai';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Skeleton } from './components/ui/skeleton';
import { Heart, Moon, User, PencilSimple, Sparkle } from '@phosphor-icons/react';
import { toast, Toaster } from 'sonner';
import { motion } from 'framer-motion';

function App() {
  const [userProfile, setUserProfile, deleteUserProfile] = useKV<UserProfile | null>('user-profile', null);
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
      const results = await calculateCompatibility(userProfile, sampleMatches);
      const filteredResults = results.filter((r) => r.score >= 0.70);
      const sortedResults = filteredResults.sort((a, b) => b.score - a.score);
      setCompatibilityResults(sortedResults);
      
      if (filteredResults.length === 0) {
        toast.info('No matches above 70% compatibility threshold. Try updating your profile!');
      } else {
        toast.success(`Found ${filteredResults.length} compatible ${filteredResults.length === 1 ? 'match' : 'matches'}!`);
      }
    } catch (error) {
      toast.error('Failed to load matches. Please try again.');
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
    if (confirm('Are you sure you want to delete your profile? This cannot be undone.')) {
      deleteUserProfile();
      setCompatibilityResults([]);
      setIsEditingProfile(false);
      toast.success('Profile deleted');
    }
  };

  const qualifiedMatches = compatibilityResults
    .map((result) => {
      const match = sampleMatches.find((m) => m.id === result.matchId);
      return match ? { match, compatibility: result } : null;
    })
    .filter((item): item is { match: MatchProfile; compatibility: CompatibilityResult } => item !== null);

  if (!userProfile || isEditingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4 md:p-8">
        <Toaster position="top-center" />
        <div className="max-w-4xl mx-auto py-8">
          {userProfile && isEditingProfile && (
            <Button
              variant="outline"
              onClick={() => setIsEditingProfile(false)}
              className="mb-4"
            >
              Cancel
            </Button>
          )}
          <ProfileForm initialProfile={userProfile || undefined} onComplete={handleProfileComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10">
      <Toaster position="top-center" />
      
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                <Heart size={24} weight="duotone" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Mingle
                </h1>
                <p className="text-xs text-muted-foreground">AI-Powered Compatibility</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleEditProfile}>
                <PencilSimple className="mr-1" />
                Edit Profile
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
              <h2 className="text-2xl font-bold">Welcome back, {userProfile.name}!</h2>
              <p className="text-muted-foreground text-sm">
                {qualifiedMatches.length} compatible {qualifiedMatches.length === 1 ? 'match' : 'matches'} found
              </p>
            </div>
          </motion.div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Heart size={16} />
              Matches
            </TabsTrigger>
            <TabsTrigger
              value="horoscope"
              className="flex items-center gap-2"
              disabled={!userProfile.optInAstrology || !userProfile.birthDate}
            >
              <Moon size={16} />
              Horoscope
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User size={16} />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="space-y-4">
            {isLoadingMatches ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6">
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
              <Card className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Sparkle size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No matches yet</h3>
                <p className="text-muted-foreground mb-4">
                  No profiles exceeded the 70% compatibility threshold.
                </p>
                <Button onClick={handleEditProfile} variant="outline">
                  Update Your Profile
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="horoscope">
            {userProfile.optInAstrology && userProfile.birthDate ? (
              <HoroscopeView birthDate={userProfile.birthDate} matches={qualifiedMatches.map(m => m.match)} />
            ) : (
              <Card className="p-12 text-center">
                <Moon size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold mb-2">Astrology Not Enabled</h3>
                <p className="text-muted-foreground mb-4">
                  Enable astrology in your profile to access horoscopes and synastry readings.
                </p>
                <Button onClick={handleEditProfile}>Update Profile</Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Your Profile</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Name</h4>
                  <p>{userProfile.name}</p>
                </div>

                {userProfile.bio && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Bio</h4>
                    <p className="text-sm">{userProfile.bio}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Values</h4>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.values.map((value) => (
                      <span key={value} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                        {value}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.interests.map((interest) => (
                      <span key={interest} className="px-2 py-1 bg-secondary/40 text-secondary-foreground rounded text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">Lifestyle</h4>
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
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Languages</h4>
                    <p className="text-sm">{userProfile.languages.join(', ')}</p>
                  </div>
                )}

                {userProfile.industry && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Industry</h4>
                    <p className="text-sm">{userProfile.industry}</p>
                  </div>
                )}

                {userProfile.workSchedule && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Work Schedule</h4>
                    <p className="text-sm">{userProfile.workSchedule}</p>
                  </div>
                )}

                {userProfile.education && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground mb-1">Education</h4>
                    <p className="text-sm">{userProfile.education}</p>
                  </div>
                )}

                <div className="pt-4 border-t flex gap-3">
                  <Button onClick={handleEditProfile} className="flex-1">
                    <PencilSimple className="mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteProfile}>
                    Delete Profile
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