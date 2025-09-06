import React, { useState } from 'react';
import { Play, Copy, Check, Settings, Globe } from 'lucide-react';
import HttpStatusBadge from '../ui/HttpStatusBadge';
import JsonPreview from '../ui/JsonPreview';
import { StatusCodeBadge } from '../ui/StatusCodeTooltip';
import { adminPresetChecks } from '../../constants/adminPresetChecks';

const ApiDebugPanel = () => {
  const [selectedPreset, setSelectedPreset] = useState('');
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('');
  const [headers, setHeaders] = useState('{}');
  const [body, setBody] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.id);
    setMethod(preset.method);
    setPath(preset.path);
    setHeaders('{}');
    setBody('');
  };

  const handleExecute = async () => {
    if (!path.trim()) {
      setError('Pfad ist erforderlich');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(headers || '{}');
      } catch (e) {
        throw new Error('Ungültiges JSON in Headers');
      }

      let parsedBody = null;
      if (body.trim() && ['POST', 'PUT', 'PATCH'].includes(method)) {
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          throw new Error('Ungültiges JSON in Body');
        }
      }

      const response = await fetch('/api/admin/api-debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          method,
          path,
          headers: parsedHeaders,
          body: parsedBody
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API-Debug fehlgeschlagen');
      }

      setResult({
        ...data,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Fehler beim Kopieren:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset-Auswahl */}
      <div className="card">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Vordefinierte API-Checks
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {adminPresetChecks.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`p-3 text-left rounded-lg border transition-all ${
                  selectedPreset === preset.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-900 dark:text-white">
                    {preset.name}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    preset.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    preset.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                  }`}>
                    {preset.method}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {preset.description}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 font-mono">
                  {preset.path}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* API-Request-Formular */}
      <div className="card">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            API-Request konfigurieren
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                HTTP-Methode
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Pfad (nur relative Pfade erlaubt)
              </label>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/api/endpoint"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Headers (JSON)
            </label>
            <textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              placeholder='{"Content-Type": "application/json"}'
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm"
            />
          </div>

          {['POST', 'PUT', 'PATCH'].includes(method) && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Body (JSON)
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{"key": "value"}'
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono text-sm"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <p>• Nur relative Pfade erlaubt (z.B. /api/endpoint)</p>
              <p>• Body-Größe limitiert auf 256KB</p>
            </div>
            <button
              onClick={handleExecute}
              disabled={loading || !path.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Lädt...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Ausführen</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      {(result || error) && (
        <div className="card">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Ergebnis
            </h3>
          </div>
          <div className="p-6">
            {error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-3" />
                  <span className="text-red-800 dark:text-red-200 font-medium">
                    Fehler: {error}
                  </span>
                </div>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <StatusCodeBadge statusCode={result.status} />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Laufzeit: {result.ms}ms
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                    className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Kopieren</span>
                  </button>
                </div>
                
                <JsonPreview data={result} />
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiDebugPanel;
