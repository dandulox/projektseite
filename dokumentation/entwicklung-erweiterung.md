# Entwicklung & Erweiterung - Projektseite

## Backend-Entwicklung
```bash
# Entwicklungsumgebung starten
cd backend
npm install
npm run dev
```

## Frontend-Entwicklung
```bash
# Entwicklungsumgebung starten
cd frontend
npm install
npm run dev
```

## Datenbank-Schema erweitern
```sql
-- Neue Tabelle hinzufügen
CREATE TABLE IF NOT EXISTS neue_tabelle (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Skalierbarkeit

### Horizontale Skalierung
- **Docker-Container** können einfach repliziert werden
- **Load Balancer** kann vor Frontend/Backend geschaltet werden
- **Datenbank-Clustering** mit PostgreSQL

### Vertikale Skalierung
- **Container-Ressourcen** können angepasst werden
- **Node.js-Clustering** für Backend-Performance
- **Datenbank-Optimierung** mit Indizes und Query-Optimierung

## Nächste Schritte

1. **Live-Edit-Funktionalität entwickeln** für Design-Einstellungen
2. **Erweiterte Dashboard-Widgets** implementieren
3. **Kalender-Integration** für Deadlines
4. **Datei-Upload** für Projekte und Module
5. **Erweiterte Reporting-Funktionen** entwickeln
6. **Tests schreiben** für alle Komponenten
7. **CI/CD-Pipeline aufsetzen** für automatische Deployments
8. **Produktions-Deployment vorbereiten** mit SSL/TLS

## Support & Troubleshooting

### Häufige Probleme

#### Container startet nicht
```bash
# Logs prüfen
docker-compose logs [service]

# Container-Status
docker-compose ps

# Container neu starten
docker-compose restart [service]
```

#### Datenbank-Verbindung fehlschlägt
```bash
# PostgreSQL-Status prüfen
docker exec projektseite-postgres pg_isready -U admin

# Datenbank-Logs
docker-compose logs postgres
```

#### Speicherplatz wird knapp
```bash
# Docker-System bereinigen
docker system prune -f

# Alte Backups löschen
find /opt/backups/projektseite -name "*.tar.gz" -mtime +30 -delete
```

### Logs & Debugging
```bash
# Anwendungslogs
tail -f /var/log/projektseite/*.log

# System-Logs
journalctl -u projektseite.service -f

# Docker-Logs
docker-compose logs -f
```

### Support-Kontakt
1. **Logs prüfen**: `/var/log/projektseite/`
2. **Container-Status**: `docker-compose ps`
3. **System-Status**: `./scripts/status.sh` (zu implementieren)
4. **Backup/Restore**: Verwende die bereitgestellten Skripte

## Git-Repository
- **URL**: https://github.com/dandulox/projektseite
- **Branch**: main
- **Automatische Updates**: Täglich über Cron-Job

## Beitragen

1. Fork das Repository: https://github.com/dandulox/projektseite
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request
