import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  Award,
  Settings,
  ArrowLeft,
  Users,
  FolderOpen,
  MessageSquare
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

const UserProfile = () => {
  const { user: currentUser, updateProfile } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [profileData, setProfileData] = useState({
    username: '',
    email: ''
  });

  // Bestimme, ob es das eigene Profil oder ein anderes ist
  const isOwnProfile = !userId || userId === currentUser?.id?.toString();
  const targetUser = isOwnProfile ? currentUser : profileUser;

  // Profil-Daten und Statistiken beim Laden aktualisieren
  useEffect(() => {
    if (isOwnProfile && currentUser) {
      setProfileData({
        username: currentUser.username || '',
        email: currentUser.email || ''
      });
      loadUserStats(currentUser.id);
    } else if (!isOwnProfile && userId) {
      loadOtherUserProfile(userId);
    }
  }, [currentUser, userId, isOwnProfile]);

  // Anderen Benutzer laden
  const loadOtherUserProfile = async (targetUserId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/user/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfileUser(data.user);
        setProfileData({
          username: data.user.username || '',
          email: data.user.email || ''
        });
        loadUserStats(targetUserId);
      } else {
        toast.error('Benutzer nicht gefunden');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Fehler beim Laden des Benutzerprofils:', error);
      toast.error('Fehler beim Laden des Profils');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Benutzerstatistiken laden
  const loadUserStats = async (targetUserId = null) => {
    try {
      const token = localStorage.getItem('token');
      const userId = targetUserId || currentUser?.id;
      
      // Bestimme den korrekten Endpunkt basierend auf der User-ID
      const isTargetOwnProfile = !targetUserId || targetUserId === currentUser?.id?.toString();
      const endpoint = isTargetOwnProfile ? `${API_BASE_URL}/auth/profile/stats` : `${API_BASE_URL}/auth/user/${userId}/stats`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Statistiken:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setProfileData({
      username: targetUser?.username || '',
      email: targetUser?.email || ''
    });
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        toast.success('Profil erfolgreich aktualisiert');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Profils');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Rolle-Badge
  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      user: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      viewer: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    };
    const labels = {
      admin: 'Administrator',
      user: 'Benutzer',
      viewer: 'Betrachter'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[role]}`}>
        {labels[role]}
      </span>
    );
  };

  // Berechne Mitgliedschaftsdauer
  const getMembershipDuration = () => {
    if (!profileUser?.created_at) return 'Unbekannt';
    const created = new Date(profileUser.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} Tage`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} Monat${months > 1 ? 'e' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} Jahr${years > 1 ? 'e' : ''}`;
    }
  };

  // Loading-Anzeige
  if (loading || (!targetUser && !isOwnProfile)) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center justify-between mb-4">
            {!isOwnProfile && (
              <button
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Zurück</span>
              </button>
            )}
            <div className="flex-1 text-center">
              <h1 className="page-title">
                {isOwnProfile ? 'Mein Profil' : 'Benutzerprofil'}
              </h1>
              <p className="page-subtitle">
                {isOwnProfile 
                  ? 'Ihre persönlichen Informationen und Kontodetails'
                  : `Profil von ${targetUser?.username || 'Benutzer'}`
                }
              </p>
            </div>
            {!isOwnProfile && <div className="w-24"></div>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profil-Karte */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="text-center">
                {/* Avatar */}
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>

                {/* Benutzer-Info */}
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {targetUser?.username}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {targetUser?.email}
                </p>

                {/* Rolle */}
                <div className="mb-6">
                  {getRoleBadge(targetUser?.role)}
                </div>

                {/* Status */}
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <div className={`w-2 h-2 rounded-full ${targetUser?.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {targetUser?.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </div>

                {/* Aktionen */}
                {isOwnProfile ? (
                  <button
                    onClick={handleEdit}
                    className="btn-primary w-full"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Profil bearbeiten</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate(`/messages?user=${targetUser?.id}`)}
                      className="btn-secondary w-full"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Nachricht senden</span>
                    </button>
                    {currentUser?.role === 'admin' && (
                      <button
                        onClick={() => navigate(`/admin?tab=users&edit=${targetUser?.id}`)}
                        className="btn-warning w-full"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Als Admin verwalten</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Statistiken */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Kontostatistiken
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Mitglied seit</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {new Date(targetUser?.created_at).toLocaleDateString('de-DE')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Mitgliedschaft</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {getMembershipDuration()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Letzte Aktivität</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {targetUser?.last_activity ? new Date(targetUser.last_activity).toLocaleDateString('de-DE') : 'Heute'}
                  </span>
                </div>

                {stats && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                          <Award className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Projekte</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {stats.projects?.total_projects || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                          <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Teams</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {stats.teams?.total_teams || 0}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profil-Details */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Profil-Informationen
                </h3>
                {isOwnProfile && !isEditing && (
                  <button
                    onClick={handleEdit}
                    className="btn-secondary"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Bearbeiten</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Benutzername *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="username"
                          required
                          value={profileData.username}
                          onChange={handleInputChange}
                          className="input-icon w-full"
                          placeholder="Benutzername eingeben..."
                        />
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        E-Mail-Adresse *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          required
                          value={profileData.email}
                          onChange={handleInputChange}
                          className="input-icon w-full"
                          placeholder="E-Mail-Adresse eingeben..."
                        />
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn-secondary flex-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Abbrechen</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Speichern...' : 'Speichern'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Benutzername */}
                  <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Benutzername</p>
                      <p className="text-lg font-medium text-slate-900 dark:text-white">
                        {targetUser?.username}
                      </p>
                    </div>
                  </div>

                  {/* E-Mail */}
                  <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">E-Mail-Adresse</p>
                      <p className="text-lg font-medium text-slate-900 dark:text-white">
                        {targetUser?.email}
                      </p>
                    </div>
                  </div>

                  {/* Rolle */}
                  <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Rolle</p>
                      <div className="mt-1">
                        {getRoleBadge(targetUser?.role)}
                      </div>
                    </div>
                  </div>

                  {/* Erstellungsdatum */}
                  <div className="flex items-center space-x-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Mitglied seit</p>
                      <p className="text-lg font-medium text-slate-900 dark:text-white">
                        {new Date(targetUser?.created_at).toLocaleDateString('de-DE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Zusätzliche Aktionen */}
            {isOwnProfile && (
              <div className="card mt-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Kontoverwaltung
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate('/settings')}
                    className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                  >
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Einstellungen
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Passwort, Benachrichtigungen & Design
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/settings?tab=security')}
                    className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                  >
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Sicherheit
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Passwort ändern & Sicherheitseinstellungen
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
