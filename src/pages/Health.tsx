import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, Activity, Shield } from 'lucide-react';
import { QuantumHealthAnalysisComponent } from '@/components/QuantumHealthAnalysis';
import { toast } from 'sonner';

interface LocationState {
  cityName?: string;
  airQuality?: {
    aqi: number;
    pm25: number;
    pm10: number;
    o3: number;
    no2: number;
    so2: number;
    co: number;
  };
  forecast?: Array<{ aqi: number; pm25: number; confidence: number }>;
}

const Health = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get data from navigation state
  const state = location.state as LocationState;

  useEffect(() => {
    // Check if we have the required data
    if (!state?.cityName || !state?.airQuality) {
      toast.error("Health analysis requires air quality data. Redirecting to home...");
      setTimeout(() => navigate('/'), 2000);
    }
  }, [state, navigate]);

  const handleBackToCity = () => {
    // Navigate back to home with the city still selected
    navigate('/', { state: { returnToCity: state?.cityName } });
  };

  if (!state?.cityName || !state?.airQuality) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Card className="glass p-8 text-center max-w-md animate-scale-in border-white/10">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-white">No Health Data Available</h2>
          <p className="text-slate-400 mb-4">
            Please select a city first to view health analysis.
          </p>
          <Button onClick={() => navigate('/')} className="w-full bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-emerald-500/30">
      {/* Main Health Analysis Component takes full space */}
      <QuantumHealthAnalysisComponent
        cityName={state.cityName}
        currentAQI={state.airQuality.aqi}
        airQuality={state.airQuality}
        forecast={state.forecast}
        onBack={handleBackToCity}
      />
    </div>
  );
};

export default Health;