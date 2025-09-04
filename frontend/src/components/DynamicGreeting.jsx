import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// API-Funktion zum Abrufen einer zufälligen Begrüßung
const fetchRandomGreeting = async () => {
  const response = await fetch('/api/greetings/random');
  if (!response.ok) {
    throw new Error('Fehler beim Abrufen der Begrüßung');
  }
  return response.json();
};

// Hilfsfunktion zur Bestimmung der Tageszeit (Frontend)
const getTimePeriod = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

// Emoji-Mapping für Tageszeiten
const timeEmojis = {
  morning: '🌅',
  afternoon: '☀️',
  evening: '🌆',
  night: '🌙'
};

// Fallback-Begrüßungen
const fallbackGreetings = {
  morning: ['Guten Morgen!', 'Schönen guten Morgen!', 'Morgen!'],
  afternoon: ['Guten Tag!', 'Hallo!', 'Schönen Tag!'],
  evening: ['Guten Abend!', 'Schönen Abend!', 'Abend!'],
  night: ['Gute Nacht!', 'Schöne Nacht!', 'Nacht!']
};

const DynamicGreeting = ({ 
  className = '', 
  showTimePeriod = true, 
  refreshInterval = 3600000, // 1 Stunde
  autoRefresh = true 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timePeriod, setTimePeriod] = useState(getTimePeriod());

  // Query für die Begrüßung
  const { 
    data: greetingData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['greeting', timePeriod],
    queryFn: fetchRandomGreeting,
    staleTime: refreshInterval,
    refetchOnWindowFocus: false,
    retry: 2,
    onError: (error) => {
      console.warn('Fehler beim Abrufen der Begrüßung:', error);
    }
  });

  // Zeit-Update alle Minute
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const newTimePeriod = getTimePeriod();
      if (newTimePeriod !== timePeriod) {
        setTimePeriod(newTimePeriod);
      }
    }, 60000); // Jede Minute

    return () => clearInterval(timer);
  }, [timePeriod]);

  // Auto-Refresh der Begrüßung
  useEffect(() => {
    if (!autoRefresh) return;

    const refreshTimer = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => clearInterval(refreshTimer);
  }, [autoRefresh, refreshInterval, refetch]);

  // Bestimme die anzuzeigende Begrüßung
  const getDisplayGreeting = () => {
    if (isLoading) {
      return 'Lade Begrüßung...';
    }

    if (error || !greetingData) {
      // Fallback-Begrüßung verwenden
      const fallbacks = fallbackGreetings[timePeriod] || fallbackGreetings.morning;
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    return greetingData.text || 'Hallo!';
  };

  // Bestimme das Emoji
  const getEmoji = () => {
    if (greetingData?.timePeriod) {
      return timeEmojis[greetingData.timePeriod] || timeEmojis[timePeriod];
    }
    return timeEmojis[timePeriod];
  };

  // Bestimme die Tageszeit-Anzeige
  const getTimePeriodText = () => {
    const periodTexts = {
      morning: 'Morgen',
      afternoon: 'Nachmittag', 
      evening: 'Abend',
      night: 'Nacht'
    };
    return periodTexts[timePeriod] || 'Tag';
  };

  return (
    <div className={`dynamic-greeting ${className}`}>
      <div className="flex items-center space-x-3">
        {/* Emoji */}
        <span className="text-2xl md:text-3xl animate-pulse">
          {getEmoji()}
        </span>
        
        {/* Begrüßungstext */}
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {getDisplayGreeting()}
          </h1>
          
          {/* Tageszeit-Anzeige */}
          {showTimePeriod && (
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                {getTimePeriodText()}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-500">
                {currentTime.toLocaleTimeString('de-DE', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Debug-Info (nur in Development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
          <div className="text-slate-600 dark:text-slate-400">
            <div>Zeitperiode: {timePeriod}</div>
            <div>Status: {isLoading ? 'Lädt...' : error ? 'Fehler' : 'OK'}</div>
            <div>Fallback: {greetingData?.isFallback ? 'Ja' : 'Nein'}</div>
            <button 
              onClick={() => refetch()}
              className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              Neu laden
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicGreeting;
