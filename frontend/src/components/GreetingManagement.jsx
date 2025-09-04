import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Clock,
  Sun,
  Moon,
  Sunset,
  Sunrise
} from 'lucide-react';
import toast from 'react-hot-toast';

// API Base URL - dynamisch basierend auf der aktuellen Domain
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Verwende relative Pfade für lokale Entwicklung oder gleiche Domain
  const currentHost = window.location.hostname;
  const currentPort = window.location.port;
  
  // Wenn wir auf localhost oder 127.0.0.1 sind, verwende Port 3001
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return `http://${currentHost}:3001/api`;
  }
  
  // Für Produktionsumgebung: Verwende den gleichen Host mit Port 3001
  // oder falls Port 3000, dann Backend auf 3001
  if (currentPort === '3000') {
    return `http://${currentHost}:3001/api`;
  }
  
  // Fallback: Verwende relative Pfade
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

// API-Funktionen
const fetchGreetings = async () => {
  const response = await fetch(`${API_BASE_URL}/greetings`);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Fehler:', response.status, errorText);
    throw new Error(`Fehler beim Abrufen der Begrüßungen: ${response.status} ${errorText}`);
  }
  return response.json();
};

const createGreeting = async (greetingData) => {
  const response = await fetch(`${API_BASE_URL}/greetings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(greetingData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Fehler:', response.status, errorText);
    throw new Error(`Fehler beim Erstellen der Begrüßung: ${response.status} ${errorText}`);
  }
  return response.json();
};

const updateGreeting = async ({ id, ...greetingData }) => {
  const response = await fetch(`${API_BASE_URL}/greetings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(greetingData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Fehler:', response.status, errorText);
    throw new Error(`Fehler beim Aktualisieren der Begrüßung: ${response.status} ${errorText}`);
  }
  return response.json();
};

const deleteGreeting = async (id) => {
  const response = await fetch(`${API_BASE_URL}/greetings/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Fehler:', response.status, errorText);
    throw new Error(`Fehler beim Löschen der Begrüßung: ${response.status} ${errorText}`);
  }
  return response.json();
};

// Zeitperioden-Icons
const timePeriodIcons = {
  morning: <Sunrise className="w-4 h-4" />,
  afternoon: <Sun className="w-4 h-4" />,
  evening: <Sunset className="w-4 h-4" />,
  night: <Moon className="w-4 h-4" />
};

const timePeriodLabels = {
  morning: 'Morgen (5-11 Uhr)',
  afternoon: 'Nachmittag (12-16 Uhr)',
  evening: 'Abend (17-21 Uhr)',
  night: 'Nacht (22-4 Uhr)'
};

const timePeriodColors = {
  morning: 'text-yellow-600 dark:text-yellow-400',
  afternoon: 'text-orange-600 dark:text-orange-400',
  evening: 'text-purple-600 dark:text-purple-400',
  night: 'text-blue-600 dark:text-blue-400'
};

const GreetingManagement = () => {
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    time_period: 'morning',
    hour: null,
    is_active: true
  });

  const queryClient = useQueryClient();

  // Queries
  const { data: greetings = [], isLoading, error } = useQuery({
    queryKey: ['greetings'],
    queryFn: fetchGreetings,
    retry: 2,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Query Fehler:', error);
      toast.error(`Fehler beim Laden der Begrüßungen: ${error.message}`);
    }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createGreeting,
    onSuccess: () => {
      queryClient.invalidateQueries(['greetings']);
      toast.success('Begrüßung erfolgreich erstellt!');
      setShowCreateForm(false);
      setFormData({ text: '', time_period: 'morning', hour: null, is_active: true });
    },
    onError: (error) => {
      toast.error('Fehler beim Erstellen der Begrüßung');
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateGreeting,
    onSuccess: () => {
      queryClient.invalidateQueries(['greetings']);
      toast.success('Begrüßung erfolgreich aktualisiert!');
      setEditingId(null);
    },
    onError: (error) => {
      toast.error('Fehler beim Aktualisieren der Begrüßung');
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGreeting,
    onSuccess: () => {
      queryClient.invalidateQueries(['greetings']);
      toast.success('Begrüßung erfolgreich gelöscht!');
    },
    onError: (error) => {
      toast.error('Fehler beim Löschen der Begrüßung');
      console.error(error);
    },
  });

  // Event Handlers
  const handleCreate = (e) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      toast.error('Bitte geben Sie einen Text ein');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = (id, data) => {
    updateMutation.mutate({ id, ...data });
  };

  const handleDelete = (id) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Begrüßung löschen möchten?')) {
      deleteMutation.mutate(id);
    }
  };

  const startEdit = (greeting) => {
    setEditingId(greeting.id);
    setFormData({
      text: greeting.text,
      time_period: greeting.time_period,
      hour: greeting.hour,
      is_active: greeting.is_active
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ text: '', time_period: 'morning', hour: null, is_active: true });
  };

  // Gruppiere Begrüßungen nach Zeitperioden
  const groupedGreetings = greetings.reduce((acc, greeting) => {
    if (!acc[greeting.time_period]) {
      acc[greeting.time_period] = [];
    }
    acc[greeting.time_period].push(greeting);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-600 dark:text-slate-400">Lade Begrüßungen...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">Fehler beim Laden der Begrüßungen</div>
          <button 
            onClick={() => queryClient.invalidateQueries(['greetings'])}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Begrüßungsverwaltung</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Verwalten Sie die zeitbasierten Begrüßungen für Ihre Anwendung
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Neue Begrüßung</span>
        </button>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(timePeriodLabels).map(([period, label]) => {
          const count = groupedGreetings[period]?.length || 0;
          const activeCount = groupedGreetings[period]?.filter(g => g.is_active).length || 0;
          return (
            <div key={period} className="card">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${timePeriodColors[period]}`}>
                  {timePeriodIcons[period]}
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{label.split(' ')[0]}</div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-white">
                    {activeCount}/{count}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Begrüßungen nach Stunden (0-23) */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Stündliche Begrüßungen</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {greetings.length} Begrüßungen (0-23 Uhr)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {greetings.map((greeting) => (
            <div key={greeting.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              {editingId === greeting.id ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {greeting.hour !== null ? `${greeting.hour}:00 Uhr` : 'Keine Stunde'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      greeting.is_active 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {greeting.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData({...formData, text: e.target.value})}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    rows="3"
                    placeholder="Begrüßungstext eingeben..."
                  />
                  <div className="flex items-center space-x-2">
                    <select
                      value={formData.time_period}
                      onChange={(e) => setFormData({...formData, time_period: e.target.value})}
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    >
                      {Object.entries(timePeriodLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={formData.hour || ''}
                      onChange={(e) => setFormData({...formData, hour: e.target.value ? parseInt(e.target.value) : null})}
                      className="w-16 px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                      placeholder="Stunde"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdate(greeting.id, formData)}
                      disabled={updateMutation.isPending}
                      className="flex-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center justify-center space-x-1 text-sm"
                    >
                      <Save className="w-3 h-3" />
                      <span>Speichern</span>
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 px-3 py-1 bg-slate-500 text-white rounded hover:bg-slate-600 flex items-center justify-center space-x-1 text-sm"
                    >
                      <X className="w-3 h-3" />
                      <span>Abbrechen</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {greeting.hour !== null ? `${greeting.hour}:00 Uhr` : 'Keine Stunde'}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEdit(greeting)}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                        title="Bearbeiten"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(greeting.id)}
                        disabled={deleteMutation.isPending}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
                        title="Löschen"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-900 dark:text-white mb-2">{greeting.text}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      greeting.is_active 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {greeting.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {greeting.time_period}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Erstellungsformular */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Neue Begrüßung erstellen</h3>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Begrüßungstext *
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({...formData, text: e.target.value})}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  rows="3"
                  placeholder="Geben Sie hier den Begrüßungstext ein..."
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tageszeit *
                  </label>
                  <select
                    value={formData.time_period}
                    onChange={(e) => setFormData({...formData, time_period: e.target.value})}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  >
                    {Object.entries(timePeriodLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Stunde (0-23)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={formData.hour || ''}
                    onChange={(e) => setFormData({...formData, hour: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Stunde (optional)"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                <label htmlFor="is_active" className="text-sm text-slate-700 dark:text-slate-300">
                  Begrüßung ist aktiv
                </label>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Erstelle...' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GreetingManagement;
