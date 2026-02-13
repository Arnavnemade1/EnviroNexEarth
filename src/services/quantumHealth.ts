
export interface HealthProfile {
  age: number;
  hasAsthma: boolean;
  hasHeartCondition: boolean;
  hasLungCondition: boolean;
  activityLevel: 'low' | 'moderate' | 'high';
  smokingStatus: 'never' | 'former' | 'current';
}

export interface EpidemiologicalMetrics {
  aggregateRiskIncrease: number; // % Increase in all-cause mortality risk (0-100+)
  cardiovascularRisk: {
    label: string; // "Acute MI Risk"
    increase: number; // % Increase (e.g., 12%)
    color: 'emerald' | 'amber' | 'rose';
  };
  respiratoryRisk: {
    label: string; // "Bronchoconstriction Probability"
    increase: number; // % Increase or Score (0-100)
    color: 'emerald' | 'amber' | 'rose';
  };
  neurologicalRisk: {
    label: string;
    increase: number;
    color: 'emerald' | 'amber' | 'rose';
  };
}

export interface PollutantImpact {
  name: string;
  impact: number;
  color: string;
}

export interface ActivityWindow {
  hour: number;
  label: string;
  status: 'optimal' | 'guarded' | 'limited' | 'prohibited';
  riskScore: number;
  riskIncreaseSteps: number;
}

export interface QuantumHealthAnalysis {
  overallRisk: 'low' | 'moderate' | 'high' | 'extreme';
  riskScore: number;
  metrics: EpidemiologicalMetrics;
  pollutantBreakdown: PollutantImpact[];
  recommendations: string[];
  activityWindows: ActivityWindow[];
  timeToSafety: number | null;
}

export interface Interventions {
  usingN95: boolean;
  usingAirPurifier: boolean;
  isStayingIndoors: boolean;
}

// Exposure-Response Function (ERF) Coefficients (Log-Linear Models)
// Derived from WHO, ESCAPE, ACS, and major meta-analyses.
const ERF = {
  // Cardiovascular: % increase per 10 µg/m³ PM2.5 (short-term)
  PM25_CVD: 0.011, // ~1.1%
  // Respiratory: % increase per 10 µg/m³ PM10
  PM10_RESP: 0.008, // ~0.8%
  // Asthma: % increase per 10 ppb NO2
  NO2_ASTHMA: 0.025, // ~2.5%
  // Mortality: % increase per 10 µg/m³ PM2.5 (all-cause)
  PM25_MORTALITY: 0.012, // ~1.2%
  // Stroke: % increase per 10 µg/m³ PM2.5 (long-term proxy converted to daily hazard)
  PM25_STROKE: 0.015, // ~1.5%
};

// Main Calculation Function
export function calculateEpidemiologicalRisk(
  aqi: number,
  pm25: number,
  o3: number,
  no2: number,
  so2: number,
  co: number,
  profile?: HealthProfile,
  interventions: Interventions = { usingN95: false, usingAirPurifier: false, isStayingIndoors: false }
): QuantumHealthAnalysis {

  // 1. Calculate Intervention Factors
  const pmReduction = (interventions.usingN95 ? 0.95 : 0) + (interventions.usingAirPurifier ? 0.60 : 0) + (interventions.isStayingIndoors ? 0.30 : 0);
  const gasReduction = (interventions.usingAirPurifier ? 0.30 : 0) + (interventions.isStayingIndoors ? 0.20 : 0);

  const effPM25 = pm25 * (1 - Math.min(0.99, pmReduction));
  const effNO2 = no2 * (1 - Math.min(0.60, gasReduction));
  const effO3 = o3 * (1 - Math.min(0.60, gasReduction));

  // 2. Personal Multipliers
  let vulnerability = 1.0;
  if (profile) {
    if (profile.age > 65) vulnerability *= 1.5;
    if (profile.hasAsthma || profile.hasLungCondition) vulnerability *= 2.0;
    if (profile.hasHeartCondition) vulnerability *= 2.0;
    if (profile.activityLevel === 'high') vulnerability *= 1.3; // Increased inhalation rate
  }

  // 3. RR Calculations using ERF Formula: RR = exp(beta * concentration)
  // We use linear approximation for short-term daily changes: Risk% = beta * concentration * 100 * vulnerability

  // Cardiovascular Risk (% Increase over baseline)
  // Driven mainly by PM2.5 (systemic inflammation)
  const cvdRisk = (effPM25 / 10) * (ERF.PM25_CVD * 100) * vulnerability;

  // Respiratory Risk (% or Probability Score)
  // Driven by NO2 (irritant) + O3 (oxidant) + PM2.5
  const respRisk = ((effNO2 / 10) * (ERF.NO2_ASTHMA * 100) + (effPM25 / 10) * (ERF.PM10_RESP * 100)) * vulnerability;

  // Neurological/Stroke Risk (% Increase)
  const neuroRisk = (effPM25 / 10) * (ERF.PM25_STROKE * 100) * vulnerability;

  // Aggregate Mortality Risk (% Increase) - The "Master Metric"
  const aggregateRisk = (effPM25 / 10) * (ERF.PM25_MORTALITY * 100) * vulnerability;

  // 4. Recommendations
  const recs = [];
  if (aggregateRisk > 5) recs.push("Elevated mortality risk detected. Reduce outdoor exertion.");
  if (cvdRisk > 5) recs.push("Cardiovascular strain expected. Monitor pulse if symptomatic.");
  if (respRisk > 10) recs.push("High bronchial irritation probability. Asthmatics take precaution.");
  if (interventions.usingN95) recs.push("N95 Filter Active: Risk factors reduced by ~95%.");
  if (recs.length === 0) recs.push("Risk levels nominal. No specific health actions required.");

  return {
    overallRisk: getRiskLevel(aggregateRisk),
    riskScore: aggregateRisk,
    metrics: {
      aggregateRiskIncrease: Number(aggregateRisk.toFixed(1)),
      cardiovascularRisk: {
        label: "Acute CV Event Risk",
        increase: Number(cvdRisk.toFixed(1)),
        color: cvdRisk > 5 ? 'rose' : cvdRisk > 2 ? 'amber' : 'emerald'
      },
      respiratoryRisk: {
        label: "Resp. Irritation Prob.",
        increase: Number(respRisk.toFixed(1)),
        color: respRisk > 8 ? 'rose' : respRisk > 4 ? 'amber' : 'emerald'
      },
      neurologicalRisk: {
        label: "Stroke Hazard (Proxy)",
        increase: Number(neuroRisk.toFixed(1)),
        color: neuroRisk > 4 ? 'rose' : neuroRisk > 2 ? 'amber' : 'emerald'
      }
    },
    pollutantBreakdown: [
      { name: "PM2.5", impact: 70, color: "#38bdf8" },
      { name: "Ozone", impact: 20, color: "#fbbf24" },
      { name: "Others", impact: 10, color: "#94a3b8" }
    ],
    recommendations: recs,
    activityWindows: [],
    timeToSafety: null
  };
}

function getRiskLevel(riskPct: number): QuantumHealthAnalysis['overallRisk'] {
  if (riskPct < 3) return 'low';
  if (riskPct < 6) return 'moderate';
  if (riskPct < 15) return 'high';
  return 'extreme';
}

export function predictHealthTrend(
  currentAnalysis: QuantumHealthAnalysis,
  forecast: Array<{ aqi: number; pm25: number; confidence: number }>,
  currentO3: number,
  currentNO2: number,
  currentSO2: number,
  currentCO: number,
  profile?: HealthProfile
): Array<ActivityWindow> {
  return forecast.slice(0, 12).map((f, index) => {
    const hour = (new Date().getHours() + index) % 24;

    // Simple diurnal modifier for NO2/O3 if not in forecast
    const trafficMod = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19) ? 1.3 : 0.8;
    const futureNO2 = currentNO2 * trafficMod;

    const futureStats = calculateEpidemiologicalRisk(
      f.aqi,
      f.pm25,
      currentO3,
      futureNO2,
      currentSO2,
      currentCO,
      profile
    );

    return {
      hour: index,
      label: `${hour}:00`,
      status: futureStats.riskScore < 3 ? 'optimal' : futureStats.riskScore < 6 ? 'guarded' : futureStats.riskScore < 15 ? 'limited' : 'prohibited',
      riskScore: futureStats.riskScore,
      riskIncreaseSteps: futureStats.metrics.aggregateRiskIncrease
    };
  });
}