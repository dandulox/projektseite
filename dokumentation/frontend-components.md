# Frontend-Komponenten-Dokumentation
## Task-Management Features

> **Version:** 2.1.0 "Stabilisator"  
> **Letzte Aktualisierung:** September 2025

## 📋 Übersicht

Diese Dokumentation beschreibt die Frontend-Komponenten für die drei Hauptfeatures des Task-Management-Systems:

1. **My-Tasks** - Personalisierte Task-Übersicht
2. **Deadlines** - Dashboard-Widget für anstehende Fälligkeiten  
3. **Kanban-Board** - Drag & Drop Task-Management

## 🎨 Design-System

### CSS-Klassen
Das System verwendet ein konsistentes Design-System mit Tailwind CSS:

```css
/* Button-Klassen */
.btn-primary { /* Primäre Aktionen */ }
.btn-secondary { /* Sekundäre Aktionen */ }
.btn-danger { /* Gefährliche Aktionen */ }

/* Input-Klassen */
.input { /* Standard-Inputs */ }
.select { /* Select-Dropdowns */ }
.textarea { /* Textareas */ }

/* Layout-Klassen */
.page-header { /* Seiten-Header */ }
.page-title { /* Haupttitel */ }
.page-subtitle { /* Untertitel */ }

/* Card-Klassen */
.card { /* Standard-Karten */ }
.card-header { /* Karten-Header */ }
.card-body { /* Karten-Inhalt */ }
```

### Theme-Management
- **Light Mode:** Standard-Design
- **Dark Mode:** Automatische Erkennung oder manueller Toggle
- **Responsive:** Mobile-First-Ansatz

## 📊 Feature A: My-Tasks

### MyTasksPage.jsx

**Pfad:** `frontend/src/pages/MyTasksPage.jsx`

**Beschreibung:** Hauptseite für die personalisierte Task-Übersicht.

**Features:**
- Task-Liste mit Filterung und Sortierung
- Pagination für große Task-Mengen
- Statistiken-Widget
- Responsive Design

**Props:** Keine (verwendet Auth-Context)

**State:**
```javascript
const [tasks, setTasks] = useState([]);
const [loading, setLoading] = useState(true);
const [filters, setFilters] = useState({
  status: '',
  priority: '',
  project_id: ''
});
const [pagination, setPagination] = useState({
  page: 1,
  limit: 20,
  total: 0
});
```

**API-Integration:**
```javascript
// React Query für Daten-Fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['my-tasks', filters, pagination],
  queryFn: () => tasksApi.getMyTasks(filters, pagination),
  staleTime: 5 * 60 * 1000, // 5 Minuten Cache
});
```

**Komponenten-Struktur:**
```jsx
<MyTasksPage>
  <PageHeader>
    <PageTitle>Meine Aufgaben</PageTitle>
    <PageSubtitle>Übersicht deiner zugewiesenen Tasks</PageSubtitle>
  </PageHeader>
  
  <TaskFilters>
    <StatusFilter />
    <PriorityFilter />
    <ProjectFilter />
  </TaskFilters>
  
  <TaskStats>
    <TotalTasks />
    <CompletedTasks />
    <OverdueTasks />
  </TaskStats>
  
  <TaskList>
    <TaskCard />
    <TaskCard />
    // ... weitere Tasks
  </TaskList>
  
  <Pagination />
</MyTasksPage>
```

### TaskCard.jsx

**Pfad:** `frontend/src/components/TaskCard.jsx`

**Beschreibung:** Einzelne Task-Karte mit allen relevanten Informationen.

**Props:**
```javascript
{
  task: {
    id: number,
    title: string,
    description: string,
    status: string,
    priority: string,
    due_date: string,
    project: object,
    assignee: object
  },
  onStatusChange: function,
  onEdit: function,
  onDelete: function
}
```

**Features:**
- Status-Badge mit Farbkodierung
- Priorität-Anzeige
- Fälligkeitsdatum mit Urgency-Anzeige
- Projekt-Information
- Aktionen (Bearbeiten, Löschen)

**Status-Farben:**
```javascript
const getStatusColor = (status) => {
  const colors = {
    todo: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    review: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status] || colors.todo;
};
```

**Priorität-Farben:**
```javascript
const getPriorityColor = (priority) => {
  const colors = {
    low: 'text-gray-600',
    medium: 'text-blue-600',
    high: 'text-orange-600',
    critical: 'text-red-600'
  };
  return colors[priority] || colors.medium;
};
```

## 📅 Feature B: Deadlines (Dashboard)

### DeadlinesWidget.tsx

**Pfad:** `frontend/src/components/dashboard/DeadlinesWidget.tsx`

**Beschreibung:** Dashboard-Widget für anstehende Deadlines.

**Features:**
- Liste anstehender Deadlines (≤7 Tage)
- Urgency-Anzeige mit Farbkodierung
- Klick-Navigation zu Projekten
- Empty-State-Handling

**Props:**
```javascript
{
  deadlines: Array<{
    id: number,
    title: string,
    due_date: string,
    project_name: string,
    project_id: number,
    urgency: string,
    is_overdue: boolean
  }>,
  onTaskClick: function
}
```

**Urgency-Levels:**
```javascript
const getUrgencyColor = (urgency) => {
  const colors = {
    critical: 'text-red-600 bg-red-50 border-red-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    low: 'text-blue-600 bg-blue-50 border-blue-200'
  };
  return colors[urgency] || colors.medium;
};
```

**Komponenten-Struktur:**
```jsx
<DeadlinesWidget>
  <WidgetHeader>
    <WidgetTitle>Kommende Deadlines</WidgetTitle>
    <TaskCount>{deadlines.length}</TaskCount>
  </WidgetHeader>
  
  {deadlines.length > 0 ? (
    <DeadlinesList>
      <DeadlineItem />
      <DeadlineItem />
      // ... weitere Deadlines
    </DeadlinesList>
  ) : (
    <EmptyState>
      <EmptyIcon />
      <EmptyMessage>Keine Deadlines in den nächsten 7 Tagen</EmptyMessage>
      <EmptyAction>Task erstellen</EmptyAction>
    </EmptyState>
  )}
</DeadlinesWidget>
```

### DeadlineItem.jsx

**Pfad:** `frontend/src/components/dashboard/DeadlineItem.jsx`

**Beschreibung:** Einzelne Deadline-Item im Widget.

**Props:**
```javascript
{
  deadline: {
    id: number,
    title: string,
    due_date: string,
    project_name: string,
    project_id: number,
    urgency: string,
    is_overdue: boolean
  },
  onClick: function
}
```

**Features:**
- Urgency-Badge
- Fälligkeitsdatum-Formatierung
- Projekt-Link
- Hover-Effekte

## 🎯 Feature C: Kanban-Board

### KanbanBoard.jsx

**Pfad:** `frontend/src/components/KanbanBoard.jsx`

**Beschreibung:** Drag & Drop Kanban-Board für Task-Management.

**Features:**
- 5 Spalten (Todo, In Progress, Review, Completed, Cancelled)
- Drag & Drop-Funktionalität
- Optimistic Updates
- Real-time Status-Updates

**Props:**
```javascript
{
  projectId: number,
  onTaskUpdate: function
}
```

**State:**
```javascript
const [columns, setColumns] = useState([]);
const [loading, setLoading] = useState(true);
const [draggedTask, setDraggedTask] = useState(null);
```

**API-Integration:**
```javascript
// Kanban-Daten laden
const fetchKanbanBoard = async (projectId) => {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/board`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Task-Status aktualisieren
const updateTaskStatus = async ({ taskId, status }) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
  return response.json();
};
```

**Drag & Drop-Implementierung:**
```javascript
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const onDragEnd = (result) => {
  const { destination, source, draggableId } = result;
  
  if (!destination) return;
  
  if (destination.droppableId === source.droppableId && 
      destination.index === source.index) {
    return;
  }
  
  // Optimistic Update
  const newColumns = Array.from(columns);
  const sourceColumn = newColumns.find(col => col.id === source.droppableId);
  const destColumn = newColumns.find(col => col.id === destination.droppableId);
  
  const task = sourceColumn.tasks.find(t => t.id.toString() === draggableId);
  
  // Task aus Quell-Spalte entfernen
  sourceColumn.tasks.splice(source.index, 1);
  
  // Task in Ziel-Spalte einfügen
  task.status = destination.droppableId;
  destColumn.tasks.splice(destination.index, 0, task);
  
  setColumns(newColumns);
  
  // API-Update
  updateTaskStatus({ taskId: task.id, status: destination.droppableId });
};
```

**Komponenten-Struktur:**
```jsx
<KanbanBoard>
  <BoardHeader>
    <ProjectInfo />
    <BoardStats />
  </BoardHeader>
  
  <DragDropContext onDragEnd={onDragEnd}>
    <BoardColumns>
      <Droppable droppableId="todo">
        <Column>
          <ColumnHeader>Todo</ColumnHeader>
          <TaskList>
            <Draggable task={task} index={index}>
              <TaskCard />
            </Draggable>
          </TaskList>
        </Column>
      </Droppable>
      
      // ... weitere Spalten
    </BoardColumns>
  </DragDropContext>
</KanbanBoard>
```

### TaskCard (Kanban)

**Pfad:** `frontend/src/components/KanbanBoard.jsx` (interne Komponente)

**Beschreibung:** Task-Karte für das Kanban-Board.

**Features:**
- Kompakte Darstellung
- Drag-Handle
- Priorität-Anzeige
- Fälligkeitsdatum
- Hover-Effekte

**Props:**
```javascript
{
  task: {
    id: number,
    title: string,
    priority: string,
    due_date: string,
    assignee: object
  },
  index: number
}
```

## 🔧 Utility-Komponenten

### DateUtils.js

**Pfad:** `frontend/src/utils/dateUtils.js`

**Beschreibung:** Hilfsfunktionen für Datumsformatierung.

**Funktionen:**
```javascript
// ISO-Datumsstring zu yyyy-MM-dd für HTML Date-Inputs
formatDateForInput(isoDateString) // "2025-09-13T00:00:00.000Z" → "2025-09-13"

// yyyy-MM-dd zu ISO-Datumsstring für API
formatDateForApi(dateString) // "2025-09-13" → "2025-09-13T00:00:00.000Z"

// Datum für Anzeige formatieren
formatDateForDisplay(isoDateString) // "2025-09-13T00:00:00.000Z" → "13.09.2025"

// Tage bis Fälligkeit berechnen
getDaysUntilDue(dueDate) // Anzahl Tage (negativ = überfällig)

// Prüfen ob Datum in der Zukunft liegt
isDateInFuture(dateString) // boolean

// Datumsformat validieren
isValidDateFormat(dateString) // boolean
```

### StatusConstants.js

**Pfad:** `frontend/src/utils/statusConstants.js`

**Beschreibung:** Zentrale Status-Definitionen für Frontend.

**Inhalte:**
```javascript
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const KANBAN_COLUMNS = [
  { id: 'todo', title: 'Todo', status: 'todo' },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress' },
  { id: 'review', title: 'Review', status: 'review' },
  { id: 'completed', title: 'Completed', status: 'completed' },
  { id: 'cancelled', title: 'Cancelled', status: 'cancelled' }
];

export const TASK_STATUS_LABELS = {
  todo: 'Zu erledigen',
  in_progress: 'In Bearbeitung',
  review: 'Zur Überprüfung',
  completed: 'Abgeschlossen',
  cancelled: 'Abgebrochen'
};

export const TASK_PRIORITY_LABELS = {
  low: 'Niedrig',
  medium: 'Mittel',
  high: 'Hoch',
  critical: 'Kritisch'
};
```

### API.js

**Pfad:** `frontend/src/utils/api.js`

**Beschreibung:** Zentrale API-Utility-Funktionen.

**Features:**
- Automatische API-URL-Erkennung
- JWT-Token-Handling
- Error-Handling
- Request/Response-Interceptors

**API-URL-Erkennung:**
```javascript
export const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  const currentHost = window.location.hostname;
  
  // Für Server-Umgebung (IP-Adressen)
  if (currentHost.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return `http://${currentHost}:3001/api`;
  }
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return `http://${currentHost}:3001/api`;
  }
  
  return '/api';
};
```

**API-Request-Helper:**
```javascript
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const API_BASE_URL = getApiBaseUrl();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API Request Error: ${response.status}`);
  }
  
  return response.json();
};
```

## 🎨 Styling & Theming

### CSS-Variablen
```css
:root {
  /* Farben */
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  
  /* Status-Farben */
  --color-todo: #6b7280;
  --color-in-progress: #3b82f6;
  --color-review: #f59e0b;
  --color-completed: #10b981;
  --color-cancelled: #ef4444;
  
  /* Priorität-Farben */
  --color-priority-low: #6b7280;
  --color-priority-medium: #3b82f6;
  --color-priority-high: #f59e0b;
  --color-priority-critical: #ef4444;
}
```

### Dark Mode
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #1f2937;
    --color-surface: #374151;
    --color-text: #f9fafb;
    --color-text-secondary: #d1d5db;
  }
}
```

### Responsive Design
```css
/* Mobile First */
.task-card {
  @apply p-4 rounded-lg shadow-sm border;
}

/* Tablet */
@media (min-width: 768px) {
  .task-card {
    @apply p-6;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .task-card {
    @apply p-8;
  }
}
```

## 🧪 Testing

### Komponenten-Tests
```javascript
// MyTasksPage.test.jsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyTasksPage from './MyTasksPage';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

test('renders My Tasks page', () => {
  const queryClient = createTestQueryClient();
  
  render(
    <QueryClientProvider client={queryClient}>
      <MyTasksPage />
    </QueryClientProvider>
  );
  
  expect(screen.getByText('Meine Aufgaben')).toBeInTheDocument();
});
```

### Integration-Tests
```javascript
// KanbanBoard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DragDropContext } from 'react-beautiful-dnd';
import KanbanBoard from './KanbanBoard';

test('handles drag and drop', () => {
  render(<KanbanBoard projectId={1} />);
  
  const taskCard = screen.getByText('Test Task');
  const targetColumn = screen.getByText('In Progress');
  
  fireEvent.dragStart(taskCard);
  fireEvent.dragOver(targetColumn);
  fireEvent.drop(targetColumn);
  
  expect(screen.getByText('Task status updated')).toBeInTheDocument();
});
```

## 📱 Mobile-Optimierung

### Touch-Gesten
- **Swipe:** Task-Status ändern
- **Long Press:** Task-Details anzeigen
- **Pull to Refresh:** Daten aktualisieren

### Responsive Breakpoints
```css
/* Mobile */
@media (max-width: 767px) {
  .kanban-board {
    @apply flex-col;
  }
  
  .task-card {
    @apply text-sm;
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .kanban-board {
    @apply grid-cols-3;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .kanban-board {
    @apply grid-cols-5;
  }
}
```

## 🔍 Performance-Optimierung

### React Query Caching
```javascript
const { data: tasks } = useQuery({
  queryKey: ['my-tasks', filters],
  queryFn: () => tasksApi.getMyTasks(filters),
  staleTime: 5 * 60 * 1000, // 5 Minuten
  cacheTime: 10 * 60 * 1000, // 10 Minuten
  refetchOnWindowFocus: false,
});
```

### Lazy Loading
```javascript
import { lazy, Suspense } from 'react';

const KanbanBoard = lazy(() => import('./KanbanBoard'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <KanbanBoard />
  </Suspense>
);
```

### Memoization
```javascript
import { memo, useMemo } from 'react';

const TaskCard = memo(({ task, onUpdate }) => {
  const statusColor = useMemo(() => 
    getStatusColor(task.status), [task.status]
  );
  
  return (
    <div className={`task-card ${statusColor}`}>
      {task.title}
    </div>
  );
});
```

## 🐛 Error-Handling

### Error Boundaries
```javascript
class TaskErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Task Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

### Loading States
```javascript
const TaskList = () => {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks
  });
  
  if (isLoading) return <TaskListSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!tasks?.length) return <EmptyState />;
  
  return (
    <div>
      {tasks.map(task => <TaskCard key={task.id} task={task} />)}
    </div>
  );
};
```

## 📞 Support

Bei Problemen mit Frontend-Komponenten:

1. **Browser-Konsole prüfen:**
   ```javascript
   // JavaScript-Fehler anzeigen
   console.error('Frontend Error:', error);
   ```

2. **React DevTools verwenden:**
   - Komponenten-State inspizieren
   - Props-Änderungen verfolgen
   - Performance-Probleme identifizieren

3. **Network-Tab prüfen:**
   - API-Requests überwachen
   - Response-Times analysieren
   - Fehlerhafte Requests identifizieren

4. **Dokumentation konsultieren:**
   - [API-Dokumentation](./api-features.md)
   - [Setup-Anleitung](../FEATURE_SETUP.md)
   - [Troubleshooting](../RISKS_AND_FOLLOWUP.md)
