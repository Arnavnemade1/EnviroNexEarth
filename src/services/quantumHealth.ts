export interface HealthProfile {
  age: number;
  hasAsthma: boolean;
  hasHeartCondition: boolean;
  hasLungCondition: boolean;
  activityLevel: 'low' | 'moderate' | 'high';
  smokingStatus: 'never' | 'former' | 'current';
}

export interface BiologicalImpact {
  respiratory: number; // 0-100
  cardiovascular: number; // 0-100
  neurological: number; // 0-100
  oxidativeStress: number; // 0-100
}

export interface ActivityWindow {
  hour: number;
  label: string;
  status: 'optimal' | 'limited' | 'danger';
  riskScore: number;
}

export interface QuantumHealthAnalysis {
  overallRisk: 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';
  riskScore: number; // 0-100
  quantumCoherence: number; // Quantum-enhanced risk assessment
  recommendations: string[];
  activitySafety: {
    outdoor: 'safe' | 'limited' | 'avoid';
    exercise: 'safe' | 'light-only' | 'indoor-only' | 'avoid';
    children: 'safe' | 'limited' | 'avoid';
    elderly: 'safe' | 'limited' | 'avoid';
  };
  biologicalImpact: BiologicalImpact;
  activityWindows: ActivityWindow[];
  timeToSafety: number | null; // Hours until AQI improves, null if improving
  personalizedAlerts: string[];
  interventionEffectiveness: number; // Percentage reduction with current interventions
}

export interface Interventions {
  usingN95: boolean;
  usingAirPurifier: boolean;
  isStayingIndoors: boolean;
}

// Quantum-inspired health risk calculation using superposition of multiple risk factors
export function calculateQuantumHealthRisk(
  aqi: number,
  pm25: number,
  o3: number,
  no2: number,
  profile?: HealthProfile,
  interventions: Interventions = { usingN95: false, usingAirPurifier: false, isStayingIndoors: false }
): QuantumHealthAnalysis {
  // Base risk calculation using quantum superposition concept
  const pollutantWeights = {
    pm25: 0.35,
    aqi: 0.25,
    o3: 0.20,
    no2: 0.20
  };

  // Quantum entanglement simulation - correlate multiple factors simultaneously
  let baseRisk = (
    (pm25 / 35 * 0.8) * pollutantWeights.pm25 +
    (aqi / 150 * 0.8) * pollutantWeights.aqi +
    (o3 / 100 * 0.8) * pollutantWeights.o3 +
    (no2 / 50 * 0.8) * pollutantWeights.no2
  ) * 100;

  // Personal vulnerability multiplier using quantum coherence
  let personalMultiplier = 1.0;
  let coherenceFactors: number[] = [1.0];

  if (profile) {
    const ageRisk = profile.age < 18 ? 1.3 : profile.age > 65 ? 1.4 : 1.0;
    coherenceFactors.push(ageRisk);
    if (profile.hasAsthma) coherenceFactors.push(1.8);
    if (profile.hasHeartCondition) coherenceFactors.push(1.5);
    if (profile.hasLungCondition) coherenceFactors.push(1.7);
    const activityRisk = profile.activityLevel === 'high' ? 1.2 : profile.activityLevel === 'low' ? 1.1 : 1.0;
    coherenceFactors.push(activityRisk);
    const smokingRisk = profile.smokingStatus === 'current' ? 1.6 : profile.smokingStatus === 'former' ? 1.2 : 1.0;
    coherenceFactors.push(smokingRisk);

    personalMultiplier = coherenceFactors.reduce((acc, factor) => acc * Math.pow(factor, 1 / coherenceFactors.length), 1);
  }

  // Calculate Intervention Effectiveness
  let interventionReduction = 0;
  if (interventions.usingN95) interventionReduction += 0.85; // N95 reduces ~85% of particulates
  if (interventions.usingAirPurifier) interventionReduction += 0.70; // Indoor air purification
  if (interventions.isStayingIndoors) interventionReduction += 0.50; // Simple indoor shelter

  // Normalize intervention effect (capped at 95%)
  const totalInterventionEffect = Math.min(0.95,
    (interventions.usingN95 ? 0.85 : 0) +
    (interventions.usingAirPurifier ? 0.4 : 0) +
    (interventions.isStayingIndoors ? 0.3 : 0)
  );

  const adjustedRisk = Math.min(100, (baseRisk * personalMultiplier) * (1 - totalInterventionEffect));

  const quantumCoherence = Math.max(0, 100 - (coherenceFactors.length > 1 ?
    coherenceFactors.reduce((sum, f) => sum + Math.abs(f - 1), 0) * 10 : 0));

  const getRiskLevel = (score: number): QuantumHealthAnalysis['overallRisk'] => {
    if (score < 20) return 'very-low';
    if (score < 40) return 'low';
    if (score < 60) return 'moderate';
    if (score < 80) return 'high';
    return 'very-high';
  };

  const riskLevel = getRiskLevel(adjustedRisk);

  // Biological Impact Logic
  const biologicalImpact: BiologicalImpact = {
    respiratory: Math.min(100, (pm25 * 2.5 + no2 * 1.5) * personalMultiplier * (interventions.usingN95 ? 0.2 : 1)),
    cardiovascular: Math.min(100, (pm25 * 2 + aqi * 0.5) * personalMultiplier * (interventions.isStayingIndoors ? 0.6 : 1)),
    neurological: Math.min(100, (pm25 * 1.2 + o3 * 0.8) * personalMultiplier),
    oxidativeStress: Math.min(100, (aqi * 0.8) * personalMultiplier)
  };

  const recommendations: string[] = [];
  if (adjustedRisk > 70) recommendations.push("CRITICAL: Immediate indoor relocation required with H13 filtration.");
  if (profile?.hasAsthma && pm25 > 25) recommendations.push("High PM2.5 detected: Proactive bronchodilator use suggested.");
  if (interventions.usingN95) recommendations.push("Intervention ACTIVE: N95 mask providing 85% particulate filtration.");

  const activitySafety = {
    outdoor: adjustedRisk < 30 ? 'safe' : adjustedRisk < 65 ? 'limited' : 'avoid',
    exercise: adjustedRisk < 25 ? 'safe' : adjustedRisk < 50 ? 'light-only' : adjustedRisk < 75 ? 'indoor-only' : 'avoid',
    children: adjustedRisk < 35 ? 'safe' : adjustedRisk < 70 ? 'limited' : 'avoid',
    elderly: adjustedRisk < 30 ? 'safe' : adjustedRisk < 60 ? 'limited' : 'avoid'
  } as const;

  return {
    overallRisk: riskLevel,
    riskScore: Math.round(adjustedRisk),
    quantumCoherence: Math.round(quantumCoherence),
    recommendations,
    activitySafety,
    biologicalImpact,
    activityWindows: [], // Populated later
    timeToSafety: calculateTimeToSafety(adjustedRisk, pm25, aqi, o3, no2),
    personalizedAlerts: [],
    interventionEffectiveness: Math.round(totalInterventionEffect * 100)
  };
}

function calculateTimeToSafety(riskScore: number, pm25: number, aqi: number, o3: number, no2: number): number | null {
  if (riskScore <= 30) return null;
  const pm25Hours = pm25 > 35 ? Math.ceil((pm25 - 35) / 4) : 0;
  const aqiHours = aqi > 100 ? Math.ceil((aqi - 100) / 10) : 0;
  const maxTime = Math.max(pm25Hours, aqiHours);
  return Math.max(1, Math.min(24, maxTime));
}

export function predictHealthTrend(
  currentAnalysis: QuantumHealthAnalysis,
  forecast: Array<{ aqi: number; pm25: number; confidence: number }>,
  currentO3: number = 80,
  currentNO2: number = 25,
  profile?: HealthProfile
): Array<ActivityWindow> {
  return forecast.slice(0, 12).map((f, index) => {
    const hourOfDay = (new Date().getHours() + index) % 24;
    const o3Variation = currentO3 * (0.7 + 0.6 * Math.sin((hourOfDay - 6) * Math.PI / 12));
    const morningRush = hourOfDay >= 7 && hourOfDay <= 9;
    const eveningRush = hourOfDay >= 17 && hourOfDay <= 19;
    const no2Variation = currentNO2 * (morningRush || eveningRush ? 1.4 : 0.8);

    // Calculate for baseline (no extra interventions for the window forecast)
    const futureAnalysis = calculateQuantumHealthRisk(
      f.aqi,
      f.pm25,
      Math.max(20, Math.round(o3Variation)),
      Math.max(10, Math.round(no2Variation)),
      profile
    );

    const status = futureAnalysis.riskScore < 30 ? 'optimal' :
      futureAnalysis.riskScore < 60 ? 'limited' : 'danger';

    return {
      hour: index,
      label: `${(new Date().getHours() + index) % 24}:00`,
      status,
      riskScore: futureAnalysis.riskScore
    };
  });
}