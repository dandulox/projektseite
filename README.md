# 🚀 Projektseite v3.0 "Modernisierung"

> **Moderne Projektmanagement-Plattform mit TypeScript, Prisma und React**

[![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)](https://github.com/dandulox/projektseite)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📋 Überblick

Projektseite v3.0 ist eine vollständig modernisierte Projektmanagement-Plattform mit fokussiertem Design auf **Developer Experience**, **Type-Safety** und **Performance**. Das System wurde von Grund auf neu architektiert mit modernen Web-Standards.

### 🎯 Kernverbesserungen v3.0

- **🏗️ Modulare Monorepo-Architektur** - Klare Trennung von Frontend, Backend und Shared Code
- **🔒 Vollständige Type-Safety** - End-to-End TypeScript mit Zod-Validierung
- **🗄️ Moderne Datenbank-Integration** - Prisma ORM mit automatischen Migrationen
- **✅ Umfassende Test-Abdeckung** - API, UI und E2E Tests (≥70% Coverage)
- **🛡️ Security-First Approach** - JWT Auth, Rate-Limiting, Input-Validation
- **🎨 Konsistentes Design-System** - Tailwind CSS mit Dark/Light Mode
- **📱 Responsive & Accessible** - WCAG AA konform, Mobile-First
- **🚫 No-Seeds Policy** - Empty-States funktionieren ohne Demo-Daten

## 🏗️ Architektur

```
projektseite/
├── shared/           # 📦 Gemeinsame Types, Contracts & Utils
│   ├── types/        # TypeScript Interfaces & Enums
│   ├── contracts/    # API Contracts & Validation (Zod)
│   └── utils/        # Shared Utility Functions
├── server/           # 🖥️ Backend API (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── controllers/  # HTTP Request/Response Handler
│   │   ├── services/     # Business Logic Layer
│   │   ├── repositories/ # Data Access Layer
│   │   ├── middleware/   # Auth, Validation, Error Handling
│   │   └── routes/       # API Route Definitions
│   ├── prisma/       # Database Schema & Migrations
│   └── tests/        # API & Integration Tests
├── client/           # 🌐 Frontend App (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/   # UI Components (Atomic Design)
│   │   ├── pages/        # Route Components
│   │   ├── hooks/        # Custom React Hooks
│   │   ├── contexts/     # React Context Providers
│   │   └── utils/        # Frontend Utilities
│   └── tests/        # UI & E2E Tests
└── docs/             # 📚 Dokumentation & ADRs
```

## 🚀 Quick Start

### Voraussetzungen

- **Node.js** ≥18.0.0
- **PostgreSQL** ≥13.0
- **npm** ≥8.0.0

### Installation

#### Option 1: Quick Start (Empfohlen)
```powershell
# Windows PowerShell
.\scripts\quick-start.ps1

# Linux/macOS
./scripts/quick-start.sh
```

**Automatische Schritte:**
1. 🔄 **Repository-Update** (git pull)
2. 🔐 **Berechtigungen setzen** (chmod/execution policy)
3. ⚡ **Schneller Start** der Development-Umgebung

#### Option 2: Vollständige Installation
```powershell
# Windows PowerShell
.\scripts\install-v3.ps1

# Linux/macOS
./scripts/install-v3.sh
```

**Automatische Schritte:**
1. 🔄 **Repository-Update** (git pull)
2. 🔐 **Berechtigungen setzen** (chmod/execution policy)
3. ✅ **Prerequisites prüfen**
4. 🏗️ **Vollständige Installation** und Validierung

#### Option 3: Manuelles Setup
```bash
# 1. Repository klonen
git clone https://github.com/dandulox/projektseite.git
cd projektseite

# 2. Dependencies installieren
cd shared && npm install && npm run build
cd ../server && npm install
cd ../client && npm install

# 3. Datenbank einrichten
cd ../server
npm run db:generate
npm run db:migrate
npm run db:seed

# 4. Development starten
npm run dev  # Backend
cd ../client && npm run dev  # Frontend
```

### 3. Umgebungsvariablen Konfigurieren

```bash
# Backend Konfiguration
cp server/env.example server/.env

# Frontend Konfiguration (falls nötig)
cp client/.env.example client/.env
```

**Wichtige Umgebungsvariablen:**
```bash
# server/.env
DATABASE_URL="postgresql://user:password@localhost:5432/projektseite"
JWT_SECRET="your-super-secret-jwt-key"
NODE_ENV="development"
```

### 4. Datenbank Setup

```bash
cd server

# Prisma Client generieren
npm run db:generate

# Datenbank Migrationen ausführen
npm run db:migrate

# Optional: Prisma Studio öffnen
npm run db:studio
```

### 5. Entwicklungsserver Starten

```bash
# Terminal 1: Backend starten
cd server
npm run dev

# Terminal 2: Frontend starten
cd client
npm run dev
```

🎉 **Die Anwendung ist verfügbar unter:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health
- **pgAdmin**: http://localhost:5050
- **Redis Commander**: http://localhost:8081
- **Mailhog**: http://localhost:8025

### Login Credentials (Development)

- **Admin**: `admin@projektseite.de` / `admin123`
- **User**: `user@projektseite.de` / `user123`

## 🔍 Validierung

### Architektur-Validierung

```powershell
# Windows PowerShell
.\scripts\validate-v3.ps1

# Linux/macOS
./scripts/validate-v3.sh
```

**Automatische Schritte:**
1. 🔄 **Repository-Update** (git pull)
2. 🔐 **Berechtigungen setzen** (chmod/execution policy)
3. 🔍 **Vollständige Architektur-Validierung**

### Validierungsoptionen

- `--quick` / `-Quick`: Schnelle Validierung ohne Build-Tests
- `--verbose` / `-Verbose`: Detaillierte Ausgabe

## 🔄 Update

### Automatisches Update

```powershell
# Windows PowerShell
.\scripts\update-v3.ps1

# Mit Optionen
.\scripts\update-v3.ps1 -SkipTests -Force

# Linux/macOS
./scripts/update-v3.sh

# Mit Optionen
./scripts/update-v3.sh --skip-tests --force
```

**Automatische Schritte:**
1. 🔄 **Repository-Update** (git pull)
2. 🔐 **Berechtigungen setzen** (chmod/execution policy)
3. 📦 **Dependencies aktualisieren**
4. 🏗️ **Applications neu bauen**
5. 🗄️ **Database-Migrationen**
6. ✅ **Validierung und Tests**

### Update-Optionen

- `--skip-validation` / `-SkipValidation`: Validierung überspringen
- `--skip-tests` / `-SkipTests`: Tests überspringen
- `--force` / `-Force`: Bei Fehlern fortfahren

## 🔧 Troubleshooting

### Dependency-Probleme

Falls beim Build-Prozess Fehler wie "tsc: not found" auftreten:

```powershell
# Windows PowerShell
.\scripts\fix-dependencies.ps1

# Linux/macOS
./scripts/fix-dependencies.sh
```

### Prisma-Schema-Probleme

Falls Prisma-Schema-Validierungsfehler auftreten:

```powershell
# Windows PowerShell
.\scripts\fix-prisma.ps1

# Linux/macOS
./scripts/fix-prisma.sh
```

### Shared-Module-Probleme

Falls Shared-Module-Build-Fehler auftreten:

```powershell
# Windows PowerShell
.\scripts\fix-shared.ps1

# Linux/macOS
./scripts/fix-shared.sh
```

Diese Scripts beheben die häufigsten Installationsprobleme.

## 🎨 Features

### 📊 Dashboard
- **Projekt-Übersicht** mit Fortschrittsanzeigen
- **Task-Statistiken** (Todo, In Progress, Completed, Overdue)
- **Team-Aktivitäten** und Benachrichtigungen
- **Deadline-Kalender** mit Fälligkeitserinnerungen

### 📋 Task Management
- **Kanban Board** mit Drag & Drop
- **My Tasks** - Persönliche Aufgabenliste
- **Filter & Suche** nach Status, Priorität, Projekt
- **Zeiterfassung** mit geschätzten vs. tatsächlichen Stunden
- **Tags & Labels** für bessere Organisation

### 🗂️ Projekt Management
- **Projekt-Portfolio** mit Status-Tracking
- **Team-Zuordnung** und Berechtigungen
- **Milestone-Tracking** mit Zieldaten
- **Fortschritts-Berechnung** basierend auf Tasks

### 👥 Team Collaboration
- **Team-Verwaltung** mit Rollen (Leader, Member, Viewer)
- **Projekt-Freigaben** (Private, Team, Public)
- **Aktivitäts-Feed** für Transparenz
- **Benachrichtigungssystem** für wichtige Updates

### ⚙️ Admin Features
- **System-Überwachung** (Health Checks, DB Status)
- **Benutzer-Verwaltung** mit Rollenzuweisung
- **API-Debugging** für Entwickler
- **System-Metriken** und Logs

## 🧪 Testing

### Test-Strategie

Das System implementiert eine umfassende Test-Strategie mit **≥70% Code Coverage**:

```bash
# Alle Tests ausführen
npm run test

# Mit Coverage Report
npm run test:coverage

# Tests in Watch-Modus
npm run test:watch

# Spezifische Test-Suites
npm run test:api         # API Integration Tests
npm run test:unit        # Unit Tests
npm run test:e2e         # End-to-End Tests
```

### Test-Kategorien

1. **API Tests** (`server/tests/api/`)
   - Endpoint-Testing mit Supertest
   - Authentifizierung & Autorisierung
   - Input-Validierung & Error-Handling
   - Empty-State-Verhalten

2. **Unit Tests** (`server/tests/unit/`)
   - Service-Layer Business Logic
   - Repository Data Access
   - Utility Functions

3. **Frontend Tests** (`client/tests/`)
   - Component Rendering Tests
   - User Interaction Testing
   - Hook Testing

4. **E2E Tests** (`client/tests/e2e/`)
   - User Journey Testing
   - Cross-Browser Compatibility
   - Performance Testing

### Test-Prinzipien

- **🚫 Keine Demo-Daten**: Tests verwenden ephemere Fixtures
- **🔄 Isolation**: Jeder Test läuft isoliert mit Cleanup
- **📊 Coverage**: Mindestens 70% Abdeckung für Kernmodule
- **⚡ Performance**: Tests laufen unter 30 Sekunden

## 🛡️ Sicherheit

### Implementierte Sicherheitsmaßnahmen

- **🔐 JWT Authentication** mit sicheren Token-Policies
- **🛡️ Input Validation** mit Zod-Schemas für alle Endpunkte
- **⚡ Rate Limiting** (100 Requests/15min für Auth/Admin)
- **🔒 Helmet Security Headers** (CSP, XSS Protection)
- **🌐 CORS Least-Privilege** Policy
- **🧹 SQL Injection Protection** durch Prisma ORM
- **📝 Structured Logging** ohne sensible Daten

### Security Headers

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

## 📈 Performance

### Optimierungen

- **⚡ API Response Times**: p95 < 250ms (ohne Caching)
- **🎯 Largest Contentful Paint**: < 2.5s
- **📄 Pagination**: Alle Listen mit Pagination
- **🗄️ Database Indexing**: Optimierte Indizes für häufige Queries
- **🔄 Connection Pooling**: Efficient DB-Verbindungsmanagement
- **📦 Bundle Optimization**: Code Splitting & Tree Shaking

### Monitoring

```bash
# Performance Monitoring
npm run test:performance

# Bundle Analyzer
npm run analyze

# Lighthouse CI
npm run lighthouse
```

## 📚 API Dokumentation

### OpenAPI Spezifikation

Die vollständige API-Dokumentation ist verfügbar unter:
- **Entwicklung**: http://localhost:3001/api
- **OpenAPI Spec**: `docs/api/openapi.yaml`

### Wichtige Endpunkte

```bash
# Health Check
GET /health

# Authentication
POST /api/auth/login
POST /api/auth/refresh

# Tasks
GET    /api/tasks/my-tasks
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id

# Projects
GET    /api/projects/my-projects
POST   /api/projects
PATCH  /api/projects/:id

# Admin
GET /api/admin/health
GET /api/admin/db/status
```

### Response Format

Alle API-Responses folgen dem einheitlichen Contract:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta: {
    timestamp: string;
    requestId: string;
    pagination?: PaginationMeta;
  };
}
```

## 🔧 Entwicklung

### Projekt Setup

```bash
# Shared Module bauen
cd shared && npm run build

# Backend entwickeln
cd server && npm run dev

# Frontend entwickeln
cd client && npm run dev

# Type-Checking
npm run type-check

# Linting
npm run lint && npm run lint:fix
```

### Code-Qualität

```bash
# Pre-Commit Hooks
npm run precommit

# Umfasst:
# - ESLint (Code Quality)
# - Prettier (Code Formatting)
# - TypeScript (Type Checking)
# - Tests (funktionale Qualität)
```

### Database Development

```bash
# Schema ändern
# 1. Bearbeite prisma/schema.prisma
# 2. Migration erstellen
npm run db:migrate

# Database zurücksetzen (Entwicklung)
npm run db:migrate:rollback

# Prisma Studio öffnen
npm run db:studio
```

## 🚢 Deployment

### Production Build

```bash
# Shared Module bauen
cd shared && npm run build

# Backend bauen
cd server && npm run build

# Frontend bauen
cd client && npm run build
```

### Docker Deployment

```bash
# Mit Docker Compose
docker-compose -f docker/docker-compose.yml up -d

# Oder einzeln
docker build -t projektseite-server ./server
docker build -t projektseite-client ./client
```

### Umgebungsvariablen (Production)

```bash
NODE_ENV=production
DATABASE_URL="postgresql://..."
JWT_SECRET="secure-production-secret"
FRONTEND_URL="https://your-domain.com"
```

## 📖 Dokumentation

### Architectural Decision Records (ADRs)

- **[ADR-001](docs/ADRs/ADR-001-error-contract.md)**: Einheitliches Error-Contract
- **[ADR-002](docs/ADRs/ADR-002-prisma-orm.md)**: Migration zu Prisma ORM
- **[ADR-003](docs/ADRs/ADR-003-no-seeds-policy.md)**: Keine Demo-Daten im Produktivzweig

### Weitere Dokumentation

- **[Versionsverlauf](dokumentation/versionsverlauf.md)**: Alle Änderungen und Updates
- **[Setup-Anweisungen](dokumentation/setup-anweisungen.md)**: Detaillierte Installation
- **[API-Endpunkte](dokumentation/api-endpunkte.md)**: Vollständige API-Referenz
- **[Datenbank-Schema](dokumentation/datenbank-schema.md)**: DB-Struktur und Beziehungen

## 🐛 Troubleshooting

### Häufige Probleme

**Database Connection Fehler:**
```bash
# PostgreSQL Service starten
sudo systemctl start postgresql

# Verbindung testen
psql -h localhost -U your_user -d projektseite
```

**Port bereits in Verwendung:**
```bash
# Prozess finden und beenden
lsof -ti:3001 | xargs kill -9
```

**Prisma Client Fehler:**
```bash
# Prisma Client neu generieren
npm run db:generate

# Cache leeren
rm -rf node_modules/.prisma
```

### Logging & Debugging

```bash
# Debug-Modus aktivieren
NODE_ENV=development DEBUG=projektseite:* npm run dev

# Logs anzeigen
tail -f logs/combined.log

# Error-Logs anzeigen
tail -f logs/error.log
```

## 🤝 Contributing

### Development Workflow

1. **Fork** das Repository
2. **Branch** erstellen (`git checkout -b feature/amazing-feature`)
3. **Commit** Änderungen (`git commit -m 'Add amazing feature'`)
4. **Push** zum Branch (`git push origin feature/amazing-feature`)
5. **Pull Request** erstellen

### Code Standards

- **TypeScript Strict Mode** aktiviert
- **ESLint + Prettier** für Code-Qualität
- **Conventional Commits** für Commit-Messages
- **Tests** für alle neuen Features
- **Documentation** für API-Änderungen

### Commit-Konventionen

```bash
feat: neue Funktion hinzufügen
fix: Fehler beheben
docs: Dokumentation ändern
style: Code-Formatierung (ohne Funktionsänderung)
refactor: Code-Refactoring
test: Tests hinzufügen oder ändern
chore: Build-Prozess oder Hilfswerkzeuge
```

## 📝 Lizenz

Dieses Projekt ist unter der **MIT-Lizenz** lizenziert. Siehe [LICENSE](LICENSE) für Details.

## 🙏 Danksagungen

- **Team Projektseite** für die kontinuierliche Entwicklung
- **Open Source Community** für die verwendeten Libraries
- **Contributors** für Feedback und Verbesserungen

---

**Projektseite v3.0** - Built with ❤️ using TypeScript, React, Node.js and PostgreSQL

⭐ **Star uns auf GitHub** wenn dieses Projekt hilfreich ist!