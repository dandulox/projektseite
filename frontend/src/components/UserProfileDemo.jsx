import React from 'react';
import UserCard from './UserCard';

const UserProfileDemo = () => {
  // Demo-Benutzer für die Vorschau
  const demoUsers = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@projektseite.de',
      role: 'admin',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      username: 'max.mustermann',
      email: 'max.mustermann@projektseite.de',
      role: 'user',
      is_active: true,
      created_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 3,
      username: 'anna.schmidt',
      email: 'anna.schmidt@projektseite.de',
      role: 'user',
      is_active: false,
      created_at: '2024-02-01T00:00:00Z'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            UserCard Demo
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Hover über die Benutzer-Karten, um die Tooltips zu sehen. Klicke auf die Karten, um zum Profil zu navigieren.
          </p>
        </div>

        <div className="space-y-8">
          {/* Verschiedene Größen */}
          <div className="card">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Verschiedene Größen
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Klein</h3>
                <UserCard 
                  user={demoUsers[0]}
                  size="small"
                  showRole={true}
                  showStatus={true}
                />
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Mittel</h3>
                <UserCard 
                  user={demoUsers[1]}
                  size="medium"
                  showRole={true}
                  showStatus={true}
                />
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Groß</h3>
                <UserCard 
                  user={demoUsers[2]}
                  size="large"
                  showRole={true}
                  showStatus={true}
                />
              </div>
            </div>
          </div>

          {/* In Projekt-Kontext */}
          <div className="card">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              In Projekt-Kontext
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Projekt: Website Redesign
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Ein modernes Redesign der Unternehmenswebsite mit Fokus auf Benutzerfreundlichkeit.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Eigentümer:</span>
                    <UserCard 
                      user={demoUsers[0]}
                      size="small"
                      showRole={false}
                      showStatus={false}
                      className="p-1"
                    />
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    75% (12 Module)
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Modul: Frontend Development
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Entwicklung der React-Komponenten für das neue Design.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Zugewiesen an:</span>
                    <UserCard 
                      user={demoUsers[1]}
                      size="small"
                      showRole={false}
                      showStatus={false}
                      className="p-1"
                    />
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    In Bearbeitung
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* In Benutzerverwaltung */}
          <div className="card">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              In Benutzerverwaltung
            </h2>
            <div className="space-y-2">
              {demoUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <UserCard 
                    user={user}
                    size="medium"
                    showRole={false}
                    showStatus={false}
                    className="p-0"
                  />
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    }`}>
                      {user.role === 'admin' ? 'Administrator' : 'Benutzer'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_active 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {user.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ohne Hover-Effekt */}
          <div className="card">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Ohne Hover-Effekt (nur Klick)
            </h2>
            <div className="space-y-2">
              {demoUsers.map((user) => (
                <UserCard 
                  key={user.id}
                  user={user}
                  size="small"
                  showHover={false}
                  showClick={true}
                  showRole={true}
                  showStatus={true}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileDemo;
