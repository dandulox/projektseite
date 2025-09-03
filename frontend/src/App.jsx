import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
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
  Zap
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
    className="p-2 rounded-full hover:bg-apple-100 dark:hover:bg-apple-800 transition-colors duration-200"
    aria-label="Theme wechseln"
  >
    {theme === 'light' ? (
      <Moon className="w-5 h-5 text-apple-600 dark:text-apple-400" />
    ) : (
      <Sun className="w-5 h-5 text-apple-600 dark:text-apple-400" />
    )}
  </button>
);

// Mobile Menu Component
const MobileMenu = ({ isOpen, onClose, children }) => (
  <>
    {isOpen && (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-apple-900 shadow-apple-dark transform transition-transform duration-300 ease-in-out">
          <div className="flex items-center justify-between p-6 border-b border-apple-200 dark:border-apple-700">
            <h2 className="text-xl font-semibold text-apple-900 dark:text-white">Menü</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-apple-100 dark:hover:bg-apple-800">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    )}
  </>
);

// Navigation Component
const Navigation = ({ theme, toggleTheme, isMobileMenuOpen, setIsMobileMenuOpen }) => (
  <>
    {/* Desktop Navigation */}
    <nav className="hidden lg:flex lg:flex-col lg:w-80 lg:fixed lg:inset-y-0 lg:z-50 glass border-r border-apple-200/20 dark:border-apple-700/20">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="ml-3 text-xl font-bold text-apple-900 dark:text-white">Projektseite</h1>
        </div>
        
        <div className="mt-8 flex-grow flex flex-col">
          <div className="px-3 space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
              }
            >
              <Home className="mr-3 h-5 w-5" />
              Dashboard
              <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
            
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
              }
            >
              <FolderOpen className="mr-3 h-5 w-5" />
              Projekte
              <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
            
            <NavLink
              to="/modules"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
              }
            >
              <Puzzle className="mr-3 h-5 w-5" />
              Module
              <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
            
            <NavLink
              to="/design"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
              }
            >
              <Palette className="mr-3 h-5 w-5" />
              Design
              <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
            
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`
              }
            >
              <Settings className="mr-3 h-5 w-5" />
              Admin
              <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          </div>
        </div>
        
        <div className="px-6 mt-auto">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    </nav>

    {/* Mobile Navigation */}
    <div className="lg:hidden">
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 glass border-b border-apple-200/20 dark:border-apple-700/20">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="ml-3 text-lg font-bold text-apple-900 dark:text-white">Projektseite</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-apple-100 dark:hover:bg-apple-800 transition-colors duration-200"
          >
            <Menu className="w-5 h-5 text-apple-600 dark:text-apple-400" />
          </button>
        </div>
      </div>
    </div>

    {/* Mobile Menu */}
    <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
      <div className="space-y-1">
        <NavLink
          to="/"
          onClick={() => setIsMobileMenuOpen(false)}
          className="nav-link nav-link-inactive"
        >
          <Home className="mr-3 h-5 w-5" />
          Dashboard
        </NavLink>
        
        <NavLink
          to="/projects"
          onClick={() => setIsMobileMenuOpen(false)}
          className="nav-link nav-link-inactive"
        >
          <FolderOpen className="mr-3 h-5 w-5" />
          Projekte
        </NavLink>
        
        <NavLink
          to="/modules"
          onClick={() => setIsMobileMenuOpen(false)}
          className="nav-link nav-link-inactive"
        >
          <Puzzle className="mr-3 h-5 w-5" />
          Module
        </NavLink>
        
        <NavLink
          to="/design"
          onClick={() => setIsMobileMenuOpen(false)}
          className="nav-link nav-link-inactive"
        >
          <Palette className="mr-3 h-5 w-5" />
          Design
        </NavLink>
        
        <NavLink
          to="/admin"
          onClick={() => setIsMobileMenuOpen(false)}
          className="nav-link nav-link-inactive"
        >
          <Settings className="mr-3 h-5 w-5" />
          Admin
        </NavLink>
      </div>
    </MobileMenu>
  </>
);

// Dashboard Component
const Dashboard = () => (
  <div className="space-y-6 fade-in">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-apple-900 dark:text-white mb-4">
        Willkommen zurück
      </h1>
      <p className="text-lg text-apple-600 dark:text-apple-400 max-w-2xl mx-auto">
        Hier ist eine Übersicht über Ihre aktuellen Projekte und den Fortschritt.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="card group cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-accent-blue" />
          </div>
          <span className="text-sm text-apple-500 dark:text-apple-400">Aktiv</span>
        </div>
        <h3 className="text-lg font-semibold text-apple-900 dark:text-white mb-2">Projekte</h3>
        <p className="text-apple-600 dark:text-apple-400 mb-4">12 laufende Projekte</p>
        <div className="w-full bg-apple-200 dark:bg-apple-700 rounded-full h-2">
          <div className="bg-accent-blue h-2 rounded-full" style={{ width: '75%' }}></div>
        </div>
      </div>

      <div className="card group cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-accent-green" />
          </div>
          <span className="text-sm text-apple-500 dark:text-apple-400">Online</span>
        </div>
        <h3 className="text-lg font-semibold text-apple-900 dark:text-white mb-2">Team</h3>
        <p className="text-apple-600 dark:text-apple-400 mb-4">8 aktive Mitglieder</p>
        <div className="w-full bg-apple-200 dark:bg-apple-700 rounded-full h-2">
          <div className="bg-accent-green h-2 rounded-full" style={{ width: '90%' }}></div>
        </div>
      </div>

      <div className="card group cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-accent-purple" />
          </div>
          <span className="text-sm text-apple-500 dark:text-apple-400">Dieser Monat</span>
        </div>
        <h3 className="text-lg font-semibold text-apple-900 dark:text-white mb-2">Deadlines</h3>
        <p className="text-apple-600 dark:text-apple-400 mb-4">5 anstehende Termine</p>
        <div className="w-full bg-apple-200 dark:bg-apple-700 rounded-full h-2">
          <div className="bg-accent-purple h-2 rounded-full" style={{ width: '60%' }}></div>
        </div>
      </div>
    </div>

    <div className="card">
      <h2 className="text-xl font-semibold text-apple-900 dark:text-white mb-4">Aktuelle Aktivitäten</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-accent-blue rounded-full"></div>
          <span className="text-apple-600 dark:text-apple-400">Neues Projekt "Website Redesign" wurde erstellt</span>
          <span className="text-sm text-apple-500 dark:text-apple-400 ml-auto">vor 2 Stunden</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-accent-green rounded-full"></div>
          <span className="text-apple-600 dark:text-apple-400">Modul "User Authentication" abgeschlossen</span>
          <span className="text-sm text-apple-500 dark:text-apple-400 ml-auto">vor 1 Tag</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-accent-orange rounded-full"></div>
          <span className="text-apple-600 dark:text-apple-400">Review für "Mobile App" anstehend</span>
          <span className="text-sm text-apple-500 dark:text-apple-400 ml-auto">vor 3 Tagen</span>
        </div>
      </div>
    </div>
  </div>
);

// Other Components
const Projects = () => (
  <div className="space-y-6 fade-in">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-apple-900 dark:text-white mb-4">Projekte</h1>
      <p className="text-lg text-apple-600 dark:text-apple-400">Verwalten Sie Ihre Projekte und verfolgen Sie den Fortschritt.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="card group cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-apple-500 dark:text-apple-400">Projekt {i}</span>
          </div>
          <h3 className="text-lg font-semibold text-apple-900 dark:text-white mb-2">Projekt Name {i}</h3>
          <p className="text-apple-600 dark:text-apple-400 mb-4">Beschreibung des Projekts und aktuelle Status.</p>
          <div className="w-full bg-apple-200 dark:bg-apple-700 rounded-full h-2">
            <div className="bg-accent-blue h-2 rounded-full" style={{ width: `${Math.random() * 100}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Modules = () => (
  <div className="space-y-6 fade-in">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-apple-900 dark:text-white mb-4">Module</h1>
      <p className="text-lg text-apple-600 dark:text-apple-400">Übersicht über alle verfügbaren Module und deren Status.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {['Authentication', 'Database', 'API', 'Frontend', 'Backend', 'Testing'].map((module, i) => (
        <div key={module} className="card group cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center">
              <Puzzle className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm text-apple-500 dark:text-apple-400">{module}</span>
          </div>
          <h3 className="text-lg font-semibold text-apple-900 dark:text-white mb-2">{module} Modul</h3>
          <p className="text-apple-600 dark:text-apple-400 mb-4">Modulbeschreibung und aktuelle Implementierung.</p>
          <div className="w-full bg-apple-200 dark:bg-apple-700 rounded-full h-2">
            <div className="bg-accent-green h-2 rounded-full" style={{ width: `${Math.random() * 100}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Design = () => (
  <div className="space-y-6 fade-in">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-apple-900 dark:text-white mb-4">Design</h1>
      <p className="text-lg text-apple-600 dark:text-apple-400">Passen Sie das Erscheinungsbild Ihrer Anwendung an.</p>
    </div>
    
    <div className="card">
      <h2 className="text-xl font-semibold text-apple-900 dark:text-white mb-4">Design-Einstellungen</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-apple-700 dark:text-apple-300">Theme</span>
          <span className="text-sm text-apple-500 dark:text-apple-400">Automatisch</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-apple-700 dark:text-apple-300">Schriftart</span>
          <span className="text-sm text-apple-500 dark:text-apple-400">Inter</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-apple-700 dark:text-apple-300">Farbschema</span>
          <span className="text-sm text-apple-500 dark:text-apple-400">Blau</span>
        </div>
      </div>
    </div>
  </div>
);

const Admin = () => (
  <div className="space-y-6 fade-in">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-apple-900 dark:text-white mb-4">Administration</h1>
      <p className="text-lg text-apple-600 dark:text-apple-400">Verwalten Sie Benutzer, Einstellungen und Systemkonfigurationen.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="text-xl font-semibold text-apple-900 dark:text-white mb-4">System-Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-apple-700 dark:text-apple-300">Datenbank</span>
            <span className="status-online text-sm">Online</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-apple-700 dark:text-apple-300">API-Server</span>
            <span className="status-online text-sm">Online</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-apple-700 dark:text-apple-300">Frontend</span>
            <span className="status-online text-sm">Online</span>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-xl font-semibold text-apple-900 dark:text-white mb-4">Benutzer-Verwaltung</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-apple-700 dark:text-apple-300">Aktive Benutzer</span>
            <span className="text-sm text-apple-500 dark:text-apple-400">24</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-apple-700 dark:text-apple-300">Neue Anmeldungen</span>
            <span className="text-sm text-apple-500 dark:text-apple-400">3 heute</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Footer Component
const Footer = () => (
  <footer className="mt-auto py-8 px-6 border-t border-apple-200 dark:border-apple-700">
    <div className="text-center">
      <p className="text-sm text-apple-500 dark:text-apple-400">
        Made with ❤️ by <span className="font-medium text-apple-700 dark:text-apple-300">KI</span>
      </p>
      <p className="text-xs text-apple-400 dark:text-apple-500 mt-1">
        © 2024 Projektseite. Alle Rechte vorbehalten.
      </p>
    </div>
  </footer>
);

// Hauptkomponente
function App() {
  const [theme, setTheme] = useState('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-apple-50 dark:bg-apple-900 transition-colors duration-300">
          <Navigation 
            theme={theme} 
            toggleTheme={toggleTheme}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
          
          {/* Hauptinhalt */}
          <div className="lg:pl-80">
            <main className="min-h-screen px-6 py-8">
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
        </div>
        
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
