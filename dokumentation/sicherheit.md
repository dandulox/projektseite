# Sicherheit - Projektseite

## Implementierte Sicherheitsmaßnahmen
- **Firewall (UFW)** mit restriktiven Regeln
- **Fail2ban** für Intrusion Prevention
- **Rate Limiting** in der API (100 Requests/15min)
- **Helmet.js** für HTTP-Sicherheitsheader
- **CORS-Konfiguration** mit Whitelist
- **Automatische Updates** für Sicherheitspatches
- **🔐 JWT-basierte Authentifizierung** mit sicheren Tokens
- **🔒 bcrypt-Passwort-Hashing** mit Salt-Rounds (12)
- **👥 Rollenbasierte Zugriffskontrolle** (Admin, User, Viewer)
- **🛡️ Geschützte API-Endpunkte** mit Token-Validierung
- **⏰ Token-Ablaufzeit** (24 Stunden) für erhöhte Sicherheit

## Ports & Firewall
- **SSH**: 22 (nur für lokale Verbindungen)
- **HTTP**: 80
- **HTTPS**: 443
- **Frontend**: 3000
- **Backend**: 3001
- **Grafana**: 3002
- **PostgreSQL**: 5432 (nur lokal)

## Authentifizierung
- **JWT-Tokens** mit 24-Stunden-Ablaufzeit
- **bcrypt-Passwort-Hashing** mit 12 Salt-Rounds
- **Token-Validierung** bei jedem API-Aufruf
- **Automatische Token-Erneuerung** bei Bedarf

## Rollenbasierte Zugriffskontrolle
- **👑 Administrator (admin)**: Vollzugriff auf alle Funktionen
- **👤 Benutzer (user)**: Standard-Zugriff
- **👁️ Betrachter (viewer)**: Nur Lesezugriff

## API-Sicherheit
- **Rate Limiting**: 100 Requests pro 15 Minuten
- **CORS-Whitelist**: Nur erlaubte Domains
- **Helmet.js**: HTTP-Sicherheitsheader
- **Input-Validierung**: Alle Eingaben werden validiert
- **SQL-Injection-Schutz**: Prepared Statements

## Empfohlene zusätzliche Maßnahmen
- **SSL/TLS-Zertifikate** mit Let's Encrypt
- **Regelmäßige Sicherheits-Updates**
- **Backup-Verschlüsselung**
- **Audit-Logging**
- **Zwei-Faktor-Authentifizierung** (2FA)
- **VPN-Zugang** für Remote-Verwaltung

## Standard-Passwörter ändern
Nach der Installation sollten folgende Standard-Passwörter geändert werden:

| Service | Standard-Passwort | Ändern zu |
|---------|------------------|-----------|
| **admin** (Benutzer) | admin | Starkes Passwort |
| **user** (Benutzer) | user123 | Starkes Passwort |
| **Grafana** | admin123 | Starkes Passwort |
| **PostgreSQL** | secure_password_123 | Starkes Passwort |

## Sicherheits-Checkliste
- [ ] Standard-Passwörter geändert
- [ ] Firewall-Regeln konfiguriert
- [ ] SSL/TLS-Zertifikate installiert
- [ ] Regelmäßige Backups eingerichtet
- [ ] Monitoring aktiviert
- [ ] Log-Rotation konfiguriert
- [ ] Automatische Updates aktiviert
- [ ] Fail2ban konfiguriert
