import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const ActivityFeed = ({ 
  userId = null, 
  teamId = null, 
  showHeader = true,
  limit = 10,
  className = ''
}) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      let endpoint;
      if (userId) {
        endpoint = `/api/activity-logs/user/${userId}`;
      } else if (teamId) {
        endpoint = `/api/activity-logs/team/${teamId}`;
      } else {
        // Fallback: eigene Aktivitäten
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        endpoint = `/api/activity-logs/user/${payload.id}`;
      }

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: '0'
      });

      if (activeTab !== 'all') {
        params.append('resource_type', activeTab);
      }

      const response = await fetch(`${endpoint}?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Fehler beim Laden der Aktivitäten');
      }

      const data = await response.json();
      setActivities(data.logs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [userId, teamId, activeTab, limit]);

  const getActionIcon = (actionType) => {
    const icons = {
      created: '🆕',
      updated: '✏️',
      deleted: '🗑️',
      status_changed: '🔄',
      priority_changed: '⚡',
      assigned: '👤',
      unassigned: '👤❌',
      permission_granted: '🔑',
      permission_revoked: '🔑❌',
      module_added: '📦',
      module_removed: '📦❌',
      module_updated: '📦✏️',
      progress_updated: '📊',
      due_date_changed: '📅',
      team_changed: '👥'
    };
    return icons[actionType] || '📝';
  };

  const getActionText = (activity) => {
    const { action_type, action_details, username, affected_username, resource_name, resource_type } = activity;
    
    const resourceText = resource_type === 'project' ? 'Projekt' : 'Modul';
    
    switch (action_type) {
      case 'created':
        return `${username} hat ${resourceText} "${resource_name}" erstellt`;
      case 'updated':
        return `${username} hat ${resourceText} "${resource_name}" aktualisiert`;
      case 'status_changed':
        const details = action_details ? JSON.parse(action_details) : {};
        return `${username} hat den Status von "${resource_name}" geändert`;
      case 'priority_changed':
        return `${username} hat die Priorität von "${resource_name}" geändert`;
      case 'assigned':
        return affected_username 
          ? `${username} hat ${affected_username} zu "${resource_name}" zugewiesen`
          : `${username} wurde zu "${resource_name}" zugewiesen`;
      case 'unassigned':
        return affected_username 
          ? `${username} hat ${affected_username} von "${resource_name}" entfernt`
          : `${username} wurde von "${resource_name}" entfernt`;
      case 'permission_granted':
        return affected_username 
          ? `${username} hat ${affected_username} Berechtigungen für "${resource_name}" erteilt`
          : `${username} hat Berechtigungen für "${resource_name}" erhalten`;
      case 'permission_revoked':
        return affected_username 
          ? `${username} hat ${affected_username} Berechtigungen für "${resource_name}" entzogen`
          : `${username} hat Berechtigungen für "${resource_name}" verloren`;
      case 'module_added':
        return `${username} hat ein Modul zu "${resource_name}" hinzugefügt`;
      case 'module_removed':
        return `${username} hat ein Modul von "${resource_name}" entfernt`;
      case 'module_updated':
        return `${username} hat ein Modul in "${resource_name}" aktualisiert`;
      case 'progress_updated':
        return `${username} hat den Fortschritt von "${resource_name}" aktualisiert`;
      case 'due_date_changed':
        return `${username} hat das Fälligkeitsdatum von "${resource_name}" geändert`;
      case 'team_changed':
        return `${username} hat das Team von "${resource_name}" geändert`;
      default:
        return `${username} hat eine Aktion in "${resource_name}" durchgeführt`;
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: de 
      });
    } catch (error) {
      return 'vor unbekannter Zeit';
    }
  };

  const getResourceLink = (activity) => {
    const { resource_type, resource_id, project_id } = activity;
    
    if (resource_type === 'project') {
      return `/projects/${resource_id}`;
    } else if (resource_type === 'module') {
      return project_id ? `/projects/${project_id}/modules/${resource_id}` : `/modules/${resource_id}`;
    }
    return '#';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
        {showHeader && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Aktivitätsfeed</h3>
          </div>
        )}
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
        {showHeader && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Aktivitätsfeed</h3>
          </div>
        )}
        <div className="p-6">
          <div className="text-center text-red-600">
            <p>Fehler beim Laden der Aktivitäten: {error}</p>
            <button 
              onClick={fetchActivities}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {showHeader && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Aktivitätsfeed</h3>
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  activeTab === 'all'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Alle
              </button>
              <button
                onClick={() => setActiveTab('project')}
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  activeTab === 'project'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Projekte
              </button>
              <button
                onClick={() => setActiveTab('module')}
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  activeTab === 'module'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Module
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="divide-y divide-gray-200">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>Noch keine Aktivitäten vorhanden</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">
                    {getActionIcon(activity.action_type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {getActionText(activity)}
                    </p>
                    <time className="text-xs text-gray-500">
                      {formatTimestamp(activity.created_at)}
                    </time>
                  </div>
                  
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {activity.resource_type === 'project' ? 'Projekt' : 'Modul'}
                    </span>
                    <a
                      href={getResourceLink(activity)}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {activity.resource_name}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <a
            href="/activity"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Alle Aktivitäten anzeigen →
          </a>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
