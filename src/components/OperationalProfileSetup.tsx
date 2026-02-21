import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  Activity,
  Wind,
  User,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  AlertTriangle,
  Loader2,
  X,
  Target
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OperationalProfileSetupProps {
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
  { value: 'sedentary', label: 'Low Intensity', desc: 'Minimal physical exertion' },
  { value: 'light', label: 'Standard load', desc: 'Standard operational cycles' },
  { value: 'moderate', label: 'Active Deployment', desc: 'Sustained industrial activity' },
  { value: 'active', label: 'High Performance', desc: 'Intense operational demands' },
  { value: 'athlete', label: 'Peak Capacity', desc: 'Extreme physical output requirements' },
];

const smokingStatuses = [
  { value: 'never', label: 'Filtered Environment' },
  { value: 'former', label: 'Legacy Exposure' },
  { value: 'current', label: 'Active Load' },
];

const sensitivities = [
  { value: 'low', label: 'Resilient', desc: 'High tolerance to atmospheric load' },
  { value: 'normal', label: 'Standard', desc: 'Baseline atmospheric interaction' },
  { value: 'high', label: 'Sensitive', desc: 'Noticeable impact from load spikes' },
  { value: 'very_high', label: 'Critical', desc: 'Strategic requirements for load management' },
];

const operationalConditions = [
  { value: 'asthma', label: 'Resp. Sensitivity' },
  { value: 'copd', label: 'Load Limitation' },
  { value: 'heart_disease', label: 'CV Intensity' },
  { value: 'allergies', label: 'Particulate Reaction' },
  { value: 'diabetes', label: 'Metabolic Focus' },
  { value: 'none', label: 'Nominal Profile' },
];

export const OperationalProfileSetup = ({ onComplete, onSkip }: OperationalProfileSetupProps) => {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [profile, setProfile] = useState({
    age_range: '',
    activity_level: '',
    smoking_status: 'never',
    air_sensitivity: 'normal',
    operational_conditions: [] as string[],
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  // Load existing profile on mount
  useEffect(() => {
    const loadExistingProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('operational_profile')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading operational profile:', error);
        } else if (data?.operational_profile) {
          const existingProfile = data.operational_profile as any;
          setProfile({
            age_range: existingProfile.age_range || '',
            activity_level: existingProfile.activity_level || '',
            smoking_status: existingProfile.smoking_status || 'never',
            air_sensitivity: existingProfile.air_sensitivity || 'normal',
            operational_conditions: existingProfile.operational_conditions || [],
          });
          console.log('Loaded existing operational profile:', existingProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingProfile();
  }, [user]);

  const handleConditionToggle = (condition: string) => {
    if (condition === 'none') {
      setProfile(p => ({ ...p, operational_conditions: ['none'] }));
    } else {
      setProfile(p => ({
        ...p,
        operational_conditions: p.operational_conditions.includes(condition)
          ? p.operational_conditions.filter(c => c !== condition)
          : [...p.operational_conditions.filter(c => c !== 'none'), condition]
      }));
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!profile.age_range;
      case 2: return !!profile.activity_level;
      case 3: return !!profile.smoking_status;
      case 4: return !!profile.air_sensitivity;
      case 5: return profile.operational_conditions.length > 0;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save your operational profile.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Saving operational profile:', profile);

      const { data, error } = await supabase
        .from('profiles')
        .update({
          operational_profile: profile,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Profile saved successfully:', data);
      await refreshProfile();

      toast({
        title: "✅ Operational Profile Active!",
        description: `Deployment parameters configured. Age: ${profile.age_range}, Load: ${profile.activity_level}`,
      });

      onComplete();
    } catch (error: any) {
      console.error('Error saving operational profile:', error);
      toast({
        title: "❌ Config Failed",
        description: error.message || "Failed to save operational profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 z-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-400 mx-auto mb-4" />
          <p className="text-white/60">Loading operational profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[1200px] h-[1200px] bg-indigo-500/10 rounded-full blur-[180px] animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[1200px] h-[1200px] bg-rose-500/5 rounded-full blur-[180px] animate-pulse-slow delay-1000" />
      </div>

      <Card className="relative max-w-2xl w-full bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-500/20">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Operational Profile</h2>
                <p className="text-sm text-slate-400 font-medium">Configure deployment metrics</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSkip}
              className="hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${s < step ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' :
                  s === step ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 scale-110' :
                    'bg-white/5 text-slate-500 border border-white/10'
                  }`}>
                  {s < step ? <Check className="w-5 h-5" /> : s}
                </div>
                {s < 5 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${s < step ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-white/10'
                    }`} />
                )}
              </div>
            ))}
          </div>

          <Progress value={progress} className="h-2 bg-white/5" />
        </div>

        <div className="p-8 min-h-[400px]">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl mb-4">
                  <User className="w-16 h-16 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Age Range</h3>
                <p className="text-slate-400">Baseline demographics for resilience assessment</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {ageRanges.map(age => (
                  <Button
                    key={age.value}
                    variant={profile.age_range === age.value ? 'default' : 'outline'}
                    className={`h-16 text-lg font-semibold transition-all duration-300 ${profile.age_range === age.value
                      ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 border-0 shadow-lg shadow-indigo-500/30 scale-105'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105'
                      }`}
                    onClick={() => setProfile(p => ({ ...p, age_range: age.value }))}
                  >
                    {age.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl mb-4">
                  <Activity className="w-16 h-16 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Operational Intensity</h3>
                <p className="text-slate-400">Cycle complexity affects atmospheric interaction</p>
              </div>
              <div className="space-y-3">
                {activityLevels.map(level => (
                  <button
                    key={level.value}
                    className={`w-full p-5 rounded-2xl border text-left transition-all duration-300 ${profile.activity_level === level.value
                      ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]'
                      }`}
                    onClick={() => setProfile(p => ({ ...p, activity_level: level.value }))}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-lg">{level.label}</p>
                        <p className="text-sm text-slate-400">{level.desc}</p>
                      </div>
                      {profile.activity_level === level.value && (
                        <Check className="w-6 h-6 text-emerald-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl mb-4">
                  <Wind className="w-16 h-16 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Inhalation Environment</h3>
                <p className="text-slate-400">Strategic respiratory load assessment</p>
              </div>
              <div className="space-y-3">
                {smokingStatuses.map(status => (
                  <button
                    key={status.value}
                    className={`w-full p-5 rounded-2xl border text-left transition-all duration-300 ${profile.smoking_status === status.value
                      ? 'border-blue-500/50 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 shadow-lg shadow-blue-500/20 scale-[1.02]'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]'
                      }`}
                    onClick={() => setProfile(p => ({ ...p, smoking_status: status.value }))}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white text-lg">{status.label}</p>
                      {profile.smoking_status === status.value && (
                        <Check className="w-6 h-6 text-blue-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl mb-4">
                  <AlertTriangle className="w-16 h-16 text-amber-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Load Sensitivity</h3>
                <p className="text-slate-400">Industrial tolerance to atmospheric variance</p>
              </div>
              <div className="space-y-3">
                {sensitivities.map(sens => (
                  <button
                    key={sens.value}
                    className={`w-full p-5 rounded-2xl border text-left transition-all duration-300 ${profile.air_sensitivity === sens.value
                      ? 'border-amber-500/50 bg-gradient-to-r from-amber-500/20 to-orange-500/20 shadow-lg shadow-amber-500/20 scale-[1.02]'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]'
                      }`}
                    onClick={() => setProfile(p => ({ ...p, air_sensitivity: sens.value }))}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-lg">{sens.label}</p>
                        <p className="text-sm text-slate-400">{sens.desc}</p>
                      </div>
                      {profile.air_sensitivity === sens.value && (
                        <Check className="w-6 h-6 text-amber-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl mb-4">
                  <Sparkles className="w-16 h-16 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Operational Limitations</h3>
                <p className="text-slate-400">Select all that apply to specific resilience profiling</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {operationalConditions.map(condition => (
                  <button
                    key={condition.value}
                    className={`p-5 rounded-2xl border text-center transition-all duration-300 ${profile.operational_conditions.includes(condition.value)
                      ? 'border-purple-500/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20 scale-[1.02]'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]'
                      }`}
                    onClick={() => handleConditionToggle(condition.value)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="font-bold text-white text-sm">{condition.label}</span>
                      {profile.operational_conditions.includes(condition.value) && (
                        <Check className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 flex items-center justify-between bg-white/5">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={() => setStep(s => s - 1)}
              className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:shadow-none"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Finalize Config
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
