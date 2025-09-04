import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, ProtectedRoute, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import UserManagement from './components/UserManagement';
import UserSettings from './components/UserSettings';
import GreetingManagement from './components/GreetingManagement';
import TeamManagement from './components/TeamManagement';
import ProjectManagement from './components/ProjectManagement';
import ProjectDashboard from './components/ProjectDashboard';
import RegisterFormStartPage from './components/RegisterFormStartPage';
import LoginForm from './components/LoginForm';
import DynamicGreeting from './components/DynamicGreeting';
import AnonymousStats from './components/AnonymousStats';
import NotificationBell from './components/NotificationBell';
import { 
  Home, 
  FolderOpen, 
  Puzzle, 
  Settings, 
  Sun, 
  Moon, 
  Menu,
  X,
  ChevronRight,
  BarChart3,
  Users,
  Calendar,
  FileText,
  Zap,
  Bell,
  LogIn,
  UserPlus,
  Star,
  Network,
  Rocket,
  Shield,
  BarChart,
  Plus,
  Edit,
  Trash2,
  Tag,
  Link,
  GripVertical,
  Folder,
  FolderPlus
} from 'lucide-react';

// Erstelle QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Theme Toggle Component
const ThemeToggle = ({ theme, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    className={`p-2 rounded-full transition-all duration-200 hover:scale-105 ${
      theme === 'dark' 
        ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' 
        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
    }`}
    aria-label="Theme wechseln"
    title={`Wechseln zu ${theme === 'light' ? 'dunklem' : 'hellem'} Modus`}
  >
    {theme === 'light' ? (
      <Moon className="w-5 h-5" />
    ) : (
      <Sun className="w-5 h-5" />
    )}
  </button>
);

// Header Component
const Header = ({ theme, toggleTheme, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
  <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/20 dark:border-slate-700/20 shadow-lg dark:shadow-slate-900/20">
    <div className="page-container">
      <div className="flex items-center justify-between h-16">
        {/* Logo und Navigation */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Projektseite
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Home className="w-4 h-4 inline mr-2" />
              Dashboard
            </NavLink>
            
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <FolderOpen className="w-4 h-4 inline mr-2" />
              Projekte
            </NavLink>
            
            <NavLink
              to="/teams"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Users className="w-4 h-4 inline mr-2" />
              Teams
            </NavLink>
            
            
          </nav>
        </div>

        {/* Right side - Notifications, Theme, Mobile Menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationBell />

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            {/* User Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="hidden sm:flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Users className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {user?.username}
                </span>
                {isAdmin && (
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full">
                    Admin
                  </span>
                )}
                <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-90' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {user?.username}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {user?.email}
                        </div>
                        {isAdmin && (
                          <div className="text-xs text-red-600 dark:text-red-400 font-medium">
                            Administrator
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Einstellungen
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                    >
                      <Home className="w-4 h-4 mr-3" />
                      Dashboard
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          navigate('/admin');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Administration
                      </button>
                    )}
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                    >
                      <LogIn className="w-4 h-4 mr-3" />
                      Abmelden
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile User Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="sm:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              title="Menü öffnen"
            >
              <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  </header>
  );
};

// Mobile Menu Component
const MobileMenu = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    onClose();
  };

  return (
  <>
    {isOpen && (
      <div className="fixed inset-0 z-50 md:hidden">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Menü</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 space-y-2">
            <NavLink
              to="/dashboard"
              onClick={onClose}
              className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <Home className="mr-3 h-5 w-5" />
              Dashboard
            </NavLink>
            
            <NavLink
              to="/projects"
              onClick={onClose}
              className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <FolderOpen className="mr-3 h-5 w-5" />
              Projekte
            </NavLink>
            
            <NavLink
              to="/teams"
              onClick={onClose}
              className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <Users className="mr-3 h-5 w-5" />
              Teams
            </NavLink>
            
            
            
            {/* User Info und Aktionen */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
              <div className="px-4 py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                      {user?.username}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>
              
              <NavLink
                to="/settings"
                onClick={onClose}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <Settings className="mr-3 h-5 w-5" />
                Einstellungen
              </NavLink>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <LogIn className="mr-3 h-5 w-5" />
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

// Dashboard Component - jetzt mit echter Projektübersicht
const Dashboard = () => <ProjectDashboard />;

// Projektverwaltung Component - jetzt mit echter Backend-Integration
const Projects = () => <ProjectManagement />;




const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-8 fade-in">
      <div className="text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">Administration</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">Verwalten Sie Benutzer, Einstellungen und Systemkonfigurationen.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Übersicht
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'users'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Benutzerverwaltung
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'teams'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Team-Management
        </button>
        <button
          onClick={() => setActiveTab('greetings')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === 'greetings'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Begrüßungen
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">System-Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
                <span className="text-slate-700 dark:text-slate-300 text-lg">Datenbank</span>
                <span className="status-online text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">Online</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
                <span className="text-slate-700 dark:text-slate-300 text-lg">API-Server</span>
                <span className="status-online text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">Online</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
                <span className="text-slate-700 dark:text-slate-300 text-lg">Frontend</span>
                <span className="status-online text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">Online</span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">System-Informationen</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
                <span className="text-slate-700 dark:text-slate-300 text-lg">Version</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">1.0.0</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
                <span className="text-slate-700 dark:text-slate-300 text-lg">Letztes Update</span>
                <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Heute</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'teams' && <TeamManagement />}
      {activeTab === 'greetings' && <GreetingManagement />}
    </div>
  );
};

// Willkommensseite Component
const WelcomePage = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const [showAuthForms, setShowAuthForms] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' oder 'register'

  return (
    <div className={`min-h-screen relative ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      {/* Theme Toggle für Willkommensseite */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
      
      {/* Statischer Hintergrund */}
      <div className="absolute inset-0">
        {/* Einfacher statischer Gradient */}
        <div className={`absolute inset-0 ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900' 
            : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
        }`}></div>
      </div>

      {/* Hauptinhalt */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl mb-6 mx-auto">
            <Zap className="w-12 h-12 text-white" />
          </div>
          
          {/* Dynamische Begrüßung */}
          <div className="mb-6">
            <DynamicGreeting 
              className="text-center"
              showTimePeriod={true}
              refreshInterval={3600000} // 1 Stunde
              autoRefresh={true}
            />
          </div>
          
          <h1 className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-blue-400 via-purple-400 to-indigo-400' 
              : 'from-blue-600 via-purple-600 to-indigo-600'
          } bg-clip-text text-transparent mb-4`}>
            Projektseite
          </h1>
          <p className={`text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-blue-200' : 'text-slate-700'
          }`}>
            Die moderne Plattform für effiziente Projektverwaltung, Teamzusammenarbeit und Fortschrittsverfolgung
          </p>
        </div>

        {/* Kernfunktionen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-6xl w-full">
          <div className={`${
            theme === 'dark' 
              ? 'bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20' 
              : 'bg-white/80 backdrop-blur-lg border-slate-200/50 hover:bg-white/90'
          } rounded-2xl p-6 border transition-all duration-300 hover:scale-105`}>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>Projektverwaltung</h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-blue-200' : 'text-slate-600'
            }`}>Erstellen, verwalten und verfolgen Sie Projekte mit detaillierten Fortschrittsbalken</p>
          </div>

          <div className={`${
            theme === 'dark' 
              ? 'bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20' 
              : 'bg-white/80 backdrop-blur-lg border-slate-200/50 hover:bg-white/90'
          } rounded-2xl p-6 border transition-all duration-300 hover:scale-105`}>
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>Teamzusammenarbeit</h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-blue-200' : 'text-slate-600'
            }`}>Verwalten Sie Teams, Rollen und Berechtigungen für optimale Zusammenarbeit</p>
          </div>

          <div className={`${
            theme === 'dark' 
              ? 'bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20' 
              : 'bg-white/80 backdrop-blur-lg border-slate-200/50 hover:bg-white/90'
          } rounded-2xl p-6 border transition-all duration-300 hover:scale-105`}>
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>Dashboard & Analytics</h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-blue-200' : 'text-slate-600'
            }`}>Umfassende Dashboards mit Statistiken und Fortschrittsverfolgung</p>
          </div>

          <div className={`${
            theme === 'dark' 
              ? 'bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20' 
              : 'bg-white/80 backdrop-blur-lg border-slate-200/50 hover:bg-white/90'
          } rounded-2xl p-6 border transition-all duration-300 hover:scale-105`}>
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>Sicherheit & Benachrichtigungen</h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-blue-200' : 'text-slate-600'
            }`}>Sichere Datenverwaltung mit Echtzeit-Benachrichtigungen</p>
          </div>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
          <button 
            onClick={() => {
              setAuthMode('login');
              setShowAuthForms(true);
            }}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 group"
          >
            <LogIn className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span>Anmelden</span>
          </button>
          
          <button 
            onClick={() => {
              setAuthMode('register');
              setShowAuthForms(true);
            }}
            className="px-8 py-4 bg-white/10 backdrop-blur-lg border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 group"
          >
            <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            <span>Registrieren</span>
          </button>
        </div>

        {/* Anonymisierte Statistiken */}
        <div className="mb-8">
          <AnonymousStats theme={theme} />
        </div>

        {/* Zusätzliche Informationen */}
        <div className={`text-sm max-w-2xl ${
          theme === 'dark' ? 'text-blue-200' : 'text-slate-600'
        }`}>
          <p>Entwickelt mit React, Node.js und modernster Technologie • Vollständig responsive • Dark Mode Unterstützung • Echtzeit-Updates</p>
        </div>

        {/* Auth-Formulare als Overlay */}
        {showAuthForms && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`${
              theme === 'dark' 
                ? 'bg-white/10 backdrop-blur-lg border-white/20' 
                : 'bg-white/90 backdrop-blur-lg border-slate-200/50'
            } rounded-2xl p-8 border max-w-md w-full max-h-[90vh] overflow-y-auto`}>
              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {authMode === 'login' ? (
                    <LogIn className="w-8 h-8 text-white" />
                  ) : (
                    <UserPlus className="w-8 h-8 text-white" />
                  )}
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  {authMode === 'login' ? 'Anmelden' : 'Registrieren'}
                </h2>
                <p className={theme === 'dark' ? 'text-blue-200' : 'text-slate-600'}>
                  {authMode === 'login' 
                    ? 'Melden Sie sich in Ihrem Account an' 
                    : 'Erstellen Sie Ihren neuen Account'
                  }
                </p>
              </div>

              {/* Formulare */}
              {authMode === 'login' ? (
                <LoginForm 
                  onSwitchToRegister={() => setAuthMode('register')}
                  onSuccess={() => {
                    setShowAuthForms(false);
                    navigate('/dashboard');
                  }}
                />
              ) : (
                <RegisterFormStartPage 
                  onSwitchToLogin={() => setAuthMode('login')}
                  onSuccess={() => {
                    setShowAuthForms(false);
                    navigate('/dashboard');
                  }}
                />
              )}

              {/* Schließen-Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAuthForms(false)}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    theme === 'dark' 
                      ? 'text-blue-200 hover:text-white' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ← Zurück zur Startseite
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Footer Component
const Footer = () => (
  <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg dark:shadow-slate-900/20">
    <div className="page-container py-12">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-slate-900 dark:text-white">Projektseite</span>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-2">
          Made with ❤️ by <span className="font-semibold text-slate-800 dark:text-slate-200">KI</span>
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-500">
          © 2024 Projektseite. Alle Rechte vorbehalten.
        </p>
      </div>
    </div>
  </footer>
);

// App Content Component - verwendet AuthContext
const AppContent = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, designSettings, updateDesignSettings } = useAuth();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    updateDesignSettings({ ...designSettings, theme: newTheme });
  };

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-300 flex flex-col ${
        theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'
      }`}>
        <Routes>
          <Route path="/" element={<WelcomePage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/welcome" element={<WelcomePage theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Header 
                theme={theme} 
                toggleTheme={toggleTheme}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
              />
              <main className="flex-1 py-8 page-container">
                <Dashboard />
              </main>
              <Footer />
              <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute>
              <Header 
                theme={theme} 
                toggleTheme={toggleTheme}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
              />
              <main className="flex-1 py-8 page-container">
                <Projects />
              </main>
              <Footer />
              <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            </ProtectedRoute>
          } />
          <Route path="/teams" element={
            <ProtectedRoute>
              <Header 
                theme={theme} 
                toggleTheme={toggleTheme}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
              />
              <main className="flex-1">
                <TeamManagement />
              </main>
              <Footer />
              <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <Header 
                theme={theme} 
                toggleTheme={toggleTheme}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
              />
              <main className="flex-1 py-8 page-container">
                <Admin />
              </main>
              <Footer />
              <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Header 
                theme={theme} 
                toggleTheme={toggleTheme}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
              />
              <main className="flex-1 py-8 page-container">
                <UserSettings />
              </main>
              <Footer />
              <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
            </ProtectedRoute>
          } />
        </Routes>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-secondary)',
            },
          }}
        />
      </div>
    </Router>
  );
};

// Hauptkomponente
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
