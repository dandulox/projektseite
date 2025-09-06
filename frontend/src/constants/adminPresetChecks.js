export const adminPresetChecks = [
  {
    id: 'health',
    name: 'Health Check',
    method: 'GET',
    path: '/api/admin/health',
    description: 'System-Health-Status prüfen'
  },
  {
    id: 'db-status',
    name: 'DB Status',
    method: 'GET',
    path: '/api/admin/db/status',
    description: 'Datenbank-Status und Schema-Drift prüfen'
  },
  {
    id: 'me',
    name: 'Meine Daten',
    method: 'GET',
    path: '/api/me',
    description: 'Aktuelle Benutzerdaten abrufen'
  },
  {
    id: 'projects',
    name: 'Projekte',
    method: 'GET',
    path: '/api/projects?limit=5',
    description: 'Projektliste abrufen (limitierte Anzahl)'
  },
  {
    id: 'tasks',
    name: 'Tasks',
    method: 'GET',
    path: '/api/tasks?limit=5',
    description: 'Task-Liste abrufen (limitierte Anzahl)'
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    method: 'GET',
    path: '/api/dashboard/me',
    description: 'Dashboard-Daten für aktuellen Benutzer'
  },
  {
    id: 'teams',
    name: 'Teams',
    method: 'GET',
    path: '/api/teams',
    description: 'Team-Liste abrufen'
  },
  {
    id: 'notifications',
    name: 'Benachrichtigungen',
    method: 'GET',
    path: '/api/notifications?limit=10',
    description: 'Benachrichtigungen abrufen (limitierte Anzahl)'
  },
  {
    id: 'versions',
    name: 'Versionen',
    method: 'GET',
    path: '/api/versions/current',
    description: 'Aktuelle Systemversion abrufen'
  },
  {
    id: 'greetings',
    name: 'Begrüßungen',
    method: 'GET',
    path: '/api/greetings/random',
    description: 'Zufällige Begrüßung abrufen'
  }
];
