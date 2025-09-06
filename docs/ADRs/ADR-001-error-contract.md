# ADR-001: Einheitliches Error-Contract

## Status
Akzeptiert

## Kontext
Das bestehende System hatte inkonsistente Fehlerbehandlung zwischen verschiedenen Endpunkten. Verschiedene Controller gaben unterschiedliche Fehlerformate zurück, was die Frontend-Integration erschwerte.

## Entscheidung
Wir implementieren ein einheitliches Error-Contract für alle API-Endpunkte:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta: {
    timestamp: string;
    requestId: string;
    pagination?: PaginationMeta;
  };
}

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string; // Für Validierungsfehler
}
```

## Konsequenzen

### Positiv
- Konsistente API-Responses für alle Endpunkte
- Vereinfachte Frontend-Fehlerbehandlung
- Strukturierte Fehlercodes ermöglichen spezifische UI-Behandlung
- Request-IDs für bessere Debugging-Möglichkeiten

### Negativ
- Breaking Change für bestehende API-Clients
- Alle bestehenden Controller müssen angepasst werden

## Implementierung
- Shared Contracts in `@shared/contracts/error.ts`
- Error-Handler Middleware in `server/src/middleware/errorHandler.ts`
- Factory-Funktionen für konsistente Response-Erstellung

## Datum
2024-01-01
