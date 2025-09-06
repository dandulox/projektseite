import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import TaskTable from '../components/tasks/TaskTable';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskStats from '../components/tasks/TaskStats';
import BulkActions from '../components/tasks/BulkActions';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Filter,
  RefreshCw,
  Plus,
  Download,
  Upload
} from 'lucide-react';

const MyTasksPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // State für Filter und Pagination
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    project_id: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState('due_date');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // API-Funktionen
  const fetchMyTasks = async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort_by: sortBy,
      sort_order: sortOrder,
      ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ''))
    });

    const response = await userApi.get(`/tasks/my-tasks?${params}`);
    return response.data;
  };

  const fetchTaskStats = async () => {
    const response = await userApi.get('/tasks/my-tasks/stats');
    return response.data;
  };

  const bulkUpdateTasks = async (updates) => {
    const response = await userApi.put('/tasks/bulk-update', {
      task_ids: selectedTasks,
      updates
    });
    return response.data;
  };

  // Queries
  const { 
    data: tasksData, 
    isLoading: tasksLoading, 
    error: tasksError,
    refetch: refetchTasks
  } = useQuery({
    queryKey: ['my-tasks', filters, sortBy, sortOrder, page, limit],
    queryFn: fetchMyTasks,
    keepPreviousData: true
  });

  const { 
    data: statsData, 
    isLoading: statsLoading 
  } = useQuery({
    queryKey: ['my-tasks-stats'],
    queryFn: fetchTaskStats
  });

  // Mutations
  const bulkUpdateMutation = useMutation({
    mutationFn: bulkUpdateTasks,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(['my-tasks']);
      queryClient.invalidateQueries(['my-tasks-stats']);
      setSelectedTasks([]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Fehler beim Aktualisieren der Tasks');
    }
  });

  // Event Handlers
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
    setPage(1);
  };

  const handleBulkAction = (action, value) => {
    if (selectedTasks.length === 0) {
      toast.error('Bitte wählen Sie mindestens eine Aufgabe aus');
      return;
    }

    const updates = {};
    switch (action) {
      case 'status':
        updates.status = value;
        break;
      case 'priority':
        updates.priority = value;
        break;
      case 'assignee':
        updates.assignee_id = value;
        break;
      default:
        toast.error('Unbekannte Aktion');
        return;
    }

    bulkUpdateMutation.mutate(updates);
  };

  const handleSelectTask = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTasks.length === tasksData?.tasks?.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasksData?.tasks?.map(task => task.id) || []);
    }
  };

  const handleRefresh = () => {
    refetchTasks();
    queryClient.invalidateQueries(['my-tasks-stats']);
    toast.success('Daten aktualisiert');
  };

  // Loading State
  if (tasksLoading && !tasksData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (tasksError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                  Fehler beim Laden der Aufgaben
                </h3>
                <p className="text-red-600 dark:text-red-400 mt-1">
                  {tasksError.response?.data?.error || 'Ein unbekannter Fehler ist aufgetreten'}
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                Meine Aufgaben
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Verwalten Sie Ihre zugewiesenen Aufgaben und verfolgen Sie den Fortschritt
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
              <button
                onClick={handleRefresh}
                disabled={tasksLoading}
                className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${tasksLoading ? 'animate-spin' : ''}`} />
                Aktualisieren
              </button>
            </div>
          </div>
        </div>

        {/* Statistiken */}
        {statsData && (
          <TaskStats 
            stats={statsData} 
            loading={statsLoading}
            className="mb-8"
          />
        )}

        {/* Filter */}
        {showFilters && (
          <div className="mb-6">
            <TaskFilters
              filters={filters}
              onFiltersChange={handleFilterChange}
              onClose={() => setShowFilters(false)}
            />
          </div>
        )}

        {/* Bulk Actions */}
        {selectedTasks.length > 0 && (
          <div className="mb-6">
            <BulkActions
              selectedCount={selectedTasks.length}
              onBulkAction={handleBulkAction}
              onClearSelection={() => setSelectedTasks([])}
            />
          </div>
        )}

        {/* Tasks Tabelle */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <TaskTable
            tasks={tasksData?.tasks || []}
            loading={tasksLoading}
            selectedTasks={selectedTasks}
            onSelectTask={handleSelectTask}
            onSelectAll={handleSelectAll}
            onSortChange={handleSortChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            pagination={tasksData?.pagination}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <CheckSquare className="h-8 w-8 text-green-600 dark:text-green-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Aufgaben verwalten
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Erstellen, bearbeiten und organisieren Sie Ihre Aufgaben
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Fälligkeiten verfolgen
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Behalten Sie Fälligkeitsdaten und Prioritäten im Blick
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Fortschritt analysieren
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Verfolgen Sie Ihre Produktivität und Leistung
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasksPage;
