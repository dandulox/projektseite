import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  Users, 
  User, 
  Clock,
  ExternalLink,
  MoreVertical
} from 'lucide-react';

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

const NotificationBell = () => {
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('private');
  const [notifications, setNotifications] = useState({
    private: [],
    team: []
  });
  const [unreadCounts, setUnreadCounts] = useState({
    private: 0,
    team: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Dropdown schließen beim Klicken außerhalb
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Benachrichtigungen abrufen
  const fetchNotifications = async (type = null) => {
    if (!user || !token) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/notifications?type=${type || ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (type === 'private') {
          setNotifications(prev => ({ ...prev, private: data.notifications }));
        } else if (type === 'team') {
          setNotifications(prev => ({ ...prev, team: data.notifications }));
        } else {
          // Alle Benachrichtigungen abrufen und nach Typ sortieren
          const privateNotifications = data.notifications.filter(n => !n.team_id);
          const teamNotifications = data.notifications.filter(n => n.team_id);
          setNotifications({
            private: privateNotifications,
            team: teamNotifications
          });
        }
      }
    } catch (error) {
      // Benachrichtigungen konnten nicht geladen werden
    } finally {
      setLoading(false);
    }
  };

  // Ungelesene Anzahl abrufen
  const fetchUnreadCounts = async () => {
    if (!user || !token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCounts(data.counts);
      }
    } catch (error) {
      // Benachrichtigungsanzahl konnte nicht geladen werden
    }
  };

  // Benachrichtigung als gelesen markieren
  const markAsRead = async (notificationId) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Benachrichtigung aus der Liste entfernen
        setNotifications(prev => ({
          private: prev.private.filter(n => n.id !== notificationId),
          team: prev.team.filter(n => n.id !== notificationId)
        }));
        
        // Zähler aktualisieren
        fetchUnreadCounts();
      }
    } catch (error) {
      // Benachrichtigung konnte nicht markiert werden
    }
  };

  // Alle Benachrichtigungen als gelesen markieren
  const markAllAsRead = async (type) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        // Alle Benachrichtigungen des Typs entfernen
        if (type === 'private') {
          setNotifications(prev => ({ ...prev, private: [] }));
        } else if (type === 'team') {
          setNotifications(prev => ({ ...prev, team: [] }));
        } else {
          setNotifications({ private: [], team: [] });
        }
        
        // Zähler aktualisieren
        fetchUnreadCounts();
      }
    } catch (error) {
      // Benachrichtigungen konnten nicht markiert werden
    }
  };

  // Benachrichtigung löschen
  const deleteNotification = async (notificationId) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Benachrichtigung aus der Liste entfernen
        setNotifications(prev => ({
          private: prev.private.filter(n => n.id !== notificationId),
          team: prev.team.filter(n => n.id !== notificationId)
        }));
        
        // Zähler aktualisieren
        fetchUnreadCounts();
      }
    } catch (error) {
      // Benachrichtigung konnte nicht gelöscht werden
    }
  };

  // Dropdown öffnen/schließen
  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
      fetchUnreadCounts();
    }
    setIsOpen(!isOpen);
  };

  // Tab wechseln
  const switchTab = (tab) => {
    setActiveTab(tab);
    if (notifications[tab].length === 0) {
      fetchNotifications(tab);
    }
  };

  // Initiale Daten laden
  useEffect(() => {
    if (user && token) {
      fetchUnreadCounts();
    }
  }, [user, token]);

  // Formatierung der Zeit
  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Gerade eben';
    if (diffInMinutes < 60) return `vor ${diffInMinutes} Min`;
    if (diffInMinutes < 1440) return `vor ${Math.floor(diffInMinutes / 60)} Std`;
    return notificationTime.toLocaleDateString('de-DE');
  };

  // Icon basierend auf Benachrichtigungstyp
  const getNotificationIcon = (type, teamId) => {
    if (teamId) {
      return <Users className="w-4 h-4 text-blue-500" />;
    }
    
    switch (type) {
      case 'project_created':
      case 'project_updated':
        return <ExternalLink className="w-4 h-4 text-green-500" />;
      case 'team_invite':
        return <Users className="w-4 h-4 text-purple-500" />;
      case 'user_mention':
        return <User className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const currentNotifications = notifications[activeTab] || [];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Benachrichtigungsglocke */}
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105 relative"
      >
        <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        {unreadCounts.total > 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            {unreadCounts.total > 9 ? '9+' : unreadCounts.total}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Benachrichtigungen
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex mt-3 space-x-1">
              <button
                onClick={() => switchTab('private')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'private'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Privat</span>
                  {unreadCounts.private > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {unreadCounts.private}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => switchTab('team')}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'team'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Team</span>
                  {unreadCounts.team > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {unreadCounts.team}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Benachrichtigungen */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                Lade Benachrichtigungen...
              </div>
            ) : currentNotifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Keine {activeTab === 'private' ? 'privaten' : 'Team-'}Benachrichtigungen</p>
              </div>
            ) : (
              <div className="p-2">
                {/* Alle als gelesen markieren Button */}
                {currentNotifications.length > 0 && (
                  <div className="px-2 py-1 mb-2">
                    <button
                      onClick={() => markAllAsRead(activeTab)}
                      className="w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Alle als gelesen markieren</span>
                    </button>
                  </div>
                )}

                {/* Benachrichtigungsliste */}
                {currentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type, notification.team_id)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {notification.message}
                            </p>
                            
                            {/* Zusätzliche Informationen */}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatTime(notification.created_at)}</span>
                              </div>
                              
                              {notification.from_username && (
                                <div className="flex items-center space-x-1">
                                  <User className="w-3 h-3" />
                                  <span>von {notification.from_username}</span>
                                </div>
                              )}
                              
                              {notification.team_name && (
                                <div className="flex items-center space-x-1">
                                  <Users className="w-3 h-3" />
                                  <span>{notification.team_name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Aktionen */}
                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                              title="Als gelesen markieren"
                            >
                              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </button>
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                              title="Löschen"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
