import React, { useState } from 'react';
import { 
  CheckSquare, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  User,
  X,
  Settings
} from 'lucide-react';

const BulkActions = ({ selectedCount, onBulkAction, onClearSelection }) => {
  const [showActions, setShowActions] = useState(false);

  const handleAction = (action, value) => {
    onBulkAction(action, value);
    setShowActions(false);
  };

  const statusOptions = [
    { value: 'todo', label: 'Zu erledigen', icon: CheckSquare, color: 'text-slate-600' },
    { value: 'in_progress', label: 'In Bearbeitung', icon: CheckSquare, color: 'text-blue-600' },
    { value: 'review', label: 'Zur Prüfung', icon: CheckSquare, color: 'text-yellow-600' },
    { value: 'completed', label: 'Abgeschlossen', icon: CheckSquare, color: 'text-green-600' },
    { value: 'cancelled', label: 'Abgebrochen', icon: CheckSquare, color: 'text-red-600' }
  ];

  const priorityOptions = [
    { value: 'critical', label: 'Kritisch', icon: ArrowUp, color: 'text-red-600' },
    { value: 'high', label: 'Hoch', icon: ArrowUp, color: 'text-orange-600' },
    { value: 'medium', label: 'Mittel', icon: Minus, color: 'text-yellow-600' },
    { value: 'low', label: 'Niedrig', icon: ArrowDown, color: 'text-green-600' }
  ];

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CheckSquare className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {selectedCount} Aufgabe{selectedCount !== 1 ? 'n' : ''} ausgewählt
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Wählen Sie eine Aktion für die ausgewählten Aufgaben
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowActions(!showActions)}
            className="flex items-center px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800/50 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4 mr-2" />
            Aktionen
          </button>
          <button
            onClick={onClearSelection}
            className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Auswahl aufheben
          </button>
        </div>
      </div>

      {showActions && (
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status ändern */}
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
                Status ändern
              </h4>
              <div className="space-y-2">
                {statusOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAction('status', option.value)}
                      className="w-full flex items-center px-3 py-2 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <IconComponent className={`h-4 w-4 mr-3 ${option.color}`} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priorität ändern */}
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
                Priorität ändern
              </h4>
              <div className="space-y-2">
                {priorityOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAction('priority', option.value)}
                      className="w-full flex items-center px-3 py-2 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <IconComponent className={`h-4 w-4 mr-3 ${option.color}`} />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Zusätzliche Aktionen */}
          <div className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
              Weitere Aktionen
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => handleAction('assignee', null)}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <User className="h-4 w-4 mr-2" />
                Zuweisung aufheben
              </button>
              <button
                onClick={() => handleAction('due_date', null)}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Fälligkeitsdatum entfernen
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Möchten Sie wirklich ${selectedCount} Aufgabe${selectedCount !== 1 ? 'n' : ''} löschen?`)) {
                    handleAction('delete', null);
                  }
                }}
                className="flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActions;
