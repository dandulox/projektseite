# Versionsverlauf - Projektseite

## Version 2.2.0 "Bugfixer" - 2024-12-19

### 🐛 Bugfixes und Verbesserungen
- **Tasks/Deadlines Fix**: Status-Mapping zwischen DB und Frontend korrigiert
- **Kanban Board**: Drag&Drop Status-Updates funktionieren korrekt
- **Admin-Diagnose**: Statuscode-Tooltips mit detaillierten Erklärungen hinzugefügt
- **Demo-Daten**: Umfassende Seeds für bessere UX implementiert
- **Testsuite**: API-, UI- und E2E-Tests erweitert
- **Performance**: DB-Indizes für Tasks optimiert
- **Dokumentation**: README mit Quick Start und Demo-Zugangsdaten aktualisiert

## Version 2.1.0 "Script-Enhancement" - 2024-12-19

### 🚀 Script-System & Verwaltung
- **Launcher-System** mit benutzerfreundlicher Oberfläche für alle Scripts
- **FastPatch-Funktionalität** für direkten Zugriff auf Patch-Manager
- **FastUpdate-Funktionalität** für schnelles App-Update mit Git-Pull
- **Zentralisierte Patch-Verwaltung** im `scripts/patches/` Verzeichnis
- **Automatische Berechtigungssetzung** nach Git-Updates in allen Update-Scripts
- **Berechtigungs-Management-Hilfsfunktion** für konsistente Script-Wartung

### 🔧 System-Verbesserungen
- **Patch-Manager** für einfache Installation und Verwaltung von Systemupdates
- **Aktivitätslog-System** mit erweiterten Protokollierungsfunktionen
- **Hilfsfunktionen** für Script-Berechtigungen und Wartung
- **Erweiterte Dokumentation** für alle neuen Script-Funktionen
- **Robuste Fehlerbehandlung** mit Fallback-Mechanismen

### 📊 Script-Architektur
- **Modulare Script-Struktur** mit separaten Verzeichnissen für verschiedene Funktionen
- **Konsistente Menülogik** in allen Launcher-Scripts
- **Integrierte Hilfe-Systeme** für bessere Benutzerführung
- **Automatisierte Wartung** nach Git-Updates

---

## Version 2.0.0 "Phoenix" - 2024-12-19

### 🚀 Major Features & System-Erweiterungen
- **Vollständige Projektverwaltung** mit CRUD-Operationen, Filterung und Berechtigungen
- **Modulverwaltung** für strukturierte Projektaufteilung mit eigenständigen Modulen
- **Team-Management** mit rollenbasierten Mitgliedschaften (Leader, Member, Viewer)
- **Benachrichtigungssystem** mit Echtzeit-Updates und Team-Benachrichtigungen
- **Fortschrittsverfolgung** mit automatischer Berechnung basierend auf Modulen
- **Tag-System** und Abhängigkeitsmanagement für Module
- **Benutzerprofile** mit erweiterten Einstellungen und Statistiken
- **Design-System** mit Theme-Management (Light/Dark Mode) und CSS-Variablen
- **Mobile-optimierte Ansicht** für alle Komponenten
- **Flexible API-Konfiguration** für verschiedene Deployment-Umgebungen

### 🔧 Technische Verbesserungen
- **Einheitliche Datenbank-Schema** mit integrierten Patches
- **Erweiterte Datenbank-Schemas** für Projekte, Module, Teams und Berechtigungen
- **Responsive Navigation** mit Mobile-Menu und Benutzer-Dropdown
- **Suchfunktionalität** und Filterung in allen Bereichen
- **Umfassende Wartungsskripte** für Updates, Backups und Wiederherstellung

### 📊 System-Status
- **Datenbank-Patches** erfolgreich in einheitliche Schema-Datei integriert
- **Docker-Container** mit Ubuntu 24.04 Server-Unterstützung
- **Grafana-Monitoring** vorbereitet mit Prometheus-Integration

---

## Version 1.0.0 "Genesis" - 2024-12-01

### 🎯 Initial Release
- **Basis-System** mit Authentifizierung und Benutzerverwaltung
- **Einfache Projektverwaltung** ohne erweiterte Features
- **Grundlegendes Admin-Interface** mit React
- **PostgreSQL-Datenbank** mit Basis-Schema
- **Docker-Setup** für einfache Deployment

---

## Versionsnummerierung

### Format: X.Y.Z "Codename"
- **X (Major)**: Große Änderungen, neue Features, Breaking Changes
- **Y (Minor)**: Große Bugfixes, wenn Server ohne Fix nicht startet
- **Z (Patch)**: Kleine Fixes, UI-Anpassungen, Button-Funktionalität

### Codename-Vergabe
- Wird nur bei Major-Versionen (X) vergeben
- Thematisch passend zur Hauptfunktionalität
- Kurz und prägnant

---

## Nächste geplante Versionen

### Version 2.1.0
- Live-Edit-Funktionalität für Design-Einstellungen
- Erweiterte Dashboard-Widgets
- Kalender-Integration für Deadlines

### Version 2.2.0
- Datei-Upload für Projekte und Module
- Erweiterte Reporting-Funktionen
- API-Erweiterungen für externe Integrationen
