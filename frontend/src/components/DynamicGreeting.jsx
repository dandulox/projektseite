import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// API Base URL - dynamisch basierend auf der aktuellen Domain
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Verwende relative Pfade für lokale Entwicklung oder gleiche Domain
  const currentHost = window.location.hostname;
  const currentPort = window.location.port;
  
  // Wenn wir auf localhost oder 127.0.0.1 sind, verwende Port 3001
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return `http://${currentHost}:3001/api`;
  }
  
  // Für Produktionsumgebung: Verwende den gleichen Host mit Port 3001
  // oder falls Port 3000, dann Backend auf 3001
  if (currentPort === '3000') {
    return `http://${currentHost}:3001/api`;
  }
  
  // Für Produktionsumgebung ohne Port (Standard-HTTP/HTTPS): Verwende Port 3001
  if (!currentPort || currentPort === '80' || currentPort === '443') {
    return `http://${currentHost}:3001/api`;
  }
  
  // Fallback: Verwende relative Pfade
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

// API-Funktion zum Abrufen einer zufälligen Begrüßung
const fetchRandomGreeting = async () => {
  const response = await fetch(`${API_BASE_URL}/greetings/random`);
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

// Hilfsfunktion zur Bestimmung der aktuellen Stunde (Frontend)
const getCurrentHour = () => {
  return new Date().getHours();
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
  const [currentHour, setCurrentHour] = useState(getCurrentHour());

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
      // Fehler beim Abrufen der Begrüßung
    }
  });

  // Zeit-Update alle Minute
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const newTimePeriod = getTimePeriod();
      const newHour = getCurrentHour();
      
      if (newTimePeriod !== timePeriod) {
        setTimePeriod(newTimePeriod);
      }
      if (newHour !== currentHour) {
        setCurrentHour(newHour);
      }
    }, 60000); // Jede Minute

    return () => clearInterval(timer);
  }, [timePeriod, currentHour]);

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

  // Bestimme die Stunde-Anzeige
  const getHourText = () => {
    if (greetingData?.hour !== undefined) {
      return `${greetingData.hour}:00 Uhr`;
    }
    return `${currentHour}:00 Uhr`;
  };

  // Trenne Text und Emojis für bessere Darstellung
  const parseGreetingText = (text) => {
    // Regex für Emojis (Unicode-Bereiche für Emojis)
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = emojiRegex.exec(text)) !== null) {
      // Text vor dem Emoji
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }
      
      // Emoji
      parts.push({
        type: 'emoji',
        content: match[0]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Restlicher Text nach dem letzten Emoji
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  return (
    <div className={`dynamic-greeting ${className}`}>
      <div className="flex items-center space-x-3">
        {/* Emoji */}
        <span className="text-2xl md:text-3xl filter-none" style={{ filter: 'none' }}>
          {getEmoji()}
        </span>
        
        {/* Begrüßungstext */}
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold">
            {parseGreetingText(getDisplayGreeting()).map((part, index) => (
              part.type === 'emoji' ? (
                <span key={index} className="filter-none" style={{ filter: 'none' }}>
                  {part.content}
                </span>
              ) : (
                <span key={index} className="text-gradient">
                  {part.content}
                </span>
              )
            ))}
          </h1>
          
          {/* Tageszeit und Stunde-Anzeige */}
          {showTimePeriod && (
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                {getTimePeriodText()}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {getHourText()}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
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
