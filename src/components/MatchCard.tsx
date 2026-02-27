import { useState } from 'react';
import { MatchProfile, CompatibilityResult } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Heart, Sparkle, ChatCircle, User, ShieldCheck } from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { getZodiacSign } from '@/lib/sampleData';
import { generateIcebreaker } from '@/lib/ai';
import { UserProfile } from '@/lib/types';
import { toast } from 'sonner';

interface MatchCardProps {
  match: MatchProfile;
  compatibility: CompatibilityResult;
  userProfile: UserProfile;
}

export function MatchCard({ match, compatibility, userProfile }: MatchCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [icebreaker, setIcebreaker] = useState<string | null>(null);
  const [isLoadingIcebreaker, setIsLoadingIcebreaker] = useState(false);

  const scorePercent = Math.round(compatibility.score * 100);
  const zodiacSign = match.birthDate ? getZodiacSign(match.birthDate) : null;

  const handleGenerateIcebreaker = async () => {
    setIsLoadingIcebreaker(true);
    try {
      const message = await generateIcebreaker(userProfile, match);
      setIcebreaker(message);
      toast.success('Icebreaker generated!');
    } catch (error) {
      toast.error('Failed to generate icebreaker');
    } finally {
      setIsLoadingIcebreaker(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-accent/50"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white flex-shrink-0">
              <User size={40} weight="duotone" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {match.name}
                    {match.livenessVerified && (
                      <ShieldCheck size={18} weight="fill" className="text-green-600" title="Liveness Verified" />
                    )}
                    {zodiacSign && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {zodiacSign}
                      </span>
                    )}
                  </h3>
                  {match.industry && (
                    <p className="text-sm text-muted-foreground">{match.industry}</p>
                  )}
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-muted"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - compatibility.score)}`}
                        className="text-accent transition-all duration-800 animate-count-up"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold">{scorePercent}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Match</p>
                </div>
              </div>

              {match.bio && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{match.bio}</p>
              )}

              <div className="flex flex-wrap gap-1.5 mb-3">
                {compatibility.keyFactors.slice(0, 3).map((factor, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {factor}
                  </Badge>
                ))}
              </div>

              <p className="text-sm text-foreground/80 line-clamp-2">
                {compatibility.explanation}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                <User size={32} weight="duotone" />
              </div>
              <div>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  {match.name}
                  {match.livenessVerified && (
                    <ShieldCheck size={20} weight="fill" className="text-green-600" title="Liveness Verified" />
                  )}
                  {zodiacSign && (
                    <span className="text-base font-normal text-muted-foreground">
                      {zodiacSign}
                    </span>
                  )}
                </DialogTitle>
                {match.industry && (
                  <p className="text-sm text-muted-foreground">{match.industry}</p>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-muted"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - compatibility.score)}`}
                    className="text-accent"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{scorePercent}%</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">Compatibility Score</h4>
                <p className="text-sm text-muted-foreground">{compatibility.explanation}</p>
              </div>
            </div>

            {match.bio && (
              <div>
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Sparkle className="text-accent" />
                  About
                </h4>
                <p className="text-sm">{match.bio}</p>
              </div>
            )}

            <div>
              <h4 className="font-bold mb-2">Why This Match</h4>
              <div className="flex flex-wrap gap-2">
                {compatibility.keyFactors.map((factor, idx) => (
                  <Badge key={idx} variant="secondary">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>

            {match.values && match.values.length > 0 && (
              <div>
                <h4 className="font-bold mb-2">Values</h4>
                <div className="flex flex-wrap gap-2">
                  {match.values.map((value) => (
                    <Badge key={value} variant="outline">
                      {value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {match.interests && match.interests.length > 0 && (
              <div>
                <h4 className="font-bold mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {match.interests.map((interest) => (
                    <Badge key={interest} variant="outline">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {match.languages && match.languages.length > 0 && (
              <div>
                <h4 className="font-bold mb-2">Languages</h4>
                <p className="text-sm">{match.languages.join(', ')}</p>
              </div>
            )}

            {match.workSchedule && (
              <div>
                <h4 className="font-bold mb-2">Work Schedule</h4>
                <p className="text-sm">{match.workSchedule}</p>
              </div>
            )}

            {match.education && (
              <div>
                <h4 className="font-bold mb-2">Education</h4>
                <p className="text-sm">{match.education}</p>
              </div>
            )}

            <div className="border-t pt-4 space-y-3">
              {compatibility.score >= 0.70 ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 mb-2">
                  💬 Chat unlocked! Your compatibility score exceeds the 70% threshold.
                </div>
              ) : (
                <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground mb-2">
                  🔒 Chat is locked. A compatibility score above 70% is required to start a conversation.
                </div>
              )}
              <Button
                className="w-full bg-gradient-to-r from-primary to-accent"
                onClick={handleGenerateIcebreaker}
                disabled={isLoadingIcebreaker}
              >
                <ChatCircle className="mr-2" weight="bold" />
                {isLoadingIcebreaker ? 'Generating...' : 'Generate Icebreaker'}
              </Button>

              {icebreaker && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Suggested opening:</p>
                  <p className="text-sm italic">"{icebreaker}"</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}