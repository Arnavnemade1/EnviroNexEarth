import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import GlobeComponent from '@/components/Globe';
import CitySearch from '@/components/CitySearch';
import DataPanel from '@/components/DataPanel';
import NaturalDisasters from '@/components/NaturalDisasters';
import Chatbot from '@/components/Chatbot';
import { nasaService } from '@/services/nasaApi';
import { geocodingService } from '@/services/geocoding';
import { AirQualityData, PredictionData, CityData } from '@/types';

const Index = () => {
  const { toast } = useToast();
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [pollutionData, setPollutionData] = useState<Array<{ lat: number; lng: number; value: number; color: string }>>([]);
  const [currentYear, setCurrentYear] = useState(0);
  const [currentScenario, setCurrentScenario] = useState<'current' | 'clean_energy' | 'no_action'>('current');
  const [showIntro, setShowIntro] = useState(true);
  const [globeHue, setGlobeHue] = useState<string>('none');

  // Auto-hide intro after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Globe hue effect based on scenario
  useEffect(() => {
    if (currentScenario === 'clean_energy') {
      setGlobeHue('green');
    } else if (currentScenario === 'no_action') {
      setGlobeHue('red');
    } else {
      setGlobeHue('orange');
    }
  }, [currentScenario]);

  const handleCitySelect = async (city: { name: string; country: string; lat: number; lng: number }) => {
    try {
      toast({
        title: "Loading city data...",
        description: `Fetching air quality data for ${city.name}`,
      });

      // Fetch air quality data
      const aqData = await nasaService.getAirQualityData(city.lat, city.lng);
      const forecasts = await nasaService.getPollutionForecast(city.lat, city.lng);

      const cityData: CityData = {
        ...city,
        airQuality: aqData,
        healthImpact: {
          outdoorActivityDays: Math.floor(300 - (aqData.aqi * 1.2)),
          asthmaRisk: Math.floor(aqData.aqi * 0.3),
          respiratoryIndex: Math.floor(aqData.aqi * 0.8)
        }
      };

      setSelectedCity(cityData);
      setAirQuality(aqData);
      setPredictions(forecasts);
      setShowIntro(false);

      // Generate pollution visualization data
      const pollutionPoints = [];
      for (let i = 0; i < 100; i++) {
        const lat = city.lat + (Math.random() - 0.5) * 10;
        const lng = city.lng + (Math.random() - 0.5) * 10;
        const value = Math.random() * 150;
        const color = value > 100 ? '#ef4444' : value > 50 ? '#f59e0b' : '#10b981';
        
        pollutionPoints.push({ lat, lng, value, color });
      }
      setPollutionData(pollutionPoints);

      toast({
        title: "Data loaded!",
        description: `Showing air quality data for ${city.name}, ${city.country}`,
      });
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleGlobeClick = async (lat: number, lng: number) => {
    try {
      const location = await geocodingService.reverseGeocode(lat, lng);
      if (location) {
        handleCitySelect({
          name: location.name,
          country: location.country,
          lat,
          lng
        });
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  const handleForecastToggle = (scenario: 'current' | 'clean_energy' | 'no_action') => {
    setCurrentScenario(scenario);
    
    // Update pollution data based on scenario
    if (selectedCity) {
      const multiplier = scenario === 'clean_energy' ? 0.7 : scenario === 'no_action' ? 1.4 : 1.0;
      const updatedPollution = pollutionData.map(point => ({
        ...point,
        value: Math.min(200, point.value * multiplier),
        color: point.value * multiplier > 100 ? '#ef4444' : point.value * multiplier > 50 ? '#f59e0b' : '#10b981'
      }));
      setPollutionData(updatedPollution);
    }
  };

  const handleYearChange = (direction: 'next' | 'prev') => {
    setCurrentYear(prev => {
      if (direction === 'next' && prev < 6) return prev + 1;
      if (direction === 'prev' && prev > 0) return prev - 1;
      return prev;
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-space">
      {/* Globe Container */}
      <div className="absolute inset-0">
        <GlobeComponent
          onCityClick={handleGlobeClick}
          selectedCity={selectedCity ? { lat: selectedCity.lat, lng: selectedCity.lng } : null}
          pollutionData={pollutionData}
          showSatellites={true}
        />
        {/* Globe Hue Overlay */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-all duration-1000 ${
            globeHue === 'green' ? 'bg-clean-green/10' : 
            globeHue === 'red' ? 'bg-pollution-red/10' :
            globeHue === 'orange' ? 'bg-accent/10' : 'bg-transparent'
          }`} 
        />
      </div>

      {/* Natural Disasters Sidebar */}
      <div className="absolute top-6 right-96 z-40">
        <NaturalDisasters onDisasterClick={handleGlobeClick} />
      </div>

      {/* Intro Hook */}
      {showIntro && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up">
          <div className="text-center max-w-2xl px-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-earth bg-clip-text text-transparent animate-pulse-glow">
              Earth's Skies in 2030
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 mb-8">
              See tomorrow's air quality, today. Live NASA data meets AI predictions.
            </p>
            <div className="animate-bounce">
              <div className="w-8 h-8 bg-primary rounded-full mx-auto glow"></div>
            </div>
          </div>
        </div>
      )}

      {/* City Search */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
        {!selectedCity && !showIntro && (
          <div className="text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-8 text-foreground">
              Name a city you care about.
            </h2>
            <CitySearch onCitySelect={handleCitySelect} />
          </div>
        )}
      </div>

      {/* Data Panel */}
      {selectedCity && airQuality && predictions.length > 0 && (
        <DataPanel
          cityName={`${selectedCity.name}, ${selectedCity.country}`}
          airQuality={airQuality}
          predictions={predictions}
          onForecastToggle={handleForecastToggle}
          isAnimating={false}
          onAnimationToggle={() => handleYearChange('next')}
          currentYear={currentYear}
        />
      )}

      {/* Chatbot */}
      <Chatbot 
        selectedCity={selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : undefined}
        currentScenario={currentScenario}
        currentYear={currentYear}
      />

      {/* Bottom Credits */}
      <div className="absolute bottom-6 right-6 z-40">
        <div className="glass px-4 py-2 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Powered by <span className="text-primary font-medium">NASA EarthData</span> + AI
          </p>
        </div>
      </div>

      {/* Satellite indicator */}
      <div className="absolute top-6 right-6 z-40">
        <div className="glass px-3 py-2 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-sm text-foreground">Live Satellites (Click to Info)</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
