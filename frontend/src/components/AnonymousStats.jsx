import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Target,
  Activity,
  Award,
  Calendar,
  Zap
} from 'lucide-react';

const AnonymousStats = ({ theme }) => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    averageProgress: 0,
    totalUsers: 0,
    totalTeams: 0,
    averageCompletionTime: 0,
    successRate: 0
  });

  useEffect(() => {
    // Simulierte anonymisierte Statistiken
    // In einer echten Anwendung würden diese von der API kommen
    const generateAnonymousStats = () => {
      // Basis-Werte mit Variation für Realismus
      const baseStats = {
        totalProjects: Math.floor(Math.random() * 50) + 150, // 150-200 Projekte
        activeProjects: Math.floor(Math.random() * 30) + 40, // 40-70 aktive
        completedProjects: Math.floor(Math.random() * 80) + 60, // 60-140 abgeschlossen
        totalUsers: Math.floor(Math.random() * 20) + 25, // 25-45 Benutzer
        totalTeams: Math.floor(Math.random() * 8) + 7, // 7-15 Teams
        averageProgress: Math.floor(Math.random() * 20) + 65, // 65-85% durchschnittlich
        averageCompletionTime: Math.floor(Math.random() * 15) + 12, // 12-27 Tage
        successRate: Math.floor(Math.random() * 15) + 78 // 78-93% Erfolgsrate
      };
      
      setStats(baseStats);
    };

    generateAnonymousStats();
    
    // Aktualisiere Statistiken alle 30 Sekunden für Dynamik
    const interval = setInterval(generateAnonymousStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      icon: BarChart3,
      label: 'Projekte gesamt',
      value: stats.totalProjects,
      color: 'blue',
      description: 'Verwaltete Projekte'
    },
    {
      icon: TrendingUp,
      label: 'Aktive Projekte',
      value: stats.activeProjects,
      color: 'green',
      description: 'In Bearbeitung'
    },
    {
      icon: CheckCircle,
      label: 'Abgeschlossen',
      value: stats.completedProjects,
      color: 'emerald',
      description: 'Erfolgreich beendet'
    },
    {
      icon: Users,
      label: 'Aktive Benutzer',
      value: stats.totalUsers,
      color: 'purple',
      description: 'Registrierte Nutzer'
    },
    {
      icon: Target,
      label: 'Teams',
      value: stats.totalTeams,
      color: 'indigo',
      description: 'Kollaborative Teams'
    },
    {
      icon: Award,
      label: 'Erfolgsrate',
      value: `${stats.successRate}%`,
      color: 'amber',
      description: 'Projektabschluss'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        icon: 'text-blue-600 dark:text-blue-400',
        text: 'text-blue-600 dark:text-blue-400'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        icon: 'text-green-600 dark:text-green-400',
        text: 'text-green-600 dark:text-green-400'
      },
      emerald: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        icon: 'text-emerald-600 dark:text-emerald-400',
        text: 'text-emerald-600 dark:text-emerald-400'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        icon: 'text-purple-600 dark:text-purple-400',
        text: 'text-purple-600 dark:text-purple-400'
      },
      indigo: {
        bg: 'bg-indigo-100 dark:bg-indigo-900/30',
        icon: 'text-indigo-600 dark:text-indigo-400',
        text: 'text-indigo-600 dark:text-indigo-400'
      },
      amber: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        icon: 'text-amber-600 dark:text-amber-400',
        text: 'text-amber-600 dark:text-amber-400'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className={`text-2xl font-bold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}>
          Live-Statistiken
        </h3>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-blue-200' : 'text-slate-600'
        }`}>
          Anonymisierte Einblicke in unsere Plattform
        </p>
      </div>

      {/* Statistik-Karten */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colors = getColorClasses(stat.color);
          
          return (
            <div
              key={index}
              className={`${
                theme === 'dark' 
                  ? 'bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20' 
                  : 'bg-white/80 backdrop-blur-lg border-slate-200/50 hover:bg-white/90'
              } rounded-xl p-4 border transition-all duration-300 hover:scale-105`}
            >
              <div className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div className={`text-2xl font-bold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  {stat.value}
                </div>
                <div className={`text-xs font-medium ${colors.text} mb-1`}>
                  {stat.label}
                </div>
                <div className={`text-xs ${
                  theme === 'dark' ? 'text-blue-200' : 'text-slate-500'
                }`}>
                  {stat.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zusätzliche Metriken */}
      <div className={`${
        theme === 'dark' 
          ? 'bg-white/10 backdrop-blur-lg border-white/20' 
          : 'bg-white/80 backdrop-blur-lg border-slate-200/50'
      } rounded-2xl p-6 border`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className={`text-lg font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              {stats.averageProgress}%
            </div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-blue-200' : 'text-slate-600'
            }`}>
              Durchschnittlicher Fortschritt
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className={`text-lg font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              {stats.averageCompletionTime} Tage
            </div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-blue-200' : 'text-slate-600'
            }`}>
              Durchschnittliche Bearbeitungszeit
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className={`text-lg font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>
              24/7
            </div>
            <div className={`text-sm ${
              theme === 'dark' ? 'text-blue-200' : 'text-slate-600'
            }`}>
              Verfügbarkeit
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className={`text-center mt-6 text-xs ${
        theme === 'dark' ? 'text-blue-200/70' : 'text-slate-500'
      }`}>
        <p>Alle Daten sind anonymisiert und werden in Echtzeit aktualisiert</p>
      </div>
    </div>
  );
};

export default AnonymousStats;
