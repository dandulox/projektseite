# Projektstruktur - Projektseite v3.0

## 📁 Verzeichnisstruktur

```
projektseite/
├── 📖 README.md                           # Projektbeschreibung und Setup
├── 📋 LICENSE                             # MIT-Lizenz
├── 🐳 docker/
│   ├── docker-compose.yml                 # Docker-Container-Konfiguration
│   ├── docker-compose.dev.yml             # Development-Container
│   ├── monitoring/                        # Monitoring-Konfiguration
│   │   ├── grafana/                       # Grafana-Konfiguration
│   │   └── prometheus.yml                 # Prometheus-Konfiguration
│   └── nginx/
│       └── nginx.conf                     # Nginx-Konfiguration
├── ⚙️ server/                             # Backend (TypeScript)
│   ├── package.json                       # Node.js-Abhängigkeiten
│   ├── tsconfig.json                      # TypeScript-Konfiguration
│   ├── jest.config.js                     # Jest-Test-Konfiguration
│   ├── Dockerfile                         # Backend-Container
│   ├── Dockerfile.dev                     # Development-Container
│   ├── env.example                        # Umgebungsvariablen-Vorlage
│   ├── env.test                           # Test-Umgebungsvariablen
│   ├── prisma/                            # Prisma ORM
│   │   ├── schema.prisma                  # Datenbankschema
│   │   ├── seed.ts                        # Seed-Daten
│   │   └── migrations/                    # Datenbank-Migrationen
│   ├── src/                               # Backend-Quellcode
│   │   ├── server.ts                      # Hauptserver
│   │   ├── config/                        # Konfiguration
│   │   ├── controllers/                   # API-Controller
│   │   │   ├── admin.controller.ts        # Admin-Funktionen
│   │   │   ├── auth.controller.ts         # Authentifizierung
│   │   │   ├── project.controller.ts      # Projektverwaltung
│   │   │   └── task.controller.ts         # Task-Management
│   │   ├── middleware/                    # Express-Middleware
│   │   ├── repositories/                  # Datenbank-Repositories
│   │   ├── routes/                        # API-Routen
│   │   ├── services/                      # Business-Logic
│   │   ├── types/                         # TypeScript-Typen
│   │   └── utils/                         # Hilfsfunktionen
│   └── tests/                             # Backend-Tests
├── 🎨 client/                             # Frontend (React + TypeScript)
│   ├── package.json                       # React-Abhängigkeiten
│   ├── tsconfig.json                      # TypeScript-Konfiguration
│   ├── vite.config.ts                     # Vite-Konfiguration
│   ├── tailwind.config.js                 # Tailwind CSS-Konfiguration
│   └── src/                               # Frontend-Quellcode
├── 🎨 shared/                             # Geteilte Pakete
│   ├── package.json                       # Shared-Package-Abhängigkeiten
│   ├── tsconfig.json                      # TypeScript-Konfiguration
│   ├── contracts/                         # API-Contracts
│   ├── types/                             # Geteilte Typen
│   └── utils/                             # Geteilte Utilities
├── 📊 docs/                               # API-Dokumentation
│   ├── API.md                             # API-Dokumentation
│   ├── DEPLOYMENT.md                      # Deployment-Anweisungen
│   ├── ADRs/                              # Architecture Decision Records
│   └── api/
│       └── openapi.yaml                   # OpenAPI-Spezifikation
├── 📋 dokumentation/                      # Projekt-Dokumentation
│   ├── features.md                        # Feature-Übersicht
│   ├── api-endpunkte.md                   # API-Endpunkte
│   ├── technologie-stack.md               # Technologie-Stack
│   ├── setup-anweisungen.md               # Setup-Anweisungen
│   ├── datenbank-schema.md                # Datenbank-Schema
│   ├── projektstruktur.md                 # Projektstruktur
│   ├── benutzerverwaltung.md              # Benutzerverwaltung
│   ├── kanban-board.md                    # Kanban Board Feature
│   └── versionsverlauf.md                 # Versionsverlauf
└── 🔧 scripts/                            # Wartungsskripte
    ├── install-v3.sh                      # Vollständige Installation
    ├── update-v3.sh                       # System-Update
    ├── validate-v3.sh                     # System-Validierung
    ├── quick-start.sh                     # Schnellstart
    ├── fix-dependencies.sh                # Dependencies reparieren
    ├── fix-prisma.sh                      # Prisma reparieren
    └── fix-shared.sh                      # Shared-Package reparieren
```

## Architektur-Übersicht

### Backend (Server)
- **TypeScript** für Typsicherheit
- **Express.js** als Web-Framework
- **Prisma ORM** für Datenbankzugriff
- **Modulare Architektur** mit Controllern, Services und Repositories
- **Middleware** für Authentifizierung und Validierung
- **JWT** für Token-basierte Authentifizierung
- **Winston** für strukturiertes Logging

### Frontend (Client)
- **React 18** mit TypeScript
- **Vite** als Build-Tool
- **TanStack React Query** für Server-State-Management
- **Zustand** für Client-State-Management
- **React Hook Form** mit Zod-Validierung
- **Tailwind CSS** für Styling
- **React Beautiful DnD** für Drag & Drop

### Shared Package
- **TypeScript** für geteilte Typen
- **Zod** für Validierungsschemas
- **Gemeinsame Utilities** für Frontend und Backend

### Datenbank
- **PostgreSQL** als Hauptdatenbank
- **Prisma ORM** für Typsicherheit
- **Migrations-System** für Schema-Updates
- **Seed-Daten** für Entwicklung und Tests

### Infrastructure
- **Docker & Docker Compose** für Containerisierung
- **Nginx** als Reverse Proxy
- **Grafana & Prometheus** für Monitoring
- **Ubuntu 24.04 LTS** als Server-OS

## Script-System

### Installation & Setup
- **install-v3.sh** - Vollständige Installation
- **quick-start.sh** - Schnellstart für Entwicklung
- **validate-v3.sh** - System-Validierung

### Wartung & Updates
- **update-v3.sh** - System-Update
- **fix-dependencies.sh** - Dependencies reparieren
- **fix-prisma.sh** - Prisma reparieren
- **fix-shared.sh** - Shared-Package reparieren
