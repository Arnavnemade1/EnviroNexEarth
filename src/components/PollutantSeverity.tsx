import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  AlertTriangle, AlertCircle, CheckCircle, XCircle, 
  Heart, Brain, Eye, Activity, Wind, 
  Skull, Shield, Info
} from 'lucide-react';

// Type definitions for pollutant guidelines
interface BaseGuideline {
  name: string;
  fullName: string;
  unit: string;
  epaGood: number;
  epaModerate: number;
  epaUnhealthy: number;
  epaVeryUnhealthy: number;
  epaHazardous: number;
  healthEffects: { organ: string; icon: string; effect: string }[];
  sources: string[];
}

interface PM25Guideline extends BaseGuideline {
  who24h: number;
  whoAnnual: number;
}

interface O3Guideline extends BaseGuideline {
  who8h: number;
}

interface NO2Guideline extends BaseGuideline {
  who24h: number;
  whoAnnual: number;
}

interface SO2Guideline extends BaseGuideline {
  who24h: number;
  who10min: number;
}

interface COGuideline extends BaseGuideline {
  who24h: number;
  who8h: number;
}

interface WHOGuidelinesType {
  pm25: PM25Guideline;
  o3: O3Guideline;
  no2: NO2Guideline;
  so2: SO2Guideline;
  co: COGuideline;
}

// WHO/EPA Air Quality Guidelines (μg/m³)
export const WHO_GUIDELINES: WHOGuidelinesType = {
  pm25: {
    name: 'PM2.5',
    fullName: 'Fine Particulate Matter',
    unit: 'μg/m³',
    who24h: 15,
    whoAnnual: 5,
    epaGood: 12,
    epaModerate: 35.4,
    epaUnhealthy: 55.4,
    epaVeryUnhealthy: 150.4,
    epaHazardous: 250.4,
    healthEffects: [
      { organ: 'Lungs', icon: 'lung', effect: 'Penetrates deep into airways, causes inflammation' },
      { organ: 'Heart', icon: 'heart', effect: 'Increases cardiovascular disease risk by 8-18%' },
      { organ: 'Brain', icon: 'brain', effect: 'Linked to cognitive decline and dementia' }
    ],
    sources: ['Vehicle exhaust', 'Industrial emissions', 'Wildfires', 'Cooking']
  },
  o3: {
    name: 'O₃',
    fullName: 'Ground-level Ozone',
    unit: 'μg/m³',
    who8h: 100,
    epaGood: 54,
    epaModerate: 70,
    epaUnhealthy: 85,
    epaVeryUnhealthy: 105,
    epaHazardous: 200,
    healthEffects: [
      { organ: 'Lungs', icon: 'lung', effect: 'Triggers asthma attacks, reduces lung function' },
      { organ: 'Airways', icon: 'activity', effect: 'Causes chest pain and shortness of breath' },
      { organ: 'Immune', icon: 'shield', effect: 'Increases susceptibility to infections' }
    ],
    sources: ['Formed from NOx + VOCs in sunlight', 'Vehicle emissions', 'Industrial processes']
  },
  no2: {
    name: 'NO₂',
    fullName: 'Nitrogen Dioxide',
    unit: 'μg/m³',
    who24h: 25,
    whoAnnual: 10,
    epaGood: 53,
    epaModerate: 100,
    epaUnhealthy: 360,
    epaVeryUnhealthy: 649,
    epaHazardous: 1249,
    healthEffects: [
      { organ: 'Lungs', icon: 'lung', effect: 'Irritates airways, worsens asthma by 40%' },
      { organ: 'Growth', icon: 'activity', effect: 'Reduces lung development in children' },
      { organ: 'Immune', icon: 'shield', effect: 'Increases respiratory infection risk' }
    ],
    sources: ['Vehicle exhaust', 'Power plants', 'Gas stoves', 'Industrial boilers']
  },
  so2: {
    name: 'SO₂',
    fullName: 'Sulfur Dioxide',
    unit: 'μg/m³',
    who24h: 40,
    who10min: 500,
    epaGood: 35,
    epaModerate: 75,
    epaUnhealthy: 185,
    epaVeryUnhealthy: 304,
    epaHazardous: 604,
    healthEffects: [
      { organ: 'Lungs', icon: 'lung', effect: 'Bronchoconstriction within 10 minutes of exposure' },
      { organ: 'Eyes', icon: 'eye', effect: 'Eye and throat irritation' },
      { organ: 'Heart', icon: 'heart', effect: 'Aggravates cardiovascular conditions' }
    ],
    sources: ['Coal power plants', 'Oil refineries', 'Volcanic emissions', 'Shipping']
  },
  co: {
    name: 'CO',
    fullName: 'Carbon Monoxide',
    unit: 'mg/m³',
    who24h: 4,
    who8h: 10,
    epaGood: 4.4,
    epaModerate: 9.4,
    epaUnhealthy: 12.4,
    epaVeryUnhealthy: 15.4,
    epaHazardous: 30.4,
    healthEffects: [
      { organ: 'Blood', icon: 'heart', effect: 'Reduces oxygen delivery to organs' },
      { organ: 'Brain', icon: 'brain', effect: 'Causes headaches, dizziness, confusion' },
      { organ: 'Heart', icon: 'heart', effect: 'Dangerous for heart disease patients' }
    ],
    sources: ['Vehicle exhaust', 'Gas heaters', 'Fires', 'Tobacco smoke']
  }
};

export type PollutantType = keyof WHOGuidelinesType;

export interface SeverityLevel {
  level: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: typeof CheckCircle;
  description: string;
  recommendation: string;
}

export const SEVERITY_LEVELS: Record<string, SeverityLevel> = {
  good: {
    level: 'good',
    label: 'Good',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: CheckCircle,
    description: 'Air quality is satisfactory',
    recommendation: 'Ideal for outdoor activities'
  },
  moderate: {
    level: 'moderate',
    label: 'Moderate',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    icon: AlertCircle,
    description: 'Acceptable for most individuals',
    recommendation: 'Unusually sensitive people should reduce prolonged outdoor exertion'
  },
  unhealthy_sensitive: {
    level: 'unhealthy_sensitive',
    label: 'Unhealthy for Sensitive Groups',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    icon: AlertTriangle,
    description: 'May cause effects for sensitive groups',
    recommendation: 'Children, elderly, and those with respiratory conditions should limit outdoor exertion'
  },
  unhealthy: {
    level: 'unhealthy',
    label: 'Unhealthy',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    icon: AlertTriangle,
    description: 'Everyone may begin to experience effects',
    recommendation: 'Everyone should reduce prolonged outdoor exertion'
  },
  very_unhealthy: {
    level: 'very_unhealthy',
    label: 'Very Unhealthy',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    icon: XCircle,
    description: 'Health alert - serious effects possible',
    recommendation: 'Everyone should avoid prolonged outdoor exertion'
  },
  hazardous: {
    level: 'hazardous',
    label: 'Hazardous',
    color: 'text-rose-600',
    bgColor: 'bg-rose-500/20',
    borderColor: 'border-rose-500/50',
    icon: Skull,
    description: 'Health emergency conditions',
    recommendation: 'Everyone should avoid all outdoor activity'
  }
};

// Get severity level based on pollutant type and value
export const getPollutantSeverity = (type: PollutantType, value: number): SeverityLevel => {
  const guidelines = WHO_GUIDELINES[type];
  
  if (type === 'pm25') {
    if (value <= guidelines.epaGood) return SEVERITY_LEVELS.good;
    if (value <= guidelines.epaModerate) return SEVERITY_LEVELS.moderate;
    if (value <= guidelines.epaUnhealthy) return SEVERITY_LEVELS.unhealthy_sensitive;
    if (value <= guidelines.epaVeryUnhealthy) return SEVERITY_LEVELS.unhealthy;
    if (value <= guidelines.epaHazardous) return SEVERITY_LEVELS.very_unhealthy;
    return SEVERITY_LEVELS.hazardous;
  }
  
  if (type === 'o3') {
    if (value <= guidelines.epaGood) return SEVERITY_LEVELS.good;
    if (value <= guidelines.epaModerate) return SEVERITY_LEVELS.moderate;
    if (value <= guidelines.epaUnhealthy) return SEVERITY_LEVELS.unhealthy_sensitive;
    if (value <= guidelines.epaVeryUnhealthy) return SEVERITY_LEVELS.unhealthy;
    if (value <= guidelines.epaHazardous) return SEVERITY_LEVELS.very_unhealthy;
    return SEVERITY_LEVELS.hazardous;
  }
  
  if (type === 'no2') {
    const no2Guide = WHO_GUIDELINES.no2;
    if (value <= no2Guide.whoAnnual) return SEVERITY_LEVELS.good;
    if (value <= no2Guide.who24h) return SEVERITY_LEVELS.moderate;
    if (value <= no2Guide.epaModerate) return SEVERITY_LEVELS.unhealthy_sensitive;
    if (value <= no2Guide.epaUnhealthy) return SEVERITY_LEVELS.unhealthy;
    return SEVERITY_LEVELS.very_unhealthy;
  }
  
  if (type === 'so2') {
    const so2Guide = WHO_GUIDELINES.so2;
    if (value <= guidelines.epaGood) return SEVERITY_LEVELS.good;
    if (value <= so2Guide.who24h) return SEVERITY_LEVELS.moderate;
    if (value <= guidelines.epaModerate) return SEVERITY_LEVELS.unhealthy_sensitive;
    if (value <= guidelines.epaUnhealthy) return SEVERITY_LEVELS.unhealthy;
    return SEVERITY_LEVELS.very_unhealthy;
  }
  
  // CO (values in mg/m³ typically, but we handle both)
  if (type === 'co') {
    const coGuide = WHO_GUIDELINES.co;
    const coVal = value > 100 ? value / 1000 : value;
    if (coVal <= coGuide.epaGood) return SEVERITY_LEVELS.good;
    if (coVal <= coGuide.epaModerate) return SEVERITY_LEVELS.moderate;
    if (coVal <= coGuide.epaUnhealthy) return SEVERITY_LEVELS.unhealthy_sensitive;
    if (coVal <= coGuide.epaVeryUnhealthy) return SEVERITY_LEVELS.unhealthy;
    return SEVERITY_LEVELS.very_unhealthy;
  }
  
  return SEVERITY_LEVELS.moderate;
};

// Get WHO limit for a pollutant type
const getWHOLimit = (type: PollutantType): number => {
  switch (type) {
    case 'pm25': return WHO_GUIDELINES.pm25.who24h;
    case 'o3': return WHO_GUIDELINES.o3.who8h;
    case 'no2': return WHO_GUIDELINES.no2.who24h;
    case 'so2': return WHO_GUIDELINES.so2.who24h;
    case 'co': return WHO_GUIDELINES.co.who8h * 1000;
  }
};

// Get percentage of WHO guideline exceeded
export const getWHOExceedance = (type: PollutantType, value: number): number => {
  const threshold = getWHOLimit(type);
  return Math.round((value / threshold) * 100);
};

// Get icon component for organ
const getOrganIcon = (icon: string) => {
  switch (icon) {
    case 'lung': return Activity;
    case 'heart': return Heart;
    case 'brain': return Brain;
    case 'eye': return Eye;
    case 'activity': return Activity;
    case 'shield': return Shield;
    default: return Activity;
  }
};

interface PollutantBadgeProps {
  type: PollutantType;
  value: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PollutantBadge = ({ type, value, showLabel = true, size = 'md' }: PollutantBadgeProps) => {
  const severity = getPollutantSeverity(type, value);
  const guidelines = WHO_GUIDELINES[type];
  const whoExceedance = getWHOExceedance(type, value);
  const SeverityIcon = severity.icon;
  const whoLimit = getWHOLimit(type);
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${severity.bgColor} ${severity.borderColor} ${severity.color} ${sizeClasses[size]} cursor-help`}
          >
            <SeverityIcon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} mr-1`} />
            {showLabel && <span className="mr-1">{guidelines.name}:</span>}
            <span className="font-bold">{value}</span>
            <span className="ml-0.5 opacity-70">{guidelines.unit}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs p-3 space-y-2">
          <div className="flex items-center gap-2">
            <SeverityIcon className={`w-5 h-5 ${severity.color}`} />
            <div>
              <p className="font-bold">{guidelines.fullName}</p>
              <p className={`text-xs ${severity.color}`}>{severity.label}</p>
            </div>
          </div>
          <div className="text-xs space-y-1">
            <p className="text-muted-foreground">{severity.description}</p>
            <div className="flex items-center gap-1 text-yellow-400">
              <AlertTriangle className="w-3 h-3" />
              <span>WHO Guideline: {whoLimit} {guidelines.unit}</span>
            </div>
            {whoExceedance > 100 && (
              <p className="text-red-400 font-medium">
                ⚠️ {whoExceedance - 100}% above WHO limit
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface PollutantDetailCardProps {
  type: PollutantType;
  value: number;
  showHealthEffects?: boolean;
  showSources?: boolean;
  compact?: boolean;
}

export const PollutantDetailCard = ({ 
  type, 
  value, 
  showHealthEffects = true, 
  showSources = false,
  compact = false 
}: PollutantDetailCardProps) => {
  const severity = getPollutantSeverity(type, value);
  const guidelines = WHO_GUIDELINES[type];
  const whoExceedance = getWHOExceedance(type, value);
  const SeverityIcon = severity.icon;
  
  const whoLimit = getWHOLimit(type);
  const progressValue = Math.min(100, (value / (whoLimit * 2)) * 100);
  
  if (compact) {
    return (
      <div className={`p-2 rounded-lg ${severity.bgColor} border ${severity.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SeverityIcon className={`w-4 h-4 ${severity.color}`} />
            <span className="text-xs font-medium">{guidelines.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${severity.color}`}>{value}</span>
            {whoExceedance > 100 && (
              <Badge variant="destructive" className="text-[9px] px-1 py-0">
                +{whoExceedance - 100}%
              </Badge>
            )}
          </div>
        </div>
        <Progress value={progressValue} className="h-1 mt-1" />
      </div>
    );
  }
  
  return (
    <Card className={`p-4 ${severity.bgColor} border ${severity.borderColor} space-y-3`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${severity.bgColor} border ${severity.borderColor} flex items-center justify-center`}>
            <SeverityIcon className={`w-5 h-5 ${severity.color}`} />
          </div>
          <div>
            <h4 className="font-bold text-foreground">{guidelines.fullName}</h4>
            <p className={`text-xs ${severity.color}`}>{severity.label}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${severity.color}`}>{value}</p>
          <p className="text-xs text-muted-foreground">{guidelines.unit}</p>
        </div>
      </div>
      
      {/* WHO Comparison Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">WHO Guideline: {whoLimit} {guidelines.unit}</span>
          <span className={whoExceedance > 100 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
            {whoExceedance > 100 ? `${whoExceedance - 100}% ABOVE` : `${100 - whoExceedance}% below`}
          </span>
        </div>
        <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
          <div 
            className={`absolute left-0 top-0 h-full transition-all duration-500 ${
              whoExceedance > 200 ? 'bg-gradient-to-r from-red-500 to-rose-600' :
              whoExceedance > 100 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
              'bg-gradient-to-r from-emerald-500 to-green-500'
            }`}
            style={{ width: `${Math.min(100, progressValue)}%` }}
          />
          <div className="absolute left-1/2 top-0 h-full w-0.5 bg-yellow-400" title="WHO Limit" />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0</span>
          <span className="text-yellow-400">WHO Limit</span>
          <span>2x Limit</span>
        </div>
      </div>
      
      {/* Health Effects */}
      {showHealthEffects && guidelines.healthEffects && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Heart className="w-3 h-3" /> Health Impacts
          </p>
          <div className="space-y-1">
            {guidelines.healthEffects.map((effect, i) => {
              const Icon = getOrganIcon(effect.icon);
              return (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Icon className={`w-3 h-3 mt-0.5 ${severity.color} shrink-0`} />
                  <span className="text-muted-foreground">
                    <span className="text-foreground font-medium">{effect.organ}:</span> {effect.effect}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Sources */}
      {showSources && guidelines.sources && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Wind className="w-3 h-3" /> Common Sources
          </p>
          <div className="flex flex-wrap gap-1">
            {guidelines.sources.map((source, i) => (
              <Badge key={i} variant="outline" className="text-[10px] bg-muted/20 border-border">
                {source}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Recommendation */}
      <div className={`p-2 rounded-lg ${severity.level === 'good' ? 'bg-emerald-500/20' : severity.level === 'moderate' ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
        <p className="text-xs text-foreground/80">
          <Shield className="w-3 h-3 inline mr-1" />
          {severity.recommendation}
        </p>
      </div>
    </Card>
  );
};

interface PollutantOverviewProps {
  pm25: number;
  o3: number;
  no2: number;
  so2: number;
  co?: number;
  variant?: 'compact' | 'detailed' | 'badges';
}

export const PollutantOverview = ({ pm25, o3, no2, so2, co, variant = 'compact' }: PollutantOverviewProps) => {
  const pollutants: { type: PollutantType; value: number }[] = [
    { type: 'pm25', value: pm25 },
    { type: 'o3', value: o3 },
    { type: 'no2', value: no2 },
    { type: 'so2', value: so2 },
    ...(co !== undefined ? [{ type: 'co' as PollutantType, value: co }] : [])
  ];
  
  // Find the worst pollutant
  const worstPollutant = pollutants.reduce((worst, current) => {
    const currentSeverity = getPollutantSeverity(current.type, current.value);
    const worstSeverity = getPollutantSeverity(worst.type, worst.value);
    const severityOrder = ['good', 'moderate', 'unhealthy_sensitive', 'unhealthy', 'very_unhealthy', 'hazardous'];
    return severityOrder.indexOf(currentSeverity.level) > severityOrder.indexOf(worstSeverity.level) 
      ? current : worst;
  }, pollutants[0]);
  
  const worstSeverity = getPollutantSeverity(worstPollutant.type, worstPollutant.value);
  
  if (variant === 'badges') {
    return (
      <div className="flex flex-wrap gap-2">
        {pollutants.map(p => (
          <PollutantBadge key={p.type} type={p.type} value={p.value} size="sm" />
        ))}
      </div>
    );
  }
  
  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        {pollutants.map(p => (
          <PollutantDetailCard key={p.type} type={p.type} value={p.value} compact />
        ))}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Summary Alert */}
      {worstSeverity.level !== 'good' && worstSeverity.level !== 'moderate' && (
        <Card className={`p-3 ${worstSeverity.bgColor} border ${worstSeverity.borderColor}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${worstSeverity.color}`} />
            <div>
              <p className={`text-sm font-bold ${worstSeverity.color}`}>
                {WHO_GUIDELINES[worstPollutant.type].fullName} is {worstSeverity.label}
              </p>
              <p className="text-xs text-muted-foreground">{worstSeverity.recommendation}</p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Detailed Cards */}
      <div className="grid grid-cols-1 gap-3">
        {pollutants.map(p => (
          <PollutantDetailCard 
            key={p.type} 
            type={p.type} 
            value={p.value} 
            showHealthEffects 
            showSources={false}
          />
        ))}
      </div>
    </div>
  );
};

// Education Section Component
export const PollutantEducationSection = () => {
  const pollutantTypes: PollutantType[] = ['pm25', 'o3', 'no2', 'so2'];
  
  return (
    <Card className="p-6 glass border-border space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Understanding Air Pollutants</h2>
          <p className="text-sm text-muted-foreground">WHO Guidelines & Health Impacts</p>
        </div>
      </div>
      
      {/* Severity Scale */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">EPA Air Quality Index Scale</h3>
        <div className="grid grid-cols-6 gap-1">
          {Object.values(SEVERITY_LEVELS).map((level) => {
            const Icon = level.icon;
            return (
              <div key={level.level} className={`p-2 rounded-lg ${level.bgColor} border ${level.borderColor} text-center`}>
                <Icon className={`w-4 h-4 ${level.color} mx-auto mb-1`} />
                <p className={`text-[9px] font-medium ${level.color} leading-tight`}>{level.label.split(' ')[0]}</p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Pollutant Quick Reference */}
      <div className="grid grid-cols-2 gap-4">
        {pollutantTypes.map(type => {
          const guidelines = WHO_GUIDELINES[type];
          const whoLimit = getWHOLimit(type);
          return (
            <Card key={type} className="p-3 bg-muted/10 border-border">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-4 h-4 text-primary" />
                <span className="font-bold text-foreground">{guidelines.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{guidelines.fullName}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] bg-yellow-500/10 border-yellow-500/30 text-yellow-400">
                  WHO: {whoLimit} {guidelines.unit}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
      
      <div className="p-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/20">
        <p className="text-xs text-muted-foreground flex items-start gap-2">
          <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-red-400">Important:</strong> The World Health Organization updated 
            air quality guidelines in 2021, recommending stricter limits due to evidence of health effects 
            at lower concentrations than previously thought.
          </span>
        </p>
      </div>
    </Card>
  );
};
