export const statusCodeMap = {
  200: {
    description: 'OK',
    causes: [
      'Anfrage erfolgreich verarbeitet',
      'Daten wurden korrekt zurückgegeben'
    ],
    checks: [
      'Response-Daten überprüfen',
      'Erwartete Felder vorhanden?'
    ]
  },
  201: {
    description: 'Created',
    causes: [
      'Ressource erfolgreich erstellt',
      'Neuer Datensatz angelegt'
    ],
    checks: [
      'Erstellte Ressource überprüfen',
      'ID und Timestamps korrekt?'
    ]
  },
  204: {
    description: 'No Content',
    causes: [
      'Anfrage erfolgreich, aber keine Daten',
      'Löschung oder Update ohne Rückgabe'
    ],
    checks: [
      'Operation erfolgreich?',
      'Keine Fehler in Logs?'
    ]
  },
  400: {
    description: 'Bad Request',
    causes: [
      'Ungültige Anfrage-Parameter',
      'Fehlende oder falsche Daten',
      'Validierungsfehler'
    ],
    checks: [
      'Request-Body überprüfen',
      'Pflichtfelder vorhanden?',
      'Datentypen korrekt?'
    ]
  },
  401: {
    description: 'Unauthorized',
    causes: [
      'Nicht authentifiziert',
      'Token fehlt oder abgelaufen',
      'Ungültige Anmeldedaten'
    ],
    checks: [
      'Token vorhanden und gültig?',
      'Anmeldung erforderlich',
      'Session überprüfen'
    ]
  },
  403: {
    description: 'Forbidden',
    causes: [
      'Keine Berechtigung',
      'Rolle unzureichend',
      'Zugriff verweigert'
    ],
    checks: [
      'Benutzerrolle überprüfen',
      'Berechtigungen prüfen',
      'Admin-Rechte erforderlich?'
    ]
  },
  404: {
    description: 'Not Found',
    causes: [
      'Ressource existiert nicht',
      'Falsche URL',
      'Gelöschte Daten'
    ],
    checks: [
      'URL korrekt?',
      'Ressource vorhanden?',
      'ID gültig?'
    ]
  },
  409: {
    description: 'Conflict',
    causes: [
      'Ressource bereits vorhanden',
      'Eindeutigkeitsverletzung',
      'Gleichzeitige Änderungen'
    ],
    checks: [
      'Eindeutige Felder prüfen',
      'Bereits vorhandene Daten?',
      'Concurrency-Konflikt?'
    ]
  },
  422: {
    description: 'Unprocessable Entity',
    causes: [
      'Semantische Validierungsfehler',
      'Geschäftslogik-Fehler',
      'Abhängigkeiten nicht erfüllt'
    ],
    checks: [
      'Geschäftsregeln prüfen',
      'Abhängigkeiten erfüllt?',
      'Datenintegrität überprüfen'
    ]
  },
  429: {
    description: 'Too Many Requests',
    causes: [
      'Rate-Limit überschritten',
      'Zu viele Anfragen',
      'API-Quota erreicht'
    ],
    checks: [
      'Anfragehäufigkeit reduzieren',
      'Rate-Limit abwarten',
      'API-Quota überprüfen'
    ]
  },
  500: {
    description: 'Internal Server Error',
    causes: [
      'Server-Fehler',
      'Datenbankfehler',
      'Unerwarteter Fehler'
    ],
    checks: [
      'Server-Logs überprüfen',
      'Datenbankverbindung prüfen',
      'Backend-Services testen'
    ]
  },
  502: {
    description: 'Bad Gateway',
    causes: [
      'Upstream-Server-Fehler',
      'Proxy-Fehler',
      'Service nicht erreichbar'
    ],
    checks: [
      'Backend-Services prüfen',
      'Proxy-Konfiguration',
      'Service-Health überprüfen'
    ]
  },
  503: {
    description: 'Service Unavailable',
    causes: [
      'Service temporär nicht verfügbar',
      'Wartungsarbeiten',
      'Überlastung'
    ],
    checks: [
      'Service-Status prüfen',
      'Wartungsfenster beachten',
      'Später erneut versuchen'
    ]
  }
};
