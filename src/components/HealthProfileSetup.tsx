import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Activity, 
  Wind, 
  User, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Sparkles,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HealthProfileSetupProps {
  onComplete: () => void;
  onSkip: () => void;
}

const ageRanges = [
  { value: '18-24', label: '18-24' },
  { value: '25-34', label: '25-34' },
  { value: '35-44', label: '35-44' },
  { value: '45-54', label: '45-54' },
  { value: '55-64', label: '55-64' },
  { value: '65+', label: '65+' },
];

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little to no exercise' },
  { value: 'light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
  { value: 'active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
  { value: 'athlete', label: 'Athlete', desc: 'Very intense exercise daily' },
];

const smokingStatuses = [
  { value: 'never', label: 'Never Smoked' },
  { value: 'former', label: 'Former Smoker' },
  { value: 'current', label: 'Current Smoker' },
];

const sensitivities = [
  { value: 'low', label: 'Low', desc: 'I rarely notice air quality changes' },
  { value: 'normal', label: 'Normal', desc: 'I notice when air quality is particularly bad' },
  { value: 'high', label: 'High', desc: 'I\'m sensitive to air quality changes' },
  { value: 'very_high', label: 'Very High', desc: 'I have respiratory conditions affected by air quality' },
];

const healthConditions = [
  { value: 'asthma', label: 'Asthma' },
  { value: 'copd', label: 'COPD' },
  { value: 'heart_disease', label: 'Heart Disease' },
  { value: 'allergies', label: 'Allergies' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'none', label: 'None of the above' },
];

export const HealthProfileSetup = ({ onComplete, onSkip }: HealthProfileSetupProps) => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [profile, setProfile] = useState({
    age_range: '',
    activity_level: '',
    smoking_status: 'never',
    air_sensitivity: 'normal',
    health_conditions: [] as string[],
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleConditionToggle = (condition: string) => {
    if (condition === 'none') {
      setProfile(p => ({ ...p, health_conditions: ['none'] }));
    } else {
      setProfile(p => ({
        ...p,
        health_conditions: p.health_conditions.includes(condition)
          ? p.health_conditions.filter(c => c !== condition)
          : [...p.health_conditions.filter(c => c !== 'none'), condition]
      }));
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!profile.age_range;
      case 2: return !!profile.activity_level;
      case 3: return !!profile.smoking_status;
      case 4: return !!profile.air_sensitivity;
      case 5: return profile.health_conditions.length > 0;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          health_profile: profile,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "Health profile saved!",
        description: "Your personalized health tracking is now active."
      });
      
      onComplete();
    } catch (error) {
      console.error('Error saving health profile:', error);
      toast({
        title: "Error",
        description: "Failed to save health profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="glass max-w-lg w-full">
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Health Profile Setup</h2>
                <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Age Range */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <User className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold">What's your age range?</h3>
                <p className="text-sm text-muted-foreground">This helps us personalize health recommendations</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {ageRanges.map(age => (
                  <Button
                    key={age.value}
                    variant={profile.age_range === age.value ? 'default' : 'outline'}
                    className="h-14"
                    onClick={() => setProfile(p => ({ ...p, age_range: age.value }))}
                  >
                    {age.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Activity Level */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Activity className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold">How active are you?</h3>
                <p className="text-sm text-muted-foreground">Your activity level affects air quality exposure</p>
              </div>
              <div className="space-y-3">
                {activityLevels.map(level => (
                  <button
                    key={level.value}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      profile.activity_level === level.value 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border/50 hover:border-border'
                    }`}
                    onClick={() => setProfile(p => ({ ...p, activity_level: level.value }))}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{level.label}</p>
                        <p className="text-sm text-muted-foreground">{level.desc}</p>
                      </div>
                      {profile.activity_level === level.value && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Smoking Status */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Wind className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold">Smoking status?</h3>
                <p className="text-sm text-muted-foreground">Important for respiratory health assessment</p>
              </div>
              <div className="space-y-3">
                {smokingStatuses.map(status => (
                  <button
                    key={status.value}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      profile.smoking_status === status.value 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border/50 hover:border-border'
                    }`}
                    onClick={() => setProfile(p => ({ ...p, smoking_status: status.value }))}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{status.label}</p>
                      {profile.smoking_status === status.value && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Air Quality Sensitivity */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <AlertTriangle className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold">Air quality sensitivity?</h3>
                <p className="text-sm text-muted-foreground">How much does air quality affect you?</p>
              </div>
              <div className="space-y-3">
                {sensitivities.map(sens => (
                  <button
                    key={sens.value}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      profile.air_sensitivity === sens.value 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border/50 hover:border-border'
                    }`}
                    onClick={() => setProfile(p => ({ ...p, air_sensitivity: sens.value }))}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{sens.label}</p>
                        <p className="text-sm text-muted-foreground">{sens.desc}</p>
                      </div>
                      {profile.air_sensitivity === sens.value && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Health Conditions */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <Sparkles className="w-12 h-12 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold">Any health conditions?</h3>
                <p className="text-sm text-muted-foreground">Select all that apply</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {healthConditions.map(condition => (
                  <button
                    key={condition.value}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      profile.health_conditions.includes(condition.value) 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border/50 hover:border-border'
                    }`}
                    onClick={() => handleConditionToggle(condition.value)}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {profile.health_conditions.includes(condition.value) && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                      <span className="font-medium">{condition.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/50 flex items-center justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(s => s - 1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          ) : (
            <div />
          )}
          
          {step < totalSteps ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Complete Setup
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
