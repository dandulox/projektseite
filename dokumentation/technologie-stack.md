# Technologie-Stack - Projektseite v3.0

## Backend
- **Node.js 18.x** mit Express.js
- **TypeScript** für Typsicherheit
- **PostgreSQL 15** als Datenbank
- **Prisma ORM** für Datenbankzugriff
- **JWT** für Authentifizierung
- **bcryptjs** für Passwort-Hashing
- **Zod** für Validierung
- **Winston** für Logging
- **Modulare Architektur** für einfache Erweiterung

## Frontend
- **React 18** mit modernen Hooks
- **TypeScript** für Typsicherheit
- **React Router 6** für Navigation
- **TanStack React Query** für Server-State-Management
- **Zustand** für Client-State-Management
- **React Hook Form** mit Zod-Validierung
- **Tailwind CSS** für Styling mit CSS-Variablen
- **Vite** als Build-Tool und Development Server
- **CSS-Variablen** für Light/Dark Mode Support
- **Responsive Design** mit Mobile-First-Ansatz
- **React Beautiful DnD** für Drag & Drop
- **Lucide React** für Icons
- **React Hot Toast** für Benachrichtigungen

## Infrastructure
- **Docker & Docker Compose** für Containerisierung
- **Ubuntu 24.04 LTS** als Server-OS
- **Grafana** für Monitoring
- **Prometheus Node Exporter** für System-Metriken
- **Nginx** als Reverse Proxy

## Shared Package
- **TypeScript** für geteilte Typen und Contracts
- **Zod** für Validierungsschemas
- **Gemeinsame Utilities** für Frontend und Backend

## CSS-Variablen und Design-System
Das Frontend verwendet ein zentrales Design-System mit CSS-Variablen in `client/src/index.css`:

```css
:root {
  /* Light Mode Colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #0f172a;
  --accent-primary: #3b82f6;
  /* ... weitere Variablen */
}

[data-theme="dark"] {
  /* Dark Mode Colors */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f8fafc;
  /* ... weitere Variablen */
}
```

**Verfügbare Design-Tokens:**
- **Farben**: Primary, Secondary, Tertiary für Background und Text
- **Accent-Farben**: Primary und Secondary für Buttons und Links
- **Border-Farben**: Primary und Secondary für Rahmen
- **Schatten**: Primary und Secondary für verschiedene Tiefen
- **Glass-Effekte**: Für moderne UI-Elemente

**Neue CSS-Klassen (Version 2.1):**
- **`.page-header`**: Konsistente Header mit Hintergrund für bessere Lesbarkeit
- **`.page-title`**: Einheitliche Titel-Styles
- **`.page-subtitle`**: Einheitliche Untertitel-Styles
- **`.btn-welcome-primary`**: Welcome Page primärer Button
- **`.btn-welcome-secondary`**: Welcome Page sekundärer Button mit Light Mode Override
- **`.auth-modal`**: Auth-Modal für Light Mode
- **`.auth-modal-dark`**: Auth-Modal für Dark Mode

**API-Konfiguration:**
- **Dynamische API-URLs** basierend auf der aktuellen Domain
- **Unterstützung für lokale Entwicklung** (localhost:3001)
- **Produktions-Deployment** mit relativen Pfaden
- **Umgebungsvariablen** für flexible Konfiguration