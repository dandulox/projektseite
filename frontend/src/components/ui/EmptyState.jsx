import React from 'react';
import { 
  CheckSquare, 
  Calendar, 
  FolderOpen, 
  Users, 
  AlertTriangle, 
  Search,
  Plus,
  RefreshCw,
  FileText,
  BarChart3,
  Settings,
  Bell
} from 'lucide-react';

// Icon-Mapping für verschiedene Kontexte
const ICON_MAP = {
  tasks: CheckSquare,
  deadlines: Calendar,
  projects: FolderOpen,
  teams: Users,
  notifications: Bell,
  dashboard: BarChart3,
  settings: Settings,
  search: Search,
  error: AlertTriangle,
  default: FileText
};

// Vordefinierte Empty-State-Varianten
const EMPTY_STATE_VARIANTS = {
  // Tasks
  noTasks: {
    icon: 'tasks',
    title: 'Keine Aufgaben gefunden',
    description: 'Sie haben noch keine Aufgaben zugewiesen bekommen.',
    action: {
      text: 'Erste Aufgabe erstellen',
      icon: Plus,
      onClick: () => console.log('Create task')
    }
  },
  
  // Deadlines
  noDeadlines: {
    icon: 'deadlines',
    title: 'Keine Deadlines in Sicht',
    description: 'Alle Ihre Aufgaben haben noch keine Fälligkeitsdaten.',
    action: {
      text: 'Deadline hinzufügen',
      icon: Plus,
      onClick: () => console.log('Add deadline')
    }
  },
  
  // Projects
  noProjects: {
    icon: 'projects',
    title: 'Keine Projekte vorhanden',
    description: 'Erstellen Sie Ihr erstes Projekt, um loszulegen.',
    action: {
      text: 'Projekt erstellen',
      icon: Plus,
      onClick: () => console.log('Create project')
    }
  },
  
  // Teams
  noTeams: {
    icon: 'teams',
    title: 'Keine Teams verfügbar',
    description: 'Sie sind noch keinem Team zugewiesen.',
    action: {
      text: 'Team beitreten',
      icon: Plus,
      onClick: () => console.log('Join team')
    }
  },
  
  // Notifications
  noNotifications: {
    icon: 'notifications',
    title: 'Keine Benachrichtigungen',
    description: 'Sie haben derzeit keine neuen Benachrichtigungen.',
    action: null
  },
  
  // Search Results
  noSearchResults: {
    icon: 'search',
    title: 'Keine Ergebnisse gefunden',
    description: 'Versuchen Sie andere Suchbegriffe oder erweitern Sie Ihre Suche.',
    action: {
      text: 'Suche zurücksetzen',
      icon: RefreshCw,
      onClick: () => console.log('Reset search')
    }
  },
  
  // Error States
  errorLoading: {
    icon: 'error',
    title: 'Fehler beim Laden',
    description: 'Die Daten konnten nicht geladen werden. Bitte versuchen Sie es erneut.',
    action: {
      text: 'Erneut versuchen',
      icon: RefreshCw,
      onClick: () => console.log('Retry')
    }
  },
  
  // Permission Denied
  noPermission: {
    icon: 'error',
    title: 'Keine Berechtigung',
    description: 'Sie haben keine Berechtigung, diese Inhalte anzuzeigen.',
    action: {
      text: 'An Administrator wenden',
      icon: Settings,
      onClick: () => console.log('Contact admin')
    }
  }
};

// Hauptkomponente
const EmptyState = ({ 
  variant = 'default',
  icon,
  title,
  description,
  action,
  className = '',
  size = 'medium' // small, medium, large
}) => {
  // Variante oder direkte Props verwenden
  const config = typeof variant === 'string' && EMPTY_STATE_VARIANTS[variant] 
    ? EMPTY_STATE_VARIANTS[variant] 
    : { icon, title, description, action };

  const IconComponent = ICON_MAP[config.icon] || ICON_MAP.default;
  
  // Größen-Klassen
  const sizeClasses = {
    small: {
      container: 'py-8',
      icon: 'w-12 h-12',
      title: 'text-lg',
      description: 'text-sm',
      action: 'text-sm px-3 py-2'
    },
    medium: {
      container: 'py-12',
      icon: 'w-16 h-16',
      title: 'text-xl',
      description: 'text-base',
      action: 'text-base px-4 py-2'
    },
    large: {
      container: 'py-16',
      icon: 'w-20 h-20',
      title: 'text-2xl',
      description: 'text-lg',
      action: 'text-lg px-6 py-3'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`text-center ${currentSize.container} ${className}`}>
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className={`${currentSize.icon} text-slate-400 dark:text-slate-500`}>
          <IconComponent className="w-full h-full" />
        </div>
      </div>

      {/* Title */}
      {config.title && (
        <h3 className={`${currentSize.title} font-semibold text-slate-900 dark:text-white mb-2`}>
          {config.title}
        </h3>
      )}

      {/* Description */}
      {config.description && (
        <p className={`${currentSize.description} text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto`}>
          {config.description}
        </p>
      )}

      {/* Action Button */}
      {config.action && (
        <div className="flex justify-center">
          <button
            onClick={config.action.onClick}
            className={`
              inline-flex items-center space-x-2
              ${currentSize.action}
              bg-blue-600 hover:bg-blue-700 
              text-white font-medium rounded-lg
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            `}
          >
            {config.action.icon && (
              <config.action.icon className="w-4 h-4" />
            )}
            <span>{config.action.text}</span>
          </button>
        </div>
      )}
    </div>
  );
};

// Spezielle Empty-State-Komponenten für häufige Anwendungsfälle
export const TasksEmptyState = ({ onCreateTask, className }) => (
  <EmptyState
    variant="noTasks"
    action={{
      text: 'Erste Aufgabe erstellen',
      icon: Plus,
      onClick: onCreateTask
    }}
    className={className}
  />
);

export const DeadlinesEmptyState = ({ onAddDeadline, className }) => (
  <EmptyState
    variant="noDeadlines"
    action={{
      text: 'Deadline hinzufügen',
      icon: Plus,
      onClick: onAddDeadline
    }}
    className={className}
  />
);

export const ProjectsEmptyState = ({ onCreateProject, className }) => (
  <EmptyState
    variant="noProjects"
    action={{
      text: 'Projekt erstellen',
      icon: Plus,
      onClick: onCreateProject
    }}
    className={className}
  />
);

export const TeamsEmptyState = ({ onJoinTeam, className }) => (
  <EmptyState
    variant="noTeams"
    action={{
      text: 'Team beitreten',
      icon: Plus,
      onClick: onJoinTeam
    }}
    className={className}
  />
);

export const NotificationsEmptyState = ({ className }) => (
  <EmptyState
    variant="noNotifications"
    className={className}
  />
);

export const SearchEmptyState = ({ onResetSearch, className }) => (
  <EmptyState
    variant="noSearchResults"
    action={{
      text: 'Suche zurücksetzen',
      icon: RefreshCw,
      onClick: onResetSearch
    }}
    className={className}
  />
);

export const ErrorEmptyState = ({ onRetry, className }) => (
  <EmptyState
    variant="errorLoading"
    action={{
      text: 'Erneut versuchen',
      icon: RefreshCw,
      onClick: onRetry
    }}
    className={className}
  />
);

export const PermissionEmptyState = ({ onContactAdmin, className }) => (
  <EmptyState
    variant="noPermission"
    action={{
      text: 'An Administrator wenden',
      icon: Settings,
      onClick: onContactAdmin
    }}
    className={className}
  />
);

export default EmptyState;
