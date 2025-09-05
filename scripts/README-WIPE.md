# Projektseite Wipe & Clean Scripts

Dieses Verzeichnis enthält Scripts für verschiedene Arten der Systembereinigung.

## 🧹 Wipe-Scripts

### 1. `wipe-system.sh` - Kompletter System-Wipe
**Zweck**: Löscht das gesamte Projektseite-System komplett vom Server (außer Scripts-Ordner)

**Was wird gelöscht**:
- ✅ Alle Docker-Container, Images, Volumes und Netzwerke
- ✅ Systemd-Service und Konfiguration
- ✅ Projektverzeichnis-Inhalt (außer Scripts-Ordner)
- ✅ Backup-, Log- und Monitoring-Verzeichnisse
- ✅ Cron-Jobs und Umgebungsvariablen
- ✅ Verbleibende Prozesse

**Was bleibt erhalten**:
- 📁 Scripts-Ordner (`/opt/projektseite/scripts`)
- 📁 Leeres Projektverzeichnis

**Verwendung**:
```bash
sudo ./scripts/wipe-system.sh
```

**Sicherheitsabfrage**: Das Script fragt nach Bestätigung mit "WIPE"

---

### 2. `clean-system.sh` - Sanfte Bereinigung
**Zweck**: Bereinigt das System ohne Datenverlust (für Updates und Wartung)

**Was wird bereinigt**:
- ✅ Docker-Container gestoppt (nicht entfernt)
- ✅ Systemd-Service gestoppt
- ✅ Alte Log-Dateien (älter als 7 Tage)
- ✅ Docker-System bereinigt
- ✅ Temporäre Dateien entfernt
- ✅ Node.js Cache bereinigt
- ✅ Alte Backups (älter als 30 Tage)
- ✅ Verbleibende Prozesse beendet

**Was bleibt erhalten**:
- 📁 Alle Projektdateien
- 📁 Datenbank-Daten
- 📁 Konfigurationen
- 📁 Aktuelle Backups

**Verwendung**:
```bash
sudo ./scripts/clean-system.sh
```

---

### 3. `selective-clean.sh` - Selektive Bereinigung
**Zweck**: Interaktive Bereinigung mit Benutzerauswahl

**Optionen**:
1. Docker-Container stoppen und entfernen
2. Docker-Images entfernen
3. Docker-Volumes entfernen
4. Docker-Netzwerke entfernen
5. Log-Dateien bereinigen
6. Temporäre Dateien bereinigen
7. Node.js Cache bereinigen
8. Alte Backups entfernen
9. Systemd-Service stoppen
10. Alle Docker-Ressourcen entfernen
11. Komplette Bereinigung (außer Daten)
0. Beenden

**Verwendung**:
```bash
sudo ./scripts/selective-clean.sh
```

---

## 🚀 Verwendungsszenarien

### Komplett frische Installation
```bash
# 1. System komplett wipen
sudo ./scripts/wipe-system.sh

# 2. Neue Installation
sudo ./scripts/setup-server.sh

# 3. System starten
./scripts/start-docker.sh
```

### Update ohne Datenverlust
```bash
# 1. Sanfte Bereinigung
sudo ./scripts/clean-system.sh

# 2. Updates anwenden
sudo ./scripts/update-system.sh

# 3. System starten
./scripts/start-docker.sh
```

### Selektive Wartung
```bash
# 1. Interaktive Bereinigung
sudo ./scripts/selective-clean.sh

# 2. Nur gewünschte Optionen auswählen
```

---

## ⚠️ Wichtige Hinweise

### Vor der Verwendung
- **Backup erstellen**: Wichtige Daten vor dem Wipe sichern
- **Root-Rechte**: Scripts benötigen Root-Rechte für Systemoperationen
- **Bestätigung**: `wipe-system.sh` fragt nach Bestätigung mit "WIPE"

### Nach dem Wipe
- **Frische Installation**: `setup-server.sh` ausführen
- **Oder Git-Clone**: Projekt neu von Repository klonen
- **System starten**: `start-docker.sh` ausführen

### Sicherheit
- **Datenverlust**: `wipe-system.sh` löscht ALLE Daten
- **Irreversibel**: Wipe-Operationen können nicht rückgängig gemacht werden
- **Backup**: Immer vorher Backups erstellen

---

## 📁 Verzeichnisstruktur nach Wipe

```
/opt/projektseite/
├── scripts/           # Bleibt erhalten
│   ├── wipe-system.sh
│   ├── clean-system.sh
│   ├── selective-clean.sh
│   └── README-WIPE.md
└── (leer)            # Alles andere wird gelöscht
```

---

## 🔧 Troubleshooting

### Script läuft nicht
```bash
# Berechtigungen setzen
chmod +x scripts/*.sh

# Als Root ausführen
sudo ./scripts/wipe-system.sh
```

### Docker-Probleme
```bash
# Docker-Status prüfen
docker ps -a
docker volume ls
docker network ls

# Manuell bereinigen
docker system prune -a --volumes
```

### Service-Probleme
```bash
# Service-Status prüfen
systemctl status projektseite.service

# Service stoppen
systemctl stop projektseite.service
systemctl disable projektseite.service
```

---

## 📞 Support

Bei Problemen mit den Wipe-Scripts:

1. **Logs prüfen**: `/var/log/projektseite/`
2. **Docker-Status**: `docker ps -a`
3. **Service-Status**: `systemctl status projektseite.service`
4. **Manuelle Bereinigung**: Scripts-Optionen einzeln ausführen

---

**Erstellt**: $(date)  
**Version**: 1.0.0  
**Autor**: Projektseite Team
