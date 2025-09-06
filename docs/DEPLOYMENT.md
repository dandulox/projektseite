# 🚀 Deployment Guide - Projektseite v3.0

> **Vollständiger Deployment-Guide für Development, Staging und Production**

## 📋 Inhaltsverzeichnis

- [Development Setup](#development-setup)
- [Staging Deployment](#staging-deployment)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)
- [Security Checklist](#security-checklist)

## 🛠️ Development Setup

### Voraussetzungen

- **Node.js** ≥18.0.0
- **PostgreSQL** ≥13.0
- **Redis** ≥6.0 (optional)
- **Docker** & **Docker Compose** (optional)

### Quick Start

```bash
# 1. Repository klonen
git clone https://github.com/dandulox/projektseite.git
cd projektseite

# 2. Setup ausführen (Windows)
.\scripts\setup.ps1

# 2. Setup ausführen (Linux/macOS)
./scripts/setup.sh

# 3. Development starten
cd server && npm run dev
cd client && npm run dev
```

### Manuelles Setup

```bash
# Shared Module
cd shared
npm install
npm run build

# Backend
cd ../server
npm install
cp env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed  # Nur für Development
npm run dev

# Frontend
cd ../client
npm install
npm run dev
```

### Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health
- **pgAdmin**: http://localhost:5050
- **Redis Commander**: http://localhost:8081
- **Mailhog**: http://localhost:8025

## 🧪 Staging Deployment

### Environment Setup

```bash
# Staging Environment Variables
NODE_ENV=staging
DATABASE_URL="postgresql://user:pass@staging-db:5432/projektseite_staging"
JWT_SECRET="staging-jwt-secret-key"
FRONTEND_URL="https://staging.projektseite.de"
```

### Staging Deployment

```bash
# 1. Build Applications
cd shared && npm run build
cd ../server && npm run build
cd ../client && npm run build

# 2. Database Migration
cd server
npm run db:migrate:prod

# 3. Deploy with Docker
cd ../docker
docker-compose -f docker-compose.staging.yml up -d

# 4. Health Check
curl https://staging.projektseite.de/health
```

### Staging Verification

```bash
# API Tests
npm run test:api

# E2E Tests
npm run test:e2e:staging

# Performance Tests
npm run test:performance
```

## 🏭 Production Deployment

### Production Environment

```bash
# Production Environment Variables
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@prod-db:5432/projektseite_prod"
JWT_SECRET="super-secure-production-jwt-secret"
FRONTEND_URL="https://projektseite.de"
CORS_ORIGIN="https://projektseite.de"
```

### Production Deployment Steps

#### 1. Pre-Deployment Checklist

- [ ] **Code Review** abgeschlossen
- [ ] **Tests** bestanden (≥70% Coverage)
- [ ] **Security Scan** durchgeführt
- [ ] **Performance Tests** bestanden
- [ ] **Database Backup** erstellt
- [ ] **Environment Variables** konfiguriert
- [ ] **SSL Certificates** bereit

#### 2. Database Migration

```bash
# Backup erstellen
pg_dump projektseite_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Migration ausführen
cd server
npm run db:migrate:prod

# Migration verifizieren
npm run db:verify
```

#### 3. Application Deployment

```bash
# Build Production
cd shared && npm run build
cd ../server && npm run build
cd ../client && npm run build

# Deploy with Docker
cd ../docker
docker-compose -f docker-compose.prod.yml up -d

# Health Check
curl https://projektseite.de/health
```

#### 4. Post-Deployment Verification

```bash
# API Health Check
curl https://projektseite.de/api/health

# Database Connection
curl https://projektseite.de/api/admin/db/status

# Frontend Loading
curl https://projektseite.de

# Performance Check
npm run lighthouse:prod
```

## 🐳 Docker Deployment

### Development Docker

```bash
# Start Development Environment
docker-compose -f docker/docker-compose.dev.yml up -d

# View Logs
docker-compose -f docker/docker-compose.dev.yml logs -f

# Stop Environment
docker-compose -f docker/docker-compose.dev.yml down
```

### Production Docker

```bash
# Build Production Images
docker-compose -f docker/docker-compose.yml build

# Start Production Environment
docker-compose -f docker/docker-compose.yml up -d

# Scale Services
docker-compose -f docker/docker-compose.yml up -d --scale backend=3

# Update Services
docker-compose -f docker/docker-compose.yml pull
docker-compose -f docker/docker-compose.yml up -d
```

### Docker Commands

```bash
# Container Status
docker ps

# View Logs
docker logs projektseite-backend
docker logs projektseite-frontend

# Execute Commands
docker exec -it projektseite-backend npm run db:migrate
docker exec -it projektseite-postgres psql -U admin -d projektseite

# Cleanup
docker system prune -a
docker volume prune
```

## 📊 Monitoring & Logging

### Application Monitoring

```bash
# Prometheus Metrics
curl http://localhost:9090/metrics

# Grafana Dashboard
open http://localhost:3001

# Application Logs
tail -f logs/combined.log
tail -f logs/error.log
```

### Database Monitoring

```bash
# Database Status
curl http://localhost:3001/api/admin/db/status

# Table Statistics
curl http://localhost:3001/api/admin/db/tables

# Connection Pool Status
curl http://localhost:3001/api/admin/db/pool
```

### Performance Monitoring

```bash
# System Health
curl http://localhost:3001/api/admin/health

# System Statistics
curl http://localhost:3001/api/admin/stats

# Memory Usage
curl http://localhost:3001/api/admin/memory
```

### Log Management

```bash
# Log Rotation
logrotate /etc/logrotate.d/projektseite

# Log Analysis
grep "ERROR" logs/combined.log | tail -100
grep "WARN" logs/combined.log | tail -50

# Log Cleanup
find logs/ -name "*.log" -mtime +30 -delete
```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed

```bash
# Check Database Status
docker ps | grep postgres
docker logs projektseite-postgres

# Test Connection
psql -h localhost -U admin -d projektseite

# Restart Database
docker-compose restart postgres
```

#### API Not Responding

```bash
# Check Backend Status
docker ps | grep backend
docker logs projektseite-backend

# Test API
curl http://localhost:3001/health
curl http://localhost:3001/api

# Restart Backend
docker-compose restart backend
```

#### Frontend Build Failed

```bash
# Check Node Version
node --version
npm --version

# Clear Cache
npm cache clean --force
rm -rf node_modules package-lock.json

# Reinstall Dependencies
npm install
npm run build
```

#### Memory Issues

```bash
# Check Memory Usage
docker stats
free -h
df -h

# Increase Memory Limits
docker-compose -f docker-compose.yml up -d --scale backend=2
```

### Performance Issues

#### Slow API Responses

```bash
# Check Database Performance
curl http://localhost:3001/api/admin/db/status

# Analyze Slow Queries
docker exec -it projektseite-postgres psql -U admin -d projektseite -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# Check Indexes
curl http://localhost:3001/api/admin/db/tables
```

#### High Memory Usage

```bash
# Check Memory Usage
curl http://localhost:3001/api/admin/health

# Restart Services
docker-compose restart backend frontend

# Scale Services
docker-compose up -d --scale backend=3
```

### Security Issues

#### SSL Certificate Problems

```bash
# Check Certificate
openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout

# Renew Certificate
certbot renew --nginx

# Test SSL
curl -I https://projektseite.de
```

#### Authentication Issues

```bash
# Check JWT Secret
echo $JWT_SECRET

# Test Authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Check User Permissions
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/auth/me
```

## 🔒 Security Checklist

### Pre-Deployment Security

- [ ] **Environment Variables** sicher konfiguriert
- [ ] **JWT Secret** stark und einzigartig
- [ ] **Database Passwords** komplex und sicher
- [ ] **SSL Certificates** gültig und aktuell
- [ ] **CORS** korrekt konfiguriert
- [ ] **Rate Limiting** aktiviert
- [ ] **Security Headers** gesetzt
- [ ] **Input Validation** implementiert

### Runtime Security

- [ ] **Firewall** konfiguriert
- [ ] **DDoS Protection** aktiv
- [ ] **Monitoring** eingerichtet
- [ ] **Log Analysis** konfiguriert
- [ ] **Backup Strategy** implementiert
- [ ] **Incident Response** geplant

### Post-Deployment Security

- [ ] **Penetration Testing** durchgeführt
- [ ] **Vulnerability Scan** abgeschlossen
- [ ] **Security Audit** durchgeführt
- [ ] **Compliance Check** bestanden

## 📈 Performance Optimization

### Database Optimization

```sql
-- Analyze Query Performance
EXPLAIN ANALYZE SELECT * FROM tasks WHERE status = 'TODO';

-- Create Indexes
CREATE INDEX CONCURRENTLY idx_tasks_status ON tasks(status);
CREATE INDEX CONCURRENTLY idx_tasks_assignee_status ON tasks(assigneeId, status);

-- Update Statistics
ANALYZE;
```

### Application Optimization

```bash
# Enable Compression
gzip on;
gzip_types text/plain application/json application/javascript text/css;

# Enable Caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Connection Pooling
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20
```

### Monitoring Optimization

```bash
# Prometheus Configuration
scrape_interval: 15s
evaluation_interval: 15s

# Grafana Dashboards
- System Overview
- Application Metrics
- Database Performance
- Error Rates
```

## 🚨 Emergency Procedures

### Database Recovery

```bash
# Restore from Backup
pg_restore -d projektseite_prod backup_20240101_120000.sql

# Point-in-Time Recovery
pg_basebackup -D /var/lib/postgresql/backup -Ft -z -P
```

### Application Rollback

```bash
# Rollback to Previous Version
git checkout previous-stable-tag
docker-compose -f docker-compose.yml up -d --build

# Database Rollback
npm run db:migrate:rollback
```

### Emergency Contacts

- **Development Team**: dev@projektseite.de
- **DevOps Team**: devops@projektseite.de
- **Security Team**: security@projektseite.de
- **On-Call**: +49-XXX-XXXXXXX

---

**Projektseite v3.0** - Production-Ready Deployment Guide

📚 **Weitere Dokumentation:**
- [API Documentation](API.md)
- [Architecture Overview](ARCHITECTURE.md)
- [Security Guide](SECURITY.md)
- [Monitoring Guide](MONITORING.md)
