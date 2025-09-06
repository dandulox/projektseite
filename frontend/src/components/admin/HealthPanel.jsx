import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Clock,
  Database,
  Server,
  Mail,
  HardDrive,
  Zap
} from 'lucide-react';

const HealthPanel = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  const performHealthCheck = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/health', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Health-Check fehlgeschlagen');
      }

      const data = await response.json();
      setHealthData(data);
      setLastCheck(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performHealthCheck();
  }, []);

  const getStatusIcon = (status) => {
    if (status === true || status?.ok === true) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (status === false || status?.ok === false) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    } else {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    if (status === true || status?.ok === true) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    } else if (status === false || status?.ok === false) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    } else {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  };

  const getStatusText = (status) => {
    if (status === true || status?.ok === true) {
      return 'OK';
    } else if (status === false || status?.ok === false) {
      return 'FEHLER';
    } else {
      return 'UNBEKANNT';
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const healthChecks = [
    {
      id: 'app',
      name: 'Anwendung',
      icon: <Server className="w-5 h-5" />,
      status: healthData?.app?.ok,
      details: healthData?.app?.version ? `Version ${healthData.app.version}` : null
    },
    {
      id: 'db',
      name: 'Datenbank',
      icon: <Database className="w-5 h-5" />,
      status: healthData?.db?.ok,
      details: healthData?.db?.latencyMs ? `${healthData.db.latencyMs}ms Latenz` : healthData?.db?.error
    },
    {
      id: 'smtp',
      name: 'SMTP',
      icon: <Mail className="w-5 h-5" />,
      status: healthData?.smtp?.ok,
      details: healthData?.smtp?.error || 'Nicht konfiguriert'
    },
    {
      id: 'storage',
      name: 'Storage',
      icon: <HardDrive className="w-5 h-5" />,
      status: healthData?.storage?.ok,
      details: healthData?.storage?.error || 'Nicht konfiguriert'
    },
    {
      id: 'cache',
      name: 'Cache',
      icon: <Zap className="w-5 h-5" />,
      status: healthData?.cache?.ok,
      details: healthData?.cache?.error || 'Nicht konfiguriert'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            System-Health-Status
          </h3>
          {lastCheck && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Letzte Prüfung: {lastCheck.toLocaleString('de-DE')}
            </p>
          )}
        </div>
        <button
          onClick={performHealthCheck}
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
              <span>Alles prüfen</span>
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
              Fehler beim Health-Check: {error}
            </span>
          </div>
        </div>
      )}

      {/* Health-Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthChecks.map((check) => (
          <div key={check.id} className="card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {check.icon}
                  <span className="font-medium text-slate-900 dark:text-white">
                    {check.name}
                  </span>
                </div>
                {getStatusIcon(check.status)}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                    {getStatusText(check.status)}
                  </span>
                </div>
                
                {check.details && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Details</span>
                    <span className="text-sm text-slate-900 dark:text-white font-mono">
                      {check.details}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System-Informationen */}
      {healthData && (
        <div className="card">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
              System-Informationen
            </h4>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Server-Zeit</span>
                  <span className="text-sm text-slate-900 dark:text-white font-mono">
                    {healthData.time?.server ? new Date(healthData.time.server).toLocaleString('de-DE') : 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Zeitzone</span>
                  <span className="text-sm text-slate-900 dark:text-white">
                    {healthData.time?.tz || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Uptime</span>
                  <span className="text-sm text-slate-900 dark:text-white font-mono">
                    {healthData.uptimeSec ? formatUptime(healthData.uptimeSec) : 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Version</span>
                  <span className="text-sm text-slate-900 dark:text-white">
                    {healthData.app?.version || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthPanel;
