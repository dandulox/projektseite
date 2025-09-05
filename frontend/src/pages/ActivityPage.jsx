import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ActivityFeed from '../components/ActivityFeed';
import { 
  Activity, 
  Filter, 
  RefreshCw, 
  Calendar,
  User,
  Users,
  FolderOpen,
  Package,
  Clock,
  TrendingUp
} from 'lucide-react';

const ActivityPage = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [stats, setStats] = useState({
    totalActivities: 0,
    todayActivities: 0,
    thisWeekActivities: 0,
    projectActivities: 0,
    moduleActivities: 0
  });

  const fetchActivityStats = async () => {
    if (!user || !token) return;

    try {
      // Hier könnten wir Statistiken von einem speziellen Endpoint abrufen
      // Für jetzt verwenden wir die ActivityFeed-Daten
      setStats({
        totalActivities: 0,
        todayActivities: 0,
        thisWeekActivities: 0,
        projectActivities: 0,
        moduleActivities: 0
      });
    } catch (error) {
      console.error('Fehler beim Laden der Aktivitätsstatistiken:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityStats();
  }, [user, token]);

  const timeFilters = [
    { value: 'all', label: 'Alle Zeiten' },
    { value: 'today', label: 'Heute' },
    { value: 'week', label 'Diese Woche' },
    { value: 'month', label: 'Dieser Monat' }
  ];

  const activityTabs = [
    { value: 'all', label: 'Alle Aktivitäten', icon: Activity },
    { value: 'project', label: 'Projekte', icon: FolderOpen },
    { value: 'module', label: 'Module', icon: Package },
    { value: 'user', label: 'Meine Aktivitäten', icon: User },
    { value: 'team', label: 'Team-Aktivitäten', icon: Users }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Activity className="w-8 h-8 text-blue-600" />
                Aktivitätslog
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Verfolgen Sie alle Änderungen und Aktivitäten in Ihren Projekten und Modulen
              </p>
            </div>
            <button
              onClick={fetchActivityStats}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Aktualisieren
            </button>
          </div>
        </div>

        {/* Statistiken */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Gesamt</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalActivities}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Heute</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.todayActivities}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Diese Woche</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.thisWeekActivities}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Projekte</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.projectActivities}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Module</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.moduleActivities}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter und Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Aktivitäts-Tabs */}
            <div className="flex flex-wrap gap-2">
              {activityTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.value
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Zeit-Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {timeFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Aktivitätsfeed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Haupt-Aktivitätsfeed */}
          <div className="lg:col-span-2">
            <ActivityFeed 
              userId={user?.id}
              showHeader={false}
              limit={50}
              className="h-full"
            />
          </div>

          {/* Sidebar mit zusätzlichen Informationen */}
          <div className="space-y-6">
            {/* Schnellzugriff */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Schnellzugriff
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Meine Projekte</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Alle meine Projekte anzeigen</p>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Meine Module</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Alle meine Module anzeigen</p>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Meine Teams</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Team-Aktivitäten anzeigen</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Aktivitäts-Tipps */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                💡 Tipp
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Das Aktivitätslog hilft Ihnen dabei, den Überblick über alle Änderungen in Ihren Projekten zu behalten. 
                Benachrichtigungen werden automatisch an alle betroffenen Teammitglieder gesendet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;
