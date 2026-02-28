import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Moon, Sparkle } from '@phosphor-icons/react';
import { generateDailyHoroscope, generateSynastry } from '@/lib/ai';
import { HoroscopeReading, SynastryReading, MatchProfile } from '@/lib/types';
import { useI18n } from '@/lib/i18n';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HoroscopeViewProps {
  birthDate: string;
  matches: MatchProfile[];
}

export function HoroscopeView({ birthDate, matches }: HoroscopeViewProps) {
  const { t } = useI18n();
  const [horoscope, setHoroscope] = useState<HoroscopeReading | null>(null);
  const [synastry, setSynastry] = useState<SynastryReading | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSynastryLoading, setIsSynastryLoading] = useState(false);

  useEffect(() => {
    loadHoroscope();
  }, [birthDate]);

  const loadHoroscope = async () => {
    setIsLoading(true);
    try {
      const reading = await generateDailyHoroscope(birthDate);
      setHoroscope(reading);
    } catch (error) {
      toast.error(t.horoscope.failedLoad);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSynastry = async () => {
    const match = matches.find((m) => m.id === selectedMatchId);
    if (!match?.birthDate) {
      toast.error(t.horoscope.noBirthDate);
      return;
    }

    setIsSynastryLoading(true);
    try {
      const reading = await generateSynastry(birthDate, match.birthDate);
      setSynastry(reading);
    } catch (error) {
      toast.error(t.horoscope.failedSynastry);
    } finally {
      setIsSynastryLoading(false);
    }
  };

  const matchesWithBirthDate = matches.filter((m) => m.birthDate);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
            <Moon size={24} weight="duotone" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{t.horoscope.dailyTitle}</h2>
            {horoscope && (
              <p className="text-sm text-muted-foreground">
                {horoscope.sign} - {new Date(horoscope.date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : horoscope ? (
          <p className="text-foreground leading-relaxed">{horoscope.reading}</p>
        ) : null}
      </Card>

      {matchesWithBirthDate.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-white">
              <Sparkle size={24} weight="duotone" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t.horoscope.synastryTitle}</h2>
              <p className="text-sm text-muted-foreground">
                {t.horoscope.synastryDesc}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t.horoscope.selectMatch} />
                </SelectTrigger>
                <SelectContent>
                  {matchesWithBirthDate.map((match) => (
                    <SelectItem key={match.id} value={match.id}>
                      {match.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={loadSynastry}
                disabled={!selectedMatchId || isSynastryLoading}
              >
                {isSynastryLoading ? t.horoscope.reading : t.horoscope.readSynastry}
              </Button>
            </div>

            {synastry && (
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-muted-foreground">
                    {synastry.userSign} + {synastry.matchSign}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      synastry.compatibility === 'Excellent'
                        ? 'bg-accent/20 text-accent'
                        : synastry.compatibility === 'Good'
                        ? 'bg-secondary/40 text-secondary-foreground'
                        : synastry.compatibility === 'Moderate'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-destructive/20 text-destructive'
                    }`}
                  >
                    {synastry.compatibility}
                  </div>
                </div>
                <p className="text-foreground leading-relaxed">{synastry.explanation}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
