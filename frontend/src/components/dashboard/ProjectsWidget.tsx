import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderOpen, 
  Users, 
  Calendar,
  ArrowRight,
  Target,
  TrendingUp
} from 'lucide-react';
import { DashboardProject } from '../../types/dashboard';

interface ProjectsWidgetProps {
  projects: DashboardProject[];
  loading?: boolean;
  className?: string;
}

const ProjectsWidget: React.FC<ProjectsWidgetProps> = ({ 
  projects, 
  loading = false, 
  className = "" 
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'active': 
      case 'in_progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'planning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'on_hold': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'low': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning': return 'Planung';
      case 'active': return 'Aktiv';
      case 'in_progress': return 'In Bearbeitung';
      case 'on_hold': return 'Pausiert';
      case 'completed': return 'Abgeschlossen';
      case 'cancelled': return 'Abgebrochen';
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-green-600';
    if (progress >= 50) return 'from-blue-500 to-blue-600';
    if (progress >= 25) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const handleProjectClick = (project: DashboardProject) => {
    // Demo-Projekte nicht anklickbar machen
    if (project.id.startsWith('demo-')) {
      return;
    }
    
    navigate(`/projects?selected=${project.id}`);
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
          <FolderOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Zuletzt aktualisierte Projekte
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {projects.length}
          </span>
          <button
            onClick={() => navigate('/projects')}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Alle Projekte anzeigen"
          >
            <ArrowRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Keine Projekte gefunden
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
            Erstelle dein erstes Projekt! 🚀
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group"
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {project.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {project.ownerUsername}
                  </p>
                </div>
                <TrendingUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>

              {/* Status and Priority */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                  {getPriorityText(project.priority)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <span>Fortschritt</span>
                  <span>{project.completionPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full bg-gradient-to-r ${getProgressColor(project.completionPercentage)} transition-all duration-300`}
                    style={{ width: `${project.completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{project.moduleCount} Module</span>
                  </div>
                  {project.teamName && (
                    <div className="flex items-center gap-1">
                      <span>{project.teamName}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(project.updatedAt).toLocaleDateString('de-DE')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsWidget;
