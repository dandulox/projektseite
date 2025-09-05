import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const UserAssignment = ({ 
  projectId = null, 
  moduleId = null, 
  moduleType = 'project',
  assignedUsers = [],
  onAssignmentChange,
  className = ""
}) => {
  const { userApi, projectApi, moduleApi } = useAuth();
  const [showAssignment, setShowAssignment] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // Benutzer-Suche mit Debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const response = await userApi.getUsers({ search: searchTerm });
          const users = response.users || [];
          
          // Filtere bereits zugewiesene Benutzer heraus
          const assignedUserIds = assignedUsers.map(user => user.id || user.user_id);
          const availableUsers = users.filter(user => !assignedUserIds.includes(user.id));
          
          setSearchResults(availableUsers);
        } catch (error) {
          console.error('Fehler bei der Benutzer-Suche:', error);
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, assignedUsers]);

  // Schließe Dropdown beim Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAssignment(false);
        setSearchTerm('');
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAssignUser = async (user) => {
    setAssigning(true);
    try {
      if (projectId) {
        // Projekt-Berechtigung vergeben
        await projectApi.grantPermission(projectId, user.id, 'edit');
        toast.success(`${user.username} wurde dem Projekt zugewiesen`);
      } else if (moduleId) {
        // Modul-Berechtigung vergeben
        await moduleApi.grantPermission(moduleId, moduleType, user.id, 'edit');
        toast.success(`${user.username} wurde dem Modul zugewiesen`);
      }
      
      // Callback aufrufen um die UI zu aktualisieren
      if (onAssignmentChange) {
        onAssignmentChange();
      }
      
      setShowAssignment(false);
      setSearchTerm('');
      setSearchResults([]);
    } catch (error) {
      toast.error(error.message || 'Fehler bei der Benutzer-Zuweisung');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveUser = async (user) => {
    try {
      if (projectId) {
        // Projekt-Berechtigung entfernen
        await projectApi.revokePermission(projectId, user.id || user.user_id);
        toast.success(`${user.username} wurde vom Projekt entfernt`);
      } else if (moduleId) {
        // Modul-Berechtigung entfernen
        await moduleApi.revokePermission(moduleId, moduleType, user.id || user.user_id);
        toast.success(`${user.username} wurde vom Modul entfernt`);
      }
      
      // Callback aufrufen um die UI zu aktualisieren
      if (onAssignmentChange) {
        onAssignmentChange();
      }
    } catch (error) {
      toast.error(error.message || 'Fehler beim Entfernen des Benutzers');
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Zugewiesene Benutzer anzeigen */}
      {assignedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {assignedUsers.map((user) => (
            <div
              key={user.id || user.user_id}
              className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm"
            >
              <span>{user.username}</span>
              <button
                onClick={() => handleRemoveUser(user)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 ml-1"
                title="Benutzer entfernen"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* + Button für neue Zuweisung */}
      <button
        onClick={() => setShowAssignment(!showAssignment)}
        className="inline-flex items-center justify-center w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded-full text-sm font-medium transition-colors"
        title="Benutzer zuweisen"
      >
        +
      </button>

      {/* Suchfeld und Ergebnisse */}
      {showAssignment && (
        <div className="absolute top-8 left-0 z-50 w-64 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg">
          <div className="p-3">
            <input
              type="text"
              placeholder="Benutzer suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white text-sm"
              autoFocus
            />
          </div>
          
          {loading && (
            <div className="p-3 text-center text-slate-500 dark:text-slate-400 text-sm">
              Suche...
            </div>
          )}
          
          {!loading && searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto border-t border-slate-200 dark:border-slate-700">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleAssignUser(user)}
                  disabled={assigning}
                  className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-300 disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-slate-300 dark:bg-slate-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {!loading && searchTerm.length >= 2 && searchResults.length === 0 && (
            <div className="p-3 text-center text-slate-500 dark:text-slate-400 text-sm">
              Keine Benutzer gefunden
            </div>
          )}
          
          {searchTerm.length < 2 && (
            <div className="p-3 text-center text-slate-500 dark:text-slate-400 text-sm">
              Mindestens 2 Zeichen eingeben
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserAssignment;
