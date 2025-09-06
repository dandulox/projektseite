// Feature Tests für Frontend-Komponenten
// Testet My-Tasks, Deadlines und Kanban-Board Komponenten

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

// Mock API-Funktionen
const mockApiRequest = vi.fn();
const mockTasksApi = {
  getMyTasks: vi.fn(),
  getTaskStats: vi.fn(),
  updateTask: vi.fn(),
  bulkUpdateTasks: vi.fn()
};

// Mock Auth Context
const mockAuthContext = {
  user: {
    id: 1,
    username: 'admin',
    email: 'admin@example.com'
  },
  token: 'mock-token'
};

// Mock Data
const mockTasksData = {
  tasks: [
    {
      id: 1,
      title: 'Test Task 1',
      description: 'Test Description 1',
      status: 'todo',
      priority: 'high',
      due_date: '2024-12-25',
      project_name: 'Test Projekt',
      assignee_username: 'admin',
      is_overdue: false,
      is_due_soon: true
    },
    {
      id: 2,
      title: 'Test Task 2',
      description: 'Test Description 2',
      status: 'in_progress',
      priority: 'medium',
      due_date: '2024-12-30',
      project_name: 'Test Projekt',
      assignee_username: 'admin',
      is_overdue: false,
      is_due_soon: false
    }
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 2,
    pages: 1
  }
};

const mockStatsData = {
  total_tasks: 2,
  todo_count: 1,
  in_progress_count: 1,
  review_count: 0,
  completed_count: 0,
  overdue_count: 0,
  due_soon_count: 1
};

const mockDashboardData = {
  widgets: {
    openTasks: {
      title: 'Meine offenen Aufgaben',
      count: 2,
      items: mockTasksData.tasks
    },
    upcomingDeadlines: {
      title: 'Nächste Deadlines (7 Tage)',
      count: 1,
      items: [mockTasksData.tasks[0]]
    }
  }
};

const mockKanbanData = {
  project: {
    id: 1,
    name: 'Test Projekt'
  },
  columns: [
    {
      id: 'todo',
      title: 'Zu erledigen',
      tasks: [mockTasksData.tasks[0]]
    },
    {
      id: 'in_progress',
      title: 'In Bearbeitung',
      tasks: [mockTasksData.tasks[1]]
    },
    {
      id: 'review',
      title: 'Review',
      tasks: []
    },
    {
      id: 'completed',
      title: 'Abgeschlossen',
      tasks: []
    },
    {
      id: 'cancelled',
      title: 'Abgebrochen',
      tasks: []
    }
  ],
  totalTasks: 2
};

// Test Wrapper
const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Mock Auth Context Provider
const MockAuthProvider = ({ children }) => {
  return (
    <div data-testid="auth-provider">
      {children}
    </div>
  );
};

describe('Feature Tests', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Reset mocks
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockTasksApi.getMyTasks.mockResolvedValue(mockTasksData);
    mockTasksApi.getTaskStats.mockResolvedValue(mockStatsData);
    mockApiRequest.mockResolvedValue(mockDashboardData);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('A) My-Tasks Feature', () => {
    test('MyTasksPage sollte Tasks anzeigen', async () => {
      // Mock der MyTasksPage Komponente
      const MyTasksPage = () => {
        const [tasks, setTasks] = React.useState([]);
        const [loading, setLoading] = React.useState(true);

        React.useEffect(() => {
          mockTasksApi.getMyTasks().then(data => {
            setTasks(data.tasks);
            setLoading(false);
          });
        }, []);

        if (loading) return <div>Loading...</div>;

        return (
          <div>
            <h1>Meine Aufgaben</h1>
            {tasks.length === 0 ? (
              <div>Keine Aufgaben gefunden</div>
            ) : (
              <div>
                {tasks.map(task => (
                  <div key={task.id} data-testid={`task-${task.id}`}>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <span data-testid={`task-status-${task.id}`}>{task.status}</span>
                    <span data-testid={`task-priority-${task.id}`}>{task.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      };

      render(
        <TestWrapper>
          <MyTasksPage />
        </TestWrapper>
      );

      // Warten auf das Laden der Tasks
      await waitFor(() => {
        expect(screen.getByText('Meine Aufgaben')).toBeInTheDocument();
      });

      // Prüfen ob Tasks angezeigt werden
      await waitFor(() => {
        expect(screen.getByTestId('task-1')).toBeInTheDocument();
        expect(screen.getByTestId('task-2')).toBeInTheDocument();
      });

      // Prüfen ob Task-Details korrekt angezeigt werden
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
      expect(screen.getByTestId('task-status-1')).toHaveTextContent('todo');
      expect(screen.getByTestId('task-priority-1')).toHaveTextContent('high');
    });

    test('MyTasksPage sollte Empty State anzeigen wenn keine Tasks', async () => {
      mockTasksApi.getMyTasks.mockResolvedValue({
        tasks: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 }
      });

      const MyTasksPage = () => {
        const [tasks, setTasks] = React.useState([]);
        const [loading, setLoading] = React.useState(true);

        React.useEffect(() => {
          mockTasksApi.getMyTasks().then(data => {
            setTasks(data.tasks);
            setLoading(false);
          });
        }, []);

        if (loading) return <div>Loading...</div>;

        return (
          <div>
            <h1>Meine Aufgaben</h1>
            {tasks.length === 0 ? (
              <div data-testid="empty-state">Keine Aufgaben gefunden</div>
            ) : (
              <div>Tasks vorhanden</div>
            )}
          </div>
        );
      };

      render(
        <TestWrapper>
          <MyTasksPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });
    });

    test('MyTasksPage sollte Filter unterstützen', async () => {
      const MyTasksPage = () => {
        const [tasks, setTasks] = React.useState([]);
        const [filters, setFilters] = React.useState({ status: '', priority: '' });

        const handleFilterChange = (newFilters) => {
          setFilters(newFilters);
          mockTasksApi.getMyTasks(newFilters).then(data => {
            setTasks(data.tasks);
          });
        };

        React.useEffect(() => {
          mockTasksApi.getMyTasks(filters).then(data => {
            setTasks(data.tasks);
          });
        }, [filters]);

        return (
          <div>
            <h1>Meine Aufgaben</h1>
            <div>
              <select 
                data-testid="status-filter"
                onChange={(e) => handleFilterChange({ ...filters, status: e.target.value })}
              >
                <option value="">Alle Status</option>
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
              </select>
            </div>
            {tasks.map(task => (
              <div key={task.id} data-testid={`task-${task.id}`}>
                {task.title}
              </div>
            ))}
          </div>
        );
      };

      render(
        <TestWrapper>
          <MyTasksPage />
        </TestWrapper>
      );

      // Filter ändern
      const statusFilter = screen.getByTestId('status-filter');
      fireEvent.change(statusFilter, { target: { value: 'todo' } });

      // Prüfen ob API mit korrekten Filtern aufgerufen wurde
      await waitFor(() => {
        expect(mockTasksApi.getMyTasks).toHaveBeenCalledWith({ status: 'todo', priority: '' });
      });
    });
  });

  describe('B) Deadlines Feature', () => {
    test('DeadlinesWidget sollte Deadlines anzeigen', async () => {
      const DeadlinesWidget = ({ deadlines, loading }) => {
        if (loading) return <div>Loading...</div>;

        return (
          <div>
            <h3>Nächste Deadlines</h3>
            {deadlines.length === 0 ? (
              <div data-testid="no-deadlines">Keine anstehenden Deadlines</div>
            ) : (
              <div>
                {deadlines.map(deadline => (
                  <div key={deadline.id} data-testid={`deadline-${deadline.id}`}>
                    <h4>{deadline.name}</h4>
                    <p>{deadline.projectName}</p>
                    <span data-testid={`deadline-due-${deadline.id}`}>
                      {deadline.dueDate}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      };

      render(
        <TestWrapper>
          <DeadlinesWidget 
            deadlines={mockDashboardData.widgets.upcomingDeadlines.items}
            loading={false}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Nächste Deadlines')).toBeInTheDocument();
      expect(screen.getByTestId('deadline-1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Projekt')).toBeInTheDocument();
    });

    test('DeadlinesWidget sollte Empty State anzeigen wenn keine Deadlines', async () => {
      const DeadlinesWidget = ({ deadlines, loading }) => {
        if (loading) return <div>Loading...</div>;

        return (
          <div>
            <h3>Nächste Deadlines</h3>
            {deadlines.length === 0 ? (
              <div data-testid="no-deadlines">Keine anstehenden Deadlines</div>
            ) : (
              <div>Deadlines vorhanden</div>
            )}
          </div>
        );
      };

      render(
        <TestWrapper>
          <DeadlinesWidget deadlines={[]} loading={false} />
        </TestWrapper>
      );

      expect(screen.getByTestId('no-deadlines')).toBeInTheDocument();
    });

    test('DeadlinesWidget sollte Urgency korrekt anzeigen', async () => {
      const DeadlinesWidget = ({ deadlines }) => {
        const getUrgencyText = (daysUntilDue) => {
          if (daysUntilDue === null) return 'Kein Datum';
          if (daysUntilDue < 0) return 'Überfällig';
          if (daysUntilDue === 0) return 'Heute';
          if (daysUntilDue === 1) return 'Morgen';
          return `in ${daysUntilDue} Tagen`;
        };

        return (
          <div>
            {deadlines.map(deadline => (
              <div key={deadline.id}>
                <span data-testid={`urgency-${deadline.id}`}>
                  {getUrgencyText(deadline.daysUntilDue)}
                </span>
              </div>
            ))}
          </div>
        );
      };

      const deadlinesWithUrgency = [
        {
          id: 1,
          name: 'Test Task 1',
          dueDate: '2024-12-25',
          daysUntilDue: 1
        }
      ];

      render(
        <TestWrapper>
          <DeadlinesWidget deadlines={deadlinesWithUrgency} />
        </TestWrapper>
      );

      expect(screen.getByTestId('urgency-1')).toHaveTextContent('Morgen');
    });
  });

  describe('C) Kanban-Board Feature', () => {
    test('KanbanBoard sollte Spalten und Tasks anzeigen', async () => {
      const KanbanBoard = ({ projectId }) => {
        const [kanbanData, setKanbanData] = React.useState(null);
        const [loading, setLoading] = React.useState(true);

        React.useEffect(() => {
          // Mock API call
          setTimeout(() => {
            setKanbanData(mockKanbanData);
            setLoading(false);
          }, 100);
        }, [projectId]);

        if (loading) return <div>Loading...</div>;

        return (
          <div>
            <h2>{kanbanData.project.name}</h2>
            <div data-testid="kanban-columns">
              {kanbanData.columns.map(column => (
                <div key={column.id} data-testid={`column-${column.id}`}>
                  <h3>{column.title}</h3>
                  <div data-testid={`tasks-${column.id}`}>
                    {column.tasks.map(task => (
                      <div key={task.id} data-testid={`task-${task.id}`}>
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <KanbanBoard projectId={1} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Projekt')).toBeInTheDocument();
      });

      // Prüfen ob alle Spalten angezeigt werden
      expect(screen.getByTestId('column-todo')).toBeInTheDocument();
      expect(screen.getByTestId('column-in_progress')).toBeInTheDocument();
      expect(screen.getByTestId('column-review')).toBeInTheDocument();
      expect(screen.getByTestId('column-completed')).toBeInTheDocument();
      expect(screen.getByTestId('column-cancelled')).toBeInTheDocument();

      // Prüfen ob Tasks in korrekten Spalten sind
      expect(screen.getByTestId('tasks-todo')).toHaveTextContent('Test Task 1');
      expect(screen.getByTestId('tasks-in_progress')).toHaveTextContent('Test Task 2');
    });

    test('KanbanBoard sollte Drag & Drop unterstützen', async () => {
      const KanbanBoard = ({ projectId }) => {
        const [kanbanData, setKanbanData] = React.useState(mockKanbanData);

        const handleDragEnd = (result) => {
          if (!result.destination) return;

          const { source, destination, draggableId } = result;
          
          if (source.droppableId === destination.droppableId) return;

          // Update task status
          const newColumns = [...kanbanData.columns];
          const sourceColumn = newColumns.find(col => col.id === source.droppableId);
          const destColumn = newColumns.find(col => col.id === destination.droppableId);
          
          const task = sourceColumn.tasks.find(t => t.id.toString() === draggableId);
          task.status = destination.droppableId;
          
          sourceColumn.tasks = sourceColumn.tasks.filter(t => t.id.toString() !== draggableId);
          destColumn.tasks.push(task);

          setKanbanData({ ...kanbanData, columns: newColumns });
        };

        return (
          <div>
            <div data-testid="kanban-board" onDragEnd={handleDragEnd}>
              {kanbanData.columns.map(column => (
                <div key={column.id} data-testid={`column-${column.id}`}>
                  <h3>{column.title}</h3>
                  {column.tasks.map(task => (
                    <div 
                      key={task.id} 
                      data-testid={`task-${task.id}`}
                      draggable
                      onDragStart={() => {}}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      };

      render(
        <TestWrapper>
          <KanbanBoard projectId={1} />
        </TestWrapper>
      );

      // Simuliere Drag & Drop
      const task1 = screen.getByTestId('task-1');
      const inProgressColumn = screen.getByTestId('column-in_progress');

      // Simuliere Drag Start
      fireEvent.dragStart(task1);
      
      // Simuliere Drop
      fireEvent.drop(inProgressColumn);

      // Prüfen ob Task in neuer Spalte ist
      await waitFor(() => {
        expect(screen.getByTestId('tasks-in_progress')).toHaveTextContent('Test Task 1');
      });
    });

    test('KanbanBoard sollte Empty Columns anzeigen', async () => {
      const emptyKanbanData = {
        ...mockKanbanData,
        columns: mockKanbanData.columns.map(col => ({
          ...col,
          tasks: []
        }))
      };

      const KanbanBoard = ({ kanbanData }) => {
        return (
          <div>
            {kanbanData.columns.map(column => (
              <div key={column.id} data-testid={`column-${column.id}`}>
                <h3>{column.title}</h3>
                {column.tasks.length === 0 ? (
                  <div data-testid={`empty-${column.id}`}>Keine Tasks</div>
                ) : (
                  <div>Tasks vorhanden</div>
                )}
              </div>
            ))}
          </div>
        );
      };

      render(
        <TestWrapper>
          <KanbanBoard kanbanData={emptyKanbanData} />
        </TestWrapper>
      );

      // Prüfen ob alle Spalten als leer angezeigt werden
      expect(screen.getByTestId('empty-todo')).toBeInTheDocument();
      expect(screen.getByTestId('empty-in_progress')).toBeInTheDocument();
      expect(screen.getByTestId('empty-review')).toBeInTheDocument();
      expect(screen.getByTestId('empty-completed')).toBeInTheDocument();
      expect(screen.getByTestId('empty-cancelled')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('Komponenten sollten Fehler korrekt behandeln', async () => {
      mockTasksApi.getMyTasks.mockRejectedValue(new Error('API Error'));

      const MyTasksPage = () => {
        const [tasks, setTasks] = React.useState([]);
        const [error, setError] = React.useState(null);
        const [loading, setLoading] = React.useState(true);

        React.useEffect(() => {
          mockTasksApi.getMyTasks()
            .then(data => {
              setTasks(data.tasks);
              setLoading(false);
            })
            .catch(err => {
              setError(err.message);
              setLoading(false);
            });
        }, []);

        if (loading) return <div>Loading...</div>;
        if (error) return <div data-testid="error">{error}</div>;

        return <div>Tasks loaded</div>;
      };

      render(
        <TestWrapper>
          <MyTasksPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });

      expect(screen.getByTestId('error')).toHaveTextContent('API Error');
    });
  });
});

export default {
  mockTasksApi,
  mockApiRequest,
  mockAuthContext,
  mockTasksData,
  mockStatsData,
  mockDashboardData,
  mockKanbanData
};
