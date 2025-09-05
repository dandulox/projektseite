import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Calendar, 
  GitBranch, 
  Info, 
  Plus, 
  Edit, 
  Save, 
  X,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

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

const VersionManagement = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [newVersion, setNewVersion] = useState({
    major: 2,
    minor: 0,
    patch: 0,
    codename: 'Phoenix',
    releaseDate: new Date().toISOString().split('T')[0],
    changes: ''
  });

  // Aktuelle Version von der API laden
  useEffect(() => {
    loadCurrentVersion();
  }, []);

  const loadCurrentVersion = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/versions/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentVersion(data.version);
        setNewVersion({
          major: data.version.major,
          minor: data.version.minor,
          patch: data.version.patch,
          codename: data.version.codename || '',
          releaseDate: data.version.releaseDate ? data.version.releaseDate.split('T')[0] : new Date().toISOString().split('T')[0],
          changes: data.version.changes || ''
        });
      } else {
        toast.error('Fehler beim Laden der aktuellen Version');
      }
    } catch (error) {
      console.error('Fehler beim Laden der aktuellen Version:', error);
      toast.error('Fehler beim Laden der aktuellen Version');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (currentVersion) {
      setNewVersion({
        major: currentVersion.major,
        minor: currentVersion.minor,
        patch: currentVersion.patch,
        codename: currentVersion.codename || '',
        releaseDate: currentVersion.releaseDate ? currentVersion.releaseDate.split('T')[0] : new Date().toISOString().split('T')[0],
        changes: currentVersion.changes || ''
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Prüfe ob es eine neue Version oder Update ist
      const isNewVersion = !currentVersion || 
        newVersion.major !== currentVersion.major ||
        newVersion.minor !== currentVersion.minor ||
        newVersion.patch !== currentVersion.patch;
      
      const endpoint = isNewVersion ? '/versions/create' : `/versions/update/${currentVersion.id}`;
      const method = isNewVersion ? 'POST' : 'PUT';
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          major: newVersion.major,
          minor: newVersion.minor,
          patch: newVersion.patch,
          codename: newVersion.codename,
          releaseDate: newVersion.releaseDate,
          changes: newVersion.changes
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setIsEditing(false);
        // Lade die aktuelle Version neu
        await loadCurrentVersion();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Fehler beim Speichern der Version');
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Version:', error);
      toast.error('Fehler beim Speichern der Version');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewVersion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getVersionType = (major, minor, patch) => {
    if (!currentVersion) return 'current';
    if (major > currentVersion.major) return 'major';
    if (minor > currentVersion.minor) return 'minor';
    if (patch > currentVersion.patch) return 'patch';
    return 'current';
  };

  const getVersionTypeColor = (type) => {
    const colors = {
      major: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      minor: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      patch: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      current: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    };
    return colors[type] || colors.current;
  };

  const getVersionTypeLabel = (type) => {
    const labels = {
      major: 'Major Release',
      minor: 'Minor Update',
      patch: 'Patch',
      current: 'Aktuelle Version'
    };
    return labels[type] || labels.current;
  };

  const versionType = getVersionType(newVersion.major, newVersion.minor, newVersion.patch);

  // Loading-Anzeige
  if (loading && !currentVersion) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Versionsverwaltung
          </h2>
          {!isEditing && currentVersion && (
            <button
              onClick={handleEdit}
              className="btn-primary"
            >
              <Edit className="w-4 h-4" />
              <span>Version bearbeiten</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Major Version
                </label>
                <input
                  type="number"
                  min="0"
                  value={newVersion.major}
                  onChange={(e) => handleInputChange('major', parseInt(e.target.value) || 0)}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Minor Version
                </label>
                <input
                  type="number"
                  min="0"
                  value={newVersion.minor || ''}
                  onChange={(e) => handleInputChange('minor', e.target.value === '' ? null : parseInt(e.target.value) || 0)}
                  className="input w-full"
                  placeholder="0 oder leer für null"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Patch Version
                </label>
                <input
                  type="number"
                  min="0"
                  value={newVersion.patch || ''}
                  onChange={(e) => handleInputChange('patch', e.target.value === '' ? null : parseInt(e.target.value) || 0)}
                  className="input w-full"
                  placeholder="0 oder leer für null"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Codename
                </label>
                <input
                  type="text"
                  value={newVersion.codename}
                  onChange={(e) => handleInputChange('codename', e.target.value)}
                  className="input w-full"
                  placeholder="z.B. Phoenix, Genesis..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Release-Datum
                </label>
                <input
                  type="date"
                  value={newVersion.releaseDate}
                  onChange={(e) => handleInputChange('releaseDate', e.target.value)}
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Änderungen (für Versionsverlauf)
              </label>
              <textarea
                value={newVersion.changes}
                onChange={(e) => handleInputChange('changes', e.target.value)}
                className="input w-full h-32"
                placeholder="Kurze Stichpunkte der Änderungen..."
              />
            </div>

            {/* Version Type Indicator */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center" style={{gap: '0.75rem'}}>
                {versionType === 'major' && <AlertCircle className="w-5 h-5 text-red-500" />}
                {versionType === 'minor' && <Info className="w-5 h-5 text-yellow-500" />}
                {versionType === 'patch' && <CheckCircle className="w-5 h-5 text-green-500" />}
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {getVersionTypeLabel(versionType)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVersionTypeColor(versionType)}`}>
                  {newVersion.major}.{newVersion.minor || 'null'}.{newVersion.patch || 'null'}
                </span>
              </div>
            </div>

            <div className="flex" style={{gap: '0.75rem'}}>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="btn-secondary flex-1 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span>Abbrechen</span>
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {loading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{loading ? 'Speichern...' : 'Version speichern'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Aktuelle Version */}
            {currentVersion && (
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">
                      Aktuelle Version
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300">
                      {currentVersion.major}.{currentVersion.minor}.{currentVersion.patch} "{currentVersion.codename}"
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center mb-2" style={{gap: '0.5rem'}}>
                      <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-blue-600 dark:text-blue-400">Major Release</span>
                    </div>
                    <div className="flex items-center" style={{gap: '0.5rem'}}>
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        {new Date(currentVersion.releaseDate).toLocaleString('de-DE', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Versionsnummerierung Info */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Versionsnummerierung
              </h4>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center" style={{gap: '0.5rem'}}>
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span><strong>Major (X.0.0):</strong> Große Änderungen, neue Features, Breaking Changes</span>
                </div>
                <div className="flex items-center" style={{gap: '0.5rem'}}>
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span><strong>Minor (X.Y.0):</strong> Große Bugfixes, wenn Server ohne Fix nicht startet</span>
                </div>
                <div className="flex items-center" style={{gap: '0.5rem'}}>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span><strong>Patch (X.Y.Z):</strong> Kleine Fixes, UI-Anpassungen, Button-Funktionalität</span>
                </div>
              </div>
            </div>

            {/* Versionsverlauf */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Versionsverlauf
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">Version 2.0.0</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">"Phoenix"</span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date('2024-12-19').toLocaleString('de-DE', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Major Release mit vollständiger Projektverwaltung, Modulverwaltung, Team-Management, Benachrichtigungssystem, Fortschrittsverfolgung, Design-System und Mobile-Optimierung
                  </p>
                </div>
                
                <div className="p-3 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">Version 1.0.0</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">"Genesis"</span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date('2024-12-01').toLocaleString('de-DE', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Initial Release mit Basis-System, Authentifizierung und einfacher Projektverwaltung
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VersionManagement;
