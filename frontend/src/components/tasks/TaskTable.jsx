import React from 'react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  ChevronUp, 
  ChevronDown, 
  CheckSquare, 
  Square, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Tag,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

const TaskTable = ({
  tasks,
  loading,
  selectedTasks,
  onSelectTask,
  onSelectAll,
  onSortChange,
  sortBy,
  sortOrder,
  pagination,
  onPageChange,
  onLimitChange
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'review':
        return <Eye className="h-4 w-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Square className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
        return <ArrowUp className="h-4 w-4 text-red-600" />;
      case 'high':
        return <ArrowUp className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <Minus className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <ArrowDown className="h-4 w-4 text-green-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getDueDateStatus = (dueDate, status) => {
    if (!dueDate || status === 'completed' || status === 'cancelled') {
      return null;
    }

    const today = new Date();
    const due = new Date(dueDate);
    const threeDaysFromNow = addDays(today, 3);

    if (isBefore(due, today)) {
      return { type: 'overdue', color: 'text-red-600 dark:text-red-400' };
    } else if (isBefore(due, threeDaysFromNow)) {
      return { type: 'due_soon', color: 'text-orange-600 dark:text-orange-400' };
    }

    return null;
  };

  const SortableHeader = ({ field, children, className = '' }) => {
    const isActive = sortBy === field;
    const isAsc = sortOrder === 'ASC';

    return (
      <th 
        className={`px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${className}`}
        onClick={() => onSortChange(field)}
      >
        <div className="flex items-center space-x-1">
          <span>{children}</span>
          {isActive ? (
            isAsc ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
          ) : (
            <div className="h-4 w-4" />
          )}
        </div>
      </th>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-8 text-center">
        <CheckSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
          Keine Aufgaben gefunden
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          Es wurden keine Aufgaben gefunden, die Ihren Filterkriterien entsprechen.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedTasks.length === tasks.length && tasks.length > 0}
                onChange={onSelectAll}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </th>
            <SortableHeader field="title">Aufgabe</SortableHeader>
            <SortableHeader field="status">Status</SortableHeader>
            <SortableHeader field="priority">Priorität</SortableHeader>
            <SortableHeader field="project_name">Projekt</SortableHeader>
            <SortableHeader field="due_date">Fälligkeitsdatum</SortableHeader>
            <SortableHeader field="estimated_hours">Geschätzte Zeit</SortableHeader>
            <SortableHeader field="updated_at">Aktualisiert</SortableHeader>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Aktionen
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {tasks.map((task) => {
            const dueDateStatus = getDueDateStatus(task.due_date, task.status);
            const isSelected = selectedTasks.includes(task.id);

            return (
              <tr 
                key={task.id} 
                className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                  isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelectTask(task.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">
                      {getStatusIcon(task.status)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                          {task.description}
                        </div>
                      )}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {task.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {task.tags.length > 3 && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              +{task.tags.length - 3} weitere
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status === 'todo' ? 'Zu erledigen' :
                     task.status === 'in_progress' ? 'In Bearbeitung' :
                     task.status === 'review' ? 'Zur Prüfung' :
                     task.status === 'completed' ? 'Abgeschlossen' :
                     task.status === 'cancelled' ? 'Abgebrochen' : task.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {getPriorityIcon(task.priority)}
                    <span className="ml-1">
                      {task.priority === 'critical' ? 'Kritisch' :
                       task.priority === 'high' ? 'Hoch' :
                       task.priority === 'medium' ? 'Mittel' :
                       task.priority === 'low' ? 'Niedrig' : task.priority}
                    </span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                  {task.project_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {task.due_date ? (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                      <span className={`text-sm ${dueDateStatus?.color || 'text-slate-900 dark:text-slate-100'}`}>
                        {format(new Date(task.due_date), 'dd.MM.yyyy', { locale: de })}
                      </span>
                      {dueDateStatus && (
                        <AlertTriangle className="h-4 w-4 ml-2 text-red-500" />
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                  {task.estimated_hours ? `${task.estimated_hours}h` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {format(new Date(task.updated_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="bg-white dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zurück
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Weiter
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Zeige{' '}
                <span className="font-medium">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{' '}
                bis{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                von{' '}
                <span className="font-medium">{pagination.total}</span>{' '}
                Ergebnissen
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={pagination.limit}
                onChange={(e) => onLimitChange(parseInt(e.target.value))}
                className="border border-slate-300 dark:border-slate-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <option value={10}>10 pro Seite</option>
                <option value={20}>20 pro Seite</option>
                <option value={50}>50 pro Seite</option>
                <option value={100}>100 pro Seite</option>
              </select>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {[...Array(pagination.pages)].map((_, i) => {
                  const page = i + 1;
                  const isCurrentPage = page === pagination.page;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        isCurrentPage
                          ? 'z-10 bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTable;
