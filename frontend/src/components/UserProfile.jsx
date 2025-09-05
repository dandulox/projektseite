import React, { useState, useEffect } from 'react';
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
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });

  // Profil-Daten und Statistiken beim Laden aktualisieren
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || ''
      });
      loadUserStats();
    }
  }, [user]);

  // Benutzerstatistiken laden
  const loadUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/profile/stats', {
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
      username: user?.username || '',
      email: user?.email || ''
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
    if (!user?.created_at) return 'Unbekannt';
    const created = new Date(user.created_at);
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Benutzerprofil
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Ihre persönlichen Informationen und Kontodetails
            </p>
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
                  {user?.username}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  {user?.email}
                </p>

                {/* Rolle */}
                <div className="mb-6">
                  {getRoleBadge(user?.role)}
                </div>

                {/* Status */}
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Aktiv</span>
                </div>

                {/* Edit-Button */}
                <button
                  onClick={handleEdit}
                  className="btn-primary w-full"
                >
                  <Edit className="w-4 h-4" />
                  <span>Profil bearbeiten</span>
                </button>
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
                    {new Date(user?.created_at).toLocaleDateString('de-DE')}
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
                    {user?.last_activity ? new Date(user.last_activity).toLocaleDateString('de-DE') : 'Heute'}
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
                {!isEditing && (
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
                        {user?.username}
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
                        {user?.email}
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
                        {getRoleBadge(user?.role)}
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
                        {new Date(user?.created_at).toLocaleDateString('de-DE', {
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
            <div className="card mt-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Kontoverwaltung
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => window.location.href = '/settings'}
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
                  onClick={() => window.location.href = '/settings?tab=security'}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
