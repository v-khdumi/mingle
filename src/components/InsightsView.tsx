import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, ArrowsClockwise, Target, TrendUp, ChatCircleDots, Coffee, Heart, Star } from '@phosphor-icons/react';
import { generateDatingTips, generateRelationshipInsight } from '@/lib/ai';
import { UserProfile, DatingTip, RelationshipInsight } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface InsightsViewProps {
  userProfile: UserProfile;
}

const categoryIcons: Record<string, typeof ChatCircleDots> = {
  conversation: ChatCircleDots,
  firstDate: Coffee,
  relationship: Heart,
  selfGrowth: TrendUp,
};

const categoryColors: Record<string, string> = {
  conversation: 'from-blue-500 to-cyan-400',
  firstDate: 'from-orange-400 to-rose-400',
  relationship: 'from-pink-500 to-purple-500',
  selfGrowth: 'from-emerald-500 to-teal-400',
};

export function InsightsView({ userProfile }: InsightsViewProps) {
  const { t } = useI18n();
  const [tips, setTips] = useState<DatingTip[]>([]);
  const [insight, setInsight] = useState<RelationshipInsight | null>(null);
  const [isLoadingTips, setIsLoadingTips] = useState(false);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  useEffect(() => {
    loadTips();
    loadInsight();
  }, []);

  const loadTips = async () => {
    setIsLoadingTips(true);
    try {
      const newTips = await generateDatingTips(userProfile);
      setTips(newTips);
    } catch (error) {
      toast.error(t.insights.failedTips);
    } finally {
      setIsLoadingTips(false);
    }
  };

  const loadInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const newInsight = await generateRelationshipInsight(userProfile);
      setInsight(newInsight);
    } catch (error) {
      toast.error(t.insights.failedInsight);
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'conversation': return t.insights.categoryConversation;
      case 'firstDate': return t.insights.categoryFirstDate;
      case 'relationship': return t.insights.categoryRelationship;
      case 'selfGrowth': return t.insights.categorySelfGrowth;
      default: return cat;
    }
  };

  return (
    <div className="space-y-6">
      {/* Relationship Profile Insight */}
      <Card className="p-6 glass-accent rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/20 to-transparent rounded-bl-full" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Star size={24} weight="duotone" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{t.insights.profileInsight}</h2>
                <p className="text-sm text-muted-foreground">{t.insights.profileInsightDesc}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadInsight}
              disabled={isLoadingInsight}
              className="glass rounded-full"
            >
              <ArrowsClockwise size={16} className={isLoadingInsight ? 'animate-spin' : ''} />
            </Button>
          </div>

          {isLoadingInsight ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            </div>
          ) : insight ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {insight.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 glass rounded-xl">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <TrendUp size={14} className="text-green-600" />
                    {t.insights.strengths}
                  </h4>
                  <ul className="space-y-1">
                    {insight.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                        <span className="text-green-500 mt-0.5">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 glass rounded-xl">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <Target size={14} className="text-amber-600" />
                    {t.insights.growthAreas}
                  </h4>
                  <ul className="space-y-1">
                    {insight.growthAreas.map((g, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                        <span className="text-amber-500 mt-0.5">→</span>
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                <h4 className="text-sm font-semibold mb-1 flex items-center gap-1.5">
                  <Lightbulb size={14} className="text-primary" />
                  {t.insights.weeklyChallenge}
                </h4>
                <p className="text-sm">{insight.weeklyChallenge}</p>
              </div>
            </motion.div>
          ) : null}
        </div>
      </Card>

      {/* Dating Tips */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{t.insights.tipsTitle}</h2>
            <p className="text-sm text-muted-foreground">{t.insights.tipsSubtitle}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadTips}
            disabled={isLoadingTips}
            className="glass"
          >
            <ArrowsClockwise size={14} className={`mr-1.5 ${isLoadingTips ? 'animate-spin' : ''}`} />
            {t.insights.refreshTips}
          </Button>
        </div>

        {isLoadingTips ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-5 glass-card rounded-2xl">
                <Skeleton className="h-5 w-1/3 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-4/5" />
              </Card>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tips.map(t => t.id).join(',')}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.08 } },
              }}
            >
              {tips.map((tip) => {
                const Icon = categoryIcons[tip.category] || Lightbulb;
                const gradientClass = categoryColors[tip.category] || 'from-primary to-accent';
                return (
                  <motion.div
                    key={tip.id}
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <Card className="p-5 glass-card rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 h-full">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white flex-shrink-0 shadow-md`}>
                          <Icon size={20} weight="duotone" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {getCategoryLabel(tip.category)}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-sm mb-1.5">
                            {tip.emoji} {tip.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {tip.content}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
