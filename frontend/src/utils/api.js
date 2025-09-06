// API Utility Functions
// Zentrale API-Konfiguration für das Frontend

// API Base URL Helper
export const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  const currentHost = window.location.hostname;
  const currentPort = window.location.port;
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return `http://${currentHost}:3001/api`;
  }
  
  if (currentPort === '3000') {
    return `http://${currentHost}:3001/api`;
  }
  
  if (!currentPort || currentPort === '80' || currentPort === '443') {
    return `http://${currentHost}:3001/api`;
  }
  
  return '/api';
};

// API Request Helper
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const API_BASE_URL = getApiBaseUrl();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Tasks API Functions
export const tasksApi = {
  // Meine Aufgaben abrufen
  getMyTasks: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return await apiRequest(`/tasks/my-tasks?${queryParams}`);
  },

  // Task-Statistiken abrufen
  getTaskStats: async () => {
    return await apiRequest('/tasks/my-tasks/stats');
  },

  // Einzelnen Task abrufen
  getTask: async (taskId) => {
    return await apiRequest(`/tasks/${taskId}`);
  },

  // Task erstellen
  createTask: async (taskData) => {
    return await apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  // Task aktualisieren
  updateTask: async (taskId, taskData) => {
    return await apiRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  // Bulk-Update für Tasks
  bulkUpdateTasks: async (taskIds, updates) => {
    return await apiRequest('/tasks/bulk-update', {
      method: 'PUT',
      body: JSON.stringify({
        task_ids: taskIds,
        updates
      }),
    });
  },

  // Task löschen
  deleteTask: async (taskId) => {
    return await apiRequest(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  // Task-Kommentare abrufen
  getTaskComments: async (taskId) => {
    return await apiRequest(`/tasks/${taskId}/comments`);
  },

  // Task-Kommentar hinzufügen
  addTaskComment: async (taskId, comment) => {
    return await apiRequest(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  // Task-Aktivitäten abrufen
  getTaskActivities: async (taskId) => {
    return await apiRequest(`/tasks/${taskId}/activities`);
  }
};

// Projects API Functions
export const projectsApi = {
  // Alle Projekte abrufen
  getProjects: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return await apiRequest(`/projects?${queryParams}`);
  },

  // Einzelnes Projekt abrufen
  getProject: async (projectId) => {
    return await apiRequest(`/projects/${projectId}`);
  },

  // Projekt erstellen
  createProject: async (projectData) => {
    return await apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  // Projekt aktualisieren
  updateProject: async (projectId, projectData) => {
    return await apiRequest(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  },

  // Projekt löschen
  deleteProject: async (projectId) => {
    return await apiRequest(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }
};

export default {
  getApiBaseUrl,
  apiRequest,
  tasksApi,
  projectsApi
};
