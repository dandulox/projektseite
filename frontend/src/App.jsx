import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, ProtectedRoute, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import UserManagement from './components/UserManagement';
import UserSettings from './components/UserSettings';
import RegisterFormStartPage from './components/RegisterFormStartPage';
import LoginForm from './components/LoginForm';
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
            
            {isAdmin && (
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
            )}
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
            
            {isAdmin && (
              <NavLink
                to="/admin"
                onClick={onClose}
                className="flex items-center px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <Settings className="mr-3 h-5 w-5" />
                Admin
              </NavLink>
            )}
            
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

// Projektverwaltung Component
const Projects = () => {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Website Redesign",
      priority: "Hoch",
      tags: ["Frontend", "Design"],
      links: ["https://github.com/project1", "https://figma.com/design1"],
      category: "Webentwicklung",
      subcategory: "Frontend",
      status: "In Bearbeitung",
      progress: 65,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Mobile App",
      priority: "Mittel",
      tags: ["Mobile", "React Native"],
      links: ["https://github.com/project2"],
      category: "Mobile Entwicklung",
      subcategory: "iOS",
      status: "Planung",
      progress: 25,
      createdAt: "2024-01-20"
    },
    {
      id: 3,
      name: "API Backend",
      priority: "Hoch",
      tags: ["Backend", "Node.js"],
      links: ["https://github.com/project3"],
      category: "Backend Entwicklung",
      subcategory: "API",
      status: "Abgeschlossen",
      progress: 100,
      createdAt: "2024-01-10"
    }
  ]);

  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Webentwicklung",
      subcategories: ["Frontend", "Backend", "Fullstack"]
    },
    {
      id: 2,
      name: "Mobile Entwicklung",
      subcategories: ["iOS", "Android", "Cross-Platform"]
    },
    {
      id: 3,
      name: "Backend Entwicklung",
      subcategories: ["API", "Datenbank", "Microservices"]
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [draggedProject, setDraggedProject] = useState(null);
  const [filterCategory, setFilterCategory] = useState("Alle");
  const [filterPriority, setFilterPriority] = useState("Alle");

  const handleDragStart = (e, project) => {
    setDraggedProject(project);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetProject) => {
    e.preventDefault();
    if (!draggedProject || draggedProject.id === targetProject.id) return;

    const newProjects = [...projects];
    const draggedIndex = newProjects.findIndex(p => p.id === draggedProject.id);
    const targetIndex = newProjects.findIndex(p => p.id === targetProject.id);

    // Projekte neu anordnen
    const [draggedItem] = newProjects.splice(draggedIndex, 1);
    newProjects.splice(targetIndex, 0, draggedItem);

    setProjects(newProjects);
    setDraggedProject(null);
  };

  const handleCreateProject = (projectData) => {
    const newProject = {
      ...projectData,
      id: Date.now(),
      status: "Planung",
      progress: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProjects([...projects, newProject]);
    setShowCreateForm(false);
  };

  const handleEditProject = (projectData) => {
    setProjects(projects.map(p => p.id === projectData.id ? projectData : p));
    setEditingProject(null);
  };

  const handleDeleteProject = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const filteredProjects = projects.filter(project => {
    const categoryMatch = filterCategory === "Alle" || project.category === filterCategory;
    const priorityMatch = filterPriority === "Alle" || project.priority === filterPriority;
    return categoryMatch && priorityMatch;
  });

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Projektverwaltung
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Verwalten Sie Ihre Projekte und organisieren Sie sie nach Kategorien und Prioritäten.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Neues Projekt</span>
          </button>
        </div>
      </div>

      {/* Filter und Kategorien */}
      <div className="card">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Kategorie:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Alle">Alle Kategorien</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Priorität:</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Alle">Alle Prioritäten</option>
              <option value="Hoch">Hoch</option>
              <option value="Mittel">Mittel</option>
              <option value="Niedrig">Niedrig</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projektübersicht mit Drag & Drop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <div
            key={project.id}
            draggable
            onDragStart={(e) => handleDragStart(e, project)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, project)}
            className={`card group cursor-move transform transition-all duration-300 hover:scale-105 ${
              draggedProject?.id === project.id ? 'opacity-50' : ''
            }`}
          >
            {/* Drag Handle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <GripVertical className="w-4 h-4 text-slate-400 cursor-move" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  #{project.id}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingProject(project)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
                >
                  <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>

            {/* Projektinhalt */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {project.name}
              </h3>
              
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.priority === 'Hoch' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                  project.priority === 'Mittel' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                }`}>
                  {project.priority}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {project.status}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Folder className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {project.category} → {project.subcategory}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {project.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-full flex items-center space-x-1"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>

              {/* Links */}
              {project.links.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Link className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Links:</span>
                  </div>
                  <div className="space-y-1">
                    {project.links.map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-blue-600 dark:text-blue-400 hover:underline truncate"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Fortschrittsbalken */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Fortschritt</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full shadow-lg transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Erstellungsdatum */}
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Erstellt: {new Date(project.createdAt).toLocaleDateString('de-DE')}
            </div>
          </div>
        ))}
      </div>

      {/* Erstellungs-/Bearbeitungsformular */}
      {(showCreateForm || editingProject) && (
        <ProjectForm
          project={editingProject}
          categories={categories}
          onSubmit={editingProject ? handleEditProject : handleCreateProject}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
};

// Projektformular Component
const ProjectForm = ({ project, categories, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    priority: project?.priority || 'Mittel',
    tags: project?.tags?.join(', ') || '',
    links: project?.links?.join('\n') || '',
    category: project?.category || '',
    subcategory: project?.subcategory || ''
  });

  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const projectData = {
      ...formData,
      id: project?.id,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      links: formData.links.split('\n').map(link => link.trim()).filter(link => link)
    };

    onSubmit(projectData);
  };

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      // Hier würde normalerweise die Kategorie zur Datenbank hinzugefügt
      setNewCategory('');
    }
  };

  const handleAddSubcategory = () => {
    if (newSubcategory.trim() && formData.category) {
      // Hier würde normalerweise die Unterkategorie zur Datenbank hinzugefügt
      setNewSubcategory('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {project ? 'Projekt bearbeiten' : 'Neues Projekt erstellen'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Projektname */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Projektname *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Projektname eingeben..."
            />
          </div>

          {/* Priorität */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Priorität
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Hoch">Hoch</option>
              <option value="Mittel">Mittel</option>
              <option value="Niedrig">Niedrig</option>
            </select>
          </div>

          {/* Kategorie und Unterkategorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Kategorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value, subcategory: ''})}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Kategorie auswählen...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Unterkategorie
              </label>
              <select
                value={formData.subcategory}
                onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!formData.category}
              >
                <option value="">Unterkategorie auswählen...</option>
                {formData.category && categories.find(cat => cat.name === formData.category)?.subcategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Neue Kategorie/Unterkategorie hinzufügen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Neue Kategorie hinzufügen
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Kategoriename..."
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Neue Unterkategorie hinzufügen
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Unterkategoriename..."
                  disabled={!formData.category}
                />
                <button
                  type="button"
                  onClick={handleAddSubcategory}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                  disabled={!formData.category}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tags (durch Kommas getrennt)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Frontend, Backend, Design..."
            />
          </div>

          {/* Links */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Links (ein Link pro Zeile)
            </label>
            <textarea
              value={formData.links}
              onChange={(e) => setFormData({...formData, links: e.target.value})}
              rows="3"
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://github.com/project...&#10;https://figma.com/design..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors duration-200"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
            >
              {project ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
          <h1 className={`text-6xl md:text-7xl font-bold bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-blue-400 via-purple-400 to-indigo-400' 
              : 'from-blue-600 via-purple-600 to-indigo-600'
          } bg-clip-text text-transparent mb-4`}>
            Projektseite
          </h1>
          <p className={`text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed ${
            theme === 'dark' ? 'text-blue-200' : 'text-slate-700'
          }`}>
            Die moderne Plattform für effiziente Projektverwaltung und Teamzusammenarbeit
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
            }`}>Organisieren Sie Ihre Projekte effizient und übersichtlich</p>
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
            }`}>Arbeiten Sie nahtlos mit Ihrem Team zusammen</p>
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
            }`}>Fortschrittsverfolgung</h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-blue-200' : 'text-slate-600'
            }`}>Behalten Sie den Überblick über alle Projekte</p>
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
            }`}>Sicherheit</h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-blue-200' : 'text-slate-600'
            }`}>Ihre Daten sind bei uns sicher und geschützt</p>
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

        {/* Zusätzliche Informationen */}
        <div className={`text-sm max-w-2xl ${
          theme === 'dark' ? 'text-blue-200' : 'text-slate-600'
        }`}>
          <p>Entwickelt mit modernster Technologie • Vollständig responsive • Dark Mode Unterstützung</p>
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

// Hauptkomponente
function App() {
  const [theme, setTheme] = useState('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
              <Route path="/modules" element={
                <ProtectedRoute>
                  <Header 
                    theme={theme} 
                    toggleTheme={toggleTheme}
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                  />
                  <main className="flex-1 py-8 page-container">
                    <Modules />
                  </main>
                  <Footer />
                  <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
                </ProtectedRoute>
              } />
              <Route path="/design" element={
                <ProtectedRoute>
                  <Header 
                    theme={theme} 
                    toggleTheme={toggleTheme}
                    isMobileMenuOpen={isMobileMenuOpen}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                  />
                  <main className="flex-1 py-8 page-container">
                    <Design />
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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
