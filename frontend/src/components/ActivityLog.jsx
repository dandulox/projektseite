import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const ActivityLog = ({ 
  resourceType, 
  resourceId, 
  moduleType = 'project',
  showHeader = true,
  limit = 20,
  className = ''
}) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const fetchActivities = async (reset = false) => {
    try {
      setLoading(true);
      const currentOffset = reset ? 0 : offset;
      
      const endpoint = resourceType === 'project' 
        ? `/api/activity-logs/projects/${resourceId}`
        : `/api/activity-logs/modules/${resourceId}`;
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: currentOffset.toString()
      });
      
      if (resourceType === 'module') {
        params.append('module_type', moduleType);
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
      
      if (reset) {
        setActivities(data.logs);
        setOffset(limit);
      } else {
        setActivities(prev => [...prev, ...data.logs]);
        setOffset(prev => prev + limit);
      }
      
      setHasMore(data.logs.length === limit);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(true);
  }, [resourceId, resourceType, moduleType]);

  const loadMore = () => {
    fetchActivities(false);
  };

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
    const { action_type, action_details, username, affected_username } = activity;
    
    switch (action_type) {
      case 'created':
        return `${username} hat ${resourceType === 'project' ? 'das Projekt' : 'das Modul'} erstellt`;
      case 'updated':
        return `${username} hat ${resourceType === 'project' ? 'das Projekt' : 'das Modul'} aktualisiert`;
      case 'status_changed':
        const details = action_details ? JSON.parse(action_details) : {};
        return `${username} hat den Status von "${details.old_status}" zu "${details.new_status}" geändert`;
      case 'priority_changed':
        const priorityDetails = action_details ? JSON.parse(action_details) : {};
        return `${username} hat die Priorität von "${priorityDetails.old_priority}" zu "${priorityDetails.new_priority}" geändert`;
      case 'assigned':
        return affected_username 
          ? `${username} hat ${affected_username} zugewiesen`
          : `${username} wurde zugewiesen`;
      case 'unassigned':
        return affected_username 
          ? `${username} hat ${affected_username} entfernt`
          : `${username} wurde entfernt`;
      case 'permission_granted':
        return affected_username 
          ? `${username} hat ${affected_username} Berechtigungen erteilt`
          : `${username} hat Berechtigungen erhalten`;
      case 'permission_revoked':
        return affected_username 
          ? `${username} hat ${affected_username} Berechtigungen entzogen`
          : `${username} hat Berechtigungen verloren`;
      case 'module_added':
        return `${username} hat ein Modul hinzugefügt`;
      case 'module_removed':
        return `${username} hat ein Modul entfernt`;
      case 'module_updated':
        return `${username} hat ein Modul aktualisiert`;
      case 'progress_updated':
        return `${username} hat den Fortschritt aktualisiert`;
      case 'due_date_changed':
        return `${username} hat das Fälligkeitsdatum geändert`;
      case 'team_changed':
        return `${username} hat das Team geändert`;
      default:
        return `${username} hat eine Aktion durchgeführt`;
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

  if (loading && activities.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
        {showHeader && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Aktivitätslog</h3>
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
            <h3 className="text-lg font-medium text-gray-900">Aktivitätslog</h3>
          </div>
        )}
        <div className="p-6">
          <div className="text-center text-red-600">
            <p>Fehler beim Laden der Aktivitäten: {error}</p>
            <button 
              onClick={() => fetchActivities(true)}
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
          <h3 className="text-lg font-medium text-gray-900">Aktivitätslog</h3>
          <p className="text-sm text-gray-500">
            Alle Änderungen und Aktivitäten werden hier protokolliert
          </p>
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
                  
                  {activity.action_details && (
                    <div className="mt-1">
                      <details className="text-xs text-gray-600">
                        <summary className="cursor-pointer hover:text-gray-800">
                          Details anzeigen
                        </summary>
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
                          <pre>{JSON.stringify(JSON.parse(activity.action_details), null, 2)}</pre>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {hasMore && (
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={loadMore}
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Lädt...' : 'Mehr Aktivitäten laden'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
