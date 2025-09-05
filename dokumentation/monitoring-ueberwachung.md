# Monitoring & Überwachung - Projektseite

## Grafana-Dashboards
- **System Overview**: CPU, Memory, Disk Usage
- **Container Status**: Docker-Container-Überwachung
- **Anwendungsmetriken**: Backend/Frontend-Status

## Prometheus-Metriken
- **System-Metriken**: CPU, Memory, Disk, Network
- **Container-Metriken**: Docker-Container-Performance
- **Anwendungsmetriken**: HTTP-Requests, Response Times

## Logs
- **Anwendungslogs**: `/var/log/projektseite/`
- **System-Logs**: `/var/log/syslog`
- **Docker-Logs**: `docker-compose logs`

## Grafana-Zugang
- **URL**: http://localhost:3002
- **Benutzer**: admin
- **Passwort**: admin123
- **Dashboard**: Projektseite-Übersicht verfügbar

## Prometheus Node Exporter
- **URL**: http://localhost:9100/metrics
- **Status**: Läuft als System-Service
- **Metriken**: System-Performance-Daten verfügbar

## Log-Überwachung
```bash
# Anwendungslogs
tail -f /var/log/projektseite/*.log

# System-Logs
journalctl -u projektseite.service -f

# Docker-Logs
docker-compose logs -f
```

## System-Status prüfen
```bash
# Docker-Container-Status
docker ps -a --filter "name=projektseite"

# Systemd-Service-Status
systemctl status projektseite.service

# Verzeichnisse prüfen
ls -la /opt/projektseite/
ls -la /opt/backups/projektseite/
ls -la /var/log/projektseite/
```

## Performance-Monitoring
- **CPU-Auslastung**: Über Grafana-Dashboard
- **Speicherverbrauch**: RAM und Swap-Überwachung
- **Festplattenspeicher**: Disk-Usage-Tracking
- **Netzwerk-Traffic**: Inbound/Outbound-Monitoring
- **Container-Performance**: Docker-Container-Metriken
