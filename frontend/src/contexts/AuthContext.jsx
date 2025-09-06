import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// API Base URL - dynamisch basierend auf der aktuellen Domain
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Verwende relative Pfade für lokale Entwicklung oder gleiche Domain
  const currentHost = window.location.hostname;
  const currentPort = window.location.port;
  
  // Wenn wir auf localhost oder 127.0.0.1 sind, verwende Port 3001
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return `http://${currentHost}:3001/api`;
  }
  
  // Für Produktionsumgebung: Verwende den gleichen Host mit Port 3001
  // oder falls Port 3000, dann Backend auf 3001
  if (currentPort === '3000') {
    return `http://${currentHost}:3001/api`;
  }
  
  // Für Produktionsumgebung ohne Port (Standard-HTTP/HTTPS): Verwende Port 3001
  if (!currentPort || currentPort === '80' || currentPort === '443') {
    return `http://${currentHost}:3001/api`;
  }
  
  // Fallback: Verwende relative Pfade
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

// API Helper Functions
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ein Fehler ist aufgetreten');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState('light');
  const [designSettings, setDesignSettings] = useState({
    theme: 'light',
    language: 'de',
    compactMode: false,
    fontSize: 'medium',
    colorScheme: 'blue',
    animations: true
  });

  // Theme-Management
  const applyTheme = (themeName) => {
    const root = document.documentElement;
    
    if (themeName === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeName = prefersDark ? 'dark' : 'light';
    }
    
    root.setAttribute('data-theme', themeName);
    setTheme(themeName);
  };

  // Design-Einstellungen anwenden
  const applyDesignSettings = (settings) => {
    const root = document.documentElement;
    
    // Theme anwenden
    applyTheme(settings.theme);
    
    // Schriftgröße anwenden
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    };
    root.style.fontSize = fontSizeMap[settings.fontSize] || '16px';
    
    // Kompakter Modus
    if (settings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
    
    // Animationen
    if (!settings.animations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
    
    // Farbschema
    root.setAttribute('data-color-scheme', settings.colorScheme);
  };

  // Token und Einstellungen aus localStorage laden
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedSettings = loadUserSettings();
    
    if (savedSettings?.design) {
      setDesignSettings(savedSettings.design);
      applyDesignSettings(savedSettings.design);
    } else {
      // Standard-Einstellungen anwenden
      applyDesignSettings(designSettings);
    }
    
    if (token) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, []);

  // Token validieren
  const validateToken = async () => {
    try {
      const data = await apiRequest('/auth/validate');
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (username, password) => {
    try {
      setLoading(true);
      
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      localStorage.setItem('token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      
      toast.success(`Willkommen zurück, ${data.user.username}!`);
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Registrierung
  const register = async (username, email, password, role = 'user') => {
    try {
      setLoading(true);
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, role }),
      });

      localStorage.setItem('token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      
      toast.success(`Registrierung erfolgreich! Willkommen, ${data.user.username}!`);
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Logout-Fehler behandelt
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Erfolgreich abgemeldet');
    }
  };

  // Passwort ändern
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      await apiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      toast.success('Passwort erfolgreich geändert');
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Benutzerprofil aktualisieren
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const data = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      
      setUser(data.user);
      toast.success('Profil erfolgreich aktualisiert');
      return { success: true };
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Benutzereinstellungen speichern (lokal)
  const saveUserSettings = (settings) => {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Design-Einstellungen sofort anwenden
      if (settings.design) {
        setDesignSettings(settings.design);
        applyDesignSettings(settings.design);
      }
      
      toast.success('Einstellungen gespeichert');
      return { success: true };
    } catch (error) {
      toast.error('Fehler beim Speichern der Einstellungen');
      return { success: false, error: error.message };
    }
  };

  // Design-Einstellungen aktualisieren
  const updateDesignSettings = (newSettings) => {
    const updatedSettings = { ...designSettings, ...newSettings };
    setDesignSettings(updatedSettings);
    applyDesignSettings(updatedSettings);
    
    // In localStorage speichern
    const currentSettings = loadUserSettings() || {};
    saveUserSettings({
      ...currentSettings,
      design: updatedSettings
    });
  };

  // Benutzereinstellungen laden (lokal)
  const loadUserSettings = () => {
    try {
      const settings = localStorage.getItem('userSettings');
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      return null;
    }
  };

  // Benutzer-Funktionen
  const userApi = {
    // Benutzer suchen
    getUsers: async (filters = {}) => {
      const params = new URLSearchParams(filters);
      return await apiRequest(`/admin/users?${params}`);
    },
  };

  // Admin-Funktionen
  const adminApi = {
    // Alle Benutzer abrufen
    getUsers: async (page = 1, limit = 10, search = '', role = '') => {
      const params = new URLSearchParams({ page, limit, search, role });
      return await apiRequest(`/admin/users?${params}`);
    },

    // Benutzer erstellen
    createUser: async (userData) => {
      return await apiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },

    // Benutzer aktualisieren
    updateUser: async (userId, userData) => {
      return await apiRequest(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
    },

    // Benutzer löschen
    deleteUser: async (userId) => {
      return await apiRequest(`/admin/users/${userId}`, {
        method: 'DELETE',
      });
    },

    // Benutzer-Passwort zurücksetzen
    resetUserPassword: async (userId, newPassword) => {
      return await apiRequest(`/admin/users/${userId}/reset-password`, {
        method: 'PUT',
        body: JSON.stringify({ newPassword }),
      });
    },

    // System-Statistiken
    getStats: async () => {
      return await apiRequest('/admin/stats');
    },
  };

  // Team-Funktionen
  const teamApi = {
    // Alle Teams abrufen
    getTeams: async () => {
      return await apiRequest('/teams');
    },

    // Einzelnes Team abrufen
    getTeam: async (teamId) => {
      return await apiRequest(`/teams/${teamId}`);
    },

    // Team erstellen
    createTeam: async (teamData) => {
      return await apiRequest('/teams', {
        method: 'POST',
        body: JSON.stringify(teamData),
      });
    },

    // Team aktualisieren
    updateTeam: async (teamId, teamData) => {
      return await apiRequest(`/teams/${teamId}`, {
        method: 'PUT',
        body: JSON.stringify(teamData),
      });
    },

    // Team löschen
    deleteTeam: async (teamId) => {
      return await apiRequest(`/teams/${teamId}`, {
        method: 'DELETE',
      });
    },

    // Team-Mitglied hinzufügen
    addTeamMember: async (teamId, userId, role = 'member') => {
      return await apiRequest(`/teams/${teamId}/members`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, role }),
      });
    },

    // Team-Mitglied entfernen
    removeTeamMember: async (teamId, userId) => {
      return await apiRequest(`/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
      });
    },

    // Team verlassen
    leaveTeam: async (teamId) => {
      return await apiRequest(`/teams/${teamId}/leave`, {
        method: 'DELETE',
      });
    },
  };

  // Projekt-Funktionen
  const projectApi = {
    // Alle Projekte abrufen
    getProjects: async (filters = {}) => {
      const params = new URLSearchParams(filters);
      return await apiRequest(`/projects?${params}`);
    },

    // Einzelnes Projekt abrufen
    getProject: async (projectId) => {
      return await apiRequest(`/projects/${projectId}`);
    },

    // Projekt erstellen
    createProject: async (projectData) => {
      return await apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
    },

    // Projekt aktualisieren
    updateProject: async (projectId, projectData) => {
      return await apiRequest(`/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
      });
    },

    // Projekt löschen
    deleteProject: async (projectId) => {
      return await apiRequest(`/projects/${projectId}`, {
        method: 'DELETE',
      });
    },

    // Projekt-Berechtigung vergeben
    grantPermission: async (projectId, userId, permissionType) => {
      return await apiRequest(`/projects/${projectId}/permissions`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, permission_type: permissionType }),
      });
    },

    // Projekt-Berechtigung entfernen
    revokePermission: async (projectId, userId) => {
      return await apiRequest(`/projects/${projectId}/permissions/${userId}`, {
        method: 'DELETE',
      });
    },

    // Projekt-Berechtigungen abrufen
    getProjectPermissions: async (projectId) => {
      return await apiRequest(`/projects/${projectId}/permissions`);
    },

    // Projektfortschritt aktualisieren
    updateProjectProgress: async (projectId) => {
      return await apiRequest(`/projects/${projectId}/update-progress`, {
        method: 'POST',
      });
    },

  };

  // Dashboard-Funktionen
  const dashboardApi = {
    // Dashboard-Daten abrufen
    getDashboard: async () => {
      return await apiRequest('/dashboard/me');
    },

    // Dashboard-Statistiken abrufen
    getDashboardStats: async () => {
      return await apiRequest('/dashboard/me/stats');
    },
  };

  // Modul-Funktionen
  const moduleApi = {
    // Alle Module abrufen
    getModules: async (filters = {}) => {
      const params = new URLSearchParams(filters);
      return await apiRequest(`/modules?${params}`);
    },

    // Einzelnes Modul abrufen
    getModule: async (moduleId, moduleType = 'project') => {
      return await apiRequest(`/modules/${moduleId}?module_type=${moduleType}`);
    },

    // Projekt-Modul erstellen
    createProjectModule: async (moduleData) => {
      return await apiRequest('/modules/project', {
        method: 'POST',
        body: JSON.stringify(moduleData),
      });
    },

    // Eigenständiges Modul erstellen
    createStandaloneModule: async (moduleData) => {
      return await apiRequest('/modules/standalone', {
        method: 'POST',
        body: JSON.stringify(moduleData),
      });
    },

    // Modul aktualisieren
    updateModule: async (moduleId, moduleData, moduleType = 'project') => {
      return await apiRequest(`/modules/${moduleId}?module_type=${moduleType}`, {
        method: 'PUT',
        body: JSON.stringify(moduleData),
      });
    },

    // Modul löschen
    deleteModule: async (moduleId, moduleType = 'project') => {
      return await apiRequest(`/modules/delete/${moduleId}?module_type=${moduleType}`, {
        method: 'DELETE',
      });
    },

    // Modul-Berechtigung vergeben
    grantPermission: async (moduleId, moduleType, userId, permissionType) => {
      return await apiRequest(`/modules/permissions/${moduleId}`, {
        method: 'POST',
        body: JSON.stringify({ 
          user_id: userId, 
          permission_type: permissionType,
          module_type: moduleType 
        }),
      });
    },

    // Modul-Berechtigung entfernen
    revokePermission: async (moduleId, moduleType, userId) => {
      return await apiRequest(`/modules/permissions/${moduleId}/${userId}?module_type=${moduleType}`, {
        method: 'DELETE',
      });
    },

    // Modul-Berechtigungen abrufen
    getModulePermissions: async (moduleId, moduleType) => {
      return await apiRequest(`/modules/permissions/${moduleId}?module_type=${moduleType}`);
    },

    // Modul-Abhängigkeit erstellen
    createModuleDependency: async (sourceModuleId, targetModuleId, connectionType, description, moduleType = 'project') => {
      return await apiRequest(`/modules/${sourceModuleId}/dependencies`, {
        method: 'POST',
        body: JSON.stringify({
          target_module_id: targetModuleId,
          connection_type: connectionType,
          description,
          module_type: moduleType
        }),
      });
    },

    // Modul-Abhängigkeit entfernen
    removeModuleDependency: async (sourceModuleId, connectionId, moduleType = 'project') => {
      return await apiRequest(`/modules/${sourceModuleId}/dependencies/${connectionId}?module_type=${moduleType}`, {
        method: 'DELETE',
      });
    },
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    changePassword,
    updateProfile,
    saveUserSettings,
    loadUserSettings,
    adminApi,
    userApi,
    teamApi,
    projectApi,
    moduleApi,
    dashboardApi,
    // Design-Funktionen
    theme,
    designSettings,
    updateDesignSettings,
    applyTheme,
    applyDesignSettings,
    // Hilfsfunktionen
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    isViewer: user?.role === 'viewer',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth muss innerhalb eines AuthProvider verwendet werden');
  }
  return context;
};

// Protected Route Component
export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Zugriff verweigert
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Sie haben keine Berechtigung für diese Seite.
          </p>
        </div>
      </div>
    );
  }

  return children;
};
