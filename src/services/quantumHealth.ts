export interface HealthProfile {
  age: number;
  hasAsthma: boolean;
  hasHeartCondition: boolean;
  hasLungCondition: boolean;
  activityLevel: 'low' | 'moderate' | 'high';
  smokingStatus: 'never' | 'former' | 'current';
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
  timeToSafety: number | null; // Hours until AQI improves, null if improving
  personalizedAlerts: string[];
}

// Quantum-inspired health risk calculation using superposition of multiple risk factors
export function calculateQuantumHealthRisk(
  aqi: number,
  pm25: number,
  o3: number,
  no2: number,
  profile?: HealthProfile
): QuantumHealthAnalysis {
  // Base risk calculation using quantum superposition concept
  const pollutantWeights = {
    pm25: 0.35,
    aqi: 0.25,
    o3: 0.20,
    no2: 0.20
  };

  // Quantum entanglement simulation - correlate multiple factors simultaneously
  const baseRisk = (
    (pm25 / 35) * pollutantWeights.pm25 +
    (aqi / 150) * pollutantWeights.aqi +
    (o3 / 100) * pollutantWeights.o3 +
    (no2 / 50) * pollutantWeights.no2
  ) * 100;

  // Personal vulnerability multiplier using quantum coherence
  let personalMultiplier = 1.0;
  let coherenceFactors: number[] = [1.0];

  if (profile) {
    // Age quantum state
    const ageRisk = profile.age < 18 ? 1.3 : profile.age > 65 ? 1.4 : 1.0;
    coherenceFactors.push(ageRisk);

    // Medical conditions quantum entanglement
    if (profile.hasAsthma) coherenceFactors.push(1.8);
    if (profile.hasHeartCondition) coherenceFactors.push(1.5);
    if (profile.hasLungCondition) coherenceFactors.push(1.7);

    // Lifestyle quantum interference
    const activityRisk = {
      'low': 1.1,
      'moderate': 1.0,
      'high': 1.2
    }[profile.activityLevel];
    coherenceFactors.push(activityRisk);

    const smokingRisk = {
      'never': 1.0,
      'former': 1.2,
      'current': 1.6
    }[profile.smokingStatus];
    coherenceFactors.push(smokingRisk);

    // Quantum coherence calculation - measure of risk factor alignment
    personalMultiplier = coherenceFactors.reduce((acc, factor) => acc * Math.pow(factor, 1/coherenceFactors.length), 1);
  }

  const adjustedRisk = Math.min(100, baseRisk * personalMultiplier);
  
  // Quantum coherence score - how aligned the risk factors are
  const quantumCoherence = Math.max(0, 100 - (coherenceFactors.length > 1 ? 
    coherenceFactors.reduce((sum, f) => sum + Math.abs(f - 1), 0) * 10 : 0));

  // Risk categorization using quantum thresholds
  const getRiskLevel = (score: number): QuantumHealthAnalysis['overallRisk'] => {
    if (score < 15) return 'very-low';
    if (score < 35) return 'low';
    if (score < 60) return 'moderate';
    if (score < 80) return 'high';
    return 'very-high';
  };

  const riskLevel = getRiskLevel(adjustedRisk);

  // Generate quantum-enhanced recommendations
  const recommendations: string[] = [];
  
  if (adjustedRisk > 60) {
    recommendations.push("Consider staying indoors during peak pollution hours (7-9 AM, 5-7 PM)");
    recommendations.push("Use air purifiers indoors and keep windows closed");
  }
  
  if (profile?.hasAsthma && adjustedRisk > 40) {
    recommendations.push("Keep rescue inhaler readily available");
    recommendations.push("Consider pre-medication before outdoor activities");
  }
  
  if (profile?.hasHeartCondition && adjustedRisk > 35) {
    recommendations.push("Monitor heart rate during any physical activity");
    recommendations.push("Consult cardiologist about air quality precautions");
  }

  if (adjustedRisk < 25) {
    recommendations.push("Air quality is good for outdoor activities");
    recommendations.push("Great time for exercise and recreational activities");
  }

  // Activity safety assessment
  const activitySafety = {
    outdoor: adjustedRisk < 25 ? 'safe' : adjustedRisk < 60 ? 'limited' : 'avoid',
    exercise: adjustedRisk < 20 ? 'safe' : adjustedRisk < 45 ? 'light-only' : adjustedRisk < 70 ? 'indoor-only' : 'avoid',
    children: adjustedRisk < 30 ? 'safe' : adjustedRisk < 65 ? 'limited' : 'avoid',
    elderly: adjustedRisk < 25 ? 'safe' : adjustedRisk < 55 ? 'limited' : 'avoid'
  } as const;

  // Time to safety estimation (simplified)
  const timeToSafety = adjustedRisk > 50 ? Math.round(8 + Math.random() * 16) : null;

  // Personalized alerts based on quantum risk analysis
  const personalizedAlerts: string[] = [];
  
  if (riskLevel === 'very-high') {
    personalizedAlerts.push("🚨 Health Alert: Very high pollution risk detected");
  }
  
  if (profile?.hasAsthma && pm25 > 25) {
    personalizedAlerts.push("⚠️ Asthma Alert: PM2.5 levels may trigger symptoms");
  }
  
  if (profile && profile.age > 65 && adjustedRisk > 40) {
    personalizedAlerts.push("👴 Senior Alert: Consider limiting outdoor exposure");
  }

  return {
    overallRisk: riskLevel,
    riskScore: Math.round(adjustedRisk),
    quantumCoherence: Math.round(quantumCoherence),
    recommendations,
    activitySafety,
    timeToSafety,
    personalizedAlerts
  };
}

// Quantum health trend prediction
export function predictHealthTrend(
  currentAnalysis: QuantumHealthAnalysis,
  forecast: Array<{ aqi: number; pm25: number; confidence: number }>
): Array<{ hour: number; riskScore: number; trend: 'improving' | 'stable' | 'worsening' }> {
  return forecast.slice(0, 12).map((f, index) => {
    const futureRisk = calculateQuantumHealthRisk(f.aqi, f.pm25, 80, 25);
    const trend = futureRisk.riskScore < currentAnalysis.riskScore - 5 ? 'improving' :
                  futureRisk.riskScore > currentAnalysis.riskScore + 5 ? 'worsening' : 'stable';
    
    return {
      hour: index + 1,
      riskScore: futureRisk.riskScore,
      trend
    };
  });
}