import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database,
  Table,
  AlertCircle
} from 'lucide-react';

const DbStatusPanel = () => {
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  const performDbCheck = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/db/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('DB-Status-Check fehlgeschlagen');
      }

      const data = await response.json();
      setDbStatus(data);
      setLastCheck(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performDbCheck();
  }, []);

  const getStatusIcon = (status) => {
    if (status === true) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (status === false) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    } else {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    if (status === true) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    } else if (status === false) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    } else {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  };

  const getStatusText = (status) => {
    if (status === true) {
      return 'OK';
    } else if (status === false) {
      return 'FEHLER';
    } else {
      return 'UNBEKANNT';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Datenbank-Schema-Status
          </h3>
          {lastCheck && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Letzte Prüfung: {lastCheck.toLocaleString('de-DE')}
            </p>
          )}
        </div>
        <button
          onClick={performDbCheck}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Prüfe...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Diff neu berechnen</span>
            </>
          )}
        </button>
      </div>

      {/* Fehler */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className="text-red-800 dark:text-red-200 font-medium">
              Fehler beim DB-Status-Check: {error}
            </span>
          </div>
        </div>
      )}

      {/* DB-Status */}
      {dbStatus && (
        <div className="space-y-6">
          {/* Status-Übersicht */}
          <div className="card">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Schema-Status
              </h4>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-slate-900 dark:text-white">
                    Schema-Konsistenz
                  </span>
                </div>
                {getStatusIcon(dbStatus.ok)}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dbStatus.ok)}`}>
                    {getStatusText(dbStatus.ok)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Schema-Drift</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    dbStatus.drift ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {dbStatus.drift ? 'JA' : 'NEIN'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Tabellen</span>
                  <span className="text-sm text-slate-900 dark:text-white">
                    {dbStatus.existingTables || 0} / {dbStatus.expectedTables || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Zusammenfassung */}
          <div className="card">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Zusammenfassung
              </h4>
            </div>
            <div className="p-6">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {dbStatus.summary || 'Keine Details verfügbar'}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Migrations */}
          {dbStatus.pendingMigrations && dbStatus.pendingMigrations.length > 0 && (
            <div className="card">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <Table className="w-5 h-5 mr-2" />
                  Pending Migrations
                </h4>
              </div>
              <div className="p-6">
                <div className="space-y-2">
                  {dbStatus.pendingMigrations.map((migration, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <span className="text-sm text-yellow-800 dark:text-yellow-200">
                        {migration}
                      </span>
                      <span className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Fehler-Details */}
          {dbStatus.error && (
            <div className="card">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                  <XCircle className="w-5 h-5 mr-2 text-red-500" />
                  Fehler-Details
                </h4>
              </div>
              <div className="p-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {dbStatus.error}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info-Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              Schema-Drift-Erkennung
            </h5>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Diese Funktion prüft, ob das Datenbankschema mit der erwarteten Struktur übereinstimmt. 
              Schema-Drift tritt auf, wenn die Datenbankstruktur von der Anwendungserwartung abweicht.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DbStatusPanel;
