import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Calendar,
  User,
  ArrowRight,
  Target
} from 'lucide-react';
import { DashboardTask } from '../../types/dashboard';

interface OpenTasksWidgetProps {
  tasks: DashboardTask[];
  loading?: boolean;
  className?: string;
}

const OpenTasksWidget: React.FC<OpenTasksWidgetProps> = ({ 
  tasks, 
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'testing': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'not_started': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not_started': return 'Nicht begonnen';
      case 'in_progress': return 'In Bearbeitung';
      case 'testing': return 'In Tests';
      case 'completed': return 'Abgeschlossen';
      default: return status;
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

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const handleTaskClick = (task: DashboardTask) => {
    // Demo-Tasks nicht anklickbar machen
    if (task.id.startsWith('demo-')) {
      return;
    }
    
    navigate(`/projects?selected=${task.projectId}&module=${task.id}`);
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
          <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Meine offenen Aufgaben
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {tasks.length}
          </span>
          <button
            onClick={() => navigate('/projects')}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Alle Aufgaben anzeigen"
          >
            <ArrowRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Keine offenen Aufgaben
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
            Alle Aufgaben sind abgeschlossen! 🎉
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleTaskClick(task)}
              className={`p-3 rounded-lg border transition-colors group ${
                task.id.startsWith('demo-') 
                  ? 'border-amber-200 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/20 cursor-default' 
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer'
              }`}
            >
              {/* Task Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {task.name}
                    {task.id.startsWith('demo-') && (
                      <span className="ml-2 text-xs text-amber-600 dark:text-amber-400 font-normal">
                        (Demo)
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {task.projectName}
                  </p>
                </div>
                {isOverdue(task.dueDate) && (
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
              </div>

              {/* Status and Priority */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {getStatusText(task.status)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {getPriorityText(task.priority)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <span>Fortschritt</span>
                  <span>{task.completionPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                    style={{ width: `${task.completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  {task.dueDate && (
                    <div className={`flex items-center gap-1 ${isOverdue(task.dueDate) ? 'text-red-500' : ''}`}>
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(task.dueDate).toLocaleDateString('de-DE')}</span>
                    </div>
                  )}
                  {task.estimatedHours && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{task.estimatedHours}h</span>
                    </div>
                  )}
                </div>
                {task.assignedUsername && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{task.assignedUsername}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpenTasksWidget;
