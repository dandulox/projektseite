import React from 'react';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Timer,
  Target,
  BarChart3
} from 'lucide-react';

const TaskStats = ({ stats, loading, className = '' }) => {
  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const {
    total_tasks = 0,
    todo_count = 0,
    in_progress_count = 0,
    review_count = 0,
    completed_count = 0,
    overdue_count = 0,
    due_soon_count = 0,
    avg_completion_hours = 0
  } = stats;

  const completionRate = total_tasks > 0 ? Math.round((completed_count / total_tasks) * 100) : 0;
  const inProgressRate = total_tasks > 0 ? Math.round((in_progress_count / total_tasks) * 100) : 0;

  const statCards = [
    {
      title: 'Gesamt Aufgaben',
      value: total_tasks,
      icon: CheckSquare,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      description: 'Alle zugewiesenen Aufgaben'
    },
    {
      title: 'In Bearbeitung',
      value: in_progress_count,
      icon: Clock,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      description: `${inProgressRate}% aller Aufgaben`
    },
    {
      title: 'Abgeschlossen',
      value: completed_count,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      description: `${completionRate}% aller Aufgaben`
    },
    {
      title: 'Überfällig',
      value: overdue_count,
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      description: 'Benötigen sofortige Aufmerksamkeit'
    }
  ];

  return (
    <div className={className}>
      {/* Hauptstatistiken */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zusätzliche Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fälligkeitsstatistiken */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Fälligkeiten
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Fällig in 3 Tagen
              </span>
              <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                {due_soon_count}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Überfällig
              </span>
              <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                {overdue_count}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Ohne Fälligkeitsdatum
              </span>
              <span className="text-lg font-semibold text-slate-600 dark:text-slate-400">
                {total_tasks - (overdue_count + due_soon_count)}
              </span>
            </div>
          </div>
        </div>

        {/* Status-Verteilung */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Status-Verteilung
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Zu erledigen
              </span>
              <span className="text-lg font-semibold text-slate-600 dark:text-slate-400">
                {todo_count}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Zur Prüfung
              </span>
              <span className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                {review_count}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Abgebrochen
              </span>
              <span className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                {total_tasks - (todo_count + in_progress_count + review_count + completed_count)}
              </span>
            </div>
          </div>
        </div>

        {/* Produktivitätsstatistiken */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <Timer className="h-5 w-5 text-teal-600 dark:text-teal-400 mr-2" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Produktivität
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Ø Bearbeitungszeit
              </span>
              <span className="text-lg font-semibold text-teal-600 dark:text-teal-400">
                {avg_completion_hours ? `${avg_completion_hours.toFixed(1)}h` : '-'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Abschlussrate
              </span>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                {completionRate}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Aktive Aufgaben
              </span>
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {todo_count + in_progress_count + review_count}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fortschrittsbalken */}
      {total_tasks > 0 && (
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Gesamtfortschritt
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                <span>Abgeschlossen</span>
                <span>{completed_count} von {total_tasks}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                <span>In Bearbeitung</span>
                <span>{in_progress_count} von {total_tasks}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${inProgressRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskStats;
