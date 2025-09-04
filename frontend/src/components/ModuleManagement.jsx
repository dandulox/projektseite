import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ModuleManagement = () => {
  const { moduleApi, teamApi, user, isAdmin } = useAuth();
  const [modules, setModules] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [showTeamAssignmentForm, setShowTeamAssignmentForm] = useState(false);
  const [availableModules, setAvailableModules] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    team_id: '',
    status: '',
    visibility: ''
  });
  const [newModule, setNewModule] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    target_date: '',
    team_id: '',
    visibility: 'private',
    estimated_hours: '',
    assigned_to: '',
    tags: '',
    dependencies: ''
  });
  const [newConnection, setNewConnection] = useState({
    target_module_id: '',
    target_module_type: 'standalone',
    connection_type: 'depends_on',
    description: ''
  });
  const [newTeamAssignment, setNewTeamAssignment] = useState({
    team_id: '',
    role: 'member'
  });

  useEffect(() => {
    loadModules();
    loadTeams();
  }, [filters]);

  const loadModules = async () => {
    try {
      setLoading(true);
      const response = await moduleApi.getModules(filters);
      setModules(response.modules || []);
    } catch (error) {
      toast.error('Fehler beim Laden der Module');
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const response = await teamApi.getTeams();
      setTeams(response.teams || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const loadModuleDetails = async (moduleId, moduleType) => {
    try {
      const response = await moduleApi.getModule(moduleId, moduleType);
      setSelectedModule(response);
      // Lade verfügbare Module für Verbindungen (alle Module außer dem aktuellen)
      const allModules = await moduleApi.getModules({});
      const filteredModules = allModules.modules.filter(module => 
        !(module.id === moduleId && module.module_type === moduleType)
      );
      setAvailableModules(filteredModules);
    } catch (error) {
      toast.error('Fehler beim Laden der Modul-Details');
      console.error('Error loading module details:', error);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      await moduleApi.createStandaloneModule(newModule);
      toast.success('Modul erfolgreich erstellt');
      setNewModule({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        start_date: '',
        target_date: '',
        team_id: '',
        visibility: 'private',
        estimated_hours: '',
        assigned_to: '',
        tags: '',
        dependencies: ''
      });
      setShowCreateForm(false);
      loadModules();
    } catch (error) {
      toast.error(error.message || 'Fehler beim Erstellen des Moduls');
    }
  };

  const handleUpdateModule = async (e) => {
    e.preventDefault();
    try {
      await moduleApi.updateModule(selectedModule.module.id, selectedModule.module.module_type, selectedModule.module);
      toast.success('Modul erfolgreich aktualisiert');
      setShowEditForm(false);
      loadModules();
      loadModuleDetails(selectedModule.module.id, selectedModule.module.module_type);
    } catch (error) {
      toast.error(error.message || 'Fehler beim Aktualisieren des Moduls');
    }
  };

  const handleDeleteModule = async (moduleId, moduleType) => {
    if (!window.confirm('Modul wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
    
    try {
      await moduleApi.deleteModule(moduleId, moduleType);
      toast.success('Modul erfolgreich gelöscht');
      setSelectedModule(null);
      loadModules();
    } catch (error) {
      toast.error(error.message || 'Fehler beim Löschen des Moduls');
    }
  };

  const handleCreateConnection = async (e) => {
    e.preventDefault();
    try {
      await moduleApi.createModuleConnection(
        selectedModule.module.id, 
        selectedModule.module.module_type, 
        newConnection
      );
      toast.success('Verbindung erfolgreich erstellt');
      setNewConnection({
        target_module_id: '',
        target_module_type: 'standalone',
        connection_type: 'depends_on',
        description: ''
      });
      setShowConnectionForm(false);
      loadModuleDetails(selectedModule.module.id, selectedModule.module.module_type);
    } catch (error) {
      toast.error(error.message || 'Fehler beim Erstellen der Verbindung');
    }
  };

  const handleDeleteConnection = async (connectionId) => {
    if (!window.confirm('Verbindung wirklich löschen?')) return;
    
    try {
      await moduleApi.deleteModuleConnection(
        selectedModule.module.id, 
        selectedModule.module.module_type, 
        connectionId
      );
      toast.success('Verbindung erfolgreich gelöscht');
      loadModuleDetails(selectedModule.module.id, selectedModule.module.module_type);
    } catch (error) {
      toast.error(error.message || 'Fehler beim Löschen der Verbindung');
    }
  };

  const handleAssignTeam = async (e) => {
    e.preventDefault();
    try {
      await moduleApi.assignModuleToTeam(
        selectedModule.module.id, 
        selectedModule.module.module_type, 
        newTeamAssignment.team_id, 
        newTeamAssignment.role
      );
      toast.success('Team erfolgreich zugewiesen');
      setNewTeamAssignment({
        team_id: '',
        role: 'member'
      });
      setShowTeamAssignmentForm(false);
      loadModuleDetails(selectedModule.module.id, selectedModule.module.module_type);
    } catch (error) {
      toast.error(error.message || 'Fehler beim Zuweisen des Teams');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'on_hold': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'not_started': return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'testing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-200';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-200';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-200';
    }
  };

  const getVisibilityBadgeColor = (visibility) => {
    switch (visibility) {
      case 'private': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'team': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'public': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-200';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'planning': 'Planung',
      'active': 'Aktiv',
      'on_hold': 'Pausiert',
      'completed': 'Abgeschlossen',
      'cancelled': 'Abgebrochen',
      'not_started': 'Nicht begonnen',
      'in_progress': 'In Bearbeitung',
      'testing': 'Testen'
    };
    return statusMap[status] || status;
  };

  const getPriorityText = (priority) => {
    const priorityMap = {
      'low': 'Niedrig',
      'medium': 'Mittel',
      'high': 'Hoch',
      'critical': 'Kritisch'
    };
    return priorityMap[priority] || priority;
  };

  const getVisibilityText = (visibility) => {
    const visibilityMap = {
      'private': 'Privat',
      'team': 'Team',
      'public': 'Öffentlich'
    };
    return visibilityMap[visibility] || visibility;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Modul-Management</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Verwalte deine Module und deren Verbindungen
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Neues Modul erstellen
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Typ
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="">Alle Typen</option>
                <option value="project">Projekt-Module</option>
                <option value="standalone">Eigenständige Module</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Team
              </label>
              <select
                value={filters.team_id}
                onChange={(e) => setFilters({ ...filters, team_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="">Alle Teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="">Alle Status</option>
                <option value="planning">Planung</option>
                <option value="active">Aktiv</option>
                <option value="on_hold">Pausiert</option>
                <option value="completed">Abgeschlossen</option>
                <option value="cancelled">Abgebrochen</option>
                <option value="not_started">Nicht begonnen</option>
                <option value="in_progress">In Bearbeitung</option>
                <option value="testing">Testen</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Sichtbarkeit
              </label>
              <select
                value={filters.visibility}
                onChange={(e) => setFilters({ ...filters, visibility: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              >
                <option value="">Alle Sichtbarkeiten</option>
                <option value="private">Privat</option>
                <option value="team">Team</option>
                <option value="public">Öffentlich</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Module Liste */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Module</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {modules.length} Modul{modules.length !== 1 ? 'e' : ''}
                </p>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
                {modules.map((module) => (
                  <div
                    key={`${module.module_type}-${module.id}`}
                    onClick={() => loadModuleDetails(module.id, module.module_type)}
                    className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                      selectedModule?.module?.id === module.id && selectedModule?.module?.module_type === module.module_type ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-slate-900 dark:text-white">{module.name}</h3>
                          <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded">
                            {module.module_type === 'project' ? 'Projekt' : 'Eigenständig'}
                          </span>
                        </div>
                        {module.project_name && (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Projekt: {module.project_name}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(module.status)}`}>
                            {getStatusText(module.status)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(module.priority)}`}>
                            {getPriorityText(module.priority)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>{module.owner_username}</span>
                            <span>{module.completion_percentage || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${module.completion_percentage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {modules.length === 0 && (
                  <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                    Keine Module gefunden
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modul Details */}
          <div className="lg:col-span-2">
            {selectedModule ? (
              <div className="space-y-6">
                {/* Modul Info */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {selectedModule.module.name}
                          </h2>
                          <span className="text-sm px-2 py-1 bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded">
                            {selectedModule.module.module_type === 'project' ? 'Projekt-Modul' : 'Eigenständiges Modul'}
                          </span>
                        </div>
                        {selectedModule.module.description && (
                          <p className="text-slate-600 dark:text-slate-400 mt-2">
                            {selectedModule.module.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-4">
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            Eigentümer: {selectedModule.module.owner_username}
                          </span>
                          {selectedModule.module.team_name && (
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              Team: {selectedModule.module.team_name}
                            </span>
                          )}
                          {selectedModule.module.assigned_username && (
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              Zugewiesen: {selectedModule.module.assigned_username}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedModule.module.status)}`}>
                            {getStatusText(selectedModule.module.status)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(selectedModule.module.priority)}`}>
                            {getPriorityText(selectedModule.module.priority)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisibilityBadgeColor(selectedModule.module.visibility)}`}>
                            {getVisibilityText(selectedModule.module.visibility)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {(selectedModule.module.owner_id === user.id || isAdmin) && (
                          <>
                            <button
                              onClick={() => setShowEditForm(true)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Bearbeiten
                            </button>
                            <button
                              onClick={() => handleDeleteModule(selectedModule.module.id, selectedModule.module.module_type)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Löschen
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modul Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Modul-Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Fortschritt:</span>
                        <div className="mt-1">
                          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                            <span>{selectedModule.module.completion_percentage || 0}% abgeschlossen</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${selectedModule.module.completion_percentage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      {selectedModule.module.start_date && (
                        <div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Startdatum:</span>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {new Date(selectedModule.module.start_date).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                      )}
                      {selectedModule.module.target_date && (
                        <div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Zieldatum:</span>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {new Date(selectedModule.module.target_date).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                      )}
                      {selectedModule.module.estimated_hours && (
                        <div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Geschätzte Stunden:</span>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {selectedModule.module.estimated_hours}h
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Erstellt:</span>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(selectedModule.module.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Verbindungen</h3>
                      <button
                        onClick={() => setShowConnectionForm(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Verbindung hinzufügen
                      </button>
                    </div>
                    <div className="space-y-3">
                      {selectedModule.connections.map((connection) => (
                        <div key={connection.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-slate-900 dark:text-white">
                                {connection.target_module_name}
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {connection.connection_type} - {connection.target_module_type}
                              </p>
                              {connection.description && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                  {connection.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(connection.target_module_status)}`}>
                                {getStatusText(connection.target_module_status)}
                              </span>
                              <button
                                onClick={() => handleDeleteConnection(connection.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
                              >
                                Löschen
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {selectedModule.connections.length === 0 && (
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Keine Verbindungen vorhanden</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Team-Zuweisungen</h3>
                      <button
                        onClick={() => setShowTeamAssignmentForm(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Team zuweisen
                      </button>
                    </div>
                    <div className="space-y-3">
                      {selectedModule.team_assignments && selectedModule.team_assignments.length > 0 ? (
                        selectedModule.team_assignments.map((assignment) => (
                          <div key={assignment.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-slate-900 dark:text-white">
                                  {assignment.team_name}
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  Rolle: {assignment.role}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  Zugewiesen: {new Date(assignment.assigned_at).toLocaleDateString('de-DE')}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                assignment.role === 'leader' 
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  : assignment.role === 'member'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-200'
                              }`}>
                                {assignment.role === 'leader' ? 'Leader' : assignment.role === 'member' ? 'Mitglied' : 'Viewer'}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Keine Team-Zuweisungen vorhanden</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Aktivitäts-Log */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Aktivitäts-Log</h3>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {selectedModule.logs.map((log) => (
                      <div key={log.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-slate-900 dark:text-white">
                              <span className="font-medium">{log.username}</span> {log.action}
                            </p>
                            {log.details && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {log.details}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(log.timestamp).toLocaleString('de-DE')}
                          </span>
                        </div>
                      </div>
                    ))}
                    {selectedModule.logs.length === 0 && (
                      <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                        Keine Aktivitäten vorhanden
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                <div className="text-slate-400 dark:text-slate-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Wähle ein Modul aus
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Klicke auf ein Modul in der Liste, um Details anzuzeigen
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Create Module Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Neues Modul erstellen
              </h3>
              <form onSubmit={handleCreateModule}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Modul-Name *
                    </label>
                    <input
                      type="text"
                      value={newModule.name}
                      onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      value={newModule.status}
                      onChange={(e) => setNewModule({ ...newModule, status: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="planning">Planung</option>
                      <option value="active">Aktiv</option>
                      <option value="on_hold">Pausiert</option>
                      <option value="completed">Abgeschlossen</option>
                      <option value="cancelled">Abgebrochen</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Priorität
                    </label>
                    <select
                      value={newModule.priority}
                      onChange={(e) => setNewModule({ ...newModule, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="low">Niedrig</option>
                      <option value="medium">Mittel</option>
                      <option value="high">Hoch</option>
                      <option value="critical">Kritisch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Team
                    </label>
                    <select
                      value={newModule.team_id}
                      onChange={(e) => setNewModule({ ...newModule, team_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="">Kein Team</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Sichtbarkeit
                    </label>
                    <select
                      value={newModule.visibility}
                      onChange={(e) => setNewModule({ ...newModule, visibility: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="private">Privat</option>
                      <option value="team">Team</option>
                      <option value="public">Öffentlich</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Geschätzte Stunden
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={newModule.estimated_hours}
                      onChange={(e) => setNewModule({ ...newModule, estimated_hours: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Startdatum
                    </label>
                    <input
                      type="date"
                      value={newModule.start_date}
                      onChange={(e) => setNewModule({ ...newModule, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Zieldatum
                    </label>
                    <input
                      type="date"
                      value={newModule.target_date}
                      onChange={(e) => setNewModule({ ...newModule, target_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Beschreibung
                  </label>
                  <textarea
                    value={newModule.description}
                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    rows={3}
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tags (kommagetrennt)
                  </label>
                  <input
                    type="text"
                    value={newModule.tags}
                    onChange={(e) => setNewModule({ ...newModule, tags: e.target.value })}
                    placeholder="frontend, backend, api"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Erstellen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Connection Modal */}
        {showConnectionForm && selectedModule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Verbindung für "{selectedModule.module.name}" erstellen
              </h3>
              <form onSubmit={handleCreateConnection}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Ziel-Modul *
                    </label>
                    <select
                      value={newConnection.target_module_id}
                      onChange={(e) => setNewConnection({ ...newConnection, target_module_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      required
                    >
                      <option value="">Modul auswählen</option>
                      {availableModules.map((module) => (
                        <option key={`${module.module_type}-${module.id}`} value={module.id}>
                          {module.name} ({module.module_type === 'project' ? 'Projekt-Modul' : 'Eigenständig'})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Modul-Typ
                    </label>
                    <select
                      value={newConnection.target_module_type}
                      onChange={(e) => setNewConnection({ ...newConnection, target_module_type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="standalone">Eigenständiges Modul</option>
                      <option value="project">Projekt-Modul</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Verbindungstyp *
                    </label>
                    <select
                      value={newConnection.connection_type}
                      onChange={(e) => setNewConnection({ ...newConnection, connection_type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      required
                    >
                      <option value="depends_on">Hängt ab von</option>
                      <option value="blocks">Blockiert</option>
                      <option value="related_to">Verwandt mit</option>
                      <option value="duplicates">Dupliziert</option>
                      <option value="supersedes">Ersetzt</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Beschreibung
                  </label>
                  <textarea
                    value={newConnection.description}
                    onChange={(e) => setNewConnection({ ...newConnection, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    rows={3}
                    placeholder="Beschreibung der Verbindung..."
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowConnectionForm(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Verbindung erstellen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Team Assignment Modal */}
        {showTeamAssignmentForm && selectedModule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Team für "{selectedModule.module.name}" zuweisen
              </h3>
              <form onSubmit={handleAssignTeam}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Team *
                    </label>
                    <select
                      value={newTeamAssignment.team_id}
                      onChange={(e) => setNewTeamAssignment({ ...newTeamAssignment, team_id: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      required
                    >
                      <option value="">Team auswählen</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Rolle
                    </label>
                    <select
                      value={newTeamAssignment.role}
                      onChange={(e) => setNewTeamAssignment({ ...newTeamAssignment, role: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="member">Mitglied</option>
                      <option value="leader">Leader</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowTeamAssignmentForm(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Team zuweisen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModuleManagement;
