# Landingpage Setup & Deployment

## 🚀 Quick Start

### 1. Development Server starten
```bash
# In das Frontend-Verzeichnis wechseln
cd frontend

# Dependencies installieren (falls noch nicht geschehen)
npm install

# Development Server starten
npm run dev
```

### 2. Mit Redirect-Flag testen
```bash
# Automatische Dashboard-Weiterleitung für eingeloggte User
REACT_APP_REDIRECT_HOME_TO_DASHBOARD=true npm run dev
```

### 3. Production Build
```bash
# Build erstellen
npm run build

# Build mit Redirect-Flag
REACT_APP_REDIRECT_HOME_TO_DASHBOARD=true npm run build

# Build testen
npm run preview
```

## 🧪 Tests ausführen

### Unit Tests
```bash
# Alle Tests
npm test

# Nur Landingpage-Tests
npm test -- LandingPage.test.jsx

# Mit Coverage
npm test -- --coverage LandingPage.test.jsx
```

### E2E Tests (Playwright)
```bash
# Playwright installieren (falls noch nicht geschehen)
npx playwright install

# E2E Tests ausführen
npx playwright test LandingPage.e2e.test.js

# Mit UI
npx playwright test --ui

# Spezifischen Test ausführen
npx playwright test LandingPage.e2e.test.js -g "should display landing page"
```

### Lighthouse Performance Test
```bash
# Lighthouse Dependencies installieren
npm install --save-dev lighthouse chrome-launcher

# Performance Test ausführen
node frontend/scripts/lighthouse-test.js

# Mit Development Server
npm run dev &
node frontend/scripts/lighthouse-test.js
```

## 🔧 Environment Variables

### Verfügbare Flags
```bash
# Automatische Dashboard-Weiterleitung für eingeloggte User
REACT_APP_REDIRECT_HOME_TO_DASHBOARD=true

# API URL (falls abweichend)
REACT_APP_API_URL=http://localhost:3001/api
```

### .env Datei erstellen
```bash
# .env.local erstellen
cat > frontend/.env.local << EOF
REACT_APP_REDIRECT_HOME_TO_DASHBOARD=true
REACT_APP_API_URL=http://localhost:3001/api
EOF
```

## 🐳 Docker Deployment

### Mit Docker Compose
```bash
# Alle Services starten
docker-compose up -d

# Nur Frontend
docker-compose up frontend

# Mit Environment Variables
REACT_APP_REDIRECT_HOME_TO_DASHBOARD=true docker-compose up
```

### Docker Build
```bash
# Frontend Image bauen
docker build -t projektseite-frontend ./frontend

# Mit Environment Variables
docker build --build-arg REACT_APP_REDIRECT_HOME_TO_DASHBOARD=true -t projektseite-frontend ./frontend

# Container starten
docker run -p 3000:80 projektseite-frontend
```

## 📊 Monitoring & Debugging

### Browser DevTools
1. **Performance**: Lighthouse Tab
2. **Accessibility**: Accessibility Tab
3. **SEO**: Lighthouse SEO Audit
4. **Network**: Network Tab für Ladezeiten

### Console Commands
```javascript
// Lighthouse Score prüfen
lighthouse('http://localhost:3000', {onlyCategories: ['performance']});

// Accessibility prüfen
axe.run(document);

// Performance Metriken
performance.getEntriesByType('navigation');
```

### Logs prüfen
```bash
# Frontend Logs
docker-compose logs frontend

# Alle Logs
docker-compose logs

# Live Logs
docker-compose logs -f frontend
```

## 🔍 Troubleshooting

### Häufige Probleme

#### 1. Tests schlagen fehl
```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install

# Playwright neu installieren
npx playwright install --force
```

#### 2. Lighthouse Test schlägt fehl
```bash
# Chrome Launcher Problem
npm install --save-dev chrome-launcher@latest

# Port bereits belegt
lsof -ti:3000 | xargs kill -9
```

#### 3. Redirect funktioniert nicht
```bash
# Environment Variable prüfen
echo $REACT_APP_REDIRECT_HOME_TO_DASHBOARD

# Browser Cache leeren
# Hard Refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
```

#### 4. Feature-Links funktionieren nicht
```bash
# Backend läuft?
curl http://localhost:3001/api/health

# Routes korrekt?
# Prüfe: /projects, /my-tasks, /dashboard, /projects/1/board
```

### Debug-Modus
```bash
# React DevTools aktivieren
REACT_APP_DEBUG=true npm run dev

# Detaillierte Logs
DEBUG=* npm run dev
```

## 📈 Performance Optimierung

### Build-Optimierung
```bash
# Bundle Analyzer
npm install --save-dev webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer build/static/js/*.js

# Source Maps für Production
GENERATE_SOURCEMAP=true npm run build
```

### Image-Optimierung
```bash
# WebP Konvertierung (falls Bilder hinzugefügt werden)
npm install --save-dev imagemin imagemin-webp

# Lazy Loading testen
# Browser DevTools → Network → Throttling
```

## 🔐 Security

### Content Security Policy
```html
<!-- In index.html hinzufügen -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

### HTTPS in Production
```bash
# SSL-Zertifikat prüfen
openssl s_client -connect your-domain.com:443

# HSTS Header
# Nginx/Apache Konfiguration anpassen
```

## 📱 Mobile Testing

### Responsive Design testen
```bash
# Chrome DevTools
# F12 → Toggle Device Toolbar
# Verschiedene Viewports testen:
# - iPhone SE (375x667)
# - iPad (768x1024)
# - Desktop (1920x1080)
```

### Mobile Performance
```bash
# Lighthouse Mobile Audit
lighthouse 'http://localhost:3000' --only-categories=performance --form-factor=mobile
```

## 🌐 Production Deployment

### Nginx Konfiguration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /var/www/projektseite/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Gzip Kompression
    gzip on;
    gzip_types text/css application/javascript application/json;
    
    # Cache Headers
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Systemd Service
```ini
[Unit]
Description=Projektseite Frontend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/projektseite/frontend
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production
Environment=REACT_APP_REDIRECT_HOME_TO_DASHBOARD=true

[Install]
WantedBy=multi-user.target
```

## 📊 Analytics Setup

### Google Analytics
```javascript
// In index.html hinzufügen
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Custom Events
```javascript
// Landingpage Events tracken
gtag('event', 'feature_click', {
  'feature_name': 'projektverwaltung',
  'user_type': 'authenticated'
});
```

---

**Hinweis**: Alle Befehle sind für Linux/macOS. Für Windows PowerShell entsprechende Anpassungen vornehmen.
