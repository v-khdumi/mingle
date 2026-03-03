import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Heart, ArrowLeft, ArrowRight, Sparkle, ShieldCheck, Eye } from '@phosphor-icons/react';
import { MatchProfile, CompatibilityResult } from '@/lib/types';
import { getZodiacSign } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { motion, AnimatePresence } from 'framer-motion';

interface ExploreViewProps {
  matches: { match: MatchProfile; compatibility: CompatibilityResult }[];
  onViewDetails: (matchId: string) => void;
}

export function ExploreView({ matches, onViewDetails }: ExploreViewProps) {
  const { t } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  if (matches.length === 0) {
    return (
      <Card className="p-12 text-center glass-card rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
          <Sparkle size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold mb-2">{t.explore.noMoreProfiles}</h3>
        <p className="text-muted-foreground mb-4">{t.explore.noMoreProfilesDesc}</p>
      </Card>
    );
  }

  const currentMatch = matches[currentIndex];
  const { match, compatibility } = currentMatch;
  const scorePercent = Math.round(compatibility.score * 100);
  const zodiacSign = match.birthDate ? getZodiacSign(match.birthDate) : null;

  const goNext = () => {
    if (currentIndex < matches.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{t.explore.title}</h2>
          <p className="text-sm text-muted-foreground">{t.explore.subtitle}</p>
        </div>
        <span className="text-sm text-muted-foreground glass rounded-full px-3 py-1">
          {t.explore.profileOf(currentIndex + 1, matches.length)}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: 420 }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Card className="glass-accent rounded-2xl overflow-hidden">
              {/* Top gradient banner */}
              <div className="h-32 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 relative">
                <div className="absolute inset-0 glass-subtle" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-xl shadow-primary/30 border-4 border-white/50">
                    <User size={48} weight="duotone" />
                  </div>
                </div>
              </div>

              <div className="pt-16 pb-6 px-6 text-center">
                <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
                  {match.name}
                  {match.livenessVerified && (
                    <ShieldCheck size={20} weight="fill" className="text-green-600" />
                  )}
                </h3>
                {zodiacSign && (
                  <p className="text-sm text-muted-foreground mt-0.5">{zodiacSign}</p>
                )}
                {match.industry && (
                  <p className="text-sm text-muted-foreground">{match.industry}</p>
                )}

                {/* Compatibility score */}
                <div className="flex items-center justify-center gap-3 mt-4 mb-4">
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="5" className="text-muted" opacity={0.3} />
                      <circle
                        cx="40" cy="40" r="34"
                        fill="none" stroke="currentColor" strokeWidth="5"
                        strokeDasharray={`${2 * Math.PI * 34}`}
                        strokeDashoffset={`${2 * Math.PI * 34 * (1 - compatibility.score)}`}
                        className="text-accent transition-all duration-700"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold">{scorePercent}%</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{t.explore.compatibility}</p>
                    <p className="text-xs text-muted-foreground max-w-[180px] line-clamp-2">
                      {compatibility.explanation}
                    </p>
                  </div>
                </div>

                {match.bio && (
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{match.bio}</p>
                )}

                {/* Key factors */}
                <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                  {compatibility.keyFactors.map((factor, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>

                {/* Shared values & interests */}
                <div className="grid grid-cols-2 gap-3 text-left">
                  {match.values && match.values.length > 0 && (
                    <div className="p-3 glass rounded-xl">
                      <h4 className="text-xs font-semibold mb-1.5 text-muted-foreground">{t.explore.sharedValues}</h4>
                      <div className="flex flex-wrap gap-1">
                        {match.values.slice(0, 4).map((v) => (
                          <Badge key={v} variant="outline" className="text-xs">
                            {v}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {match.interests && match.interests.length > 0 && (
                    <div className="p-3 glass rounded-xl">
                      <h4 className="text-xs font-semibold mb-1.5 text-muted-foreground">{t.explore.sharedInterests}</h4>
                      <div className="flex flex-wrap gap-1">
                        {match.interests.slice(0, 4).map((i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {i}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  className="mt-4 w-full bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20"
                  onClick={() => onViewDetails(match.id)}
                >
                  <Eye size={16} className="mr-1.5" weight="bold" />
                  {t.explore.viewDetails}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="glass rounded-full w-12 h-12 p-0"
        >
          <ArrowLeft size={20} />
        </Button>

        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {matches.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'bg-accent w-6'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={goNext}
          disabled={currentIndex === matches.length - 1}
          className="glass rounded-full w-12 h-12 p-0"
        >
          <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
}
