# Technologie-Stack - Projektseite

## Backend
- **Node.js 18.x** mit Express.js
- **PostgreSQL 15** als Datenbank
- **JWT** für Authentifizierung
- **Modulare Architektur** für einfache Erweiterung

## Frontend
- **React 18** mit modernen Hooks
- **React Router 6** für Navigation
- **React Query** für Server-State-Management
- **Tailwind CSS** für Styling mit CSS-Variablen
- **Vite** als Build-Tool und Development Server
- **TypeScript** für Typsicherheit
- **CSS-Variablen** für Light/Dark Mode Support
- **Responsive Design** mit Mobile-First-Ansatz

## Infrastructure
- **Docker & Docker Compose** für Containerisierung
- **Ubuntu 24.04 LTS** als Server-OS
- **Grafana** für Monitoring
- **Prometheus Node Exporter** für System-Metriken

## CSS-Variablen und Design-System
Das Frontend verwendet ein zentrales Design-System mit CSS-Variablen in `frontend/src/index.css`:

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
