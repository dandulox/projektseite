import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import CommentsSection from './CommentsSection';
import {
  X,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  User,
  Target,
  Tag,
  Link,
  MessageSquare
} from 'lucide-react';

const ModuleDetails = ({ module, moduleType = 'project', onClose, onEdit, onDelete, onUpdate }) => {
  const { user, isAdmin } = useAuth();
  const [moduleDetails, setModuleDetails] = useState(module);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setModuleDetails(module);
  }, [module]);

  const handleUpdateModule = async (updateData) => {
    try {
      setLoading(true);
      await onUpdate(module.id, updateData);
      setModuleDetails({ ...moduleDetails, ...updateData });
      toast.success('Modul erfolgreich aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Aktualisieren des Moduls');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'testing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'not_started': return 'Nicht begonnen';
      case 'in_progress': return 'In Bearbeitung';
      case 'testing': return 'Testen';
      case 'completed': return 'Abgeschlossen';
      default: return status;
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'low': return 'Niedrig';
      case 'medium': return 'Mittel';
      case 'high': return 'Hoch';
      case 'critical': return 'Kritisch';
      default: return priority;
    }
  };

  const getVisibilityBadgeColor = (visibility) => {
    switch (visibility) {
      case 'private': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'team': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'public': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getVisibilityText = (visibility) => {
    switch (visibility) {
      case 'private': return 'Privat';
      case 'team': return 'Team';
      case 'public': return 'Öffentlich';
      default: return visibility;
    }
  };

  const canEdit = user && (user.id === module.owner_id || user.id === module.assigned_to || isAdmin);
  const canDelete = user && (user.id === module.owner_id || isAdmin);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Modul-Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Modul-Informationen */}
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {moduleDetails.name}
                  </h3>
                  {moduleDetails.description && (
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                      {moduleDetails.description}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {canEdit && (
                    <button
                      onClick={() => onEdit(moduleDetails)}
                      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      title="Bearbeiten"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => {
                        if (window.confirm('Möchten Sie dieses Modul wirklich löschen?')) {
                          onDelete(moduleDetails.id);
                        }
                      }}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status-Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(moduleDetails.status)}`}>
                  {getStatusText(moduleDetails.status)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadgeColor(moduleDetails.priority)}`}>
                  {getPriorityText(moduleDetails.priority)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVisibilityBadgeColor(moduleDetails.visibility)}`}>
                  {getVisibilityText(moduleDetails.visibility)}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {moduleType === 'project' ? 'Projekt-Modul' : 'Eigenständiges Modul'}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {moduleDetails.assigned_username && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Zugewiesen an</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {moduleDetails.assigned_username}
                      </p>
                    </div>
                  </div>
                )}

                {moduleDetails.estimated_hours && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Geschätzte Stunden</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {moduleDetails.estimated_hours}h
                      </p>
                    </div>
                  </div>
                )}

                {moduleDetails.actual_hours && (
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Tatsächliche Stunden</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {moduleDetails.actual_hours}h
                      </p>
                    </div>
                  </div>
                )}

                {moduleDetails.due_date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Fälligkeitsdatum</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {new Date(moduleDetails.due_date).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                )}

                {moduleDetails.completion_percentage !== undefined && (
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Fortschritt</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {moduleDetails.completion_percentage}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {moduleDetails.tags && moduleDetails.tags.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Tag className="w-4 h-4 text-slate-500" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Tags</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {moduleDetails.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dependencies */}
              {moduleDetails.dependencies && moduleDetails.dependencies.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Link className="w-4 h-4 text-slate-500" />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Abhängigkeiten</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {moduleDetails.dependencies.map((dep, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded text-xs"
                      >
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Kommentare */}
            <div>
              <CommentsSection 
                targetType={moduleType === 'project' ? 'module' : 'standalone_module'} 
                targetId={moduleDetails.id}
                className=""
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetails;
