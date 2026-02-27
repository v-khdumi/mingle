import { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, X, Plus } from '@phosphor-icons/react';

interface ProfileFormProps {
  initialProfile?: UserProfile;
  onComplete: (profile: UserProfile) => void;
}

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
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>(
    initialProfile || {
      values: [],
      interests: [],
      lifestyle: [],
      languages: [],
      optInAstrology: false,
      optInAttractiveness: false,
      optInSalary: false,
    }
  );

  const totalSteps = 4;
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
        return profile.name && profile.name.trim().length > 0;
      case 2:
        return (profile.values?.length || 0) >= 2 && (profile.interests?.length || 0) >= 2;
      case 3:
        return (profile.lifestyle?.length || 0) >= 1 && (profile.languages?.length || 0) >= 1;
      default:
        return true;
    }
  };

  const handleSubmit = () => {
    if (canProceed()) {
      onComplete(profile as UserProfile);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Progress value={progress} className="h-2 mb-2" />
        <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
      </div>

      <Card className="p-8">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Mingle</h2>
              <p className="text-muted-foreground">Let's start by getting to know you</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">What's your name?</Label>
                <Input
                  id="name"
                  value={profile.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Your name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="bio">Short bio (optional)</Label>
                <Textarea
                  id="bio"
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us a bit about yourself..."
                  className="mt-2 min-h-24"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {(profile.bio || '').length}/200 characters
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Values & Interests</h2>
              <p className="text-muted-foreground">Select at least 2 of each</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Your Core Values</Label>
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
                      {value}
                      {profile.values?.includes(value) && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {profile.values?.length || 0}
                </p>
              </div>

              <div>
                <Label>Your Interests</Label>
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
                      {interest}
                      {profile.interests?.includes(interest) && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {profile.interests?.length || 0}
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Lifestyle & Work</h2>
              <p className="text-muted-foreground">Help us understand your day-to-day</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Lifestyle Traits</Label>
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
                      {trait}
                      {profile.lifestyle?.includes(trait) && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="workSchedule">Work Schedule (optional)</Label>
                <Select
                  value={profile.workSchedule || ''}
                  onValueChange={(value) => setProfile({ ...profile, workSchedule: value })}
                >
                  <SelectTrigger id="workSchedule" className="mt-2">
                    <SelectValue placeholder="Select your schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular hours (9-5)">Regular hours (9-5)</SelectItem>
                    <SelectItem value="Flexible (9-6 with remote options)">Flexible</SelectItem>
                    <SelectItem value="Shifts (variable)">Shifts</SelectItem>
                    <SelectItem value="Project-based">Project-based</SelectItem>
                    <SelectItem value="Irregular (startup life)">Irregular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="industry">Industry (optional)</Label>
                <Input
                  id="industry"
                  value={profile.industry || ''}
                  onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                  placeholder="e.g., Technology, Healthcare, Education"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="education">Education (optional)</Label>
                <Select
                  value={profile.education || ''}
                  onValueChange={(value) => setProfile({ ...profile, education: value })}
                >
                  <SelectTrigger id="education" className="mt-2">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High School">High School</SelectItem>
                    <SelectItem value="Bachelor's Degree">Bachelor's Degree</SelectItem>
                    <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="language-input">Languages Spoken</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="language-input"
                    placeholder="Add a language"
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

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Optional Details</h2>
              <p className="text-muted-foreground">These help improve match quality</p>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="optInAstrology"
                    checked={profile.optInAstrology}
                    onChange={(e) =>
                      setProfile({ ...profile, optInAstrology: e.target.checked })
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="optInAstrology" className="cursor-pointer font-medium">
                      Include Astrology
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get compatibility insights based on zodiac signs
                    </p>
                  </div>
                </div>

                {profile.optInAstrology && (
                  <div>
                    <Label htmlFor="birthDate">Birth Date</Label>
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

              <div>
                <Label htmlFor="height">Height (optional)</Label>
                <Input
                  id="height"
                  value={profile.height || ''}
                  onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                  placeholder="e.g., 175cm"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="dietaryPreferences">Dietary Preferences (optional)</Label>
                <Select
                  value={profile.dietaryPreferences || ''}
                  onValueChange={(value) =>
                    setProfile({ ...profile, dietaryPreferences: value })
                  }
                >
                  <SelectTrigger id="dietaryPreferences" className="mt-2">
                    <SelectValue placeholder="Select dietary preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No restrictions">No restrictions</SelectItem>
                    <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="Vegan">Vegan</SelectItem>
                    <SelectItem value="Pescatarian">Pescatarian</SelectItem>
                    <SelectItem value="Flexitarian">Flexitarian</SelectItem>
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
                      Include Salary Range
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Optional, kept private, only for compatibility
                    </p>
                  </div>
                </div>

                {profile.optInSalary && (
                  <div>
                    <Label htmlFor="salaryRange">Salary Range</Label>
                    <Input
                      id="salaryRange"
                      value={profile.salaryRange || ''}
                      onChange={(e) => setProfile({ ...profile, salaryRange: e.target.value })}
                      placeholder="e.g., €40k-60k"
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}

          {step < totalSteps ? (
            <Button
              className="ml-auto"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Continue <ArrowRight className="ml-2" />
            </Button>
          ) : (
            <Button
              className="ml-auto bg-gradient-to-r from-primary to-accent"
              onClick={handleSubmit}
              disabled={!canProceed()}
            >
              Find Matches <ArrowRight className="ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}