import React from 'react';
import { HelpCircle } from 'lucide-react';

// Statuscode-Map mit Beschreibungen und typischen Ursachen
const STATUS_CODE_MAP = {
  200: {
    title: 'OK',
    description: 'Anfrage erfolgreich verarbeitet',
    causes: ['Normale API-Antwort', 'Daten erfolgreich abgerufen', 'Operation erfolgreich']
  },
  201: {
    title: 'Created',
    description: 'Ressource erfolgreich erstellt',
    causes: ['Neuer Benutzer erstellt', 'Neues Projekt angelegt', 'Task erfolgreich erstellt']
  },
  204: {
    title: 'No Content',
    description: 'Anfrage erfolgreich, aber keine Daten zurückgegeben',
    causes: ['Erfolgreiche Löschung', 'Update ohne Rückgabe', 'Leere Antwort']
  },
  400: {
    title: 'Bad Request',
    description: 'Ungültige Anfrage - Client-Fehler',
    causes: ['Fehlende Parameter', 'Ungültige Daten', 'Syntax-Fehler in JSON']
  },
  401: {
    title: 'Unauthorized',
    description: 'Nicht autorisiert - Anmeldung erforderlich',
    causes: ['Token abgelaufen', 'Ungültige Anmeldedaten', 'Fehlende Authentifizierung']
  },
  403: {
    title: 'Forbidden',
    description: 'Zugriff verweigert - Keine Berechtigung',
    causes: ['Unzureichende Rechte', 'Admin-Berechtigung erforderlich', 'Ressource geschützt']
  },
  404: {
    title: 'Not Found',
    description: 'Ressource nicht gefunden',
    causes: ['Ungültige URL', 'Gelöschte Ressource', 'Falsche ID']
  },
  409: {
    title: 'Conflict',
    description: 'Konflikt - Ressource bereits vorhanden',
    causes: ['Duplikat erkannt', 'Username bereits vergeben', 'E-Mail bereits registriert']
  },
  422: {
    title: 'Unprocessable Entity',
    description: 'Daten können nicht verarbeitet werden',
    causes: ['Validierungsfehler', 'Ungültige Eingabe', 'Business-Logic-Fehler']
  },
  429: {
    title: 'Too Many Requests',
    description: 'Zu viele Anfragen - Rate Limit erreicht',
    causes: ['API-Limit überschritten', 'Zu häufige Anfragen', 'Rate-Limiting aktiv']
  },
  500: {
    title: 'Internal Server Error',
    description: 'Interner Serverfehler',
    causes: ['Datenbankfehler', 'Unerwarteter Fehler', 'Server-Konfigurationsproblem']
  },
  502: {
    title: 'Bad Gateway',
    description: 'Gateway-Fehler - Upstream-Server antwortet nicht',
    causes: ['Datenbank nicht erreichbar', 'Externe API down', 'Proxy-Fehler']
  },
  503: {
    title: 'Service Unavailable',
    description: 'Service nicht verfügbar',
    causes: ['Wartungsarbeiten', 'Server überlastet', 'Temporärer Ausfall']
  }
};

const StatusCodeTooltip = ({ statusCode, children, className = '' }) => {
  const statusInfo = STATUS_CODE_MAP[statusCode];
  
  if (!statusInfo) {
    return children;
  }

  return (
    <div className={`relative group ${className}`}>
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 min-w-[200px] max-w-[300px]">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-semibold">{statusCode}</span>
          <span className="text-slate-300 dark:text-slate-600">-</span>
          <span className="font-medium">{statusInfo.title}</span>
        </div>
        <p className="text-slate-200 dark:text-slate-700 mb-2">
          {statusInfo.description}
        </p>
        <div className="border-t border-slate-700 dark:border-slate-300 pt-2">
          <p className="text-xs text-slate-300 dark:text-slate-600 font-medium mb-1">
            Typische Ursachen:
          </p>
          <ul className="text-xs text-slate-200 dark:text-slate-700 space-y-1">
            {statusInfo.causes.map((cause, index) => (
              <li key={index} className="flex items-start">
                <span className="text-slate-400 dark:text-slate-500 mr-1">•</span>
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Pfeil nach unten */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-100"></div>
      </div>
    </div>
  );
};

// Komponente für Statuscode-Badge mit Tooltip
export const StatusCodeBadge = ({ statusCode, className = '' }) => {
  const statusInfo = STATUS_CODE_MAP[statusCode];
  
  if (!statusInfo) {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
        {statusCode}
      </span>
    );
  }

  const getStatusColor = (code) => {
    if (code >= 200 && code < 300) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (code >= 300 && code < 400) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (code >= 400 && code < 500) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (code >= 500) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  return (
    <StatusCodeTooltip statusCode={statusCode}>
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(statusCode)} ${className}`}>
        {statusCode} {statusInfo.title}
        <HelpCircle className="w-3 h-3 ml-1 opacity-60" />
      </span>
    </StatusCodeTooltip>
  );
};

export default StatusCodeTooltip;
