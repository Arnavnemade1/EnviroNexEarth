
export interface HealthProfile {
  age: number;
  hasAsthma: boolean;
  hasHeartCondition: boolean;
  hasLungCondition: boolean;
  activityLevel: 'low' | 'moderate' | 'high';
  smokingStatus: 'never' | 'former' | 'current';
}

export interface PhysiologicalMetrics {
  stressLoad: number; // 0-100 (Overall System Stress)
  cardiacStrain: number; // 0-100
  lungInflammation: number; // 0-100
  cognitiveImpact: number; // 0-100
  recoveryIndex: number; // 0-100 (Inverse of Stress)
  projectedVitals: {
    hr: number; // Heart Rate (bpm)
    spo2: number; // Blood Oxygen (%)
    bp: { sys: number; dia: number }; // Blood Pressure
    cortisol: 'Normal' | 'Elevated' | 'High';
  };
  recommendations: string[];
}

export interface ActivityWindow {
  hour: number;
  label: string;
  status: 'optimal' | 'limited' | 'danger';
  riskScore: number;
  hrvProjection: number; // New: HRV projection for graph
}

export interface QuantumHealthAnalysis {
  overallRisk: 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';
  riskScore: number;
  metrics: PhysiologicalMetrics;
  activityWindows: ActivityWindow[];
  timeToSafety: number | null;
}

export interface Interventions {
  usingN95: boolean;
  usingAirPurifier: boolean;
  isStayingIndoors: boolean;
}

// Deterministic Physiological Model based on Epidemiological Coefficients
export function calculatePhysiologicalImpact(
  aqi: number,
  pm25: number,
  o3: number,
  no2: number,
  so2: number,
  co: number,
  profile?: HealthProfile,
  interventions: Interventions = { usingN95: false, usingAirPurifier: false, isStayingIndoors: false }
): QuantumHealthAnalysis {

  // 1. Calculate Intervention Factors (Deterministic Reduction)
  const pmReduction = (interventions.usingN95 ? 0.95 : 0) + (interventions.usingAirPurifier ? 0.60 : 0) + (interventions.isStayingIndoors ? 0.30 : 0);
  const gasReduction = (interventions.usingAirPurifier ? 0.40 : 0) + (interventions.isStayingIndoors ? 0.20 : 0); // Gases are harder to filter

  // Cap reductions at realistic maximums
  const effectivePM25 = pm25 * (1 - Math.min(0.98, pmReduction));
  const effectiveNO2 = no2 * (1 - Math.min(0.60, gasReduction));
  const effectiveO3 = o3 * (1 - Math.min(0.60, gasReduction));
  const effectiveSO2 = so2 * (1 - Math.min(0.60, gasReduction));
  const effectiveCO = co * (1 - Math.min(0.20, gasReduction)); // CO is very hard to reduce

  // 2. Personal Vulnerability Multipliers
  let cardioMultiplier = 1.0;
  let respMultiplier = 1.0;
  let neuroMultiplier = 1.0;

  if (profile) {
    if (profile.age > 65) { cardioMultiplier *= 1.2; respMultiplier *= 1.2; }
    if (profile.hasAsthma) { respMultiplier *= 1.5; }
    if (profile.hasHeartCondition) { cardioMultiplier *= 1.6; }
    if (profile.hasLungCondition) { respMultiplier *= 1.6; }
    if (profile.activityLevel === 'high') { cardioMultiplier *= 1.3; respMultiplier *= 1.3; } // Higher uptake
  }

  // 3. Deterministic Physiological Inputs (0-100 scale normalized from typical dangerous levels)
  // PM2.5 > 50 is bad. NO2 > 100 is bad. O3 > 100 is bad.

  // Cognitive Logic: PM2.5 (Ultrafine) + CO (Hypoxia)
  const cognitiveInput = (Math.min(100, (effectivePM25 / 75) * 60) + Math.min(100, (effectiveCO / 20) * 40)) * neuroMultiplier;

  // Cardiac Logic: PM2.5 (Inflammation) + SO2 (Vasoconstriction) + NO2 (Stress)
  const cardiacInput = (Math.min(100, (effectivePM25 / 60) * 40) + Math.min(100, (effectiveSO2 / 50) * 30) + Math.min(100, (effectiveNO2 / 80) * 30)) * cardioMultiplier;

  // Respiratory Logic: O3 (Irritant) + NO2 (Resistance) + PM2.5 (Logistics)
  const respInput = (Math.min(100, (effectiveO3 / 80) * 40) + Math.min(100, (effectiveNO2 / 80) * 30) + Math.min(100, (effectivePM25 / 60) * 30)) * respMultiplier;

  // 4. System Stress Load (Weighted Average)
  const stressLoad = Math.min(100, (cardiacInput * 0.4 + respInput * 0.4 + cognitiveInput * 0.2));

  // 5. Projected Vitals (Deterministic shift from baseline)
  const baseHR = 65;
  const baseSpO2 = 99.0;
  const baseSys = 115;
  const baseDia = 75;

  const vitals = {
    hr: Math.round(baseHR + (stressLoad * 0.35)), // Max +35 bpm at 100% stress
    spo2: Number((baseSpO2 - (respInput * 0.06)).toFixed(1)), // Max -6% SpO2 at 100% resp stress
    bp: {
      sys: Math.round(baseSys + (cardiacInput * 0.3)), // Max +30 mmHg
      dia: Math.round(baseDia + (cardiacInput * 0.15)) // Max +15 mmHg
    },
    cortisol: stressLoad > 65 ? 'High' : stressLoad > 35 ? 'Elevated' : 'Normal' as 'Normal' | 'Elevated' | 'High'
  };

  const metrics: PhysiologicalMetrics = {
    stressLoad: Math.round(stressLoad),
    cardiacStrain: Math.round(cardiacInput),
    lungInflammation: Math.round(respInput),
    cognitiveImpact: Math.round(cognitiveInput),
    recoveryIndex: Math.round(Math.max(0, 100 - stressLoad * 1.1)), // Recovery is harder than stress is easy
    projectedVitals: vitals,
    recommendations: generateRecommendations(stressLoad, respInput, cardiacInput, interventions)
  };

  return {
    overallRisk: getRiskLevel(stressLoad),
    riskScore: Math.round(stressLoad),
    metrics,
    activityWindows: [], // Populated in predictHealthTrend
    timeToSafety: calculateTimeToSafety(effectivePM25, aqi),
  };
}

function generateRecommendations(stress: number, resp: number, cardio: number, interventions: Interventions): string[] {
  const recs = [];
  if (stress > 70) recs.push("CRITICAL: Physiological load exceeds safe limits. Halt exertion.");
  if (resp > 50 && !interventions.usingN95) recs.push("Respiratory inflammation likely. N95 prophylaxis recommended.");
  if (cardio > 40) recs.push("Vasoconstriction risk detected. Monitor blood pressure.");
  if (interventions.usingN95) recs.push("N95 filter active: Particulate uptake reduced by ~95%.");
  if (recs.length === 0) recs.push("Physiological baseline nominal. Standard activity authorized.");
  return recs;
}

function getRiskLevel(score: number): QuantumHealthAnalysis['overallRisk'] {
  if (score < 20) return 'very-low';
  if (score < 40) return 'low';
  if (score < 60) return 'moderate';
  if (score < 80) return 'high';
  return 'very-high';
}

function calculateTimeToSafety(pm25: number, aqi: number): number | null {
  if (pm25 < 35 && aqi < 100) return null;
  // Simple heuristic: 1 hour per 5ug/m3 over limit
  return Math.min(24, Math.max(1, Math.ceil((pm25 - 35) / 5)));
}

// Predict Future Trends based on Forecast Data
export function predictHealthTrend(
  currentAnalysis: QuantumHealthAnalysis,
  forecast: Array<{ aqi: number; pm25: number; confidence: number }>,
  currentO3: number,
  currentNO2: number,
  currentSO2: number,
  currentCO: number,
  profile?: HealthProfile
): Array<ActivityWindow> {
  // Use current values as baselines and modulate with forecast AQI/PM2.5 trends
  // Diurnal cycles for O3 (peak afternoon) and NO2/CO (peak rush hours)

  return forecast.slice(0, 12).map((f, index) => {
    const hour = (new Date().getHours() + index) % 24;

    // Deterministic Diurnal Models
    const o3Mod = 0.5 + 0.5 * Math.sin((hour - 14) * Math.PI / 12); // Peak at 14:00 (2 PM)
    const trafficMod = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19) ? 1.4 : 0.8; // Rush hours

    // Forecasted pollutants (Approximated from baseline if not in forecast)
    const futureO3 = currentO3 * o3Mod;
    const futureNO2 = currentNO2 * trafficMod;
    const futureSO2 = currentSO2 * 0.9; // Assume slight decay or steady
    const futureCO = currentCO * trafficMod;

    const futureStats = calculatePhysiologicalImpact(
      f.aqi,
      f.pm25,
      futureO3,
      futureNO2,
      futureSO2,
      futureCO,
      profile
    );

    // HRV Projection (Inverse of Stress, scaled to reasonable ms values)
    // Baseline HRV ~60ms. Stress reduces it.
    const hrv = Math.max(20, 60 - (futureStats.riskScore * 0.4));

    return {
      hour: index,
      label: `${hour}:00`,
      status: futureStats.riskScore < 30 ? 'optimal' : futureStats.riskScore < 60 ? 'limited' : 'danger',
      riskScore: futureStats.riskScore,
      hrvProjection: Math.round(hrv)
    };
  });
}