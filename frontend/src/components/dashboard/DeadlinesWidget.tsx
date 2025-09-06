import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Target
} from 'lucide-react';
import { DashboardDeadline } from '../../types/dashboard';

interface DeadlinesWidgetProps {
  deadlines: DashboardDeadline[];
  loading?: boolean;
  className?: string;
}

const DeadlinesWidget: React.FC<DeadlinesWidgetProps> = ({ 
  deadlines, 
  loading = false, 
  className = "" 
}) => {
  const navigate = useNavigate();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'low': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Niedrig';
      case 'medium': return 'Mittel';
      case 'high': return 'Hoch';
      case 'critical': return 'Kritisch';
      default: return priority;
    }
  };

  const getUrgencyColor = (daysUntilDue: number | null) => {
    if (daysUntilDue === null) return 'text-gray-500';
    if (daysUntilDue < 0) return 'text-red-500';
    if (daysUntilDue <= 1) return 'text-red-500';
    if (daysUntilDue <= 3) return 'text-orange-500';
    return 'text-green-500';
  };

  const getUrgencyText = (daysUntilDue: number | null) => {
    if (daysUntilDue === null) return 'Kein Datum';
    if (daysUntilDue < 0) return 'Überfällig';
    if (daysUntilDue === 0) return 'Heute';
    if (daysUntilDue === 1) return 'Morgen';
    return `in ${daysUntilDue} Tagen`;
  };

  const getUrgencyIcon = (daysUntilDue: number | null) => {
    if (daysUntilDue === null) return Clock;
    if (daysUntilDue < 0) return AlertTriangle;
    if (daysUntilDue <= 1) return AlertTriangle;
    if (daysUntilDue <= 3) return Clock;
    return CheckCircle;
  };

  const handleDeadlineClick = (deadline: DashboardDeadline) => {
    // Demo-Deadlines nicht anklickbar machen
    if (deadline.id.startsWith('demo-')) {
      return;
    }
    
    navigate(`/projects?selected=${deadline.projectId}&module=${deadline.id}`);
  };

  if (loading) {
    return (
      <div className={`bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-40 animate-pulse"></div>
          <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Nächste Deadlines
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {deadlines.length}
          </span>
          <button
            onClick={() => navigate('/projects')}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Alle Deadlines anzeigen"
          >
            <ArrowRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Deadlines List */}
      {deadlines.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-400 dark:text-green-500 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Keine anstehenden Deadlines
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
            Alles im Zeitplan! 🎯
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {deadlines.map((deadline) => {
            const UrgencyIcon = getUrgencyIcon(deadline.daysUntilDue);
            
            return (
              <div
                key={deadline.id}
                onClick={() => handleDeadlineClick(deadline)}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group"
              >
                {/* Deadline Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {deadline.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {deadline.projectName}
                    </p>
                  </div>
                  <UrgencyIcon className={`w-4 h-4 flex-shrink-0 ${getUrgencyColor(deadline.daysUntilDue)}`} />
                </div>

                {/* Priority and Urgency */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(deadline.priority)}`}>
                    {getPriorityText(deadline.priority)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(deadline.daysUntilDue)} bg-slate-100 dark:bg-slate-700`}>
                    {getUrgencyText(deadline.daysUntilDue)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <span>Fortschritt</span>
                    <span>{deadline.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        deadline.completionPercentage >= 80 
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : deadline.completionPercentage >= 50
                          ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                      }`}
                      style={{ width: `${deadline.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(deadline.dueDate).toLocaleDateString('de-DE')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{deadline.assignedUsername || 'Nicht zugewiesen'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeadlinesWidget;
