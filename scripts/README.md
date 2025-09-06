# 📜 Scripts Documentation - Projektseite v3.0

> **Vollständige Dokumentation aller Installations- und Validierungsscripts**

## 📋 Übersicht

Die Scripts in diesem Verzeichnis automatisieren die Installation, Validierung und den Start der Projektseite v3.0 Architektur.

## 🚀 Quick Start Scripts

### `quick-start.ps1` / `quick-start.sh`

**Zweck**: Schneller Start für Development mit minimaler Konfiguration

**Features**:
- Automatische Dependency-Installation
- Environment-Setup
- Docker-Services starten
- Datenbank-Migration und Seeding
- Development-Server starten

**Verwendung**:
```powershell
# Windows
.\scripts\quick-start.ps1

# Linux/macOS
./scripts/quick-start.sh
```

**Parameter**:
- `-SkipValidation`: Überspringt Struktur-Validierung
- `-SkipDocker`: Startet keine Docker-Services

## 🛠️ Installation Scripts

### `install-v3.ps1` / `install-v3.sh`

**Zweck**: Vollständige Installation und Validierung der v3.0 Architektur

**Features**:
- Prerequisites-Check
- Projektstruktur-Validierung
- Vollständige Dependency-Installation
- Build-Prozess
- Test-Ausführung
- Installation-Validierung

**Verwendung**:
```powershell
# Windows
.\scripts\install-v3.ps1 -Environment development

# Linux/macOS
./scripts/install-v3.sh development
```

**Parameter**:
- `Environment`: development | staging | production
- `-SkipTests`: Überspringt Test-Ausführung
- `-SkipDocker`: Überspringt Docker-Setup
- `-Force`: Fortsetzen trotz Fehlern

## 🔍 Validation Scripts

### `validate-v3.ps1` / `validate-v3.sh`

**Zweck**: Architektur-Validierung und Qualitätsprüfung

**Features**:
- Projektstruktur-Validierung
- Package.json-Validierung
- TypeScript-Konfiguration
- Docker-Konfiguration
- Prisma-Schema-Validierung
- API-Struktur-Validierung
- Shared-Contracts-Validierung
- Dokumentation-Validierung
- Build-Prozess-Test
- Datenbank-Schema-Validierung

**Verwendung**:
```powershell
# Windows
.\scripts\validate-v3.ps1

# Linux/macOS
./scripts/validate-v3.sh
```

**Parameter**:
- `-Quick`: Überspringt Build-Tests
- `-Verbose`: Detaillierte Ausgabe

## 📊 Script-Features

### Automatische Validierung

Alle Scripts führen automatische Validierungen durch:

- **Prerequisites-Check**: Node.js, npm, Docker
- **Struktur-Validierung**: Verzeichnisse und Dateien
- **Konfiguration-Validierung**: package.json, tsconfig.json
- **Build-Validierung**: Kompilierung und Tests

### Error Handling

- **Graceful Failures**: Scripts stoppen bei kritischen Fehlern
- **Detailed Logging**: Farbige Ausgabe mit Status-Indikatoren
- **Recovery Options**: `-Force` Flag für Fortsetzung trotz Fehlern

### Cross-Platform Support

- **Windows**: PowerShell-Scripts (.ps1)
- **Linux/macOS**: Bash-Scripts (.sh)
- **Docker**: Plattform-unabhängige Container

## 🎯 Verwendungs-Szenarien

### Development Setup

```powershell
# Schneller Start für neue Entwickler
.\scripts\quick-start.ps1
```

### CI/CD Pipeline

```powershell
# Vollständige Installation für CI
.\scripts\install-v3.ps1 -Environment production -SkipDocker
```

### Architektur-Validierung

```powershell
# Validierung vor Deployment
.\scripts\validate-v3.ps1 -Verbose
```

### Troubleshooting

```powershell
# Validierung bei Problemen
.\scripts\validate-v3.ps1 -Quick
```

## 📈 Validierungs-Report

Das Validierungsscript generiert einen detaillierten Report:

```
================================================
  Validation Report
================================================

Total Tests: 45
Passed: 42
Failed: 1
Warnings: 2

Success Rate: 93.33%

✅ All critical tests passed! Architecture is valid.
```

### Test-Kategorien

1. **Project Structure** (8 Tests)
   - Verzeichnis-Existenz
   - Datei-Existenz
   - Struktur-Validierung

2. **Package Configuration** (12 Tests)
   - package.json-Validierung
   - Scripts-Validierung
   - Dependencies-Check

3. **TypeScript Configuration** (9 Tests)
   - tsconfig.json-Validierung
   - Compiler-Options
   - Path-Mapping

4. **Docker Configuration** (8 Tests)
   - Dockerfile-Existenz
   - Compose-Services
   - Container-Konfiguration

5. **Database Schema** (6 Tests)
   - Prisma-Schema
   - Migrationen
   - Seed-Dateien

6. **API Structure** (16 Tests)
   - Controller-Validierung
   - Service-Validierung
   - Repository-Validierung
   - Route-Validierung

7. **Shared Contracts** (8 Tests)
   - Error-Contracts
   - Validation-Schemas
   - Type-Definitionen
   - Utility-Functions

8. **Documentation** (6 Tests)
   - README-Validierung
   - API-Dokumentation
   - ADR-Validierung

9. **Build Process** (3 Tests)
   - Shared-Build
   - Server-Build
   - Client-Build

## 🔧 Troubleshooting

### Häufige Probleme

#### Node.js Version
```bash
# Problem: Node.js Version zu alt
# Lösung: Node.js 18+ installieren
node --version  # Sollte 18+ sein
```

#### Docker nicht verfügbar
```bash
# Problem: Docker nicht installiert
# Lösung: Docker installieren oder -SkipDocker verwenden
.\scripts\quick-start.ps1 -SkipDocker
```

#### Ports belegt
```bash
# Problem: Ports 3000, 3001, 5432 belegt
# Lösung: Andere Services stoppen oder Ports ändern
netstat -ano | findstr :3000
```

#### Dependencies-Fehler
```bash
# Problem: npm install Fehler
# Lösung: Cache leeren und neu installieren
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Debug-Modus

```powershell
# Detaillierte Ausgabe für Debugging
.\scripts\validate-v3.ps1 -Verbose
```

### Force-Modus

```powershell
# Fortsetzen trotz Fehlern
.\scripts\install-v3.ps1 -Force
```

## 📚 Weitere Dokumentation

- [API Documentation](../docs/API.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)
- [Architecture Overview](../docs/ARCHITECTURE.md)
- [Main README](../README.md)

---

**Projektseite v3.0** - Scripts Documentation

🔄 **Script-Updates**: Scripts werden kontinuierlich verbessert basierend auf Feedback und neuen Anforderungen.
