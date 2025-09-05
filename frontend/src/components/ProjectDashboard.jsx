import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardGreeting from './DashboardGreeting';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  ArrowRight,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  PieChart,
  Activity,
  Zap,
  TrendingDown,
  Award,
  Timer,
  UserCheck,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

const ProjectDashboard = () => {
  const { projectApi, teamApi, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    overdueProjects: 0,
    averageProgress: 0,
    // Erweiterte Statistiken
    statusDistribution: {},
    priorityDistribution: {},
    teamDistribution: {},
    timeBasedStats: {
      createdThisWeek: 0,
      completedThisWeek: 0,
      dueThisWeek: 0,
      averageCompletionTime: 0
    },
    progressDistribution: {
      notStarted: 0,
      inProgress: 0,
      nearlyComplete: 0,
      completed: 0
    }
  });
  const [filters, setFilters] = useState({
    status: '',
    team_id: '',
    priority: '',
    showOverdue: true
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' oder 'list'
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Projekte laden
      const projectsResponse = await projectApi.getProjects(filters);
      const projectsData = projectsResponse.projects || [];
      
      // Teams laden
      const teamsResponse = await teamApi.getTeams();
      const teamsData = teamsResponse.teams || [];
      
      setProjects(projectsData);
      setTeams(teamsData);
      
      // Statistiken berechnen
      calculateStats(projectsData);
      
    } catch (error) {
      toast.error('Fehler beim Laden der Dashboard-Daten');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (projectsData) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const totalProjects = projectsData.length;
    const activeProjects = projectsData.filter(p => ['planning', 'active', 'in_progress'].includes(p.status)).length;
    const completedProjects = projectsData.filter(p => p.status === 'completed').length;
    const overdueProjects = projectsData.filter(p => {
      if (!p.target_date || p.status === 'completed') return false;
      return new Date(p.target_date) < now;
    }).length;
    
    const totalProgress = projectsData.reduce((sum, p) => sum + (p.completion_percentage || 0), 0);
    const averageProgress = totalProjects > 0 ? Math.round(totalProgress / totalProjects) : 0;
    
    // Status-Verteilung
    const statusDistribution = projectsData.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});
    
    // Prioritäts-Verteilung
    const priorityDistribution = projectsData.reduce((acc, project) => {
      acc[project.priority] = (acc[project.priority] || 0) + 1;
      return acc;
    }, {});
    
    // Team-Verteilung
    const teamDistribution = projectsData.reduce((acc, project) => {
      const teamName = project.team_name || 'Kein Team';
      acc[teamName] = (acc[teamName] || 0) + 1;
      return acc;
    }, {});
    
    // Zeitbasierte Statistiken
    const createdThisWeek = projectsData.filter(p => {
      const createdDate = new Date(p.created_at);
      return createdDate >= oneWeekAgo;
    }).length;
    
    const completedThisWeek = projectsData.filter(p => {
      if (p.status !== 'completed') return false;
      const updatedDate = new Date(p.updated_at);
      return updatedDate >= oneWeekAgo;
    }).length;
    
    const dueThisWeek = projectsData.filter(p => {
      if (!p.target_date || p.status === 'completed') return false;
      const targetDate = new Date(p.target_date);
      return targetDate >= now && targetDate <= oneWeekFromNow;
    }).length;
    
    // Durchschnittliche Bearbeitungszeit (nur für abgeschlossene Projekte)
    const completedProjectsWithDates = projectsData.filter(p => 
      p.status === 'completed' && p.start_date && p.updated_at
    );
    const averageCompletionTime = completedProjectsWithDates.length > 0 
      ? Math.round(
          completedProjectsWithDates.reduce((sum, p) => {
            const startDate = new Date(p.start_date);
            const endDate = new Date(p.updated_at);
            return sum + (endDate - startDate) / (1000 * 60 * 60 * 24); // Tage
          }, 0) / completedProjectsWithDates.length
        )
      : 0;
    
    // Fortschritts-Verteilung
    const progressDistribution = {
      notStarted: projectsData.filter(p => (p.completion_percentage || 0) === 0).length,
      inProgress: projectsData.filter(p => {
        const progress = p.completion_percentage || 0;
        return progress > 0 && progress < 80;
      }).length,
      nearlyComplete: projectsData.filter(p => {
        const progress = p.completion_percentage || 0;
        return progress >= 80 && progress < 100;
      }).length,
      completed: projectsData.filter(p => (p.completion_percentage || 0) === 100).length
    };
    
    setStats({
      totalProjects,
      activeProjects,
      completedProjects,
      overdueProjects,
      averageProgress,
      statusDistribution,
      priorityDistribution,
      teamDistribution,
      timeBasedStats: {
        createdThisWeek,
        completedThisWeek,
        dueThisWeek,
        averageCompletionTime
      },
      progressDistribution
    });
  };

  const getStatusColor = (status) => {
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'low': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'from-green-500 to-green-600';
    if (progress >= 50) return 'from-blue-500 to-blue-600';
    if (progress >= 25) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getTrafficLightStatus = (project) => {
    const now = new Date();
    const targetDate = project.target_date ? new Date(project.target_date) : null;
    const progress = project.completion_percentage || 0;
    
    // Rot: Überfällig oder kritische Priorität mit niedrigem Fortschritt
    if (targetDate && targetDate < now && progress < 100) {
      return { color: 'red', text: 'Überfällig', icon: AlertTriangle };
    }
    if (project.priority === 'critical' && progress < 30) {
      return { color: 'red', text: 'Kritisch', icon: AlertTriangle };
    }
    
    // Gelb: Fällig in den nächsten 7 Tagen oder mittlere Priorität
    if (targetDate) {
      const daysUntilDue = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 7 && daysUntilDue > 0 && progress < 80) {
        return { color: 'yellow', text: 'Bald fällig', icon: Clock };
      }
    }
    if (project.priority === 'high' && progress < 60) {
      return { color: 'yellow', text: 'Hoch', icon: Clock };
    }
    
    // Grün: Alles in Ordnung
    return { color: 'green', text: 'Auf Kurs', icon: CheckCircle };
  };

  const getStatusText = (status) => {
    const statusMap = {
      'planning': 'Planung',
      'active': 'Aktiv',
      'in_progress': 'In Bearbeitung',
      'on_hold': 'Pausiert',
      'completed': 'Abgeschlossen',
      'cancelled': 'Abgebrochen'
    };
    return statusMap[status] || status;
  };

  const getPriorityText = (priority) => {
    const priorityMap = {
      'low': 'Niedrig',
      'medium': 'Mittel',
      'high': 'Hoch',
      'critical': 'Kritisch'
    };
    return priorityMap[priority] || priority;
  };

  const handleProjectClick = (projectId) => {
    navigate(`/projects?selected=${projectId}`);
  };

  const filteredProjects = projects.filter(project => {
    if (filters.status && project.status !== filters.status) return false;
    if (filters.team_id && project.team_id !== parseInt(filters.team_id)) return false;
    if (filters.priority && project.priority !== filters.priority) return false;
    if (!filters.showOverdue) {
      const now = new Date();
      const targetDate = project.target_date ? new Date(project.target_date) : null;
      if (targetDate && targetDate < now && project.status !== 'completed') return false;
    }
    return true;
  });

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
        {/* Begrüßung */}
        <div className="mb-6">
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50 dark:border-slate-700/50">
            <DashboardGreeting 
              className="text-center"
              showTimePeriod={true}
              refreshInterval={1800000} // 30 Minuten
              autoRefresh={true}
            />
          </div>
        </div>

        {/* Willkommensnachricht für neue Benutzer */}
        {stats.totalProjects === 0 && (
          <div className="mb-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4 text-center">
                  Willkommen bei der Projektseite! 🎉
                </h3>
                <p className="text-blue-700 dark:text-blue-300 mb-6 text-lg text-center">
                  Du hast noch keine Projekte erstellt. Lass uns das ändern und dein erstes Projekt starten!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-center">1. Projekt erstellen</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                      Erstelle dein erstes Projekt und definiere Ziele
                    </p>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-center">2. Team bilden</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                      Lade Teammitglieder ein und arbeite zusammen
                    </p>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-center">3. Module organisieren</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                      Teile dein Projekt in überschaubare Module auf
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/projects')}
                    className="btn-primary text-lg px-8 py-4"
                  >
                    <Target className="w-5 h-5" />
                    <span>Erstes Projekt erstellen</span>
                  </button>
                  <button
                    onClick={() => navigate('/teams')}
                    className="btn-secondary text-lg px-8 py-4"
                  >
                    <Users className="w-5 h-5" />
                    <span>Team verwalten</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="page-header">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="page-title">Projekt-Dashboard</h1>
              <p className="page-subtitle">
                Übersicht über alle Projekte und deren aktuellen Status
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={loadDashboardData}
                className="btn-primary"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Aktualisieren</span>
                <span className="sm:hidden">Aktualisieren</span>
              </button>
              <button
                onClick={() => navigate('/projects')}
                className="btn-secondary"
              >
                <ArrowRight className="w-4 h-4" />
                <span className="hidden sm:inline">Zu Projekten</span>
                <span className="sm:hidden">Projekte</span>
              </button>
            </div>
          </div>
        </div>

        {/* Basis-Statistiken */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Gesamt</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalProjects}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Aktiv</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeProjects}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Abgeschlossen</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completedProjects}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Überfällig</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.overdueProjects}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Ø Fortschritt</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.averageProgress}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Erweiterte Statistiken Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowAdvancedStats(!showAdvancedStats)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-700 dark:text-slate-300"
          >
            <Info className="w-4 h-4" />
            <span>Erweiterte Statistiken</span>
            {showAdvancedStats ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Erweiterte Statistiken */}
        {showAdvancedStats && (
          <div className="space-y-6 mb-8">
            {/* Zeitbasierte Statistiken */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Diese Woche erstellt</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.timeBasedStats.createdThisWeek}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Diese Woche abgeschlossen</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.timeBasedStats.completedThisWeek}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Diese Woche fällig</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.timeBasedStats.dueThisWeek}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <CalendarDays className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Ø Bearbeitungszeit</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.timeBasedStats.averageCompletionTime}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tage</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Timer className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Verteilungs-Statistiken */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Status-Verteilung */}
              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Status-Verteilung
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.statusDistribution).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status).split(' ')[1]}`}></div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{getStatusText(status)}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prioritäts-Verteilung */}
              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Prioritäts-Verteilung
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.priorityDistribution).map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(priority).split(' ')[1]}`}></div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{getPriorityText(priority)}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fortschritts-Verteilung */}
              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Fortschritts-Verteilung
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">Nicht begonnen</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{stats.progressDistribution.notStarted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">In Bearbeitung</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{stats.progressDistribution.inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">Fast fertig</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{stats.progressDistribution.nearlyComplete}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">Abgeschlossen</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{stats.progressDistribution.completed}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team-Verteilung */}
            {Object.keys(stats.teamDistribution).length > 0 && (
              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Team-Verteilung
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(stats.teamDistribution).map(([teamName, count]) => (
                    <div key={teamName} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{teamName}</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{count} Projekte</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filter */}
        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title={viewMode === 'grid' ? 'Listenansicht' : 'Kartenansicht'}
              >
                {viewMode === 'grid' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">Alle Status</option>
                <option value="planning">Planung</option>
                <option value="active">Aktiv</option>
                <option value="in_progress">In Bearbeitung</option>
                <option value="on_hold">Pausiert</option>
                <option value="completed">Abgeschlossen</option>
                <option value="cancelled">Abgebrochen</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Team
              </label>
              <select
                value={filters.team_id}
                onChange={(e) => setFilters({ ...filters, team_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">Alle Teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Priorität
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="">Alle Prioritäten</option>
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
                <option value="critical">Kritisch</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.showOverdue}
                  onChange={(e) => setFilters({ ...filters, showOverdue: e.target.checked })}
                  className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800"
                />
                <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                  Überfällige anzeigen
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Projektliste */}
        <div className="card">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Projekte ({filteredProjects.length})
            </h2>
          </div>
          
          {viewMode === 'grid' ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const trafficLight = getTrafficLightStatus(project);
                const TrafficLightIcon = trafficLight.icon;
                
                return (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                    className="card-interactive"
                  >
                    {/* Header mit Ampelsystem */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                          {project.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {project.owner_username}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-medium ${
                        trafficLight.color === 'red' ? 'badge-danger' :
                        trafficLight.color === 'yellow' ? 'badge-warning' :
                        'badge-success'
                      }`}>
                        <TrafficLightIcon className="w-3 h-3" />
                        {trafficLight.text}
                      </div>
                    </div>

                    {/* Status und Priorität */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {getPriorityText(project.priority)}
                      </span>
                    </div>

                    {/* Fortschrittsbalken */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                        <span>Fortschritt</span>
                        <span>{project.completion_percentage || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(project.completion_percentage || 0)} transition-all duration-300`}
                          style={{ width: `${project.completion_percentage || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Zusätzliche Infos */}
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {project.target_date && (
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(project.target_date).toLocaleDateString('de-DE')}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {project.module_count || 0} Module
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredProjects.map((project) => {
                const trafficLight = getTrafficLightStatus(project);
                const TrafficLightIcon = trafficLight.icon;
                
                return (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project.id)}
                    className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {project.name}
                          </h3>
                          <div className={`flex items-center gap-1 text-xs font-medium ${
                            trafficLight.color === 'red' ? 'badge-danger' :
                            trafficLight.color === 'yellow' ? 'badge-warning' :
                            'badge-success'
                          }`}>
                            <TrafficLightIcon className="w-3 h-3" />
                            {trafficLight.text}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {getStatusText(project.status)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                            {getPriorityText(project.priority)}
                          </span>
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {project.owner_username}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="flex-1 max-w-xs">
                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                              <span>Fortschritt</span>
                              <span>{project.completion_percentage || 0}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor(project.completion_percentage || 0)} transition-all duration-300`}
                                style={{ width: `${project.completion_percentage || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {project.target_date && (
                              <div className="flex items-center gap-1 mb-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(project.target_date).toLocaleDateString('de-DE')}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {project.module_count || 0} Module
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {filteredProjects.length === 0 && stats.totalProjects > 0 && (
            <div className="p-12 text-center">
              <div className="text-slate-500 dark:text-slate-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Keine Projekte gefunden</p>
                <p className="text-sm">Passen Sie die Filter an oder erstellen Sie ein neues Projekt</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;
