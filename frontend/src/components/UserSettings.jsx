import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Lock, 
  Mail, 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Shield,
  Bell,
  Palette,
  Globe,
  Type,
  Palette as ColorPalette,
  Zap,
  Monitor,
  Sun,
  Moon,
  Smartphone
} from 'lucide-react';

const UserSettings = () => {
  const { 
    user, 
    updateProfile, 
    changePassword, 
    saveUserSettings, 
    loadUserSettings,
    designSettings,
    updateDesignSettings
  } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  // Profil-Formular
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || ''
  });
  
  // Passwort-Formular
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Sichtbarkeit der Passwörter
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Benachrichtigungseinstellungen
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    projectUpdates: true,
    systemAlerts: true
  });
  
  // Lokale Design-Einstellungen für die UI
  const [localDesignSettings, setLocalDesignSettings] = useState({
    theme: 'light',
    language: 'de',
    compactMode: false,
    fontSize: 'medium',
    colorScheme: 'blue',
    animations: true
  });

  // Einstellungen beim Laden der Komponente laden
  useEffect(() => {
    const savedSettings = loadUserSettings();
    if (savedSettings) {
      if (savedSettings.notifications) {
        setNotifications(savedSettings.notifications);
      }
      if (savedSettings.design) {
        setLocalDesignSettings(savedSettings.design);
      }
    } else if (designSettings) {
      setLocalDesignSettings(designSettings);
    }
  }, [loadUserSettings, designSettings]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        // Erfolgreiche Aktualisierung
      }
    } catch (error) {
      console.error('Profil-Update-Fehler:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Die neuen Passwörter stimmen nicht überein');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('Das neue Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Passwort-Änderungs-Fehler:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleNotificationsSave = () => {
    const settings = {
      notifications,
      design: localDesignSettings
    };
    saveUserSettings(settings);
  };

  const handleDesignSave = () => {
    updateDesignSettings(localDesignSettings);
  };

  const handleDesignChange = (key, value) => {
    const newSettings = { ...localDesignSettings, [key]: value };
    setLocalDesignSettings(newSettings);
    // Sofortige Vorschau anwenden
    updateDesignSettings(newSettings);
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sicherheit', icon: Lock },
    { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
    { id: 'design', label: 'Design', icon: Palette }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Benutzereinstellungen
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Verwalten Sie Ihre Kontoeinstellungen und Präferenzen
            </p>
          </div>
        </div>

        <div className="card">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Profil Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profil-Informationen</h2>
                    <p className="text-slate-600 dark:text-slate-400">Aktualisieren Sie Ihre persönlichen Daten</p>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Benutzername *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={profileData.username}
                          onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                          className="w-full px-4 py-3 pl-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          required
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          className="w-full px-4 py-3 pl-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="E-Mail-Adresse eingeben..."
                        />
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                          {user?.role?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Rolle: {user?.role === 'admin' ? 'Administrator' : 'Benutzer'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Mitglied seit: {new Date(user?.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Speichern...' : 'Profil speichern'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Sicherheit Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sicherheit</h2>
                    <p className="text-slate-600 dark:text-slate-400">Verwalten Sie Ihr Passwort und Sicherheitseinstellungen</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Aktuelles Passwort *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        required
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full px-4 py-3 pl-12 pr-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Aktuelles Passwort eingeben..."
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Neues Passwort *
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          required
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full px-4 py-3 pl-12 pr-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Neues Passwort eingeben..."
                        />
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('new')}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Passwort bestätigen *
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          required
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full px-4 py-3 pl-12 pr-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Passwort bestätigen..."
                        />
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('confirm')}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Passwort-Anforderungen */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Passwort-Anforderungen:</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Mindestens 6 Zeichen lang</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Kombination aus Buchstaben und Zahlen empfohlen</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-medium rounded-lg shadow-lg hover:shadow-red-500/25 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Shield className="w-4 h-4" />
                      <span>{loading ? 'Ändern...' : 'Passwort ändern'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Benachrichtigungen Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Benachrichtigungen</h2>
                    <p className="text-slate-600 dark:text-slate-400">Konfigurieren Sie Ihre Benachrichtigungseinstellungen</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'E-Mail-Benachrichtigungen', description: 'Erhalten Sie wichtige Updates per E-Mail' },
                    { key: 'pushNotifications', label: 'Push-Benachrichtigungen', description: 'Erhalten Sie sofortige Benachrichtigungen im Browser' },
                    { key: 'projectUpdates', label: 'Projekt-Updates', description: 'Benachrichtigungen über Projektänderungen' },
                    { key: 'systemAlerts', label: 'System-Alerts', description: 'Wichtige Systembenachrichtigungen' }
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">{setting.label}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[setting.key]}
                          onChange={(e) => setNotifications({...notifications, [setting.key]: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={handleNotificationsSave}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Einstellungen speichern</span>
                  </button>
                </div>
              </div>
            )}

            {/* Design Tab */}
            {activeTab === 'design' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Design & Erscheinungsbild</h2>
                    <p className="text-slate-600 dark:text-slate-400">Passen Sie das Aussehen der Anwendung an</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Theme-Einstellungen */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: 'light', label: 'Hell', description: 'Helles Theme', icon: Sun },
                        { value: 'dark', label: 'Dunkel', description: 'Dunkles Theme', icon: Moon },
                        { value: 'auto', label: 'Automatisch', description: 'System-Einstellung', icon: Monitor }
                      ].map((theme) => {
                        const Icon = theme.icon;
                        return (
                          <label key={theme.value} className="relative cursor-pointer">
                            <input
                              type="radio"
                              name="theme"
                              value={theme.value}
                              checked={localDesignSettings.theme === theme.value}
                              onChange={(e) => handleDesignChange('theme', e.target.value)}
                              className="sr-only peer"
                            />
                            <div className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 transition-all duration-200">
                              <div className="text-center">
                                <Icon className="w-6 h-6 mx-auto mb-2 text-slate-600 dark:text-slate-400" />
                                <div className="text-sm font-medium text-slate-900 dark:text-white">{theme.label}</div>
                                <div className="text-xs text-slate-600 dark:text-slate-400">{theme.description}</div>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Farbschema */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Farbschema
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'blue', label: 'Blau', color: 'bg-blue-500' },
                        { value: 'purple', label: 'Lila', color: 'bg-purple-500' },
                        { value: 'green', label: 'Grün', color: 'bg-green-500' },
                        { value: 'red', label: 'Rot', color: 'bg-red-500' },
                        { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
                        { value: 'pink', label: 'Pink', color: 'bg-pink-500' }
                      ].map((scheme) => (
                        <label key={scheme.value} className="relative cursor-pointer">
                          <input
                            type="radio"
                            name="colorScheme"
                            value={scheme.value}
                            checked={localDesignSettings.colorScheme === scheme.value}
                            onChange={(e) => handleDesignChange('colorScheme', e.target.value)}
                            className="sr-only peer"
                          />
                          <div className="p-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 transition-all duration-200">
                            <div className="text-center">
                              <div className={`w-8 h-8 ${scheme.color} rounded-full mx-auto mb-2`}></div>
                              <div className="text-xs font-medium text-slate-900 dark:text-white">{scheme.label}</div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Schriftgröße */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Schriftgröße
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { value: 'small', label: 'Klein', size: 'text-sm' },
                        { value: 'medium', label: 'Normal', size: 'text-base' },
                        { value: 'large', label: 'Groß', size: 'text-lg' },
                        { value: 'xlarge', label: 'Sehr groß', size: 'text-xl' }
                      ].map((size) => (
                        <label key={size.value} className="relative cursor-pointer">
                          <input
                            type="radio"
                            name="fontSize"
                            value={size.value}
                            checked={localDesignSettings.fontSize === size.value}
                            onChange={(e) => handleDesignChange('fontSize', e.target.value)}
                            className="sr-only peer"
                          />
                          <div className="p-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 transition-all duration-200">
                            <div className="text-center">
                              <div className={`${size.size} font-medium text-slate-900 dark:text-white mb-1`}>Aa</div>
                              <div className="text-xs text-slate-600 dark:text-slate-400">{size.label}</div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sprache */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Sprache
                    </label>
                    <select
                      value={localDesignSettings.language}
                      onChange={(e) => handleDesignChange('language', e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="de">Deutsch</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="es">Español</option>
                    </select>
                  </div>

                  {/* Kompakter Modus */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">Kompakter Modus</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Reduziert Abstände für mehr Inhalt</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localDesignSettings.compactMode}
                        onChange={(e) => handleDesignChange('compactMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Animationen */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white">Animationen</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Übergänge und Animationen aktivieren</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localDesignSettings.animations}
                        onChange={(e) => handleDesignChange('animations', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={handleDesignSave}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Design speichern</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
