import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import ModuleForm from './ModuleForm';

const ProjectManagement = () => {
  const { projectApi, teamApi, moduleApi, user, isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showCreateModuleForm, setShowCreateModuleForm] = useState(false);
  const [showEditModuleForm, setShowEditModuleForm] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [filters, setFilters] = useState({
    team_id: '',
    status: '',
    visibility: ''
  });
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    target_date: '',
    team_id: '',
    visibility: 'private'
  });

  useEffect(() => {
    loadProjects();
    loadTeams();
  }, [filters]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectApi.getProjects(filters);
      setProjects(response.projects || []);
    } catch (error) {
      toast.error('Fehler beim Laden der Projekte');
      console.error('Error loading projects:', error);
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

  const loadProjectDetails = async (projectId) => {
    try {
      const response = await projectApi.getProject(projectId);
      setSelectedProject(response);
    } catch (error) {
      toast.error('Fehler beim Laden der Projekt-Details');
      console.error('Error loading project details:', error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectApi.createProject(newProject);
      toast.success('Projekt erfolgreich erstellt');
      setNewProject({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        start_date: '',
        target_date: '',
        team_id: '',
        visibility: 'private'
      });
      setShowCreateForm(false);
      loadProjects();
    } catch (error) {
      toast.error(error.message || 'Fehler beim Erstellen des Projekts');
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await projectApi.updateProject(selectedProject.project.id, selectedProject.project);
      toast.success('Projekt erfolgreich aktualisiert');
      setShowEditForm(false);
      loadProjects();
      loadProjectDetails(selectedProject.project.id);
    } catch (error) {
      toast.error(error.message || 'Fehler beim Aktualisieren des Projekts');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Projekt wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
    
    try {
      await projectApi.deleteProject(projectId);
      toast.success('Projekt erfolgreich gelöscht');
      setSelectedProject(null);
      loadProjects();
    } catch (error) {
      toast.error(error.message || 'Fehler beim Löschen des Projekts');
    }
  };

  const handleCreateModule = async (moduleData) => {
    try {
      await moduleApi.createProjectModule({
        ...moduleData,
        project_id: selectedProject.project.id
      });
      toast.success('Modul erfolgreich erstellt');
      setShowCreateModuleForm(false);
      loadProjectDetails(selectedProject.project.id);
    } catch (error) {
      toast.error(error.message || 'Fehler beim Erstellen des Moduls');
    }
  };

  const handleUpdateModule = async (moduleId, moduleData) => {
    try {
      await moduleApi.updateModule(moduleId, moduleData, 'project');
      toast.success('Modul erfolgreich aktualisiert');
      setShowEditModuleForm(false);
      setSelectedModule(null);
      loadProjectDetails(selectedProject.project.id);
    } catch (error) {
      toast.error(error.message || 'Fehler beim Aktualisieren des Moduls');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Modul wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;
    
    try {
      await moduleApi.deleteModule(moduleId, 'project');
      toast.success('Modul erfolgreich gelöscht');
      setSelectedModule(null);
      loadProjectDetails(selectedProject.project.id);
    } catch (error) {
      toast.error(error.message || 'Fehler beim Löschen des Moduls');
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
      case 'in_progress': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'testing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
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
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Projekt-Management</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Verwalte deine Projekte und die deines Teams
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Neues Projekt erstellen
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          {/* Projekte Liste */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Projekte</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {projects.length} Projekt{projects.length !== 1 ? 'e' : ''}
                </p>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => loadProjectDetails(project.id)}
                    className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                      selectedProject?.project?.id === project.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900 dark:text-white">{project.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(project.status)}`}>
                            {getStatusText(project.status)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(project.priority)}`}>
                            {getPriorityText(project.priority)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>{project.owner_username}</span>
                            <span>{project.completion_percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${project.completion_percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                    Keine Projekte gefunden
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Projekt Details */}
          <div className="lg:col-span-2">
            {selectedProject ? (
              <div className="space-y-6">
                {/* Projekt Info */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                          {selectedProject.project.name}
                        </h2>
                        {selectedProject.project.description && (
                          <p className="text-slate-600 dark:text-slate-400 mt-2">
                            {selectedProject.project.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-4">
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            Eigentümer: {selectedProject.project.owner_username}
                          </span>
                          {selectedProject.project.team_name && (
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              Team: {selectedProject.project.team_name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedProject.project.status)}`}>
                            {getStatusText(selectedProject.project.status)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(selectedProject.project.priority)}`}>
                            {getPriorityText(selectedProject.project.priority)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisibilityBadgeColor(selectedProject.project.visibility)}`}>
                            {getVisibilityText(selectedProject.project.visibility)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {(selectedProject.project.owner_id === user.id || isAdmin) && (
                          <>
                            <button
                              onClick={() => setShowEditForm(true)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Bearbeiten
                            </button>
                            <button
                              onClick={() => handleDeleteProject(selectedProject.project.id)}
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

                {/* Projekt Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Projekt-Details</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Fortschritt:</span>
                        <div className="mt-1">
                          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                            <span>{selectedProject.project.completion_percentage}% abgeschlossen</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${selectedProject.project.completion_percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      {selectedProject.project.start_date && (
                        <div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Startdatum:</span>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {new Date(selectedProject.project.start_date).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                      )}
                      {selectedProject.project.target_date && (
                        <div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Zieldatum:</span>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {new Date(selectedProject.project.target_date).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Erstellt:</span>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(selectedProject.project.created_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Module</h3>
                      <button
                        onClick={() => setShowCreateModuleForm(true)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Modul hinzufügen
                      </button>
                    </div>
                    <div className="space-y-3">
                      {selectedProject.modules.map((module) => (
                        <div key={module.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-slate-900 dark:text-white">{module.name}</h4>
                                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300 rounded">
                                  Projekt-Modul
                                </span>
                              </div>
                              {module.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                  {module.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(module.status)}`}>
                                  {getStatusText(module.status)}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(module.priority)}`}>
                                  {getPriorityText(module.priority)}
                                </span>
                                {module.assigned_username && (
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {module.assigned_username}
                                  </span>
                                )}
                              </div>
                              {module.completion_percentage !== undefined && (
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <span>Fortschritt</span>
                                    <span>{module.completion_percentage}%</span>
                                  </div>
                                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1">
                                    <div 
                                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                      style={{ width: `${module.completion_percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => {
                                  setSelectedModule(module);
                                  setShowEditModuleForm(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition-colors"
                              >
                                Bearbeiten
                              </button>
                              <button
                                onClick={() => handleDeleteModule(module.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
                              >
                                Löschen
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {selectedProject.modules.length === 0 && (
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Keine Module vorhanden</p>
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
                    {selectedProject.logs.map((log) => (
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
                    {selectedProject.logs.length === 0 && (
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Wähle ein Projekt aus
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Klicke auf ein Projekt in der Liste, um Details anzuzeigen
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Create Project Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Neues Projekt erstellen
              </h3>
              <form onSubmit={handleCreateProject}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Projekt-Name *
                    </label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
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
                      value={newProject.priority}
                      onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
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
                      value={newProject.team_id}
                      onChange={(e) => setNewProject({ ...newProject, team_id: e.target.value })}
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
                      value={newProject.visibility}
                      onChange={(e) => setNewProject({ ...newProject, visibility: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="private">Privat</option>
                      <option value="team">Team</option>
                      <option value="public">Öffentlich</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Startdatum
                    </label>
                    <input
                      type="date"
                      value={newProject.start_date}
                      onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Zieldatum
                    </label>
                    <input
                      type="date"
                      value={newProject.target_date}
                      onChange={(e) => setNewProject({ ...newProject, target_date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Beschreibung
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    rows={3}
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

        {/* Edit Project Modal */}
        {showEditForm && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Projekt bearbeiten
              </h3>
              <form onSubmit={handleUpdateProject}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Projekt-Name *
                    </label>
                    <input
                      type="text"
                      value={selectedProject.project.name}
                      onChange={(e) => setSelectedProject({
                        ...selectedProject,
                        project: { ...selectedProject.project, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedProject.project.status}
                      onChange={(e) => setSelectedProject({
                        ...selectedProject,
                        project: { ...selectedProject.project, status: e.target.value }
                      })}
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
                      value={selectedProject.project.priority}
                      onChange={(e) => setSelectedProject({
                        ...selectedProject,
                        project: { ...selectedProject.project, priority: e.target.value }
                      })}
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
                      Fortschritt (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedProject.project.completion_percentage}
                      onChange={(e) => setSelectedProject({
                        ...selectedProject,
                        project: { ...selectedProject.project, completion_percentage: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Sichtbarkeit
                    </label>
                    <select
                      value={selectedProject.project.visibility}
                      onChange={(e) => setSelectedProject({
                        ...selectedProject,
                        project: { ...selectedProject.project, visibility: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="private">Privat</option>
                      <option value="team">Team</option>
                      <option value="public">Öffentlich</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Startdatum
                    </label>
                    <input
                      type="date"
                      value={selectedProject.project.start_date || ''}
                      onChange={(e) => setSelectedProject({
                        ...selectedProject,
                        project: { ...selectedProject.project, start_date: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Zieldatum
                    </label>
                    <input
                      type="date"
                      value={selectedProject.project.target_date || ''}
                      onChange={(e) => setSelectedProject({
                        ...selectedProject,
                        project: { ...selectedProject.project, target_date: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Beschreibung
                  </label>
                  <textarea
                    value={selectedProject.project.description || ''}
                    onChange={(e) => setSelectedProject({
                      ...selectedProject,
                      project: { ...selectedProject.project, description: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditForm(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Speichern
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Module Modal - REMOVED */}
        {false && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Neues Modul für "{selectedProject.project.name}" erstellen
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const moduleData = {
                  name: formData.get('name'),
                  description: formData.get('description'),
                  status: formData.get('status'),
                  priority: formData.get('priority'),
                  estimated_hours: formData.get('estimated_hours'),
                  assigned_to: formData.get('assigned_to') || null,
                  due_date: formData.get('due_date') || null,
                  visibility: formData.get('visibility'),
                  tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
                  dependencies: formData.get('dependencies') ? formData.get('dependencies').split(',').map(dep => dep.trim()) : []
                };
                handleCreateModule(moduleData);
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Modul-Name *
                    </label>
                    <input
                      type="text"
                      value=""
                      onChange={() => {}}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      value=""
                      onChange={() => {}}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="not_started">Nicht begonnen</option>
                      <option value="in_progress">In Bearbeitung</option>
                      <option value="testing">Testen</option>
                      <option value="completed">Abgeschlossen</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Priorität
                    </label>
                    <select
                      value=""
                      onChange={() => {}}
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
                      Geschätzte Stunden
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value=""
                      onChange={() => {}}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Fälligkeitsdatum
                    </label>
                    <input
                      type="date"
                      value=""
                      onChange={() => {}}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Sichtbarkeit
                    </label>
                    <select
                      value=""
                      onChange={() => {}}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="private">Privat</option>
                      <option value="team">Team</option>
                      <option value="public">Öffentlich</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Beschreibung
                  </label>
                  <textarea
                    value=""
                    onChange={() => {}}
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
                    value=""
                    onChange={() => {}}
                    placeholder="frontend, backend, api"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {}}
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

        {/* Edit Module Modal - REMOVED */}
        {false && false && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Modul bearbeiten
              </h3>
              <form onSubmit={() => {}}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Modul-Name *
                    </label>
                    <input
                      type="text"
                      value=""
                      onChange={() => {}}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      value=""
                      onChange={() => {}}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="not_started">Nicht begonnen</option>
                      <option value="in_progress">In Bearbeitung</option>
                      <option value="testing">Testen</option>
                      <option value="completed">Abgeschlossen</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Priorität
                    </label>
                    <select
                      value=""
                      onChange={() => {}}
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
                      Fortschritt (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value="0"
                      onChange={() => {}}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Geschätzte Stunden
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value=""
                      onChange={() => {}}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Fälligkeitsdatum
                    </label>
                    <input
                      type="date"
                      value=""
                      onChange={() => {}}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Beschreibung
                  </label>
                  <textarea
                    value=""
                    onChange={() => {}}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {}}
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Speichern
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Module Form */}
        {showCreateModuleForm && selectedProject && (
          <ModuleForm
            projectId={selectedProject.project.id}
            onClose={() => setShowCreateModuleForm(false)}
            onSuccess={() => loadProjectDetails(selectedProject.project.id)}
          />
        )}

        {/* Edit Module Form */}
        {showEditModuleForm && selectedModule && (
          <ModuleForm
            projectId={selectedProject?.project?.id}
            editModule={selectedModule}
            moduleType="project"
            onClose={() => {
              setShowEditModuleForm(false);
              setSelectedModule(null);
            }}
            onSuccess={() => loadProjectDetails(selectedProject.project.id)}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectManagement;
