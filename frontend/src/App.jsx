import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { 
  Home, 
  FolderOpen, 
  Puzzle, 
  Palette, 
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
  Search,
  LogIn,
  UserPlus,
  Star,
  Network,
  Rocket,
  Shield,
  BarChart
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
    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105"
    aria-label="Theme wechseln"
  >
    {theme === 'light' ? (
      <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
    ) : (
      <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
    )}
  </button>
);

// Header Component
const Header = ({ theme, toggleTheme, isMobileMenuOpen, setIsMobileMenuOpen }) => (
  <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/20 dark:border-slate-700/20 shadow-lg dark:shadow-slate-900/20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              to="/"
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
              to="/modules"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Puzzle className="w-4 h-4 inline mr-2" />
              Module
            </NavLink>
            
            <NavLink
              to="/design"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Palette className="w-4 h-4 inline mr-2" />
              Design
            </NavLink>
            
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Admin
            </NavLink>
          </nav>
        </div>

        {/* Right side - Search, Notifications, Theme, Mobile Menu */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden sm:flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Suchen..."
              className="bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-300 placeholder-slate-500 w-32"
            />
          </div>

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105 relative">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

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

// Mobile Menu Component
const MobileMenu = ({ isOpen, onClose }) => (
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
              to="/"
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
              to="/modules"
              onClick={onClose}
              className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <Puzzle className="mr-3 h-5 w-5" />
              Module
            </NavLink>
            
            <NavLink
              to="/design"
              onClick={onClose}
              className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <Palette className="mr-3 h-5 w-5" />
              Design
            </NavLink>
            
            <NavLink
              to="/admin"
              onClick={onClose}
              className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <Settings className="mr-3 h-5 w-5" />
              Admin
            </NavLink>
          </div>
        </div>
      </div>
    )}
  </>
);

// Dashboard Component
const Dashboard = () => (
  <div className="space-y-8 fade-in">
    <div className="text-center">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
        Willkommen zurück
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
        Hier ist eine Übersicht über Ihre aktuellen Projekte und den Fortschritt.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div className="card group cursor-pointer transform hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">Aktiv</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Projekte</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">12 laufende Projekte</p>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 shadow-inner">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full shadow-lg" style={{ width: '75%' }}></div>
        </div>
      </div>

      <div className="card group cursor-pointer transform hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">Online</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Team</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">8 aktive Mitglieder</p>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 shadow-inner">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full shadow-lg" style={{ width: '90%' }}></div>
        </div>
      </div>

      <div className="card group cursor-pointer transform hover:scale-105 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <span className="text-sm font-medium text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 px-3 py-1 rounded-full">Dieser Monat</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Deadlines</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">5 anstehende Termine</p>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 shadow-inner">
          <div className="bg-gradient-to-r from-violet-500 to-violet-600 h-3 rounded-full shadow-lg" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>

    <div className="card">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Aktuelle Aktivitäten</h2>
      <div className="space-y-6">
        <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
          <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>
          <span className="text-slate-700 dark:text-slate-300 text-lg">Neues Projekt "Website Redesign" wurde erstellt</span>
          <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">vor 2 Stunden</span>
        </div>
        <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
          <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg"></div>
          <span className="text-slate-700 dark:text-slate-300 text-lg">Modul "User Authentication" abgeschlossen</span>
          <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">vor 1 Tag</span>
        </div>
        <div className="flex items-center space-x-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
          <div className="w-3 h-3 bg-amber-500 rounded-full shadow-lg"></div>
          <span className="text-slate-700 dark:text-slate-300 text-lg">Review für "Mobile App" anstehend</span>
          <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">vor 3 Tagen</span>
        </div>
      </div>
    </div>
  </div>
);

// Other Components
const Projects = () => (
  <div className="space-y-8 fade-in">
    <div className="text-center">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">Projekte</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400">Verwalten Sie Ihre Projekte und verfolgen Sie den Fortschritt.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="card group cursor-pointer transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Projekt {i}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Projekt Name {i}</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Beschreibung des Projekts und aktuelle Status.</p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 shadow-inner">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full shadow-lg" style={{ width: `${Math.random() * 100}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Modules = () => (
  <div className="space-y-8 fade-in">
    <div className="text-center">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">Module</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400">Übersicht über alle verfügbaren Module und deren Status.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {['Authentication', 'Database', 'API', 'Frontend', 'Backend', 'Testing'].map((module, i) => (
        <div key={module} className="card group cursor-pointer transform hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Puzzle className="w-7 h-7 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{module}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{module} Modul</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Modulbeschreibung und aktuelle Implementierung.</p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 shadow-inner">
            <div className="bg-gradient-to-r from-emerald-500 to-blue-600 h-3 rounded-full shadow-lg" style={{ width: `${Math.random() * 100}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Design = () => (
  <div className="space-y-8 fade-in">
    <div className="text-center">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">Design</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400">Passen Sie das Erscheinungsbild Ihrer Anwendung an.</p>
    </div>
    
    <div className="card">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Design-Einstellungen</h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
          <span className="text-slate-700 dark:text-slate-300 text-lg">Theme</span>
          <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Automatisch</span>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
          <span className="text-slate-700 dark:text-slate-300 text-lg">Schriftart</span>
          <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Inter</span>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
          <span className="text-slate-700 dark:text-slate-300 text-lg">Farbschema</span>
          <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Blau</span>
        </div>
      </div>
    </div>
  </div>
);

const Admin = () => (
  <div className="space-y-8 fade-in">
    <div className="text-center">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">Administration</h1>
      <p className="text-xl text-slate-600 dark:text-slate-400">Verwalten Sie Benutzer, Einstellungen und Systemkonfigurationen.</p>
    </div>
    
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
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Benutzer-Verwaltung</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
            <span className="text-slate-700 dark:text-slate-300 text-lg">Aktive Benutzer</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">24</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200">
            <span className="text-slate-700 dark:text-slate-300 text-lg">Neue Anmeldungen</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">3 heute</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Willkommensseite Component
const WelcomePage = ({ onEnterApp }) => {
  const [stars, setStars] = useState([]);
  const [networks, setNetworks] = useState([]);

  useEffect(() => {
    // Sterne erstellen
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      animationDelay: Math.random() * 3
    }));
    setStars(newStars);

    // Netzwerk-Knoten erstellen
    const newNetworks = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      connections: Math.floor(Math.random() * 3) + 1
    }));
    setNetworks(newNetworks);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Hintergrund-Animation */}
      <div className="absolute inset-0">
        {/* Sterne */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${star.animationDelay}s`
            }}
          />
        ))}
        
        {/* Netzwerk-Verbindungen */}
        <svg className="absolute inset-0 w-full h-full">
          {networks.map((node) => (
            <g key={node.id}>
              <circle
                cx={`${node.x}%`}
                cy={`${node.y}%`}
                r="2"
                fill="rgba(59, 130, 246, 0.6)"
                className="animate-pulse"
              />
              {/* Verbindungslinien zu anderen Knoten */}
              {networks.slice(node.id + 1).slice(0, node.connections).map((targetNode) => (
                <line
                  key={`${node.id}-${targetNode.id}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${targetNode.x}%`}
                  y2={`${targetNode.y}%`}
                  stroke="rgba(59, 130, 246, 0.3)"
                  strokeWidth="0.5"
                  className="animate-pulse"
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* Hauptinhalt */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl mb-6 mx-auto">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            Projektseite
          </h1>
          <p className="text-xl md:text-2xl text-blue-200 max-w-2xl mx-auto leading-relaxed">
            Die moderne Plattform für effiziente Projektverwaltung und Teamzusammenarbeit
          </p>
        </div>

        {/* Kernfunktionen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-6xl w-full">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Projektverwaltung</h3>
            <p className="text-blue-200 text-sm">Organisieren Sie Ihre Projekte effizient und übersichtlich</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Teamzusammenarbeit</h3>
            <p className="text-blue-200 text-sm">Arbeiten Sie nahtlos mit Ihrem Team zusammen</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Fortschrittsverfolgung</h3>
            <p className="text-blue-200 text-sm">Behalten Sie den Überblick über alle Projekte</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Sicherheit</h3>
            <p className="text-blue-200 text-sm">Ihre Daten sind bei uns sicher und geschützt</p>
          </div>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={onEnterApp}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
          >
            <Rocket className="w-5 h-5" />
            <span>App starten</span>
          </button>
          
          <div className="flex gap-3">
            <button className="px-6 py-4 bg-white/10 backdrop-blur-lg border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2">
              <LogIn className="w-5 h-5" />
              <span>Anmelden</span>
            </button>
            
            <button className="px-6 py-4 bg-white/10 backdrop-blur-lg border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2">
              <UserPlus className="w-5 h-5" />
              <span>Registrieren</span>
            </button>
          </div>
        </div>

        {/* Zusätzliche Informationen */}
        <div className="text-blue-200 text-sm max-w-2xl">
          <p>Entwickelt mit modernster Technologie • Vollständig responsive • Dark Mode Unterstützung</p>
        </div>
      </div>
    </div>
  );
};

// Footer Component
const Footer = () => (
  <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg dark:shadow-slate-900/20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

// Hauptkomponente
function App() {
  const [theme, setTheme] = useState('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleEnterApp = () => {
    setShowWelcome(false);
  };

  // Wenn Willkommensseite angezeigt wird, zeige nur diese
  if (showWelcome) {
    return (
      <QueryClientProvider client={queryClient}>
        <WelcomePage onEnterApp={handleEnterApp} />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex flex-col">
          <Header 
            theme={theme} 
            toggleTheme={toggleTheme}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
          
          {/* Hauptinhalt */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/design" element={<Design />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
        
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        
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
      </Router>
    </QueryClientProvider>
  );
}

export default App;
