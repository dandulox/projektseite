import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { projectsApi } from '../../utils/api';
import { 
  X, 
  Search, 
  Filter, 
  Calendar,
  User,
  Tag,
  RefreshCw
} from 'lucide-react';

const TaskFilters = ({ filters, onFiltersChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  // Projekte für Filter abrufen
  const { data: projectsData } = useQuery({
    queryKey: ['projects-for-filter'],
    queryFn: () => projectsApi.getProjects()
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      status: '',
      priority: '',
      project_id: '',
      search: ''
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const handleClearFilter = (key) => {
    const newFilters = { ...localFilters, [key]: '' };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400 mr-2" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Filter
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Zurücksetzen
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Suchfeld */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Suche
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={localFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Nach Titel oder Beschreibung suchen..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {localFilters.search && (
              <button
                onClick={() => handleClearFilter('search')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Status
          </label>
          <div className="relative">
            <select
              value={localFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Alle Status</option>
              <option value="todo">Zu erledigen</option>
              <option value="in_progress">In Bearbeitung</option>
              <option value="review">Zur Prüfung</option>
              <option value="completed">Abgeschlossen</option>
              <option value="cancelled">Abgebrochen</option>
            </select>
            {localFilters.status && (
              <button
                onClick={() => handleClearFilter('status')}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Priorität Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Priorität
          </label>
          <div className="relative">
            <select
              value={localFilters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Alle Prioritäten</option>
              <option value="critical">Kritisch</option>
              <option value="high">Hoch</option>
              <option value="medium">Mittel</option>
              <option value="low">Niedrig</option>
            </select>
            {localFilters.priority && (
              <button
                onClick={() => handleClearFilter('priority')}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Projekt Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Projekt
          </label>
          <div className="relative">
            <select
              value={localFilters.project_id}
              onChange={(e) => handleFilterChange('project_id', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Alle Projekte</option>
              {projectsData?.projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {localFilters.project_id && (
              <button
                onClick={() => handleClearFilter('project_id')}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Erweiterte Filter */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
          Erweiterte Filter
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Fälligkeitsdatum Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Fälligkeitsdatum
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                  Überfällig
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                  Fällig in 3 Tagen
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                  Ohne Fälligkeitsdatum
                </span>
              </label>
            </div>
          </div>

          {/* Zeitraum Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Erstellt
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                  Letzte 7 Tage
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                  Letzte 30 Tage
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                  Älter als 30 Tage
                </span>
              </label>
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tags
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                  Mit Tags
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                  Ohne Tags
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Aktive Filter anzeigen */}
      {hasActiveFilters && (
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Aktive Filter
          </h4>
          <div className="flex flex-wrap gap-2">
            {filters.status && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                Status: {filters.status === 'todo' ? 'Zu erledigen' :
                         filters.status === 'in_progress' ? 'In Bearbeitung' :
                         filters.status === 'review' ? 'Zur Prüfung' :
                         filters.status === 'completed' ? 'Abgeschlossen' :
                         filters.status === 'cancelled' ? 'Abgebrochen' : filters.status}
                <button
                  onClick={() => handleClearFilter('status')}
                  className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.priority && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                Priorität: {filters.priority === 'critical' ? 'Kritisch' :
                           filters.priority === 'high' ? 'Hoch' :
                           filters.priority === 'medium' ? 'Mittel' :
                           filters.priority === 'low' ? 'Niedrig' : filters.priority}
                <button
                  onClick={() => handleClearFilter('priority')}
                  className="ml-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.project_id && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Projekt: {projectsData?.projects?.find(p => p.id == filters.project_id)?.name || filters.project_id}
                <button
                  onClick={() => handleClearFilter('project_id')}
                  className="ml-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                Suche: "{filters.search}"
                <button
                  onClick={() => handleClearFilter('search')}
                  className="ml-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Aktionen */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
        >
          Zurücksetzen
        </button>
        <button
          onClick={handleApplyFilters}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Filter anwenden
        </button>
      </div>
    </div>
  );
};

export default TaskFilters;
