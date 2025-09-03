# Frontend Dockerfile
FROM node:18-alpine AS builder

# Setze Arbeitsverzeichnis
WORKDIR /app

# Kopiere package.json und package-lock.json (falls vorhanden)
COPY package*.json ./

# Installiere alle Abhängigkeiten (inkl. devDependencies für Build)
RUN npm install --no-audit --no-fund

# Kopiere Anwendungscode
COPY . .

# Erstelle shared Verzeichnis
RUN mkdir -p /app/shared

# Debug: Zeige Verzeichnisinhalt
RUN ls -la

# Baue Anwendung
RUN npm run build

# Debug: Zeige Build-Ergebnis
RUN ls -la dist/

# Produktions-Image
FROM nginx:alpine

# Kopiere gebaute Dateien
COPY --from=builder /app/dist /usr/share/nginx/html

# Kopiere nginx Konfiguration
COPY nginx.conf /etc/nginx/nginx.conf

# Exponiere Port
EXPOSE 3000

# Starte nginx
CMD ["nginx", "-g", "daemon off;"]
