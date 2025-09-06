import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '../contexts/AuthContext';
import DashboardGreeting from '../components/DashboardGreeting';
import OpenTasksWidget from '../components/dashboard/OpenTasksWidget';
import DeadlinesWidget from '../components/dashboard/DeadlinesWidget';
import ProjectsWidget from '../components/dashboard/ProjectsWidget';
import ProgressWidget from '../components/dashboard/ProgressWidget';
import WidgetSkeleton from '../components/dashboard/WidgetSkeleton';
import { 
  RefreshCw, 
  Settings, 
  Plus,
  BarChart3,
  CheckSquare,
  Calendar,
  FolderOpen,
  TrendingUp,
  Clock,
  AlertTriangle,
  Target,
  Users,
  Activity
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, refetch, lastUpdated } = useDashboard();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastUpdated = (timestamp: string | null) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Fehler beim Laden
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {error}
          </p>
          <button
            onClick={handleRefresh}
            className="btn-primary"
          >
            <RefreshCw className="w-4 h-4" />
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Willkommen zurück, {user?.username}! Hier ist dein Überblick.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Aktualisiert: {formatLastUpdated(lastUpdated)}
                </div>
              )}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn-primary"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Aktualisieren</span>
              </button>
              <button
                onClick={() => navigate('/projects')}
                className="btn-secondary"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Neues Projekt</span>
              </button>
            </div>
          </div>
        </div>

        {/* Begrüßung */}
        <div className="mb-8">
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
            <DashboardGreeting 
              className="text-center"
              showTimePeriod={true}
              refreshInterval={1800000} // 30 Minuten
              autoRefresh={true}
            />
          </div>
        </div>

        {/* Summary Cards */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Offene Aufgaben</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {data.summary.totalOpenTasks}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Anstehende Deadlines</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {data.summary.totalUpcomingDeadlines}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Aktive Projekte</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {data.summary.totalActiveProjects}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Ø Fortschritt</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {data.summary.averageProjectProgress}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Offene Aufgaben */}
          {loading ? (
            <WidgetSkeleton title="Meine offenen Aufgaben" count={3} />
          ) : (
            <OpenTasksWidget 
              tasks={data?.widgets.openTasks.items || []} 
              loading={loading}
            />
          )}

          {/* Anstehende Deadlines */}
          {loading ? (
            <WidgetSkeleton title="Nächste Deadlines" count={3} />
          ) : (
            <DeadlinesWidget 
              deadlines={data?.widgets.upcomingDeadlines.items || []} 
              loading={loading}
            />
          )}

          {/* Zuletzt aktualisierte Projekte */}
          {loading ? (
            <WidgetSkeleton title="Zuletzt aktualisierte Projekte" count={3} />
          ) : (
            <ProjectsWidget 
              projects={data?.widgets.recentProjects.items || []} 
              loading={loading}
            />
          )}

          {/* Projektfortschritt */}
          {loading ? (
            <WidgetSkeleton title="Projektfortschritt" count={3} />
          ) : (
            <ProgressWidget 
              projects={data?.widgets.projectProgress.items || []} 
              loading={loading}
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Schnellaktionen
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">Neues Projekt</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Projekt erstellen</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/teams')}
                className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">Team verwalten</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Teams & Mitglieder</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/projects')}
                className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">Alle Projekte</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Projektübersicht</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/30 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">Einstellungen</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">App konfigurieren</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
