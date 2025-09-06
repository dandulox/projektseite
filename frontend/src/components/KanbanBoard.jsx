import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  Calendar, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Circle, 
  PlayCircle, 
  Eye,
  XCircle,
  MoreHorizontal,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { de } from 'date-fns/locale';

// API-Funktionen
const fetchKanbanBoard = async (projectId) => {
  const token = localStorage.getItem('token');
  const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/board`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Fehler beim Laden des Kanban Boards');
  }
  
  return response.json();
};

const updateTaskStatus = async ({ taskId, status }) => {
  const token = localStorage.getItem('token');
  const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
  
  if (!response.ok) {
    throw new Error('Fehler beim Aktualisieren des Task-Status');
  }
  
  return response.json();
};

// Task Card Komponente
const TaskCard = ({ task, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo': return <Circle className="w-4 h-4" />;
      case 'in_progress': return <PlayCircle className="w-4 h-4" />;
      case 'review': return <Eye className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const isOverdue = task.is_overdue;
  const isDueSoon = task.is_due_soon;

  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing ${
            snapshot.isDragging ? 'shadow-lg rotate-2' : ''
          } ${isOverdue ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(task.status)}
              <h3 className="font-medium text-slate-900 dark:text-white text-sm leading-tight">
                {task.title}
              </h3>
            </div>
            {isHovered && (
              <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                <MoreHorizontal className="w-4 h-4 text-slate-500" />
              </button>
            )}
          </div>

          {/* Beschreibung */}
          {task.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-full">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Priorität */}
              <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              
              {/* Assignee */}
              {task.assignee_username && (
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3 text-slate-500" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {task.assignee_username}
                  </span>
                </div>
              )}
            </div>

            {/* Due Date */}
            {task.due_date && (
              <div className={`flex items-center space-x-1 ${
                isOverdue ? 'text-red-600 dark:text-red-400' : 
                isDueSoon ? 'text-orange-600 dark:text-orange-400' : 
                'text-slate-500 dark:text-slate-400'
              }`}>
                <Calendar className="w-3 h-3" />
                <span className="text-xs">
                  {format(new Date(task.due_date), 'dd.MM', { locale: de })}
                </span>
                {isOverdue && <AlertCircle className="w-3 h-3" />}
              </div>
            )}
          </div>

          {/* Estimated Hours */}
          {task.estimated_hours && (
            <div className="mt-2 flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{task.estimated_hours}h geschätzt</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

// Kanban Column Komponente
const KanbanColumn = ({ column, tasks }) => {
  const getColumnColor = (columnId) => {
    switch (columnId) {
      case 'todo': return 'border-slate-300 bg-slate-50 dark:bg-slate-800/50';
      case 'in_progress': return 'border-blue-300 bg-blue-50 dark:bg-blue-900/20';
      case 'review': return 'border-purple-300 bg-purple-50 dark:bg-purple-900/20';
      case 'completed': return 'border-green-300 bg-green-50 dark:bg-green-900/20';
      case 'cancelled': return 'border-red-300 bg-red-50 dark:bg-red-900/20';
      default: return 'border-slate-300 bg-slate-50 dark:bg-slate-800/50';
    }
  };

  return (
    <div className={`flex-1 min-w-80 max-w-96`}>
      <div className={`rounded-lg border-2 ${getColumnColor(column.id)} p-4`}>
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {column.title}
            </h3>
            <span className="bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </div>
          <button className="p-1 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded">
            <Plus className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Tasks */}
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-96 transition-colors duration-200 ${
                snapshot.isDraggingOver ? 'bg-white/30 dark:bg-slate-700/30' : ''
              }`}
            >
              {tasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
              {provided.placeholder}
              
              {/* Empty State */}
              {tasks.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <div className="text-4xl mb-2">📋</div>
                  <p className="text-sm">Keine Aufgaben</p>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
};

// Hauptkomponente
const KanbanBoard = ({ projectId }) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Kanban Board Daten laden
  const { data: kanbanData, isLoading, error } = useQuery({
    queryKey: ['kanbanBoard', projectId],
    queryFn: () => fetchKanbanBoard(projectId),
    refetchInterval: 30000, // Alle 30 Sekunden aktualisieren
  });

  // Task Status Update Mutation
  const updateStatusMutation = useMutation({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(['kanbanBoard', projectId]);
      toast.success('Task-Status erfolgreich aktualisiert');
    },
    onError: (error) => {
      toast.error('Fehler beim Aktualisieren des Task-Status');
      console.error('Update error:', error);
    },
  });

  // Drag & Drop Handler
  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    // Kein gültiges Ziel
    if (!destination) return;

    // Gleiche Position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    // Optimistic Update
    queryClient.setQueryData(['kanbanBoard', projectId], (oldData) => {
      if (!oldData) return oldData;

      const newData = { ...oldData };
      
      // Task aus alter Spalte entfernen
      const sourceColumn = newData.columns.find(col => col.id === source.droppableId);
      const task = sourceColumn.tasks.find(t => t.id === taskId);
      
      if (task) {
        sourceColumn.tasks = sourceColumn.tasks.filter(t => t.id !== taskId);
        
        // Task in neue Spalte einfügen
        const destColumn = newData.columns.find(col => col.id === destination.droppableId);
        if (destColumn) {
          task.status = newStatus;
          destColumn.tasks.splice(destination.index, 0, task);
        }
      }
      
      return newData;
    });

    // API Update
    updateStatusMutation.mutate({ taskId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">❌</div>
        <p className="text-red-600 dark:text-red-400">Fehler beim Laden des Kanban Boards</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {error.message}
        </p>
      </div>
    );
  }

  if (!kanbanData) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">📋</div>
        <p className="text-slate-600 dark:text-slate-400">Keine Daten verfügbar</p>
      </div>
    );
  }

  const { project, columns, totalTasks } = kanbanData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Kanban Board
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {project.name} • {totalTasks} Aufgaben
          </p>
        </div>
        
        {/* Filter und Suche */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Aufgaben suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Alle Status</option>
            <option value="todo">Zu erledigen</option>
            <option value="in_progress">In Bearbeitung</option>
            <option value="review">Review</option>
            <option value="completed">Abgeschlossen</option>
            <option value="cancelled">Abgebrochen</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={column.tasks}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;

